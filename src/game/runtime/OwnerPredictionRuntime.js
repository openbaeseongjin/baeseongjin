import { COMBAT_CONFIG } from "../config.js";
import { InputStateSimulator } from "../network/InputStateSimulator.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";
import { GameSimulation } from "../simulation/GameSimulation.js";

function percentile(samples, ratio) {
    if (samples.length === 0) return 0;
    const sorted = [...samples].sort((left, right) => left - right);
    return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
}

function copyPredictedImpact(event) {
    return Object.freeze({
        ...event,
        ...(event.position ? { position: Object.freeze({ ...event.position }) } : {}),
        ...(event.velocity ? { velocity: Object.freeze({ ...event.velocity }) } : {}),
        ...(event.parameters ? { parameters: Object.freeze({ ...event.parameters }) } : {})
    });
}

function rebaseLaterTimerPredictions(entries, rejected, fixedDt, previousValueKey, appliedValueKey) {
    const later = [...entries].filter(({ tick }) => tick > rejected.tick).sort((left, right) => left.tick - right.tick);
    if (later.length === 0) return false;

    let value = rejected[previousValueKey];
    let valueTick = rejected.previousTick;
    for (const entry of later) {
        entry[previousValueKey] = Math.max(0, value - (entry.previousTick - valueTick) * fixedDt);
        value = entry[appliedValueKey];
        valueTick = entry.tick;
    }
    return true;
}

export class OwnerPredictionRuntime {
    constructor({
        ownerId,
        simulation = null,
        fixedDt = 1 / 120,
        inputHoldTicks = MULTIPLAYER_TIMING.inputHoldTicks,
        predictionLeadTicks = MULTIPLAYER_TIMING.inputLeadTicks,
        maxInputHistory = 512,
        correctionSeconds = MULTIPLAYER_TIMING.ownerCorrectionSeconds,
        hardSnapDistance = MULTIPLAYER_TIMING.ownerHardSnapDistance
    }) {
        if (typeof ownerId !== "string" || ownerId.length === 0) throw new Error("ownerId must be non-empty");
        if (!Number.isFinite(fixedDt) || fixedDt <= 0) throw new Error("fixedDt must be positive");
        if (!Number.isSafeInteger(predictionLeadTicks) || predictionLeadTicks < 0) {
            throw new Error("predictionLeadTicks must be a non-negative safe integer");
        }
        if (!Number.isSafeInteger(maxInputHistory) || maxInputHistory < 1) {
            throw new Error("maxInputHistory must be a positive safe integer");
        }
        if (!Number.isFinite(correctionSeconds) || correctionSeconds <= 0) {
            throw new Error("correctionSeconds must be positive");
        }
        if (!Number.isFinite(hardSnapDistance) || hardSnapDistance <= 0) {
            throw new Error("hardSnapDistance must be positive");
        }
        this.ownerId = ownerId;
        this.simulation = simulation ?? new GameSimulation({ playerId: ownerId });
        if (this.simulation.getPrimaryPlayerId() !== ownerId) {
            throw new Error(
                `prediction simulation ownerId mismatch: expected ${ownerId}, received ${this.simulation.getPrimaryPlayerId()}`
            );
        }
        this.fixedDt = fixedDt;
        this.inputHoldTicks = inputHoldTicks;
        this.predictionLeadTicks = predictionLeadTicks;
        this.maxInputHistory = maxInputHistory;
        this.correctionSeconds = correctionSeconds;
        this.hardSnapDistance = hardSnapDistance;
        this.inputHistory = new Map();
        this.initialized = false;
        this.presentationOffset = { x: 0, y: 0 };
        this.correctionRemaining = 0;
        this.lastCorrectionDistance = 0;
        this.hardSnapCount = 0;
        this.correctionSamples = [];
        this.predictedEvents = [];
        this.emittedPredictionTicks = new Map();
        this.pendingRopeSwings = new Map();
        this.pendingProjectileSpawns = new Map();
        this.pendingImpacts = new Map();
        this.nextImpactPredictionOrder = 0;
        this.pendingCheckpoint = null;
        this.simulation.preparePrediction();
    }

    prepareSnapshot(snapshot, fallbackProgress = null) {
        if (!snapshot) {
            const progress = fallbackProgress ?? this.simulation.predictionProgressState(this.ownerId);
            this.simulation.preparePrediction([], progress.activeCheckpointId);
            this.simulation.synchronizePredictionProgress(this.ownerId, progress);
            return;
        }
        if (this.pendingCheckpoint?.checkpointId === snapshot.state.activeCheckpointId) {
            this.pendingCheckpoint = null;
        }
        const preserveCheckpoint = this.pendingCheckpoint !== null;
        const progress = preserveCheckpoint
            ? this.simulation.predictionProgressState(this.ownerId)
            : {
                  activeCheckpointId: snapshot.state.activeCheckpointId,
                  artifactReward: snapshot.state.artifactRewards?.[this.ownerId] ?? null,
                  rewardedCheckpointIds: snapshot.state.rewardedCheckpointIds ?? []
              };
        this.simulation.preparePrediction(snapshot.state.enemies ?? [], progress.activeCheckpointId);
        if (!preserveCheckpoint) this.simulation.synchronizePredictionProgress(this.ownerId, progress);
    }

    reconcile(snapshot, pendingBatches, { rebaseMotion = false } = {}) {
        if (snapshot.worldSeed !== this.simulation.world.seed) throw new Error("prediction world seed mismatch");
        if (snapshot.worldRevision !== WORLD_GENERATION_REVISION) throw new Error("prediction world revision mismatch");
        const sharedOwner = snapshot.state.players.find(({ id }) => id === this.ownerId);
        if (!sharedOwner) throw new Error(`missing predicted ownerId: ${this.ownerId}`);
        const ownerMotionTick = sharedOwner.ownerMotionTick;
        if (
            !Number.isSafeInteger(ownerMotionTick) ||
            ownerMotionTick < 0 ||
            ownerMotionTick > snapshot.serverTick + MULTIPLAYER_TIMING.maxFutureTicks
        ) {
            throw new Error(`invalid ownerMotionTick: ${ownerMotionTick}`);
        }
        this.confirmResolvedImpacts(snapshot.events);
        const pendingTicks = pendingBatches.map(({ tick }) => tick);
        const targetTick = Math.max(
            snapshot.serverTick + this.predictionLeadTicks,
            ownerMotionTick,
            this.initialized ? this.simulation.getTick() : snapshot.serverTick,
            ...pendingTicks
        );
        if (this.initialized && !rebaseMotion) {
            return this.acceptSharedOutcomes(snapshot, sharedOwner, targetTick, ownerMotionTick);
        }
        const displayedBefore = this.initialized ? this.presentationState() : null;
        const lifeStateChanged = this.initialized && this.state().lifeState !== sharedOwner.lifeState;
        this.prepareSnapshot(snapshot);
        this.simulation.restoreOwnerPrediction(this.ownerId, sharedOwner, ownerMotionTick);
        if (this.pendingCheckpoint) this.simulation.releasePlayerRope(this.ownerId);
        this.initialized = true;

        for (const tick of this.inputHistory.keys()) {
            if (tick <= ownerMotionTick) this.inputHistory.delete(tick);
        }
        for (const [predictionId, tick] of this.emittedPredictionTicks) {
            if (tick <= ownerMotionTick) this.emittedPredictionTicks.delete(predictionId);
        }

        const batchesByTick = this.pendingBatchesByTick(ownerMotionTick, pendingBatches);
        const pendingImpacts = [...this.pendingImpacts.values()]
            .filter(({ tick }) => tick >= ownerMotionTick)
            .sort((left, right) => left.tick - right.tick || left.order - right.order);
        this.replayInputs(ownerMotionTick, targetTick, batchesByTick, pendingImpacts);
        const corrected = this.state();
        if (displayedBefore) this.startPresentationCorrection(displayedBefore, corrected, lifeStateChanged);
        return corrected;
    }

    acceptSharedOutcomes(snapshot, sharedOwner, targetTick, ownerMotionTick) {
        this.prepareSnapshot(snapshot);
        for (const tick of this.inputHistory.keys()) {
            if (tick <= ownerMotionTick) this.inputHistory.delete(tick);
        }
        for (const [predictionId, tick] of this.emittedPredictionTicks) {
            if (tick <= ownerMotionTick) this.emittedPredictionTicks.delete(predictionId);
        }
        this.simulation.applySharedOwnerProgress(this.ownerId, sharedOwner, targetTick, {
            preservePendingImpact: this.pendingImpacts.size > 0
        });
        return this.state();
    }

    pendingBatchesByTick(serverTick, pendingBatches) {
        const batchesByTick = new Map();
        for (const batch of pendingBatches) {
            if (batch.tick <= serverTick) continue;
            if (batchesByTick.has(batch.tick)) throw new Error(`duplicate pending target tick: ${batch.tick}`);
            batchesByTick.set(batch.tick, batch);
            const entry = batch.commands.find(({ playerId }) => playerId === this.ownerId);
            if (entry && !this.inputHistory.has(batch.tick)) this.rememberInput(batch.tick, entry.command);
        }
        return batchesByTick;
    }

    replayInputs(serverTick, targetTick, batchesByTick, impactEntries = []) {
        const inputState = new InputStateSimulator({ holdTicks: this.inputHoldTicks });
        const impactsByTick = new Map();
        for (const entry of impactEntries) {
            if (!impactsByTick.has(entry.tick)) impactsByTick.set(entry.tick, []);
            impactsByTick.get(entry.tick).push(entry);
        }
        const replayImpactsAtTick = (tick) => {
            for (const entry of impactsByTick.get(tick) ?? []) {
                entry.before = this.simulation.playerState(this.ownerId);
                if (!this.simulation.applyPredictedOwnerImpact(this.ownerId, entry.event)) {
                    throw new Error(`failed to replay pending impact: ${entry.event.projectileId}`);
                }
            }
        };
        replayImpactsAtTick(serverTick);
        for (let tick = serverTick + 1; tick <= targetTick; tick += 1) {
            const remembered = this.inputHistory.get(tick);
            const batch = remembered
                ? { tick, commands: [{ playerId: this.ownerId, sequence: tick, command: remembered }] }
                : (batchesByTick.get(tick) ?? { tick, commands: [] });
            const simulated = inputState.expand(batch, [this.ownerId]);
            const command = simulated.commands[0]?.command ?? this.simulation.idleOwnerCommand(this.ownerId);
            const previous = this.state();
            const outcome = this.simulation.advanceOwnerPrediction(this.ownerId, command, this.fixedDt, tick);
            this.recordPredictedOutcome(outcome, tick, previous);
            replayImpactsAtTick(tick);
        }
    }

    advance(command) {
        if (!this.initialized) return null;
        const tick = this.simulation.getTick() + 1;
        this.rememberInput(tick, command);
        const previous = this.state();
        const outcome = this.simulation.advanceOwnerPrediction(this.ownerId, command, this.fixedDt, tick);
        this.recordPredictedOutcome(outcome, tick, previous);
        this.updatePresentation(this.fixedDt);
        return this.state();
    }

    predictFall() {
        if (!this.initialized) return null;
        this.simulation.resolvePlayerFall(this.ownerId);
        return this.state();
    }

    startPresentationCorrection(displayedBefore, corrected, forceHardSnap = false) {
        const offset = {
            x: displayedBefore.position.x - corrected.position.x,
            y: displayedBefore.position.y - corrected.position.y
        };
        const distance = Math.hypot(offset.x, offset.y);
        this.lastCorrectionDistance = distance;
        if (distance > 0) {
            this.correctionSamples.push(distance);
            if (this.correctionSamples.length > 256) this.correctionSamples.shift();
        }
        const hardSnap =
            forceHardSnap || distance > this.hardSnapDistance || displayedBefore.lifeState !== corrected.lifeState;
        if (hardSnap) {
            this.presentationOffset = { x: 0, y: 0 };
            this.correctionRemaining = 0;
            this.hardSnapCount += 1;
            return;
        }
        this.presentationOffset = offset;
        this.correctionRemaining = distance > 0 ? this.correctionSeconds : 0;
    }

    updatePresentation(dt) {
        if (this.correctionRemaining <= 0) return;
        const remaining = Math.max(0, this.correctionRemaining - dt);
        const ratio = remaining / this.correctionRemaining;
        this.presentationOffset.x *= ratio;
        this.presentationOffset.y *= ratio;
        this.correctionRemaining = remaining;
    }

    rememberInput(tick, command) {
        this.inputHistory.set(tick, command);
        while (this.inputHistory.size > this.maxInputHistory) {
            this.inputHistory.delete(this.inputHistory.keys().next().value);
        }
    }

    applyPredictedImpact(event) {
        if (!this.initialized) return false;
        if (event.projectileId && this.pendingImpacts.has(event.projectileId)) return false;
        const before = this.simulation.playerState(this.ownerId);
        const tick = this.simulation.getTick();
        const applied = this.simulation.applyPredictedOwnerImpact(this.ownerId, event);
        if (applied && event.projectileId) {
            this.pendingImpacts.set(event.projectileId, {
                before,
                tick,
                order: this.nextImpactPredictionOrder++,
                status: "pending",
                event: copyPredictedImpact(event)
            });
        }
        return applied;
    }

    confirmResolvedImpacts(events) {
        for (const event of events ?? []) {
            if (event.eventType !== "resolve") continue;
            const pending = this.pendingImpacts.get(event.objectId);
            if (!pending || pending.status !== "accepted" || pending.event.resolution !== event.resolution) continue;
            this.pendingImpacts.delete(event.objectId);
        }
    }

    recordImpactReceipt(receipt, snapshot = null) {
        const pending = this.pendingImpacts.get(receipt.projectileId);
        if (!pending) return false;
        if (receipt.accepted) {
            pending.status = "accepted";
            return true;
        }
        this.pendingImpacts.delete(receipt.projectileId);
        return true;
    }

    resolveCollisions(otherPlayers, radius) {
        if (!this.initialized) return false;
        return this.simulation.resolveOwnerCollisions(this.ownerId, otherPlayers, radius);
    }

    checkpointClaimCandidate() {
        if (!this.initialized) return null;
        const checkpoint = this.simulation.checkpointClaimCandidate(this.ownerId);
        if (!checkpoint) return null;
        const state = this.state();
        return Object.freeze({
            checkpointId: checkpoint.id,
            clientTick: state.tick,
            position: { x: state.position.x, y: state.position.y },
            feedbackPosition: { x: checkpoint.x, y: checkpoint.y }
        });
    }

    applyPredictedCheckpoint(candidate) {
        if (!this.initialized || this.pendingCheckpoint) return false;
        const before = this.simulation.playerState(this.ownerId);
        const beforeProgress = this.simulation.predictionProgressState(this.ownerId);
        const result = this.simulation.resolveCheckpointClaim(this.ownerId, candidate, { positionTolerance: 0 });
        if (!result.accepted) return false;
        this.pendingCheckpoint = {
            checkpointId: candidate.checkpointId,
            before,
            beforeProgress,
            tick: this.simulation.getTick()
        };
        return true;
    }

    recordCheckpointReceipt(receipt, snapshot = null) {
        const pending = this.pendingCheckpoint;
        if (!pending || pending.checkpointId !== receipt.checkpointId) return false;
        if (receipt.accepted) return true;

        this.pendingCheckpoint = null;
        const displayedBefore = this.presentationState();
        const targetTick = this.simulation.getTick();
        this.prepareSnapshot(snapshot, pending.beforeProgress);
        this.simulation.restoreOwnerPrediction(this.ownerId, pending.before, pending.tick);
        const pendingImpacts = [...this.pendingImpacts.values()]
            .filter(({ tick }) => tick >= pending.tick)
            .sort((left, right) => left.tick - right.tick || left.order - right.order);
        this.replayInputs(pending.tick, targetTick, new Map(), pendingImpacts);

        const sharedOwner = snapshot?.state?.players?.find(({ id }) => id === this.ownerId);
        if (sharedOwner) {
            this.simulation.applySharedOwnerProgress(this.ownerId, sharedOwner, targetTick, {
                preservePendingImpact: this.pendingImpacts.size > 0
            });
        }
        this.startPresentationCorrection(displayedBefore, this.state());
        return true;
    }

    artifactReward() {
        return this.simulation.getArtifactReward(this.ownerId);
    }

    summitClaimCandidate() {
        if (!this.initialized) return null;
        const summit = this.simulation.summitClaimCandidate(this.ownerId);
        if (!summit) return null;
        const state = this.state();
        return Object.freeze({
            clientTick: state.tick,
            position: { x: state.position.x, y: state.position.y },
            feedbackPosition: { x: summit.x, y: summit.y }
        });
    }

    renderSnapshot() {
        return this.initialized ? this.simulation.snapshot() : null;
    }

    impactClaimState() {
        return this.initialized ? this.simulation.playerState(this.ownerId) : null;
    }

    impactRecoveryState() {
        if (!this.initialized) return null;
        return Object.freeze({
            stateTick: this.simulation.getTick(),
            state: this.simulation.playerState(this.ownerId)
        });
    }

    recordPredictedOutcome({ projectile, swingTriggered }, tick, previous) {
        if (swingTriggered) this.recordPredictedRopeSwing(tick, previous.ropeDamageBoostRemaining);
        this.recordPredictedProjectile(projectile, tick, previous.weaponCooldown);
    }

    recordPredictedRopeSwing(tick, previousBoost) {
        const predictionId = `${this.ownerId}:swing:${tick}`;
        const eventKey = `rope-swing:${predictionId}`;
        if (this.emittedPredictionTicks.has(eventKey)) return;
        const state = this.state();
        if (!state.rope.isAttached || !state.rope.anchor) return;
        this.emittedPredictionTicks.set(eventKey, tick);
        this.pendingRopeSwings.set(predictionId, {
            previousBoost,
            previousTick: tick - 1,
            appliedBoost: state.ropeDamageBoostRemaining,
            tick
        });
        this.predictedEvents.push(
            Object.freeze({
                eventType: "predicted-rope-swing",
                predictionId,
                tick,
                ownerId: this.ownerId,
                position: { x: state.position.x, y: state.position.y },
                anchor: { x: state.rope.anchor.x, y: state.rope.anchor.y }
            })
        );
    }

    recordRopeSwingReceipt(receipt) {
        const pending = this.pendingRopeSwings.get(receipt.predictionId);
        if (!pending) return false;
        this.pendingRopeSwings.delete(receipt.predictionId);
        if (receipt.accepted) return true;
        if (
            rebaseLaterTimerPredictions(
                this.pendingRopeSwings.values(),
                pending,
                this.fixedDt,
                "previousBoost",
                "appliedBoost"
            )
        ) {
            return true;
        }
        const elapsedTicks = Math.max(0, this.simulation.getTick() - pending.previousTick);
        const remaining = Math.max(0, pending.previousBoost - elapsedTicks * this.fixedDt);
        this.simulation.restorePredictedRopeBoost(this.ownerId, remaining);
        return true;
    }

    recordProjectileSpawnReceipt(receipt) {
        const pending = this.pendingProjectileSpawns.get(receipt.predictionId);
        if (!pending) return false;
        this.pendingProjectileSpawns.delete(receipt.predictionId);
        if (receipt.accepted) return true;
        if (
            rebaseLaterTimerPredictions(
                this.pendingProjectileSpawns.values(),
                pending,
                this.fixedDt,
                "previousCooldown",
                "appliedCooldown"
            )
        ) {
            return true;
        }
        const elapsedTicks = Math.max(0, this.simulation.getTick() - pending.previousTick);
        const remaining = Math.max(0, pending.previousCooldown - elapsedTicks * this.fixedDt);
        this.simulation.restorePredictedWeaponCooldown(this.ownerId, remaining);
        return true;
    }

    recordPredictedProjectile(projectile, tick, previousCooldown) {
        if (!projectile) return;
        const predictionId = `${this.ownerId}:${tick}`;
        const eventKey = `projectile:${predictionId}`;
        if (this.emittedPredictionTicks.has(eventKey)) return;
        this.emittedPredictionTicks.set(eventKey, tick);
        this.pendingProjectileSpawns.set(predictionId, {
            previousCooldown,
            previousTick: tick - 1,
            appliedCooldown: this.state().weaponCooldown,
            tick
        });
        this.predictedEvents.push(
            Object.freeze({
                eventType: "predicted-spawn",
                predictionId,
                tick,
                objectType: "player-projectile",
                ownerId: projectile.ownerId,
                targetId: projectile.targetId,
                position: { x: projectile.position.x, y: projectile.position.y },
                velocity: { x: projectile.velocity.x, y: projectile.velocity.y },
                radius: projectile.radius,
                damage: projectile.damage,
                speed: COMBAT_CONFIG.projectileSpeed
            })
        );
    }

    drainPredictedEvents() {
        const events = Object.freeze([...this.predictedEvents]);
        this.predictedEvents.length = 0;
        return events;
    }

    state() {
        return this.simulation.ownerPredictionState(this.ownerId);
    }

    presentationState() {
        const state = this.state();
        return {
            ...state,
            position: {
                x: state.position.x + this.presentationOffset.x,
                y: state.position.y + this.presentationOffset.y
            }
        };
    }

    metrics() {
        return Object.freeze({
            correctionDistance: this.lastCorrectionDistance,
            correctionP50: percentile(this.correctionSamples, 0.5),
            correctionP95: percentile(this.correctionSamples, 0.95),
            correctionRemaining: this.correctionRemaining,
            hardSnaps: this.hardSnapCount
        });
    }
}
