import { createServer } from "node:http";
import { WebSocket } from "ws";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { deserializeWorldSnapshotEnvelope } from "../src/game/network/WorldSnapshotEnvelope.js";
import { WORLD_SNAPSHOT_REPLICATION_KIND } from "../src/game/network/WorldSnapshotReplication.js";
import { RemoteGameAuthority } from "../src/game/runtime/RemoteGameAuthority.js";
import { channelSocketUrl } from "../src/game/runtime/MultiplayerServerEndpoint.js";
import { RemoteWorldStateBuffer } from "../src/game/runtime/RemoteWorldStateBuffer.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";

const TEST_ORIGIN = "https://openbaeseongjin.github.io";
const TIMEOUT_MS = 8_000;
const SNAPSHOTS_PER_SECOND = 20;
const DEFAULT_STATIONARY_APPLICATION_WIRE_BUDGET_BYTES_PER_SECOND = 24_000;
const MAX_STATIONARY_APPLICATION_WIRE_BYTES_PER_SECOND = 64 * 1024;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function waitFor(predicate, message, timeoutMs = TIMEOUT_MS) {
    const deadline = performance.now() + timeoutMs;
    return new Promise((resolve, reject) => {
        const poll = () => {
            try {
                const result = predicate();
                if (result) return resolve(result);
            } catch (error) {
                return reject(error);
            }
            if (performance.now() >= deadline) return reject(new Error(message));
            setTimeout(poll, 10);
        };
        poll();
    });
}

class InspectableWebSocket extends WebSocket {
    constructor(url) {
        super(url, { origin: TEST_ORIGIN });
        this.receivedMessages = [];
        this.receivedFrames = [];
        this.holdSnapshotAcks = false;
        this.heldSnapshotAcks = [];
        this.addEventListener("message", ({ data }) => {
            const raw = String(data);
            const message = JSON.parse(raw);
            this.receivedFrames.push(Object.freeze({ raw, message }));
            this.receivedMessages.push(message);
        });
    }

    send(data, options, callback) {
        const message = typeof data === "string" ? JSON.parse(data) : null;
        if (this.holdSnapshotAcks && message?.type === "snapshot-ack") {
            this.heldSnapshotAcks.push(data);
            return;
        }
        return super.send(data, options, callback);
    }

    releaseLatestSnapshotAck() {
        this.holdSnapshotAcks = false;
        const latest = this.heldSnapshotAcks.at(-1);
        this.heldSnapshotAcks.length = 0;
        if (latest) super.send(latest);
    }
}

function snapshotEnvelopes(socket) {
    return socket.receivedMessages.flatMap((message) => {
        if (message.type === "welcome") return [deserializeWorldSnapshotEnvelope(message.snapshot)];
        if (message.type === "snapshot") return [deserializeWorldSnapshotEnvelope(message.payload)];
        return [];
    });
}

function snapshotMessages(messages) {
    return messages.filter(({ type }) => type === "snapshot");
}

function snapshotFrames(frames) {
    return frames.filter(({ message }) => message.type === "snapshot");
}

function payloadBytes(value) {
    return Buffer.byteLength(JSON.stringify(value));
}

function fieldBytes(state) {
    return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, payloadBytes(value)]));
}

function verifyRemotePlayerAuthorityTimeline() {
    const buffer = new RemoteWorldStateBuffer({
        interpolationSeconds: 0.1,
        maxExtrapolationSeconds: 0.12,
        maxSnapshots: 4,
        playerInterpolationSeconds: 0.1,
        maxPlayerInterpolationSeconds: 0.3,
        playerPresentationSmoothingSeconds: 0
    });
    let snapshotSequence = 0;
    const snapshot = ({ serverTick, ownerMotionTick, remoteX, remoteAngle }) => ({
        snapshotSequence: snapshotSequence++,
        serverTick,
        state: {
            players: [
                {
                    id: "local",
                    ownerMotionTick,
                    position: { x: 0, y: 0 },
                    velocity: { x: 0, y: 0 },
                    angle: 0,
                    angularVelocity: 0
                },
                {
                    id: "remote",
                    ownerMotionTick,
                    position: { x: remoteX, y: 0 },
                    velocity: { x: 0, y: 0 },
                    angle: remoteAngle,
                    angularVelocity: 0
                }
            ],
            enemies: [{ id: "enemy", position: { x: serverTick - 100, y: 0 }, velocity: { x: 0, y: 0 } }]
        },
        events: []
    });
    buffer.push(snapshot({ serverTick: 100, ownerMotionTick: 94, remoteX: 0, remoteAngle: 0 }), 0);
    buffer.sample({ now: 0, localPlayerId: "local" });
    buffer.push(snapshot({ serverTick: 106, ownerMotionTick: 94, remoteX: 0, remoteAngle: 0 }), 50);
    buffer.sample({ now: 50, localPlayerId: "local" });
    buffer.push(snapshot({ serverTick: 112, ownerMotionTick: 106, remoteX: 12, remoteAngle: 1.2 }), 100);
    buffer.sample({ now: 100, localPlayerId: "local" });
    buffer.push(snapshot({ serverTick: 118, ownerMotionTick: 112, remoteX: 18, remoteAngle: 1.8 }), 150);
    const sampled = buffer.sample({ now: 150, localPlayerId: "local" });
    const remote = sampled.players.find(({ id }) => id === "remote");
    assert(
        Math.abs(remote.position.x - 6) < 0.5,
        `원격 Player 위치가 authority tick 사이를 보간하지 않았습니다: ${remote.position.x}`
    );
    assert(
        Math.abs(remote.angle - 0.6) < 0.05,
        `원격 Player 회전이 authority tick 사이를 보간하지 않았습니다: ${remote.angle}`
    );
    const smoothedBuffer = new RemoteWorldStateBuffer({
        interpolationSeconds: 0.1,
        maxExtrapolationSeconds: 0.12,
        maxSnapshots: 4
    });
    snapshotSequence = 0;
    smoothedBuffer.push(snapshot({ serverTick: 100, ownerMotionTick: 94, remoteX: 0, remoteAngle: 0 }), 0);
    smoothedBuffer.sample({ now: 0, localPlayerId: "local" });
    smoothedBuffer.push(snapshot({ serverTick: 106, ownerMotionTick: 94, remoteX: 0, remoteAngle: 0 }), 50);
    smoothedBuffer.sample({ now: 50, localPlayerId: "local" });
    smoothedBuffer.push(snapshot({ serverTick: 112, ownerMotionTick: 106, remoteX: 12, remoteAngle: 1.2 }), 100);
    smoothedBuffer.sample({ now: 100, localPlayerId: "local" });
    smoothedBuffer.push(snapshot({ serverTick: 118, ownerMotionTick: 112, remoteX: 18, remoteAngle: 1.8 }), 150);
    const smoothed = smoothedBuffer
        .sample({ now: 150, localPlayerId: "local" })
        .players.find(({ id }) => id === "remote");
    assert(
        smoothed.position.x > 0 && smoothed.position.x < 12,
        `2차 smoothing이 새 authority 위치를 한 frame에 snap했습니다: ${smoothed.position.x}`
    );
    return Object.freeze({
        positionX: remote.position.x,
        angle: remote.angle,
        smoothedPositionX: smoothed.position.x
    });
}

function movementCommand(horizontal, aimWorld) {
    return createPlayerCommand(
        {
            horizontal,
            vertical: 0,
            interact: false,
            interactSequence: 0,
            spellCommand: { commandSequence: 0, commandKey: null },
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        aimWorld
    );
}

async function closeAuthority(authority) {
    if (!authority?.socket || authority.socket.readyState === WebSocket.CLOSED) return;
    const closed = new Promise((resolve) => authority.socket.addEventListener("close", resolve, { once: true }));
    authority.close();
    await closed;
}

async function startRuntime() {
    const httpServer = createServer((_request, response) => {
        response.writeHead(404).end();
    });
    const multiplayer = new MultiplayerGameServer(httpServer, {
        allowedOrigins: [TEST_ORIGIN],
        channelNumber: () => 9101,
        worldSeed: () => 2,
        maxUnacknowledgedSnapshots: 1,
        createSimulation: (options) => createCurrentGameSimulation(options)
    });
    await new Promise((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(0, "127.0.0.1", resolve);
    });
    const address = httpServer.address();
    return {
        multiplayer,
        serverUrl: `http://127.0.0.1:${address.port}`,
        async close() {
            await multiplayer.close();
            await new Promise((resolve) => httpServer.close(resolve));
        }
    };
}

async function run() {
    const remoteInterpolation = verifyRemotePlayerAuthorityTimeline();
    const runtime = await startRuntime();
    const first = new RemoteGameAuthority({
        url: channelSocketUrl(runtime.serverUrl, "new"),
        WebSocketImpl: InspectableWebSocket
    });
    let second = null;
    let reconnected = null;
    try {
        await first.connect();
        const room = runtime.multiplayer.rooms.get(first.channelId);
        const simulation = room.simulation;
        const firstServerSocket = [...room.sockets].find(([, playerId]) => playerId === first.playerId)[0];
        const baseline = snapshotEnvelopes(first.socket)[0];
        const baselineState = baseline.replication.state;
        assert(
            baseline.replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.BASELINE,
            "welcome은 baseline이어야 합니다"
        );
        assert(
            baselineState.enemies.length === 198,
            `seed 2 baseline Enemy 수가 198이 아닙니다: ${baselineState.enemies.length}`
        );
        assert(!Object.hasOwn(baselineState, "bossRuntime"), "새 wire baseline에 bossRuntime alias가 남았습니다");

        const stationaryFrameStart = first.socket.receivedFrames.length;
        await waitFor(
            () =>
                snapshotFrames(first.socket.receivedFrames.slice(stationaryFrameStart)).length >= SNAPSHOTS_PER_SECOND,
            "정지 상태 1초(20개) delta snapshot을 받지 못했습니다"
        );
        const stationaryFrames = snapshotFrames(first.socket.receivedFrames.slice(stationaryFrameStart)).slice(
            0,
            SNAPSHOTS_PER_SECOND
        );
        const stationaryMessages = stationaryFrames.map(({ message }) => message);
        const stationaryMessageBytes = stationaryFrames.map(({ raw }) => Buffer.byteLength(raw));
        const stationaryApplicationWireBytesPerSecond = stationaryMessageBytes.reduce((sum, bytes) => sum + bytes, 0);
        const defaultBudgetExceeded =
            stationaryApplicationWireBytesPerSecond > DEFAULT_STATIONARY_APPLICATION_WIRE_BUDGET_BYTES_PER_SECOND;
        const stationaryDeltas = stationaryMessages
            .map(({ payload }) => deserializeWorldSnapshotEnvelope(payload))
            .filter(({ replication }) => replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.DELTA);
        const stationary = stationaryDeltas.at(-1);
        const stationaryFieldBytes = {
            state: payloadBytes(stationary.replication.state),
            players: payloadBytes(stationary.replication.players),
            enemies: payloadBytes(stationary.replication.enemies),
            events: payloadBytes(stationary.events)
        };
        assert(stationaryDeltas.length === SNAPSHOTS_PER_SECOND, "정지 1초 표본에 baseline이 섞였습니다");
        assert(
            stationaryApplicationWireBytesPerSecond <= MAX_STATIONARY_APPLICATION_WIRE_BYTES_PER_SECOND,
            `정지 snapshot application wire가 기준을 초과했습니다: ${JSON.stringify({ actualBytesPerSecond: stationaryApplicationWireBytesPerSecond, thresholdBytesPerSecond: MAX_STATIONARY_APPLICATION_WIRE_BYTES_PER_SECOND, frames: stationaryMessageBytes, latestFieldBytes: stationaryFieldBytes })}`
        );
        if (defaultBudgetExceeded) {
            console.warn(
                `WARN snapshot default budget exceeded: ${stationaryApplicationWireBytesPerSecond}B/s > ${DEFAULT_STATIONARY_APPLICATION_WIRE_BUDGET_BYTES_PER_SECOND}B/s`
            );
        }
        assert(
            stationary.replication.enemies.upserts.length < baselineState.enemies.length,
            "정지 delta가 Enemy 전체를 반복했습니다"
        );
        assert(
            stationary.replication.state.changes.every(({ path }) => path[0] !== "bossStage"),
            "정지 delta가 비활성 Boss DTO를 반복했습니다"
        );
        assert(!JSON.stringify(stationary).includes("bossRuntime"), "delta wire에 bossRuntime alias가 남았습니다");

        const inactiveBoss = simulation.bossStageSnapshot();
        const legacyState = { ...baselineState, bossStage: inactiveBoss, bossRuntime: inactiveBoss };
        const legacyProjected = {
            protocolVersion: 22,
            snapshotSequence: baseline.snapshotSequence,
            serverTick: baseline.serverTick,
            worldSeed: baseline.worldSeed,
            worldRevision: baseline.worldRevision,
            acknowledgements: baseline.acknowledgements,
            state: legacyState,
            events: baseline.events
        };
        const legacyRead = deserializeWorldSnapshotEnvelope(JSON.stringify(legacyProjected));
        assert(
            legacyRead.replication.state.bossStage?.stageId === inactiveBoss.stageId &&
                !Object.hasOwn(legacyRead.replication.state, "bossRuntime"),
            "v22 bossRuntime legacy 입력이 canonical bossStage로 정규화되지 않았습니다"
        );
        const beforeBytes = payloadBytes(legacyProjected);
        const afterBytes = payloadBytes(stationary);

        const start = first.ownerState().position;
        const move = movementCommand(1, { x: start.x + 400, y: start.y });
        for (let tick = 0; tick < 48; tick += 1) {
            first.advance(move);
            if (tick % 2 === 0) first.submit(move);
        }
        await waitFor(
            () => simulation.playerState(first.playerId).position.x > start.x,
            "실제 owner command 이동이 서버에 반영되지 않았습니다"
        );

        second = new RemoteGameAuthority({
            url: channelSocketUrl(runtime.serverUrl, first.channelId),
            WebSocketImpl: InspectableWebSocket
        });
        await second.connect();
        assert(
            snapshotEnvelopes(second.socket)[0].replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.BASELINE,
            "late join이 전체 baseline을 받지 못했습니다"
        );
        await waitFor(
            () =>
                second.latestSnapshot?.state.players.length === 2 && second.latestSnapshot.state.enemies.length === 198,
            "late join 상태가 현재 Player/Enemy roster로 수렴하지 않았습니다"
        );

        const firstDelivery = runtime.multiplayer.snapshotDeliveryBySocket.get(firstServerSocket);
        const target = simulation.enemies.find((enemy) => enemy.health > 0);
        const targetObjectId = target.objectId;
        const targetEnemyId = target.id;
        const serverPlayer = simulation.players.find(({ id }) => id === first.playerId);
        const interestPosition = target.position.clone();
        serverPlayer.position.set(interestPosition.x, interestPosition.y);
        await waitFor(
            () => firstDelivery.acknowledgedRelevantEnemyIds.has(targetObjectId),
            "Enemy 관심 영역 진입 ACK가 반영되지 않았습니다"
        );
        const enemyActionMessageStart = first.socket.receivedMessages.length;
        await waitFor(
            () =>
                snapshotEnvelopes({
                    receivedMessages: first.socket.receivedMessages.slice(enemyActionMessageStart)
                }).some(
                    ({ replication }) =>
                        replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.DELTA &&
                        replication.enemies.upserts.some(
                            (upsert) => upsert.identity === targetObjectId && upsert.fields?.changes.length > 0
                        )
                ),
            "관심 영역 Enemy 행동 변화가 field delta로 전송되지 않았습니다"
        );
        serverPlayer.position.set(interestPosition.x + 20_000, interestPosition.y + 20_000);
        await waitFor(() => {
            const delivery = runtime.multiplayer.snapshotDeliveryBySocket.get(firstServerSocket);
            return delivery?.acknowledgedRelevantEnemyIds.has(targetObjectId) === false;
        }, "관심 영역 이탈 ACK가 반영되지 않았습니다");
        target.health -= 1;
        const reentryMessageStart = first.socket.receivedMessages.length;
        serverPlayer.position.set(interestPosition.x, interestPosition.y);
        await waitFor(
            () =>
                snapshotEnvelopes({ receivedMessages: first.socket.receivedMessages.slice(reentryMessageStart) }).some(
                    ({ replication }) =>
                        replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.DELTA &&
                        replication.enemies.upserts.some(
                            (upsert) => upsert.identity === targetObjectId && upsert.state?.health === target.health
                        )
                ),
            "관심 영역 재진입 시 최신 Enemy 전체 동적 상태를 한 번 제공하지 않았습니다"
        );

        first.socket.holdSnapshotAcks = true;
        await waitFor(() => first.socket.heldSnapshotAcks.length > 0, "backlog용 snapshot ACK를 보류하지 못했습니다");
        const hitPredictionId = `${first.playerId}:rope-impact:${first.ownerState().tick}:snapshot-delta`;
        assert(
            first.submitRopeImpact({
                predictionId: hitPredictionId,
                clientTick: first.ownerState().tick,
                position: { x: target.position.x, y: target.position.y },
                velocity: { x: 1_000, y: 0 },
                parameters: { targetId: targetEnemyId, targetKind: "enemy" },
                resolution: "enemy-defeated"
            }),
            "실제 WebSocket rope-impact hit claim을 전송하지 못했습니다"
        );
        const hitReceipts = [];
        const hitReceipt = await waitFor(() => {
            hitReceipts.push(...first.drainRopeImpactReceipts());
            return hitReceipts.find(({ predictionId }) => predictionId === hitPredictionId);
        }, "Enemy hit/death rope-impact receipt를 받지 못했습니다");
        assert(
            hitReceipt.accepted,
            `Enemy hit/death rope-impact receipt가 거부됐습니다: ${JSON.stringify(hitReceipt)}`
        );
        await waitFor(
            () => runtime.multiplayer.snapshotDeliveryBySocket.get(firstServerSocket)?.pendingSource,
            "Enemy 사망 상태가 pending snapshot으로 coalesce되지 않았습니다"
        );
        first.socket.releaseLatestSnapshotAck();
        await waitFor(
            () =>
                !first.latestSnapshot.state.enemies.some(({ id }) => id === targetEnemyId) &&
                !second.latestSnapshot.state.enemies.some(({ id }) => id === targetEnemyId),
            "coalesced tombstone 뒤 두 클라이언트에서 Enemy 제거가 수렴하지 않았습니다"
        );
        assert(
            snapshotEnvelopes(first.socket).some(
                ({ replication, events }) =>
                    replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.DELTA &&
                    replication.enemies.removals.includes(targetObjectId) &&
                    events.some(({ eventType, enemyId }) => eventType === "enemy-defeated" && enemyId === targetEnemyId)
            ),
            "pending coalescing이 Enemy tombstone 또는 사망 의미 사건을 잃었습니다"
        );

        simulation.startBossEncounter([first.playerId, second.playerId]);
        await waitFor(
            () =>
                first.latestSnapshot.state.bossStage?.status === "active" &&
                second.latestSnapshot.state.bossStage?.status === "active",
            "Boss 진입 상태가 두 클라이언트로 수렴하지 않았습니다"
        );

        first.materializedStateBySequence.clear();
        const resyncStart = first.socket.receivedMessages.length;
        await waitFor(() => first.snapshotResyncRequested, "누락 baseline에서 명시적 resync를 요청하지 않았습니다");
        await waitFor(
            () =>
                snapshotEnvelopes({ receivedMessages: first.socket.receivedMessages.slice(resyncStart) }).some(
                    ({ replication }) => replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.BASELINE
                ),
            "명시적 resync가 새 baseline을 제공하지 않았습니다"
        );
        assert(first.latestSnapshot.state.bossStage?.status === "active", "resync 뒤 Boss 상태가 수렴하지 않았습니다");

        await closeAuthority(second);
        second = null;
        reconnected = new RemoteGameAuthority({
            url: channelSocketUrl(runtime.serverUrl, first.channelId),
            WebSocketImpl: InspectableWebSocket
        });
        await reconnected.connect();
        await waitFor(
            () =>
                reconnected.latestSnapshot?.state.bossStage?.status === "active" &&
                !reconnected.latestSnapshot.state.enemies.some(({ id }) => id === targetEnemyId),
            "재접속 baseline이 최신 Boss/Enemy 상태로 수렴하지 않았습니다"
        );

        simulation.restoreBossRuntime(null);
        await waitFor(
            () =>
                first.latestSnapshot?.state.bossStage === null &&
                reconnected.latestSnapshot?.state.bossStage === null &&
                first.ownerRuntime.simulation.bossRuntime.status === "inactive" &&
                reconnected.ownerRuntime.simulation.bossRuntime.status === "inactive",
            "bossStage:null delta가 client Boss runtime을 inactive로 수렴시키지 못했습니다"
        );

        const spectator = simulation.players.find(({ id }) => id === first.playerId);
        const preSpectatorSequence = reconnected.latestSnapshot.snapshotSequence;
        spectator.lifeState = "spectating";
        await waitFor(
            () => reconnected.latestSnapshot?.snapshotSequence > preSpectatorSequence,
            "관전자 연결의 빈 관심 영역에서 20Hz snapshot이 중단됐습니다"
        );
        const spectatorTarget = simulation.enemies.find(({ health }) => health > 1);
        spectator.position.set(spectatorTarget.position.x, spectatorTarget.position.y);
        await waitFor(
            () => firstDelivery.acknowledgedRelevantEnemyIds.has(spectatorTarget.objectId),
            "관전자 위치의 Enemy가 network 관심 영역에 진입하지 않았습니다"
        );
        const spectatorMessageStart = first.socket.receivedMessages.length;
        spectatorTarget.health -= 1;
        await waitFor(
            () =>
                snapshotEnvelopes({
                    receivedMessages: first.socket.receivedMessages.slice(spectatorMessageStart)
                }).some(
                    ({ replication }) =>
                        replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.DELTA &&
                        replication.enemies.upserts.some(
                            (upsert) =>
                                upsert.identity === spectatorTarget.objectId && upsert.fields?.changes.length > 0
                        )
                ),
            "관전자가 관전 위치 주변 Enemy의 최신 동적 delta를 받지 못했습니다"
        );

        const report = {
            remoteInterpolation,
            enemyCount: baselineState.enemies.length,
            before: {
                bytes: beforeBytes,
                bytesPerSecondAt20Hz: beforeBytes * 20,
                fields: fieldBytes(legacyState)
            },
            stationaryDelta: {
                bytes: afterBytes,
                bytesPerSecondAt20Hz: afterBytes * 20,
                fields: stationaryFieldBytes,
                measuredApplicationWireBytesPerSecond: stationaryApplicationWireBytesPerSecond,
                measuredFrames: stationaryMessageBytes.length,
                averageFrameBytes: stationaryApplicationWireBytesPerSecond / stationaryMessageBytes.length,
                maximumFrameBytes: Math.max(...stationaryMessageBytes),
                defaultBudgetBytesPerSecond: DEFAULT_STATIONARY_APPLICATION_WIRE_BUDGET_BYTES_PER_SECOND,
                defaultBudgetExceeded,
                failureThresholdBytesPerSecond: MAX_STATIONARY_APPLICATION_WIRE_BYTES_PER_SECOND,
                enemyUpserts: stationary.replication.enemies.upserts.length,
                enemyRemovals: stationary.replication.enemies.removals.length,
                bossStageChanges: stationary.replication.state.changes.filter(({ path }) => path[0] === "bossStage")
                    .length
            }
        };
        console.log(JSON.stringify(report, null, 2));
        console.log("PASS multiplayer snapshot baseline/delta source regression");
    } finally {
        await closeAuthority(reconnected);
        await closeAuthority(second);
        await closeAuthority(first);
        await runtime.close();
    }
}

run().catch((error) => {
    console.error(`FAIL multiplayer snapshot baseline/delta source regression: ${error.message}`);
    process.exitCode = 1;
});
