import { createAugmentImpactClaim, serializeAugmentImpactClaim } from "../network/AugmentImpactClaim.js";
import { SPELL_SOURCE_KIND } from "../spells/SpellRuntimeDefinition.js";
import { createCheckpointClaim, serializeCheckpointClaim } from "../network/CheckpointClaim.js";
import { createAugmentSelectionClaim, serializeAugmentSelectionClaim } from "../network/AugmentSelectionClaim.js";
import { serializePlayerCommandBatch } from "../network/PlayerCommandBatch.js";
import { createSummitClaim, serializeSummitClaim } from "../network/SummitClaim.js";
import { createProjectileHitClaim, serializeProjectileHitClaim } from "../network/ProjectileHitClaim.js";
import {
    createPlayerImpactClaimFromEvent,
    createPlayerImpactStateDigest,
    PLAYER_IMPACT_SOURCE_KIND,
    serializePlayerImpactClaim
} from "../network/PlayerImpactClaim.js";
import {
    createPlayerProjectileSpawnClaim,
    serializePlayerProjectileSpawnClaim
} from "../network/PlayerProjectileSpawnClaim.js";
import { createRopeImpactClaim, serializeRopeImpactClaim } from "../network/RopeImpactClaim.js";
import { createOwnerMotionState, serializeOwnerMotionState } from "../network/OwnerMotionState.js";
import { deserializeWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { MULTIPLAYER_MESSAGE_TYPE } from "../network/MultiplayerMessageDefinition.js";
import { OwnerPredictionRuntime } from "./OwnerPredictionRuntime.js";
import { RemoteWorldStateBuffer } from "./RemoteWorldStateBuffer.js";
import { WORLD_CONFIG } from "../config.js";
import { createGameSimulationForWorldRevision } from "../simulation/GameSimulationFactory.js";
import { routeServerMessage } from "./RemoteServerMessageRouter.js";
import { ClientServerTickProjection } from "./ClientServerTickProjection.js";
import { LOWER_SECTOR_COMMANDER_HAZARD } from "../boss/LowerSectorCommanderDefinition.js";
import {
    createPartyChatMessage,
    createPartyChatSubmission,
    serializePartyChatSubmission
} from "../network/PartyChatMessage.js";

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
        this.tickProjection = new ClientServerTickProjection();
        this.latestSnapshot = null;
        this.snapshotReceivedAt = 0;
        this.previousSnapshotReceivedAt = null;
        this.sentAtBySequence = new Map();
        this.sentSequenceOrder = [];
        this.processedReceiptSequences = new Set();
        this.processedReceiptOrder = [];
        this.augmentSelectionReceipts = [];
        this.hitClaimReceipts = [];
        this.projectileSpawnClaimReceipts = [];
        this.impactClaimReceipts = [];
        this.locallyPredictedJammerImpactIds = new Set();
        this.locallyPredictedJammerImpactOrder = [];
        this.ropeImpactReceipts = [];
        this.augmentImpactReceipts = [];
        this.pendingAugmentImpactClaims = new Map();
        this.locallyPredictedAugmentImpactIds = new Set();
        this.locallyPredictedAugmentImpactOrder = [];
        this.locallyPredictedRopeImpactIds = new Set();
        this.locallyPredictedRopeImpactOrder = [];
        this.predictedRopeImpactResolutions = new Map();
        this.locallyPredictedFallImpactIds = new Set();
        this.locallyPredictedFallImpactOrder = [];
        this.pendingImpactClaims = new Map();
        this.checkpointClaimReceipts = [];
        this.debugTeleportReceipts = [];
        this.pendingCheckpointId = null;
        this.pendingCheckpointClaim = null;
        this.summitClaimReceipts = [];
        this.pendingSummitClaim = false;
        this.partyChatSequence = 0;
        this.partyChatMessages = [];
        this.latestOwnerMotionReceiptTick = -1;
        this.recoveringOwnerMotionTick = false;
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
                    routeServerMessage(message, {
                        authority: this,
                        failSession,
                        settle: () => {
                            if (settled) return;
                            settled = true;
                            resolve(this);
                        }
                    });
                } catch (error) {
                    failSession(`서버 메시지를 처리하지 못했습니다: ${error.message}`);
                }
            });
        });
    }

    acceptSnapshot(serialized) {
        const receivedSnapshot = deserializeWorldSnapshotEnvelope(serialized);
        this.ownerRuntime ??= new OwnerPredictionRuntime({
            ownerId: this.playerId,
            simulation: createGameSimulationForWorldRevision({
                worldSeed: receivedSnapshot.worldSeed,
                playerId: this.playerId,
                worldRevision: receivedSnapshot.worldRevision
            })
        });
        const snapshot = Object.freeze({
            ...receivedSnapshot,
            state: Object.freeze({
                ...receivedSnapshot.state,
                enemies: Object.freeze(this.ownerRuntime.hydrateEnemyNetworkStates(receivedSnapshot.state.enemies))
            })
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
        if (snapshot.state.progressKind === "area" && snapshot.state.activeCheckpointId === this.pendingCheckpointId) {
            this.pendingCheckpointId = null;
            this.pendingCheckpointClaim = null;
        }
        if (snapshot.state.runState === "completed") this.pendingSummitClaim = false;
        this.snapshotReceivedAt = receivedAt;
        this.buffer.push(snapshot, receivedAt);
        this.reconcile();
        this.reanchorTickProjection();
        this.acknowledgeSnapshot(snapshot.snapshotSequence);
        return true;
    }

    acknowledgeSnapshot(snapshotSequence) {
        if (!this.snapshotFlowControl || this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        this.socket.send(JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.SNAPSHOT_ACK, snapshotSequence }));
        return true;
    }

    reconcile() {
        if (!this.latestSnapshot) return null;
        return this.ownerRuntime.reconcile(this.latestSnapshot, this.stream.pendingBatches());
    }

    submit(command) {
        if (!this.latestSnapshot || this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        const batch = this.stream.createBatch(this.stream.latestServerTick, command);
        if (!batch) return false;
        this.trackSentCommand(batch.commands[0].sequence, this.now());
        this.socket.send(
            JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.COMMAND, payload: serializePlayerCommandBatch(batch) })
        );
        this.submitOwnerMotion();
        return true;
    }

    submitPartyChat(text) {
        if (!this.playerId || this.socket?.readyState !== this.WebSocketImpl.OPEN) return null;
        const submission = createPartyChatSubmission({ clientSequence: this.partyChatSequence, text });
        this.partyChatSequence += 1;
        const message = createPartyChatMessage({ speakerId: this.playerId, ...submission });
        this.socket.send(
            JSON.stringify({
                type: MULTIPLAYER_MESSAGE_TYPE.PARTY_CHAT_SUBMIT,
                payload: serializePartyChatSubmission(submission)
            })
        );
        return message;
    }

    drainPartyChatMessages() {
        return Object.freeze(this.partyChatMessages.splice(0));
    }

    submitOwnerMotion() {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        const motion = this.ownerMotionState();
        return this.sendOwnerMotion(motion);
    }

    ownerMotionState(predictedState = null, clientTick = null) {
        if (!this.ownerRuntime) return null;
        const predicted = predictedState ?? this.ownerRuntime.state();
        const tick = clientTick ?? predicted.tick;
        return createOwnerMotionState({
            clientTick: tick,
            authorityTick: this.tickProjection.project(tick),
            position: predicted.position,
            velocity: predicted.velocity,
            angle: predicted.angle,
            angularVelocity: predicted.angularVelocity,
            isGrounded: predicted.isGrounded,
            rope: predicted.rope,
            ropeImpactState: predicted.ropeImpactState,
            launcher: predicted.launcher,
            augmentRuntimeState: predicted.augmentRuntimeState,
            respawnAnchorId: predicted.respawnAnchorId ?? null
        });
    }

    sendOwnerMotion(motion) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !motion) return false;
        this.socket.send(
            JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.OWNER_MOTION, payload: serializeOwnerMotionState(motion) })
        );
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

    worldSnapshot() {
        return this.ownerRuntime?.worldSnapshot() ?? null;
    }

    bossStageSnapshot() {
        return this.ownerRuntime?.bossStageSnapshot() ?? null;
    }

    ownerState() {
        return this.ownerRuntime?.state() ?? null;
    }

    presentationState() {
        return this.ownerRuntime?.presentationState() ?? null;
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

    submitPredictedJammerImpact(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        const before = this.ownerRuntime.pendingImpactBefore(event.impactId);
        if (!before || !this.sendOwnerMotion(this.ownerMotionState(before.state, before.tick))) return false;
        const state = this.ownerRuntime.impactClaimState();
        const outcome = {
            respawned: false,
            digest: createPlayerImpactStateDigest(state, { impactType: event.resolution, respawned: false })
        };
        this.pendingImpactClaims.set(event.impactId, { event, outcome });
        this.locallyPredictedJammerImpactIds.add(event.impactId);
        this.locallyPredictedJammerImpactOrder.push(event.impactId);
        while (this.locallyPredictedJammerImpactOrder.length > MAX_TRACKED_COMMANDS) {
            this.locallyPredictedJammerImpactIds.delete(this.locallyPredictedJammerImpactOrder.shift());
        }
        return this.submitImpactClaim(event, outcome);
    }

    submitPredictedFallImpact(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        if (!this.submitOwnerMotion()) return false;
        const state = this.ownerRuntime.impactClaimState();
        const outcome = {
            respawned: event.respawned,
            digest: createPlayerImpactStateDigest(state, {
                impactType: "fall-damage",
                respawned: event.respawned
            })
        };
        this.pendingImpactClaims.set(event.impactId, { event, outcome });
        this.locallyPredictedFallImpactIds.add(event.impactId);
        this.locallyPredictedFallImpactOrder.push(event.impactId);
        while (this.locallyPredictedFallImpactOrder.length > MAX_TRACKED_COMMANDS) {
            this.locallyPredictedFallImpactIds.delete(this.locallyPredictedFallImpactOrder.shift());
        }
        return this.submitImpactClaim(event, outcome);
    }

    submitPredictedBossImpact(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        if (!this.submitOwnerMotion()) {
            if (event.parameters?.sourceType === LOWER_SECTOR_COMMANDER_HAZARD.GRAB) {
                this.ownerRuntime.recordImpactReceipt(
                    { impactId: event.impactId, accepted: false },
                    this.latestSnapshot
                );
            }
            return false;
        }
        const state = this.ownerRuntime.impactClaimState();
        const respawned = event.respawned === true;
        const outcome = {
            respawned,
            digest: createPlayerImpactStateDigest(state, { impactType: "player-hit", respawned })
        };
        this.pendingImpactClaims.set(event.impactId, { event, outcome });
        const submitted = this.submitImpactClaim(event, outcome);
        if (!submitted && event.parameters?.sourceType === LOWER_SECTOR_COMMANDER_HAZARD.GRAB) {
            this.pendingImpactClaims.delete(event.impactId);
            this.ownerRuntime.recordImpactReceipt({ impactId: event.impactId, accepted: false }, this.latestSnapshot);
        }
        return submitted;
    }

    submitHitClaim(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        const claim = createProjectileHitClaim({
            predictionId: event.predictionId,
            targetId: event.targetId,
            clientTick: event.clientTick,
            authorityTick: this.tickProjection.project(event.clientTick),
            position: event.position
        });
        this.socket.send(
            JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.HIT_CLAIM, payload: serializeProjectileHitClaim(claim) })
        );
        return true;
    }

    submitProjectileSpawnClaim(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        if (!this.submitOwnerMotion()) return false;
        const claim = createPlayerProjectileSpawnClaim({
            predictionId: event.predictionId,
            targetId: event.targetId,
            clientTick: event.tick,
            authorityTick: this.tickProjection.project(event.tick),
            position: event.position
        });
        this.socket.send(
            JSON.stringify({
                type: MULTIPLAYER_MESSAGE_TYPE.PROJECTILE_SPAWN_CLAIM,
                payload: serializePlayerProjectileSpawnClaim(claim)
            })
        );
        return true;
    }

    submitImpactClaim(event, outcome) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        const claim = createPlayerImpactClaimFromEvent({
            event,
            authorityTick: this.tickProjection.project(event.clientTick),
            outcome
        });
        this.socket.send(
            JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.IMPACT_CLAIM, payload: serializePlayerImpactClaim(claim) })
        );
        return true;
    }

    submitRopeImpact(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        if (!this.submitOwnerMotion()) return false;
        const claim = createRopeImpactClaim({
            predictionId: event.predictionId,
            targetId: event.parameters.targetId,
            targetKind: event.parameters.targetKind ?? "enemy",
            clientTick: event.clientTick,
            authorityTick: this.tickProjection.project(event.clientTick),
            position: event.position,
            velocity: event.velocity
        });
        this.locallyPredictedRopeImpactIds.add(event.predictionId);
        this.predictedRopeImpactResolutions.set(event.predictionId, event.resolution);
        this.locallyPredictedRopeImpactOrder.push(event.predictionId);
        while (this.locallyPredictedRopeImpactOrder.length > MAX_TRACKED_COMMANDS) {
            const expiredPredictionId = this.locallyPredictedRopeImpactOrder.shift();
            this.locallyPredictedRopeImpactIds.delete(expiredPredictionId);
            this.predictedRopeImpactResolutions.delete(expiredPredictionId);
        }
        this.socket.send(
            JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.ROPE_IMPACT, payload: serializeRopeImpactClaim(claim) })
        );
        return true;
    }

    submitAugmentImpact(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        if (!this.submitOwnerMotion()) return false;
        return this.submitAugmentImpactEvent(event);
    }

    submitIncomingSpellImpact(event) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        if (event.targetId !== this.playerId || event.sourcePlayerId === this.playerId) return false;
        return this.submitAugmentImpactEvent(event);
    }

    submitAugmentImpactEvent(event) {
        const claim = createAugmentImpactClaim({
            eventId: event.eventId,
            predictionId: event.predictionId ?? event.eventId,
            sourcePlayerId: event.sourcePlayerId ?? this.playerId,
            targetId: event.targetId,
            clientTick: event.clientTick ?? event.tick,
            authorityTick: this.tickProjection.project(event.clientTick ?? event.tick),
            effectId: event.effectId,
            sourceKind: event.sourceKind ?? SPELL_SOURCE_KIND.CAST,
            sourcePosition: event.sourcePosition,
            contactPosition: event.contactPosition ?? event.position,
            damage: event.damage,
            ...(event.impactSpeed === undefined ? {} : { impactSpeed: event.impactSpeed }),
            ...(event.knockback
                ? {
                      knockback: {
                          direction: event.knockback.direction,
                          ...(event.knockback.impulse !== undefined
                              ? { impulse: event.knockback.impulse }
                              : {
                                    distance: event.knockback.distance,
                                    duration: event.knockback.duration ?? event.knockback.durationSeconds
                                })
                      }
                  }
                : {})
        });
        this.locallyPredictedAugmentImpactIds.add(claim.eventId);
        this.pendingAugmentImpactClaims.set(claim.eventId, { claim, retried: false });
        this.locallyPredictedAugmentImpactOrder.push(claim.eventId);
        while (this.locallyPredictedAugmentImpactOrder.length > MAX_TRACKED_COMMANDS) {
            const expiredEventId = this.locallyPredictedAugmentImpactOrder.shift();
            this.locallyPredictedAugmentImpactIds.delete(expiredEventId);
            this.pendingAugmentImpactClaims.delete(expiredEventId);
        }
        return this.sendAugmentImpactClaim(claim);
    }

    reanchorTickProjection() {
        if (!this.latestSnapshot || !this.ownerRuntime) return false;
        const sharedOwner = this.latestSnapshot.state.players.find(({ id }) => id === this.playerId);
        this.tickProjection.observe({
            clientTick: this.ownerRuntime.state().tick,
            serverTick: Math.max(this.latestSnapshot.serverTick, sharedOwner?.ownerMotionTick ?? 0)
        });
        return true;
    }

    sendAugmentImpactClaim(claim) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        this.socket.send(
            JSON.stringify({
                type: MULTIPLAYER_MESSAGE_TYPE.AUGMENT_IMPACT,
                payload: serializeAugmentImpactClaim(claim)
            })
        );
        return true;
    }

    applyPredictedAugmentSelection(selection) {
        return this.ownerRuntime?.applyPredictedAugmentSelection(selection) ?? false;
    }

    rejectPredictedAugmentSelection(sourceId) {
        return this.ownerRuntime?.rejectPredictedAugmentSelection(sourceId, this.latestSnapshot) ?? false;
    }

    releasePredictedRope() {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        if (!this.ownerRuntime.releaseRope()) return false;
        this.submitOwnerMotion();
        return true;
    }

    requestDebugTeleport(areaId) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN) return false;
        this.socket.send(
            JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.DEBUG_TELEPORT, payload: JSON.stringify({ areaId }) })
        );
        return true;
    }

    submitAugmentSelection({ sourceId, augmentId }) {
        if (this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) return false;
        if (!this.submitOwnerMotion()) return false;
        const claim = createAugmentSelectionClaim({
            sourceId,
            augmentId,
            clientTick: this.ownerRuntime.state().tick,
            authorityTick: this.tickProjection.project(this.ownerRuntime.state().tick)
        });
        this.socket.send(
            JSON.stringify({
                type: MULTIPLAYER_MESSAGE_TYPE.AUGMENT_SELECTION,
                payload: serializeAugmentSelectionClaim(claim)
            })
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
        const claim = createCheckpointClaim({
            ...candidate,
            authorityTick: this.tickProjection.project(candidate.clientTick)
        });
        this.pendingCheckpointId = claim.checkpointId;
        this.pendingCheckpointClaim = { claim, retried: false };
        this.socket.send(
            JSON.stringify({
                type: MULTIPLAYER_MESSAGE_TYPE.CHECKPOINT_CLAIM,
                payload: serializeCheckpointClaim(claim)
            })
        );
        return candidate;
    }

    submitReachedSummit() {
        if (this.pendingSummitClaim || this.socket?.readyState !== this.WebSocketImpl.OPEN || !this.ownerRuntime) {
            return null;
        }
        const candidate = this.ownerRuntime.summitClaimCandidate();
        if (!candidate) return null;
        this.submitOwnerMotion();
        const claim = createSummitClaim({
            ...candidate,
            authorityTick: this.tickProjection.project(candidate.clientTick)
        });
        this.pendingSummitClaim = true;
        this.socket.send(
            JSON.stringify({ type: MULTIPLAYER_MESSAGE_TYPE.SUMMIT_CLAIM, payload: serializeSummitClaim(claim) })
        );
        return candidate;
    }

    drainAugmentSelectionReceipts() {
        const receipts = Object.freeze(this.augmentSelectionReceipts);
        this.augmentSelectionReceipts = [];
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
        const pending = this.pendingCheckpointClaim;
        if (
            !receipt.accepted &&
            receipt.reason === "tick-window" &&
            pending?.claim.checkpointId === receipt.checkpointId &&
            !pending.retried
        ) {
            this.reconcile();
            this.reanchorTickProjection();
            const retry = createCheckpointClaim({
                ...pending.claim,
                authorityTick: this.tickProjection.project(this.ownerRuntime.state().tick)
            });
            this.pendingCheckpointClaim = { claim: retry, retried: true };
            this.submitOwnerMotion();
            this.socket.send(
                JSON.stringify({
                    type: MULTIPLAYER_MESSAGE_TYPE.CHECKPOINT_CLAIM,
                    payload: serializeCheckpointClaim(retry)
                })
            );
            return true;
        }
        this.ownerRuntime?.recordCheckpointReceipt(receipt, this.latestSnapshot);
        if (receipt.checkpointId === this.pendingCheckpointId) {
            if (!receipt.accepted) this.pendingCheckpointId = null;
            this.pendingCheckpointClaim = null;
        }
        return true;
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
        this.latestOwnerMotionReceiptTick = Math.max(this.latestOwnerMotionReceiptTick, receipt.clientTick);
        if (receipt.accepted) {
            this.networkMetrics.acceptedOwnerMotions += 1;
            this.recoveringOwnerMotionTick = false;
            if (receipt.ropeReleased === true) {
                this.ownerRuntime?.releaseOwnerRope(receipt.ropeAttachmentId ?? null);
            }
        } else {
            this.networkMetrics.rejectedOwnerMotions += 1;
            if (receipt.reason === "tick-window" && !this.recoveringOwnerMotionTick) {
                this.recoveringOwnerMotionTick = true;
                this.reconcile();
                this.reanchorTickProjection();
                this.submitOwnerMotion();
            }
        }
        return true;
    }

    snapshot() {
        return {
            state: this.buffer.sample({ now: this.now(), localPlayerId: this.playerId }),
            predicted: this.ownerRuntime?.presentationState() ?? null,
            owner: this.ownerRuntime?.state() ?? null,
            ownerAugmentReward: this.ownerRuntime?.augmentReward() ?? null,
            serverTick: this.latestSnapshot?.serverTick ?? null,
            connected: !this.closed
        };
    }

    drainEvents() {
        return Object.freeze(
            this.buffer.drainEvents().filter((event) => {
                if (
                    event.eventType === "player-fall-damaged" &&
                    event.impactId &&
                    this.locallyPredictedFallImpactIds.delete(event.impactId)
                ) {
                    return false;
                }
                if (
                    event.parameters?.sourceKind === PLAYER_IMPACT_SOURCE_KIND.HARDPOINT_JAMMER &&
                    this.locallyPredictedJammerImpactIds.delete(event.objectId)
                ) {
                    return false;
                }
                const predictionId =
                    event.parameters?.sourceKind === "rope-impact" ? event.parameters.predictionId : null;
                const augmentEventId =
                    event.parameters?.sourceKind === "augment-impact" ? event.parameters.eventId : null;
                if (augmentEventId && this.locallyPredictedAugmentImpactIds.delete(augmentEventId)) return false;
                if (!predictionId || !this.locallyPredictedRopeImpactIds.delete(predictionId)) return true;
                const predictedResolution = this.predictedRopeImpactResolutions.get(predictionId);
                this.predictedRopeImpactResolutions.delete(predictionId);
                return predictedResolution !== event.resolution;
            })
        );
    }

    drainPredictedEvents() {
        return this.ownerRuntime?.drainPredictedEvents() ?? Object.freeze([]);
    }

    drainRopeImpactReceipts() {
        const receipts = Object.freeze([...this.ropeImpactReceipts]);
        this.ropeImpactReceipts.length = 0;
        return receipts;
    }

    drainAugmentImpactReceipts() {
        const receipts = Object.freeze([...this.augmentImpactReceipts]);
        this.augmentImpactReceipts.length = 0;
        return receipts;
    }

    recordAugmentImpactReceipt(receipt) {
        this.augmentImpactReceipts.push(receipt);
        if (this.augmentImpactReceipts.length > MAX_TRACKED_COMMANDS) this.augmentImpactReceipts.shift();
        const pending = this.pendingAugmentImpactClaims.get(receipt.eventId);
        if (receipt.accepted) {
            this.pendingAugmentImpactClaims.delete(receipt.eventId);
            return true;
        }
        if (receipt.reason === "tick-window" && pending && !pending.retried) {
            this.reconcile();
            this.reanchorTickProjection();
            const retry = createAugmentImpactClaim({
                ...pending.claim,
                authorityTick: this.tickProjection.project(this.ownerRuntime.state().tick)
            });
            this.pendingAugmentImpactClaims.set(receipt.eventId, { claim: retry, retried: true });
            this.submitOwnerMotion();
            return this.sendAugmentImpactClaim(retry);
        }
        this.pendingAugmentImpactClaims.delete(receipt.eventId);
        this.locallyPredictedAugmentImpactIds.delete(receipt.eventId);
        return true;
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
