import { AuthorityCommandInbox } from "../network/AuthorityCommandInbox.js";
import { WORLD_CONFIG } from "../config.js";
import { createCheckpointClaimReceipt } from "../network/CheckpointClaim.js";
import { createCommandReceipt } from "../network/CommandReceipt.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { createOwnerMotionReceipt } from "../network/OwnerMotionState.js";
import { createPlayerImpactReceipt } from "../network/PlayerImpactClaim.js";
import { createPlayerProjectileSpawnReceipt } from "../network/PlayerProjectileSpawnClaim.js";
import { createProjectileHitReceipt } from "../network/ProjectileHitClaim.js";
import { createRopeSwingReceipt } from "../network/RopeSwingClaim.js";
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
        this.resolvedRopeSwingClaims = new Map();
        this.resolvedImpactClaims = new Map();
        this.resolvedArtifactSelections = new Map();
        this.resolvedCheckpointClaims = new Map();
        this.resolvedSummitClaim = null;
        this.lastOwnerMotionTicks = new Map();
        this.lastOwnerRopeTicks = new Map();
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
            ...this.simulation.resolvePlayerProjectileSpawnClaim(authenticatedPlayerId, claim, {
                positionTolerance: MULTIPLAYER_TIMING.hitClaimPositionTolerance
            })
        });
        if (receipt.accepted) {
            this.resolvedProjectileSpawnClaims.set(claim.predictionId, {
                receipt,
                resolvedAtTick: this.simulation.getTick()
            });
        }
        return receipt;
    }

    submitRopeSwingClaim(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const existing = this.resolvedRopeSwingClaims.get(claim.predictionId);
        if (existing) return existing.receipt;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.inputLeadTicks;
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
            return createRopeSwingReceipt({
                predictionId: claim.predictionId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = createRopeSwingReceipt({
            predictionId: claim.predictionId,
            ...this.simulation.resolveRopeSwingClaim(authenticatedPlayerId, claim, {
                positionTolerance: MULTIPLAYER_TIMING.hitClaimPositionTolerance
            })
        });
        if (receipt.accepted) {
            this.resolvedRopeSwingClaims.set(claim.predictionId, {
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
        const existing = this.resolvedImpactClaims.get(claim.projectileId);
        if (existing) return existing.receipt;
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.inputLeadTicks;
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
            return createPlayerImpactReceipt({
                projectileId: claim.projectileId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const result = createPlayerImpactReceipt({
            projectileId: claim.projectileId,
            ...this.simulation.resolveEnemyProjectileClaim(authenticatedPlayerId, claim)
        });
        if (result.accepted) {
            this.resolvedImpactClaims.set(claim.projectileId, {
                receipt: result,
                resolvedAtTick: this.simulation.getTick()
            });
        }
        return result;
    }

    submitArtifactSelection(authenticatedPlayerId, claim) {
        if (!this.simulation.hasPlayer(authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const selectionKey = `${authenticatedPlayerId}:${claim.checkpointId}`;
        const existing = this.resolvedArtifactSelections.get(selectionKey);
        if (existing) {
            if (existing.artifactId === claim.artifactId) return existing;
            return Object.freeze({
                checkpointId: claim.checkpointId,
                artifactId: claim.artifactId,
                accepted: false,
                reason: "selection-conflict"
            });
        }
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks;
        if (claim.clientTick < minimumTick || claim.clientTick > maximumTick) {
            return Object.freeze({
                checkpointId: claim.checkpointId,
                artifactId: claim.artifactId,
                accepted: false,
                reason: "tick-window"
            });
        }
        const receipt = Object.freeze({
            checkpointId: claim.checkpointId,
            artifactId: claim.artifactId,
            ...this.simulation.resolveArtifactSelection(authenticatedPlayerId, claim)
        });
        if (receipt.accepted) this.resolvedArtifactSelections.set(selectionKey, receipt);
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

    submitOwnerMotion(authenticatedPlayerId, state) {
        const player = this.simulation.playerState(authenticatedPlayerId);
        if (!player) throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        const previousTick = this.lastOwnerMotionTicks.get(authenticatedPlayerId) ?? -1;
        if (state.clientTick <= previousTick) {
            return createOwnerMotionReceipt({ clientTick: state.clientTick, accepted: false, reason: "stale-tick" });
        }
        const minimumTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        const maximumTick = this.simulation.getTick() + MULTIPLAYER_TIMING.maxFutureTicks;
        if (state.clientTick < minimumTick || state.clientTick > maximumTick) {
            return createOwnerMotionReceipt({ clientTick: state.clientTick, accepted: false, reason: "tick-window" });
        }
        if (this.simulation.runState !== "playing") {
            return createOwnerMotionReceipt({ clientTick: state.clientTick, accepted: false, reason: "run-inactive" });
        }
        const previousRopeTick = this.lastOwnerRopeTicks.get(authenticatedPlayerId) ?? -1;
        const ropeReleased = !state.rope.isAttached && state.clientTick > previousRopeTick && player.rope.isAttached;
        if (!state.rope.isAttached && state.clientTick > previousRopeTick) {
            this.simulation.releasePlayerRope(authenticatedPlayerId);
            this.lastOwnerRopeTicks.set(authenticatedPlayerId, state.clientTick);
        }
        const reject = (reason) =>
            createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: false,
                reason,
                ...(ropeReleased ? { ropeReleased: true } : {})
            });
        if (player.lifeState !== "active") {
            return reject("player-ineligible");
        }
        if (state.position.y > WORLD_CONFIG.floorY + 780) {
            this.simulation.resolvePlayerFall(authenticatedPlayerId);
            this.lastOwnerMotionTicks.set(authenticatedPlayerId, state.clientTick);
            return createOwnerMotionReceipt({
                clientTick: state.clientTick,
                accepted: true,
                resolution: "player-fell",
                ...(ropeReleased ? { ropeReleased: true } : {})
            });
        }
        const reportedSpeed = Math.hypot(state.velocity.x, state.velocity.y);
        if (reportedSpeed > MULTIPLAYER_TIMING.ownerMotionMaxSpeed) {
            return reject("speed-envelope");
        }
        const tickDelta = Math.max(1, state.clientTick - Math.max(previousTick, this.simulation.getTick()));
        const distance = Math.hypot(state.position.x - player.position.x, state.position.y - player.position.y);
        const maximumDistance =
            MULTIPLAYER_TIMING.ownerMotionBaseTolerance + (Math.max(900, reportedSpeed) * tickDelta) / 120;
        if (distance > maximumDistance) {
            return reject("movement-envelope");
        }
        const synchronizeRope = state.clientTick > previousRopeTick;
        this.simulation.applyOwnerMotion(authenticatedPlayerId, state, { synchronizeRope });
        if (synchronizeRope) this.lastOwnerRopeTicks.set(authenticatedPlayerId, state.clientTick);
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
            resolveArtifactSelections: false,
            advanceInputDrivenObjects: false
        });
        const oldestRememberedTick = this.simulation.getTick() - MULTIPLAYER_TIMING.maxHitClaimPastTicks;
        for (const [predictionId, entry] of this.resolvedHitClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) this.resolvedHitClaims.delete(predictionId);
        }
        for (const [predictionId, entry] of this.resolvedProjectileSpawnClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) {
                this.resolvedProjectileSpawnClaims.delete(predictionId);
            }
        }
        for (const [predictionId, entry] of this.resolvedRopeSwingClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) this.resolvedRopeSwingClaims.delete(predictionId);
        }
        for (const [projectileId, entry] of this.resolvedImpactClaims) {
            if (entry.resolvedAtTick < oldestRememberedTick) this.resolvedImpactClaims.delete(projectileId);
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
        this.lastOwnerRopeTicks.delete(playerId);
        for (const selectionKey of this.resolvedArtifactSelections.keys()) {
            if (selectionKey.startsWith(`${playerId}:`)) this.resolvedArtifactSelections.delete(selectionKey);
        }
        for (const predictionId of this.resolvedProjectileSpawnClaims.keys()) {
            if (predictionId.startsWith(`${playerId}:`)) this.resolvedProjectileSpawnClaims.delete(predictionId);
        }
        for (const predictionId of this.resolvedRopeSwingClaims.keys()) {
            if (predictionId.startsWith(`${playerId}:`)) this.resolvedRopeSwingClaims.delete(predictionId);
        }
        return this.simulation.removePlayer(playerId);
    }
}
