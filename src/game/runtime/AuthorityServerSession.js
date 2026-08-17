import { AuthorityCommandInbox } from "../network/AuthorityCommandInbox.js";
import { WORLD_CONFIG } from "../config.js";
import { createCheckpointClaimReceipt } from "../network/CheckpointClaim.js";
import { createCommandReceipt } from "../network/CommandReceipt.js";
import { createFoundationShearReceipt } from "../network/FoundationShearClaim.js";
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
        this.resolvedFoundationSelections = new Map();
        this.resolvedFoundationShearClaims = new Map();
        this.resolvedRopeImpactClaims = new Map();
        this.resolvedCheckpointClaims = new Map();
        this.resolvedSummitClaim = null;
        this.lastOwnerMotionTicks = new Map();
        this.nextImpactRecoverySequence = 0;
        this.nextSnapshotSequence = 0;
    }

    submitHitClaim(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const existing = this.resolvedHitClaims.get(claim.predictionId);
        if (existing) return existing.receipt;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.inputLeadTicks;
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
            return createProjectileHitReceipt({
                predictionId: claim.predictionId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const result = createProjectileHitReceipt({
            predictionId: claim.predictionId,
            ...this.simulation.resolvePlayerProjectileClaim(authenticatedPlayerId, claim, {
                positionTolerance: MULTIPLAYER_TIMING.hitClaimPositionTolerance
            })
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
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
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
            const previousOwnerTick = this.lastOwnerMotionTicks.get(authenticatedPlayerId) ?? -1;
            if (claim.outcome.stateTick < previousOwnerTick) {
                return createPlayerImpactReceipt({
                    impactId: claim.impactId,
                    accepted: false,
                    reason: "stale-recovery-state"
                });
            }
            if (claim.outcome.stateTick > this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks) {
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
                this.lastOwnerMotionTicks.set(authenticatedPlayerId, claim.outcome.stateTick);
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
        if (!simulationResult.accepted && simulationResult.reason === "state-diverged") {
            this.nextImpactRecoverySequence += 1;
            const recoveryId = `impact-recovery:${this.nextImpactRecoverySequence}`;
            const receipt = createPlayerImpactReceipt({
                impactId: claim.impactId,
                accepted: false,
                reason: "state-diverged",
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

    submitFoundationSelection(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const selectionKey = `${authenticatedPlayerId}:${claim.sourceId}`;
        const existing = this.resolvedFoundationSelections.get(selectionKey);
        if (existing) {
            if (existing.foundationId === claim.foundationId) return existing;
            return Object.freeze({
                sourceId: claim.sourceId,
                foundationId: claim.foundationId,
                accepted: false,
                reason: "selection-conflict"
            });
        }
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks;
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
            return Object.freeze({
                sourceId: claim.sourceId,
                foundationId: claim.foundationId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = Object.freeze({
            sourceId: claim.sourceId,
            foundationId: claim.foundationId,
            ...this.simulation.resolveFoundationSelection(authenticatedPlayerId, claim, {
                requireOpenReward: false
            })
        });
        if (receipt.accepted) this.resolvedFoundationSelections.set(selectionKey, receipt);
        return receipt;
    }

    submitFoundationShear(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const existing = this.resolvedFoundationShearClaims.get(claim.predictionId);
        if (existing) return existing.receipt;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.inputLeadTicks;
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
            return createFoundationShearReceipt({
                predictionId: claim.predictionId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = createFoundationShearReceipt({
            predictionId: claim.predictionId,
            ...this.simulation.resolveFoundationShearClaim(authenticatedPlayerId, claim, {
                positionTolerance: MULTIPLAYER_TIMING.hitClaimPositionTolerance
            })
        });
        if (receipt.accepted) {
            this.resolvedFoundationShearClaims.set(claim.predictionId, {
                receipt,
                resolvedAtTick: this.simulation.getTick()
            });
        }
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
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
            return createRopeImpactReceipt({
                predictionId: claim.predictionId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = createRopeImpactReceipt({
            predictionId: claim.predictionId,
            ...this.simulation.resolveRopeImpactClaim(authenticatedPlayerId, claim, {
                positionTolerance: MULTIPLAYER_TIMING.hitClaimPositionTolerance
            })
        });
        if (receipt.accepted) {
            this.resolvedRopeImpactClaims.set(claim.predictionId, {
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
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
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
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
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
        const position = this.simulation.debugTeleportPlayer(authenticatedPlayerId, areaId);
        if (!position) return Object.freeze({ accepted: false, reason: "unknown-area" });
        this.simulation.recordReplicationEvent("debug-teleported", {
            playerId: authenticatedPlayerId,
            areaId,
            position: Object.freeze({ ...position }),
            tick: this.simulation.getTick()
        });
        return Object.freeze({ accepted: true, areaId, position: Object.freeze({ ...position }) });
    }

    submitOwnerMotion(authenticatedPlayerId, state) {
        const player = this.simulation.playerState(authenticatedPlayerId);
        if (!player) throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        const previousTick = this.lastOwnerMotionTicks.get(authenticatedPlayerId) ?? -1;
        if (state.clientTick <= previousTick) {
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "ignored-stale"
            });
        }
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks;
        if (state.clientTick < minimumTick || state.clientTick > maximumTick) {
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "ignored-tick-window"
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
        if (state.position.y > WORLD_CONFIG.floorY + 780) {
            this.simulation.resolvePlayerFall(authenticatedPlayerId);
            this.lastOwnerMotionTicks.set(authenticatedPlayerId, state.clientTick);
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "player-fell"
            });
        }
        this.simulation.applyOwnerMotion(authenticatedPlayerId, state);
        this.lastOwnerMotionTicks.set(authenticatedPlayerId, state.clientTick);
        return createOwnerMotionReceipt({ clientTick: state.clientTick, accepted: true });
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
            advanceInputDrivenObjects: false,
            resolveInteractChoice: false
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
        for (const [predictionId, entry] of this.resolvedProjectileSpawnClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) {
                this.resolvedProjectileSpawnClaims.delete(predictionId);
            }
        }
        for (const [predictionId, entry] of this.resolvedFoundationShearClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) {
                this.resolvedFoundationShearClaims.delete(predictionId);
            }
        }
        for (const [predictionId, entry] of this.resolvedRopeImpactClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) {
                this.resolvedRopeImpactClaims.delete(predictionId);
            }
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
        for (const key of this.pendingImpactRecoveries.keys()) {
            if (key.startsWith(`${playerId}\u0000`)) this.pendingImpactRecoveries.delete(key);
        }
        for (const selectionKey of this.resolvedFoundationSelections.keys()) {
            if (selectionKey.startsWith(`${playerId}:`)) this.resolvedFoundationSelections.delete(selectionKey);
        }
        for (const predictionId of this.resolvedFoundationShearClaims.keys()) {
            if (predictionId.startsWith(`${playerId}:`)) this.resolvedFoundationShearClaims.delete(predictionId);
        }
        for (const predictionId of this.resolvedRopeImpactClaims.keys()) {
            if (predictionId.startsWith(`${playerId}:`)) this.resolvedRopeImpactClaims.delete(predictionId);
        }
        for (const predictionId of this.resolvedProjectileSpawnClaims.keys()) {
            if (predictionId.startsWith(`${playerId}:`)) this.resolvedProjectileSpawnClaims.delete(predictionId);
        }
        return this.simulation.removePlayer(playerId);
    }
}
