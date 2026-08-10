import { Vector2 } from "../../game-kit/index.js";
import { ARTIFACT_CATALOG, getArtifactEffects } from "../artifacts/ArtifactCatalog.js";
import {
    updateAutomaticWeapon,
    updateEnemyProjectiles,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../combat/CombatSystems.js";
import { appendCombatFeedback, createImpactState, updateCombatFeedback } from "../combat/CombatFeedback.js";
import { ARTIFACT_CONFIG, COMBAT_CONFIG, LIFE_CONFIG, PLAYER_CONFIG, ROPE_CONFIG, WORLD_CONFIG } from "../config.js";
import { enterDowned, isTeamDefeated, updateDownedPlayer, updateTeamRevives } from "../life/PlayerLifeCycle.js";
import { RunMetrics } from "../metrics/RunMetrics.js";
import { createPredictableResolveEvent, createPredictableSpawnEvent } from "../network/PredictableObjectEvent.js";
import { createPlayerRuntime } from "../players/PlayerRuntimeFactory.js";
import { evaluateSwingDrag, getSwingDragThreshold } from "../rope/SwingDrag.js";
import { WorldGenerator, closestPointOnSurface } from "../world/WorldGenerator.js";
import { EntityRegistry } from "./EntityRegistry.js";

export class GameSimulation {
    constructor() {
        this.world = new WorldGenerator(WORLD_CONFIG).generate();
        this.metrics = new RunMetrics();
        this.registry = new EntityRegistry();
        this.players = [];
        const playerRuntime = this.addPlayer();
        this.player = playerRuntime.physics;
        this.rope = playerRuntime.rope;
        this.artifacts = playerRuntime.artifacts;
        this.playerEntity = playerRuntime.entity;
        this.enemies = this.createEnemies();
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.combatEffects = [];
        this.impact = null;
        this.eventFlash = { type: "ready", age: 10 };
        this.resets = 0;
        this.runState = "playing";
        this.defeatReason = null;
        this.restartRemaining = 0;
        this.activeCheckpoint = this.world.checkpoints[0] ?? null;
        this.lastCheckpointLoss = [];
        this.artifactRewards = new Map();
        this.rewardedCheckpointIds = new Set();
        this.tick = 0;
        this.replicationEvents = [];
    }

    addPlayer(spawn) {
        const runtime = createPlayerRuntime({
            registry: this.registry,
            playerConfig: PLAYER_CONFIG,
            ropeConfig: ROPE_CONFIG,
            combatConfig: COMBAT_CONFIG,
            artifactConfig: ARTIFACT_CONFIG,
            spawn
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
        if (removed === this.playerEntity && this.players.length > 0) {
            this.playerEntity = this.players[0];
            this.player = this.playerEntity.physics;
            this.rope = this.playerEntity.rope;
            this.artifacts = this.playerEntity.artifacts;
        }
        return true;
    }

    get aimWorld() {
        return this.playerEntity.aimWorld;
    }

    get artifactReward() {
        return this.artifactRewards.get(this.playerEntity.id) ?? null;
    }

    set aimWorld(value) {
        this.playerEntity.aimWorld = value;
    }

    get attachmentCandidate() {
        return this.playerEntity.attachmentCandidate;
    }

    set attachmentCandidate(value) {
        this.playerEntity.attachmentCandidate = value;
    }

    get wasPointerDown() {
        return this.playerEntity.wasPointerDown;
    }

    set wasPointerDown(value) {
        this.playerEntity.wasPointerDown = value;
    }

    get attachBufferRemaining() {
        return this.playerEntity.attachBufferRemaining;
    }

    set attachBufferRemaining(value) {
        this.playerEntity.attachBufferRemaining = value;
    }

    get swingDrag() {
        return this.playerEntity.swingDrag;
    }

    set swingDrag(value) {
        this.playerEntity.swingDrag = value;
    }

    get ropeDamageBoostRemaining() {
        return this.playerEntity.ropeDamageBoostRemaining;
    }

    set ropeDamageBoostRemaining(value) {
        this.playerEntity.ropeDamageBoostRemaining = value;
    }

    get lastCheckpointLoss() {
        return this.playerEntity.lastCheckpointLoss;
    }

    set lastCheckpointLoss(value) {
        this.playerEntity.lastCheckpointLoss = value;
    }

    step(dt, command) {
        return this.stepPlayers(dt, new Map([[this.playerEntity.id, command]]));
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
            if (this.runState === "defeated") {
                this.restartRemaining = Math.max(0, this.restartRemaining - dt);
                if (this.restartRemaining <= 0) this.respawnAtCheckpoint();
            }
            return;
        }
        if (this.player.position.distanceTo(this.world.summit) <= this.world.summit.radius) {
            this.beginCompletion();
            return;
        }
        this.updateCheckpointProgress();
        if (this.artifactRewards.size > 0) {
            this.updateArtifactRewards(commandsByPlayerId);
            this.eventFlash.age += dt;
            return;
        }
        this.metrics.recordActiveTime(dt);
        const reviveUpdate = updateTeamRevives(this.players, commandsByPlayerId, dt, LIFE_CONFIG);
        const reviveReviverIds = new Set(reviveUpdate.reviverIds);
        for (const result of reviveUpdate.results) {
            if (result.status !== "revived") continue;
            const revived = this.players.find(({ id }) => id === result.targetId);
            this.eventFlash = {
                type: "revived",
                age: 0,
                playerId: result.targetId,
                reviverId: result.reviverId,
                position: revived?.physics.position
            };
            this.recordReplicationEvent("player-revived", {
                playerId: result.targetId,
                reviverId: result.reviverId,
                health: revived?.health,
                position: revived ? { x: revived.physics.position.x, y: revived.physics.position.y } : null
            });
        }
        for (const player of this.players) {
            let playerCommand = this.commandForPlayer(player, commandsByPlayerId);
            if (reviveReviverIds.has(player.id) && playerCommand.vertical < 0) {
                playerCommand = { ...playerCommand, vertical: 0 };
            }
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
        for (const resolution of [...playerProjectileEvents.resolutions, ...enemyProjectileEvents.resolutions]) {
            this.recordProjectileResolution(resolution);
        }
        this.metrics.recordCombat(playerProjectileEvents, enemyProjectileEvents);
        for (const ropeCut of enemyProjectileEvents.ropeCuts) {
            const player = this.players.find(({ id }) => id === ropeCut.playerId);
            if (player) player.swingDrag = null;
            this.eventFlash = { type: "rope-cut", age: 0, position: ropeCut.position, playerId: ropeCut.playerId };
        }
        const combatEvents = [...playerProjectileEvents.hits, ...enemyProjectileEvents.hits];
        for (const event of combatEvents) appendCombatFeedback(this.combatEffects, event);
        const impact = createImpactState(combatEvents);
        if (impact) this.impact = impact;
        updateCombatFeedback(this.combatEffects, dt);
        if (this.impact) {
            this.impact.age += dt;
            if (this.impact.age >= this.impact.lifetime) this.impact = null;
        }
        this.enemies = this.enemies.filter((enemy) => enemy.health > 0);
        for (const player of this.players) {
            if (player.health <= 0 && enterDowned(player, LIFE_CONFIG)) {
                player.rope.detach();
                player.swingDrag = null;
                this.eventFlash = { type: "downed", age: 0, playerId: player.id };
            }
        }
        const fallenPlayerIds = this.recoverFallenPlayers();
        for (const player of this.players) updateDownedPlayer(player, dt);
        if (isTeamDefeated(this.players)) this.beginDefeat(fallenPlayerIds.length > 0 ? "fall" : "health");
        this.eventFlash.age += dt;
    }

    recoverFallenPlayers() {
        const checkpoint = this.activeCheckpoint ?? { x: 120, y: 500 };
        const fallenPlayerIds = [];
        for (const player of this.players) {
            if (player.physics.position.isFinite() && player.physics.position.y <= WORLD_CONFIG.floorY + 780) {
                continue;
            }
            const wasActive = player.lifeState === "active";
            player.physics.reset(checkpoint);
            player.rope.detach();
            player.attachmentCandidate = null;
            player.wasPointerDown = false;
            player.lastPointer = Object.freeze({ x: 0, y: 0, down: false });
            player.attachBufferRemaining = 0;
            player.swingDrag = null;
            if (wasActive) enterDowned(player, LIFE_CONFIG);
            fallenPlayerIds.push(player.id);
            this.eventFlash = { type: "fall-recovery", age: 0, playerId: player.id, position: player.physics.position };
            this.recordReplicationEvent("player-fell", {
                playerId: player.id,
                lifeState: player.lifeState,
                position: { x: player.physics.position.x, y: player.physics.position.y }
            });
        }
        return fallenPlayerIds;
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
            this.artifactRewards.set(player.id, {
                checkpointId: checkpoint.id,
                choices: ARTIFACT_CATALOG,
                selectedIndex: 0,
                inputReady: false,
                previousHorizontal: 0,
                previousConfirm: false
            });
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
        const horizontal = Math.sign(command.horizontal);
        const confirm = command.vertical < 0;
        if (!reward.inputReady) {
            if (horizontal === 0 && !confirm) reward.inputReady = true;
            return;
        }
        if (horizontal !== 0 && reward.previousHorizontal === 0) {
            const count = reward.choices.length;
            reward.selectedIndex = (reward.selectedIndex + horizontal + count) % count;
        }
        if (confirm && !reward.previousConfirm) {
            const selected = reward.choices[reward.selectedIndex];
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
            return;
        }
        reward.previousHorizontal = horizontal;
        reward.previousConfirm = confirm;
    }

    applyArtifactEffects(player = this.playerEntity) {
        const effects = getArtifactEffects(player.artifacts.snapshot(), player.ropeDamageBoostRemaining);
        player.weapon.damage = player.weapon.baseDamage * effects.damageMultiplier;
        player.weapon.fireInterval = player.weapon.baseFireInterval * effects.fireIntervalMultiplier;
    }

    updateSwingDrag(pointer, viewport, dt) {
        this.updatePlayerSwingDrag(this.playerEntity, pointer, viewport, dt);
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

    recordProjectileResolution({ projectileId, resolution, position }) {
        if (!projectileId) return;
        this.replicationEvents.push(
            createPredictableResolveEvent({
                eventId: this.registry.createId("event"),
                objectId: projectileId,
                tick: this.tick,
                resolution,
                position
            })
        );
    }

    drainReplicationEvents() {
        const events = Object.freeze(this.replicationEvents);
        this.replicationEvents = [];
        return events;
    }

    findAttachment(aimPoint, player = this.playerEntity) {
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

    respawnAtCheckpoint() {
        const respawnPosition = this.activeCheckpoint ?? { x: 120, y: 500 };
        this.eventFlash = { type: "reset", age: 0 };
        for (const player of this.players) {
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
            player.downedRemaining = 0;
            player.reviveProgress = 0;
            player.lastCheckpointLoss = player.artifacts.applyCheckpointLoss();
            player.ropeDamageBoostRemaining = 0;
            this.applyArtifactEffects(player);
            if (player.lastCheckpointLoss.length > 0) {
                this.recordReplicationEvent("artifact-loss", {
                    playerId: player.id,
                    artifactIds: player.lastCheckpointLoss.map(({ id }) => id)
                });
            }
        }
        for (const projectile of [...this.projectiles, ...this.enemyProjectiles]) {
            this.recordProjectileResolution({
                projectileId: projectile.id,
                resolution: "checkpoint-reset",
                position: projectile.position ?? this.player.position
            });
        }
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.combatEffects = [];
        this.impact = null;
        this.runState = "playing";
        this.defeatReason = null;
        this.restartRemaining = 0;
        if (this.lastCheckpointLoss.length > 0) {
            this.eventFlash = {
                type: "artifact-loss",
                age: 0,
                playerId: this.playerEntity.id,
                artifacts: [...this.lastCheckpointLoss]
            };
        }
        this.resets += 1;
    }

    beginDefeat(reason) {
        if (this.runState !== "playing") return;
        this.metrics.recordDefeat();
        this.runState = "defeated";
        this.defeatReason = reason;
        this.restartRemaining = LIFE_CONFIG.defeatRestartDelay;
        for (const player of this.players) {
            player.rope.detach();
            player.swingDrag = null;
        }
        this.eventFlash = { type: "defeat", age: 0 };
    }

    beginCompletion() {
        if (this.runState !== "playing") return;
        this.runState = "completed";
        this.defeatReason = null;
        this.restartRemaining = 0;
        this.rope.detach();
        this.swingDrag = null;
        this.eventFlash = { type: "completed", age: 0, position: this.world.summit };
    }

    snapshot() {
        return {
            tick: this.tick,
            world: this.world,
            player: this.player,
            rope: this.rope,
            aimWorld: this.aimWorld,
            attachmentCandidate: this.attachmentCandidate,
            eventFlash: this.eventFlash,
            swingDrag: this.swingDrag,
            enemies: this.enemies,
            projectiles: this.projectiles,
            enemyProjectiles: this.enemyProjectiles,
            combatEffects: this.combatEffects,
            impact: this.impact,
            playerHealth: this.playerEntity.health,
            playerMaxHealth: this.playerEntity.maxHealth,
            ropeDisabledRemaining: this.playerEntity.ropeDisabledRemaining,
            playerLifeState: this.playerEntity.lifeState,
            runState: this.runState,
            defeatReason: this.defeatReason,
            restartRemaining: this.restartRemaining,
            activeCheckpoint: this.activeCheckpoint,
            artifacts: this.artifacts.snapshot(),
            lastCheckpointLoss: [...this.lastCheckpointLoss],
            artifactReward: this.artifactReward,
            artifactRewards: Object.fromEntries(this.artifactRewards),
            rewardedCheckpointIds: [...this.rewardedCheckpointIds],
            ropeDamageBoostRemaining: this.ropeDamageBoostRemaining,
            metrics: this.metrics.snapshot(),
            resets: this.resets,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance
        };
    }
}
