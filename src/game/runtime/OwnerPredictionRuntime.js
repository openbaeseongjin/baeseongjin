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
        this.simulation.preparePrediction();
    }

    reconcile(snapshot, pendingBatches, { rebaseMotion = false } = {}) {
        if (snapshot.worldSeed !== this.simulation.world.seed) throw new Error("prediction world seed mismatch");
        if (snapshot.worldRevision !== WORLD_GENERATION_REVISION) throw new Error("prediction world revision mismatch");
        const authoritative = snapshot.state.players.find(({ id }) => id === this.ownerId);
        if (!authoritative) throw new Error(`missing predicted ownerId: ${this.ownerId}`);
        const ownerMotionTick = authoritative.ownerMotionTick;
        if (
            !Number.isSafeInteger(ownerMotionTick) ||
            ownerMotionTick < 0 ||
            ownerMotionTick > snapshot.serverTick + MULTIPLAYER_TIMING.maxFutureTicks
        ) {
            throw new Error(`invalid ownerMotionTick: ${ownerMotionTick}`);
        }
        const pendingTicks = pendingBatches.map(({ tick }) => tick);
        const targetTick = Math.max(
            snapshot.serverTick + this.predictionLeadTicks,
            ownerMotionTick,
            this.initialized ? this.simulation.getTick() : snapshot.serverTick,
            ...pendingTicks
        );
        if (this.initialized && !rebaseMotion) {
            return this.acceptAuthorityOutcomes(snapshot, authoritative, targetTick, ownerMotionTick);
        }
        const displayedBefore = this.initialized ? this.presentationState() : null;
        const lifeStateChanged = this.initialized && this.state().lifeState !== authoritative.lifeState;
        const respawned = snapshot.events.some(
            ({ eventType, playerId }) => eventType === "player-respawned" && playerId === this.ownerId
        );
        this.simulation.preparePrediction(snapshot.state.enemies ?? [], snapshot.state.activeCheckpointId);
        this.simulation.restoreOwnerPrediction(this.ownerId, authoritative, ownerMotionTick);
        this.initialized = true;

        for (const tick of this.inputHistory.keys()) {
            if (tick <= ownerMotionTick) this.inputHistory.delete(tick);
        }
        for (const [predictionId, tick] of this.emittedPredictionTicks) {
            if (tick <= ownerMotionTick) this.emittedPredictionTicks.delete(predictionId);
        }

        const batchesByTick = this.pendingBatchesByTick(ownerMotionTick, pendingBatches);
        this.replayInputs(ownerMotionTick, targetTick, batchesByTick);
        const corrected = this.state();
        if (displayedBefore)
            this.startPresentationCorrection(displayedBefore, corrected, respawned || lifeStateChanged);
        return corrected;
    }

    acceptAuthorityOutcomes(snapshot, authoritative, targetTick, ownerMotionTick) {
        const current = this.state();
        const respawned = snapshot.events.some(
            ({ eventType, playerId }) => eventType === "player-respawned" && playerId === this.ownerId
        );
        const authorityTransition = respawned || current.lifeState !== authoritative.lifeState;
        const displayedBefore = authorityTransition ? this.presentationState() : null;
        this.simulation.preparePrediction(snapshot.state.enemies ?? [], snapshot.state.activeCheckpointId);
        for (const tick of this.inputHistory.keys()) {
            if (tick <= ownerMotionTick) this.inputHistory.delete(tick);
        }
        for (const [predictionId, tick] of this.emittedPredictionTicks) {
            if (tick <= ownerMotionTick) this.emittedPredictionTicks.delete(predictionId);
        }
        if (respawned) {
            const restored = this.simulation.restoreOwnerPrediction(this.ownerId, authoritative, targetTick);
            this.startPresentationCorrection(displayedBefore, restored, true);
            return this.state();
        }
        const outcome = this.simulation.applyOwnerPredictionOutcomes(this.ownerId, authoritative, targetTick, {
            preserveRopeBoost: this.pendingRopeSwings.size > 0,
            preserveWeaponCooldown: this.pendingProjectileSpawns.size > 0
        });
        if (outcome.lifeStateChanged) this.startPresentationCorrection(displayedBefore, outcome.state);
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

    replayInputs(serverTick, targetTick, batchesByTick) {
        const inputState = new InputStateSimulator({ holdTicks: this.inputHoldTicks });
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
        if (applied && event.projectileId) this.pendingImpacts.set(event.projectileId, { before, tick });
        return applied;
    }

    recordImpactReceipt(receipt, snapshot = null) {
        const pending = this.pendingImpacts.get(receipt.projectileId);
        if (!pending) return false;
        this.pendingImpacts.delete(receipt.projectileId);
        if (receipt.accepted) return true;

        const displayedBefore = this.presentationState();
        const targetTick = this.simulation.getTick();
        this.simulation.preparePrediction(snapshot?.state.enemies ?? [], snapshot?.state.activeCheckpointId);
        this.simulation.restoreOwnerPrediction(this.ownerId, pending.before, pending.tick);
        this.replayInputs(pending.tick, targetTick, new Map());

        const authoritative = snapshot?.state?.players?.find(({ id }) => id === this.ownerId);
        if (authoritative) {
            this.simulation.applyOwnerPredictionOutcomes(this.ownerId, authoritative, targetTick, {
                preserveRopeBoost: this.pendingRopeSwings.size > 0,
                preserveWeaponCooldown: this.pendingProjectileSpawns.size > 0
            });
        }
        const corrected = this.state();
        this.startPresentationCorrection(displayedBefore, corrected);
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
            previousTick: tick - 1
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
            previousTick: tick - 1
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
