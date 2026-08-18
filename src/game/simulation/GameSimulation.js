import { Vector2 } from "../../game-kit/index.js";
import { FOUNDATION_AUGMENT_CATALOG, foundationAugmentById } from "../augments/FoundationAugmentCatalog.js";
import { validateAugmentImpactFormula } from "../augments/AugmentImpactFormula.js";
import {
    advanceEnemyProjectiles,
    updateAutomaticWeapon,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../combat/CombatSystems.js";
import {
    createEnemyArchetype,
    enemyDisplayName,
    isEnemyArchetype,
    isKnownEnemyType
} from "../combat/EnemyArchetypeCatalog.js";
import { advanceEnemyBehaviors } from "../combat/EnemyBehaviors.js";
import { EnemyObject } from "../combat/EnemyObject.js";
import { recordEnemyImpactTombstone } from "../combat/EnemyImpactTombstones.js";
import { resolvePlayerEnemyImpact } from "../combat/PlayerEnemyImpactResolver.js";
import { fallDamageForImpactSpeed } from "../combat/FallDamage.js";
import { BallisticProjectileObject, HomingProjectileObject } from "../combat/ProjectileObject.js";
import {
    COMBAT_CONFIG,
    FALL_DAMAGE_CONFIG,
    PLAYER_CONFIG,
    ROPE_CONFIG,
    ROPE_IMPACT_CONFIG,
    WIND_CONFIG,
    WORLD_CONFIG,
    resolveEffectiveRopeConfig,
    resolveEffectiveRopeDisabledSeconds
} from "../config.js";
import { InputDispatcher } from "../input/InputDispatcher.js";
import { findRopeAttachment, launchHandPosition } from "../input/RopePointerInput.js";
import { RunMetrics } from "../metrics/RunMetrics.js";
import { createPlayerImpactStateDigest } from "../network/PlayerImpactClaim.js";
import { createPredictableResolveEvent, createPredictableSpawnEvent } from "../network/PredictableObjectEvent.js";
import { resolvePlayerCollisions } from "../physics/PlayerCollision.js";
import { CircleCollider } from "../physics/colliders/CircleCollider.js";
import { createPlayerRuntime } from "../players/PlayerRuntimeFactory.js";
import { releaseRopeFromBody } from "../rope/RopeAttachment.js";
import { hookReach } from "../rope/RopeLauncher.js";
import {
    advanceFoundationRewardSelection,
    createDeterministicFoundationRewardSelection,
    createFoundationRewardSelection
} from "../rewards/FoundationRewardSelection.js";
import { generateWorld, WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";
import { assembleAuthoredWorld } from "../world/AuthoredWorldAssembler.js";
import { resolveEnemyEncounter } from "../world/EnemyEncounterSelection.js";
import { advanceSectorProgress } from "../world/SectorProgressController.js";
import { SectorProgressState } from "../world/SectorProgressState.js";
import { collisionSurfacesForProgress, collisionSurfacesForSectorProgress } from "../world/WorldGateGeometry.js";
import {
    pointInsideBounds,
    sampleWorldForce,
    snapshotWindStates,
    windOccludingSurfaces
} from "../world/WorldForceField.js";
import { accessScanStateMap, isSurfaceAccessAllowed, snapshotAccessScanStates } from "../world/AccessScanField.js";
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

function createEnemyRuntime(properties) {
    if (isEnemyArchetype(properties.enemyType)) return createEnemyArchetype(properties);
    if (isKnownEnemyType(properties.enemyType)) {
        return new EnemyObject({ ...properties, displayName: enemyDisplayName(properties.enemyType) });
    }
    throw new Error(`unknown enemy type: ${properties.enemyType}`);
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

    constructor({
        worldSeed = WORLD_CONFIG.seed,
        playerId = null,
        worldCatalog = null,
        worldFactory = null,
        startAreaId = null,
        startLandmarkId = null,
        ropeConfig = ROPE_CONFIG,
        ropeDisabledSeconds = COMBAT_CONFIG.ropeDisabledSeconds
    } = {}) {
        this.ropeConfig = resolveEffectiveRopeConfig(ropeConfig);
        this.ropeDisabledSeconds = resolveEffectiveRopeDisabledSeconds({ ropeDisabledSeconds });
        this.worldCatalog = worldCatalog;
        this.worldFactory = worldFactory;
        this.world = worldFactory
            ? worldFactory({ seed: worldSeed, floorY: WORLD_CONFIG.floorY, summitRadius: WORLD_CONFIG.summitRadius })
            : worldCatalog
              ? assembleAuthoredWorld(worldCatalog, {
                    seed: worldSeed,
                    floorY: WORLD_CONFIG.floorY,
                    checkpointRadius: WORLD_CONFIG.checkpointRadius,
                    summitRadius: WORLD_CONFIG.summitRadius
                })
              : generateWorld({ ...WORLD_CONFIG, seed: worldSeed });
        this.isSeamlessSectorWorld = this.world.layout === "seamless-sectors";
        this.worldProgress = this.isSeamlessSectorWorld
            ? new SectorProgressState(this.world)
            : worldCatalog
              ? new WorldProgressState(worldCatalog, null, { startAreaId })
              : null;
        this.activeCollisionSurfaces = this.isSeamlessSectorWorld
            ? collisionSurfacesForSectorProgress(this.world, this.worldProgress)
            : collisionSurfacesForProgress(this.world, this.worldProgress);
        this.windOccluders = windOccludingSurfaces(this.world.surfaces);
        this.elapsedSeconds = 0;
        this.metrics = new RunMetrics({ progressKind: this.isSeamlessSectorWorld ? "sector" : "area" });
        this.registry = new EntityRegistry();
        this.#inputDispatcher = new InputDispatcher();
        this.#inputDrivenObjectsByOwner = new Map();
        this.portalTransitions = new Map();
        this.lastAcceptedPlayerProjectileSpawnTick = new Map();
        this.players = [];
        if (this.isSeamlessSectorWorld && (startLandmarkId ?? startAreaId)) {
            this.advanceSectorProgressToLandmark(startLandmarkId ?? startAreaId);
        }
        const startArea = this.world.areas?.find(({ id }) => id === startAreaId) ?? this.world.areas?.[0];
        const startLandmark = this.isSeamlessSectorWorld
            ? this.world.landmarks.find(({ id }) => id === this.worldProgress.currentLandmarkId)
            : null;
        const playerRuntime = this.addPlayer(startLandmark?.entry ?? startArea?.entry, playerId);
        this.#primaryPlayerId = playerRuntime.entity.id;
        this.enemies = this.createEnemies();
        this.enemyImpactTombstones = new Map();
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.eventFlash = { type: "ready", age: 10 };
        this.resets = 0;
        this.runState = "playing";
        this.activeCheckpoint = this.isSeamlessSectorWorld
            ? null
            : ((startAreaId
                  ? (this.world.checkpoints.find(({ id }) => id === `checkpoint:${startAreaId}`) ?? null)
                  : null) ??
              this.world.checkpoints[0] ??
              null);
        this.activeRespawnAnchor = this.isSeamlessSectorWorld
            ? (this.world.respawnAnchors.find(({ id }) => id === this.worldProgress.snapshot().respawnAnchorId) ?? null)
            : null;
        this.sectorRespawnedPlayerIdsThisTick = new Set();
        this.contentBoundaryAnnounced = false;
        this.foundationRewards = new Map();
        this.tick = 0;
        this.replicationEvents = [];
    }

    addPlayer(spawn, playerId = null) {
        const runtime = createPlayerRuntime({
            registry: this.registry,
            playerConfig: PLAYER_CONFIG,
            ropeConfig: this.ropeConfig,
            combatConfig: COMBAT_CONFIG,
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
        this.foundationRewards.delete(playerId);
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
            launcher: player.ropeObject.launcher.snapshot(),
            weapon: {
                range: player.weapon.range,
                damage: player.weapon.damage,
                fireInterval: player.weapon.fireInterval,
                cooldown: player.weapon.cooldown
            },
            foundationAugment: player.foundation.selectedId,
            selectedAugmentIds: player.foundation.selectedIds,
            augmentRuntimeState: Object.freeze({
                ...player.foundation.snapshot(),
                combat: player.augmentCombat.snapshot()
            }),
            actionState: player.augmentCombat.actionState?.snapshot() ?? null
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
            displayName: enemy.displayName,
            activation: enemy.activation,
            patrol: enemy.patrol,
            swarmGroupId: enemy.swarmGroupId,
            behaviorState: enemy.enemyBehaviorSnapshot(),
            impactDisplacementEnabled: enemy.impactDisplacementEnabled,
            knockbackState: enemy.knockbackSnapshot(),
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

    getFoundationReward(playerId) {
        return this.foundationRewards.get(playerId) ?? null;
    }

    advanceWorldProgressToArea(areaId) {
        if (!this.worldProgress || this.isSeamlessSectorWorld) return false;
        const target = this.world.areas.find(({ id }) => id === areaId);
        if (!target) return false;
        this.worldProgress = new WorldProgressState(this.worldCatalog);
        this.portalTransitions.clear();
        this.foundationRewards.clear();
        for (const area of this.world.areas) {
            if (area.id === areaId) break;
            for (const objectiveId of area.objectiveIds) this.worldProgress.completeObjective(objectiveId);
            this.worldProgress.crossGate(area.gateId);
        }
        this.activeCollisionSurfaces = collisionSurfacesForProgress(this.world, this.worldProgress);
        return true;
    }

    advanceSectorProgressToLandmark(landmarkId) {
        if (!this.isSeamlessSectorWorld) return false;
        const target = this.world.landmarks.find(
            ({ id, legacyAreaId, legacyStageAlias }) =>
                id === landmarkId || legacyAreaId === landmarkId || legacyStageAlias === landmarkId
        );
        if (!target) return false;
        this.worldProgress = new SectorProgressState(this.world);
        this.contentBoundaryAnnounced = false;
        this.portalTransitions?.clear();
        this.foundationRewards?.clear();
        for (const route of this.world.routeLocks) {
            if (this.worldProgress.currentLandmarkId === target.id) break;
            const source = this.world.landmarks.find(({ id }) => id === route.sourceLandmarkId);
            if (source.id !== this.worldProgress.currentLandmarkId) continue;
            for (const objectiveId of source.objectiveIds) {
                const objective = this.world.objectives.find(({ id }) => id === objectiveId);
                for (const requiredId of objective.requiredObjectiveIds ?? []) {
                    if (!this.worldProgress.isObjectiveComplete(requiredId)) {
                        this.worldProgress.completeObjective(requiredId);
                    }
                }
                this.worldProgress.completeObjective(objectiveId);
            }
            this.worldProgress.visitLandmark(route.targetLandmarkId);
        }
        this.activeCollisionSurfaces = collisionSurfacesForSectorProgress(this.world, this.worldProgress);
        this.activeRespawnAnchor =
            this.world.respawnAnchors.find(({ id }) => id === this.worldProgress.snapshot().respawnAnchorId) ?? null;
        return this.worldProgress.currentLandmarkId === target.id;
    }

    debugTeleportPlayer(playerId, areaId) {
        const player = this.#requirePlayer(playerId);
        if (this.isSeamlessSectorWorld) {
            const landmark = this.world.landmarks.find(
                ({ id, legacyAreaId, legacyStageAlias }) =>
                    id === areaId || legacyAreaId === areaId || legacyStageAlias === areaId
            );
            if (!landmark || !this.advanceSectorProgressToLandmark(landmark.id)) return null;
            this.applyPortalTransition(playerId, landmark.entry, this.tick, `debug:${landmark.id}`);
            return Object.freeze({ x: landmark.entry.x, y: landmark.entry.y });
        }
        const area = this.world.areas.find(({ id }) => id === areaId);
        if (!area) return null;
        this.advanceWorldProgressToArea(areaId);
        this.activeCheckpoint =
            this.world.checkpoints.find(({ id }) => id === `checkpoint:${areaId}`) ?? this.activeCheckpoint;
        this.applyPortalTransition(playerId, { x: area.entry.x, y: area.entry.y }, this.tick, `debug:${areaId}`);
        return Object.freeze({ x: area.entry.x, y: area.entry.y });
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
        player.ropeObject.launcher.clear();
        player.ropeImpactAttack.reset();
        player.weapon.cooldown = 0;
        player.hitInvulnerabilityRemaining = 0;
        player.ropeDisabledRemaining = 0;
        player.foundation.resetRuntime();
        player.augmentCombat.resetForRespawn(player.foundation, player.maxHealth);
        this.portalTransitions.set(player.id, Object.freeze({ gateId, position, tick }));
        return this.ownerPredictionState(player.id);
    }

    #advanceSweptOwnerGate(player, destination) {
        if (!this.worldProgress || this.isSeamlessSectorWorld || player.lifeState !== "active") return false;
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
            player.ropeObject.launcher.clear();
        } else if (synchronizeRope && state.rope.isAttached) {
            player.ropeObject.rope.attach(player.physics.position, state.rope.anchor, {
                angle: player.physics.angle,
                attachmentOffset: state.rope.attachmentOffset
            });
        } else if (synchronizeRope) {
            this.releasePlayerRope(playerId);
        }
        if (player.ropeDisabledRemaining <= 0) {
            player.ropeObject.launcher.restore(state.launcher);
        }
        if (state.augmentRuntimeState?.combat) {
            player.augmentCombat.restore(state.augmentRuntimeState.combat, player.foundation, player.maxHealth);
        }
        player.ropeImpactAttack.observe(player, this.enemies, state.clientTick ?? this.tick);
        return true;
    }

    preparePrediction(
        enemies = [],
        activeCheckpointId = this.activeCheckpoint?.id ?? null,
        respawnAnchorId = this.activeRespawnAnchor?.id ?? null
    ) {
        if (this.isSeamlessSectorWorld) {
            if (respawnAnchorId !== null && respawnAnchorId !== undefined) {
                const anchor = this.world.respawnAnchors.find(({ id }) => id === respawnAnchorId);
                if (!anchor) throw new Error(`unknown respawn anchor: ${respawnAnchorId}`);
                this.activeRespawnAnchor = anchor;
            }
        } else if (activeCheckpointId !== null && activeCheckpointId !== undefined) {
            const activeCheckpoint = this.world.checkpoints.find(({ id }) => id === activeCheckpointId);
            if (!activeCheckpoint) throw new Error(`unknown active checkpoint: ${activeCheckpointId}`);
            this.activeCheckpoint = activeCheckpoint;
        }
        this.enemies = enemies.map((enemy) =>
            createEnemyRuntime({
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
        if (this.isSeamlessSectorWorld) this.contentBoundaryAnnounced = snapshot?.contentBoundaryReached === true;
        this.elapsedSeconds = elapsedSeconds;
        this.activeCollisionSurfaces = this.isSeamlessSectorWorld
            ? collisionSurfacesForSectorProgress(this.world, this.worldProgress)
            : collisionSurfacesForProgress(this.world, this.worldProgress);
        if (this.isSeamlessSectorWorld) {
            this.activeRespawnAnchor =
                this.world.respawnAnchors.find(({ id }) => id === this.worldProgress.snapshot().respawnAnchorId) ??
                null;
        }
        return this.worldProgress.snapshot();
    }

    rebaseElapsedSeconds(tick, serverTick, worldElapsedSeconds, fixedDt = 1 / 120) {
        if (!Number.isSafeInteger(tick) || !Number.isSafeInteger(serverTick) || tick < 0 || serverTick < 0) {
            throw new Error("elapsed rebase requires non-negative integer ticks");
        }
        if (!Number.isFinite(worldElapsedSeconds) || !Number.isFinite(fixedDt) || fixedDt <= 0) {
            throw new Error("elapsed rebase requires finite world elapsed seconds and positive fixed dt");
        }
        this.elapsedSeconds = worldElapsedSeconds + (tick - serverTick) * fixedDt;
        return this.elapsedSeconds;
    }

    synchronizePredictionProgress(playerId, { foundationReward = null } = {}) {
        this.#requirePlayer(playerId);
        const hadOpenReward = this.foundationRewards.has(playerId);
        this.foundationRewards.clear();
        if (foundationReward) {
            this.foundationRewards.set(playerId, createFoundationRewardSelection(foundationReward));
            if (!hadOpenReward) {
                const player = this.#findPlayer(playerId);
                player.ropeObject.rope.detach();
                player.ropeObject.swingDrag = null;
            }
        }
        return this.getFoundationReward(playerId);
    }

    predictionProgressState(playerId) {
        this.#requirePlayer(playerId);
        return Object.freeze({
            activeCheckpointId: this.activeCheckpoint?.id ?? null,
            respawnAnchorId: this.activeRespawnAnchor?.id ?? null,
            foundationReward: this.getFoundationReward(playerId)
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
        }
        if (
            !preservePendingFoundation &&
            JSON.stringify(shared.selectedAugmentIds ?? []) !== JSON.stringify(player.foundation.selectedAugmentIds)
        ) {
            player.foundation.restore(shared.foundationAugment, shared.augmentRuntimeState);
            player.augmentCombat.restore(
                shared.augmentRuntimeState?.combat ?? null,
                player.foundation,
                player.maxHealth
            );
        }
        this.tick = Math.max(this.tick, predictionTick);
        return this.ownerPredictionState(ownerId);
    }

    advanceOwnerPrediction(ownerId, command, dt, tick, { allowFire = true } = {}) {
        const player = this.#requirePlayer(ownerId);
        this.tick = tick;
        this.elapsedSeconds += dt;
        this.#prepareOwnerStep(player, dt);
        const wallImpactEvents = this.#advanceEnemyImpactKnockbacks(dt, { emitWallImpacts: true });
        this.#applyWorldForce(player, dt);
        const inputOutcome = this.dispatchOwnerInput(ownerId, command, dt, { replicateLandingImpacts: false });
        const ropeImpactEvents = this.#advanceRopeImpactAttacks(player, { commit: false });
        const collisionExplosionEvents = player.augmentCombat.collisionExplosionEvents({
            player,
            foundation: player.foundation,
            baseImpactEvents: ropeImpactEvents,
            enemies: this.enemies,
            tick
        });
        const augmentImpactEvents = Object.freeze([
            ...wallImpactEvents,
            ...inputOutcome.augmentImpactEvents,
            ...(collisionExplosionEvents ?? [])
        ]);
        this.#commitAugmentImpactEvents(augmentImpactEvents, { replicate: false });
        const projectile = this.#advanceAutomaticWeapon(player, dt, allowFire);
        this.projectiles.length = 0;
        return Object.freeze({
            projectile,
            foundationEvents: inputOutcome.foundationEvents,
            fallImpactEvents: inputOutcome.fallImpactEvents,
            ropeImpactEvents: collisionExplosionEvents === null ? ropeImpactEvents : Object.freeze([]),
            augmentImpactEvents,
            augmentEvents: inputOutcome.augmentEvents
        });
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
            player.ropeObject.attachBufferRemaining = 0;
            player.ropeObject.launcher.clear();
            player.ropeDisabledRemaining = this.ropeDisabledSeconds;
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
        const protection = player.augmentCombat.absorbPlayerDamage({
            amount: damage,
            type: "combat-hp",
            sourceKind: event.parameters?.sourceKind ?? "projectile",
            attackerId: event.parameters?.ownerId ?? null
        });
        player.health = Math.max(0, player.health - protection.appliedDamage);
        for (const reflected of protection.events) {
            const attacker = this.enemies.find(({ id }) => id === reflected.attackerId);
            if (attacker) {
                player.augmentCombat.queueDamageReflection({
                    player,
                    attacker,
                    damage: reflected.reflectedDamage,
                    tick: this.tick,
                    sourceKind: reflected.sourceKind
                });
            }
        }
        if (player.health <= 0) this.respawnPlayerAtCheckpoint(player, "health", event.projectileId);
        return true;
    }

    drainQueuedAugmentImpactEvents(ownerId) {
        return this.#requirePlayer(ownerId).augmentCombat.drainQueuedImpactEvents();
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
            launcher: state.launcher,
            weaponCooldown: state.weapon.cooldown,
            selectedAugmentIds: state.selectedAugmentIds,
            foundationAugment: state.foundationAugment,
            augmentRuntimeState: state.augmentRuntimeState
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
        player.foundation.restore(state.foundationAugment ?? null, state.augmentRuntimeState);
        player.augmentCombat.restore(state.augmentRuntimeState?.combat ?? null, player.foundation, player.maxHealth);
        const effectiveRopeConfig = player.foundation.effectiveRopeConfig(this.ropeConfig);
        player.ropeObject.rope.config = effectiveRopeConfig;
        player.ropeObject.launcher.ropeConfig = effectiveRopeConfig;
        if (player.ropeDisabledRemaining > 0) {
            player.ropeObject.launcher.clear();
        } else {
            player.ropeObject.launcher.restore(state.launcher);
        }
        const launchOrigin = launchHandPosition(player, effectiveRopeConfig, player.ropeObject.aimWorld);
        player.ropeObject.attachmentCandidate = findRopeAttachment({
            aimPoint: player.ropeObject.aimWorld,
            origin: launchOrigin,
            surfaces: this.world.surfaces,
            maxAttachDistance: hookReach(effectiveRopeConfig),
            aimTolerance: player.foundation.ropeInputModifiers(this.ropeConfig).aimTolerance,
            canAttachToSurface: this.#accessScanPredicate()
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
            advanceInputDrivenObjects = true,
            resolveInteractChoice = true
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
            advanceInputDrivenObjects,
            resolveInteractChoice
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
            advanceInputDrivenObjects = true,
            resolveInteractChoice = true
        } = {}
    ) {
        this.tick += 1;
        this.sectorRespawnedPlayerIdsThisTick.clear();
        if (this.runState !== "playing") {
            this.eventFlash.age += dt;
            return;
        }
        if (resolveSummitProgress && this.updateSummitProgress()) return;
        if (resolveCheckpointProgress && !this.isSeamlessSectorWorld) this.updateCheckpointProgress();
        const choosingRewardPlayerIds = new Set([...this.foundationRewards.keys()]);
        this.updateFoundationRewards(commandsByPlayerId);
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
        if (this.worldProgress) {
            const progressId = this.isSeamlessSectorWorld
                ? this.worldProgress.currentLandmarkId
                : this.worldProgress.currentAreaId;
            this.metrics.recordProgressTime(progressId, dt);
        }
        this.elapsedSeconds += dt;
        for (const player of this.players) {
            const playerCommand = this.commandForPlayer(player, gameplayCommands);
            this.#prepareOwnerStep(player, dt);
            if (advanceInputDrivenObjects) {
                this.#applyWorldForce(player, dt);
                const inputOutcome = this.dispatchOwnerInput(player.id, playerCommand, dt);
                this.commitFoundationEvents(inputOutcome.foundationEvents);
                const ropeImpactEvents = this.#advanceRopeImpactAttacks(player, { commit: false });
                const collisionExplosionEvents = player.augmentCombat.collisionExplosionEvents({
                    player,
                    foundation: player.foundation,
                    baseImpactEvents: ropeImpactEvents,
                    enemies: this.enemies,
                    tick: this.tick
                });
                if (collisionExplosionEvents === null) {
                    for (const event of ropeImpactEvents) this.#commitRopeImpact(event);
                }
                this.#commitAugmentImpactEvents([
                    ...inputOutcome.augmentImpactEvents,
                    ...(collisionExplosionEvents ?? [])
                ]);
                this.commitAugmentPresentationEvents(inputOutcome.augmentEvents);
            }
            const projectile = this.#advanceAutomaticWeapon(player, dt, spawnPlayerProjectiles);
            if (projectile) this.recordProjectileSpawn(projectile);
        }
        if (this.worldProgress) {
            this.#advanceAuthoredWorldProgress(gameplayCommands, { dt, resolveInteractChoice });
        }
        const wallImpactEvents = this.#advanceEnemyImpactKnockbacks(dt, {
            emitWallImpacts: advanceInputDrivenObjects
        });
        if (advanceInputDrivenObjects) this.#commitAugmentImpactEvents(wallImpactEvents);
        this.#advanceEnemyBehaviorSimulation(dt);
        const playerProjectileEvents = updatePlayerProjectiles({
            projectiles: this.projectiles,
            enemies: this.enemies,
            config: COMBAT_CONFIG,
            dt,
            resolveHits: resolvePlayerProjectileHits,
            maxLifetimeSeconds: COMBAT_CONFIG.playerProjectileLifetimeSeconds
        });
        const enemyProjectileSpawns = updateEnemyWeapons({
            enemies: this.enemies.filter(({ knockbackState }) => !knockbackState),
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
        this.#removeDefeatedEnemies();
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
                action: false,
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
            action: false,
            pointer: { ...command.pointer, down: false, pressed: false, released: false },
            aimWorld: command.aimWorld ?? player.ropeObject.aimWorld
        };
    }

    dispatchOwnerInput(ownerId, command, dt, { replicateLandingImpacts = true } = {}) {
        const player = this.#requirePlayer(ownerId);
        const foundationEvents = [];
        const fallImpactEvents = [];
        const augmentImpactEvents = [];
        const augmentEvents = [];
        const canControl = player.lifeState === "active";
        const effectiveCommand = canControl
            ? player.augmentCombat.prepareCommand(player, player.foundation, command)
            : {
                  horizontal: 0,
                  vertical: 0,
                  interact: false,
                  action: false,
                  pointer: { x: 0, y: 0, down: false },
                  aimWorld: player.ropeObject.aimWorld
              };
        const effectiveRopeConfig = player.foundation.effectiveRopeConfig(this.ropeConfig);
        player.ropeObject.rope.config = effectiveRopeConfig;
        player.ropeObject.launcher.ropeConfig = effectiveRopeConfig;
        this.#inputDispatcher.dispatch({
            objects: this.inputDrivenObjects(player.id),
            ownerId: player.id,
            input: effectiveCommand,
            context: {
                canControl,
                dt,
                owner: player,
                ropeConfig: effectiveRopeConfig,
                surfaces: this.activeCollisionSurfaces,
                canAttachToSurface: this.#accessScanPredicate(),
                getRopeInputModifiers: () => player.foundation.ropeInputModifiers(effectiveRopeConfig),
                onAttach: () => {},
                onRelease: () => {
                    if (player.foundation.has("release-propulsion")) {
                        player.physics.velocity.scale(1.25);
                        foundationEvents.push(
                            Object.freeze({
                                eventType: "augment-release-propulsion",
                                playerId: player.id,
                                augmentId: "release-propulsion",
                                position: vectorState(player.physics.position),
                                velocity: vectorState(player.physics.velocity)
                            })
                        );
                    }
                    if (player.augmentCombat.onRopeReleased()) {
                        foundationEvents.push(
                            Object.freeze({
                                eventType: "augment-rope-link-ready",
                                playerId: player.id,
                                augmentId: "rope-link",
                                position: vectorState(player.physics.position),
                                duration: 1
                            })
                        );
                    }
                },
                onFlash: (eventFlash) => {
                    this.eventFlash = { ...eventFlash, playerId: player.id };
                },
                onLanding: (landing) => {
                    const event = this.#applyLandingImpact(player, landing, {
                        replicate: replicateLandingImpacts
                    });
                    if (event) fallImpactEvents.push(event);
                }
            }
        });
        const augmentOutcome = player.augmentCombat.advance({
            player,
            foundation: player.foundation,
            command: effectiveCommand,
            dt,
            enemies: this.enemies,
            surfaces: this.activeCollisionSurfaces,
            tick: this.tick
        });
        augmentImpactEvents.push(
            ...player.augmentCombat.observeAttachedRope({
                player,
                foundation: player.foundation,
                enemies: this.enemies,
                dt,
                tick: this.tick
            }),
            ...augmentOutcome.impactEvents
        );
        augmentEvents.push(...augmentOutcome.presentationEvents);
        return Object.freeze({
            foundationEvents: Object.freeze(foundationEvents),
            fallImpactEvents: Object.freeze(fallImpactEvents),
            augmentImpactEvents: Object.freeze(augmentImpactEvents),
            augmentEvents: Object.freeze(augmentEvents)
        });
    }

    #applyLandingImpact(player, landing, { replicate }) {
        if (player.lifeState !== "active") return null;
        const damage = fallDamageForImpactSpeed(landing.impactSpeed, player.maxHealth, FALL_DAMAGE_CONFIG);
        if (damage <= 0) return null;
        const position = Object.freeze({ x: player.physics.position.x, y: player.physics.position.y });
        const impactId = `${player.id}:fall-damage:${this.tick}`;
        player.health = Math.max(0, player.health - damage);
        this.metrics.recordPlayerImpact("fall-damage", damage);
        const respawned = player.health <= 0;
        const event = Object.freeze({
            eventType: "player-fall-damaged",
            resolution: "fall-damage",
            impactId,
            clientTick: this.tick,
            targetId: player.id,
            playerId: player.id,
            position,
            velocity: landing.impactVelocity,
            impactSpeed: landing.impactSpeed,
            damage,
            respawned
        });
        if (replicate) this.recordReplicationEvent(event.eventType, event);
        this.eventFlash = { type: "fall-damage", age: 0, ...event };
        if (respawned) this.respawnPlayerAtCheckpoint(player, "fall-damage", impactId);
        return event;
    }

    #advanceRopeImpactAttacks(player, { commit = true } = {}) {
        const events = player.ropeImpactAttack.advance(player, this.enemies, this.tick);
        if (commit) {
            for (const event of events) this.#commitRopeImpact(event);
        }
        return events;
    }

    #commitRopeImpact(event) {
        const target = this.enemies.find(({ id, health }) => id === event.targetId && health > 0);
        const source = this.#findPlayer(event.sourcePlayerId);
        const result = resolvePlayerEnemyImpact({
            targetId: event.targetId,
            target,
            sourcePosition: source?.physics.position ?? event.position,
            damage: ROPE_IMPACT_CONFIG.damage,
            tombstones: this.enemyImpactTombstones
        });
        if (result.resolution === "shield-blocked") {
            return Object.freeze({ accepted: false, reason: "shield-blocked" });
        }
        if (!result.accepted || !result.emitEffects) return result;
        const resolution = result.resolution;
        if (resolution === "enemy-defeated") this.metrics.enemyDefeats += 1;
        this.recordReplicationEvent("resolve", {
            objectId: event.predictionId,
            resolution,
            position: event.position,
            parameters: Object.freeze({
                sourceKind: "rope-impact",
                predictionId: event.predictionId,
                sourcePlayerId: event.sourcePlayerId,
                targetId: event.targetId,
                damage: ROPE_IMPACT_CONFIG.damage
            })
        });
        this.eventFlash = {
            type: resolution,
            age: 0,
            position: new Vector2(event.position.x, event.position.y),
            damage: ROPE_IMPACT_CONFIG.damage,
            sourcePlayerId: event.sourcePlayerId,
            targetId: event.targetId
        };
        this.#removeDefeatedEnemies();
        return Object.freeze({ accepted: true, resolution, damage: result.damage });
    }

    #advanceEnemyImpactKnockbacks(dt, { emitWallImpacts = false } = {}) {
        const events = [];
        for (const enemy of this.enemies) {
            const state = enemy.knockbackSnapshot();
            if (!state) continue;
            const previousPosition = enemy.position.clone();
            enemy.advanceImpactKnockback(dt);
            const movedPosition = enemy.position.clone();
            const velocity = new Vector2(
                state.direction.x * (state.distance / state.durationSeconds),
                state.direction.y * (state.distance / state.durationSeconds)
            );
            new CircleCollider({ radius: enemy.radius }).resolveSurfaces({
                position: enemy.position,
                velocity,
                surfaces: this.activeCollisionSurfaces,
                previousPosition
            });
            const collided = enemy.position.distanceTo(movedPosition) > 0.01;
            if (
                !emitWallImpacts ||
                !collided ||
                !state.wallImpactEligible ||
                state.wallImpactTriggered ||
                !state.sourcePlayerId
            ) {
                continue;
            }
            if (enemy.knockbackState) enemy.knockbackState.wallImpactTriggered = true;
            events.push(
                Object.freeze({
                    eventId: `${state.sourcePlayerId}:wall-impact:${this.tick}:${enemy.id}`,
                    predictionId: `${state.sourcePlayerId}:wall-impact:${this.tick}:${enemy.id}`,
                    sourcePlayerId: state.sourcePlayerId,
                    targetId: enemy.id,
                    clientTick: this.tick,
                    effectId: "wall-impact",
                    sourceKind: "knockback-wall-contact",
                    sourcePosition: vectorState(previousPosition),
                    contactPosition: vectorState(enemy.position),
                    position: vectorState(enemy.position),
                    damage: ROPE_IMPACT_CONFIG.damage * 0.8,
                    predictedResolution:
                        enemy.health <= ROPE_IMPACT_CONFIG.damage * 0.8 ? "enemy-defeated" : "enemy-hit"
                })
            );
        }
        return Object.freeze(events);
    }

    #advanceEnemyBehaviorSimulation(dt) {
        const outcomes = advanceEnemyBehaviors({
            enemies: this.enemies.filter(({ knockbackState }) => !knockbackState),
            targets: this.players,
            dt
        });
        for (const { enemyId, outcome } of outcomes) {
            if (outcome?.type !== "artillery-strike") continue;
            const projectile = new BallisticProjectileObject({
                id: this.registry.createId("enemy-projectile"),
                ownerId: enemyId,
                targetId: outcome.targetId,
                position: new Vector2(outcome.position.x, outcome.position.y),
                velocity: new Vector2(),
                radius: outcome.radius,
                damage: outcome.damage,
                canCutRope: false
            });
            this.enemyProjectiles.push(projectile);
            this.recordProjectileSpawn(projectile);
        }
        return outcomes;
    }

    resolveRopeImpactClaim(authenticatedPlayerId, claim, { positionTolerance = 40 } = {}) {
        const player = this.#findPlayer(authenticatedPlayerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        if (!claim.predictionId.startsWith(`${authenticatedPlayerId}:rope-impact:${claim.clientTick}:`)) {
            return Object.freeze({ accepted: false, reason: "prediction-ownership" });
        }
        const target = this.enemies.find(({ id, health }) => id === claim.targetId && health > 0);
        if (!target && this.enemyImpactTombstones.has(claim.targetId)) {
            return Object.freeze({
                accepted: true,
                resolution: "target-already-dead",
                damage: 0
            });
        }
        if (!target) return Object.freeze({ accepted: false, reason: "target-missing" });
        if (
            Math.hypot(claim.position.x - target.position.x, claim.position.y - target.position.y) >
                target.radius + positionTolerance ||
            !player.physics.collider.overlapsCircle(
                player.physics.position,
                target.position,
                target.radius + positionTolerance
            )
        ) {
            return Object.freeze({ accepted: false, reason: "position-mismatch" });
        }
        const pendingImpact = player.ropeImpactAttack.consume(claim.predictionId, claim.targetId);
        if (!pendingImpact) return Object.freeze({ accepted: false, reason: "rope-impact-ineligible" });
        return this.#commitRopeImpact(pendingImpact);
    }

    resolveAugmentImpactClaim(authenticatedPlayerId, claim, { positionTolerance = 40, replicate = true } = {}) {
        const player = this.#findPlayer(authenticatedPlayerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "invalid" });
        }
        if (claim.sourcePlayerId !== authenticatedPlayerId || !claim.eventId.startsWith(`${authenticatedPlayerId}:`)) {
            return Object.freeze({ accepted: false, reason: "invalid" });
        }
        const target = this.enemies.find(({ id, health }) => id === claim.targetId && health > 0) ?? null;
        const isTombstoned = this.enemyImpactTombstones.has(claim.targetId);
        if (!target && !isTombstoned) return Object.freeze({ accepted: false, reason: "target-missing" });
        if (!validateAugmentImpactFormula(player, claim, target, { positionTolerance }).valid) {
            return Object.freeze({ accepted: false, reason: "invalid" });
        }
        const result = resolvePlayerEnemyImpact({
            targetId: claim.targetId,
            target,
            sourcePosition: claim.sourcePosition,
            damage: claim.damage,
            knockback: claim.knockback
                ? {
                      direction: claim.knockback.direction,
                      distance: claim.knockback.distance,
                      durationSeconds: claim.knockback.duration
                  }
                : null,
            tombstones: this.enemyImpactTombstones
        });
        if (result.knockbackApplied && target?.knockbackState) {
            target.knockbackState.sourcePlayerId = authenticatedPlayerId;
            target.knockbackState.sourceEffectId = claim.effectId;
            target.knockbackState.wallImpactEligible =
                claim.effectId === "push-away" && player.foundation.has("wall-impact");
            target.knockbackState.wallImpactTriggered = false;
        }
        if (!result.accepted || !result.emitEffects) return result;
        if (result.resolution === "enemy-defeated") this.metrics.enemyDefeats += 1;
        if (replicate)
            this.recordReplicationEvent("resolve", {
                objectId: claim.predictionId,
                resolution: result.resolution,
                position: claim.contactPosition,
                parameters: Object.freeze({
                    sourceKind: "augment-impact",
                    eventId: claim.eventId,
                    predictionId: claim.predictionId,
                    effectId: claim.effectId,
                    effectSourceKind: claim.sourceKind,
                    sourcePlayerId: authenticatedPlayerId,
                    targetId: claim.targetId,
                    sourcePosition: claim.sourcePosition,
                    contactPosition: claim.contactPosition,
                    damage: result.damage,
                    knockbackApplied: result.knockbackApplied
                })
            });
        this.eventFlash = {
            type: `augment-${claim.effectId}`,
            age: 0,
            position: new Vector2(claim.contactPosition.x, claim.contactPosition.y),
            sourcePosition: claim.sourcePosition,
            damage: result.damage,
            sourcePlayerId: authenticatedPlayerId,
            targetId: claim.targetId
        };
        this.#removeDefeatedEnemies();
        return result;
    }

    #commitAugmentImpactEvents(events, { replicate = true } = {}) {
        const results = [];
        for (const event of events) {
            results.push(
                this.resolveAugmentImpactClaim(
                    event.sourcePlayerId,
                    {
                        ...event,
                        knockback: event.knockback
                            ? {
                                  direction: event.knockback.direction,
                                  distance: event.knockback.distance,
                                  duration: event.knockback.duration ?? event.knockback.durationSeconds
                              }
                            : undefined
                    },
                    { positionTolerance: 0, replicate }
                )
            );
        }
        return Object.freeze(results);
    }

    commitAugmentPresentationEvents(events, { replicate = true } = {}) {
        for (const event of events) {
            const payload = Object.freeze({
                ...event,
                playerId: event.playerId ?? event.ownerId ?? this.#primaryPlayerId
            });
            if (replicate) this.recordReplicationEvent(event.eventType, payload);
            this.eventFlash = { type: event.eventType, age: 0, ...payload };
        }
        return events.length;
    }

    commitFoundationEvents(events, { replicate = true } = {}) {
        for (const event of events) {
            const { eventType, ...payload } = event;
            if (replicate) this.recordReplicationEvent(eventType, payload);
            this.eventFlash = { type: eventType, age: 0, ...payload };
        }
        return events.length;
    }

    #prepareOwnerStep(player, dt) {
        player.ropeDisabledRemaining = Math.max(0, player.ropeDisabledRemaining - dt);
        player.hitInvulnerabilityRemaining = Math.max(0, player.hitInvulnerabilityRemaining - dt);
        player.foundation.advance(dt);
    }

    #applyWorldForce(player, dt) {
        if (player.lifeState !== "active" || !this.world.windZones?.length) return;
        const force = sampleWorldForce(this.world.windZones, player.physics.position, this.elapsedSeconds, {
            occluders: this.windOccluders
        });
        const groundedFactor = player.physics.isGrounded ? WIND_CONFIG.groundedFactor : 1;
        player.physics.velocity.x += force.x * groundedFactor * dt;
        player.physics.velocity.y += force.y * groundedFactor * dt;
    }

    #accessScanPredicate() {
        if (!this.world.scannerGroups?.length) return null;
        const stateMap = accessScanStateMap(this.world.scannerGroups, this.elapsedSeconds);
        return (surface) => isSurfaceAccessAllowed(surface, stateMap);
    }

    #advanceAuthoredWorldProgress(commandsByPlayerId, { replicate = true, dt = 0, resolveInteractChoice = true } = {}) {
        const events = this.isSeamlessSectorWorld
            ? advanceSectorProgress({
                  world: this.world,
                  progress: this.worldProgress,
                  players: this.players,
                  commandsByPlayerId,
                  dt,
                  resolveInteractChoice
              })
            : advanceWorldProgress({
                  world: this.world,
                  progress: this.worldProgress,
                  players: this.players,
                  commandsByPlayerId,
                  dt,
                  resolveInteractChoice
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
            if (type === "gate-unlocked" || type === "route-unlocked") {
                this.activeCollisionSurfaces = collisionSurfacesForProgress(this.world, this.worldProgress);
            }
            if (type === "gate-crossed" && event.nextAreaId) {
                this.metrics.recordAreaClear(event.areaId);
                const checkpoint = this.world.checkpoints.find(({ areaId }) => areaId === event.nextAreaId);
                if (checkpoint && checkpoint.level > (this.activeCheckpoint?.level ?? -1)) {
                    this.#activateCheckpoint(checkpoint, event.playerId);
                }
            }
            if (type === "landmark-entered") this.metrics.recordProgressClear(event.previousLandmarkId);
        }
        if (this.isSeamlessSectorWorld) {
            this.activeCollisionSurfaces = collisionSurfacesForSectorProgress(this.world, this.worldProgress);
            const sectorEvent = events.findLast(({ type }) => type === "sector-entered");
            if (sectorEvent) {
                this.activeRespawnAnchor =
                    this.world.respawnAnchors.find(({ id }) => id === sectorEvent.respawnAnchorId) ??
                    this.activeRespawnAnchor;
            }
            if (this.worldProgress.snapshot().contentBoundaryReached && !this.contentBoundaryAnnounced) {
                const payload = Object.freeze({
                    sectorId: this.worldProgress.currentSectorId,
                    landmarkId: this.worldProgress.currentLandmarkId,
                    playerId: events.at(-1)?.playerId ?? this.#primaryPlayerId
                });
                if (replicate) this.recordReplicationEvent("content-boundary-reached", payload);
                this.eventFlash = { type: "content-boundary-reached", age: 0, ...payload };
                this.contentBoundaryAnnounced = true;
            }
            return;
        }
        this.#transferPlayersThroughOpenPortals({ replicate });
        if (this.worldProgress.snapshot().completed) this.beginCompletion(events.at(-1)?.playerId);
    }

    beginFoundationReward(playerId, sourceId, objectiveId = null) {
        const player = this.#findPlayer(playerId);
        const source = this.world.objects?.find(({ id }) => id === sourceId);
        if (
            !player ||
            player.foundation.selectedAugmentIds.length >= 6 ||
            player.foundation.consumedSourceIds.includes(sourceId) ||
            this.foundationRewards.has(playerId) ||
            source?.kind !== "augment-node" ||
            player.physics.position.distanceTo(source.position) > source.interactionRadius + 40
        ) {
            return false;
        }
        this.foundationRewards.set(
            playerId,
            createDeterministicFoundationRewardSelection({
                sourceId,
                objectiveId: objectiveId ?? source.objectiveId,
                runSeed: this.world.seed,
                stablePlayerId: playerId,
                selectionIndex: player.foundation.selectedAugmentIds.length,
                selectedAugmentIds: player.foundation.selectedAugmentIds
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
                const transitioned = this.portalTransitions.get(player.id);
                if (transitioned?.gateId === gate.id) continue;
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
        if (!foundation) {
            return Object.freeze({ accepted: false, reason: "foundation-unavailable" });
        }
        if (player.foundation.selectedAugmentIds.includes(foundation.id)) {
            return player.foundation.consumedSourceIds.includes(sourceId)
                ? Object.freeze({ accepted: true, sourceId, foundationId: foundation.id, changed: false })
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
        if (player.foundation.selectedAugmentIds.length >= 6) {
            return Object.freeze({ accepted: false, reason: "selection-exhausted" });
        }
        const expectedReward =
            reward ??
            createDeterministicFoundationRewardSelection({
                sourceId,
                objectiveId: source.objectiveId,
                runSeed: this.world.seed,
                stablePlayerId: playerId,
                selectionIndex: player.foundation.selectedAugmentIds.length,
                selectedAugmentIds: player.foundation.selectedAugmentIds
            });
        if (!expectedReward.choices.some(({ id }) => id === foundation.id)) {
            return Object.freeze({ accepted: false, reason: "foundation-unavailable" });
        }
        if (!player.foundation.select(foundation.id, { sourceId })) {
            return Object.freeze({ accepted: false, reason: "selection-conflict" });
        }
        player.augmentCombat.syncLoadout(player.foundation, player.maxHealth);
        this.foundationRewards.delete(playerId);
        if (player.foundation.selectedAugmentIds.length === 1) this.metrics.recordFirstFoundation();

        const objectiveId = reward?.objectiveId ?? source.objectiveId;
        const selectionPayload = Object.freeze({
            playerId,
            sourceId,
            objectiveId,
            foundationId: foundation.id,
            foundation,
            selectedAugmentIds: Object.freeze([...player.foundation.selectedAugmentIds]),
            position: vectorState(player.physics.position)
        });
        if (replicate) this.recordReplicationEvent("foundation-selected", selectionPayload);
        this.eventFlash = { type: "foundation-selected", age: 0, ...selectionPayload };

        if (this.worldProgress && !this.worldProgress.isObjectiveComplete(objectiveId)) {
            if (this.isSeamlessSectorWorld) {
                const beforeRoutes = new Set(this.worldProgress.snapshot().unlockedRouteIds);
                const completion = this.worldProgress.completeObjective(objectiveId);
                if (completion.changed) {
                    const objectivePayload = {
                        objectiveId,
                        landmarkId: source.landmarkId ?? this.worldProgress.currentLandmarkId,
                        playerId,
                        position: vectorState(player.physics.position)
                    };
                    if (replicate) this.recordReplicationEvent("objective-completed", objectivePayload);
                    for (const routeId of this.worldProgress.snapshot().unlockedRouteIds) {
                        if (beforeRoutes.has(routeId)) continue;
                        if (replicate) {
                            this.recordReplicationEvent("route-unlocked", {
                                routeId,
                                landmarkId: objectivePayload.landmarkId,
                                playerId,
                                position: objectivePayload.position
                            });
                        }
                    }
                    this.activeCollisionSurfaces = collisionSurfacesForSectorProgress(this.world, this.worldProgress);
                }
            } else {
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
        }
        return Object.freeze({ accepted: true, sourceId, foundationId: foundation.id, changed: true });
    }

    clearFoundationSelection(playerId, sourceId = null, foundationId = null) {
        const player = this.#requirePlayer(playerId);
        if (foundationId) player.foundation.deselect(foundationId, { sourceId });
        player.augmentCombat.syncLoadout(player.foundation, player.maxHealth);
        if (sourceId) {
            const source = this.world.objects?.find(({ id }) => id === sourceId);
            if (source) this.beginFoundationReward(playerId, sourceId, source.objectiveId);
        }
        return this.playerState(playerId);
    }

    createEnemies() {
        return this.world.enemySpawns.map((spawn) => {
            const definition = spawn.enemySelection
                ? {
                      ...spawn,
                      ...resolveEnemyEncounter(spawn, {
                          runSeed: this.world.seed,
                          worldRevision: this.world.definitionRevision ?? WORLD_GENERATION_REVISION
                      })
                  }
                : spawn;
            const position = definition.position ?? definition;
            return createEnemyRuntime({
                id: this.registry.createId("enemy"),
                position: new Vector2(position.x, position.y),
                level: definition.level,
                areaId: definition.areaId ?? null,
                objectId: definition.objectId ?? definition.encounterId ?? definition.slotId,
                enemyType: definition.enemyType,
                activation: definition.activation,
                patrol: definition.patrol,
                swarmGroupId: definition.swarmGroupId ?? definition.slotId,
                rules: definition.rules,
                radius: COMBAT_CONFIG.enemyRadius,
                health: COMBAT_CONFIG.enemyHealth,
                maxHealth: COMBAT_CONFIG.enemyHealth,
                fireCooldown: COMBAT_CONFIG.enemyFireInterval
            });
        });
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

    resolvePlayerProjectileSpawnClaim(authenticatedPlayerId, claim) {
        const player = this.players.find(({ id }) => id === authenticatedPlayerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        if (!player.weapon.isEnabled) {
            return Object.freeze({ accepted: false, reason: "weapon-disabled" });
        }
        if (claim.predictionId !== `${authenticatedPlayerId}:${claim.clientTick}`) {
            return Object.freeze({ accepted: false, reason: "prediction-ownership" });
        }
        if (!Number.isFinite(claim.position?.x) || !Number.isFinite(claim.position?.y)) {
            return Object.freeze({ accepted: false, reason: "position-invalid" });
        }
        const fireIntervalTicks = Math.round(COMBAT_CONFIG.fireInterval * 120);
        const minimumSpacingTicks = fireIntervalTicks - 2;
        const lastSpawnTick = this.lastAcceptedPlayerProjectileSpawnTick.get(authenticatedPlayerId);
        if (lastSpawnTick !== undefined && claim.clientTick - lastSpawnTick < minimumSpacingTicks) {
            return Object.freeze({ accepted: false, reason: "fire-interval" });
        }
        const projectile = new HomingProjectileObject({
            id: this.registry.createId("projectile"),
            ownerId: authenticatedPlayerId,
            targetId: claim.targetId,
            position: new Vector2(claim.position.x, claim.position.y),
            velocity: new Vector2(),
            speed: COMBAT_CONFIG.projectileSpeed,
            damage: COMBAT_CONFIG.weaponDamage,
            radius: COMBAT_CONFIG.projectileRadius,
            predictionId: claim.predictionId
        });
        this.projectiles.push(projectile);
        this.recordProjectileSpawn(projectile);
        this.lastAcceptedPlayerProjectileSpawnTick.set(authenticatedPlayerId, claim.clientTick);
        player.weapon.cooldown = COMBAT_CONFIG.fireInterval;
        return Object.freeze({ accepted: true, projectileId: projectile.id });
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
        this.#removeDefeatedEnemies();
        return Object.freeze({ accepted: true, resolution, damage: projectile.damage });
    }

    #removeDefeatedEnemies() {
        for (const enemy of this.enemies) {
            if (enemy.health > 0 || this.enemyImpactTombstones.has(enemy.id)) continue;
            recordEnemyImpactTombstone(this.enemyImpactTombstones, {
                targetId: enemy.id,
                defeatedAtTick: this.tick
            });
        }
        if (this.isSeamlessSectorWorld) {
            for (const enemy of this.enemies) {
                if (enemy.health <= 0 && enemy.objectId) this.worldProgress.resolveEncounter(enemy.objectId);
            }
        }
        this.enemies = this.enemies.filter(({ health }) => health > 0);
    }

    resolveEnemyProjectileClaim(authenticatedPlayerId, claim) {
        return this.resolvePlayerImpactClaim(authenticatedPlayerId, claim);
    }

    resolveEnemyProjectileRecovery(authenticatedPlayerId, claim) {
        return this.resolvePlayerImpactRecovery(authenticatedPlayerId, claim);
    }

    resolvePlayerImpactClaim(authenticatedPlayerId, claim) {
        return this.#resolvePlayerImpactClaim(authenticatedPlayerId, claim, { allowRecoveryState: false });
    }

    resolvePlayerImpactRecovery(authenticatedPlayerId, claim) {
        return this.#resolvePlayerImpactClaim(authenticatedPlayerId, claim, { allowRecoveryState: true });
    }

    #resolvePlayerImpactClaim(authenticatedPlayerId, claim, { allowRecoveryState }) {
        const player = this.players.find(({ id }) => id === authenticatedPlayerId);
        if (!player) return Object.freeze({ accepted: false, reason: "player-missing" });
        const impactId = claim.impactId ?? claim.projectileId;
        const isFallDamage = claim.impactType === "fall-damage";
        const projectile = isFallDamage ? null : this.enemyProjectiles.find(({ id }) => id === impactId);
        if (projectile && claim.impactType === "rope-cut" && !projectile.canCutRope) {
            return Object.freeze({ accepted: false, reason: "rope-cut-disallowed" });
        }
        const fallDamage = isFallDamage
            ? fallDamageForImpactSpeed(Math.max(0, claim.velocity.y), player.maxHealth, FALL_DAMAGE_CONFIG)
            : null;
        if (isFallDamage && (fallDamage <= 0 || claim.damage !== fallDamage)) {
            return Object.freeze({ accepted: false, reason: "fall-damage-mismatch" });
        }
        if (claim.outcome) {
            const damage = isFallDamage ? fallDamage : (projectile?.damage ?? claim.damage);
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
        if (isFallDamage) return Object.freeze({ accepted: false, reason: "impact-outcome-required" });
        if (!projectile) return Object.freeze({ accepted: false, reason: "projectile-missing" });
        if (projectile.targetId !== authenticatedPlayerId) {
            return Object.freeze({ accepted: false, reason: "target-mismatch" });
        }
        if (claim.impactType === "rope-cut") {
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
            player.ropeObject.attachBufferRemaining = 0;
            player.ropeObject.launcher.clear();
            player.ropeDisabledRemaining = this.ropeDisabledSeconds;
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
            const protection = player.augmentCombat.absorbPlayerDamage({
                amount: projectile.damage,
                type: "combat-hp",
                sourceKind: "projectile",
                attackerId: projectile.ownerId
            });
            player.health = Math.max(0, player.health - protection.appliedDamage);
            const speed = projectile.velocity.length();
            if (speed > 0) {
                player.physics.addImpulse(
                    projectile.velocity.clone().scale(1 / speed),
                    COMBAT_CONFIG.playerHitKnockback
                );
            }
            player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
            for (const reflected of protection.events) {
                const attacker = this.enemies.find(({ id }) => id === reflected.attackerId);
                if (!attacker) continue;
                player.augmentCombat.queueDamageReflection({
                    player,
                    attacker,
                    damage: reflected.reflectedDamage,
                    tick: this.tick,
                    sourceKind: reflected.sourceKind
                });
            }
            this.#commitAugmentImpactEvents(player.augmentCombat.drainQueuedImpactEvents());
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
            this.respawnPlayerAtCheckpoint(player, "health", impactId);
        }
        return Object.freeze({ accepted: true, resolution: claim.impactType, damage: projectile.damage });
    }

    #applyVictimImpactTransition(player, claim, damage) {
        if (claim.impactType === "rope-cut") {
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
            player.ropeObject.attachBufferRemaining = 0;
            player.ropeObject.launcher.clear();
            player.ropeDisabledRemaining = this.ropeDisabledSeconds;
            return;
        }
        if (claim.impactType === "fall-damage") {
            player.health = Math.max(0, player.health - damage);
            if (claim.outcome.respawned) this.#resetPlayerAtCheckpoint(player);
            return;
        }
        const protection = player.augmentCombat.absorbPlayerDamage({
            amount: damage,
            type: "combat-hp",
            sourceKind: "projectile",
            attackerId: null
        });
        player.health = Math.max(0, player.health - protection.appliedDamage);
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
        const impactId = claim.impactId ?? claim.projectileId;
        if (claim.impactType === "fall-damage") {
            this.recordReplicationEvent("player-fall-damaged", {
                impactId,
                playerId: player.id,
                targetId: player.id,
                position: new Vector2(claim.position.x, claim.position.y),
                velocity: new Vector2(claim.velocity.x, claim.velocity.y),
                impactSpeed: Math.max(0, claim.velocity.y),
                damage,
                respawned: claim.outcome.respawned
            });
            this.metrics.recordPlayerImpact(claim.impactType, damage);
            if (claim.outcome.respawned) this.#recordPlayerRespawn(player, "fall-damage", impactId);
            return Object.freeze({ accepted: true, resolution: claim.impactType, damage });
        }
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
                projectileId: impactId,
                resolution: claim.impactType,
                position: new Vector2(claim.position.x, claim.position.y)
            },
            {
                damage: claim.impactType === "player-hit" ? damage : 0,
                targetId: player.id
            }
        );
        this.metrics.recordPlayerImpact(claim.impactType, damage);
        if (claim.outcome.respawned) this.#recordPlayerRespawn(player, "health", impactId);
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
        if (this.isSeamlessSectorWorld) {
            this.sectorRespawnedPlayerIdsThisTick.add(player.id);
            if (
                this.players.length > 0 &&
                this.players.every(({ id }) => this.sectorRespawnedPlayerIdsThisTick.has(id))
            ) {
                this.#resetCurrentSectorAfterPartyWipe(causeId);
            }
        }
        return true;
    }

    #resetPlayerAtCheckpoint(player) {
        const respawnPosition = (this.isSeamlessSectorWorld
            ? this.activeRespawnAnchor?.position
            : this.activeCheckpoint) ?? {
            x: 120,
            y: 500
        };
        player.physics.reset(respawnPosition);
        player.ropeObject.rope.detach();
        player.ropeObject.attachmentCandidate = null;
        player.ropeObject.wasPointerDown = false;
        player.ropeObject.lastPointer = Object.freeze({ x: 0, y: 0, down: false });
        player.ropeObject.attachBufferRemaining = 0;
        player.ropeObject.swingDrag = null;
        player.ropeObject.launcher.clear();
        player.ropeImpactAttack.reset();
        player.health = player.maxHealth;
        player.weapon.cooldown = 0;
        player.hitInvulnerabilityRemaining = 0;
        player.ropeDisabledRemaining = 0;
        player.lifeState = "active";
        player.foundation.resetRuntime();
        player.augmentCombat.resetForRespawn(player.foundation, player.maxHealth);
    }

    #recordPlayerRespawn(player, reason, causeId) {
        this.metrics.recordDefeat();
        this.eventFlash = {
            type: this.isSeamlessSectorWorld ? "sector-respawn" : "checkpoint-respawn",
            age: 0,
            playerId: player.id,
            reason,
            causeId,
            position: player.physics.position.clone()
        };
        this.recordReplicationEvent("player-respawned", {
            playerId: player.id,
            reason,
            causeId,
            health: player.health,
            position: { x: player.physics.position.x, y: player.physics.position.y }
        });
        this.resets += 1;
    }

    #resetCurrentSectorAfterPartyWipe(causeId) {
        const reset = this.worldProgress.resetCurrentSector();
        this.activeRespawnAnchor =
            this.world.respawnAnchors.find(({ id }) => id === reset.respawnAnchorId) ?? this.activeRespawnAnchor;
        const currentEncounterIds = new Set(
            this.world.enemySpawns
                .filter(({ sectorId }) => sectorId === reset.sectorId)
                .map(({ encounterId }) => encounterId)
        );
        const preservedEnemies = this.enemies.filter(({ objectId }) => !currentEncounterIds.has(objectId));
        const resetEnemies = this.createEnemies().filter(({ objectId }) => currentEncounterIds.has(objectId));
        this.enemies = [...preservedEnemies, ...resetEnemies];
        this.activeCollisionSurfaces = collisionSurfacesForSectorProgress(this.world, this.worldProgress);
        this.contentBoundaryAnnounced = false;
        for (const player of this.players) this.#resetPlayerAtCheckpoint(player);
        const payload = Object.freeze({
            sectorId: reset.sectorId,
            baselineRevision: reset.baselineRevision,
            respawnAnchorId: reset.respawnAnchorId,
            causeId
        });
        this.recordReplicationEvent("sector-reset", payload);
        this.eventFlash = { type: "sector-reset", age: 0, ...payload };
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
            augmentProjectiles: player.augmentCombat.snapshot().actionProjectiles,
            playerHealth: player.health,
            playerMaxHealth: player.maxHealth,
            ropeDisabledRemaining: player.ropeDisabledRemaining,
            playerLifeState: player.lifeState,
            runState: this.runState,
            activeCheckpoint: this.activeCheckpoint,
            activeRespawnAnchor: this.activeRespawnAnchor,
            foundationAugment: player.foundation.selectedId,
            selectedAugmentIds: player.foundation.selectedIds,
            ropeConfig: this.ropeConfig,
            augmentRuntimeState: Object.freeze({
                ...player.foundation.snapshot(),
                combat: player.augmentCombat.snapshot()
            }),
            actionState: player.augmentCombat.actionState?.snapshot() ?? null,
            ropeShot: player.ropeObject.launcher.snapshot(),
            foundationReward: this.foundationRewards.get(player.id) ?? null,
            foundationRewards: Object.fromEntries(this.foundationRewards),
            metrics: this.metrics.snapshot(),
            worldProgress: this.worldProgress?.snapshot() ?? null,
            partyWipeBaseline: this.isSeamlessSectorWorld ? this.worldProgress.baselineSnapshot() : null,
            windStates: this.world.windZones
                ? snapshotWindStates(this.world.windZones, this.elapsedSeconds)
                : Object.freeze([]),
            accessScanStates: this.world.scannerGroups
                ? snapshotAccessScanStates(this.world.scannerGroups, this.elapsedSeconds)
                : Object.freeze([]),
            resets: this.resets,
            maxAttachDistance: hookReach(player.foundation.effectiveRopeConfig(this.ropeConfig))
        };
    }
}
