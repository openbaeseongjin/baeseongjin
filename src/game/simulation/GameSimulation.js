import { Vector2 } from "../../game-kit/index.js";
import { ARTIFACT_CATALOG, getArtifactEffects } from "../artifacts/ArtifactCatalog.js";
import {
    distancePointToSegment,
    updateAutomaticWeapon,
    updateEnemyProjectiles,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../combat/CombatSystems.js";
import { ARTIFACT_CONFIG, COMBAT_CONFIG, PLAYER_CONFIG, ROPE_CONFIG, WORLD_CONFIG } from "../config.js";
import { RunMetrics } from "../metrics/RunMetrics.js";
import { createPredictableResolveEvent, createPredictableSpawnEvent } from "../network/PredictableObjectEvent.js";
import { resolvePlayerCollisions } from "../physics/PlayerCollision.js";
import { createPlayerRuntime } from "../players/PlayerRuntimeFactory.js";
import { advanceArtifactRewardSelection, createArtifactRewardSelection } from "../rewards/ArtifactRewardSelection.js";
import { evaluateSwingDrag, getSwingDragThreshold } from "../rope/SwingDrag.js";
import { closestPointOnSurface, generateWorld } from "../world/WorldGenerator.js";
import { EntityRegistry } from "./EntityRegistry.js";

function vectorState(vector) {
    return vector ? { x: vector.x, y: vector.y } : null;
}

function swingDragState(swingDrag) {
    if (!swingDrag) return null;
    return {
        origin: vectorState(swingDrag.origin),
        direction: vectorState(swingDrag.direction),
        progress: swingDrag.progress,
        age: swingDrag.age,
        used: swingDrag.used
    };
}

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

export class GameSimulation {
    #primaryPlayerId;

    constructor({ worldSeed = WORLD_CONFIG.seed, playerId = null } = {}) {
        this.world = generateWorld({ ...WORLD_CONFIG, seed: worldSeed });
        this.metrics = new RunMetrics();
        this.registry = new EntityRegistry();
        this.players = [];
        const playerRuntime = this.addPlayer(undefined, playerId);
        this.#primaryPlayerId = playerRuntime.entity.id;
        this.enemies = this.createEnemies();
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.eventFlash = { type: "ready", age: 10 };
        this.resets = 0;
        this.runState = "playing";
        this.activeCheckpoint = this.world.checkpoints[0] ?? null;
        this.artifactRewards = new Map();
        this.rewardedCheckpointIds = new Set();
        this.tick = 0;
        this.replicationEvents = [];
    }

    addPlayer(spawn, playerId = null) {
        const runtime = createPlayerRuntime({
            registry: this.registry,
            playerConfig: PLAYER_CONFIG,
            ropeConfig: ROPE_CONFIG,
            combatConfig: COMBAT_CONFIG,
            artifactConfig: ARTIFACT_CONFIG,
            spawn,
            playerId
        });
        this.players.push(runtime.entity);
        return runtime;
    }

    removePlayer(playerId) {
        const index = this.players.findIndex(({ id }) => id === playerId);
        if (index < 0) return false;
        const [removed] = this.players.splice(index, 1);
        const removedReward = this.artifactRewards.get(playerId);
        this.artifactRewards.delete(playerId);
        if (removedReward && this.artifactRewards.size === 0) {
            this.rewardedCheckpointIds.add(removedReward.checkpointId);
        }
        if (removed.id === this.#primaryPlayerId) this.#primaryPlayerId = this.players[0]?.id ?? null;
        return true;
    }

    getPrimaryPlayerId() {
        return this.#primaryPlayerId;
    }

    hasPlayer(playerId) {
        return this.players.some(({ id }) => id === playerId);
    }

    playerIds() {
        return this.players.map(({ id }) => id);
    }

    playerState(playerId) {
        const player = this.#findPlayer(playerId);
        if (!player) return null;
        return {
            id: player.id,
            position: vectorState(player.physics.position),
            velocity: vectorState(player.physics.velocity),
            isGrounded: player.physics.isGrounded,
            health: player.health,
            maxHealth: player.maxHealth,
            hitInvulnerabilityRemaining: player.hitInvulnerabilityRemaining,
            ropeDisabledRemaining: player.ropeDisabledRemaining,
            lifeState: player.lifeState,
            rope: {
                isAttached: player.rope.isAttached,
                anchor: vectorState(player.rope.anchor),
                length: player.rope.length,
                currentLength: player.rope.currentLength,
                tension: player.rope.tension
            },
            control: {
                aimWorld: vectorState(player.aimWorld),
                lastPointer: { ...player.lastPointer },
                lastViewport: { ...player.lastViewport },
                wasPointerDown: player.wasPointerDown,
                attachBufferRemaining: player.attachBufferRemaining,
                swingDrag: swingDragState(player.swingDrag)
            },
            weapon: {
                range: player.weapon.range,
                damage: player.weapon.damage,
                fireInterval: player.weapon.fireInterval,
                cooldown: player.weapon.cooldown
            },
            artifacts: player.artifacts.snapshot(),
            ropeDamageBoostRemaining: player.ropeDamageBoostRemaining,
            lastCheckpointLoss: [...player.lastCheckpointLoss]
        };
    }

    playerStates() {
        return this.players.map(({ id }) => this.playerState(id));
    }

    enemyStates() {
        return this.enemies.map((enemy) => ({
            id: enemy.id,
            position: vectorState(enemy.position),
            level: enemy.level,
            radius: enemy.radius,
            health: enemy.health,
            maxHealth: enemy.maxHealth,
            fireCooldown: enemy.fireCooldown
        }));
    }

    getArtifactReward(playerId) {
        return this.artifactRewards.get(playerId) ?? null;
    }

    getTick() {
        return this.tick;
    }

    releasePlayerRope(playerId) {
        const player = this.#requirePlayer(playerId);
        const released = player.rope.isAttached;
        player.rope.detach();
        player.swingDrag = null;
        return released;
    }

    applyOwnerMotion(playerId, state, { synchronizeRope = true } = {}) {
        const player = this.#requirePlayer(playerId);
        player.physics.position.set(state.position.x, state.position.y);
        player.physics.velocity.set(state.velocity.x, state.velocity.y);
        player.physics.isGrounded = state.isGrounded;
        if (player.ropeDisabledRemaining > 0) {
            this.releasePlayerRope(playerId);
        } else if (synchronizeRope && state.rope.isAttached) {
            player.rope.attach(player.physics.position, state.rope.anchor);
        } else if (synchronizeRope) {
            this.releasePlayerRope(playerId);
        }
        return true;
    }

    preparePrediction(enemies = []) {
        this.enemies = enemies.map((enemy) => ({
            ...enemy,
            position: new Vector2(enemy.position.x, enemy.position.y)
        }));
        this.projectiles = [];
        this.enemyProjectiles = [];
    }

    restorePrediction(playerId, state, serverTick = this.tick) {
        const player = this.#requirePlayer(playerId);
        this.#restorePlayer(player, state);
        this.tick = serverTick;
        return this.predictionState(playerId);
    }

    applyPredictionOutcomes(playerId, authoritative, serverTick) {
        const player = this.#requirePlayer(playerId);
        const lifeStateChanged = player.lifeState !== authoritative.lifeState;
        player.health = authoritative.health;
        player.maxHealth = authoritative.maxHealth;
        player.hitInvulnerabilityRemaining = Math.max(
            player.hitInvulnerabilityRemaining,
            authoritative.hitInvulnerabilityRemaining
        );
        player.ropeDisabledRemaining = Math.max(player.ropeDisabledRemaining, authoritative.ropeDisabledRemaining);
        player.lifeState = authoritative.lifeState;
        player.weapon.range = authoritative.weapon.range;
        player.weapon.damage = authoritative.weapon.damage;
        player.weapon.fireInterval = authoritative.weapon.fireInterval;
        player.artifacts.replace(authoritative.artifacts);
        player.lastCheckpointLoss = [...authoritative.lastCheckpointLoss];
        if (authoritative.ropeDisabledRemaining > 0) this.releasePlayerRope(playerId);
        if (lifeStateChanged) {
            this.#restorePlayer(player, authoritative);
            this.tick = Math.max(this.tick, serverTick);
        }
        return { lifeStateChanged, state: this.predictionState(playerId) };
    }

    advancePrediction(playerId, command, dt, tick) {
        const player = this.#requirePlayer(playerId);
        const projectile = this.updatePlayer(player, command, dt);
        this.projectiles.length = 0;
        this.tick = tick;
        return projectile;
    }

    idlePlayerCommand(playerId) {
        return this.commandForPlayer(this.#requirePlayer(playerId), new Map());
    }

    applyPredictedImpact(playerId, event) {
        const player = this.#requirePlayer(playerId);
        if (event.resolution === "rope-cut") {
            this.releasePlayerRope(playerId);
            player.ropeDisabledRemaining = COMBAT_CONFIG.ropeDisabledSeconds;
            return true;
        }
        if (event.resolution !== "player-hit") return false;
        const speed = Math.hypot(event.velocity?.x ?? 0, event.velocity?.y ?? 0);
        if (speed > 0) {
            player.physics.addImpulse(
                new Vector2(event.velocity.x / speed, event.velocity.y / speed),
                COMBAT_CONFIG.playerHitKnockback
            );
        }
        player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
        return true;
    }

    resolvePlayerCollisions(playerId, otherPlayers, radius) {
        return resolvePlayerCollisions(this.#requirePlayer(playerId), otherPlayers, radius);
    }

    predictionState(playerId) {
        const state = this.playerState(playerId);
        if (!state) return null;
        return {
            tick: this.tick,
            position: state.position,
            velocity: state.velocity,
            isGrounded: state.isGrounded,
            lifeState: state.lifeState,
            rope: state.rope,
            swingDrag: state.control.swingDrag,
            ropeDamageBoostRemaining: state.ropeDamageBoostRemaining
        };
    }

    #findPlayer(playerId) {
        return this.players.find(({ id }) => id === playerId) ?? null;
    }

    #requirePlayer(playerId) {
        const player = this.#findPlayer(playerId);
        if (!player) throw new Error(`unknown playerId: ${playerId}`);
        return player;
    }

    #primaryPlayer() {
        return this.#requirePlayer(this.#primaryPlayerId);
    }

    #restorePlayer(player, state) {
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
        player.weapon.range = state.weapon.range;
        player.weapon.damage = state.weapon.damage;
        player.weapon.fireInterval = state.weapon.fireInterval;
        player.weapon.cooldown = state.weapon.cooldown;
        player.artifacts.replace(state.artifacts);
        player.ropeDamageBoostRemaining = state.ropeDamageBoostRemaining;
        player.lastCheckpointLoss = [...state.lastCheckpointLoss];
        player.attachmentCandidate = this.findAttachment(player.aimWorld, player);
    }

    step(dt, command) {
        return this.stepPlayers(dt, new Map([[this.#primaryPlayerId, command]]));
    }

    stepCommandBatch(dt, batch) {
        const expectedTick = this.tick + 1;
        if (batch.tick !== expectedTick) throw new Error(`command batch tick ${batch.tick} must equal ${expectedTick}`);
        const playersById = new Map(this.players.map((player) => [player.id, player]));
        const commandsByPlayerId = new Map();
        for (const entry of batch.commands) {
            if (!playersById.has(entry.playerId)) throw new Error(`unknown playerId: ${entry.playerId}`);
            commandsByPlayerId.set(entry.playerId, entry.command);
        }
        return this.stepPlayers(dt, commandsByPlayerId);
    }

    stepPlayers(dt, commandsByPlayerId) {
        this.tick += 1;
        if (this.runState !== "playing") {
            this.eventFlash.age += dt;
            return;
        }
        if (this.#primaryPlayer().physics.position.distanceTo(this.world.summit) <= this.world.summit.radius) {
            this.beginCompletion();
            return;
        }
        this.updateCheckpointProgress();
        const choosingRewardPlayerIds = new Set(this.artifactRewards.keys());
        this.updateArtifactRewards(commandsByPlayerId);
        const gameplayCommands = new Map(commandsByPlayerId);
        for (const playerId of choosingRewardPlayerIds) {
            const player = this.players.find(({ id }) => id === playerId);
            if (!player) continue;
            gameplayCommands.set(
                playerId,
                this.commandWhileChoosingReward(player, this.commandForPlayer(player, commandsByPlayerId))
            );
        }
        this.metrics.recordActiveTime(dt);
        for (const player of this.players) {
            const playerCommand = this.commandForPlayer(player, gameplayCommands);
            const projectile = this.updatePlayer(player, playerCommand, dt);
            if (projectile) this.recordProjectileSpawn(projectile, "player-projectile");
        }
        const playerProjectileEvents = updatePlayerProjectiles({
            projectiles: this.projectiles,
            enemies: this.enemies,
            config: COMBAT_CONFIG,
            dt
        });
        const enemyProjectileSpawns = updateEnemyWeapons({
            enemies: this.enemies,
            targets: this.players,
            projectiles: this.enemyProjectiles,
            registry: this.registry,
            config: COMBAT_CONFIG,
            dt
        });
        for (const projectile of enemyProjectileSpawns) this.recordProjectileSpawn(projectile, "enemy-projectile");
        const enemyProjectileEvents = updateEnemyProjectiles({
            projectiles: this.enemyProjectiles,
            targets: this.players,
            config: COMBAT_CONFIG,
            dt
        });
        const combatEvents = [...playerProjectileEvents.hits, ...enemyProjectileEvents.hits];
        const hitByProjectileId = new Map(combatEvents.map((event) => [event.projectileId, event]));
        for (const resolution of [...playerProjectileEvents.resolutions, ...enemyProjectileEvents.resolutions]) {
            this.recordProjectileResolution(resolution, hitByProjectileId.get(resolution.projectileId));
        }
        this.metrics.recordCombat(playerProjectileEvents, enemyProjectileEvents);
        for (const ropeCut of enemyProjectileEvents.ropeCuts) {
            const player = this.players.find(({ id }) => id === ropeCut.playerId);
            if (player) player.swingDrag = null;
            this.eventFlash = { type: "rope-cut", age: 0, position: ropeCut.position, playerId: ropeCut.playerId };
        }
        this.enemies = this.enemies.filter((enemy) => enemy.health > 0);
        for (const player of this.players) {
            if (player.health <= 0) this.respawnPlayerAtCheckpoint(player, "health");
        }
        this.recoverFallenPlayers();
        this.eventFlash.age += dt;
    }

    recoverFallenPlayers() {
        const fallenPlayerIds = [];
        for (const player of this.players) {
            if (player.physics.position.isFinite() && player.physics.position.y <= WORLD_CONFIG.floorY + 780) {
                continue;
            }
            this.respawnPlayerAtCheckpoint(player, "fall");
            fallenPlayerIds.push(player.id);
        }
        return fallenPlayerIds;
    }

    resolvePlayerFall(playerId) {
        if (this.runState !== "playing") return false;
        const player = this.players.find(({ id }) => id === playerId);
        if (!player) return false;
        return this.respawnPlayerAtCheckpoint(player, "fall");
    }

    commandForPlayer(player, commandsByPlayerId) {
        return (
            commandsByPlayerId.get(player.id) ?? {
                horizontal: 0,
                vertical: 0,
                interact: false,
                pointer: player.lastPointer,
                viewport: player.lastViewport,
                aimWorld: player.aimWorld
            }
        );
    }

    commandWhileChoosingReward(player, command) {
        return {
            ...command,
            horizontal: 0,
            vertical: 0,
            interact: false,
            pointer: { ...command.pointer, down: false, pressed: false, released: false },
            aimWorld: command.aimWorld ?? player.aimWorld
        };
    }

    updatePlayer(player, command, dt) {
        const canControl = player.lifeState === "active";
        const effectiveCommand = canControl
            ? command
            : {
                  horizontal: 0,
                  vertical: 0,
                  interact: false,
                  pointer: { x: 0, y: 0, down: false },
                  aimWorld: player.aimWorld
              };
        player.ropeDisabledRemaining = Math.max(0, player.ropeDisabledRemaining - dt);
        player.hitInvulnerabilityRemaining = Math.max(0, player.hitInvulnerabilityRemaining - dt);
        player.ropeDamageBoostRemaining = Math.max(0, player.ropeDamageBoostRemaining - dt);
        this.applyArtifactEffects(player);
        player.lastPointer = effectiveCommand.pointer;
        player.lastViewport = effectiveCommand.viewport ?? player.lastViewport;
        player.aimWorld = effectiveCommand.aimWorld;
        player.attachmentCandidate = canControl ? this.findAttachment(player.aimWorld, player) : null;
        if (effectiveCommand.pointer.down && !player.wasPointerDown) {
            player.attachBufferRemaining = ROPE_CONFIG.attachBufferSeconds;
        }
        if (
            effectiveCommand.pointer.down &&
            !player.rope.isAttached &&
            player.ropeDisabledRemaining <= 0 &&
            player.attachBufferRemaining > 0 &&
            player.attachmentCandidate
        ) {
            if (player.rope.attach(player.physics.position, player.attachmentCandidate)) {
                this.eventFlash = { type: "attach", age: 0 };
                player.swingDrag = {
                    origin: { x: effectiveCommand.pointer.x, y: effectiveCommand.pointer.y },
                    direction: null,
                    progress: 0,
                    age: 0,
                    used: false
                };
                player.attachBufferRemaining = 0;
            }
        }
        if (effectiveCommand.pointer.down && player.rope.isAttached) {
            this.updatePlayerSwingDrag(player, effectiveCommand.pointer, effectiveCommand.viewport, dt);
        }
        if (!effectiveCommand.pointer.down && player.wasPointerDown && player.rope.isAttached) {
            player.rope.detach();
            this.eventFlash = { type: "release", age: 0 };
            player.swingDrag = null;
        }
        player.attachBufferRemaining = Math.max(0, player.attachBufferRemaining - dt);
        player.wasPointerDown = effectiveCommand.pointer.down;
        player.physics.step(dt, effectiveCommand, this.world.surfaces, player.rope);
        return updateAutomaticWeapon({
            owner: player,
            enemies: this.enemies,
            projectiles: this.projectiles,
            registry: this.registry,
            config: COMBAT_CONFIG,
            dt
        });
    }

    updateCheckpointProgress() {
        for (const checkpoint of this.world.checkpoints) {
            if (checkpoint.level <= (this.activeCheckpoint?.level ?? -1)) continue;
            const reached = this.players.some(
                (player) =>
                    player.lifeState === "active" && player.physics.position.distanceTo(checkpoint) <= checkpoint.radius
            );
            if (!reached) continue;
            this.activeCheckpoint = checkpoint;
            this.metrics.recordCheckpoint();
            this.eventFlash = { type: "checkpoint", age: 0, position: checkpoint };
            if (checkpoint.level > 0 && !this.rewardedCheckpointIds.has(checkpoint.id)) {
                this.beginArtifactReward(checkpoint);
            }
        }
    }

    beginArtifactReward(checkpoint) {
        this.metrics.recordFirstReward();
        for (const player of this.players) {
            this.artifactRewards.set(
                player.id,
                createArtifactRewardSelection({
                    checkpointId: checkpoint.id,
                    choices: ARTIFACT_CATALOG,
                    selectedIndex: 0
                })
            );
            player.rope.detach();
            player.swingDrag = null;
        }
    }

    updateArtifactRewards(commandsByPlayerId) {
        for (const [playerId, reward] of [...this.artifactRewards]) {
            const player = this.players.find(({ id }) => id === playerId);
            if (!player) {
                this.artifactRewards.delete(playerId);
                continue;
            }
            this.updateArtifactReward(player, reward, this.commandForPlayer(player, commandsByPlayerId));
        }
    }

    updateArtifactReward(player, reward, command) {
        const outcome = advanceArtifactRewardSelection(reward, command);
        this.artifactRewards.set(player.id, outcome.selection);
        if (outcome.confirmedArtifactId) {
            this.resolveArtifactSelection(player.id, {
                checkpointId: reward.checkpointId,
                artifactId: outcome.confirmedArtifactId
            });
        }
    }

    resolveArtifactSelection(playerId, { checkpointId, artifactId }) {
        const player = this.players.find(({ id }) => id === playerId);
        if (!player) return Object.freeze({ accepted: false, reason: "player-not-found" });
        const reward = this.artifactRewards.get(playerId);
        if (!reward) return Object.freeze({ accepted: false, reason: "reward-unavailable" });
        if (reward.checkpointId !== checkpointId) {
            return Object.freeze({ accepted: false, reason: "checkpoint-mismatch" });
        }
        const selected = reward.choices.find(({ id }) => id === artifactId);
        if (!selected) return Object.freeze({ accepted: false, reason: "artifact-unavailable" });

        player.artifacts.add(selected);
        this.artifactRewards.delete(player.id);
        this.applyArtifactEffects(player);
        this.eventFlash = {
            type: "artifact",
            age: 0,
            artifact: selected,
            playerId: player.id,
            position: player.physics.position.clone()
        };
        if (this.artifactRewards.size === 0) this.rewardedCheckpointIds.add(reward.checkpointId);
        return Object.freeze({ accepted: true, checkpointId, artifactId });
    }

    applyArtifactEffects(player = this.#primaryPlayer()) {
        const effects = getArtifactEffects(player.artifacts.snapshot(), player.ropeDamageBoostRemaining);
        player.weapon.damage = player.weapon.baseDamage * effects.damageMultiplier;
        player.weapon.fireInterval = player.weapon.baseFireInterval * effects.fireIntervalMultiplier;
    }

    updateSwingDrag(pointer, viewport, dt) {
        this.updatePlayerSwingDrag(this.#primaryPlayer(), pointer, viewport, dt);
    }

    updatePlayerSwingDrag(player, pointer, viewport, dt) {
        if (!player.swingDrag || player.swingDrag.used || !player.rope.anchor) return;
        player.swingDrag.age += dt;
        const evaluation = evaluateSwingDrag({
            anchor: player.rope.anchor,
            playerPosition: player.physics.position,
            drag: { x: pointer.x - player.swingDrag.origin.x, y: pointer.y - player.swingDrag.origin.y },
            threshold: getSwingDragThreshold(viewport, ROPE_CONFIG.swingDragThresholdViewportRatio)
        });
        if (!evaluation) return;
        player.swingDrag.direction = evaluation.direction;
        player.swingDrag.progress = evaluation.progress;
        if (!evaluation.triggered || player.swingDrag.age < ROPE_CONFIG.swingDragMinHoldSeconds) return;
        player.physics.addImpulse(evaluation.direction, ROPE_CONFIG.swingImpulse);
        const effects = getArtifactEffects(player.artifacts?.snapshot() ?? []);
        player.ropeDamageBoostRemaining = effects.swingDamageDuration;
        if (player.weapon) this.applyArtifactEffects(player);
        player.swingDrag.used = true;
        this.eventFlash = { type: "swing", age: 0 };
    }

    createEnemies() {
        return this.world.enemySpawns.map((spawn) => ({
            id: this.registry.createId("enemy"),
            position: new Vector2(spawn.x, spawn.y),
            level: spawn.level,
            radius: COMBAT_CONFIG.enemyRadius,
            health: COMBAT_CONFIG.enemyHealth,
            maxHealth: COMBAT_CONFIG.enemyHealth,
            fireCooldown: COMBAT_CONFIG.enemyFireInterval
        }));
    }

    recordProjectileSpawn(projectile, objectType) {
        if (objectType === "player-projectile") projectile.predictionId = `${projectile.ownerId}:${this.tick}`;
        this.replicationEvents.push(
            createPredictableSpawnEvent({
                eventId: this.registry.createId("event"),
                objectId: projectile.id,
                objectType,
                spawnTick: this.tick,
                position: projectile.position,
                velocity: projectile.velocity,
                parameters: {
                    ownerId: projectile.ownerId,
                    targetId: projectile.targetId ?? null,
                    predictionId: projectile.predictionId ?? null,
                    radius: projectile.radius,
                    damage: projectile.damage,
                    speed:
                        objectType === "player-projectile"
                            ? COMBAT_CONFIG.projectileSpeed
                            : COMBAT_CONFIG.enemyProjectileSpeed
                }
            })
        );
    }

    resolvePlayerProjectileClaim(authenticatedPlayerId, claim, { positionTolerance = 40 } = {}) {
        const projectile = this.projectiles.find(({ predictionId }) => predictionId === claim.predictionId);
        if (!projectile) return Object.freeze({ accepted: false, reason: "projectile-missing" });
        if (projectile.ownerId !== authenticatedPlayerId) {
            return Object.freeze({ accepted: false, reason: "projectile-ownership" });
        }
        if (projectile.targetId !== claim.targetId) {
            return Object.freeze({ accepted: false, reason: "target-mismatch" });
        }
        const target = this.enemies.find((enemy) => enemy.id === claim.targetId && enemy.health > 0);
        if (!target) return Object.freeze({ accepted: false, reason: "target-missing" });
        const targetDistance = Math.hypot(claim.position.x - target.position.x, claim.position.y - target.position.y);
        if (targetDistance > target.radius + projectile.radius + positionTolerance) {
            return Object.freeze({ accepted: false, reason: "position-mismatch" });
        }
        const projectileDistance = Math.hypot(
            claim.position.x - projectile.position.x,
            claim.position.y - projectile.position.y
        );
        const predictedTravel =
            (COMBAT_CONFIG.projectileSpeed * Math.max(0, claim.clientTick - this.tick)) / 120 + positionTolerance;
        if (projectileDistance > predictedTravel + target.radius + projectile.radius) {
            return Object.freeze({ accepted: false, reason: "trajectory-mismatch" });
        }
        this.projectiles = this.projectiles.filter(({ id }) => id !== projectile.id);
        target.health = Math.max(0, target.health - projectile.damage);
        const resolution = target.health <= 0 ? "enemy-defeated" : "enemy-hit";
        this.recordProjectileResolution(
            { projectileId: projectile.id, resolution, position: target.position },
            { damage: projectile.damage }
        );
        if (resolution === "enemy-defeated") this.metrics.enemyDefeats += 1;
        this.enemies = this.enemies.filter(({ health }) => health > 0);
        return Object.freeze({ accepted: true, resolution, damage: projectile.damage });
    }

    resolveEnemyProjectileClaim(authenticatedPlayerId, claim, { positionTolerance = 40 } = {}) {
        const player = this.players.find(({ id }) => id === authenticatedPlayerId);
        if (!player) return Object.freeze({ accepted: false, reason: "player-missing" });
        const projectile = this.enemyProjectiles.find(({ id }) => id === claim.projectileId);
        if (!projectile) return Object.freeze({ accepted: false, reason: "projectile-missing" });
        const futureTicks = Math.max(0, claim.clientTick - this.tick);
        const travelAllowance = (COMBAT_CONFIG.enemyProjectileSpeed * futureTicks) / 120 + positionTolerance;
        if (
            Math.hypot(claim.position.x - projectile.position.x, claim.position.y - projectile.position.y) >
            travelAllowance
        ) {
            return Object.freeze({ accepted: false, reason: "trajectory-mismatch" });
        }
        if (claim.impactType === "rope-cut") {
            if (
                !player.rope.isAttached ||
                distancePointToSegment(claim.position, player.physics.position, player.rope.anchor) >
                    projectile.radius + positionTolerance
            ) {
                return Object.freeze({ accepted: false, reason: "rope-mismatch" });
            }
            player.rope.detach();
            player.swingDrag = null;
            player.ropeDisabledRemaining = COMBAT_CONFIG.ropeDisabledSeconds;
            this.eventFlash = {
                type: "rope-cut",
                age: 0,
                position: new Vector2(claim.position.x, claim.position.y),
                playerId: player.id
            };
        } else {
            if (player.health <= 0 || player.hitInvulnerabilityRemaining > 0) {
                return Object.freeze({ accepted: false, reason: "player-ineligible" });
            }
            if (
                Math.hypot(claim.position.x - player.physics.position.x, claim.position.y - player.physics.position.y) >
                player.physics.config.radius + projectile.radius + positionTolerance
            ) {
                return Object.freeze({ accepted: false, reason: "position-mismatch" });
            }
            player.health = Math.max(0, player.health - projectile.damage);
            const speed = projectile.velocity.length();
            if (speed > 0) {
                player.physics.addImpulse(
                    projectile.velocity.clone().scale(1 / speed),
                    COMBAT_CONFIG.playerHitKnockback
                );
            }
            player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
        }
        this.enemyProjectiles = this.enemyProjectiles.filter(({ id }) => id !== projectile.id);
        this.recordProjectileResolution(
            {
                projectileId: projectile.id,
                resolution: claim.impactType,
                position: new Vector2(claim.position.x, claim.position.y)
            },
            claim.impactType === "player-hit" ? { damage: projectile.damage } : null
        );
        if (claim.impactType === "player-hit" && player.health <= 0) {
            this.respawnPlayerAtCheckpoint(player, "health");
        }
        return Object.freeze({ accepted: true, resolution: claim.impactType, damage: projectile.damage });
    }

    recordReplicationEvent(eventType, payload) {
        this.replicationEvents.push(
            Object.freeze({
                ...payload,
                eventId: this.registry.createId("event"),
                eventType,
                tick: this.tick
            })
        );
    }

    recordProjectileResolution({ projectileId, resolution, position }, combatEvent = null) {
        if (!projectileId) return;
        this.replicationEvents.push(
            createPredictableResolveEvent({
                eventId: this.registry.createId("event"),
                objectId: projectileId,
                tick: this.tick,
                resolution,
                position,
                parameters: combatEvent ? { damage: combatEvent.damage } : {}
            })
        );
    }

    drainReplicationEvents() {
        const events = Object.freeze(this.replicationEvents);
        this.replicationEvents = [];
        return events;
    }

    findAttachment(aimPoint, player = this.#primaryPlayer()) {
        let best = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const surface of this.world.surfaces) {
            const point = closestPointOnSurface(aimPoint, surface);
            const playerDistance = player.physics.position.distanceTo(point);
            if (playerDistance > ROPE_CONFIG.maxAttachDistance) continue;
            const aimDistance = Math.hypot(point.x - aimPoint.x, point.y - aimPoint.y);
            const score = aimDistance * 2 + playerDistance * 0.05;
            if (aimDistance <= 90 && score < bestScore) {
                best = point;
                bestScore = score;
            }
        }
        return best;
    }

    respawnPlayerAtCheckpoint(player, reason) {
        if (!player || this.runState !== "playing") return false;
        const respawnPosition = this.activeCheckpoint ?? { x: 120, y: 500 };
        this.metrics.recordDefeat();
        player.physics.reset(respawnPosition);
        player.rope.detach();
        player.attachmentCandidate = null;
        player.wasPointerDown = false;
        player.lastPointer = Object.freeze({ x: 0, y: 0, down: false });
        player.attachBufferRemaining = 0;
        player.swingDrag = null;
        player.health = player.maxHealth;
        player.weapon.cooldown = 0;
        player.hitInvulnerabilityRemaining = 0;
        player.ropeDisabledRemaining = 0;
        player.lifeState = "active";
        player.lastCheckpointLoss = player.artifacts.applyCheckpointLoss();
        player.ropeDamageBoostRemaining = 0;
        this.applyArtifactEffects(player);
        const artifactIds = player.lastCheckpointLoss.map(({ id }) => id);
        if (artifactIds.length > 0) {
            this.recordReplicationEvent("artifact-loss", {
                playerId: player.id,
                artifactIds
            });
        }
        if (artifactIds.length > 0) {
            this.eventFlash = {
                type: "artifact-loss",
                age: 0,
                playerId: player.id,
                reason,
                artifacts: [...player.lastCheckpointLoss],
                position: player.physics.position.clone()
            };
        } else {
            this.eventFlash = {
                type: "checkpoint-respawn",
                age: 0,
                playerId: player.id,
                reason,
                position: player.physics.position.clone()
            };
        }
        this.recordReplicationEvent("player-respawned", {
            playerId: player.id,
            reason,
            health: player.health,
            artifactIds,
            position: { x: player.physics.position.x, y: player.physics.position.y }
        });
        this.resets += 1;
        return true;
    }

    beginCompletion() {
        if (this.runState !== "playing") return;
        this.runState = "completed";
        const player = this.#primaryPlayer();
        player.rope.detach();
        player.swingDrag = null;
        this.eventFlash = { type: "completed", age: 0, position: this.world.summit };
    }

    snapshot() {
        const player = this.#primaryPlayer();
        return {
            tick: this.tick,
            world: this.world,
            player: player.physics,
            rope: player.rope,
            aimWorld: player.aimWorld,
            attachmentCandidate: player.attachmentCandidate,
            eventFlash: this.eventFlash,
            swingDrag: player.swingDrag,
            enemies: this.enemies,
            projectiles: this.projectiles,
            enemyProjectiles: this.enemyProjectiles,
            playerHealth: player.health,
            playerMaxHealth: player.maxHealth,
            ropeDisabledRemaining: player.ropeDisabledRemaining,
            playerLifeState: player.lifeState,
            runState: this.runState,
            activeCheckpoint: this.activeCheckpoint,
            artifacts: player.artifacts.snapshot(),
            lastCheckpointLoss: [...player.lastCheckpointLoss],
            artifactReward: this.artifactRewards.get(player.id) ?? null,
            artifactRewards: Object.fromEntries(this.artifactRewards),
            rewardedCheckpointIds: [...this.rewardedCheckpointIds],
            ropeDamageBoostRemaining: player.ropeDamageBoostRemaining,
            metrics: this.metrics.snapshot(),
            resets: this.resets,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance
        };
    }
}
