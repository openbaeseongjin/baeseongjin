import { Vector2 } from "../../game-kit/index.js";
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

export class LocalPlayerPredictor {
    constructor({
        playerId,
        simulation = new GameSimulation(),
        fixedDt = 1 / 120,
        inputHoldTicks = MULTIPLAYER_TIMING.inputHoldTicks
    }) {
        if (typeof playerId !== "string" || playerId.length === 0) throw new Error("playerId must be non-empty");
        if (!Number.isFinite(fixedDt) || fixedDt <= 0) throw new Error("fixedDt must be positive");
        this.playerId = playerId;
        this.simulation = simulation;
        this.fixedDt = fixedDt;
        this.inputHoldTicks = inputHoldTicks;
        this.simulation.enemies = [];
        this.simulation.projectiles = [];
        this.simulation.enemyProjectiles = [];
    }

    reconcile(snapshot, pendingBatches) {
        if (snapshot.worldSeed !== this.simulation.world.seed) throw new Error("prediction world seed mismatch");
        if (snapshot.worldRevision !== WORLD_GENERATION_REVISION) throw new Error("prediction world revision mismatch");
        const authoritative = snapshot.state.players.find(({ id }) => id === this.playerId);
        if (!authoritative) throw new Error(`missing predicted playerId: ${this.playerId}`);
        this.restore(authoritative);
        this.simulation.tick = snapshot.serverTick;

        const batchesByTick = new Map();
        for (const batch of pendingBatches) {
            if (batch.tick <= snapshot.serverTick) continue;
            if (batchesByTick.has(batch.tick)) throw new Error(`duplicate pending target tick: ${batch.tick}`);
            batchesByTick.set(batch.tick, batch);
        }
        const finalTick = Math.max(snapshot.serverTick, ...batchesByTick.keys());
        const player = this.simulation.playerEntity;
        const inputState = new InputStateSimulator({ holdTicks: this.inputHoldTicks });
        for (let tick = snapshot.serverTick + 1; tick <= finalTick; tick += 1) {
            const batch = batchesByTick.get(tick) ?? { tick, commands: [] };
            const simulated = inputState.expand(batch, [this.playerId]);
            const command = simulated.commands[0]?.command ?? this.simulation.commandForPlayer(player, new Map());
            this.simulation.updatePlayer(player, command, this.fixedDt);
            this.simulation.tick = tick;
        }
        return this.state();
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
}
