import { Vector2 } from "../../game-kit/index.js";
import { COMBAT_CONFIG } from "../config.js";
import { InputStateSimulator } from "../network/InputStateSimulator.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";
import { GameSimulation } from "../simulation/GameSimulation.js";

function cloneSwingDrag(swingDrag) {
    if (!swingDrag) return null;
    return {
        origin: { ...swingDrag.origin },
        direction: swingDrag.direction ? { ...swingDrag.direction } : null,
        progress: swingDrag.progress,
        age: swingDrag.age,
        used: swingDrag.used
    };
}

function ropeTopologyChanged(left, right) {
    if (left.isAttached !== right.isAttached) return true;
    if (!left.isAttached) return false;
    return Math.hypot(left.anchor.x - right.anchor.x, left.anchor.y - right.anchor.y) > 1;
}

export class LocalPlayerPredictor {
    constructor({
        playerId,
        simulation = new GameSimulation(),
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
        this.simulation = simulation;
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
        this.predictedEvents = [];
        this.emittedPredictionTicks = new Map();
        this.simulation.enemies = [];
        this.simulation.projectiles = [];
        this.simulation.enemyProjectiles = [];
    }

    reconcile(snapshot, pendingBatches) {
        if (snapshot.worldSeed !== this.simulation.world.seed) throw new Error("prediction world seed mismatch");
        if (snapshot.worldRevision !== WORLD_GENERATION_REVISION) throw new Error("prediction world revision mismatch");
        const authoritative = snapshot.state.players.find(({ id }) => id === this.playerId);
        if (!authoritative) throw new Error(`missing predicted playerId: ${this.playerId}`);
        const displayedBefore = this.initialized ? this.presentationState() : null;
        const pendingTicks = pendingBatches.map(({ tick }) => tick);
        const targetTick = Math.max(
            snapshot.serverTick + this.predictionLeadTicks,
            this.initialized ? this.simulation.tick : snapshot.serverTick,
            ...pendingTicks
        );
        this.restore(authoritative);
        this.restoreEnemies(snapshot.state.enemies ?? []);
        this.simulation.tick = snapshot.serverTick;
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
        const player = this.simulation.playerEntity;
        const inputState = new InputStateSimulator({ holdTicks: this.inputHoldTicks });
        for (let tick = snapshot.serverTick + 1; tick <= targetTick; tick += 1) {
            const remembered = this.inputHistory.get(tick);
            const batch = remembered
                ? { tick, commands: [{ playerId: this.playerId, sequence: tick, command: remembered }] }
                : (batchesByTick.get(tick) ?? { tick, commands: [] });
            const simulated = inputState.expand(batch, [this.playerId]);
            const command = simulated.commands[0]?.command ?? this.simulation.commandForPlayer(player, new Map());
            const projectile = this.simulation.updatePlayer(player, command, this.fixedDt);
            this.recordPredictedProjectile(projectile, tick);
            this.simulation.tick = tick;
        }
        this.simulation.projectiles.length = 0;
        const corrected = this.state();
        if (displayedBefore) this.startPresentationCorrection(displayedBefore, corrected);
        return corrected;
    }

    advance(command) {
        if (!this.initialized) return null;
        const tick = this.simulation.tick + 1;
        this.rememberInput(tick, command);
        const projectile = this.simulation.updatePlayer(this.simulation.playerEntity, command, this.fixedDt);
        this.recordPredictedProjectile(projectile, tick);
        this.simulation.projectiles.length = 0;
        this.simulation.tick = tick;
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
        const hardSnap =
            distance > this.hardSnapDistance ||
            ropeTopologyChanged(displayedBefore.rope, corrected.rope) ||
            displayedBefore.lifeState !== corrected.lifeState;
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

    restoreEnemies(enemies) {
        this.simulation.enemies = enemies.map((enemy) => ({
            ...enemy,
            position: new Vector2(enemy.position.x, enemy.position.y)
        }));
    }

    drainPredictedEvents() {
        const events = Object.freeze([...this.predictedEvents]);
        this.predictedEvents.length = 0;
        return events;
    }

    restore(state) {
        const player = this.simulation.playerEntity;
        player.physics.position.set(state.position.x, state.position.y);
        player.physics.velocity.set(state.velocity.x, state.velocity.y);
        player.physics.isGrounded = state.isGrounded;
        if (state.rope.isAttached) {
            player.rope.anchor = new Vector2(state.rope.anchor.x, state.rope.anchor.y);
            player.rope.length = state.rope.length;
            player.rope.currentLength = state.rope.currentLength;
            player.rope.tension = state.rope.tension;
        } else {
            player.rope.detach();
        }
        player.aimWorld = { ...state.control.aimWorld };
        player.lastPointer = { ...state.control.lastPointer };
        player.lastViewport = { ...state.control.lastViewport };
        player.wasPointerDown = state.control.wasPointerDown;
        player.attachBufferRemaining = state.control.attachBufferRemaining;
        player.swingDrag = cloneSwingDrag(state.control.swingDrag);
        player.health = state.health;
        player.maxHealth = state.maxHealth;
        player.hitInvulnerabilityRemaining = state.hitInvulnerabilityRemaining;
        player.ropeDisabledRemaining = state.ropeDisabledRemaining;
        player.lifeState = state.lifeState;
        player.downedRemaining = state.downedRemaining;
        player.reviveProgress = state.reviveProgress;
        player.weapon.range = state.weapon.range;
        player.weapon.damage = state.weapon.damage;
        player.weapon.fireInterval = state.weapon.fireInterval;
        player.weapon.cooldown = state.weapon.cooldown;
        player.artifacts.replace(state.artifacts);
        player.ropeDamageBoostRemaining = state.ropeDamageBoostRemaining;
        player.lastCheckpointLoss = [...state.lastCheckpointLoss];
        player.attachmentCandidate = this.simulation.findAttachment(player.aimWorld, player);
    }

    state() {
        const player = this.simulation.playerEntity;
        return {
            tick: this.simulation.tick,
            position: { x: player.physics.position.x, y: player.physics.position.y },
            velocity: { x: player.physics.velocity.x, y: player.physics.velocity.y },
            isGrounded: player.physics.isGrounded,
            lifeState: player.lifeState,
            rope: {
                isAttached: player.rope.isAttached,
                anchor: player.rope.anchor ? { x: player.rope.anchor.x, y: player.rope.anchor.y } : null,
                length: player.rope.length,
                currentLength: player.rope.currentLength,
                tension: player.rope.tension
            },
            swingDrag: cloneSwingDrag(player.swingDrag),
            ropeDamageBoostRemaining: player.ropeDamageBoostRemaining
        };
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
            correctionRemaining: this.correctionRemaining,
            hardSnaps: this.hardSnapCount
        });
    }
}
