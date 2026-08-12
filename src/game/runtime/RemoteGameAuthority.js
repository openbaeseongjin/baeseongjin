import { deserializeCommandReceipt } from "../network/CommandReceipt.js";
import {
    createCheckpointClaim,
    createCheckpointClaimReceipt,
    serializeCheckpointClaim
} from "../network/CheckpointClaim.js";
import { createArtifactSelectionClaim, serializeArtifactSelectionClaim } from "../network/ArtifactSelectionClaim.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { serializePlayerCommandBatch } from "../network/PlayerCommandBatch.js";
import { createSummitClaim, createSummitClaimReceipt, serializeSummitClaim } from "../network/SummitClaim.js";
import {
    createProjectileHitClaim,
    createProjectileHitReceipt,
    serializeProjectileHitClaim
} from "../network/ProjectileHitClaim.js";
import {
    createPlayerImpactClaim,
    createPlayerImpactReceipt,
    createPlayerImpactStateDigest,
    serializePlayerImpactClaim
} from "../network/PlayerImpactClaim.js";
import {
    createPlayerProjectileSpawnClaim,
    createPlayerProjectileSpawnReceipt,
    serializePlayerProjectileSpawnClaim
} from "../network/PlayerProjectileSpawnClaim.js";
import {
    createOwnerMotionReceipt,
    createOwnerMotionState,
    serializeOwnerMotionState
} from "../network/OwnerMotionState.js";
import { createRopeSwingClaim, createRopeSwingReceipt, serializeRopeSwingClaim } from "../network/RopeSwingClaim.js";
import { deserializeWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { OwnerPredictionRuntime } from "./OwnerPredictionRuntime.js";
import { RemoteCommandStream } from "./RemoteCommandStream.js";
import { RemoteWorldStateBuffer } from "./RemoteWorldStateBuffer.js";
import { WORLD_CONFIG } from "../config.js";
import { GameSimulation } from "../simulation/GameSimulation.js";

const MAX_TRACKED_COMMANDS = 2048;

function requestSnapshotFlowControl(url) {
    const requested = new URL(url);
    requested.searchParams.set("snapshotAck", "1");
    return requested.toString();
}

function updateAverage(current, sample, weight = 0.2) {
    return current === null ? sample : current + (sample - current) * weight;
}

export class RemoteGameAuthority {
    constructor({ url, WebSocketImpl = globalThis.WebSocket, now = () => performance.now() } = {}) {
        if (!WebSocketImpl) throw new Error("WebSocket is unavailable");
        if (typeof url !== "string" || url.length === 0) throw new Error("멀티 초대 링크가 필요합니다.");
        this.url = url;
        this.WebSocketImpl = WebSocketImpl;
        this.now = now;
        this.socket = null;
        this.playerId = null;
        this.channelId = null;
        this.stream = null;
        this.ownerRuntime = null;
        this.buffer = new RemoteWorldStateBuffer();
        this.latestSnapshot = null;
        this.snapshotReceivedAt = 0;
        this.previousSnapshotReceivedAt = null;
        this.sentAtBySequence = new Map();
        this.sentSequenceOrder = [];
        this.processedReceiptSequences = new Set();
        this.processedReceiptOrder = [];
        this.artifactSelectionReceipts = [];
        this.hitClaimReceipts = [];
        this.projectileSpawnClaimReceipts = [];
        this.ropeSwingClaimReceipts = [];
        this.impactClaimReceipts = [];
        this.pendingImpactClaims = new Map();
        this.checkpointClaimReceipts = [];
        this.pendingCheckpointId = null;
        this.summitClaimReceipts = [];
        this.pendingSummitClaim = false;
        this.latestOwnerMotionReceiptTick = -1;
        this.networkMetrics = {
            roundTripMs: null,
            snapshotIntervalMs: null,
            acceptedCommands: 0,
            rejectedCommands: 0,
            acceptedOwnerMotions: 0,
            rejectedOwnerMotions: 0
        };
        this.closed = false;
        this.closeReason = null;
        this.intentionalClose = false;
        this.snapshotFlowControl = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            const socket = new this.WebSocketImpl(requestSnapshotFlowControl(this.url));
            this.socket = socket;
            let settled = false;
            const rejectConnection = (message) => {
                if (settled) return;
                settled = true;
                reject(new Error(message));
            };
            const failSession = (message, closeCode = 1002, closeReason = "invalid server message") => {
                this.closed = true;
                this.closeReason ??= message;
                rejectConnection(message);
                if (socket.readyState === 0 || socket.readyState === 1) socket.close(closeCode, closeReason);
            };
            socket.addEventListener("error", () => {
                if (!this.intentionalClose) failSession("멀티 서버에 연결할 수 없습니다.");
            });
            socket.addEventListener("close", (event) => {
                this.closed = true;
                if (!this.intentionalClose) {
                    this.closeReason ??= event.reason || "멀티 서버 연결이 종료되었습니다.";
                }
                rejectConnection(this.closeReason ?? (event.reason || "멀티 서버 연결이 종료되었습니다."));
            });
            socket.addEventListener("message", (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "error") {
                        const errors = {
                            "channel-full": `채널 ${message.channelId ?? ""}의 인원이 가득 찼습니다.`,
                            "channel-not-found": `채널 ${message.channelId ?? ""}을 찾을 수 없습니다.`
                        };
                        failSession(
                            errors[message.code] ??
                                message.message ??
                                message.code ??
                                "멀티 서버 요청이 거부되었습니다.",
                            1008,
                            "server rejected session"
                        );
                        return;
                    }
                    if (message.type === "welcome") {
                        this.playerId = message.playerId;
                        this.channelId = message.channelId;
                        this.snapshotFlowControl = message.snapshotFlowControl === true;
                        this.stream = new RemoteCommandStream({
                            playerId: this.playerId,
                            inputLeadTicks: MULTIPLAYER_TIMING.inputLeadTicks
                        });
                        this.acceptSnapshot(message.snapshot);
                        if (!settled) {
                            settled = true;
                            resolve(this);
                        }
                    } else if (message.type === "snapshot") {
                        this.acceptSnapshot(message.payload);
                    } else if (message.type === "receipt" && this.stream) {
                        const receipt = deserializeCommandReceipt(message.payload);
                        this.recordReceipt(receipt);
                        this.stream.acceptReceipt(receipt);
                    } else if (message.type === "artifact-selection-receipt") {
                        this.artifactSelectionReceipts.push(Object.freeze({ ...message.payload }));
                    } else if (message.type === "hit-claim-receipt") {
                        this.recordHitClaimReceipt(createProjectileHitReceipt(message.payload));
                    } else if (message.type === "projectile-spawn-claim-receipt") {
                        const receipt = createPlayerProjectileSpawnReceipt(message.payload);
                        this.projectileSpawnClaimReceipts.push(receipt);
                        this.ownerRuntime?.recordProjectileSpawnReceipt(receipt);
                    } else if (message.type === "rope-swing-claim-receipt") {
                        const receipt = createRopeSwingReceipt(message.payload);
                        this.ropeSwingClaimReceipts.push(receipt);
                        this.ownerRuntime?.recordRopeSwingReceipt(receipt);
                    } else if (message.type === "impact-claim-receipt") {
                        const receipt = createPlayerImpactReceipt(message.payload);
                        const pending = this.pendingImpactClaims.get(receipt.projectileId);
                        if (!receipt.accepted && receipt.reason === "state-diverged" && pending) {
                            const recovery = this.ownerRuntime?.impactRecoveryState();
                            if (!recovery) throw new Error("impact recovery requires an owner state");
                            const outcome = {
                                ...pending.outcome,
                                recoveryId: receipt.recoveryId,
                                stateTick: recovery.stateTick,
                                digest: createPlayerImpactStateDigest(recovery.state, {
                                    impactType: pending.event.resolution,
                                    respawned: pending.outcome.respawned
                                }),
                                state: recovery.state
                            };
                            this.submitImpactClaim(pending.event, outcome);
                            return;
                        }
                        this.pendingImpactClaims.delete(receipt.projectileId);
                        this.impactClaimReceipts.push(receipt);
                        this.ownerRuntime?.recordImpactReceipt(receipt, this.latestSnapshot);
                    } else if (message.type === "owner-motion-receipt") {
                        this.recordOwnerMotionReceipt(createOwnerMotionReceipt(message.payload));
                    } else if (message.type === "checkpoint-claim-receipt") {
                        this.recordCheckpointClaimReceipt(createCheckpointClaimReceipt(message.payload));
                    } else if (message.type === "summit-claim-receipt") {
                        this.recordSummitClaimReceipt(createSummitClaimReceipt(message.payload));
                    } else if (message.type !== "player-left") {
                        throw new Error(`unsupported server message: ${message.type ?? "missing type"}`);
                    }
                } catch (error) {
                    failSession(`서버 메시지를 처리하지 못했습니다: ${error.message}`);
                }
            });
        });
    }

    acceptSnapshot(serialized) {
        const snapshot = deserializeWorldSnapshotEnvelope(serialized);
        this.ownerRuntime ??= new OwnerPredictionRuntime({
            ownerId: this.playerId,
            simulation: new GameSimulation({ worldSeed: snapshot.worldSeed, playerId: this.playerId })
        });
        if (!this.stream.acceptSnapshot(snapshot)) return false;
        this.pruneSentCommands(snapshot.acknowledgements?.[this.playerId]);
        const receivedAt = this.now();
        if (this.previousSnapshotReceivedAt !== null) {
            this.networkMetrics.snapshotIntervalMs = updateAverage(
                this.networkMetrics.snapshotIntervalMs,
                receivedAt - this.previousSnapshotReceivedAt
            );
        }
        this.previousSnapshotReceivedAt = receivedAt;
        this.latestSnapshot = snapshot;
        if (snapshot.state.activeCheckpointId === this.pendingCheckpointId) this.pendingCheckpointId = null;
        if (snapshot.state.runState === "completed") this.pendingSummitClaim = false;
        this.snapshotReceivedAt = receivedAt;
        this.buffer.push(snapshot, receivedAt);
        this.reconcile();
        this.acknowledgeSnapshot(snapshot.snapshotSequence);
        return true;
    }

    acknowledgeSnapshot(snapshotSequence) {
        if (!this.snapshotFlowControl || this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        this.socket.send(JSON.stringify({ type: "snapshot-ack", snapshotSequence }));
        return true;
    }

    reconcile() {
        if (!this.latestSnapshot) return null;
        return this.ownerRuntime.reconcile(this.latestSnapshot, this.stream.pendingBatches());
    }

    submit(command) {
        if (!this.latestSnapshot || this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        const predictedTick = this.ownerRuntime.state().tick;
        const batch = this.stream.createBatchAtTick(predictedTick, command);
        if (!batch) return false;
        this.trackSentCommand(batch.commands[0].sequence, this.now());
        this.socket.send(JSON.stringify({ type: "command", payload: serializePlayerCommandBatch(batch) }));
        this.submitOwnerMotion();
        return true;
    }

    submitOwnerMotion() {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        const motion = this.ownerMotionState();
        return this.sendOwnerMotion(motion);
    }

    ownerMotionState() {
        if (!this.ownerRuntime) return null;
        const predicted = this.ownerRuntime.state();
        return createOwnerMotionState({
            clientTick: predicted.tick,
            position: predicted.position,
            velocity: predicted.velocity,
            angle: predicted.angle,
            angularVelocity: predicted.angularVelocity,
            isGrounded: predicted.isGrounded,
            rope: predicted.rope
        });
    }

    sendOwnerMotion(motion) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !motion) return false;
        this.socket.send(JSON.stringify({ type: "owner-motion", payload: serializeOwnerMotionState(motion) }));
        return true;
    }

    advance(command) {
        const predicted = this.ownerRuntime?.advance(command) ?? null;
        if (!predicted || predicted.position.y <= WORLD_CONFIG.floorY + 780) return predicted;
        this.submitOwnerMotion();
        return this.ownerRuntime.predictFall();
    }

    resolveOwnerCollisions(otherPlayers) {
        return this.ownerRuntime?.resolveCollisions(otherPlayers) ?? false;
    }

    renderSnapshot() {
        return this.ownerRuntime?.renderSnapshot() ?? null;
    }

    applyPredictedImpact(event) {
        return this.ownerRuntime?.applyPredictedImpact(event) ?? false;
    }

    resolvePredictedImpact(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        const motionBeforeImpact = this.ownerMotionState();
        const healthBeforeImpact = this.ownerRuntime.state().health;
        if (!this.applyPredictedImpact(event)) return false;
        if (!this.sendOwnerMotion(motionBeforeImpact)) return false;
        const state = this.ownerRuntime.impactClaimState();
        const damage = event.parameters?.damage ?? 0;
        const respawned = event.resolution === "player-hit" && damage >= healthBeforeImpact;
        const outcome = {
            respawned,
            digest: createPlayerImpactStateDigest(state, { impactType: event.resolution, respawned })
        };
        this.pendingImpactClaims.set(event.projectileId, { event, outcome });
        return this.submitImpactClaim(event, outcome);
    }

    submitHitClaim(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        const claim = createProjectileHitClaim({
            predictionId: event.predictionId,
            targetId: event.targetId,
            clientTick: event.clientTick,
            position: event.position
        });
        this.socket.send(JSON.stringify({ type: "hit-claim", payload: serializeProjectileHitClaim(claim) }));
        return true;
    }

    submitProjectileSpawnClaim(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        if (!this.submitOwnerMotion()) return false;
        const claim = createPlayerProjectileSpawnClaim({
            predictionId: event.predictionId,
            targetId: event.targetId,
            clientTick: event.tick,
            position: event.position
        });
        this.socket.send(
            JSON.stringify({
                type: "projectile-spawn-claim",
                payload: serializePlayerProjectileSpawnClaim(claim)
            })
        );
        return true;
    }

    submitRopeSwingClaim(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        if (!this.submitOwnerMotion()) return false;
        const claim = createRopeSwingClaim({
            predictionId: event.predictionId,
            clientTick: event.tick,
            position: event.position,
            anchor: event.anchor
        });
        this.socket.send(
            JSON.stringify({
                type: "rope-swing-claim",
                payload: serializeRopeSwingClaim(claim)
            })
        );
        return true;
    }

    submitImpactClaim(event, outcome) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        const claim = createPlayerImpactClaim({
            projectileId: event.projectileId,
            clientTick: event.clientTick,
            impactType: event.resolution,
            position: event.position,
            velocity: event.velocity,
            damage: event.parameters?.damage ?? 0,
            outcome
        });
        this.socket.send(JSON.stringify({ type: "impact-claim", payload: serializePlayerImpactClaim(claim) }));
        return true;
    }

    submitArtifactSelection({ checkpointId, artifactId }) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        const claim = createArtifactSelectionClaim({
            checkpointId,
            artifactId,
            clientTick: this.ownerRuntime.state().tick
        });
        this.socket.send(
            JSON.stringify({ type: "artifact-selection", payload: serializeArtifactSelectionClaim(claim) })
        );
        return true;
    }

    submitReachedCheckpoint() {
        if (this.pendingCheckpointId || this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) {
            return null;
        }
        const candidate = this.ownerRuntime.checkpointClaimCandidate();
        if (!candidate) return null;
        if (!this.submitOwnerMotion() || !this.ownerRuntime.applyPredictedCheckpoint(candidate)) return null;
        const claim = createCheckpointClaim(candidate);
        this.pendingCheckpointId = claim.checkpointId;
        this.socket.send(JSON.stringify({ type: "checkpoint-claim", payload: serializeCheckpointClaim(claim) }));
        return candidate;
    }

    submitReachedSummit() {
        if (this.pendingSummitClaim || this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) {
            return null;
        }
        const candidate = this.ownerRuntime.summitClaimCandidate();
        if (!candidate) return null;
        this.submitOwnerMotion();
        const claim = createSummitClaim(candidate);
        this.pendingSummitClaim = true;
        this.socket.send(JSON.stringify({ type: "summit-claim", payload: serializeSummitClaim(claim) }));
        return candidate;
    }

    drainArtifactSelectionReceipts() {
        const receipts = Object.freeze(this.artifactSelectionReceipts);
        this.artifactSelectionReceipts = [];
        return receipts;
    }

    drainHitClaimReceipts() {
        const receipts = Object.freeze(this.hitClaimReceipts);
        this.hitClaimReceipts = [];
        return receipts;
    }

    drainProjectileSpawnClaimReceipts() {
        const receipts = Object.freeze(this.projectileSpawnClaimReceipts);
        this.projectileSpawnClaimReceipts = [];
        return receipts;
    }

    drainRopeSwingClaimReceipts() {
        const receipts = Object.freeze(this.ropeSwingClaimReceipts);
        this.ropeSwingClaimReceipts = [];
        return receipts;
    }

    recordHitClaimReceipt(receipt) {
        this.hitClaimReceipts.push(receipt);
    }

    drainImpactClaimReceipts() {
        const receipts = Object.freeze(this.impactClaimReceipts);
        this.impactClaimReceipts = [];
        return receipts;
    }

    recordCheckpointClaimReceipt(receipt) {
        this.checkpointClaimReceipts.push(receipt);
        this.ownerRuntime?.recordCheckpointReceipt(receipt, this.latestSnapshot);
        if (!receipt.accepted && receipt.checkpointId === this.pendingCheckpointId) this.pendingCheckpointId = null;
    }

    drainCheckpointClaimReceipts() {
        const receipts = Object.freeze(this.checkpointClaimReceipts);
        this.checkpointClaimReceipts = [];
        return receipts;
    }

    recordSummitClaimReceipt(receipt) {
        this.summitClaimReceipts.push(receipt);
        if (!receipt.accepted) this.pendingSummitClaim = false;
    }

    drainSummitClaimReceipts() {
        const receipts = Object.freeze(this.summitClaimReceipts);
        this.summitClaimReceipts = [];
        return receipts;
    }

    recordOwnerMotionReceipt(receipt) {
        if (receipt.clientTick <= this.latestOwnerMotionReceiptTick) return false;
        this.latestOwnerMotionReceiptTick = receipt.clientTick;
        if (receipt.accepted) {
            this.networkMetrics.acceptedOwnerMotions += 1;
        } else {
            this.networkMetrics.rejectedOwnerMotions += 1;
            if (this.latestSnapshot) {
                this.ownerRuntime.reconcile(this.latestSnapshot, this.stream.pendingBatches(), { rebaseMotion: true });
            }
        }
        return true;
    }

    snapshot() {
        return {
            state: this.buffer.sample({ now: this.now(), localPlayerId: this.playerId }),
            predicted: this.ownerRuntime?.presentationState() ?? null,
            owner: this.ownerRuntime?.state() ?? null,
            ownerArtifactReward: this.ownerRuntime?.artifactReward() ?? null,
            serverTick: this.latestSnapshot?.serverTick ?? null,
            connected: !this.closed
        };
    }

    drainEvents() {
        return this.buffer.drainEvents();
    }

    drainPredictedEvents() {
        return this.ownerRuntime?.drainPredictedEvents() ?? Object.freeze([]);
    }

    recordReceipt(receipt) {
        const receivedAt = this.now();
        const accepted = receipt.accepted.filter(
            ({ playerId, sequence }) => playerId === this.playerId && !this.processedReceiptSequences.has(sequence)
        );
        const rejected = receipt.rejected.filter(
            ({ playerId, sequence }) => playerId === this.playerId && !this.processedReceiptSequences.has(sequence)
        );
        const references = [...accepted, ...rejected];
        for (const reference of references) {
            this.processedReceiptSequences.add(reference.sequence);
            this.processedReceiptOrder.push(reference.sequence);
            if (this.processedReceiptOrder.length > 2048) {
                this.processedReceiptSequences.delete(this.processedReceiptOrder.shift());
            }
            const sentAt = this.sentAtBySequence.get(reference.sequence);
            if (sentAt === undefined) continue;
            this.networkMetrics.roundTripMs = updateAverage(this.networkMetrics.roundTripMs, receivedAt - sentAt);
            this.sentAtBySequence.delete(reference.sequence);
        }
        this.networkMetrics.acceptedCommands += accepted.length;
        this.networkMetrics.rejectedCommands += rejected.length;
    }

    trackSentCommand(sequence, sentAt) {
        this.sentAtBySequence.set(sequence, sentAt);
        this.sentSequenceOrder.push(sequence);
        while (this.sentSequenceOrder.length > MAX_TRACKED_COMMANDS) {
            this.sentAtBySequence.delete(this.sentSequenceOrder.shift());
        }
    }

    pruneSentCommands(acknowledgedSequence) {
        if (!Number.isSafeInteger(acknowledgedSequence) || acknowledgedSequence < 0) return;
        this.sentSequenceOrder = this.sentSequenceOrder.filter((sequence) => {
            if (sequence > acknowledgedSequence) return true;
            this.sentAtBySequence.delete(sequence);
            return false;
        });
    }

    metrics() {
        const totalCommands = this.networkMetrics.acceptedCommands + this.networkMetrics.rejectedCommands;
        return Object.freeze({
            ...this.networkMetrics,
            pendingCommands: this.stream?.pendingBatches().length ?? 0,
            trackedCommands: this.sentAtBySequence.size,
            rejectionRate: totalCommands === 0 ? 0 : this.networkMetrics.rejectedCommands / totalCommands,
            ...(this.ownerRuntime?.metrics() ?? {}),
            ...(this.buffer.metrics() ?? {})
        });
    }

    close() {
        this.intentionalClose = true;
        this.closed = true;
        this.closeReason = null;
        if (this.socket?.readyState === this.WebSocketImpl.OPEN) this.socket.close(1000, "client shutdown");
    }
}
