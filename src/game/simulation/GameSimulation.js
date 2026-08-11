import { Vector2 } from "../../game-kit/index.js";
import { ARTIFACT_CATALOG, getArtifactEffects } from "../artifacts/ArtifactCatalog.js";
import {
    advanceEnemyProjectiles,
    selectNearestEnemy,
    updateAutomaticWeapon,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../combat/CombatSystems.js";
import { EnemyObject } from "../combat/EnemyObject.js";
import { ARTIFACT_CONFIG, COMBAT_CONFIG, PLAYER_CONFIG, ROPE_CONFIG, WORLD_CONFIG } from "../config.js";
import { InputDispatcher } from "../input/InputDispatcher.js";
import { findRopeAttachment } from "../input/RopePointerInput.js";
import { RunMetrics } from "../metrics/RunMetrics.js";
import { createPredictableResolveEvent, createPredictableSpawnEvent } from "../network/PredictableObjectEvent.js";
import { resolvePlayerCollisions } from "../physics/PlayerCollision.js";
import { createPlayerRuntime } from "../players/PlayerRuntimeFactory.js";
import { advanceArtifactRewardSelection, createArtifactRewardSelection } from "../rewards/ArtifactRewardSelection.js";
import { generateWorld } from "../world/WorldGenerator.js";
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
    #inputDispatcher;
    #inputDrivenObjectsByOwner;

    constructor({ worldSeed = WORLD_CONFIG.seed, playerId = null } = {}) {
        this.world = generateWorld({ ...WORLD_CONFIG, seed: worldSeed });
        this.metrics = new RunMetrics();
        this.registry = new EntityRegistry();
        this.#inputDispatcher = new InputDispatcher();
        this.#inputDrivenObjectsByOwner = new Map();
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
        this.#inputDrivenObjectsByOwner.set(runtime.entity.id, runtime.inputDrivenObjects);
        return runtime;
    }

    removePlayer(playerId) {
        const index = this.players.findIndex(({ id }) => id === playerId);
        if (index < 0) return false;
        const [removed] = this.players.splice(index, 1);
        this.#inputDrivenObjectsByOwner.delete(playerId);
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

    inputDrivenObjects(ownerId) {
        return this.#inputDrivenObjectsByOwner.get(ownerId) ?? Object.freeze([]);
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
                isAttached: player.ropeObject.rope.isAttached,
                anchor: vectorState(player.ropeObject.rope.anchor),
                length: player.ropeObject.rope.length,
                currentLength: player.ropeObject.rope.currentLength,
                tension: player.ropeObject.rope.tension
            },
            control: {
                aimWorld: vectorState(player.ropeObject.aimWorld),
                lastPointer: { ...player.ropeObject.lastPointer },
                lastViewport: { ...player.ropeObject.lastViewport },
                wasPointerDown: player.ropeObject.wasPointerDown,
                attachBufferRemaining: player.ropeObject.attachBufferRemaining,
                swingDrag: swingDragState(player.ropeObject.swingDrag)
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
        const released = player.ropeObject.rope.isAttached;
        player.ropeObject.rope.detach();
        player.ropeObject.swingDrag = null;
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
            player.ropeObject.rope.attach(player.physics.position, state.rope.anchor);
        } else if (synchronizeRope) {
            this.releasePlayerRope(playerId);
        }
        return true;
    }

    preparePrediction(enemies = [], activeCheckpointId = this.activeCheckpoint?.id ?? null) {
        if (activeCheckpointId !== null && activeCheckpointId !== undefined) {
            const activeCheckpoint = this.world.checkpoints.find(({ id }) => id === activeCheckpointId);
            if (!activeCheckpoint) throw new Error(`unknown active checkpoint: ${activeCheckpointId}`);
            this.activeCheckpoint = activeCheckpoint;
        }
        this.enemies = enemies.map(
            (enemy) =>
                new EnemyObject({
                    ...enemy,
                    position: new Vector2(enemy.position.x, enemy.position.y)
                })
        );
        this.projectiles = [];
        this.enemyProjectiles = [];
    }

    restoreOwnerPrediction(ownerId, state, serverTick = this.tick) {
        const player = this.#requirePlayer(ownerId);
        this.#restorePlayer(player, state);
        this.tick = serverTick;
        return this.ownerPredictionState(ownerId);
    }

    applyOwnerPredictionOutcomes(
        ownerId,
        authoritative,
        predictionTick,
        { preserveRopeBoost = false, preserveWeaponCooldown = false, preserveImpactPrediction = false } = {}
    ) {
        const player = this.#requirePlayer(ownerId);
        const lifeStateChanged = !preserveImpactPrediction && player.lifeState !== authoritative.lifeState;
        if (!preserveImpactPrediction) {
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
            if (!preserveWeaponCooldown) player.weapon.cooldown = authoritative.weapon.cooldown;
            player.artifacts.replace(authoritative.artifacts);
            if (!preserveRopeBoost) player.ropeDamageBoostRemaining = authoritative.ropeDamageBoostRemaining;
            player.lastCheckpointLoss = [...authoritative.lastCheckpointLoss];
            this.applyArtifactEffects(player);
            if (authoritative.ropeDisabledRemaining > 0) this.releasePlayerRope(ownerId);
        }
        if (lifeStateChanged) {
            this.#restorePlayer(player, authoritative);
        }
        this.tick = Math.max(this.tick, predictionTick);
        return { lifeStateChanged, state: this.ownerPredictionState(ownerId) };
    }

    advanceOwnerPrediction(ownerId, command, dt, tick) {
        const player = this.#requirePlayer(ownerId);
        this.#prepareOwnerStep(player, dt);
        const inputOutcome = this.dispatchOwnerInput(ownerId, command, dt);
        const projectile = this.#advanceAutomaticWeapon(player, dt);
        this.projectiles.length = 0;
        this.tick = tick;
        return Object.freeze({ projectile, swingTriggered: inputOutcome.swingTriggered });
    }

    restorePredictedRopeBoost(ownerId, remaining) {
        if (!Number.isFinite(remaining) || remaining < 0) throw new Error("remaining must be non-negative");
        const player = this.#requirePlayer(ownerId);
        player.ropeDamageBoostRemaining = remaining;
        this.applyArtifactEffects(player);
        return this.ownerPredictionState(ownerId);
    }

    restorePredictedWeaponCooldown(ownerId, remaining) {
        if (!Number.isFinite(remaining) || remaining < 0) throw new Error("remaining must be non-negative");
        const player = this.#requirePlayer(ownerId);
        player.weapon.cooldown = remaining;
        return this.ownerPredictionState(ownerId);
    }

    idleOwnerCommand(ownerId) {
        return this.commandForPlayer(this.#requirePlayer(ownerId), new Map());
    }

    applyPredictedOwnerImpact(ownerId, event) {
        const player = this.#requirePlayer(ownerId);
        if (event.resolution === "rope-cut") {
            this.releasePlayerRope(ownerId);
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
        const damage = Number.isFinite(event.parameters?.damage) ? Math.max(0, event.parameters.damage) : 0;
        player.health = Math.max(0, player.health - damage);
        if (player.health <= 0) this.respawnPlayerAtCheckpoint(player, "health");
        return true;
    }

    resolveOwnerCollisions(ownerId, otherPlayers, radius) {
        return resolvePlayerCollisions(this.#requirePlayer(ownerId), otherPlayers, radius);
    }

    ownerPredictionState(ownerId) {
        const state = this.playerState(ownerId);
        if (!state) return null;
        return {
            tick: this.tick,
            position: state.position,
            velocity: state.velocity,
            isGrounded: state.isGrounded,
            health: state.health,
            maxHealth: state.maxHealth,
            hitInvulnerabilityRemaining: state.hitInvulnerabilityRemaining,
            ropeDisabledRemaining: state.ropeDisabledRemaining,
            lifeState: state.lifeState,
            rope: state.rope,
            swingDrag: state.control.swingDrag,
            ropeDamageBoostRemaining: state.ropeDamageBoostRemaining,
            weaponCooldown: state.weapon.cooldown,
            artifacts: state.artifacts,
            lastCheckpointLoss: state.lastCheckpointLoss
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
            player.ropeObject.rope.anchor = new Vector2(state.rope.anchor.x, state.rope.anchor.y);
            player.ropeObject.rope.length = state.rope.length;
            player.ropeObject.rope.currentLength = state.rope.currentLength;
            player.ropeObject.rope.tension = state.rope.tension;
        } else {
            player.ropeObject.rope.detach();
        }
        player.ropeObject.aimWorld = { ...state.control.aimWorld };
        player.ropeObject.lastPointer = { ...state.control.lastPointer };
        player.ropeObject.lastViewport = { ...state.control.lastViewport };
        player.ropeObject.wasPointerDown = state.control.wasPointerDown;
        player.ropeObject.attachBufferRemaining = state.control.attachBufferRemaining;
        player.ropeObject.swingDrag = cloneSwingDrag(state.control.swingDrag);
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
        player.ropeObject.attachmentCandidate = findRopeAttachment({
            aimPoint: player.ropeObject.aimWorld,
            playerPosition: player.physics.position,
            surfaces: this.world.surfaces,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance
        });
    }

    step(dt, command) {
        return this.stepPlayers(dt, new Map([[this.#primaryPlayerId, command]]));
    }

    stepCommandBatch(
        dt,
        batch,
        {
            recoverPlayerFalls = true,
            resolveCheckpointProgress = true,
            resolveSummitProgress = true,
            resolvePlayerProjectileHits = true,
            spawnPlayerProjectiles = true,
            recoverPlayerDeaths = true,
            resolveArtifactSelections = true,
            advanceInputDrivenObjects = true
        } = {}
    ) {
        const expectedTick = this.tick + 1;
        if (batch.tick !== expectedTick) throw new Error(`command batch tick ${batch.tick} must equal ${expectedTick}`);
        const playersById = new Map(this.players.map((player) => [player.id, player]));
        const commandsByPlayerId = new Map();
        for (const entry of batch.commands) {
            if (!playersById.has(entry.playerId)) throw new Error(`unknown playerId: ${entry.playerId}`);
            commandsByPlayerId.set(entry.playerId, entry.command);
        }
        return this.stepPlayers(dt, commandsByPlayerId, {
            recoverPlayerFalls,
            resolveCheckpointProgress,
            resolveSummitProgress,
            resolvePlayerProjectileHits,
            spawnPlayerProjectiles,
            recoverPlayerDeaths,
            resolveArtifactSelections,
            advanceInputDrivenObjects
        });
    }

    stepPlayers(
        dt,
        commandsByPlayerId,
        {
            recoverPlayerFalls = true,
            resolveCheckpointProgress = true,
            resolveSummitProgress = true,
            resolvePlayerProjectileHits = true,
            spawnPlayerProjectiles = true,
            recoverPlayerDeaths = true,
            resolveArtifactSelections = true,
            advanceInputDrivenObjects = true
        } = {}
    ) {
        this.tick += 1;
        if (this.runState !== "playing") {
            this.eventFlash.age += dt;
            return;
        }
        if (resolveSummitProgress && this.updateSummitProgress()) return;
        if (resolveCheckpointProgress) this.updateCheckpointProgress();
        const choosingRewardPlayerIds = new Set(this.artifactRewards.keys());
        if (resolveArtifactSelections) this.updateArtifactRewards(commandsByPlayerId);
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
            this.#prepareOwnerStep(player, dt);
            if (advanceInputDrivenObjects) this.dispatchOwnerInput(player.id, playerCommand, dt);
            const projectile = this.#advanceAutomaticWeapon(player, dt, spawnPlayerProjectiles);
            if (projectile) this.recordProjectileSpawn(projectile, "player-projectile");
        }
        const playerProjectileEvents = updatePlayerProjectiles({
            projectiles: this.projectiles,
            enemies: this.enemies,
            config: COMBAT_CONFIG,
            dt,
            resolveHits: resolvePlayerProjectileHits,
            maxLifetimeSeconds: COMBAT_CONFIG.playerProjectileLifetimeSeconds
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
        const enemyProjectileLifecycle = advanceEnemyProjectiles({
            projectiles: this.enemyProjectiles,
            dt,
            maxLifetimeSeconds: COMBAT_CONFIG.enemyProjectileLifetimeSeconds
        });
        for (const projectile of enemyProjectileLifecycle.expired) {
            this.recordProjectileResolution({
                projectileId: projectile.id,
                resolution: "expired",
                position: projectile.position
            });
        }
        const combatEvents = playerProjectileEvents.hits;
        const hitByProjectileId = new Map(combatEvents.map((event) => [event.projectileId, event]));
        for (const resolution of playerProjectileEvents.resolutions) {
            this.recordProjectileResolution(resolution, hitByProjectileId.get(resolution.projectileId));
        }
        this.metrics.recordEnemyOutcomes(playerProjectileEvents);
        this.enemies = this.enemies.filter((enemy) => enemy.health > 0);
        if (recoverPlayerDeaths) {
            for (const player of this.players) {
                if (player.health <= 0) this.respawnPlayerAtCheckpoint(player, "health");
            }
        }
        if (recoverPlayerFalls) this.recoverFallenPlayers();
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
                pointer: player.ropeObject.lastPointer,
                viewport: player.ropeObject.lastViewport,
                aimWorld: player.ropeObject.aimWorld
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
            aimWorld: command.aimWorld ?? player.ropeObject.aimWorld
        };
    }

    dispatchOwnerInput(ownerId, command, dt) {
        const player = this.#requirePlayer(ownerId);
        let swingTriggered = false;
        const canControl = player.lifeState === "active";
        const effectiveCommand = canControl
            ? command
            : {
                  horizontal: 0,
                  vertical: 0,
                  interact: false,
                  pointer: { x: 0, y: 0, down: false },
                  aimWorld: player.ropeObject.aimWorld
              };
        this.#inputDispatcher.dispatch({
            objects: this.inputDrivenObjects(player.id),
            ownerId: player.id,
            input: effectiveCommand,
            context: {
                canControl,
                dt,
                owner: player,
                ropeConfig: ROPE_CONFIG,
                surfaces: this.world.surfaces,
                onFlash: (eventFlash) => {
                    this.eventFlash = eventFlash;
                },
                onSwing: () => {
                    const effects = getArtifactEffects(player.artifacts.snapshot());
                    player.ropeDamageBoostRemaining = effects.swingDamageDuration;
                    this.applyArtifactEffects(player);
                    swingTriggered = effects.swingDamageDuration > 0;
                }
            }
        });
        return Object.freeze({ swingTriggered });
    }

    #prepareOwnerStep(player, dt) {
        player.ropeDisabledRemaining = Math.max(0, player.ropeDisabledRemaining - dt);
        player.hitInvulnerabilityRemaining = Math.max(0, player.hitInvulnerabilityRemaining - dt);
        player.ropeDamageBoostRemaining = Math.max(0, player.ropeDamageBoostRemaining - dt);
        this.applyArtifactEffects(player);
    }

    #advanceAutomaticWeapon(player, dt, allowFire = true) {
        return updateAutomaticWeapon({
            owner: player,
            enemies: this.enemies,
            projectiles: this.projectiles,
            registry: this.registry,
            config: COMBAT_CONFIG,
            dt,
            allowFire
        });
    }

    updateCheckpointProgress() {
        for (const checkpoint of this.world.checkpoints) {
            if (checkpoint.level <= (this.activeCheckpoint?.level ?? -1)) continue;
            const player = this.players.find(
                (player) =>
                    player.lifeState === "active" && player.physics.position.distanceTo(checkpoint) <= checkpoint.radius
            );
            if (!player) continue;
            this.#activateCheckpoint(checkpoint, player.id);
        }
    }

    updateSummitProgress() {
        const player = this.players.find(
            (candidate) =>
                candidate.lifeState === "active" &&
                candidate.physics.position.distanceTo(this.world.summit) <= this.world.summit.radius
        );
        return player ? this.beginCompletion(player.id) : false;
    }

    summitClaimCandidate(playerId) {
        if (this.runState !== "playing") return null;
        const player = this.players.find(({ id }) => id === playerId);
        if (!player || player.lifeState !== "active") return null;
        return player.physics.position.distanceTo(this.world.summit) <= this.world.summit.radius
            ? this.world.summit
            : null;
    }

    resolveSummitClaim(playerId, claim, { positionTolerance = 40 } = {}) {
        if (this.runState !== "playing") return Object.freeze({ accepted: false, reason: "run-inactive" });
        const player = this.players.find(({ id }) => id === playerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        if (
            Math.hypot(claim.position.x - this.world.summit.x, claim.position.y - this.world.summit.y) >
            this.world.summit.radius
        ) {
            return Object.freeze({ accepted: false, reason: "summit-out-of-range" });
        }
        if (player.physics.position.distanceTo(claim.position) > positionTolerance) {
            return Object.freeze({ accepted: false, reason: "owner-state-mismatch" });
        }
        this.beginCompletion(playerId);
        return Object.freeze({ accepted: true, resolution: "run-completed" });
    }

    checkpointClaimCandidate(playerId) {
        const player = this.players.find(({ id }) => id === playerId);
        if (!player || player.lifeState !== "active") return null;
        return (
            this.world.checkpoints.find(
                (checkpoint) =>
                    checkpoint.level > (this.activeCheckpoint?.level ?? -1) &&
                    player.physics.position.distanceTo(checkpoint) <= checkpoint.radius
            ) ?? null
        );
    }

    resolveCheckpointClaim(playerId, claim, { positionTolerance = 40 } = {}) {
        if (this.runState !== "playing") return Object.freeze({ accepted: false, reason: "run-inactive" });
        const player = this.players.find(({ id }) => id === playerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        const checkpoint = this.world.checkpoints.find(({ id }) => id === claim.checkpointId);
        if (!checkpoint) return Object.freeze({ accepted: false, reason: "checkpoint-missing" });
        if (checkpoint.level <= (this.activeCheckpoint?.level ?? -1)) {
            return Object.freeze({ accepted: false, reason: "checkpoint-elapsed" });
        }
        if (Math.hypot(claim.position.x - checkpoint.x, claim.position.y - checkpoint.y) > checkpoint.radius) {
            return Object.freeze({ accepted: false, reason: "checkpoint-out-of-range" });
        }
        if (player.physics.position.distanceTo(claim.position) > positionTolerance) {
            return Object.freeze({ accepted: false, reason: "owner-state-mismatch" });
        }
        this.#activateCheckpoint(checkpoint, playerId);
        return Object.freeze({ accepted: true, resolution: "checkpoint-reached" });
    }

    #activateCheckpoint(checkpoint, playerId) {
        this.activeCheckpoint = checkpoint;
        this.metrics.recordCheckpoint();
        this.eventFlash = { type: "checkpoint", age: 0, position: checkpoint, checkpointId: checkpoint.id, playerId };
        this.recordReplicationEvent("checkpoint-reached", {
            checkpointId: checkpoint.id,
            playerId,
            position: { x: checkpoint.x, y: checkpoint.y }
        });
        if (checkpoint.level > 0 && !this.rewardedCheckpointIds.has(checkpoint.id)) {
            this.beginArtifactReward(checkpoint);
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
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
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

    createEnemies() {
        return this.world.enemySpawns.map(
            (spawn) =>
                new EnemyObject({
                    id: this.registry.createId("enemy"),
                    position: new Vector2(spawn.x, spawn.y),
                    level: spawn.level,
                    radius: COMBAT_CONFIG.enemyRadius,
                    health: COMBAT_CONFIG.enemyHealth,
                    maxHealth: COMBAT_CONFIG.enemyHealth,
                    fireCooldown: COMBAT_CONFIG.enemyFireInterval
                })
        );
    }

    recordProjectileSpawn(projectile, objectType) {
        if (objectType === "player-projectile") projectile.predictionId ??= `${projectile.ownerId}:${this.tick}`;
        const spawnEvent = createPredictableSpawnEvent({
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
        });
        Object.defineProperty(projectile, "replicationSpawnEvent", {
            value: spawnEvent,
            configurable: true,
            writable: true
        });
        this.replicationEvents.push(spawnEvent);
    }

    activePredictableSpawnEvents() {
        return Object.freeze(
            [...this.projectiles, ...this.enemyProjectiles]
                .map(({ replicationSpawnEvent }) => replicationSpawnEvent)
                .filter(Boolean)
        );
    }

    resolvePlayerProjectileSpawnClaim(authenticatedPlayerId, claim, { positionTolerance = 40 } = {}) {
        const player = this.players.find(({ id }) => id === authenticatedPlayerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        if (claim.predictionId !== `${authenticatedPlayerId}:${claim.clientTick}`) {
            return Object.freeze({ accepted: false, reason: "prediction-ownership" });
        }
        if (player.weapon.cooldown > 0) return Object.freeze({ accepted: false, reason: "weapon-cooldown" });
        const target = selectNearestEnemy(player.physics.position, this.enemies, player.weapon.range);
        if (!target) return Object.freeze({ accepted: false, reason: "target-missing" });
        if (target.id !== claim.targetId) return Object.freeze({ accepted: false, reason: "target-mismatch" });
        if (
            Math.hypot(claim.position.x - player.physics.position.x, claim.position.y - player.physics.position.y) >
            positionTolerance
        ) {
            return Object.freeze({ accepted: false, reason: "position-mismatch" });
        }
        const projectile = this.#advanceAutomaticWeapon(player, 0);
        if (!projectile) return Object.freeze({ accepted: false, reason: "weapon-unavailable" });
        projectile.predictionId = claim.predictionId;
        this.recordProjectileSpawn(projectile, "player-projectile");
        return Object.freeze({ accepted: true, projectileId: projectile.id });
    }

    resolveRopeSwingClaim(authenticatedPlayerId, claim, { positionTolerance = 40, anchorTolerance = 16 } = {}) {
        const player = this.players.find(({ id }) => id === authenticatedPlayerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        if (claim.predictionId !== `${authenticatedPlayerId}:swing:${claim.clientTick}`) {
            return Object.freeze({ accepted: false, reason: "prediction-ownership" });
        }
        const effects = getArtifactEffects(player.artifacts.snapshot());
        if (effects.swingDamageDuration <= 0) {
            return Object.freeze({ accepted: false, reason: "swing-effect-missing" });
        }
        if (!player.ropeObject.rope.isAttached || !player.ropeObject.rope.anchor) {
            return Object.freeze({ accepted: false, reason: "rope-detached" });
        }
        if (player.physics.position.distanceTo(claim.position) > positionTolerance) {
            return Object.freeze({ accepted: false, reason: "position-mismatch" });
        }
        if (player.ropeObject.rope.anchor.distanceTo(claim.anchor) > anchorTolerance) {
            return Object.freeze({ accepted: false, reason: "anchor-mismatch" });
        }
        player.ropeDamageBoostRemaining = effects.swingDamageDuration;
        this.applyArtifactEffects(player);
        this.recordReplicationEvent("rope-swing", {
            playerId: authenticatedPlayerId,
            predictionId: claim.predictionId,
            position: { x: claim.position.x, y: claim.position.y },
            anchor: { x: claim.anchor.x, y: claim.anchor.y },
            duration: effects.swingDamageDuration
        });
        return Object.freeze({ accepted: true, duration: effects.swingDamageDuration });
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
            (COMBAT_CONFIG.projectileSpeed * Math.abs(claim.clientTick - this.tick)) / 120 + positionTolerance;
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
        const claimTickOffsetSeconds = (claim.clientTick - this.tick) / 120;
        const projectilePositionAtClaim = projectile.position
            .clone()
            .add(projectile.velocity.clone().scale(claimTickOffsetSeconds));
        if (
            Math.hypot(claim.position.x - projectilePositionAtClaim.x, claim.position.y - projectilePositionAtClaim.y) >
            positionTolerance
        ) {
            return Object.freeze({ accepted: false, reason: "trajectory-mismatch" });
        }
        if (claim.impactType === "rope-cut") {
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
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
        this.metrics.recordPlayerImpact(claim.impactType, projectile.damage);
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

    respawnPlayerAtCheckpoint(player, reason) {
        if (!player || this.runState !== "playing") return false;
        const respawnPosition = this.activeCheckpoint ?? { x: 120, y: 500 };
        this.metrics.recordDefeat();
        player.physics.reset(respawnPosition);
        player.ropeObject.rope.detach();
        player.ropeObject.attachmentCandidate = null;
        player.ropeObject.wasPointerDown = false;
        player.ropeObject.lastPointer = Object.freeze({ x: 0, y: 0, down: false });
        player.ropeObject.attachBufferRemaining = 0;
        player.ropeObject.swingDrag = null;
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

    beginCompletion(playerId = this.#primaryPlayerId) {
        if (this.runState !== "playing") return false;
        const player = this.#findPlayer(playerId);
        if (!player || player.lifeState !== "active") return false;
        this.runState = "completed";
        for (const current of this.players) {
            current.ropeObject.rope.detach();
            current.ropeObject.swingDrag = null;
        }
        this.eventFlash = { type: "completed", age: 0, playerId, position: this.world.summit };
        this.recordReplicationEvent("run-completed", {
            playerId,
            position: { x: this.world.summit.x, y: this.world.summit.y }
        });
        return true;
    }

    snapshot() {
        const player = this.#primaryPlayer();
        return {
            tick: this.tick,
            world: this.world,
            player: player.physics,
            rope: player.ropeObject.rope,
            aimWorld: player.ropeObject.aimWorld,
            attachmentCandidate: player.ropeObject.attachmentCandidate,
            eventFlash: this.eventFlash,
            swingDrag: player.ropeObject.swingDrag,
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
