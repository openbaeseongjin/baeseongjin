import { AuthorityCommandInbox } from "../network/AuthorityCommandInbox.js";
import { COMBAT_CONFIG } from "../config.js";
import { createAugmentImpactReceipt } from "../network/AugmentImpactClaim.js";
import { createCheckpointClaimReceipt } from "../network/CheckpointClaim.js";
import { createCommandReceipt } from "../network/CommandReceipt.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { createOwnerMotionReceipt } from "../network/OwnerMotionState.js";
import { createPlayerImpactReceipt } from "../network/PlayerImpactClaim.js";
import { createPlayerProjectileSpawnReceipt } from "../network/PlayerProjectileSpawnClaim.js";
import { createProjectileHitReceipt } from "../network/ProjectileHitClaim.js";
import { createRopeImpactReceipt } from "../network/RopeImpactClaim.js";
import { createSummitClaimReceipt } from "../network/SummitClaim.js";
import { buildAuthoritySnapshot } from "./AuthoritySnapshotBuilder.js";

function assertPositive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive`);
    return value;
}

function assertPositiveInteger(value, label) {
    if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${label} must be a positive safe integer`);
    return value;
}

function impactRecoveryKey(playerId, impactId) {
    return `${playerId}\u0000${impactId}`;
}

export class AuthorityServerSession {
    constructor({
        simulation,
        fixedDt = 1 / 120,
        snapshotIntervalTicks = 6,
        maxPastTicks = 2,
        maxFutureTicks = MULTIPLAYER_TIMING.maxFutureTicks
    }) {
        if (!simulation) throw new Error("simulation is required");
        this.simulation = simulation;
        this.fixedDt = assertPositive(fixedDt, "fixedDt");
        this.snapshotIntervalTicks = assertPositiveInteger(snapshotIntervalTicks, "snapshotIntervalTicks");
        this.inbox = new AuthorityCommandInbox({ maxPastTicks, maxFutureTicks });
        this.resolvedHitClaims = new Map();
        this.resolvedProjectileSpawnClaims = new Map();
        this.resolvedImpactClaims = new Map();
        this.pendingImpactRecoveries = new Map();
        this.resolvedAugmentSelections = new Map();
        this.resolvedRopeImpactClaims = new Map();
        this.resolvedAugmentImpactClaims = new Map();
        this.resolvedCheckpointClaims = new Map();
        this.resolvedSummitClaim = null;
        this.lastOwnerMotionTicks = new Map();
        this.lastOwnerMotionClientTicks = new Map();
        this.pendingDebugTransitionIds = new Map();
        this.nextImpactRecoverySequence = 0;
        this.nextSnapshotSequence = 0;
    }

    submitHitClaim(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const existing = this.resolvedHitClaims.get(claim.predictionId);
        if (existing) return existing.receipt;
        if (!this.resolvedProjectileSpawnClaims.has(claim.predictionId)) {
            return createProjectileHitReceipt({
                predictionId: claim.predictionId,
                accepted: false,
                reason: "spawn-not-authorized"
            });
        }
        const minimumTick =
            this.simulation.getTick() - Math.round(COMBAT_CONFIG.playerProjectileLifetimeSeconds / this.fixedDt);
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.inputLeadTicks;
        if (claim.authorityTick < minimumTick || claim.authorityTick > maximumTick) {
            return createProjectileHitReceipt({
                predictionId: claim.predictionId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const result = createProjectileHitReceipt({
            predictionId: claim.predictionId,
            ...this.simulation.resolvePlayerProjectileClaim(authenticatedPlayerId, claim)
        });
        if (result.accepted) {
            this.resolvedHitClaims.set(claim.predictionId, {
                receipt: result,
                resolvedAtTick: this.simulation.getTick()
            });
        }
        return result;
    }

    submitProjectileSpawnClaim(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const existing = this.resolvedProjectileSpawnClaims.get(claim.predictionId);
        if (existing) return existing.receipt;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.inputLeadTicks;
        if (claim.authorityTick < minimumTick || claim.authorityTick > maximumTick) {
            return createPlayerProjectileSpawnReceipt({
                predictionId: claim.predictionId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = createPlayerProjectileSpawnReceipt({
            predictionId: claim.predictionId,
            ...this.simulation.resolvePlayerProjectileSpawnClaim(authenticatedPlayerId, claim)
        });
        if (receipt.accepted) {
            this.resolvedProjectileSpawnClaims.set(claim.predictionId, {
                receipt,
                resolvedAtTick: this.simulation.getTick()
            });
        }
        return receipt;
    }

    submitImpactClaim(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        if (!claim.outcome) throw new Error("victim impact outcome is required");
        const existing = this.resolvedImpactClaims.get(claim.impactId);
        if (existing) return existing.receipt;
        const recoveryKey = impactRecoveryKey(authenticatedPlayerId, claim.impactId);
        const pendingRecovery = this.pendingImpactRecoveries.get(recoveryKey);
        if (claim.outcome.state) {
            if (!pendingRecovery || pendingRecovery.recoveryId !== claim.outcome.recoveryId) {
                return createPlayerImpactReceipt({
                    impactId: claim.impactId,
                    accepted: false,
                    reason: "recovery-not-requested"
                });
            }
            if (claim.outcome.state.id !== authenticatedPlayerId) {
                return createPlayerImpactReceipt({
                    impactId: claim.impactId,
                    accepted: false,
                    reason: "recovery-player-mismatch"
                });
            }
            const previousOwnerTick = this.lastOwnerMotionClientTicks.get(authenticatedPlayerId) ?? -1;
            if (claim.outcome.stateTick < previousOwnerTick) {
                return createPlayerImpactReceipt({
                    impactId: claim.impactId,
                    accepted: false,
                    reason: "stale-recovery-state"
                });
            }
            if (claim.authorityTick > this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks) {
                return createPlayerImpactReceipt({
                    impactId: claim.impactId,
                    accepted: false,
                    reason: "recovery-tick-window"
                });
            }
            const recoveryResult = createPlayerImpactReceipt({
                impactId: claim.impactId,
                ...this.simulation.resolvePlayerImpactRecovery(authenticatedPlayerId, claim)
            });
            if (recoveryResult.accepted) {
                this.lastOwnerMotionTicks.set(authenticatedPlayerId, claim.authorityTick);
                this.lastOwnerMotionClientTicks.set(authenticatedPlayerId, claim.outcome.stateTick);
                this.pendingImpactRecoveries.delete(recoveryKey);
                this.resolvedImpactClaims.set(claim.impactId, {
                    receipt: recoveryResult,
                    resolvedAtTick: this.simulation.getTick()
                });
            }
            return recoveryResult;
        }
        if (pendingRecovery) return pendingRecovery.receipt;

        const simulationResult = this.simulation.resolvePlayerImpactClaim(authenticatedPlayerId, claim);
        if (!simulationResult.accepted && simulationResult.reason === "recovery-required") {
            this.nextImpactRecoverySequence += 1;
            const recoveryId = `impact-recovery:${this.nextImpactRecoverySequence}`;
            const receipt = createPlayerImpactReceipt({
                impactId: claim.impactId,
                accepted: true,
                resolution: "recovery-required",
                recoveryId
            });
            this.pendingImpactRecoveries.set(recoveryKey, {
                recoveryId,
                receipt,
                issuedAtTick: this.simulation.getTick()
            });
            return receipt;
        }
        const result = createPlayerImpactReceipt({ impactId: claim.impactId, ...simulationResult });
        if (result.accepted) {
            this.resolvedImpactClaims.set(claim.impactId, {
                receipt: result,
                resolvedAtTick: this.simulation.getTick()
            });
        }
        return result;
    }

    submitAugmentSelection(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const selectionKey = `${authenticatedPlayerId}:${claim.sourceId}`;
        const existing = this.resolvedAugmentSelections.get(selectionKey);
        if (existing) {
            if (existing.augmentId === claim.augmentId) return existing;
            return Object.freeze({
                sourceId: claim.sourceId,
                augmentId: claim.augmentId,
                accepted: false,
                reason: "selection-conflict"
            });
        }
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks;
        if (claim.authorityTick < minimumTick || claim.authorityTick > maximumTick) {
            return Object.freeze({
                sourceId: claim.sourceId,
                augmentId: claim.augmentId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = Object.freeze({
            sourceId: claim.sourceId,
            augmentId: claim.augmentId,
            ...this.simulation.resolveAugmentSelection(authenticatedPlayerId, claim, {
                requireOpenReward: false
            })
        });
        if (receipt.accepted) this.resolvedAugmentSelections.set(selectionKey, receipt);
        return receipt;
    }

    submitRopeImpact(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const existing = this.resolvedRopeImpactClaims.get(claim.predictionId);
        if (existing) return existing.receipt;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.inputLeadTicks;
        if (claim.authorityTick < minimumTick || claim.authorityTick > maximumTick) {
            return createRopeImpactReceipt({
                predictionId: claim.predictionId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = createRopeImpactReceipt({
            predictionId: claim.predictionId,
            ...this.simulation.resolveRopeImpactClaim(authenticatedPlayerId, claim)
        });
        this.resolvedRopeImpactClaims.set(claim.predictionId, {
            receipt,
            resolvedAtTick: this.simulation.getTick()
        });
        return receipt;
    }

    submitAugmentImpact(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const claimKey = `${authenticatedPlayerId}\u0000${claim.eventId}`;
        const existing = this.resolvedAugmentImpactClaims.get(claimKey);
        if (existing) return existing.receipt;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.inputLeadTicks;
        const simulationResult =
            claim.authorityTick < minimumTick || claim.authorityTick > maximumTick
                ? Object.freeze({ accepted: false, reason: "tick-window" })
                : this.simulation.resolveAugmentImpactClaim(authenticatedPlayerId, claim, {
                      positionTolerance: MULTIPLAYER_TIMING.hitClaimPositionTolerance
                  });
        const acceptedResolution =
            simulationResult.resolution === "late-dead-noop"
                ? "target-already-dead"
                : simulationResult.resolution === "shield-blocked"
                  ? "shield-blocked"
                  : "applied";
        const receipt = createAugmentImpactReceipt({
            eventId: claim.eventId,
            predictionId: claim.predictionId,
            accepted: simulationResult.accepted,
            ...(simulationResult.accepted
                ? { resolution: acceptedResolution }
                : {
                      reason:
                          simulationResult.reason === "target-missing" || simulationResult.reason === "tick-window"
                              ? simulationResult.reason
                              : "invalid"
                  }),
            damage: simulationResult.damage ?? 0,
            knockbackApplied: simulationResult.knockbackApplied === true
        });
        if (receipt.accepted || receipt.reason !== "tick-window") {
            this.resolvedAugmentImpactClaims.set(claimKey, {
                receipt,
                resolvedAtTick: this.simulation.getTick()
            });
        }
        return receipt;
    }

    submitCheckpointClaim(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const existing = this.resolvedCheckpointClaims.get(claim.checkpointId);
        if (existing) return existing;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks;
        if (claim.authorityTick < minimumTick || claim.authorityTick > maximumTick) {
            return createCheckpointClaimReceipt({
                checkpointId: claim.checkpointId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = createCheckpointClaimReceipt({
            checkpointId: claim.checkpointId,
            ...this.simulation.resolveCheckpointClaim(authenticatedPlayerId, claim, {
                positionTolerance: MULTIPLAYER_TIMING.hitClaimPositionTolerance
            })
        });
        if (receipt.accepted) this.resolvedCheckpointClaims.set(claim.checkpointId, receipt);
        return receipt;
    }

    submitSummitClaim(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        if (this.resolvedSummitClaim) return this.resolvedSummitClaim;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks;
        if (claim.authorityTick < minimumTick || claim.authorityTick > maximumTick) {
            return createSummitClaimReceipt({ accepted: false, reason: "tick-window" });
        }
        const receipt = createSummitClaimReceipt(
            this.simulation.resolveSummitClaim(authenticatedPlayerId, claim, {
                positionTolerance: MULTIPLAYER_TIMING.hitClaimPositionTolerance
            })
        );
        if (receipt.accepted) this.resolvedSummitClaim = receipt;
        return receipt;
    }

    debugTeleport(authenticatedPlayerId, areaId) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        if (typeof areaId !== "string" || areaId.length === 0) {
            return Object.freeze({ accepted: false, reason: "invalid-area" });
        }
        const outcome = this.simulation.debugTeleportPlayer(authenticatedPlayerId, areaId);
        if (!outcome) return Object.freeze({ accepted: false, reason: "unknown-area" });
        for (const relocation of outcome.relocations) {
            const event = this.simulation.recordReplicationEvent("debug-teleported", relocation);
            this.pendingDebugTransitionIds.set(relocation.playerId, event.eventId);
        }
        return Object.freeze({ accepted: true, areaId, position: outcome.position });
    }

    submitOwnerMotion(authenticatedPlayerId, state) {
        const player = this.simulation.playerState(authenticatedPlayerId);
        if (!player) throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        const previousTick = this.lastOwnerMotionClientTicks.get(authenticatedPlayerId) ?? -1;
        if (state.clientTick <= previousTick) {
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "ignored-stale"
            });
        }
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks;
        if (state.authorityTick < minimumTick || state.authorityTick > maximumTick) {
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: false,
                reason: "tick-window"
            });
        }
        if (this.simulation.runState !== "playing") {
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "ignored-run-inactive"
            });
        }
        if (player.lifeState !== "active") {
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "ignored-player-ineligible"
            });
        }
        const pendingDebugTransitionId = this.pendingDebugTransitionIds.get(authenticatedPlayerId);
        if (pendingDebugTransitionId && state.debugTransitionId !== pendingDebugTransitionId) {
            this.lastOwnerMotionTicks.set(authenticatedPlayerId, state.authorityTick);
            this.lastOwnerMotionClientTicks.set(authenticatedPlayerId, state.clientTick);
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "ignored-debug-transition"
            });
        }
        if (pendingDebugTransitionId) this.pendingDebugTransitionIds.delete(authenticatedPlayerId);
        if (state.position.y > this.simulation.fallRecoveryY(authenticatedPlayerId)) {
            this.simulation.resolvePlayerFall(authenticatedPlayerId);
            this.lastOwnerMotionTicks.set(authenticatedPlayerId, state.authorityTick);
            this.lastOwnerMotionClientTicks.set(authenticatedPlayerId, state.clientTick);
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "player-fell"
            });
        }
        const motion = this.simulation.applyOwnerMotion(authenticatedPlayerId, state);
        this.lastOwnerMotionTicks.set(authenticatedPlayerId, state.authorityTick);
        this.lastOwnerMotionClientTicks.set(authenticatedPlayerId, state.clientTick);
        return createOwnerMotionReceipt({
            clientTick: state.clientTick,
            accepted: true,
            ...(motion.ropeReleased
                ? {
                      resolution: motion.reason,
                      ropeReleased: true,
                      ropeAttachmentId: motion.ropeAttachmentId
                  }
                : {})
        });
    }

    submit(authenticatedPlayerId, batch) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        if (batch.tick <= this.simulation.getTick()) {
            return createCommandReceipt({
                serverTick: this.simulation.getTick(),
                targetTick: batch.tick,
                accepted: Object.freeze([]),
                rejected: Object.freeze(
                    batch.commands.map(({ playerId, sequence }) =>
                        Object.freeze({ playerId, sequence, reason: "elapsed-tick" })
                    )
                )
            });
        }
        const foreignEntries = batch.commands.filter(({ playerId }) => playerId !== authenticatedPlayerId);
        if (foreignEntries.length > 0) {
            return createCommandReceipt({
                serverTick: this.simulation.getTick(),
                targetTick: batch.tick,
                accepted: Object.freeze([]),
                rejected: Object.freeze(
                    batch.commands.map(({ playerId, sequence }) =>
                        Object.freeze({ playerId, sequence, reason: "player-ownership" })
                    )
                )
            });
        }
        const result = this.inbox.ingest(batch, this.simulation.getTick());
        return createCommandReceipt({
            serverTick: this.simulation.getTick(),
            targetTick: batch.tick,
            accepted: result.accepted,
            rejected: result.rejected
        });
    }

    advance() {
        const nextTick = this.simulation.getTick() + 1;
        const commands = this.inbox.take(nextTick);
        this.simulation.stepCommandBatch(this.fixedDt, commands, {
            recoverPlayerFalls: false,
            resolveCheckpointProgress: false,
            resolveSummitProgress: false,
            resolvePlayerProjectileHits: false,
            spawnPlayerProjectiles: false,
            recoverPlayerDeaths: false,
            advanceInputDrivenObjects: false
        });
        for (const playerId of this.simulation.playerIds()) {
            const portalTick = this.simulation.portalTransitionTick(playerId);
            const previousTick = this.lastOwnerMotionTicks.get(playerId) ?? -1;
            if (portalTick !== null && portalTick > previousTick) {
                this.lastOwnerMotionTicks.set(playerId, portalTick);
            }
        }
        const oldestRememberedTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        for (const [predictionId, entry] of this.resolvedHitClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) this.resolvedHitClaims.delete(predictionId);
        }
        const oldestPlayerProjectileTick =
            this.simulation.getTick() - Math.round(COMBAT_CONFIG.playerProjectileLifetimeSeconds / this.fixedDt);
        for (const [predictionId, entry] of this.resolvedProjectileSpawnClaims) {
            if (entry.resolvedAtTick < oldestPlayerProjectileTick) {
                this.resolvedProjectileSpawnClaims.delete(predictionId);
            }
        }
        for (const [predictionId, entry] of this.resolvedRopeImpactClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) {
                this.resolvedRopeImpactClaims.delete(predictionId);
            }
        }
        for (const [claimKey, entry] of this.resolvedAugmentImpactClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) this.resolvedAugmentImpactClaims.delete(claimKey);
        }
        for (const [impactId, entry] of this.resolvedImpactClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) this.resolvedImpactClaims.delete(impactId);
        }
        const oldestRecoveryTick = this.simulation.getTick() - MULTIPLAYER_TIMING.impactRecoveryRetentionTicks;
        for (const [key, entry] of this.pendingImpactRecoveries) {
            if (entry.issuedAtTick < oldestRecoveryTick) this.pendingImpactRecoveries.delete(key);
        }
        return nextTick % this.snapshotIntervalTicks === 0 ? this.snapshot() : null;
    }

    snapshot({ includeActivePredictableObjects = false } = {}) {
        const snapshot = buildAuthoritySnapshot({
            simulation: this.simulation,
            acknowledgements: this.inbox.acknowledgements(),
            ownerMotionTicks: Object.fromEntries(this.lastOwnerMotionTicks),
            includeActivePredictableObjects,
            snapshotSequence: this.nextSnapshotSequence
        });
        this.nextSnapshotSequence += 1;
        return snapshot;
    }

    removePlayer(playerId) {
        this.inbox.removePlayer(playerId);
        this.lastOwnerMotionTicks.delete(playerId);
        this.lastOwnerMotionClientTicks.delete(playerId);
        this.pendingDebugTransitionIds.delete(playerId);
        for (const key of this.pendingImpactRecoveries.keys()) {
            if (key.startsWith(`${playerId}\u0000`)) this.pendingImpactRecoveries.delete(key);
        }
        for (const selectionKey of this.resolvedAugmentSelections.keys()) {
            if (selectionKey.startsWith(`${playerId}:`)) this.resolvedAugmentSelections.delete(selectionKey);
        }
        for (const predictionId of this.resolvedRopeImpactClaims.keys()) {
            if (predictionId.startsWith(`${playerId}:`)) this.resolvedRopeImpactClaims.delete(predictionId);
        }
        for (const claimKey of this.resolvedAugmentImpactClaims.keys()) {
            if (claimKey.startsWith(`${playerId}\u0000`)) this.resolvedAugmentImpactClaims.delete(claimKey);
        }
        for (const predictionId of this.resolvedProjectileSpawnClaims.keys()) {
            if (predictionId.startsWith(`${playerId}:`)) this.resolvedProjectileSpawnClaims.delete(predictionId);
        }
        return this.simulation.removePlayer(playerId);
    }
}
