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

export class LocalPlayerPredictor {
    constructor({
        playerId,
        simulation = null,
        fixedDt = 1 / 120,
        inputHoldTicks = MULTIPLAYER_TIMING.inputHoldTicks,
        predictionLeadTicks = MULTIPLAYER_TIMING.inputLeadTicks,
        maxInputHistory = 512,
        correctionSeconds = MULTIPLAYER_TIMING.ownerCorrectionSeconds,
        hardSnapDistance = MULTIPLAYER_TIMING.ownerHardSnapDistance
    }) {
        if (typeof playerId !== "string" || playerId.length === 0) throw new Error("playerId must be non-empty");
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
        this.playerId = playerId;
        this.simulation = simulation ?? new GameSimulation({ playerId });
        if (this.simulation.getPrimaryPlayerId() !== playerId) {
            throw new Error(
                `prediction simulation playerId mismatch: expected ${playerId}, received ${this.simulation.getPrimaryPlayerId()}`
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
        this.simulation.preparePrediction();
    }

    reconcile(snapshot, pendingBatches) {
        if (snapshot.worldSeed !== this.simulation.world.seed) throw new Error("prediction world seed mismatch");
        if (snapshot.worldRevision !== WORLD_GENERATION_REVISION) throw new Error("prediction world revision mismatch");
        const authoritative = snapshot.state.players.find(({ id }) => id === this.playerId);
        if (!authoritative) throw new Error(`missing predicted playerId: ${this.playerId}`);
        if (this.initialized) return this.acceptAuthorityOutcomes(snapshot, authoritative);
        const pendingTicks = pendingBatches.map(({ tick }) => tick);
        const targetTick = Math.max(snapshot.serverTick + this.predictionLeadTicks, ...pendingTicks);
        this.simulation.preparePrediction(snapshot.state.enemies ?? []);
        this.simulation.restorePrediction(this.playerId, authoritative, snapshot.serverTick);
        this.initialized = true;

        for (const tick of this.inputHistory.keys()) {
            if (tick <= snapshot.serverTick) this.inputHistory.delete(tick);
        }
        for (const [predictionId, tick] of this.emittedPredictionTicks) {
            if (tick <= snapshot.serverTick) this.emittedPredictionTicks.delete(predictionId);
        }

        const batchesByTick = new Map();
        for (const batch of pendingBatches) {
            if (batch.tick <= snapshot.serverTick) continue;
            if (batchesByTick.has(batch.tick)) throw new Error(`duplicate pending target tick: ${batch.tick}`);
            batchesByTick.set(batch.tick, batch);
            const entry = batch.commands.find(({ playerId }) => playerId === this.playerId);
            if (entry && !this.inputHistory.has(batch.tick)) this.rememberInput(batch.tick, entry.command);
        }
        const inputState = new InputStateSimulator({ holdTicks: this.inputHoldTicks });
        for (let tick = snapshot.serverTick + 1; tick <= targetTick; tick += 1) {
            const remembered = this.inputHistory.get(tick);
            const batch = remembered
                ? { tick, commands: [{ playerId: this.playerId, sequence: tick, command: remembered }] }
                : (batchesByTick.get(tick) ?? { tick, commands: [] });
            const simulated = inputState.expand(batch, [this.playerId]);
            const command = simulated.commands[0]?.command ?? this.simulation.idlePlayerCommand(this.playerId);
            const projectile = this.simulation.advancePrediction(this.playerId, command, this.fixedDt, tick);
            this.recordPredictedProjectile(projectile, tick);
        }
        return this.state();
    }

    acceptAuthorityOutcomes(snapshot, authoritative) {
        const current = this.simulation.playerState(this.playerId);
        const displayedBefore = current.lifeState !== authoritative.lifeState ? this.presentationState() : null;
        this.simulation.preparePrediction(snapshot.state.enemies ?? []);
        for (const tick of this.inputHistory.keys()) {
            if (tick <= snapshot.serverTick) this.inputHistory.delete(tick);
        }
        for (const [predictionId, tick] of this.emittedPredictionTicks) {
            if (tick <= snapshot.serverTick) this.emittedPredictionTicks.delete(predictionId);
        }
        const outcome = this.simulation.applyPredictionOutcomes(this.playerId, authoritative, snapshot.serverTick);
        if (outcome.lifeStateChanged) this.startPresentationCorrection(displayedBefore, outcome.state);
        return this.state();
    }

    advance(command) {
        if (!this.initialized) return null;
        const tick = this.simulation.getTick() + 1;
        this.rememberInput(tick, command);
        const projectile = this.simulation.advancePrediction(this.playerId, command, this.fixedDt, tick);
        this.recordPredictedProjectile(projectile, tick);
        this.updatePresentation(this.fixedDt);
        return this.state();
    }

    startPresentationCorrection(displayedBefore, corrected) {
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
        const hardSnap = distance > this.hardSnapDistance || displayedBefore.lifeState !== corrected.lifeState;
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
        return this.simulation.applyPredictedImpact(this.playerId, event);
    }

    resolveCollisions(otherPlayers, radius) {
        if (!this.initialized) return false;
        return this.simulation.resolvePlayerCollisions(this.playerId, otherPlayers, radius);
    }

    renderSnapshot() {
        return this.initialized ? this.simulation.snapshot() : null;
    }

    recordPredictedProjectile(projectile, tick) {
        if (!projectile) return;
        const predictionId = `${this.playerId}:${tick}`;
        if (this.emittedPredictionTicks.has(predictionId)) return;
        this.emittedPredictionTicks.set(predictionId, tick);
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
        return this.simulation.predictionState(this.playerId);
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
