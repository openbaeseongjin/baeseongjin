import { randomInt } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { AuthorityServerSession } from "../game/runtime/AuthorityServerSession.js";
import { AuthorityWireAdapter } from "../game/runtime/AuthorityWireAdapter.js";
import { createCurrentGameSimulation } from "../game/simulation/GameSimulationFactory.js";
import {
    createWorldSnapshotEnvelope,
    deserializeWorldSnapshotEnvelope,
    serializeWorldSnapshotEnvelope
} from "../game/network/WorldSnapshotEnvelope.js";
import { routeClientMessage } from "./ClientMessageRouter.js";
import { MULTIPLAYER_ERROR_CODE, MULTIPLAYER_MESSAGE_TYPE } from "../game/network/MultiplayerMessageDefinition.js";
import {
    createPartyChatMessage,
    deserializePartyChatSubmission,
    serializePartyChatMessage
} from "../game/network/PartyChatMessage.js";

const CHANNEL_PATTERN = /^\d{4}$/;
const DEFAULT_MAX_UNACKNOWLEDGED_SNAPSHOTS = 4;
const DEFAULT_MAX_PENDING_SNAPSHOT_BYTES = 256 * 1024;

function createSnapshotEntry(payload) {
    const snapshot = deserializeWorldSnapshotEnvelope(payload);
    return Object.freeze({
        snapshot,
        payload,
        message: JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.SNAPSHOT, payload })
    });
}

function coalesceSnapshotEntries(previous, next) {
    if (!previous) return next;
    const events = new Map(
        [...previous.snapshot.events, ...next.snapshot.events].map((event) => [event.eventId, event])
    );
    const snapshot = createWorldSnapshotEnvelope({
        snapshotSequence: next.snapshot.snapshotSequence,
        serverTick: next.snapshot.serverTick,
        worldSeed: next.snapshot.worldSeed,
        worldRevision: next.snapshot.worldRevision,
        acknowledgements: next.snapshot.acknowledgements,
        state: next.snapshot.state,
        events: [...events.values()]
    });
    return createSnapshotEntry(serializeWorldSnapshotEnvelope(snapshot));
}

export class MultiplayerGameServer {
    constructor(
        httpServer,
        {
            path = "/multiplayer",
            maxPlayers = 2,
            allowedOrigins = [],
            channelNumber = () => randomInt(1000, 10000),
            worldSeed = () => randomInt(1, 0x100000000),
            createSimulation = createCurrentGameSimulation,
            maxUnacknowledgedSnapshots = DEFAULT_MAX_UNACKNOWLEDGED_SNAPSHOTS,
            maxPendingSnapshotBytes = DEFAULT_MAX_PENDING_SNAPSHOT_BYTES
        } = {}
    ) {
        if (!httpServer) throw new Error("httpServer is required");
        if (!Number.isSafeInteger(maxUnacknowledgedSnapshots) || maxUnacknowledgedSnapshots < 1) {
            throw new Error("maxUnacknowledgedSnapshots must be a positive safe integer");
        }
        if (!Number.isSafeInteger(maxPendingSnapshotBytes) || maxPendingSnapshotBytes < 1) {
            throw new Error("maxPendingSnapshotBytes must be a positive safe integer");
        }
        if (typeof createSimulation !== "function") throw new Error("createSimulation must be a function");
        this.httpServer = httpServer;
        this.path = path;
        this.maxPlayers = maxPlayers;
        this.allowedOrigins = new Set(allowedOrigins);
        this.channelNumber = channelNumber;
        this.worldSeed = worldSeed;
        this.createSimulation = createSimulation;
        this.maxUnacknowledgedSnapshots = maxUnacknowledgedSnapshots;
        this.maxPendingSnapshotBytes = maxPendingSnapshotBytes;
        this.webSocketServer = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
        this.rooms = new Map();
        this.connections = new Map();
        this.snapshotDeliveryBySocket = new Map();
        this.stopped = false;
        this.handleUpgrade = (request, socket, head) => {
            const requestUrl = new URL(request.url ?? "/", "http://localhost");
            if (requestUrl.pathname !== this.path) return this.rejectUpgrade(socket, 404, "not found");
            const requestedChannel = requestUrl.searchParams.get("channel");
            if (requestedChannel !== "new" && !CHANNEL_PATTERN.test(requestedChannel ?? "")) {
                return this.rejectUpgrade(socket, 400, "invalid channel");
            }
            if (this.allowedOrigins.size > 0 && !this.allowedOrigins.has(request.headers.origin)) {
                return this.rejectUpgrade(socket, 403, "origin denied");
            }
            try {
                request.createChannel = requestedChannel === "new";
                request.channelId = request.createChannel ? this.allocateChannelId() : requestedChannel;
                request.snapshotFlowControl = requestUrl.searchParams.get("snapshotAck") === "1";
            } catch {
                return this.rejectUpgrade(socket, 503, "channel unavailable");
            }
            this.webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
                this.webSocketServer.emit("connection", webSocket, request);
            });
        };
        this.httpServer.on("upgrade", this.handleUpgrade);
        this.webSocketServer.on("connection", (socket, request) =>
            this.accept(socket, request.channelId, request.createChannel, request.snapshotFlowControl)
        );
    }

    rejectUpgrade(socket, status, message) {
        socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
        socket.destroy();
    }

    allocateChannelId() {
        for (let attempt = 0; attempt < 100; attempt += 1) {
            const channelId = String(this.channelNumber()).padStart(4, "0");
            if (CHANNEL_PATTERN.test(channelId) && !this.rooms.has(channelId)) return channelId;
        }
        throw new Error("unable to allocate a channel");
    }

    createRoom(channelId) {
        const simulation = this.createSimulation({
            worldSeed: this.worldSeed(),
            victimImpactAuthority: "claim"
        });
        const session = new AuthorityServerSession({ simulation });
        const room = {
            channelId,
            simulation,
            session,
            adapter: new AuthorityWireAdapter(session),
            sockets: new Map(),
            interval: null,
            runner: null
        };
        room.runner = new FixedStepRunner({
            step: () => {
                const snapshot = room.adapter.advance();
                if (snapshot) this.broadcast(room, { type: MULTIPLAYER_MESSAGE_TYPE.SNAPSHOT, payload: snapshot });
            },
            render: () => {}
        });
        this.rooms.set(channelId, room);
        return room;
    }

    accept(socket, channelId, createChannel, snapshotFlowControl = false) {
        let room = this.rooms.get(channelId);
        if (!room && !createChannel) {
            socket.send(
                JSON.stringify({
                    type: MULTIPLAYER_MESSAGE_TYPE.ERROR,
                    code: MULTIPLAYER_ERROR_CODE.CHANNEL_NOT_FOUND,
                    channelId
                })
            );
            socket.close(1008, "channel not found");
            return;
        }
        room ??= this.createRoom(channelId);
        if (room.sockets.size >= this.maxPlayers) {
            socket.send(
                JSON.stringify({
                    type: MULTIPLAYER_MESSAGE_TYPE.ERROR,
                    code: MULTIPLAYER_ERROR_CODE.CHANNEL_FULL,
                    channelId
                })
            );
            socket.close(1013, "channel full");
            return;
        }
        const currentSectorId = room.simulation.respawnAnchorForPlayer(room.simulation.getPrimaryPlayerId())?.sectorId;
        const currentSector = room.simulation.world.sectors?.find(({ id }) => id === currentSectorId);
        const joinRespawnAnchor = room.simulation.world.respawnAnchors?.find(
            ({ id }) => id === currentSector?.respawnAnchorId
        );
        const joinPosition = joinRespawnAnchor?.position ??
            room.simulation.activeCheckpoint ??
            room.simulation.world.areas?.[0]?.entry ?? {
                x: 160,
                y: 500
            };
        const playerId =
            room.sockets.size === 0
                ? room.simulation.getPrimaryPlayerId()
                : room.simulation.addPlayer(
                      {
                          x: joinPosition.x,
                          y: joinPosition.y
                      },
                      null,
                      joinRespawnAnchor?.id ?? null
                  ).entity.id;
        room.sockets.set(socket, playerId);
        this.connections.set(socket, room);
        const delivery = {
            flowControlled: snapshotFlowControl === true,
            unacknowledgedSequences: [],
            pendingSnapshot: null,
            highestSentSequence: -1
        };
        this.snapshotDeliveryBySocket.set(socket, delivery);
        socket.on("message", (data, binary) => this.receive(socket, data, binary));
        socket.on("close", () => this.leave(socket));
        socket.on("error", () => this.leave(socket));
        const welcomeSnapshot = room.adapter.snapshot({ includeActivePredictableObjects: true });
        const welcomeSequence = deserializeWorldSnapshotEnvelope(welcomeSnapshot).snapshotSequence;
        socket.send(
            JSON.stringify({
                type: MULTIPLAYER_MESSAGE_TYPE.WELCOME,
                channelId,
                playerId,
                snapshotFlowControl: delivery.flowControlled,
                snapshot: welcomeSnapshot
            })
        );
        this.recordSentSnapshot(delivery, welcomeSequence);
        this.broadcast(
            room,
            { type: MULTIPLAYER_MESSAGE_TYPE.SNAPSHOT, payload: welcomeSnapshot },
            { exclude: socket }
        );
        this.startClock(room);
    }

    receive(socket, data, binary) {
        try {
            const room = this.connections.get(socket);
            if (!room || binary) throw new Error("unsupported client message");
            const message = JSON.parse(data.toString());
            const playerId = room.sockets.get(socket);
            routeClientMessage({ server: this, socket, room, playerId, message });
        } catch (error) {
            socket.send(
                JSON.stringify({
                    type: MULTIPLAYER_MESSAGE_TYPE.ERROR,
                    code: MULTIPLAYER_ERROR_CODE.INVALID_MESSAGE,
                    message: error.message
                })
            );
            socket.close(1008, "invalid message");
        }
    }

    startClock(room) {
        if (room.interval !== null) return;
        room.runner.reset(performance.now());
        room.interval = setInterval(() => room.runner.frame(performance.now()), 4);
    }

    stopClock(room) {
        if (room.interval !== null) clearInterval(room.interval);
        room.interval = null;
    }

    recordSentSnapshot(delivery, snapshotSequence) {
        delivery.highestSentSequence = Math.max(delivery.highestSentSequence, snapshotSequence);
        if (delivery.flowControlled) delivery.unacknowledgedSequences.push(snapshotSequence);
    }

    sendSnapshot(socket, delivery, entry) {
        if (socket.readyState !== WebSocket.OPEN) return false;
        socket.send(entry.message);
        this.recordSentSnapshot(delivery, entry.snapshot.snapshotSequence);
        return true;
    }

    queueSnapshot(socket, entry) {
        if (socket.readyState !== WebSocket.OPEN) return false;
        const delivery = this.snapshotDeliveryBySocket.get(socket);
        if (!delivery?.flowControlled) {
            socket.send(entry.message);
            if (delivery) delivery.highestSentSequence = entry.snapshot.snapshotSequence;
            return true;
        }
        if (delivery.unacknowledgedSequences.length < this.maxUnacknowledgedSnapshots) {
            return this.sendSnapshot(socket, delivery, entry);
        }
        delivery.pendingSnapshot = coalesceSnapshotEntries(delivery.pendingSnapshot, entry);
        if (Buffer.byteLength(delivery.pendingSnapshot.payload) > this.maxPendingSnapshotBytes) {
            delivery.pendingSnapshot = null;
            socket.close(1013, "snapshot backlog exceeded");
            return false;
        }
        return true;
    }

    acknowledgeSnapshot(socket, snapshotSequence) {
        if (!Number.isSafeInteger(snapshotSequence) || snapshotSequence < 0) {
            throw new Error("snapshotSequence must be a non-negative safe integer");
        }
        const delivery = this.snapshotDeliveryBySocket.get(socket);
        if (!delivery?.flowControlled) throw new Error("snapshot acknowledgements were not negotiated");
        if (snapshotSequence > delivery.highestSentSequence) {
            throw new Error("snapshot acknowledgement exceeds the latest sent sequence");
        }
        delivery.unacknowledgedSequences = delivery.unacknowledgedSequences.filter(
            (sequence) => sequence > snapshotSequence
        );
        if (delivery.pendingSnapshot && delivery.unacknowledgedSequences.length < this.maxUnacknowledgedSnapshots) {
            const pending = delivery.pendingSnapshot;
            delivery.pendingSnapshot = null;
            this.sendSnapshot(socket, delivery, pending);
        }
        return true;
    }

    relayPartyChat(room, playerId, serializedSubmission) {
        const submission = deserializePartyChatSubmission(serializedSubmission);
        const partyChatMessage = createPartyChatMessage({ speakerId: playerId, ...submission });
        this.broadcast(room, {
            type: MULTIPLAYER_MESSAGE_TYPE.PARTY_CHAT_MESSAGE,
            payload: serializePartyChatMessage(partyChatMessage)
        });
        return partyChatMessage;
    }

    broadcast(room, message, { exclude = null } = {}) {
        if (message.type === MULTIPLAYER_MESSAGE_TYPE.SNAPSHOT && typeof message.payload === "string") {
            const entry = createSnapshotEntry(message.payload);
            for (const socket of room.sockets.keys()) {
                if (socket !== exclude) this.queueSnapshot(socket, entry);
            }
            return;
        }
        const serialized = JSON.stringify(message);
        for (const socket of room.sockets.keys()) {
            if (socket !== exclude && socket.readyState === WebSocket.OPEN) socket.send(serialized);
        }
    }

    leave(socket) {
        if (this.stopped) return;
        const room = this.connections.get(socket);
        const playerId = room?.sockets.get(socket);
        if (!room || !playerId) return;
        this.connections.delete(socket);
        this.snapshotDeliveryBySocket.delete(socket);
        room.sockets.delete(socket);
        room.session.removePlayer(playerId);
        if (room.sockets.size > 0) {
            this.broadcast(room, { type: MULTIPLAYER_MESSAGE_TYPE.PLAYER_LEFT, playerId });
            this.broadcast(room, { type: MULTIPLAYER_MESSAGE_TYPE.SNAPSHOT, payload: room.adapter.snapshot() });
            return;
        }
        this.stopClock(room);
        this.rooms.delete(room.channelId);
    }

    async close() {
        this.stopped = true;
        this.httpServer.off("upgrade", this.handleUpgrade);
        for (const room of this.rooms.values()) {
            this.stopClock(room);
            for (const socket of room.sockets.keys()) socket.close(1001, "server shutdown");
        }
        this.rooms.clear();
        this.connections.clear();
        this.snapshotDeliveryBySocket.clear();
        await new Promise((resolve) => this.webSocketServer.close(resolve));
    }
}
