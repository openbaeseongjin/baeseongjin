import { Vector2 } from "../../game-kit/index.js";
import { ARTIFACT_CATALOG, getArtifactEffects } from "../artifacts/ArtifactCatalog.js";
import {
    FOUNDATION_AUGMENT_CATALOG,
    FOUNDATION_AUGMENT_CONFIG,
    foundationAugmentById
} from "../augments/FoundationAugmentCatalog.js";
import {
    advanceEnemyProjectiles,
    distancePointToSegment,
    updateAutomaticWeapon,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../combat/CombatSystems.js";
import { selectNearestEnemy } from "../combat/CombatTargeting.js";
import { EnemyObject } from "../combat/EnemyObject.js";
import { ARTIFACT_CONFIG, COMBAT_CONFIG, PLAYER_CONFIG, ROPE_CONFIG, WORLD_CONFIG } from "../config.js";
import { InputDispatcher } from "../input/InputDispatcher.js";
import { findRopeAttachment } from "../input/RopePointerInput.js";
import { RunMetrics } from "../metrics/RunMetrics.js";
import { createPlayerImpactStateDigest } from "../network/PlayerImpactClaim.js";
import { createPredictableResolveEvent, createPredictableSpawnEvent } from "../network/PredictableObjectEvent.js";
import { resolvePlayerCollisions } from "../physics/PlayerCollision.js";
import { createPlayerRuntime } from "../players/PlayerRuntimeFactory.js";
import { releaseRopeFromBody } from "../rope/RopeAttachment.js";
import { advanceArtifactRewardSelection, createArtifactRewardSelection } from "../rewards/ArtifactRewardSelection.js";
import {
    advanceFoundationRewardSelection,
    createFoundationRewardSelection
} from "../rewards/FoundationRewardSelection.js";
import { generateWorld } from "../world/WorldGenerator.js";
import { assembleAuthoredWorld } from "../world/AuthoredWorldAssembler.js";
import { collisionSurfacesForProgress } from "../world/WorldGateGeometry.js";
import { pointInsideBounds, sampleWorldForce, snapshotWindStates } from "../world/WorldForceField.js";
import { advanceWorldProgress, completeWorldProgressObjective } from "../world/WorldProgressController.js";
import { WorldProgressState } from "../world/WorldProgressState.js";
import { EntityRegistry } from "./EntityRegistry.js";

function segmentBoundsEntryPoint(start, end, bounds) {
    if (pointInsideBounds(start, bounds)) return Object.freeze({ x: start.x, y: start.y });
    const delta = { x: end.x - start.x, y: end.y - start.y };
    let entryRatio = 0;
    let exitRatio = 1;
    for (const axis of ["x", "y"]) {
        const lower = bounds[axis];
        const upper = lower + bounds[axis === "x" ? "width" : "height"];
        if (Math.abs(delta[axis]) < 1e-9) {
            if (start[axis] < lower || start[axis] > upper) return null;
            continue;
        }
        const first = (lower - start[axis]) / delta[axis];
        const second = (upper - start[axis]) / delta[axis];
        entryRatio = Math.max(entryRatio, Math.min(first, second));
        exitRatio = Math.min(exitRatio, Math.max(first, second));
        if (entryRatio > exitRatio) return null;
    }
    if (entryRatio < 0 || entryRatio > 1) return null;
    return Object.freeze({
        x: start.x + delta.x * entryRatio,
        y: start.y + delta.y * entryRatio
    });
}

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

const PORTAL_ARRIVAL_SPACING = PLAYER_CONFIG.radius * 2 + 10;

function portalArrivalPosition(entry, index, playerCount) {
    return Object.freeze({
        x: entry.x + (index - (playerCount - 1) * 0.5) * PORTAL_ARRIVAL_SPACING,
        y: entry.y
    });
}

export class GameSimulation {
    #primaryPlayerId;
    #inputDispatcher;
    #inputDrivenObjectsByOwner;

    constructor({ worldSeed = WORLD_CONFIG.seed, playerId = null, worldCatalog = null } = {}) {
        this.worldCatalog = worldCatalog;
        this.world = worldCatalog
            ? assembleAuthoredWorld(worldCatalog, {
                  seed: worldSeed,
                  floorY: WORLD_CONFIG.floorY,
                  checkpointRadius: WORLD_CONFIG.checkpointRadius,
                  summitRadius: WORLD_CONFIG.summitRadius
              })
            : generateWorld({ ...WORLD_CONFIG, seed: worldSeed });
        this.worldProgress = worldCatalog ? new WorldProgressState(worldCatalog) : null;
        this.activeCollisionSurfaces = collisionSurfacesForProgress(this.world, this.worldProgress);
        this.elapsedSeconds = 0;
        this.metrics = new RunMetrics();
        this.registry = new EntityRegistry();
        this.#inputDispatcher = new InputDispatcher();
        this.#inputDrivenObjectsByOwner = new Map();
        this.portalTransitions = new Map();
        this.players = [];
        const playerRuntime = this.addPlayer(this.world.areas?.[0]?.entry, playerId);
        this.#primaryPlayerId = playerRuntime.entity.id;
        this.enemies = this.createEnemies();
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.eventFlash = { type: "ready", age: 10 };
        this.resets = 0;
        this.runState = "playing";
        this.activeCheckpoint = this.world.checkpoints[0] ?? null;
        this.artifactRewards = new Map();
        this.foundationRewards = new Map();
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
        this.portalTransitions.delete(playerId);
        const removedReward = this.artifactRewards.get(playerId);
        this.artifactRewards.delete(playerId);
        this.foundationRewards.delete(playerId);
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

    portalTransitionTick(playerId) {
        return this.portalTransitions.get(playerId)?.tick ?? null;
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
            angle: player.physics.angle,
            angularVelocity: player.physics.angularVelocity,
            isGrounded: player.physics.isGrounded,
            collider: player.physics.collider.snapshot(),
            health: player.health,
            maxHealth: player.maxHealth,
            hitInvulnerabilityRemaining: player.hitInvulnerabilityRemaining,
            ropeDisabledRemaining: player.ropeDisabledRemaining,
            lifeState: player.lifeState,
            rope: {
                isAttached: player.ropeObject.rope.isAttached,
                anchor: vectorState(player.ropeObject.rope.anchor),
                attachmentOffset: vectorState(player.ropeObject.rope.attachmentOffset),
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
            foundationAugment: player.foundation.selectedId,
            augmentRuntimeState: player.foundation.snapshot(),
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
            areaId: enemy.areaId,
            objectId: enemy.objectId,
            enemyType: enemy.enemyType,
            activation: enemy.activation,
            patrol: enemy.patrol,
            lockedTargetId: enemy.lockedTargetId,
            attackState: enemy.attackState,
            attackStateRemaining: enemy.attackStateRemaining,
            aimDirection: enemy.aimDirection,
            rules: enemy.rules,
            radius: enemy.radius,
            health: enemy.health,
            maxHealth: enemy.maxHealth,
            fireCooldown: enemy.fireCooldown
        }));
    }

    getArtifactReward(playerId) {
        return this.artifactRewards.get(playerId) ?? null;
    }

    getFoundationReward(playerId) {
        return this.foundationRewards.get(playerId) ?? null;
    }

    getTick() {
        return this.tick;
    }

    releasePlayerRope(playerId, { transferAngularMomentum = false } = {}) {
        const player = this.#requirePlayer(playerId);
        const released = player.ropeObject.rope.isAttached;
        if (transferAngularMomentum) releaseRopeFromBody(player.physics, player.ropeObject.rope);
        else player.ropeObject.rope.detach();
        player.ropeObject.swingDrag = null;
        return released;
    }

    confirmPortalTransition(playerId, gateId, position, tick) {
        const previous = this.portalTransitions.get(playerId);
        if (!previous || previous.gateId !== gateId) return false;
        const player = this.#requirePlayer(playerId);
        const stillAtPredictedArrival =
            Math.hypot(
                player.physics.position.x - previous.position.x,
                player.physics.position.y - previous.position.y
            ) < 1e-6;
        if (stillAtPredictedArrival) {
            player.physics.position.set(position.x, position.y);
            player.ropeObject.aimWorld = Object.freeze({ x: position.x, y: position.y });
        }
        this.portalTransitions.set(playerId, Object.freeze({ gateId, position, tick }));
        return true;
    }

    applyPortalTransition(playerId, position, tick = this.tick, gateId = null) {
        const player = this.#requirePlayer(playerId);
        player.physics.reset(position);
        player.ropeObject.rope.detach();
        player.ropeObject.aimWorld = Object.freeze({ x: position.x, y: position.y });
        player.ropeObject.attachmentCandidate = null;
        player.ropeObject.wasPointerDown = false;
        player.ropeObject.lastPointer = Object.freeze({ x: 0, y: 0, down: false });
        player.ropeObject.lastViewport = Object.freeze({ width: 1, height: 1 });
        player.ropeObject.attachBufferRemaining = 0;
        player.ropeObject.swingDrag = null;
        player.weapon.cooldown = 0;
        player.hitInvulnerabilityRemaining = 0;
        player.ropeDisabledRemaining = 0;
        player.ropeDamageBoostRemaining = 0;
        player.foundation.resetRuntime();
        this.applyArtifactEffects(player);
        this.portalTransitions.set(player.id, Object.freeze({ gateId, position, tick }));
        return this.ownerPredictionState(player.id);
    }

    #advanceSweptOwnerGate(player, destination) {
        if (!this.worldProgress || player.lifeState !== "active") return false;
        const currentArea = this.world.areas.find(({ id }) => id === this.worldProgress.currentAreaId);
        const gate = this.world.gates.find(({ id }) => id === currentArea?.gateId);
        if (
            !gate?.nextAreaId ||
            !this.worldProgress.isGateUnlocked(gate.id) ||
            this.worldProgress.isGateCrossed(gate.id)
        ) {
            return false;
        }
        const nextArea = this.world.areas.find(({ id }) => id === gate.nextAreaId);
        const sweptEntry = segmentBoundsEntryPoint(player.physics.position, destination, gate.trigger);
        // Owner prediction teleports before the next motion sample. After a curved Gate entry,
        // the chord from the last server sample can miss the trigger even though the owner is
        // already inside the authored destination area.
        const entry =
            sweptEntry ??
            (nextArea && pointInsideBounds(destination, nextArea.bounds)
                ? {
                      x: gate.trigger.x + gate.trigger.width * 0.5,
                      y: gate.trigger.y + gate.trigger.height * 0.5
                  }
                : null);
        if (!entry) return false;
        player.physics.position.set(entry.x, entry.y);
        this.#advanceAuthoredWorldProgress(new Map(), { dt: 0 });
        return this.worldProgress.isGateCrossed(gate.id);
    }

    applyOwnerMotion(playerId, state, { synchronizeRope = true } = {}) {
        const player = this.#requirePlayer(playerId);
        this.#advanceSweptOwnerGate(player, state.position);
        player.physics.position.set(state.position.x, state.position.y);
        player.physics.velocity.set(state.velocity.x, state.velocity.y);
        player.physics.setAngularState(state.angle, state.angularVelocity);
        player.physics.isGrounded = state.isGrounded;
        if (player.ropeDisabledRemaining > 0) {
            this.releasePlayerRope(playerId);
        } else if (synchronizeRope && state.rope.isAttached) {
            player.ropeObject.rope.attach(player.physics.position, state.rope.anchor, {
                angle: player.physics.angle,
                attachmentOffset: state.rope.attachmentOffset
            });
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

    restoreWorldProgress(snapshot, elapsedSeconds = this.elapsedSeconds) {
        if (!this.worldProgress) {
            if (snapshot) throw new Error("cannot restore authored progress in a procedural world");
            return null;
        }
        if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
            throw new Error("world elapsed seconds must be non-negative");
        }
        if (snapshot) this.worldProgress.restore(snapshot);
        this.elapsedSeconds = elapsedSeconds;
        this.activeCollisionSurfaces = collisionSurfacesForProgress(this.world, this.worldProgress);
        return this.worldProgress.snapshot();
    }

    synchronizePredictionProgress(
        playerId,
        { artifactReward = null, foundationReward = null, rewardedCheckpointIds = [] } = {}
    ) {
        this.#requirePlayer(playerId);
        this.artifactRewards.clear();
        this.foundationRewards.clear();
        if (artifactReward) {
            this.artifactRewards.set(playerId, createArtifactRewardSelection(artifactReward));
        }
        if (foundationReward) {
            this.foundationRewards.set(playerId, createFoundationRewardSelection(foundationReward));
        }
        this.rewardedCheckpointIds = new Set(rewardedCheckpointIds);
        return this.getArtifactReward(playerId);
    }

    predictionProgressState(playerId) {
        this.#requirePlayer(playerId);
        return Object.freeze({
            activeCheckpointId: this.activeCheckpoint?.id ?? null,
            artifactReward: this.getArtifactReward(playerId),
            foundationReward: this.getFoundationReward(playerId),
            rewardedCheckpointIds: Object.freeze([...this.rewardedCheckpointIds])
        });
    }

    restoreOwnerPrediction(ownerId, state, serverTick = this.tick) {
        const player = this.#requirePlayer(ownerId);
        this.#restorePlayer(player, state);
        this.tick = serverTick;
        return this.ownerPredictionState(ownerId);
    }

    applySharedOwnerProgress(
        ownerId,
        shared,
        predictionTick,
        { preservePendingImpact = false, preservePendingFoundation = false } = {}
    ) {
        const player = this.#requirePlayer(ownerId);
        if (!preservePendingImpact) {
            player.maxHealth = shared.maxHealth;
            player.weapon.range = shared.weapon.range;
            player.weapon.damage = shared.weapon.damage;
            player.weapon.fireInterval = shared.weapon.fireInterval;
            player.artifacts.replace(shared.artifacts);
            this.applyArtifactEffects(player);
        }
        if (
            !preservePendingFoundation &&
            shared.foundationAugment !== undefined &&
            shared.foundationAugment !== player.foundation.selectedId
        ) {
            player.foundation.restore(shared.foundationAugment, shared.augmentRuntimeState);
        }
        this.tick = Math.max(this.tick, predictionTick);
        return this.ownerPredictionState(ownerId);
    }

    advanceOwnerPrediction(ownerId, command, dt, tick) {
        const player = this.#requirePlayer(ownerId);
        this.elapsedSeconds += dt;
        this.#prepareOwnerStep(player, dt);
        this.#applyWorldForce(player, dt);
        const inputOutcome = this.dispatchOwnerInput(ownerId, command, dt);
        const projectile = this.#advanceAutomaticWeapon(player, dt);
        if (this.worldProgress) {
            this.#advanceAuthoredWorldProgress(new Map([[ownerId, command]]), { replicate: false, dt });
        }
        this.projectiles.length = 0;
        this.tick = tick;
        return Object.freeze({
            projectile,
            swingTriggered: inputOutcome.swingTriggered,
            foundationEvents: inputOutcome.foundationEvents
        });
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
            this.releasePlayerRope(ownerId, { transferAngularMomentum: true });
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
        if (player.health <= 0) this.respawnPlayerAtCheckpoint(player, "health", event.projectileId);
        return true;
    }

    resolveOwnerCollisions(ownerId, otherPlayers) {
        return resolvePlayerCollisions(this.#requirePlayer(ownerId), otherPlayers);
    }

    ownerPredictionState(ownerId) {
        const state = this.playerState(ownerId);
        if (!state) return null;
        return {
            tick: this.tick,
            position: state.position,
            velocity: state.velocity,
            angle: state.angle,
            angularVelocity: state.angularVelocity,
            isGrounded: state.isGrounded,
            collider: state.collider,
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
            foundationAugment: state.foundationAugment,
            augmentRuntimeState: state.augmentRuntimeState,
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
        player.physics.setAngularState(state.angle, state.angularVelocity);
        player.physics.isGrounded = state.isGrounded;
        if (state.rope.isAttached) {
            player.ropeObject.rope.anchor = new Vector2(state.rope.anchor.x, state.rope.anchor.y);
            player.ropeObject.rope.attachmentOffset = new Vector2(
                state.rope.attachmentOffset.x,
                state.rope.attachmentOffset.y
            );
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
        player.foundation.restore(state.foundationAugment ?? null, state.augmentRuntimeState);
        player.ropeDamageBoostRemaining = state.ropeDamageBoostRemaining;
        player.lastCheckpointLoss = [...state.lastCheckpointLoss];
        player.ropeObject.attachmentCandidate = findRopeAttachment({
            aimPoint: player.ropeObject.aimWorld,
            playerPosition: player.physics.position,
            surfaces: this.world.surfaces,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance,
            aimTolerance: player.foundation.ropeInputModifiers(ROPE_CONFIG).aimTolerance
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
        const choosingRewardPlayerIds = new Set([...this.artifactRewards.keys(), ...this.foundationRewards.keys()]);
        if (resolveArtifactSelections) {
            this.updateArtifactRewards(commandsByPlayerId);
            this.updateFoundationRewards(commandsByPlayerId);
        }
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
        if (this.worldProgress) this.metrics.recordAreaTime(this.worldProgress.currentAreaId, dt);
        this.elapsedSeconds += dt;
        for (const player of this.players) {
            const playerCommand = this.commandForPlayer(player, gameplayCommands);
            this.#prepareOwnerStep(player, dt);
            if (advanceInputDrivenObjects) {
                this.#applyWorldForce(player, dt);
                const inputOutcome = this.dispatchOwnerInput(player.id, playerCommand, dt);
                this.commitFoundationEvents(inputOutcome.foundationEvents);
            }
            const projectile = this.#advanceAutomaticWeapon(player, dt, spawnPlayerProjectiles);
            if (projectile) this.recordProjectileSpawn(projectile);
        }
        if (this.worldProgress) this.#advanceAuthoredWorldProgress(gameplayCommands, { dt });
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
            surfaces: this.activeCollisionSurfaces,
            dt
        });
        for (const projectile of enemyProjectileSpawns) this.recordProjectileSpawn(projectile);
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
        const foundationEvents = [];
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
                surfaces: this.activeCollisionSurfaces,
                getRopeInputModifiers: () => player.foundation.ropeInputModifiers(ROPE_CONFIG),
                onAttach: ({ relayAssisted }) => {
                    if (!relayAssisted || !player.foundation.consumeRelayAttach()) return;
                    foundationEvents.push(
                        Object.freeze({
                            eventType: "foundation-relay-linked",
                            playerId: player.id,
                            foundationId: player.foundation.selectedId,
                            position: vectorState(player.physics.position)
                        })
                    );
                },
                onRelease: ({ anchor, playerPosition, swingDrag }) => {
                    if (player.foundation.selectedId === "impulse-coil" && swingDrag?.used && swingDrag.direction) {
                        player.physics.addImpulse(
                            swingDrag.direction,
                            FOUNDATION_AUGMENT_CONFIG.impulseReleaseMagnitude
                        );
                        foundationEvents.push(
                            Object.freeze({
                                eventType: "foundation-impulse",
                                playerId: player.id,
                                foundationId: player.foundation.selectedId,
                                position: vectorState(player.physics.position),
                                direction: Object.freeze({ ...swingDrag.direction }),
                                magnitude: FOUNDATION_AUGMENT_CONFIG.impulseReleaseMagnitude
                            })
                        );
                    }
                    if (player.foundation.onRopeReleased()) {
                        foundationEvents.push(
                            Object.freeze({
                                eventType: "foundation-relay-ready",
                                playerId: player.id,
                                foundationId: player.foundation.selectedId,
                                position: vectorState(player.physics.position),
                                duration: FOUNDATION_AUGMENT_CONFIG.relayWindowSeconds
                            })
                        );
                    }
                    if (player.foundation.selectedId !== "shear-current") return;
                    for (const enemy of this.enemies) {
                        if (
                            enemy.health <= 0 ||
                            distancePointToSegment(enemy.position, anchor, playerPosition) >
                                enemy.radius + FOUNDATION_AUGMENT_CONFIG.shearSegmentTolerance
                        ) {
                            continue;
                        }
                        foundationEvents.push(
                            Object.freeze({
                                eventType: "foundation-shear-hit",
                                playerId: player.id,
                                foundationId: player.foundation.selectedId,
                                targetId: enemy.id,
                                targetKind: "enemy",
                                anchor: Object.freeze({ ...anchor }),
                                playerPosition: Object.freeze({ ...playerPosition }),
                                position: vectorState(enemy.position),
                                damage: FOUNDATION_AUGMENT_CONFIG.shearDamage
                            })
                        );
                    }
                    for (const object of this.world.objects ?? []) {
                        if (
                            object.kind !== "test-target" ||
                            distancePointToSegment(object.position, anchor, playerPosition) >
                                22 + FOUNDATION_AUGMENT_CONFIG.shearSegmentTolerance
                        ) {
                            continue;
                        }
                        foundationEvents.push(
                            Object.freeze({
                                eventType: "foundation-shear-hit",
                                playerId: player.id,
                                foundationId: player.foundation.selectedId,
                                targetId: object.id,
                                targetKind: "calibration-dummy",
                                anchor: Object.freeze({ ...anchor }),
                                playerPosition: Object.freeze({ ...playerPosition }),
                                position: vectorState(object.position),
                                damage: 0
                            })
                        );
                    }
                },
                onFlash: (eventFlash) => {
                    this.eventFlash = { ...eventFlash, playerId: player.id };
                },
                onSwing: () => {
                    const effects = getArtifactEffects(player.artifacts.snapshot());
                    player.ropeDamageBoostRemaining = effects.swingDamageDuration;
                    this.applyArtifactEffects(player);
                    swingTriggered = effects.swingDamageDuration > 0;
                }
            }
        });
        return Object.freeze({ swingTriggered, foundationEvents: Object.freeze(foundationEvents) });
    }

    commitFoundationEvents(events, { replicate = true } = {}) {
        for (const event of events) {
            if (event.eventType === "foundation-shear-hit" && event.targetKind === "enemy") {
                const target = this.enemies.find(({ id, health }) => id === event.targetId && health > 0);
                if (!target) continue;
                target.health = Math.max(0, target.health - event.damage);
                if (target.health <= 0) this.metrics.enemyDefeats += 1;
            }
            const { eventType, ...payload } = event;
            if (replicate) this.recordReplicationEvent(eventType, payload);
            this.eventFlash = { type: eventType, age: 0, ...payload };
        }
        this.enemies = this.enemies.filter(({ health }) => health > 0);
        return events.length;
    }

    #prepareOwnerStep(player, dt) {
        player.ropeDisabledRemaining = Math.max(0, player.ropeDisabledRemaining - dt);
        player.hitInvulnerabilityRemaining = Math.max(0, player.hitInvulnerabilityRemaining - dt);
        player.ropeDamageBoostRemaining = Math.max(0, player.ropeDamageBoostRemaining - dt);
        player.foundation.advance(dt);
        this.applyArtifactEffects(player);
    }

    #applyWorldForce(player, dt) {
        if (player.lifeState !== "active" || !this.world.windZones?.length) return;
        const force = sampleWorldForce(this.world.windZones, player.physics.position, this.elapsedSeconds);
        player.physics.velocity.x += force.x * dt;
        player.physics.velocity.y += force.y * dt;
    }

    #advanceAuthoredWorldProgress(commandsByPlayerId, { replicate = true, dt = 0 } = {}) {
        const events = advanceWorldProgress({
            world: this.world,
            progress: this.worldProgress,
            players: this.players,
            commandsByPlayerId,
            dt
        });
        for (const event of events) {
            const { type, ...payload } = event;
            if (type === "objective-choice-requested") {
                if (!this.beginFoundationReward(event.playerId, event.sourceObjectId, event.objectiveId)) continue;
                this.eventFlash = { type: "foundation-choice-opened", age: 0, ...payload };
                continue;
            }
            if (replicate) this.recordReplicationEvent(type, payload);
            this.eventFlash = { type, age: 0, ...payload };
            if (type === "gate-unlocked") {
                this.activeCollisionSurfaces = collisionSurfacesForProgress(this.world, this.worldProgress);
            }
            if (type === "gate-crossed" && event.nextAreaId) {
                this.metrics.recordAreaClear(event.areaId);
                const checkpoint = this.world.checkpoints.find(({ areaId }) => areaId === event.nextAreaId);
                if (checkpoint && checkpoint.level > (this.activeCheckpoint?.level ?? -1)) {
                    this.#activateCheckpoint(checkpoint, event.playerId);
                }
            }
        }
        this.#transferPlayersThroughOpenPortals({ replicate });
        if (this.worldProgress.snapshot().completed) this.beginCompletion(events.at(-1)?.playerId);
    }

    beginFoundationReward(playerId, sourceId, objectiveId = null) {
        const player = this.#findPlayer(playerId);
        const source = this.world.objects?.find(({ id }) => id === sourceId);
        if (
            !player ||
            player.foundation.selectedId !== null ||
            this.foundationRewards.has(playerId) ||
            this.artifactRewards.has(playerId) ||
            source?.kind !== "augment-node"
        ) {
            return false;
        }
        const choices = (source.choices ?? []).map((id) => foundationAugmentById(id));
        if (choices.length === 0 || choices.some((choice) => choice === null)) return false;
        this.foundationRewards.set(
            playerId,
            createFoundationRewardSelection({
                sourceId,
                objectiveId: objectiveId ?? source.objectiveId,
                choices,
                selectedIndex: 0
            })
        );
        player.ropeObject.rope.detach();
        player.ropeObject.swingDrag = null;
        return true;
    }

    #transferPlayersThroughOpenPortals({ replicate }) {
        const activePlayers = this.players.filter(({ lifeState }) => lifeState === "active");
        for (const gate of this.world.gates) {
            if (!gate.nextAreaId || !this.worldProgress.isGateCrossed(gate.id)) continue;
            const nextArea = this.world.areas.find(({ id }) => id === gate.nextAreaId);
            if (!nextArea) throw new Error(`Missing portal destination area '${gate.nextAreaId}'`);
            for (const [index, player] of activePlayers.entries()) {
                if (!pointInsideBounds(player.physics.position, gate.trigger)) continue;
                const departure = Object.freeze({ x: player.physics.position.x, y: player.physics.position.y });
                const position = portalArrivalPosition(nextArea.entry, index, activePlayers.length);
                this.applyPortalTransition(player.id, position, this.tick, gate.id);
                const payload = Object.freeze({
                    gateId: gate.id,
                    areaId: gate.areaId,
                    nextAreaId: gate.nextAreaId,
                    playerId: player.id,
                    departure,
                    position
                });
                if (replicate) this.recordReplicationEvent("gate-portal-entered", payload);
                this.eventFlash = { type: "gate-portal-entered", age: 0, ...payload };
            }
        }
    }

    #advanceAutomaticWeapon(player, dt, allowFire = true) {
        const enemies = this.enemies.filter(
            (enemy) =>
                !enemy.activation ||
                (player.physics.position.x >= enemy.activation.x &&
                    player.physics.position.x <= enemy.activation.x + enemy.activation.width &&
                    player.physics.position.y >= enemy.activation.y &&
                    player.physics.position.y <= enemy.activation.y + enemy.activation.height)
        );
        return updateAutomaticWeapon({
            owner: player,
            enemies,
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
        if (this.worldProgress) return false;
        const player = this.players.find(
            (candidate) =>
                candidate.lifeState === "active" &&
                candidate.physics.position.distanceTo(this.world.summit) <= this.world.summit.radius
        );
        return player ? this.beginCompletion(player.id) : false;
    }

    summitClaimCandidate(playerId) {
        if (this.worldProgress) return null;
        if (this.runState !== "playing") return null;
        const player = this.players.find(({ id }) => id === playerId);
        if (!player || player.lifeState !== "active") return null;
        return player.physics.position.distanceTo(this.world.summit) <= this.world.summit.radius
            ? this.world.summit
            : null;
    }

    resolveSummitClaim(playerId, claim, { positionTolerance = 40 } = {}) {
        if (this.worldProgress) return Object.freeze({ accepted: false, reason: "authored-gate-required" });
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
        const rewardsArtifact = checkpoint.reward ?? checkpoint.level > 0;
        if (rewardsArtifact && !this.rewardedCheckpointIds.has(checkpoint.id)) {
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

    updateFoundationRewards(commandsByPlayerId) {
        for (const [playerId, reward] of [...this.foundationRewards]) {
            const player = this.#findPlayer(playerId);
            if (!player) {
                this.foundationRewards.delete(playerId);
                continue;
            }
            const outcome = advanceFoundationRewardSelection(reward, this.commandForPlayer(player, commandsByPlayerId));
            this.foundationRewards.set(playerId, outcome.selection);
            if (!outcome.confirmedFoundationId) continue;
            this.resolveFoundationSelection(playerId, {
                sourceId: reward.sourceId,
                foundationId: outcome.confirmedFoundationId
            });
        }
    }

    resolveFoundationSelection(
        playerId,
        { sourceId, foundationId },
        { requireOpenReward = true, positionTolerance = 40, replicate = true } = {}
    ) {
        const player = this.#findPlayer(playerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        const source = this.world.objects?.find(({ id }) => id === sourceId);
        if (source?.kind !== "augment-node") {
            return Object.freeze({ accepted: false, reason: "source-unavailable" });
        }
        const foundation = foundationAugmentById(foundationId);
        if (!foundation || !source.choices?.includes(foundationId)) {
            return Object.freeze({ accepted: false, reason: "foundation-unavailable" });
        }
        if (player.foundation.selectedId !== null) {
            return player.foundation.selectedId === foundationId
                ? Object.freeze({ accepted: true, sourceId, foundationId, changed: false })
                : Object.freeze({ accepted: false, reason: "selection-conflict" });
        }
        const reward = this.foundationRewards.get(playerId);
        if (requireOpenReward && reward?.sourceId !== sourceId) {
            return Object.freeze({ accepted: false, reason: "reward-unavailable" });
        }
        if (
            !reward &&
            player.physics.position.distanceTo(source.position) > source.interactionRadius + positionTolerance
        ) {
            return Object.freeze({ accepted: false, reason: "source-out-of-range" });
        }
        if (!player.foundation.select(foundationId)) {
            return Object.freeze({ accepted: false, reason: "selection-conflict" });
        }
        this.foundationRewards.delete(playerId);

        const objectiveId = reward?.objectiveId ?? source.objectiveId;
        const selectionPayload = Object.freeze({
            playerId,
            sourceId,
            objectiveId,
            foundationId,
            foundation,
            position: vectorState(player.physics.position)
        });
        if (replicate) this.recordReplicationEvent("foundation-selected", selectionPayload);
        this.eventFlash = { type: "foundation-selected", age: 0, ...selectionPayload };

        if (this.worldProgress && !this.worldProgress.isObjectiveComplete(objectiveId)) {
            const areaId = source.areaId ?? this.worldProgress.currentAreaId;
            for (const event of completeWorldProgressObjective({
                progress: this.worldProgress,
                objectiveId,
                areaId,
                player
            })) {
                const { type, ...payload } = event;
                if (replicate) this.recordReplicationEvent(type, payload);
                if (type === "gate-unlocked") {
                    this.activeCollisionSurfaces = collisionSurfacesForProgress(this.world, this.worldProgress);
                }
            }
        }
        return Object.freeze({ accepted: true, sourceId, foundationId, changed: true });
    }

    clearFoundationSelection(playerId, sourceId = null) {
        const player = this.#requirePlayer(playerId);
        player.foundation.clear();
        if (sourceId) {
            const source = this.world.objects?.find(({ id }) => id === sourceId);
            if (source) this.beginFoundationReward(playerId, sourceId, source.objectiveId);
        }
        return this.playerState(playerId);
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
                    areaId: spawn.areaId,
                    objectId: spawn.objectId,
                    enemyType: spawn.enemyType,
                    activation: spawn.activation,
                    patrol: spawn.patrol,
                    rules: spawn.rules,
                    radius: COMBAT_CONFIG.enemyRadius,
                    health: COMBAT_CONFIG.enemyHealth,
                    maxHealth: COMBAT_CONFIG.enemyHealth,
                    fireCooldown: COMBAT_CONFIG.enemyFireInterval
                })
        );
    }

    recordProjectileSpawn(projectile) {
        const replication = projectile.replicationState(this.tick);
        const spawnEvent = createPredictableSpawnEvent({
            eventId: this.registry.createId("event"),
            objectId: projectile.id,
            objectType: replication.objectType,
            spawnTick: this.tick,
            position: projectile.position,
            velocity: projectile.velocity,
            parameters: {
                ownerId: replication.ownerId,
                targetId: replication.targetId,
                predictionId: replication.predictionId,
                radius: replication.radius,
                damage: replication.damage,
                speed: replication.speed,
                canCutRope: replication.canCutRope
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
        const expectedSpawnPosition = player.weapon.projectileSpawnPosition(player, target);
        if (
            Math.hypot(claim.position.x - expectedSpawnPosition.x, claim.position.y - expectedSpawnPosition.y) >
            positionTolerance
        ) {
            return Object.freeze({ accepted: false, reason: "position-mismatch" });
        }
        const projectile = this.#advanceAutomaticWeapon(player, 0);
        if (!projectile) return Object.freeze({ accepted: false, reason: "weapon-unavailable" });
        projectile.position.set(claim.position.x, claim.position.y);
        projectile.predictionId = claim.predictionId;
        this.recordProjectileSpawn(projectile);
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

    resolveFoundationShearClaim(authenticatedPlayerId, claim, { positionTolerance = 40 } = {}) {
        const player = this.#findPlayer(authenticatedPlayerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        if (player.foundation.selectedId !== "shear-current") {
            return Object.freeze({ accepted: false, reason: "foundation-missing" });
        }
        if (!claim.predictionId.startsWith(`${authenticatedPlayerId}:foundation-shear:${claim.clientTick}:`)) {
            return Object.freeze({ accepted: false, reason: "prediction-ownership" });
        }
        if (player.physics.position.distanceTo(claim.playerPosition) > positionTolerance) {
            return Object.freeze({ accepted: false, reason: "position-mismatch" });
        }
        if (
            Math.hypot(claim.anchor.x - claim.playerPosition.x, claim.anchor.y - claim.playerPosition.y) >
            ROPE_CONFIG.maxAttachDistance + positionTolerance
        ) {
            return Object.freeze({ accepted: false, reason: "segment-out-of-range" });
        }

        const target =
            claim.targetKind === "enemy"
                ? this.enemies.find(({ id, health }) => id === claim.targetId && health > 0)
                : this.world.objects?.find(({ id, kind }) => id === claim.targetId && kind === "test-target");
        if (!target) return Object.freeze({ accepted: false, reason: "target-missing" });
        const targetRadius = claim.targetKind === "enemy" ? target.radius : 22;
        if (
            distancePointToSegment(target.position, claim.anchor, claim.playerPosition) >
            targetRadius + FOUNDATION_AUGMENT_CONFIG.shearSegmentTolerance
        ) {
            return Object.freeze({ accepted: false, reason: "segment-mismatch" });
        }
        const damage = claim.targetKind === "enemy" ? FOUNDATION_AUGMENT_CONFIG.shearDamage : 0;
        const previousHealth = claim.targetKind === "enemy" ? target.health : null;
        this.commitFoundationEvents([
            Object.freeze({
                eventType: "foundation-shear-hit",
                playerId: authenticatedPlayerId,
                foundationId: "shear-current",
                predictionId: claim.predictionId,
                targetId: claim.targetId,
                targetKind: claim.targetKind,
                anchor: Object.freeze({ ...claim.anchor }),
                playerPosition: Object.freeze({ ...claim.playerPosition }),
                position: vectorState(target.position),
                damage
            })
        ]);
        const resolution =
            claim.targetKind === "calibration-dummy"
                ? "contact-registered"
                : previousHealth <= damage
                  ? "enemy-defeated"
                  : "enemy-hit";
        return Object.freeze({ accepted: true, resolution, damage });
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
            { damage: projectile.damage, sourcePlayerId: projectile.ownerId, targetId: projectile.targetId }
        );
        if (resolution === "enemy-defeated") this.metrics.enemyDefeats += 1;
        this.enemies = this.enemies.filter(({ health }) => health > 0);
        return Object.freeze({ accepted: true, resolution, damage: projectile.damage });
    }

    resolveEnemyProjectileClaim(authenticatedPlayerId, claim) {
        return this.#resolveEnemyProjectileClaim(authenticatedPlayerId, claim, { allowRecoveryState: false });
    }

    resolveEnemyProjectileRecovery(authenticatedPlayerId, claim) {
        return this.#resolveEnemyProjectileClaim(authenticatedPlayerId, claim, { allowRecoveryState: true });
    }

    #resolveEnemyProjectileClaim(authenticatedPlayerId, claim, { allowRecoveryState }) {
        const player = this.players.find(({ id }) => id === authenticatedPlayerId);
        if (!player) return Object.freeze({ accepted: false, reason: "player-missing" });
        const projectile = this.enemyProjectiles.find(({ id }) => id === claim.projectileId);
        if (projectile && claim.impactType === "rope-cut" && !projectile.canCutRope) {
            return Object.freeze({ accepted: false, reason: "rope-cut-disallowed" });
        }
        if (claim.outcome) {
            const damage = projectile?.damage ?? claim.damage;
            if (claim.outcome.state) {
                if (!allowRecoveryState) {
                    return Object.freeze({ accepted: false, reason: "recovery-not-authorized" });
                }
                this.#restorePlayer(player, claim.outcome.state);
            } else {
                const stateBeforeImpact = this.playerState(player.id);
                this.#applyVictimImpactTransition(player, claim, damage);
                const digest = createPlayerImpactStateDigest(this.playerState(player.id), {
                    impactType: claim.impactType,
                    respawned: claim.outcome.respawned
                });
                if (digest !== claim.outcome.digest) {
                    this.#restorePlayer(player, stateBeforeImpact);
                    return Object.freeze({ accepted: false, reason: "state-diverged" });
                }
            }
            return this.#finalizeVictimImpact(player, claim, projectile, damage);
        }
        if (!projectile) return Object.freeze({ accepted: false, reason: "projectile-missing" });
        if (projectile.targetId !== authenticatedPlayerId) {
            return Object.freeze({ accepted: false, reason: "target-mismatch" });
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
            {
                damage: claim.impactType === "player-hit" ? projectile.damage : 0,
                targetId: player.id
            }
        );
        this.metrics.recordPlayerImpact(claim.impactType, projectile.damage);
        if (claim.impactType === "player-hit" && player.health <= 0) {
            this.respawnPlayerAtCheckpoint(player, "health", claim.projectileId);
        }
        return Object.freeze({ accepted: true, resolution: claim.impactType, damage: projectile.damage });
    }

    #applyVictimImpactTransition(player, claim, damage) {
        if (claim.impactType === "rope-cut") {
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
            player.ropeDisabledRemaining = COMBAT_CONFIG.ropeDisabledSeconds;
            return;
        }
        player.health = Math.max(0, player.health - damage);
        const speed = Math.hypot(claim.velocity.x, claim.velocity.y);
        if (speed > 0) {
            player.physics.addImpulse(
                new Vector2(claim.velocity.x / speed, claim.velocity.y / speed),
                COMBAT_CONFIG.playerHitKnockback
            );
        }
        player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
        if (claim.outcome.respawned) this.#resetPlayerAtCheckpoint(player);
    }

    #finalizeVictimImpact(player, claim, projectile, damage) {
        if (claim.impactType === "rope-cut") {
            this.eventFlash = {
                type: "rope-cut",
                age: 0,
                position: new Vector2(claim.position.x, claim.position.y),
                playerId: player.id
            };
        }
        if (projectile) this.enemyProjectiles = this.enemyProjectiles.filter(({ id }) => id !== projectile.id);
        this.recordProjectileResolution(
            {
                projectileId: claim.projectileId,
                resolution: claim.impactType,
                position: new Vector2(claim.position.x, claim.position.y)
            },
            {
                damage: claim.impactType === "player-hit" ? damage : 0,
                targetId: player.id
            }
        );
        this.metrics.recordPlayerImpact(claim.impactType, damage);
        if (claim.outcome.respawned) this.#recordPlayerRespawn(player, "health", claim.projectileId);
        return Object.freeze({ accepted: true, resolution: claim.impactType, damage });
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
                parameters: combatEvent
                    ? {
                          damage: combatEvent.damage,
                          ...(combatEvent.sourcePlayerId ? { sourcePlayerId: combatEvent.sourcePlayerId } : {}),
                          ...(combatEvent.targetId ? { targetId: combatEvent.targetId } : {})
                      }
                    : {}
            })
        );
    }

    drainReplicationEvents() {
        const events = Object.freeze(this.replicationEvents);
        this.replicationEvents = [];
        return events;
    }

    respawnPlayerAtCheckpoint(player, reason, causeId = `${reason}:${this.tick}`) {
        if (!player || this.runState !== "playing") return false;
        this.#resetPlayerAtCheckpoint(player);
        this.#recordPlayerRespawn(player, reason, causeId);
        return true;
    }

    #resetPlayerAtCheckpoint(player) {
        const respawnPosition = this.activeCheckpoint ?? { x: 120, y: 500 };
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
        player.foundation.resetRuntime();
        this.applyArtifactEffects(player);
    }

    #recordPlayerRespawn(player, reason, causeId) {
        this.metrics.recordDefeat();
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
                causeId,
                artifacts: [...player.lastCheckpointLoss],
                position: player.physics.position.clone()
            };
        } else {
            this.eventFlash = {
                type: "checkpoint-respawn",
                age: 0,
                playerId: player.id,
                reason,
                causeId,
                position: player.physics.position.clone()
            };
        }
        this.recordReplicationEvent("player-respawned", {
            playerId: player.id,
            reason,
            causeId,
            health: player.health,
            artifactIds,
            position: { x: player.physics.position.x, y: player.physics.position.y }
        });
        this.resets += 1;
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
            foundationAugment: player.foundation.selectedId,
            augmentRuntimeState: player.foundation.snapshot(),
            lastCheckpointLoss: [...player.lastCheckpointLoss],
            artifactReward: this.artifactRewards.get(player.id) ?? null,
            artifactRewards: Object.fromEntries(this.artifactRewards),
            foundationReward: this.foundationRewards.get(player.id) ?? null,
            foundationRewards: Object.fromEntries(this.foundationRewards),
            rewardedCheckpointIds: [...this.rewardedCheckpointIds],
            ropeDamageBoostRemaining: player.ropeDamageBoostRemaining,
            metrics: this.metrics.snapshot(),
            worldProgress: this.worldProgress?.snapshot() ?? null,
            windStates: this.world.windZones
                ? snapshotWindStates(this.world.windZones, this.elapsedSeconds)
                : Object.freeze([]),
            resets: this.resets,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance
        };
    }
}
