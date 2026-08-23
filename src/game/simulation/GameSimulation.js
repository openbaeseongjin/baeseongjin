import { Vector2 } from "../../game-kit/index.js";
import { FOUNDATION_AUGMENT_CATALOG, foundationAugmentById } from "../augments/FoundationAugmentCatalog.js";
import { augmentImpactFormula, validateAugmentImpactFormula } from "../augments/AugmentImpactFormula.js";
import {
    ACTION_EVENT_TYPE,
    ACTION_KEY,
    ACTION_MODIFIER_ID,
    ACTION_PREDICTED_RESOLUTION,
    ACTION_SIGNATURE_ID,
    ACTION_SOURCE_KIND,
    ACTION_STATE_CONFIG,
    BASE_ACTION_ID
} from "../augments/actions/ActionAugmentDefinition.js";
import { BOSS_STAGE_CATALOG } from "../boss-authoring/BossStageCatalog.js";
import { createBossEncounterRuntime } from "../boss/BossEncounterRuntimeFactory.js";
import { BOSS_ANCHOR_ROLE } from "../boss-authoring/BossStageSpec.js";
import { defineBossStage } from "../boss/BossStageDefinition.js";
import {
    advanceEnemyProjectiles,
    updateAutomaticWeapon,
    updateEnemyPresentationAim,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../combat/CombatSystems.js";
import {
    createEnemyArchetype,
    enemyDisplayName,
    enemyInitialHealth,
    enemyInitialRadius,
    enemySpawnMembers,
    isEnemyArchetype,
    isKnownEnemyType
} from "../combat/EnemyArchetypeCatalog.js";
import { advanceEnemyBehaviors } from "../combat/EnemyBehaviors.js";
import {
    ENEMY_BEHAVIOR_EVENT_TYPE,
    ENEMY_BEHAVIOR_REPLICATION_EVENT_TYPE
} from "../combat/enemy-behavior/EnemyBehaviorDefinition.js";
import { createEnemyObject } from "../combat/EnemyObject.js";
import { recordEnemyImpactTombstone } from "../combat/EnemyImpactTombstones.js";
import { resolvePlayerEnemyImpact } from "../combat/PlayerEnemyImpactResolver.js";
import { fallDamageForImpactSpeed } from "../combat/FallDamage.js";
import { ROPE_IMPACT_EVENT_TYPE, ropeImpactDamageForSpeed } from "../combat/RopeImpactAttack.js";
import { IMPACT_TARGET_KIND, ImpactTarget } from "../combat/ImpactTarget.js";
import { HomingProjectileObject } from "../combat/ProjectileObject.js";
import {
    COMBAT_CONFIG,
    COLLISION_BROAD_PHASE_CONFIG,
    FALL_DAMAGE_CONFIG,
    PLAYER_CONFIG,
    ROPE_CONFIG,
    AUGMENT_IMPACT_CONFIG,
    ROPE_IMPACT_CONFIG,
    WIND_CONFIG,
    WORLD_CONFIG,
    resolveEffectiveRopeConfig,
    resolveEffectiveRopeDisabledSeconds
} from "../config.js";
import { InputDispatcher } from "../input/InputDispatcher.js";
import { DebugEnemyTrainingDummy } from "../debug/DebugEnemyTrainingDummy.js";
import { GameObjectManager } from "../objects/managers/GameObjectManager.js";
import { findRopeAttachment, launchHandPosition } from "../input/RopePointerInput.js";
import { RunMetrics } from "../metrics/RunMetrics.js";
import {
    createPlayerImpactStateDigest,
    PLAYER_IMPACT_SOURCE_KIND,
    PLAYER_IMPACT_TYPE
} from "../network/PlayerImpactClaim.js";
import { createPredictableResolveEvent, createPredictableSpawnEvent } from "../network/PredictableObjectEvent.js";
import {
    ROPE_ANCHOR_RELEASE_REASON,
    ROPE_ATTACHMENT_ID,
    ROPE_AUTHORITY_EVENT_TYPE
} from "../network/RopeAuthorityEvent.js";
import { resolvePlayerCollisions } from "../physics/PlayerCollision.js";
import { PHYSICS_ACTOR_KIND } from "../physics/PlayerPhysicsDefinition.js";
import { rotateVector } from "../physics/AngularMotion.js";
import { CollisionBroadPhase } from "../physics/spatial/CollisionBroadPhase.js";
import { createPlayerRuntime } from "../players/PlayerRuntimeFactory.js";
import { ELECTRIFIED_STATUS_ID } from "../status-effects/ElectrifiedStatusEffect.js";
import { releaseRopeFromBody, ropeAnchorState } from "../rope/RopeAttachment.js";
import { hookReach } from "../rope/RopeLauncher.js";
import { ROPE_AUGMENT_PERCENTAGES } from "../augments/rope/RopeAugmentTuning.js";
import {
    advanceFoundationRewardSelection,
    createDeterministicFoundationRewardSelection,
    createFoundationRewardSelection
} from "../rewards/FoundationRewardSelection.js";
import { closestPointOnSurface, generateWorld, WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";
import { segmentIntersectsSurface } from "../world/PolygonGeometry.js";
import { assembleAuthoredWorld } from "../world/AuthoredWorldAssembler.js";
import { resolveEnemyEncounter } from "../world/EnemyEncounterSelection.js";
import { advanceSectorProgress } from "../world/SectorProgressController.js";
import { SectorProgressState } from "../world/SectorProgressState.js";
import { playerOverlapsStageSavePoint } from "../world/StageSavePointGeometry.js";
import { collisionSurfacesForProgress, collisionSurfacesForSectorProgress } from "../world/WorldGateGeometry.js";
import {
    pointInsideBounds,
    sampleWorldForce,
    snapshotWindStates,
    windOccludingSurfaces
} from "../world/WorldForceField.js";
import { accessScanStateMap, isSurfaceAccessAllowed, snapshotAccessScanStates } from "../world/AccessScanField.js";
import { authoredRegionForPosition } from "../world/AuthoredLandmarkResolver.js";
import {
    HARDPOINT_JAMMER_AUTHORITY,
    HARDPOINT_JAMMER_IMPACT,
    HardpointJammerField
} from "../world/HardpointJammerField.js";
import { resolveHardpointJammerCandidateSurfaceIds } from "../world/HardpointJammerTargetSelector.js";
import { advanceWorldProgress, completeWorldProgressObjective } from "../world/WorldProgressController.js";
import { WorldProgressState } from "../world/WorldProgressState.js";

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

function eventFlashState(eventFlash) {
    const snapshot = { ...eventFlash };
    for (const key of ["position", "deathPosition", "sourcePosition", "contactPosition", "velocity"]) {
        if (eventFlash[key]) snapshot[key] = vectorState(eventFlash[key]);
    }
    return snapshot;
}

function finiteViewportBounds(bounds) {
    if (
        !bounds ||
        !Number.isFinite(bounds.minX) ||
        !Number.isFinite(bounds.minY) ||
        !Number.isFinite(bounds.maxX) ||
        !Number.isFinite(bounds.maxY) ||
        bounds.maxX <= bounds.minX ||
        bounds.maxY <= bounds.minY
    ) {
        return null;
    }
    return bounds;
}

function horizontalSurfaceSpan(surface) {
    const vertices = surface?.vertices ?? [];
    const fallbackTop = vertices.length > 0 ? Math.min(...vertices.map(({ y }) => y)) : surface?.bounds?.y;
    const topY = Number.isFinite(surface?.topY) ? surface.topY : fallbackTop;
    if (!Number.isFinite(topY)) return null;
    const topVertices = vertices.filter(({ y }) => Math.abs(y - topY) <= 0.01);
    const spanVertices = topVertices.length >= 2 ? topVertices : vertices;
    const xs =
        spanVertices.length > 0
            ? spanVertices.map(({ x }) => x)
            : [surface?.bounds?.x, surface?.bounds?.x + surface?.bounds?.width];
    if (xs.some((value) => !Number.isFinite(value))) return null;
    return Object.freeze({ minX: Math.min(...xs), maxX: Math.max(...xs), topY });
}

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

const ENEMY_BEHAVIOR_PLAYER_TARGETS = Object.freeze({
    [ENEMY_BEHAVIOR_EVENT_TYPE.ARTILLERY_STRIKE]: ({ players, result }) =>
        players.filter(
            (player) =>
                player.lifeState === "active" &&
                player.health > 0 &&
                player.physics.collider.overlapsCircle(player.physics.position, result.position, result.radius)
        ),
    [ENEMY_BEHAVIOR_EVENT_TYPE.SWARM_CONTACT]: ({ players, result }) =>
        players.filter((player) => player.id === result.targetId && player.lifeState === "active" && player.health > 0)
});

function createEnemyRuntime(properties) {
    if (isEnemyArchetype(properties.enemyType)) return createEnemyArchetype(properties);
    if (isKnownEnemyType(properties.enemyType)) {
        return createEnemyObject({ ...properties, displayName: enemyDisplayName(properties.enemyType) });
    }
    throw new Error(`unknown enemy type: ${properties.enemyType}`);
}

function resolveEnemySpawnDefinition(spawn, context) {
    if (!spawn.enemySelection) return spawn;
    const { areaId, ...encounter } = spawn;
    return { ...spawn, ...resolveEnemyEncounter(encounter, context), areaId: areaId ?? null };
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
const BOSS_WEAKPOINT_RADIUS = 90;
const BOSS_HAZARD_KIND = Object.freeze({
    "maintenance-arm-low": true,
    "maintenance-arm-high": true,
    "baton-1": true,
    "baton-2": true,
    "overhead-slam": true,
    "back-swing": true,
    "ground-thruster-dash": true,
    "diagonal-thruster-dash": true,
    "counter-bash": true,
    "security-beam-low": true,
    "security-beam-high": true,
    "landing-burst": true
});

function normalizedBossDefinitions({ bossDefinition, bossDefinitions }) {
    const definitions = bossDefinitions ?? (bossDefinition ? [bossDefinition] : Object.values(BOSS_STAGE_CATALOG));
    if (!Array.isArray(definitions) || definitions.length === 0) {
        throw new Error("GameSimulation requires at least one Boss definition");
    }
    return Object.freeze(definitions.map((definition) => defineBossStage(definition)));
}
const AUTHORED_STAGE_FALL_RECOVERY_MARGIN = 780;
const ACTOR_ROPE_ANCHOR_SURFACE_TOLERANCE = 0.75;
const ACTOR_ROPE_ANCHOR_MATCH_TOLERANCE = 0.01;
const BOSS_PARTICIPANT_STATUS = Object.freeze({
    ACTIVE: "active",
    SPECTATING: "spectating",
    DISCONNECTED: "disconnected"
});
const VICTIM_IMPACT_AUTHORITY = Object.freeze({ LOCAL: "local", CLAIM: "claim" });

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
        ropeDisabledSeconds = COMBAT_CONFIG.ropeDisabledSeconds,
        collisionBroadPhaseConfig = COLLISION_BROAD_PHASE_CONFIG,
        debugAugmentIds = [],
        bossDefinition = null,
        bossDefinitions = null,
        victimImpactAuthority = VICTIM_IMPACT_AUTHORITY.LOCAL,
        hardpointJammerAuthority = HARDPOINT_JAMMER_AUTHORITY.AUTHORITATIVE
    } = {}) {
        if (!Array.isArray(debugAugmentIds)) throw new Error("debugAugmentIds must be an array");
        if (!Object.values(VICTIM_IMPACT_AUTHORITY).includes(victimImpactAuthority)) {
            throw new Error("victimImpactAuthority must be local or claim");
        }
        if (!Object.values(HARDPOINT_JAMMER_AUTHORITY).includes(hardpointJammerAuthority)) {
            throw new Error("Hardpoint Jammer authority is invalid");
        }
        this.victimImpactAuthority = victimImpactAuthority;
        this.hardpointJammerAuthority = hardpointJammerAuthority;
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
        this.landmarkById = Object.freeze(
            Object.fromEntries((this.world.landmarks ?? []).map((landmark) => [landmark.id, landmark]))
        );
        this.bossStageIdByEntryRouteId = Object.freeze(
            Object.fromEntries(
                (this.world.bossStages ?? [])
                    .filter(({ entryRouteId }) => typeof entryRouteId === "string")
                    .map(({ id, entryRouteId }) => [entryRouteId, id])
            )
        );
        this.bossDefinitions = this.isSeamlessSectorWorld
            ? normalizedBossDefinitions({ bossDefinition, bossDefinitions })
            : Object.freeze([]);
        this.bossHazardRecords = new Map();
        this.bossRuntime = this.isSeamlessSectorWorld ? createBossEncounterRuntime(this.bossDefinitions[0]) : null;
        this.worldProgress = this.isSeamlessSectorWorld
            ? new SectorProgressState(this.world)
            : worldCatalog
              ? new WorldProgressState(worldCatalog, null, { startAreaId })
              : null;
        this.activeStaticCollisionSurfaces = this.isSeamlessSectorWorld
            ? this.#bossFilteredCollisionSurfaces(collisionSurfacesForSectorProgress(this.world, this.worldProgress))
            : collisionSurfacesForProgress(this.world, this.worldProgress);
        this.activeDynamicCollisionSurfaces = this.#bossDynamicCollisionSurfaces();
        this.activeCollisionSurfaces = Object.freeze([
            ...this.activeStaticCollisionSurfaces,
            ...this.activeDynamicCollisionSurfaces
        ]);
        this.activeStaticProjectileOccluders = Object.freeze(
            this.activeStaticCollisionSurfaces.filter(({ projectileOccluder }) => projectileOccluder === true)
        );
        this.activeProjectileOccluders = Object.freeze([
            ...this.activeStaticProjectileOccluders,
            ...this.activeDynamicCollisionSurfaces.filter(({ projectileOccluder }) => projectileOccluder === true)
        ]);
        const collisionBroadPhase = new CollisionBroadPhase(collisionBroadPhaseConfig);
        collisionBroadPhase.setSurfaces(this.activeStaticCollisionSurfaces);
        collisionBroadPhase.setDynamicSurfaces(this.activeDynamicCollisionSurfaces);
        this.objects = new GameObjectManager({ world: this.world, collisionBroadPhase });
        this.#registerBossImpactTargets();
        this.windOccluders = windOccludingSurfaces(this.world.surfaces);
        this.elapsedSeconds = 0;
        this.metrics = new RunMetrics({ progressKind: this.isSeamlessSectorWorld ? "sector" : "area" });
        this.#inputDispatcher = new InputDispatcher();
        this.portalTransitions = new Map();
        this.lastAcceptedPlayerProjectileSpawnTick = new Map();
        const startArea = this.world.areas?.find(({ id }) => id === startAreaId) ?? this.world.areas?.[0];
        const startLandmark = this.isSeamlessSectorWorld
            ? (this.world.landmarks.find(
                  ({ id, areaId, stageId }) =>
                      id === (startLandmarkId ?? startAreaId) ||
                      areaId === (startLandmarkId ?? startAreaId) ||
                      stageId === (startLandmarkId ?? startAreaId)
              ) ?? this.world.landmarks[0])
            : null;
        if (this.isSeamlessSectorWorld && startLandmark.order > 1) {
            this.advanceSectorProgressToLandmark(startLandmark.id);
        }
        const playerRuntime = this.addPlayer(
            startLandmark?.entry ?? startArea?.entry,
            playerId,
            startLandmark?.respawnAnchorId ?? null
        );
        this.#primaryPlayerId = playerRuntime.entity.id;
        this.debugAugmentPlayerId = debugAugmentIds.length > 0 ? playerRuntime.entity.id : null;
        if (this.debugAugmentPlayerId) {
            playerRuntime.foundation.restore(null, {
                selectedAugmentIds: debugAugmentIds,
                consumedSourceIds: []
            });
            playerRuntime.augmentCombat.syncLoadout(playerRuntime.foundation, playerRuntime.entity.maxHealth);
            playerRuntime.ropeObject.rope.config = playerRuntime.foundation.effectiveRopeConfig(this.ropeConfig);
        }
        this.enemyRuntimeCreations = 0;
        this.enemyRuntimeReconciliations = 0;
        this.debugTrainingDummy = new DebugEnemyTrainingDummy();
        this.objects.enemies.replace(this.createEnemies());
        this.hardpointJammers = new HardpointJammerField(this.world.jammerGroups ?? []);
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
        this.contentBoundaryAnnounced = false;
        this.foundationRewards = new Map();
        this.tick = 0;
        this.replicationEvents = [];
    }

    get registry() {
        return this.objects.identifiers;
    }

    get collisionBroadPhase() {
        return this.objects.spatial;
    }

    get impactTargetRegistry() {
        return this.objects.impactTargets;
    }

    get players() {
        return this.objects.players.all;
    }

    get enemies() {
        return this.objects.enemies.all;
    }

    get activeSimulationEnemies() {
        return this.objects.enemies.active;
    }

    get enemyImpactTombstones() {
        return this.objects.enemies.tombstones;
    }

    get projectiles() {
        return this.objects.playerProjectiles.all;
    }

    get enemyProjectiles() {
        return this.objects.enemyProjectiles.all;
    }

    addPlayer(spawn, playerId = null, respawnAnchorId = null) {
        const primaryRegion = authoredRegionForPosition(
            this.world,
            this.#findPlayer(this.#primaryPlayerId)?.physics.position
        );
        const joinSector =
            this.world.sectors?.find(({ id }) => id === primaryRegion?.sectorId) ?? this.world.sectors?.[0];
        const initialRespawnAnchorId = this.isSeamlessSectorWorld
            ? (respawnAnchorId ?? joinSector?.respawnAnchorId ?? this.world.respawnAnchors[0]?.id)
            : null;
        if (initialRespawnAnchorId && !this.world.respawnAnchors.some(({ id }) => id === initialRespawnAnchorId)) {
            throw new Error(`unknown player respawn anchor: ${initialRespawnAnchorId}`);
        }
        const runtime = createPlayerRuntime({
            registry: this.registry,
            playerConfig: PLAYER_CONFIG,
            ropeConfig: this.ropeConfig,
            combatConfig: COMBAT_CONFIG,
            spawn,
            playerId,
            respawnAnchorId: initialRespawnAnchorId
        });
        runtime.entity.augmentCombat.syncLoadout(runtime.entity.foundation, runtime.entity.maxHealth);
        this.objects.addPlayerRuntime(runtime);
        this.collisionBroadPhase.invalidateFrame();
        return runtime;
    }

    removePlayer(playerId) {
        const removed = this.objects.removePlayer(playerId);
        if (!removed) return false;
        if (this.bossRuntime?.status === "active") this.bossRuntime.removeParticipant(playerId);
        this.portalTransitions.delete(playerId);
        this.foundationRewards.delete(playerId);
        if (removed.id === this.#primaryPlayerId) this.#primaryPlayerId = this.players[0]?.id ?? null;
        this.collisionBroadPhase.invalidateFrame();
        this.#advanceCalibrationVerification();
        this.#completeEligibleAugmentObjectivesForCurrentRoster();
        return true;
    }

    getPrimaryPlayerId() {
        return this.#primaryPlayerId;
    }

    hasPlayer(playerId) {
        return this.objects.players.find(playerId) !== null;
    }

    playerIds() {
        return this.objects.players.ids();
    }

    #commitBossEvents() {
        if (!this.bossRuntime) return Object.freeze([]);
        const events = this.bossRuntime.drainEvents();
        for (const event of events) {
            const { eventId: bossEventId, eventType, sequence: bossSequence, ...payload } = event;
            const bossBody = this.bossStageSnapshot()?.presentation?.objects.find(
                ({ physicsBody }) => physicsBody === true
            );
            this.recordReplicationEvent(eventType, {
                ...payload,
                bossEventId,
                bossSequence,
                ...(bossBody?.position ? { position: bossBody.position } : {})
            });
        }
        const latest = events.at(-1);
        if (latest) {
            const { eventType, ...payload } = latest;
            this.eventFlash = { type: eventType, age: 0, ...payload };
        }
        return events;
    }

    startBossEncounter(participantIds = this.playerIds()) {
        if (!this.bossRuntime) {
            return Object.freeze({ accepted: false, changed: false, reason: "boss-runtime-unavailable" });
        }
        const outcome = this.bossRuntime.start({ participantIds });
        this.#commitBossEvents();
        return outcome;
    }

    interactBossBreaker(playerId, breakerId) {
        if (!this.bossRuntime) {
            return Object.freeze({ accepted: false, changed: false, reason: "boss-runtime-unavailable" });
        }
        const outcome = this.bossRuntime.interactBreaker({ playerId, breakerId });
        this.#commitBossEvents();
        return outcome;
    }

    applyBossDamage(sourcePlayerId, damage) {
        if (!this.bossRuntime) {
            return Object.freeze({
                accepted: false,
                changed: false,
                reason: "boss-runtime-unavailable",
                appliedDamage: 0
            });
        }
        const outcome = this.bossRuntime.applyDamage({ sourcePlayerId, damage });
        this.#commitBossEvents();
        if (outcome.completed) this.#completeBossStage(this.bossRuntime.definition.id);
        return outcome;
    }

    applyBossImpact({ impactId, sourcePlayerId = null, baseDamage, targetId = null, impactPosition = null }) {
        if (!this.bossRuntime) {
            return Object.freeze({
                accepted: false,
                changed: false,
                reason: "boss-runtime-unavailable",
                appliedDamage: 0
            });
        }
        if (sourcePlayerId && this.bossRuntime.recoveryProtected?.(sourcePlayerId) === true) {
            return Object.freeze({
                accepted: true,
                changed: false,
                reason: "boss-recovery-protected",
                appliedDamage: 0
            });
        }
        const outcome = this.bossRuntime.applyImpact({
            impactId,
            sourcePlayerId,
            baseDamage,
            targetId,
            impactPosition
        });
        this.#commitBossEvents();
        if (outcome.completed) this.#completeBossStage(this.bossRuntime.definition.id);
        return outcome;
    }

    handleBossParticipantDefeat(playerId, cause) {
        if (!this.bossRuntime) {
            return Object.freeze({
                accepted: false,
                changed: false,
                reason: "boss-runtime-unavailable",
                retryStarted: false
            });
        }
        const outcome = this.bossRuntime.handlePlayerDefeat(playerId, cause);
        this.#commitBossEvents();
        return outcome;
    }

    restoreBossRuntime(snapshot) {
        if (!this.bossRuntime) {
            if (snapshot) throw new Error("cannot restore Boss runtime outside a seamless Sector world");
            return null;
        }
        if (snapshot) {
            const stageId = snapshot.stageId ?? snapshot.encounterId;
            this.#selectBossRuntime(stageId);
            this.bossRuntime.restore(snapshot);
            if (snapshot.status === "completed") this.worldProgress?.completeBossStage(this.bossRuntime.definition.id);
        }
        this.collisionBroadPhase.invalidateFrame();
        this.#setActiveCollisionSurfaces(
            this.#bossFilteredCollisionSurfaces(collisionSurfacesForSectorProgress(this.world, this.worldProgress))
        );
        return this.bossRuntime.snapshot();
    }

    bossStageSnapshot() {
        if (!this.bossRuntime) return null;
        const runtime = this.bossRuntime.snapshot();
        const stage = this.#bossStageWorld();
        if (!stage) return runtime;
        const worldOffset = this.#bossWorldOffset();
        const ropeAttachmentActors = Object.freeze(
            this.#ropeAttachmentActors().map(({ id, position, angle, angularVelocity, velocity }) =>
                Object.freeze({
                    id,
                    position,
                    angle,
                    angularVelocity,
                    velocity
                })
            )
        );
        const suppliedObjects = this.bossRuntime.presentationObjects?.(worldOffset, runtime);
        if (!Array.isArray(suppliedObjects)) {
            throw new Error(`Boss runtime must provide presentation objects: ${this.bossRuntime.definition.id}`);
        }
        const grappleAnchors = stage.route
            .filter(({ role }) => role === BOSS_ANCHOR_ROLE.SWING_ATTACK)
            .map((anchor) =>
                Object.freeze({
                    id: anchor.id,
                    kind: "boss-grapple-anchor",
                    position: anchor,
                    size: Object.freeze({ width: 32, height: 32 }),
                    surfaceId: anchor.surfaceId ?? null,
                    state: "available",
                    active: true
                })
            );
        return Object.freeze({
            ...runtime,
            environmentAreaId: stage.sourceAreaId,
            ropeAttachmentActors,
            arena: Object.freeze({
                id: stage.id,
                bounds: stage.bounds,
                entry: stage.entry,
                exit: stage.exit,
                recoveryPoints: stage.recoveryPoints
            }),
            presentation: Object.freeze({
                objects: Object.freeze([...suppliedObjects, ...grappleAnchors])
            })
        });
    }

    #registerBossImpactTargets() {
        for (const definition of this.bossDefinitions) {
            const bodyId = definition.arena.boss?.actorId ?? `${definition.id}:body`;
            const targetIds =
                definition.arena.boss?.impactTargetIds ??
                Object.freeze([bodyId, ...definition.phases.map(({ weakTargetId }) => weakTargetId)]);
            for (const targetId of targetIds) {
                this.impactTargetRegistry.add(
                    new ImpactTarget({
                        id: targetId,
                        kind: IMPACT_TARGET_KIND.BOSS,
                        isActive: () => this.#bossImpactTargetActive(definition.id, targetId),
                        snapshot: () => this.#bossImpactSnapshot(definition.id, targetId),
                        applyImpact: (impact) => this.#applyRegisteredBossImpact(definition.id, targetId, impact)
                    })
                );
            }
        }
    }

    #bossImpactTargetActive(stageId, targetId) {
        if (this.bossRuntime?.definition.id !== stageId || !this.bossRuntime?.impactTargetSnapshot) return false;
        return this.bossRuntime.impactTargetSnapshot(targetId, this.#bossWorldOffset())?.active === true;
    }

    #bossImpactSnapshot(stageId, targetId) {
        const currentStage = this.bossRuntime?.definition.id === stageId;
        if (currentStage && this.bossRuntime?.impactTargetSnapshot) {
            return this.bossRuntime.impactTargetSnapshot(targetId, this.#bossWorldOffset());
        }
        return Object.freeze({
            id: targetId,
            impactTargetKind: IMPACT_TARGET_KIND.BOSS,
            active: false,
            position: new Vector2(0, 0),
            radius: 0,
            health: 0,
            maxHealth: 0
        });
    }

    #activeBossImpactSnapshots() {
        return Object.freeze(
            this.impactTargetRegistry
                .activeSnapshots()
                .filter(({ impactTargetKind }) => impactTargetKind === IMPACT_TARGET_KIND.BOSS)
        );
    }

    #preferredBossImpactSnapshots() {
        const active = this.#activeBossImpactSnapshots();
        const weakpoint = active.find(({ weakpointExposed }) => weakpointExposed);
        const body = active.filter(({ weakpointExposed }) => !weakpointExposed);
        return Object.freeze(weakpoint ? [weakpoint] : body);
    }

    #combatImpactTargets() {
        return Object.freeze([...this.activeSimulationEnemies, ...this.#preferredBossImpactSnapshots()]);
    }

    #applyRegisteredBossImpact(stageId, targetId, impact) {
        if (this.bossRuntime?.definition.id !== stageId) {
            return Object.freeze({
                accepted: false,
                changed: false,
                reason: "boss-stage-not-active",
                appliedDamage: 0,
                resolution: "boss-stage-not-active"
            });
        }
        const outcome = this.applyBossImpact({
            impactId: impact.causalId,
            sourcePlayerId: impact.sourcePlayerId,
            baseDamage: impact.normalDamage,
            targetId,
            impactPosition: impact.position
        });
        const resolution = outcome.completed
            ? "boss-defeated"
            : outcome.completedPhase
              ? "boss-phase-completed"
              : "boss-hit";
        const appliedDamage = outcome.appliedDamage ?? 0;
        const appliedNormalDamage = Math.min(outcome.normalDamage ?? impact.normalDamage, appliedDamage);
        return Object.freeze({
            ...outcome,
            resolution,
            damage: appliedDamage,
            normalDamage: appliedNormalDamage,
            weakpointDamage: Math.max(0, appliedDamage - appliedNormalDamage),
            weakpointHit: outcome.weakpointHit === true
        });
    }

    #bossStageWorld() {
        return this.world.bossStages?.find(({ id }) => id === this.bossRuntime?.definition.id) ?? null;
    }

    #bossParticipantStatus(playerId) {
        return this.bossRuntime?.participants?.get(playerId) ?? null;
    }

    #bossEntryPlayers(stage) {
        return this.players.filter(
            ({ lifeState, physics }) =>
                lifeState === "active" && pointInsideBounds(physics.position, stage.sourceTrigger)
        );
    }

    #activeBossParticipants() {
        return this.players.filter(
            ({ id, lifeState, health }) =>
                lifeState === "active" &&
                health > 0 &&
                this.#bossParticipantStatus(id) === BOSS_PARTICIPANT_STATUS.ACTIVE
        );
    }

    #completeBossStage(stageId) {
        const completion = this.worldProgress?.completeBossStage(stageId);
        if (!completion?.accepted || !completion.changed) return false;
        this.#setActiveCollisionSurfaces(
            this.#bossFilteredCollisionSurfaces(collisionSurfacesForSectorProgress(this.world, this.worldProgress))
        );
        this.#recoverBossSpectatorsOnVictory();
        return true;
    }

    #selectBossRuntime(stageId) {
        if (this.bossRuntime?.definition.id === stageId) return this.bossRuntime;
        const definition = this.bossDefinitions.find(({ id }) => id === stageId);
        if (!definition) throw new Error(`unknown Boss Stage definition: ${stageId}`);
        this.bossRuntime = createBossEncounterRuntime(definition);
        this.collisionBroadPhase.invalidateFrame();
        this.#setActiveDynamicCollisionSurfaces();
        return this.bossRuntime;
    }

    #pendingBossEntryStage() {
        const progress = this.worldProgress?.snapshot();
        return (
            this.world.bossStages?.find((stage) => {
                const sourceLandmark = this.landmarkById[stage.sourceLandmarkId];
                const entryReady = stage.entryRouteId
                    ? this.worldProgress?.isRouteUnlocked(stage.entryRouteId)
                    : !sourceLandmark?.contentBoundaryId ||
                      progress?.reachedContentBoundaryIds?.includes(sourceLandmark.contentBoundaryId);
                return (
                    !this.worldProgress?.isBossStageComplete(stage.id) &&
                    entryReady &&
                    this.#bossEntryPlayers(stage).length > 0
                );
            }) ?? null
        );
    }

    #bossWorldOffset() {
        const stage = this.#bossStageWorld();
        if (!stage) return Object.freeze({ x: 0, y: 0 });
        return Object.freeze({
            x: stage.presentationOrigin.x - stage.localBossPosition.x,
            y: stage.presentationOrigin.y - stage.localBossPosition.y
        });
    }

    #bossCollisionActors() {
        if (!this.bossRuntime || this.bossRuntime.status === "inactive") return Object.freeze([]);
        return this.bossRuntime.collisionActors?.(this.#bossWorldOffset()) ?? Object.freeze([]);
    }

    #ropeAttachmentActors() {
        const byOwnerId = Object.create(null);
        const add = (entry) => {
            if (entry?.ropeableSurface && entry?.id && entry?.position) {
                byOwnerId[entry.id] = Object.freeze({
                    id: entry.id,
                    position: Object.freeze({ ...entry.position }),
                    angle: entry.angle ?? 0,
                    angularVelocity: entry.angularVelocity ?? 0,
                    velocity: Object.freeze({ ...(entry.velocity ?? { x: 0, y: 0 }) }),
                    ropeableSurface: entry.ropeableSurface
                });
                return;
            }
            const attachment = entry?.ropeAttachment;
            if (!attachment?.ownerId || !attachment.position) return;
            byOwnerId[attachment.ownerId] = Object.freeze({
                id: attachment.ownerId,
                position: Object.freeze({ ...entry.position }),
                angle: entry.angle ?? 0,
                angularVelocity: entry.angularVelocity ?? 0,
                velocity: Object.freeze({ ...(entry.velocity ?? { x: 0, y: 0 }) }),
                ropeAttachment: Object.freeze({
                    ownerId: attachment.ownerId,
                    localAnchor: Object.freeze({ ...attachment.localAnchor })
                })
            });
        };
        for (const actor of this.#bossCollisionActors()) add(actor);
        for (const actor of this.bossRuntime?.ropeAttachmentActors?.(this.#bossWorldOffset()) ?? []) add(actor);
        return Object.freeze(Object.values(byOwnerId));
    }

    #ropeAttachmentActorById(ownerId) {
        return this.#ropeAttachmentActors().find(({ id }) => id === ownerId) ?? null;
    }

    #actorRopeAnchorClaim(player, ropeState) {
        const ownerId = ropeState.anchorOwnerId;
        const localAnchor = ropeState.anchorLocalOffset;
        const owner = this.#ropeAttachmentActorById(ownerId);
        if (!owner?.ropeableSurface || !localAnchor) {
            return Object.freeze({ accepted: false, reason: ROPE_ANCHOR_RELEASE_REASON.OWNER_UNAVAILABLE });
        }
        const canAttachToSurface = this.#accessScanPredicate();
        if (canAttachToSurface && canAttachToSurface(owner.ropeableSurface) === false) {
            return Object.freeze({ accepted: false, reason: ROPE_ANCHOR_RELEASE_REASON.SURFACE_DISABLED });
        }
        const anchor = ropeAnchorState(owner, localAnchor);
        const surfacePoint = closestPointOnSurface(anchor.position, owner.ropeableSurface);
        if (
            Math.hypot(surfacePoint.x - anchor.position.x, surfacePoint.y - anchor.position.y) >
            ACTOR_ROPE_ANCHOR_SURFACE_TOLERANCE
        ) {
            return Object.freeze({ accepted: false, reason: ROPE_ANCHOR_RELEASE_REASON.POINT_OFF_SURFACE });
        }
        const currentRope = player.ropeObject.rope;
        const continuingAttachment =
            currentRope.isAttached &&
            currentRope.attachmentId === ropeState.attachmentId &&
            currentRope.anchorOwnerId === ownerId &&
            Math.hypot(
                (currentRope.anchorLocalOffset?.x ?? 0) - localAnchor.x,
                (currentRope.anchorLocalOffset?.y ?? 0) - localAnchor.y
            ) <= ACTOR_ROPE_ANCHOR_MATCH_TOLERANCE;
        if (!continuingAttachment) {
            const ropeConfig = player.foundation.effectiveRopeConfig(this.ropeConfig);
            const hand = launchHandPosition(player, ropeConfig, anchor.position);
            if (Math.hypot(anchor.position.x - hand.x, anchor.position.y - hand.y) > hookReach(ropeConfig)) {
                return Object.freeze({ accepted: false, reason: ROPE_ANCHOR_RELEASE_REASON.POINT_OUT_OF_REACH });
            }
            const occluded = this.activeCollisionSurfaces.some(
                (surface) =>
                    (surface.kind === "inter-floor-divider" || surface.ropeOccluder === true) &&
                    segmentIntersectsSurface(hand, anchor.position, surface)
            );
            if (occluded) {
                return Object.freeze({ accepted: false, reason: ROPE_ANCHOR_RELEASE_REASON.POINT_OCCLUDED });
            }
        }
        return Object.freeze({ accepted: true, anchor, continuingAttachment });
    }

    #releaseInvalidOwnerRope(player, ropeState, reason) {
        const ownerId = ropeState.anchorOwnerId ?? null;
        const attachmentId = ropeState.attachmentId ?? null;
        const anchorLocalOffset = ropeState.anchorLocalOffset
            ? Object.freeze({ ...ropeState.anchorLocalOffset })
            : null;
        this.releasePlayerRope(player.id);
        this.recordReplicationEvent(ROPE_AUTHORITY_EVENT_TYPE.ANCHOR_RELEASED, {
            playerId: player.id,
            attachmentId,
            ownerId,
            anchorLocalOffset,
            reason
        });
        return Object.freeze({ accepted: true, ropeReleased: true, reason, ropeAttachmentId: attachmentId });
    }

    #syncAttachedActorRopes() {
        for (const player of this.players) {
            const rope = player.ropeObject.rope;
            if (!rope.isAttached || !rope.anchorOwnerId) continue;
            const ownerId = rope.anchorOwnerId;
            const owner = this.#ropeAttachmentActorById(ownerId);
            if (!owner) {
                const anchorLocalOffset = rope.anchorLocalOffset
                    ? Object.freeze({ x: rope.anchorLocalOffset.x, y: rope.anchorLocalOffset.y })
                    : null;
                const attachmentId = rope.attachmentId;
                this.releasePlayerRope(player.id);
                this.recordReplicationEvent(ROPE_AUTHORITY_EVENT_TYPE.ANCHOR_RELEASED, {
                    playerId: player.id,
                    attachmentId,
                    ownerId,
                    anchorLocalOffset,
                    reason: ROPE_ANCHOR_RELEASE_REASON.OWNER_UNAVAILABLE
                });
                continue;
            }
            const anchor = ropeAnchorState(owner, rope.anchorLocalOffset ?? { x: 0, y: 0 });
            rope.updateAnchor(anchor.position, anchor.velocity);
        }
    }

    #advanceBossRuntime(dt) {
        if (!this.bossRuntime) return Object.freeze({ accepted: false, changed: false });
        const stage = this.#bossStageWorld();
        const activeParticipants = this.#activeBossParticipants();
        const outcome = this.bossRuntime.advance(dt, {
            players: Object.freeze(
                activeParticipants.map(({ id, physics }) =>
                    Object.freeze({ id, position: vectorState(physics.position) })
                )
            ),
            surfaces: stage?.surfaces ?? Object.freeze([]),
            anchors: stage?.route ?? Object.freeze([]),
            worldOffset: this.#bossWorldOffset()
        });
        this.#setActiveDynamicCollisionSurfaces();
        this.#syncAttachedActorRopes();
        const ropeCutSurfaces = this.bossRuntime?.ropeCutSurfaces?.(this.#bossWorldOffset()) ?? Object.freeze([]);
        for (const player of activeParticipants) {
            const anchor = player.ropeObject.rope.anchor;
            if (
                !anchor ||
                !ropeCutSurfaces.some(
                    (surface) =>
                        surface.id !== player.ropeObject.rope.anchorOwnerId &&
                        segmentIntersectsSurface(player.physics.position, anchor, surface)
                )
            ) {
                continue;
            }
            releaseRopeFromBody(player.physics, player.ropeObject.rope);
            player.ropeImpactState.reset();
            player.ropeDisabledRemaining = Math.max(player.ropeDisabledRemaining, this.ropeDisabledSeconds);
            this.recordReplicationEvent("boss-rope-cut", {
                bossStageId: stage?.id ?? null,
                playerId: player.id,
                position: vectorState(player.physics.position)
            });
        }
        if (stage && this.bossRuntime?.recoverPlayer) {
            const recoveryBounds = {
                x: stage.bounds.x - PLAYER_CONFIG.radius,
                y: stage.bounds.y - PLAYER_CONFIG.radius,
                width: stage.bounds.width + PLAYER_CONFIG.radius * 2,
                height: stage.bounds.height + PLAYER_CONFIG.radius * 2
            };
            for (const player of activeParticipants) {
                if (pointInsideBounds(player.physics.position, recoveryBounds)) continue;
                const recoveryPosition = this.bossRuntime.recoverPlayer(
                    player.id,
                    this.#bossWorldOffset(),
                    vectorState(player.physics.position)
                );
                if (!recoveryPosition) continue;
                player.physics.reset(recoveryPosition);
                player.ropeObject.rope.detach();
                player.ropeObject.swingDrag = null;
                player.ropeImpactState.reset();
                player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
                this.recordReplicationEvent("boss-player-recovered", {
                    bossStageId: stage.id,
                    playerId: player.id,
                    position: recoveryPosition
                });
            }
        }
        this.#recordActiveBossHazard();
        return outcome;
    }

    #recordActiveBossHazard() {
        if (this.bossRuntime?.status !== "active") return;
        const stage = this.#bossStageWorld();
        const snapshot = this.bossRuntime.snapshot();
        const compositeHazards = this.bossRuntime.activeHazards?.(this.#bossWorldOffset()) ?? Object.freeze([]);
        if (!stage || compositeHazards.length === 0) return;
        for (const hazard of compositeHazards) {
            const key = `${stage.id}:attempt:${snapshot.attempt}:hazard:${hazard.id}`;
            this.bossHazardRecords.set(
                key,
                Object.freeze({
                    stageId: stage.id,
                    attempt: snapshot.attempt,
                    phase: snapshot.phase,
                    sequence: hazard.sequence,
                    hazardKind: hazard.kind,
                    damage: hazard.damage
                })
            );
        }
        while (this.bossHazardRecords.size > 64) {
            this.bossHazardRecords.delete(this.bossHazardRecords.keys().next().value);
        }
    }

    #playerCollisionActors() {
        return Object.freeze([...this.activeSimulationEnemies, ...this.#bossCollisionActors()]);
    }

    #bossFilteredCollisionSurfaces(surfaces) {
        if (!this.worldProgress) return surfaces;
        return Object.freeze(
            surfaces.filter(
                ({ blockedByBossStageId }) =>
                    !blockedByBossStageId || !this.worldProgress.isBossStageComplete(blockedByBossStageId)
            )
        );
    }

    #bossDynamicCollisionSurfaces() {
        return this.bossRuntime?.dynamicCollisionSurfaces?.(this.#bossWorldOffset()) ?? Object.freeze([]);
    }

    #advanceBossStage() {
        if (!this.bossRuntime || !this.worldProgress) return false;
        if (this.bossRuntime.status === "inactive") {
            const pendingStage = this.#pendingBossEntryStage();
            if (!pendingStage) return false;
            this.#selectBossRuntime(pendingStage.id);
            const stage = pendingStage;
            const entering = this.#bossEntryPlayers(stage);
            const outcome = this.startBossEncounter(entering.map(({ id }) => id));
            if (!outcome.accepted) return false;
            for (const [index, player] of entering.entries()) {
                const gateId = `${stage.id}:entry`;
                const position = portalArrivalPosition(stage.entry, index, entering.length);
                this.applyPortalTransition(player.id, position, this.tick, gateId);
                this.recordReplicationEvent("gate-portal-entered", { playerId: player.id, gateId, position });
            }
            return true;
        }
        const stage = this.#bossStageWorld();
        if (!stage) return false;
        if (this.bossRuntime.status === "active") {
            const entering = this.#bossEntryPlayers(stage).filter(
                ({ id }) => this.#bossParticipantStatus(id) !== BOSS_PARTICIPANT_STATUS.ACTIVE
            );
            let joined = false;
            for (const [index, player] of entering.entries()) {
                const outcome = this.bossRuntime.addParticipant(player.id);
                if (!outcome.accepted) continue;
                const gateId = `${stage.id}:entry`;
                const position = portalArrivalPosition(stage.entry, index, entering.length);
                this.applyPortalTransition(player.id, position, this.tick, gateId);
                this.recordReplicationEvent("gate-portal-entered", { playerId: player.id, gateId, position });
                joined = true;
            }
            if (joined) this.#commitBossEvents();
            return joined;
        }
        if (this.bossRuntime.status !== "completed") return false;
        if (stage.terminalCompletion) {
            const boardingZone = this.bossRuntime.boardingZone?.(this.#bossWorldOffset()) ?? null;
            if (!boardingZone) return false;
            let changed = false;
            for (const player of this.players) {
                if (player.lifeState !== "active" || !pointInsideBounds(player.physics.position, boardingZone))
                    continue;
                const outcome = this.bossRuntime.markBoardingReady?.(player.id);
                changed = outcome?.changed === true || changed;
            }
            if (changed) this.#commitBossEvents();
            if (this.bossRuntime.allParticipantsReady?.() === true) {
                const completingPlayer = this.players.find(({ lifeState }) => lifeState === "active");
                if (completingPlayer) this.beginCompletion(completingPlayer.id);
            }
            return changed;
        }
        let transitioned = false;
        const exiting = this.players.filter(
            ({ lifeState, physics }) => lifeState === "active" && pointInsideBounds(physics.position, stage.exitTrigger)
        );
        for (const [index, player] of exiting.entries()) {
            const gateId = `${stage.id}:exit`;
            const position = portalArrivalPosition(stage.targetEntry, index, exiting.length);
            this.applyPortalTransition(player.id, position, this.tick, gateId);
            const targetLandmark = this.landmarkById[stage.targetLandmarkId];
            if (targetLandmark) this.setPlayerRespawnAnchor(player.id, targetLandmark.respawnAnchorId);
            this.recordReplicationEvent("gate-portal-entered", { playerId: player.id, gateId, position });
            transitioned = true;
        }
        const activePlayersLeftArena = this.players
            .filter(({ lifeState }) => lifeState === "active")
            .every(({ physics }) => !pointInsideBounds(physics.position, stage.bounds));
        if (activePlayersLeftArena) {
            this.worldProgress.resetContentBoundary();
            this.contentBoundaryAnnounced = false;
            const nextStage = this.world.bossStages?.find(({ id }) => !this.worldProgress.isBossStageComplete(id));
            if (nextStage) this.#selectBossRuntime(nextStage.id);
        }
        return transitioned;
    }

    #resolveBossParticipantDefeat(player, cause) {
        const defeat = this.handleBossParticipantDefeat(player.id, cause);
        if (!defeat.accepted) return defeat;
        if (!defeat.retryStarted) {
            player.lifeState = "spectating";
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
            player.ropeImpactState.reset();
            return defeat;
        }
        this.#respawnBossParticipants("boss-wipe");
        return defeat;
    }

    #respawnBossParticipants(reason) {
        const participants = this.players
            .filter(({ id }) => this.#bossParticipantStatus(id) === BOSS_PARTICIPANT_STATUS.ACTIVE)
            .sort((left, right) => left.id.localeCompare(right.id, "en"));
        const basePosition = this.bossRuntime?.respawnPosition?.(this.#bossWorldOffset()) ?? null;
        for (const [index, participant] of participants.entries()) {
            const position = basePosition ? portalArrivalPosition(basePosition, index, participants.length) : null;
            this.respawnPlayerAtCheckpoint(participant, reason, `${reason}:${this.tick}:${participant.id}`, position);
        }
        return participants.length;
    }

    #recoverBossSpectatorsOnVictory() {
        const stage = this.#bossStageWorld();
        if (!stage) return;
        const spectators = this.players
            .filter(
                ({ id, lifeState }) =>
                    lifeState === "spectating" && this.#bossParticipantStatus(id) === BOSS_PARTICIPANT_STATUS.SPECTATING
            )
            .sort((left, right) => left.id.localeCompare(right.id, "en"));
        const victoryBase = this.bossRuntime?.victoryRecoveryPosition?.(this.#bossWorldOffset()) ?? stage.exit;
        let participantStateChanged = false;
        for (const [index, player] of spectators.entries()) {
            const recovery = this.bossRuntime?.recoverParticipant?.(player.id);
            participantStateChanged = recovery?.changed === true || participantStateChanged;
            const position = portalArrivalPosition(victoryBase, index, Math.max(1, spectators.length));
            this.respawnPlayerAtCheckpoint(player, "boss-victory", `boss-victory:${this.tick}:${player.id}`, position);
            this.applyPortalTransition(player.id, position, this.tick, `${stage.id}:victory-recovery`);
        }
        if (participantStateChanged) this.#commitBossEvents();
    }

    #compositeHazardOverlapsPlayer(hazard, player) {
        const position = player.physics.position;
        const radius = PLAYER_CONFIG.radius;
        if (hazard.position && hazard.collider) {
            return player.physics.collider.overlapsCollider(position, hazard.position, hazard.collider);
        }
        if (hazard.position && Number.isFinite(hazard.radius)) {
            return Math.hypot(position.x - hazard.position.x, position.y - hazard.position.y) <= hazard.radius + radius;
        }
        const bounds = hazard.bounds;
        if (!bounds) return false;
        const closestX = Math.max(bounds.x, Math.min(position.x, bounds.x + bounds.width));
        const closestY = Math.max(bounds.y, Math.min(position.y, bounds.y + bounds.height));
        return Math.hypot(position.x - closestX, position.y - closestY) <= radius;
    }

    #resolveCompositeBossHazards({ players, replicate }) {
        const stage = this.#bossStageWorld();
        const snapshot = this.bossStageSnapshot();
        const hazards = this.bossRuntime?.activeHazards?.(this.#bossWorldOffset()) ?? Object.freeze([]);
        if (!stage || hazards.length === 0) return Object.freeze([]);
        const outcomes = [];
        for (const hazard of hazards) {
            for (const player of players) {
                if (
                    player.lifeState !== "active" ||
                    player.health <= 0 ||
                    player.hitInvulnerabilityRemaining > 0 ||
                    this.bossRuntime?.recoveryProtected?.(player.id) === true
                )
                    continue;
                if (!this.#compositeHazardOverlapsPlayer(hazard, player)) continue;
                const contactId = `${stage.id}:attempt:${snapshot.attempt}:hazard:${hazard.id}:${player.id}`;
                const contact = this.bossRuntime.applyHazardContact({
                    contactId,
                    playerId: player.id,
                    damage: hazard.damage
                });
                if (!contact.changed) continue;
                const protection = player.augmentCombat.absorbPlayerDamage({
                    amount: contact.damage,
                    type: "combat-hp",
                    sourceKind: `boss-${hazard.kind}`,
                    attackerId: null
                });
                const appliedDamage = protection.appliedDamage;
                player.health = Math.max(0, player.health - appliedDamage);
                player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
                if (hazard.kind === "counter-bash" && hazard.bounds) {
                    const originX = hazard.bounds.x + hazard.bounds.width * 0.5;
                    const originY = hazard.bounds.y + hazard.bounds.height * 0.5;
                    const dx = player.physics.position.x - originX;
                    const dy = player.physics.position.y - originY;
                    const pushDistance = Math.hypot(dx, dy);
                    if (pushDistance > 0) {
                        player.physics.applyImpulse(
                            { x: dx / pushDistance, y: dy / pushDistance },
                            COMBAT_CONFIG.playerHitKnockback
                        );
                    }
                }
                const defeated = player.health <= 0;
                if (defeated) this.#resolveBossParticipantDefeat(player, `boss-${hazard.kind}`);
                const event = Object.freeze({
                    contactId,
                    bossStageId: stage.id,
                    hazardKind: hazard.kind,
                    hazardSequence: hazard.sequence,
                    playerId: player.id,
                    damage: contact.damage,
                    appliedDamage,
                    health: player.health,
                    position: vectorState(player.physics.position),
                    velocity: vectorState(player.physics.velocity),
                    impactId: contactId,
                    projectileId: contactId,
                    clientTick: this.tick,
                    resolution: "player-hit",
                    respawned: defeated && player.lifeState === "active",
                    parameters: Object.freeze({
                        sourceKind: PLAYER_IMPACT_SOURCE_KIND.BOSS_HAZARD,
                        sourceId: stage.id,
                        sourceType: hazard.kind,
                        sourceSequence: hazard.sequence,
                        damage: contact.damage
                    })
                });
                if (replicate) this.recordReplicationEvent("boss-player-hit", event);
                this.eventFlash = { type: "player-hit", age: 0, ...event };
                outcomes.push(event);
            }
        }
        if (replicate) this.#commitBossEvents();
        return Object.freeze(outcomes);
    }

    #resolveBossHazardContacts({ players = this.players, replicate = true } = {}) {
        if (this.bossRuntime?.status !== "active") return Object.freeze([]);
        if (this.victimImpactAuthority === VICTIM_IMPACT_AUTHORITY.CLAIM) return Object.freeze([]);
        return this.#resolveCompositeBossHazards({ players, replicate });
    }

    portalTransitionTick(playerId) {
        return this.portalTransitions.get(playerId)?.tick ?? null;
    }

    inputDrivenObjects(ownerId) {
        return this.objects.players.inputDrivenFor(ownerId);
    }

    playerState(playerId) {
        const player = this.#findPlayer(playerId);
        if (!player) return null;
        const playerSnapshot = player.renderSnapshot();
        const ropeSnapshot = player.ropeObject.renderSnapshot();
        return {
            ...playerSnapshot,
            ...(this.isSeamlessSectorWorld ? { respawnAnchorId: player.respawnAnchorId } : {}),
            rope: ropeSnapshot.rope,
            control: ropeSnapshot.control,
            launcher: ropeSnapshot.launcher
        };
    }

    playerStates() {
        return this.players.map(({ id }) => this.playerState(id));
    }

    respawnAnchorForPlayer(playerId) {
        if (!this.isSeamlessSectorWorld) return null;
        const player = this.#findPlayer(playerId);
        return this.world.respawnAnchors.find(({ id }) => id === player?.respawnAnchorId) ?? null;
    }

    get activeRespawnAnchor() {
        return this.respawnAnchorForPlayer(this.#primaryPlayerId);
    }

    setPlayerRespawnAnchor(playerId, respawnAnchorId) {
        const player = this.#requirePlayer(playerId);
        const anchor = this.world.respawnAnchors.find(({ id }) => id === respawnAnchorId);
        if (!anchor) throw new Error(`unknown player respawn anchor: ${respawnAnchorId}`);
        if (player.respawnAnchorId === anchor.id) return false;
        player.respawnAnchorId = anchor.id;
        return true;
    }

    updatePlayerStageSavepoint(playerId, { present = true, expectedRespawnAnchorId = null } = {}) {
        if (!this.isSeamlessSectorWorld) return null;
        const player = this.#requirePlayer(playerId);
        const anchor = this.world.respawnAnchors
            .slice()
            .sort((left, right) => right.level - left.level)
            .find((candidate) => playerOverlapsStageSavePoint(player, candidate));
        const current = this.respawnAnchorForPlayer(playerId);
        if (
            !anchor ||
            (expectedRespawnAnchorId !== null && anchor.id !== expectedRespawnAnchorId) ||
            anchor.level <= (current?.level ?? -1) ||
            !this.setPlayerRespawnAnchor(playerId, anchor.id)
        ) {
            return null;
        }
        const event = Object.freeze({
            type: "stage-savepoint-reached",
            playerId,
            respawnAnchorId: anchor.id,
            landmarkId: anchor.landmarkId,
            stageId: anchor.stageId,
            position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y })
        });
        if (present) this.eventFlash = { type: "stage-saved", age: 0, ...event };
        return event;
    }

    enemyStates() {
        return this.objects.enemies.renderSnapshots();
    }

    debugTrainingDummySnapshot() {
        const enemy = this.enemies.find((candidate) => this.debugTrainingDummy.matches(candidate)) ?? null;
        if (!enemy) this.debugTrainingDummy.clear();
        return this.debugTrainingDummy.snapshot(enemy);
    }

    spawnDebugTrainingDummy({ enemyType, visibleWorldBounds, directionX = 1 } = {}) {
        if (!isKnownEnemyType(enemyType)) {
            return Object.freeze({ created: false, reason: "지원하지 않는 몬스터 종류입니다." });
        }
        const viewport = finiteViewportBounds(visibleWorldBounds);
        const player = this.#primaryPlayer();
        if (!viewport || !player) {
            return Object.freeze({ created: false, reason: "현재 화면의 안전한 배치 지점을 확인할 수 없습니다." });
        }

        const radius = enemyInitialRadius(enemyType, COMBAT_CONFIG.enemyRadius);
        const health = enemyInitialHealth(enemyType, COMBAT_CONFIG.enemyHealth);
        const padding = radius + 8;
        const facing = directionX < 0 ? -1 : 1;
        const playerPosition = player.physics.position;
        const previousDummyId = this.debugTrainingDummy.enemyId;
        const blockers = this.enemies.filter(({ id, health }) => id !== previousDummyId && health > 0);
        const candidates = [];
        for (const surface of this.activeCollisionSurfaces) {
            if (surface.collision === false || surface.kind === "cover") continue;
            const span = horizontalSurfaceSpan(surface);
            if (!span) continue;
            const minimumX = Math.max(span.minX + padding, viewport.minX + padding);
            const maximumX = Math.min(span.maxX - padding, viewport.maxX - padding);
            if (maximumX < minimumX || span.topY < viewport.minY + padding || span.topY > viewport.maxY) continue;
            const preferredX = clamp(playerPosition.x + facing * 104, minimumX, maximumX);
            for (const x of new Set([preferredX, minimumX, maximumX, (minimumX + maximumX) * 0.5])) {
                const y = span.topY - radius - 2;
                const playerDistance = Math.hypot(x - playerPosition.x, y - playerPosition.y);
                if (playerDistance < radius + PLAYER_CONFIG.radius + 18) continue;
                if (
                    blockers.some(
                        (enemy) => Math.hypot(x - enemy.position.x, y - enemy.position.y) < radius + enemy.radius + 10
                    )
                ) {
                    continue;
                }
                const forwardDistance = (x - playerPosition.x) * facing;
                candidates.push({
                    x,
                    y,
                    score:
                        (forwardDistance >= 0 ? 0 : 10000) +
                        Math.abs(forwardDistance - 104) +
                        Math.abs(y - playerPosition.y)
                });
            }
        }
        candidates.sort((left, right) => left.score - right.score);
        const placement = candidates[0];
        if (!placement) {
            return Object.freeze({ created: false, reason: "현재 화면 안에 더미를 놓을 안전한 발판이 없습니다." });
        }

        this.removeDebugTrainingDummy();
        const region = authoredRegionForPosition(this.world, playerPosition);
        const enemy = createEnemyRuntime({
            id: this.registry.createId("debug-enemy-training-dummy"),
            position: new Vector2(placement.x, placement.y),
            level: region?.level ?? 0,
            areaId: region?.id ?? null,
            objectId: null,
            enemyType,
            radius,
            health,
            maxHealth: health,
            fireCooldown: COMBAT_CONFIG.enemyFireInterval
        });
        this.objects.enemies.add(enemy);
        this.debugTrainingDummy.assign(enemy);
        this.collisionBroadPhase.invalidateFrame();
        return Object.freeze({ created: true, enemy: enemy.renderSnapshot() });
    }

    setDebugTrainingDummyPresentationControlled(controlled) {
        return this.debugTrainingDummy.setPresentationControlled(controlled);
    }

    removeDebugTrainingDummy() {
        const enemyId = this.debugTrainingDummy.clear();
        if (!enemyId) return false;
        this.objects.enemies.remove(enemyId);
        this.objects.enemyProjectiles.removeOwnedBy(enemyId);
        this.enemyImpactTombstones.delete(enemyId);
        this.collisionBroadPhase.invalidateFrame();
        return true;
    }

    enemyNetworkStates() {
        return this.enemyStates()
            .filter((enemy) => !this.debugTrainingDummy.matches(enemy))
            .map((enemy) => {
                if (!enemy.objectId || !this.objects.enemies.isAuthoredObjectId(enemy.objectId)) return enemy;
                return {
                    id: enemy.id,
                    objectId: enemy.objectId,
                    position: enemy.position,
                    velocity: enemy.velocity,
                    collider: enemy.collider,
                    patrol: enemy.patrol,
                    behaviorState: enemy.behaviorState,
                    awakened: enemy.awakened,
                    knockbackState: enemy.knockbackState,
                    lockedTargetId: enemy.lockedTargetId,
                    attackState: enemy.attackState,
                    attackStateRemaining: enemy.attackStateRemaining,
                    aimDirection: enemy.aimDirection,
                    presentationAimDirection: enemy.presentationAimDirection,
                    health: enemy.health,
                    fireCooldown: enemy.fireCooldown
                };
            });
    }

    hydrateEnemyNetworkStates(states) {
        return states.map((state) => {
            if (state.enemyType) return state;
            const definition = this.objects.enemies.staticStateFor(state.objectId, (spawn) =>
                resolveEnemySpawnDefinition(spawn, {
                    runSeed: this.world.seed,
                    worldRevision: this.world.definitionRevision ?? WORLD_GENERATION_REVISION
                })
            );
            if (!definition) throw new Error(`unknown enemy network objectId: ${state.objectId}`);
            const collider = state.collider ?? definition.collider ?? null;
            return {
                ...definition,
                ...state,
                id: state.id,
                areaId: definition.areaId ?? null,
                objectId: state.objectId,
                swarmGroupId: definition.swarmGroupId ?? definition.slotId,
                collider,
                radius: definition.radius ?? (collider ? null : COMBAT_CONFIG.enemyRadius),
                maxHealth: COMBAT_CONFIG.enemyHealth
            };
        });
    }

    getFoundationReward(playerId) {
        return this.foundationRewards.get(playerId) ?? null;
    }

    #setActiveCollisionSurfaces(surfaces) {
        const staticSurfacesUnchanged =
            this.activeStaticCollisionSurfaces?.length === surfaces.length &&
            this.activeStaticCollisionSurfaces.every((surface, index) => surface === surfaces[index]);
        if (!staticSurfacesUnchanged) {
            this.activeStaticCollisionSurfaces = surfaces;
            this.activeStaticProjectileOccluders = Object.freeze(
                surfaces.filter(({ projectileOccluder }) => projectileOccluder === true)
            );
            this.collisionBroadPhase?.setSurfaces(surfaces);
        }
        return this.#setActiveDynamicCollisionSurfaces();
    }

    #setActiveDynamicCollisionSurfaces() {
        const dynamicSurfaces = this.#bossDynamicCollisionSurfaces();
        this.activeDynamicCollisionSurfaces = dynamicSurfaces;
        this.activeCollisionSurfaces =
            dynamicSurfaces.length === 0
                ? this.activeStaticCollisionSurfaces
                : Object.freeze([...this.activeStaticCollisionSurfaces, ...dynamicSurfaces]);
        this.activeProjectileOccluders = Object.freeze([
            ...this.activeStaticProjectileOccluders,
            ...dynamicSurfaces.filter(({ projectileOccluder }) => projectileOccluder === true)
        ]);
        this.collisionBroadPhase?.setDynamicSurfaces(dynamicSurfaces);
        return this.activeCollisionSurfaces;
    }

    #prepareCollisionFrame() {
        return this.objects.beginSimulationFrame({
            tick: this.tick,
            surfaces: this.activeStaticCollisionSurfaces,
            neutralActors: this.#bossCollisionActors()
        });
    }

    collisionBroadPhaseSnapshot() {
        return this.collisionBroadPhase.snapshot();
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
        this.#setActiveCollisionSurfaces(collisionSurfacesForProgress(this.world, this.worldProgress));
        return true;
    }

    advanceSectorProgressToLandmark(landmarkId) {
        if (!this.isSeamlessSectorWorld) return false;
        const target = this.world.landmarks.find(
            ({ id, areaId, stageId }) => id === landmarkId || areaId === landmarkId || stageId === landmarkId
        );
        if (!target) return false;
        this.worldProgress = new SectorProgressState(this.world);
        this.contentBoundaryAnnounced = false;
        this.portalTransitions?.clear();
        this.foundationRewards?.clear();
        for (const source of this.world.landmarks) {
            if (source.order >= target.order) break;
            for (const objectiveId of source.objectiveIds) {
                const objective = this.world.objectives.find(({ id }) => id === objectiveId);
                for (const requiredId of objective.requiredObjectiveIds ?? []) {
                    if (!this.worldProgress.isObjectiveComplete(requiredId)) {
                        this.worldProgress.completeObjective(requiredId);
                    }
                }
                this.worldProgress.completeObjective(objectiveId);
            }
            for (const module of this.world.accessModules ?? []) {
                if (module.sectorId === source.sectorId) this.worldProgress.collectAccessModule(module.id);
            }
        }
        for (const bossStage of this.world.bossStages ?? []) {
            const bossTarget = this.landmarkById[bossStage.targetLandmarkId];
            if (bossTarget && bossTarget.order <= target.order) this.worldProgress.completeBossStage(bossStage.id);
        }
        this.worldProgress.resetContentBoundary();
        this.#setActiveCollisionSurfaces(
            this.#bossFilteredCollisionSurfaces(collisionSurfacesForSectorProgress(this.world, this.worldProgress))
        );
        return true;
    }

    debugTeleportPlayer(playerId, areaId) {
        const player = this.#requirePlayer(playerId);
        if (this.isSeamlessSectorWorld) {
            const landmark = this.world.landmarks.find(
                ({ id, areaId: sourceAreaId, stageId }) =>
                    id === areaId || sourceAreaId === areaId || stageId === areaId
            );
            if (!landmark || !this.advanceSectorProgressToLandmark(landmark.id)) return null;
            this.setPlayerRespawnAnchor(playerId, landmark.respawnAnchorId);
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
        player.ropeImpactState.reset();
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
            player.physics.setPhysicsPosition(position);
            player.ropeObject.aimWorld = Object.freeze({ x: position.x, y: position.y });
            this.collisionBroadPhase.invalidateFrame();
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
        player.ropeImpactState.reset();
        this.portalTransitions.set(player.id, Object.freeze({ gateId, position, tick }));
        this.collisionBroadPhase.invalidateFrame();
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
        player.physics.setPhysicsPosition(entry);
        this.#advanceAuthoredWorldProgress(new Map(), { dt: 0 });
        return this.worldProgress.isGateCrossed(gate.id);
    }

    applyOwnerMotion(playerId, state, { synchronizeRope = true } = {}) {
        const player = this.#requirePlayer(playerId);
        this.#advanceSweptOwnerGate(player, state.position);
        player.physics.setPhysicsPosition(state.position);
        player.physics.setPhysicsVelocity(state.velocity);
        this.collisionBroadPhase.invalidateFrame();
        player.physics.setAngularState(state.angle, state.angularVelocity);
        player.physics.isGrounded = state.isGrounded;
        let motionOutcome = Object.freeze({ accepted: true, ropeReleased: false });
        if (
            this.isSeamlessSectorWorld &&
            typeof state.respawnAnchorId === "string" &&
            state.respawnAnchorId !== player.respawnAnchorId
        ) {
            const savepointEvent = this.updatePlayerStageSavepoint(playerId, {
                expectedRespawnAnchorId: state.respawnAnchorId
            });
            if (savepointEvent) {
                const { type: _type, ...payload } = savepointEvent;
                this.metrics.recordCheckpoint();
                this.recordReplicationEvent("stage-savepoint-reached", payload);
            }
        }
        if (player.ropeDisabledRemaining > 0) {
            const ropeAttachmentId = player.ropeObject.rope.attachmentId;
            const ropeReleased = this.releasePlayerRope(playerId);
            player.ropeObject.launcher.clear();
            motionOutcome = Object.freeze({ accepted: true, ropeReleased, ropeAttachmentId });
        } else if (synchronizeRope && state.rope.isAttached) {
            const actorClaim = state.rope.anchorOwnerId ? this.#actorRopeAnchorClaim(player, state.rope) : null;
            if (actorClaim && !actorClaim.accepted) {
                motionOutcome = this.#releaseInvalidOwnerRope(player, state.rope, actorClaim.reason);
            } else {
                const anchor =
                    actorClaim?.anchor ??
                    Object.freeze({
                        position: state.rope.anchor,
                        velocity: Object.freeze({ x: 0, y: 0 })
                    });
                const currentRope = player.ropeObject.rope;
                const continuingAttachment =
                    currentRope.isAttached && currentRope.attachmentId === state.rope.attachmentId;
                const attached = player.ropeObject.rope.attach(player.physics.position, anchor.position, {
                    angle: player.physics.angle,
                    attachmentOffset: state.rope.attachmentOffset,
                    anchorSurfaceId: state.rope.anchorSurfaceId ?? null,
                    anchorOwnerId: state.rope.anchorOwnerId ?? null,
                    anchorLocalOffset: state.rope.anchorLocalOffset ?? null,
                    anchorVelocity: anchor.velocity,
                    restLength: continuingAttachment ? currentRope.length : state.rope.length,
                    attachmentId: state.rope.attachmentId
                });
                if (!attached) {
                    motionOutcome = this.#releaseInvalidOwnerRope(
                        player,
                        state.rope,
                        ROPE_ANCHOR_RELEASE_REASON.CONSTRAINT_INVALID
                    );
                } else {
                    this.#syncAttachedActorRopes();
                }
            }
        } else if (synchronizeRope) {
            this.releasePlayerRope(playerId);
        }
        if (player.ropeDisabledRemaining <= 0 && !motionOutcome.ropeReleased) {
            player.ropeObject.launcher.restore(state.launcher);
        } else if (motionOutcome.ropeReleased) {
            player.ropeObject.launcher.clear();
        }
        if (state.augmentRuntimeState?.combat) {
            player.augmentCombat.restore(state.augmentRuntimeState.combat, player.foundation, player.maxHealth);
        }
        if (motionOutcome.ropeReleased) player.ropeImpactState.reset();
        else player.ropeImpactState.restore(state.ropeImpactState ?? null);
        player.ropeImpactAttack.observe(player, player.ropeImpactState, this.#combatImpactTargets(), null);
        return motionOutcome;
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
                this.setPlayerRespawnAnchor(this.#primaryPlayerId, anchor.id);
            }
        } else if (activeCheckpointId !== null && activeCheckpointId !== undefined) {
            const activeCheckpoint = this.world.checkpoints.find(({ id }) => id === activeCheckpointId);
            if (!activeCheckpoint) throw new Error(`unknown active checkpoint: ${activeCheckpointId}`);
            this.activeCheckpoint = activeCheckpoint;
        }
        const existingById = new Map(this.enemies.map((enemy) => [enemy.id, enemy]));
        const seenIds = new Set();
        this.objects.enemies.replace(
            enemies.map((enemy) => {
                if (seenIds.has(enemy.id)) throw new Error(`duplicate predicted enemy id: ${enemy.id}`);
                seenIds.add(enemy.id);
                const existing = existingById.get(enemy.id);
                if (existing?.restoreNetworkState(enemy)) {
                    this.enemyRuntimeReconciliations += 1;
                    return existing;
                }
                this.enemyRuntimeCreations += 1;
                return createEnemyRuntime({
                    ...enemy,
                    position: new Vector2(enemy.position.x, enemy.position.y)
                });
            })
        );
        this.objects.playerProjectiles.clear();
        this.objects.enemyProjectiles.clear();
        this.collisionBroadPhase.invalidateFrame();
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
        this.#setActiveCollisionSurfaces(
            this.isSeamlessSectorWorld
                ? this.#bossFilteredCollisionSurfaces(
                      collisionSurfacesForSectorProgress(this.world, this.worldProgress)
                  )
                : collisionSurfacesForProgress(this.world, this.worldProgress)
        );
        return this.worldProgress.snapshot();
    }

    restoreHardpointJammers(snapshot) {
        return this.hardpointJammers.restore(snapshot ?? []);
    }

    useHardpointJammerSnapshotAuthority() {
        this.hardpointJammerAuthority = HARDPOINT_JAMMER_AUTHORITY.SNAPSHOT;
        return this.hardpointJammerAuthority;
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
                player.ropeImpactState.reset();
            }
        }
        return this.getFoundationReward(playerId);
    }

    predictionProgressState(playerId) {
        this.#requirePlayer(playerId);
        return Object.freeze({
            activeCheckpointId: this.activeCheckpoint?.id ?? null,
            respawnAnchorId: this.#findPlayer(playerId)?.respawnAnchorId ?? null,
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
        if (this.bossRuntime) {
            this.#advanceBossRuntime(dt);
            this.bossRuntime.drainEvents();
        }
        this.#prepareCollisionFrame();
        this.#prepareOwnerStep(player, dt);
        const wallImpactEvents = this.#advanceEnemyImpactKnockbacks(dt, { emitWallImpacts: true });
        this.#applyWorldForce(player, dt);
        const inputOutcome = this.dispatchOwnerInput(ownerId, command, dt, { replicateLandingImpacts: false });
        const bossImpactEvents = this.#resolveBossHazardContacts({ players: [player], replicate: false });
        if (this.collisionBroadPhase.frameTick !== this.tick) this.#prepareCollisionFrame();
        const ropeImpactOutcome = this.#advanceRopeImpactAttacks(player, { commit: false });
        const collisionExplosionEvents = player.augmentCombat.collisionExplosionEvents({
            player,
            foundation: player.foundation,
            baseImpactEvents: ropeImpactOutcome.impacts,
            enemies: this.#combatImpactTargets(),
            tick
        });
        const augmentImpactEvents = Object.freeze([
            ...wallImpactEvents,
            ...inputOutcome.augmentImpactEvents,
            ...(collisionExplosionEvents ?? [])
        ]);
        this.#commitAugmentImpactEvents(augmentImpactEvents, { replicate: false });
        const stageSavepointEvent = this.updatePlayerStageSavepoint(ownerId);
        const projectile = this.#advanceAutomaticWeapon(player, dt, allowFire);
        this.objects.playerProjectiles.clear();
        return Object.freeze({
            projectile,
            foundationEvents: inputOutcome.foundationEvents,
            fallImpactEvents: inputOutcome.fallImpactEvents,
            jammerImpactEvents: inputOutcome.jammerImpactEvents,
            bossImpactEvents,
            ropeImpactEvents: collisionExplosionEvents === null ? ropeImpactOutcome.impacts : Object.freeze([]),
            augmentImpactEvents,
            augmentEvents: inputOutcome.augmentEvents,
            stageSavepointEvent
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
        if (event.resolution === PLAYER_IMPACT_TYPE.JAMMER_SHOCK) {
            this.releasePlayerRope(ownerId, { transferAngularMomentum: true });
            player.ropeObject.attachBufferRemaining = 0;
            player.ropeObject.launcher.clear();
            player.ropeDisabledRemaining = this.ropeDisabledSeconds;
            player.statusEffects.applyElectrified({ sourceId: event.parameters?.sourceId ?? null });
            return true;
        }
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
            player.physics.applyImpulse(
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
            const attacker = this.objects.enemies.find(reflected.attackerId);
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
            ropeImpactState: state.ropeImpactState,
            swingDrag: state.control.swingDrag,
            launcher: state.launcher,
            weaponCooldown: state.weapon.cooldown,
            selectedAugmentIds: state.selectedAugmentIds,
            foundationAugment: state.foundationAugment,
            augmentRuntimeState: state.augmentRuntimeState,
            statusEffects: state.statusEffects
        };
    }

    #findPlayer(playerId) {
        return this.objects.players.find(playerId);
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
        if (this.isSeamlessSectorWorld && typeof state.respawnAnchorId === "string") {
            const anchor = this.world.respawnAnchors.find(({ id }) => id === state.respawnAnchorId);
            if (!anchor) throw new Error(`unknown restored respawn anchor: ${state.respawnAnchorId}`);
            player.respawnAnchorId = anchor.id;
        }
        player.physics.setPhysicsPosition(state.position);
        player.physics.setPhysicsVelocity(state.velocity);
        this.collisionBroadPhase.invalidateFrame();
        player.physics.setAngularState(state.angle, state.angularVelocity);
        player.physics.isGrounded = state.isGrounded;
        if (state.rope.isAttached) {
            player.ropeObject.rope.anchor = new Vector2(state.rope.anchor.x, state.rope.anchor.y);
            player.ropeObject.rope.anchorVelocity.set(0, 0);
            player.ropeObject.rope.attachmentId = state.rope.attachmentId ?? null;
            player.ropeObject.rope.anchorSurfaceId = state.rope.anchorSurfaceId ?? null;
            player.ropeObject.rope.anchorOwnerId = state.rope.anchorOwnerId ?? null;
            player.ropeObject.rope.anchorLocalOffset = state.rope.anchorLocalOffset
                ? new Vector2(state.rope.anchorLocalOffset.x, state.rope.anchorLocalOffset.y)
                : null;
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
        player.ropeImpactState.restore(state.ropeImpactState ?? null);
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
        player.statusEffects.restore(state.statusEffects ?? null);
        const effectiveRopeConfig = player.foundation.effectiveRopeConfig(this.ropeConfig);
        player.ropeObject.rope.config = effectiveRopeConfig;
        player.ropeObject.launcher.ropeConfig = effectiveRopeConfig;
        if (player.ropeDisabledRemaining > 0) {
            player.ropeObject.launcher.clear();
        } else {
            player.ropeObject.launcher.restore(state.launcher);
        }
        const launchOrigin = launchHandPosition(player, effectiveRopeConfig, player.ropeObject.aimWorld);
        const maxAttachDistance = hookReach(effectiveRopeConfig);
        const aimTolerance = player.foundation.ropeInputModifiers(this.ropeConfig).aimTolerance;
        player.ropeObject.attachmentCandidate = findRopeAttachment({
            aimPoint: player.ropeObject.aimWorld,
            origin: launchOrigin,
            surfaces: this.objects.ropeAttachmentSurfaces({
                aimPoint: player.ropeObject.aimWorld,
                origin: launchOrigin,
                maxAttachDistance,
                aimTolerance
            }),
            attachmentTargets: this.#ropeAttachmentActors(),
            maxAttachDistance,
            aimTolerance,
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
        if (this.runState !== "playing") {
            this.eventFlash.age += dt;
            return;
        }
        if (this.bossRuntime) {
            this.#advanceBossRuntime(dt);
            this.#commitBossEvents();
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
                ? authoredRegionForPosition(this.world, this.#primaryPlayer()?.physics.position)?.id
                : this.worldProgress.currentAreaId;
            this.metrics.recordProgressTime(progressId, dt);
        }
        this.elapsedSeconds += dt;
        this.#prepareCollisionFrame();
        this.#advanceHardpointJammers(dt);
        for (const player of this.players) {
            const playerCommand = this.commandForPlayer(player, gameplayCommands);
            this.#prepareOwnerStep(player, dt);
            if (advanceInputDrivenObjects) {
                this.#applyWorldForce(player, dt);
                const inputOutcome = this.dispatchOwnerInput(player.id, playerCommand, dt);
                this.#commitHardpointJammerImpacts(inputOutcome.jammerImpactEvents);
                this.commitFoundationEvents(inputOutcome.foundationEvents);
                const ropeImpactOutcome = this.#advanceRopeImpactAttacks(player, { commit: false });
                const collisionExplosionEvents = player.augmentCombat.collisionExplosionEvents({
                    player,
                    foundation: player.foundation,
                    baseImpactEvents: ropeImpactOutcome.impacts,
                    enemies: this.#combatImpactTargets(),
                    tick: this.tick
                });
                if (collisionExplosionEvents === null) {
                    for (const event of ropeImpactOutcome.impacts) this.#commitRopeImpact(event);
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
            if (this.isSeamlessSectorWorld) this.#advanceBossStage();
        }
        this.#resolveBossHazardContacts();
        if (this.collisionBroadPhase.frameTick !== this.tick) this.#prepareCollisionFrame();
        const wallImpactEvents = this.#advanceEnemyImpactKnockbacks(dt, {
            emitWallImpacts: advanceInputDrivenObjects
        });
        if (advanceInputDrivenObjects) this.#commitAugmentImpactEvents(wallImpactEvents);
        this.#advanceEnemyBehaviorSimulation(dt);
        const projectileTargets = [
            ...this.enemies,
            ...this.#activeBossImpactSnapshots().map((target) => ({ ...target }))
        ];
        const playerProjectileUpdate = updatePlayerProjectiles({
            projectiles: this.projectiles,
            enemies: projectileTargets,
            config: COMBAT_CONFIG,
            dt,
            resolveHits: resolvePlayerProjectileHits,
            maxLifetimeSeconds: COMBAT_CONFIG.playerProjectileLifetimeSeconds,
            projectileOccluders: this.activeProjectileOccluders
        });
        this.objects.playerProjectiles.commitLifecycle(playerProjectileUpdate);
        const playerProjectileEvents = this.#resolveBossProjectileEvents(playerProjectileUpdate);
        updateEnemyPresentationAim({
            enemies: this.activeSimulationEnemies.filter(
                (enemy) => enemy.awakened && this.debugTrainingDummy.canSimulate(enemy)
            ),
            targets: this.players,
            range: COMBAT_CONFIG.enemyAttackRange,
            surfaces: this.activeCollisionSurfaces
        });
        const enemyProjectileSpawns = updateEnemyWeapons({
            enemies: this.activeSimulationEnemies.filter(
                (enemy) => enemy.awakened && !enemy.knockbackState && this.debugTrainingDummy.canSimulate(enemy)
            ),
            targets: this.players,
            registerProjectile: (projectile) => this.objects.enemyProjectiles.add(projectile),
            registry: this.registry,
            config: COMBAT_CONFIG,
            surfaces: this.activeCollisionSurfaces,
            collisionBroadPhase: this.collisionBroadPhase,
            dt
        });
        for (const projectile of enemyProjectileSpawns) this.recordProjectileSpawn(projectile);
        const enemyProjectileLifecycle = advanceEnemyProjectiles({
            projectiles: this.enemyProjectiles,
            dt,
            maxLifetimeSeconds: COMBAT_CONFIG.enemyProjectileLifetimeSeconds
        });
        this.objects.enemyProjectiles.commitLifecycle(enemyProjectileLifecycle);
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
        this.metrics.recordEnemyOutcomes({
            ...playerProjectileEvents,
            hits: playerProjectileEvents.hits.filter(
                (event) =>
                    this.objects.enemies.find(event.targetId) !== null &&
                    !this.debugTrainingDummy.matches(event.targetId)
            )
        });
        this.#removeDefeatedEnemies();
        if (recoverPlayerDeaths) {
            for (const player of this.players) {
                if (player.health > 0 || player.lifeState !== "active") continue;
                if (
                    this.bossRuntime?.status === "active" &&
                    this.#bossParticipantStatus(player.id) === BOSS_PARTICIPANT_STATUS.ACTIVE
                ) {
                    const defeat = this.#resolveBossParticipantDefeat(player, "health");
                    if (defeat.retryStarted) break;
                    continue;
                }
                this.respawnPlayerAtCheckpoint(player, "health");
            }
        }
        if (recoverPlayerFalls) this.recoverFallenPlayers();
        this.eventFlash.age += dt;
    }

    recoverFallenPlayers() {
        const fallenPlayerIds = [];
        const recoveryY = this.fallRecoveryY();
        for (const player of this.players) {
            if (player.lifeState !== "active") continue;
            if (player.physics.position.isFinite() && player.physics.position.y <= recoveryY) {
                continue;
            }
            this.respawnPlayerAtCheckpoint(player, "fall");
            fallenPlayerIds.push(player.id);
        }
        return fallenPlayerIds;
    }

    fallRecoveryY() {
        const worldBottomY = Number.isFinite(this.world.bottomY) ? this.world.bottomY : WORLD_CONFIG.floorY;
        return worldBottomY + AUTHORED_STAGE_FALL_RECOVERY_MARGIN;
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
                interactSequence: 0,
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
        if (this.collisionBroadPhase.frameTick !== this.tick) this.#prepareCollisionFrame();
        const collisionEnemies = this.#playerCollisionActors();
        const foundationEvents = [];
        const fallImpactEvents = [];
        const augmentImpactEvents = [];
        const augmentEvents = [];
        const jammerImpactEvents = [];
        const canControl = player.lifeState === "active";
        const effectiveCommand = canControl
            ? player.augmentCombat.prepareCommand(player, player.foundation, command)
            : {
                  horizontal: 0,
                  vertical: 0,
                  interact: false,
                  interactSequence: command.interactSequence ?? 0,
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
                surfaceCandidates: (query) => this.objects.ropeAttachmentSurfaces(query),
                attachmentTargets: this.#ropeAttachmentActors(),
                resolveAttachmentTarget: (ownerId) => this.#ropeAttachmentActorById(ownerId),
                collisionActors: collisionEnemies,
                collisionBroadPhase: this.collisionBroadPhase,
                canAttachToSurface: this.#accessScanPredicate(),
                createAttachmentId: () => ROPE_ATTACHMENT_ID.forOwnerTick(player.id, this.tick),
                getRopeInputModifiers: () => player.foundation.ropeInputModifiers(effectiveRopeConfig),
                onAttach: ({ surfaceId, position, attachmentId }) => {
                    player.ropeImpactState.beginAttachment();
                    const impact = this.hardpointJammers.activeImpactForSurface(surfaceId, {
                        playerId: player.id,
                        attachmentId
                    });
                    if (!impact) return;
                    jammerImpactEvents.push(
                        Object.freeze({
                            eventType: impact.eventType,
                            impactId: impact.impactId,
                            projectileId: impact.impactId,
                            clientTick: this.tick,
                            targetId: player.id,
                            playerId: player.id,
                            resolution: PLAYER_IMPACT_TYPE.JAMMER_SHOCK,
                            position,
                            velocity: vectorState(player.physics.physicsStepVelocity()),
                            damage: impact.totalDamage,
                            parameters: Object.freeze({
                                sourceKind: PLAYER_IMPACT_SOURCE_KIND.HARDPOINT_JAMMER,
                                sourceId: impact.groupId,
                                sourceType: impact.surfaceId,
                                sourceSequence: impact.cycleSequence,
                                sourceObjectId: impact.sourceObjectId,
                                effectId: impact.effectId,
                                damage: impact.totalDamage
                            })
                        })
                    );
                },
                onRelease: () => {
                    player.ropeImpactState.beginReleaseCarry();
                    if (player.foundation.has("release-propulsion")) {
                        const velocity = player.physics.physicsStepVelocity();
                        player.physics.applyImpulse(
                            velocity.clone().scale(ROPE_AUGMENT_PERCENTAGES.releasePropulsionVelocity)
                        );
                        foundationEvents.push(
                            Object.freeze({
                                eventType: "augment-release-propulsion",
                                playerId: player.id,
                                augmentId: "release-propulsion",
                                position: vectorState(player.physics.position),
                                velocity: vectorState(player.physics.physicsStepVelocity())
                            })
                        );
                    }
                    if (player.augmentCombat.onRopeReleased()) {
                        foundationEvents.push(
                            Object.freeze({
                                eventType: ACTION_EVENT_TYPE.ROPE_LINK_READY,
                                playerId: player.id,
                                augmentId: ACTION_MODIFIER_ID.ROPE_LINK,
                                position: vectorState(player.physics.position),
                                duration: ACTION_STATE_CONFIG.ROPE_LINK_WINDOW_SECONDS
                            })
                        );
                    }
                },
                onSwing: () => player.ropeImpactState.armSwing(),
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
            enemies: collisionEnemies,
            surfaces: this.activeCollisionSurfaces,
            collisionBroadPhase: this.collisionBroadPhase,
            tick: this.tick
        });
        augmentImpactEvents.push(
            ...player.augmentCombat.observeAttachedRope({
                player,
                foundation: player.foundation,
                enemies: collisionEnemies,
                dt,
                tick: this.tick
            }),
            ...augmentOutcome.impactEvents
        );
        augmentEvents.push(...augmentOutcome.presentationEvents);
        return Object.freeze({
            foundationEvents: Object.freeze(foundationEvents),
            fallImpactEvents: Object.freeze(fallImpactEvents),
            jammerImpactEvents: Object.freeze(jammerImpactEvents),
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
        const outcome = player.ropeImpactAttack.advance(
            player,
            player.ropeImpactState,
            this.#combatImpactTargets(),
            this.tick,
            player.physics.lastActorImpact
        );
        const feedback = outcome.rejections[0] ?? null;
        if (feedback) this.eventFlash = { type: ROPE_IMPACT_EVENT_TYPE.REJECTED, age: 0, ...feedback };
        if (commit) {
            for (const event of outcome.impacts) this.#commitRopeImpact(event);
        }
        return outcome;
    }

    #resolveBossProjectileEvents(events) {
        const hits = events.hits.map((event) => {
            const target = this.impactTargetRegistry.find(event.targetId);
            if (target?.kind !== IMPACT_TARGET_KIND.BOSS) return event;
            const result = this.impactTargetRegistry.resolve(event.targetId, {
                sourcePlayerId: event.sourcePlayerId,
                sourceKind: "projectile",
                normalDamage: event.damage,
                position: event.position,
                causalId: event.projectileId
            });
            return Object.freeze({
                ...event,
                type: result.resolution,
                damage: result.damage,
                normalDamage: result.normalDamage,
                weakpointDamage: result.weakpointDamage,
                weakpointHit: result.weakpointHit,
                targetKind: IMPACT_TARGET_KIND.BOSS
            });
        });
        const hitByProjectileId = new Map(hits.map((event) => [event.projectileId, event]));
        const resolutions = events.resolutions.map((resolution) => {
            const hit = hitByProjectileId.get(resolution.projectileId);
            return hit?.targetKind === IMPACT_TARGET_KIND.BOSS
                ? Object.freeze({ ...resolution, resolution: hit.type })
                : resolution;
        });
        return Object.freeze({ hits: Object.freeze(hits), resolutions: Object.freeze(resolutions) });
    }

    #commitRopeImpact(event) {
        if (
            event.targetKind === IMPACT_TARGET_KIND.BOSS ||
            this.impactTargetRegistry.find(event.targetId)?.kind === IMPACT_TARGET_KIND.BOSS
        ) {
            const impactSpeed = Math.hypot(event.velocity.x, event.velocity.y);
            if (impactSpeed < ROPE_IMPACT_CONFIG.minimumSpeed) {
                return Object.freeze({ accepted: false, reason: "speed-below-minimum" });
            }
            const result = this.impactTargetRegistry.resolve(event.targetId, {
                sourcePlayerId: event.sourcePlayerId,
                sourceKind: "rope-impact",
                normalDamage: ropeImpactDamageForSpeed(impactSpeed, ROPE_IMPACT_CONFIG),
                position: event.impactPosition ?? event.position,
                causalId: event.predictionId
            });
            if (!result.accepted) return result;
            this.recordReplicationEvent("resolve", {
                objectId: event.predictionId,
                resolution: result.resolution,
                position: event.position,
                parameters: Object.freeze({
                    sourceKind: "rope-impact",
                    predictionId: event.predictionId,
                    sourcePlayerId: event.sourcePlayerId,
                    targetId: event.targetId,
                    targetKind: IMPACT_TARGET_KIND.BOSS,
                    damage: result.damage,
                    normalDamage: result.normalDamage,
                    weakpointDamage: result.weakpointDamage,
                    weakpointHit: result.weakpointHit,
                    impactSpeed
                })
            });
            this.eventFlash = {
                type: result.resolution,
                age: 0,
                position: new Vector2(event.position.x, event.position.y),
                damage: result.damage,
                sourcePlayerId: event.sourcePlayerId,
                targetId: event.targetId
            };
            return result;
        }
        const target = this.objects.enemies.findAlive(event.targetId);
        const source = this.#findPlayer(event.sourcePlayerId);
        const impactSpeed = Math.hypot(event.velocity.x, event.velocity.y);
        if (impactSpeed < ROPE_IMPACT_CONFIG.minimumSpeed) {
            return Object.freeze({ accepted: false, reason: "speed-below-minimum" });
        }
        const damage = ropeImpactDamageForSpeed(impactSpeed, ROPE_IMPACT_CONFIG);
        const result = resolvePlayerEnemyImpact({
            targetId: event.targetId,
            target,
            sourcePosition: source?.physics.position ?? event.position,
            damage,
            tombstones: this.enemyImpactTombstones
        });
        if (result.resolution === "shield-blocked") {
            return Object.freeze({ accepted: false, reason: "shield-blocked" });
        }
        if (!result.accepted || !result.emitEffects) return result;
        const resolution = result.resolution;
        if (resolution === "enemy-defeated" && !this.debugTrainingDummy.matches(event.targetId)) {
            this.metrics.enemyDefeats += 1;
        }
        this.recordReplicationEvent("resolve", {
            objectId: event.predictionId,
            resolution,
            position: event.position,
            parameters: Object.freeze({
                sourceKind: "rope-impact",
                predictionId: event.predictionId,
                sourcePlayerId: event.sourcePlayerId,
                targetId: event.targetId,
                damage,
                impactSpeed
            })
        });
        this.eventFlash = {
            type: resolution,
            age: 0,
            position: new Vector2(event.position.x, event.position.y),
            damage,
            impactSpeed,
            sourcePlayerId: event.sourcePlayerId,
            targetId: event.targetId
        };
        this.#removeDefeatedEnemies();
        return Object.freeze({ accepted: true, resolution, damage: result.damage });
    }

    #advanceEnemyImpactKnockbacks(dt, { emitWallImpacts = false } = {}) {
        const events = [];
        const wallImpactDamage = augmentImpactFormula(ACTION_SIGNATURE_ID.WALL_IMPACT).damage;
        for (const enemy of this.activeSimulationEnemies) {
            if (!this.debugTrainingDummy.canSimulate(enemy)) continue;
            const state = enemy.knockbackSnapshot();
            if (!state) continue;
            const previousPosition = enemy.position.clone();
            const movement = enemy.advanceImpactKnockback(
                dt,
                this.activeCollisionSurfaces,
                this.activeSimulationEnemies,
                this.collisionBroadPhase
            );
            const collided = movement.collided;
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
                    eventId: ACTION_KEY.impact(
                        state.sourcePlayerId,
                        ACTION_SIGNATURE_ID.WALL_IMPACT,
                        this.tick,
                        enemy.id
                    ),
                    predictionId: ACTION_KEY.impact(
                        state.sourcePlayerId,
                        ACTION_SIGNATURE_ID.WALL_IMPACT,
                        this.tick,
                        enemy.id
                    ),
                    sourcePlayerId: state.sourcePlayerId,
                    targetId: enemy.id,
                    clientTick: this.tick,
                    effectId: ACTION_SIGNATURE_ID.WALL_IMPACT,
                    sourceKind: ACTION_SOURCE_KIND.KNOCKBACK_WALL_CONTACT,
                    sourcePosition: vectorState(previousPosition),
                    contactPosition: vectorState(enemy.position),
                    position: vectorState(enemy.position),
                    damage: wallImpactDamage,
                    predictedResolution:
                        enemy.health <= wallImpactDamage
                            ? ACTION_PREDICTED_RESOLUTION.ENEMY_DEFEATED
                            : ACTION_PREDICTED_RESOLUTION.ENEMY_HIT
                })
            );
        }
        return Object.freeze(events);
    }

    #advanceEnemyBehaviorSimulation(dt) {
        const outcomes = advanceEnemyBehaviors({
            enemies: this.activeSimulationEnemies.filter(
                (enemy) => enemy.awakened && !enemy.knockbackState && this.debugTrainingDummy.canSimulate(enemy)
            ),
            targets: this.players,
            dt
        });
        for (const { enemyId, result } of outcomes) {
            const targetResolver = ENEMY_BEHAVIOR_PLAYER_TARGETS[result?.type];
            if (!targetResolver) continue;
            for (const player of targetResolver({ players: this.players, result })) {
                this.#applyEnemyBehaviorPlayerHit(enemyId, player, result);
            }
        }
        return outcomes;
    }

    #applyEnemyBehaviorPlayerHit(enemyId, player, result) {
        if (this.debugTrainingDummy.matches(enemyId)) {
            return Object.freeze({ safeTraining: true, damage: 0 });
        }
        if (player.hitInvulnerabilityRemaining > 0) return null;
        const protection = player.augmentCombat.absorbPlayerDamage({
            amount: result.damage,
            type: "combat-hp",
            sourceKind: result.type,
            attackerId: enemyId
        });
        const damage = protection.appliedDamage;
        player.health = Math.max(0, player.health - damage);
        player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
        for (const reflected of protection.events) {
            const attacker = this.objects.enemies.find(reflected.attackerId);
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
        this.metrics.recordPlayerImpact("player-hit", damage);
        const event = Object.freeze({
            impactId: `${enemyId}:${result.type}:${this.tick}:${player.id}`,
            sourceId: enemyId,
            sourceKind: result.type,
            playerId: player.id,
            damage,
            health: player.health,
            position: vectorState(player.physics.position),
            impactPosition: vectorState(result.position ?? player.physics.position),
            ...(Number.isFinite(result.radius)
                ? {
                      bounds: Object.freeze({
                          minX: result.position.x - result.radius,
                          minY: result.position.y - result.radius,
                          maxX: result.position.x + result.radius,
                          maxY: result.position.y + result.radius
                      })
                  }
                : {})
        });
        this.recordReplicationEvent(ENEMY_BEHAVIOR_REPLICATION_EVENT_TYPE.PLAYER_HIT, event);
        this.eventFlash = { type: "player-hit", age: 0, ...event };
        return event;
    }

    resolveRopeImpactClaim(authenticatedPlayerId, claim) {
        const player = this.#findPlayer(authenticatedPlayerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "player-ineligible" });
        }
        if (!claim.predictionId.startsWith(`${authenticatedPlayerId}:rope-impact:${claim.clientTick}:`)) {
            return Object.freeze({ accepted: false, reason: "prediction-ownership" });
        }
        const bossTarget =
            claim.targetKind === IMPACT_TARGET_KIND.BOSS ? this.impactTargetRegistry.find(claim.targetId) : null;
        if (bossTarget) {
            const target = bossTarget.snapshot();
            if (!bossTarget.active) return Object.freeze({ accepted: false, reason: "target-inactive" });
            const contactMatches = target.collider
                ? player.physics.collider.overlapsCollider(claim.position, target.position, target.collider)
                : Math.hypot(claim.position.x - target.position.x, claim.position.y - target.position.y) <=
                  (target.radius ?? BOSS_WEAKPOINT_RADIUS) + PLAYER_CONFIG.radius * 2;
            if (!contactMatches) {
                return Object.freeze({ accepted: false, reason: "target-contact-mismatch" });
            }
            return this.#commitRopeImpact({
                predictionId: claim.predictionId,
                sourcePlayerId: authenticatedPlayerId,
                targetId: claim.targetId,
                targetKind: IMPACT_TARGET_KIND.BOSS,
                position: target.position,
                impactPosition: claim.position,
                velocity: claim.velocity
            });
        }
        const target = this.objects.enemies.findAlive(claim.targetId);
        if (!target && this.enemyImpactTombstones.has(claim.targetId)) {
            return Object.freeze({
                accepted: true,
                resolution: "target-already-dead",
                damage: 0
            });
        }
        if (!target) return Object.freeze({ accepted: false, reason: "target-missing" });
        return this.#commitRopeImpact({
            predictionId: claim.predictionId,
            sourcePlayerId: authenticatedPlayerId,
            targetId: claim.targetId,
            position: target.position,
            impactPosition: claim.position,
            velocity: claim.velocity,
            damage: ropeImpactDamageForSpeed(Math.hypot(claim.velocity.x, claim.velocity.y), ROPE_IMPACT_CONFIG)
        });
    }

    resolveAugmentImpactClaim(authenticatedPlayerId, claim, { positionTolerance = 40, replicate = true } = {}) {
        const player = this.#findPlayer(authenticatedPlayerId);
        if (!player || player.lifeState !== "active") {
            return Object.freeze({ accepted: false, reason: "invalid" });
        }
        if (claim.sourcePlayerId !== authenticatedPlayerId || !claim.eventId.startsWith(`${authenticatedPlayerId}:`)) {
            return Object.freeze({ accepted: false, reason: "invalid" });
        }
        const registeredTarget = this.impactTargetRegistry.find(claim.targetId);
        if (registeredTarget?.kind === IMPACT_TARGET_KIND.BOSS) {
            const targetSnapshot = registeredTarget.snapshot();
            if (!targetSnapshot.active) return Object.freeze({ accepted: false, reason: "target-missing" });
            if (!validateAugmentImpactFormula(player, claim, targetSnapshot, { positionTolerance }).valid) {
                return Object.freeze({ accepted: false, reason: "invalid" });
            }
            const result = this.impactTargetRegistry.resolve(claim.targetId, {
                sourcePlayerId: authenticatedPlayerId,
                sourceKind: claim.sourceKind ?? claim.effectId,
                normalDamage: claim.damage,
                position: claim.contactPosition,
                causalId: claim.eventId ?? claim.predictionId
            });
            if (replicate && result.accepted) {
                this.recordReplicationEvent("augment-impact-resolved", {
                    predictionId: claim.predictionId,
                    effectId: claim.effectId,
                    effectSourceKind: claim.sourceKind,
                    sourcePlayerId: authenticatedPlayerId,
                    targetId: claim.targetId,
                    targetKind: IMPACT_TARGET_KIND.BOSS,
                    sourcePosition: claim.sourcePosition,
                    contactPosition: claim.contactPosition,
                    damage: result.damage,
                    normalDamage: result.normalDamage,
                    weakpointDamage: result.weakpointDamage,
                    weakpointHit: result.weakpointHit
                });
            }
            this.eventFlash = {
                type: result.resolution,
                age: 0,
                position: new Vector2(claim.contactPosition.x, claim.contactPosition.y),
                damage: result.damage,
                sourcePlayerId: authenticatedPlayerId,
                targetId: claim.targetId
            };
            return result;
        }
        const target = this.objects.enemies.findAlive(claim.targetId);
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
                claim.effectId === BASE_ACTION_ID.PUSH_AWAY && player.foundation.has(ACTION_SIGNATURE_ID.WALL_IMPACT);
            target.knockbackState.wallImpactTriggered = false;
        }
        if (!result.accepted || !result.emitEffects) return result;
        if (result.resolution === "enemy-defeated" && !this.debugTrainingDummy.matches(claim.targetId)) {
            this.metrics.enemyDefeats += 1;
        }
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

    #commitHardpointJammerImpacts(events, { replicate = true } = {}) {
        for (const event of events) {
            if (!this.applyPredictedOwnerImpact(event.playerId, event)) continue;
            const payload = Object.freeze({
                ...event,
                objectId: event.impactId,
                respawned: false
            });
            if (replicate) {
                this.recordProjectileResolution(
                    {
                        projectileId: event.impactId,
                        resolution: event.resolution,
                        position: new Vector2(event.position.x, event.position.y)
                    },
                    { ...event.parameters, targetId: event.playerId, damage: event.damage }
                );
            }
            this.metrics.recordPlayerImpact(event.resolution);
            this.eventFlash = { type: event.resolution, age: 0, ...payload };
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
        player.ropeImpactState.advance(dt);
        player.foundation.advance(dt);
        const electrified = player.statusEffects.advance(dt).electrified;
        if (electrified.damage <= 0 || player.lifeState !== "active") return;
        const protection = player.augmentCombat.absorbPlayerDamage({
            amount: electrified.damage,
            type: "combat-hp",
            sourceKind: ELECTRIFIED_STATUS_ID,
            attackerId: null
        });
        player.health = Math.max(0, player.health - protection.appliedDamage);
        this.metrics.recordPlayerImpact(PLAYER_IMPACT_TYPE.PLAYER_HIT, protection.appliedDamage);
        if (player.health <= 0) this.respawnPlayerAtCheckpoint(player, ELECTRIFIED_STATUS_ID, electrified.sourceId);
    }

    #applyWorldForce(player, dt) {
        if (player.lifeState !== "active" || !this.world.windZones?.length) return;
        const force = sampleWorldForce(this.world.windZones, player.physics.position, this.elapsedSeconds, {
            occluders: this.windOccluders
        });
        const groundedFactor = player.physics.isGrounded ? WIND_CONFIG.groundedFactor : 1;
        player.physics.applyAcceleration({ x: force.x * groundedFactor, y: force.y * groundedFactor }, dt);
    }

    #accessScanPredicate() {
        const scannerGroups = this.world.scannerGroups ?? [];
        if (scannerGroups.length === 0) return null;
        const stateMap = accessScanStateMap(scannerGroups, this.elapsedSeconds);
        return (surface) => isSurfaceAccessAllowed(surface, stateMap);
    }

    #advanceHardpointJammers(dt) {
        if ((this.world.jammerGroups ?? []).length === 0) return;
        if (this.hardpointJammerAuthority === HARDPOINT_JAMMER_AUTHORITY.SNAPSHOT) return;
        const activeSourceObjectIds = new Set(
            this.enemies.filter(({ health, awakened }) => health > 0 && awakened).map(({ objectId }) => objectId)
        );
        const activeSourceByObjectId = Object.freeze(
            Object.fromEntries(
                this.enemies
                    .filter(({ objectId, health, awakened }) => objectId && health > 0 && awakened)
                    .map((enemy) => [enemy.objectId, enemy])
            )
        );
        const attachedSurfaceIds = new Set(
            this.players.map(({ ropeObject }) => ropeObject.rope.anchorSurfaceId).filter(Boolean)
        );
        this.hardpointJammers.advance(dt, {
            activeSourceObjectIds,
            attachedSurfaceIds,
            candidateSurfaceIdsFor: (group, reservedSurfaceIds) =>
                resolveHardpointJammerCandidateSurfaceIds({
                    source: activeSourceByObjectId[group.sourceObjectId],
                    players: this.players,
                    querySurfaces: (bounds) => this.objects.ropeAttachmentSurfacesInBounds(bounds),
                    ropeConfig: this.ropeConfig,
                    excludedSurfaceIds: new Set([...attachedSurfaceIds, ...reservedSurfaceIds])
                })
        });
    }

    #advanceAuthoredWorldProgress(commandsByPlayerId, { replicate = true, dt = 0, resolveInteractChoice = true } = {}) {
        const events = this.isSeamlessSectorWorld
            ? advanceSectorProgress({
                  world: this.world,
                  progress: this.worldProgress,
                  players: this.players,
                  commandsByPlayerId,
                  respawnAnchorIdByPlayerId: new Map(
                      this.players.map(({ id, respawnAnchorId }) => [id, respawnAnchorId])
                  ),
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
        let stageSaveEvent = null;
        for (const event of events) {
            const { type, ...payload } = event;
            if (type === "objective-choice-requested") {
                if (event.playerId === this.debugAugmentPlayerId && this.#consumeDebugAugmentSource(event)) continue;
                if (!this.beginFoundationReward(event.playerId, event.sourceObjectId, event.objectiveId)) continue;
                this.eventFlash = { type: "foundation-choice-opened", age: 0, ...payload };
                continue;
            }
            if (replicate) this.recordReplicationEvent(type, payload);
            this.eventFlash = { type, age: 0, ...payload };
            if (type === "gate-unlocked") {
                this.#setActiveCollisionSurfaces(collisionSurfacesForProgress(this.world, this.worldProgress));
            }
            if (type === "route-unlocked") {
                this.#setActiveCollisionSurfaces(
                    this.#bossFilteredCollisionSurfaces(
                        collisionSurfacesForSectorProgress(this.world, this.worldProgress)
                    )
                );
            }
            if (
                type === "objective-completed" &&
                this.world.surfaces.some(({ blockedByObjectiveId }) => blockedByObjectiveId === event.objectiveId)
            ) {
                this.#setActiveCollisionSurfaces(
                    this.#bossFilteredCollisionSurfaces(
                        collisionSurfacesForSectorProgress(this.world, this.worldProgress)
                    )
                );
            }
            if (type === "content-boundary-reached") this.contentBoundaryAnnounced = true;
            if (type === "gate-crossed" && event.nextAreaId) {
                this.metrics.recordAreaClear(event.areaId);
                const checkpoint = this.world.checkpoints.find(({ areaId }) => areaId === event.nextAreaId);
                if (checkpoint && checkpoint.level > (this.activeCheckpoint?.level ?? -1)) {
                    this.#activateCheckpoint(checkpoint, event.playerId);
                }
            }
            if (type === "landmark-entered") {
                this.metrics.recordProgressClear(event.previousLandmarkId);
            }
            if (type === "stage-savepoint-reached") {
                if (!this.setPlayerRespawnAnchor(event.playerId, event.respawnAnchorId)) continue;
                this.metrics.recordCheckpoint();
                stageSaveEvent = event;
            }
        }
        this.#advanceCalibrationVerification();
        this.#completeEligibleAugmentObjectivesForCurrentRoster();
        if (this.isSeamlessSectorWorld) {
            this.#transferPlayersThroughStagePortals({ replicate });
            if (stageSaveEvent) {
                const { type: _type, ...payload } = stageSaveEvent;
                this.eventFlash = { type: "stage-saved", age: 0, ...payload };
            }
            if (this.worldProgress.snapshot().contentBoundaryReached && !this.contentBoundaryAnnounced) {
                const progressSnapshot = this.worldProgress.snapshot();
                const region = authoredRegionForPosition(this.world, this.#primaryPlayer()?.physics.position);
                const payload = Object.freeze({
                    contentBoundaryId: progressSnapshot.contentBoundaryId,
                    sectorId: region?.sectorId ?? null,
                    landmarkId: region?.id ?? null,
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

    #consumeDebugAugmentSource({ playerId, sourceObjectId }) {
        const player = this.#findPlayer(playerId);
        const source = this.objects.worldObjects.find(sourceObjectId);
        if (!player || source?.kind !== "augment-node") return false;
        if (!player.foundation.consumedSourceIds.includes(source.id)) {
            player.foundation.restore(player.foundation.selectedId, {
                ...player.foundation.snapshot(),
                consumedSourceIds: [...player.foundation.consumedSourceIds, source.id]
            });
        }
        this.eventFlash = {
            type: "debug-augment-source-consumed",
            age: 0,
            playerId,
            sourceId: source.id,
            position: vectorState(player.physics.position)
        };
        return true;
    }

    beginFoundationReward(playerId, sourceId, objectiveId = null) {
        const player = this.#findPlayer(playerId);
        const source = this.objects.worldObjects.find(sourceId);
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
        player.ropeImpactState.reset();
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

    #transferPlayersThroughStagePortals({ replicate }) {
        for (const player of this.players) {
            if (player.lifeState !== "active") continue;
            for (const transition of this.world.stageTransitions) {
                if (!pointInsideBounds(player.physics.position, transition.trigger)) continue;
                if (!this.worldProgress.isRouteUnlocked(transition.routeLockId)) continue;
                const bossStageId = this.bossStageIdByEntryRouteId[transition.routeLockId];
                if (bossStageId && !this.worldProgress.isBossStageComplete(bossStageId)) continue;
                const targetLandmark = this.landmarkById[transition.targetLandmarkId];
                if (!targetLandmark) {
                    throw new Error(`Missing Stage portal destination '${transition.targetLandmarkId}'`);
                }
                const departure = Object.freeze({ x: player.physics.position.x, y: player.physics.position.y });
                const position = Object.freeze({ x: targetLandmark.entry.x, y: targetLandmark.entry.y });
                this.applyPortalTransition(player.id, position, this.tick, transition.gateId);
                this.setPlayerRespawnAnchor(player.id, targetLandmark.respawnAnchorId);
                const payload = Object.freeze({
                    gateId: transition.gateId,
                    areaId: transition.sourceAreaId,
                    nextAreaId: transition.targetAreaId,
                    playerId: player.id,
                    departure,
                    position
                });
                if (replicate) this.recordReplicationEvent("gate-portal-entered", payload);
                this.eventFlash = { type: "gate-portal-entered", age: 0, ...payload };
                break;
            }
        }
    }

    #advanceAutomaticWeapon(player, dt, allowFire = true) {
        const enemies = [
            ...this.activeSimulationEnemies.filter(
                (enemy) =>
                    !enemy.activation ||
                    (player.physics.position.x >= enemy.activation.x &&
                        player.physics.position.x <= enemy.activation.x + enemy.activation.width &&
                        player.physics.position.y >= enemy.activation.y &&
                        player.physics.position.y <= enemy.activation.y + enemy.activation.height)
            ),
            ...this.#preferredBossImpactSnapshots()
        ];
        return updateAutomaticWeapon({
            owner: player,
            enemies,
            registerProjectile: (projectile) => this.objects.playerProjectiles.add(projectile),
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
        const source = this.objects.worldObjects.find(sourceId);
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

        this.#completeAugmentObjectiveIfPartyReady({ source, objectiveId, player, replicate });
        return Object.freeze({ accepted: true, sourceId, foundationId: foundation.id, changed: true });
    }

    #allPlayersConsumedAugmentSource(sourceId) {
        return (
            this.players.length > 0 &&
            this.players.every(({ foundation }) => foundation.consumedSourceIds.includes(sourceId))
        );
    }

    #completeAugmentObjectiveIfPartyReady({ source, objectiveId, player, replicate = true }) {
        if (
            !this.worldProgress ||
            this.worldProgress.isObjectiveComplete(objectiveId) ||
            !this.#allPlayersConsumedAugmentSource(source.id)
        ) {
            return false;
        }
        if (this.isSeamlessSectorWorld) {
            const beforeRoutes = new Set(this.worldProgress.snapshot().unlockedRouteIds);
            const completion = this.worldProgress.completeObjective(objectiveId);
            if (!completion.changed) return false;
            const objectivePayload = {
                objectiveId,
                landmarkId: source.landmarkId ?? null,
                playerId: player.id,
                position: vectorState(player.physics.position)
            };
            if (replicate) this.recordReplicationEvent("objective-completed", objectivePayload);
            for (const routeId of this.worldProgress.snapshot().unlockedRouteIds) {
                if (beforeRoutes.has(routeId)) continue;
                if (replicate) {
                    this.recordReplicationEvent("route-unlocked", {
                        routeId,
                        landmarkId: objectivePayload.landmarkId,
                        playerId: player.id,
                        position: objectivePayload.position
                    });
                }
            }
            this.#setActiveCollisionSurfaces(
                this.#bossFilteredCollisionSurfaces(collisionSurfacesForSectorProgress(this.world, this.worldProgress))
            );
            return true;
        }

        const areaId = source.areaId ?? this.worldProgress.currentAreaId;
        let completed = false;
        for (const event of completeWorldProgressObjective({
            progress: this.worldProgress,
            objectiveId,
            areaId,
            player
        })) {
            completed = true;
            const { type, ...payload } = event;
            if (replicate) this.recordReplicationEvent(type, payload);
            if (type === "gate-unlocked") {
                this.#setActiveCollisionSurfaces(collisionSurfacesForProgress(this.world, this.worldProgress));
            }
        }
        return completed;
    }

    // Records, per player, that their selected Augment's canonical effect actually fired while in
    // range of a "calibration-frame" source - never from card ownership alone. Rope-family Augments
    // (no actionId in FoundationAugmentCatalog) verify on a live rope attach; action-family Augments
    // verify on a canonical action activation (a queued cooldown, or an action currently resolving -
    // e.g. slow-fall, which never enqueues a cooldown). This intentionally does not reproduce each
    // CALIBRATION-PROFILES.json profile's exact distance/timing window (all marked NOT_IMPLEMENTED in
    // that package) - see docs/bsh/scenario/1/1-4/PRODUCTION-ALIGNMENT.md for the flagged gap.
    #advanceCalibrationVerification() {
        const sources = this.objects.worldObjects.ofKind("calibration-frame");
        if (sources.length === 0) return;
        for (const player of this.players) {
            if (player.lifeState !== "active" || player.foundation.selectedAugmentIds.length === 0) continue;
            const augmentId = player.foundation.selectedAugmentIds.at(-1);
            const definition = foundationAugmentById(augmentId);
            if (!definition) continue;
            const used = definition.actionId
                ? player.augmentCombat.actionState?.rechargeQueue.length > 0 ||
                  player.augmentCombat.actionState?.activeAction != null
                : player.ropeObject.rope.isAttached;
            if (!used) continue;
            for (const source of sources) {
                if (player.calibrationVerifiedSourceIds.includes(source.id)) continue;
                if (player.physics.position.distanceTo(source.position) > source.interactionRadius) continue;
                player.calibrationVerifiedSourceIds = [...player.calibrationVerifiedSourceIds, source.id];
            }
        }
    }

    #completeEligibleAugmentObjectivesForCurrentRoster() {
        if (!this.worldProgress || this.players.length === 0) return;
        for (const source of this.objects.worldObjects.ofKind("augment-node")) {
            const objectiveId = source.objectiveId;
            if (!objectiveId || this.worldProgress.isObjectiveComplete(objectiveId)) continue;
            const player = this.players.find(({ foundation }) => foundation.consumedSourceIds.includes(source.id));
            if (!player) continue;
            this.#completeAugmentObjectiveIfPartyReady({ source, objectiveId, player });
        }
    }

    clearFoundationSelection(playerId, sourceId = null, foundationId = null) {
        const player = this.#requirePlayer(playerId);
        if (foundationId) player.foundation.deselect(foundationId, { sourceId });
        player.augmentCombat.syncLoadout(player.foundation, player.maxHealth);
        if (sourceId) {
            const source = this.objects.worldObjects.find(sourceId);
            if (source) this.beginFoundationReward(playerId, sourceId, source.objectiveId);
        }
        return this.playerState(playerId);
    }

    createEnemies() {
        return this.world.enemySpawns.flatMap((spawn) => {
            const definition = resolveEnemySpawnDefinition(spawn, {
                runSeed: this.world.seed,
                worldRevision: this.world.definitionRevision ?? WORLD_GENERATION_REVISION
            });
            const members = enemySpawnMembers({
                ...definition,
                objectId: definition.objectId ?? definition.encounterId ?? definition.slotId,
                swarmGroupId: definition.swarmGroupId ?? definition.slotId,
                position: definition.position ?? definition
            });
            this.enemyRuntimeCreations += members.length;
            return members.map((member) =>
                createEnemyRuntime({
                    id: this.registry.createId("enemy"),
                    position: new Vector2(member.position.x, member.position.y),
                    level: member.level,
                    areaId: member.areaId ?? null,
                    objectId: member.objectId,
                    enemyType: member.enemyType,
                    activation: member.activation,
                    patrol: member.patrol,
                    swarmGroupId: member.swarmGroupId,
                    rules: member.rules,
                    collider: member.collider ?? null,
                    radius: member.radius ?? (member.collider ? null : COMBAT_CONFIG.enemyRadius),
                    health: member.health ?? COMBAT_CONFIG.enemyHealth,
                    maxHealth: member.maxHealth ?? COMBAT_CONFIG.enemyHealth,
                    fireCooldown: COMBAT_CONFIG.enemyFireInterval
                })
            );
        });
    }

    enemyRuntimeMetrics() {
        return Object.freeze({
            creations: this.enemyRuntimeCreations,
            reconciliations: this.enemyRuntimeReconciliations
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
        this.objects.playerProjectiles.add(projectile);
        this.recordProjectileSpawn(projectile);
        this.lastAcceptedPlayerProjectileSpawnTick.set(authenticatedPlayerId, claim.clientTick);
        player.weapon.cooldown = COMBAT_CONFIG.fireInterval;
        return Object.freeze({ accepted: true, projectileId: projectile.id });
    }

    resolvePlayerProjectileClaim(authenticatedPlayerId, claim) {
        const projectile = this.objects.playerProjectiles.findByPredictionId(claim.predictionId);
        if (projectile && projectile.ownerId !== authenticatedPlayerId) {
            return Object.freeze({ accepted: false, reason: "projectile-ownership" });
        }
        if (projectile && projectile.targetId !== claim.targetId) {
            return Object.freeze({ accepted: false, reason: "target-mismatch" });
        }
        const bossTarget = this.impactTargetRegistry.find(claim.targetId);
        if (bossTarget?.kind === IMPACT_TARGET_KIND.BOSS) {
            const damage = projectile?.damage ?? COMBAT_CONFIG.weaponDamage;
            if (projectile) this.objects.playerProjectiles.remove(projectile.id);
            const targetState = bossTarget.snapshot();
            const result = bossTarget.resolve({
                sourcePlayerId: authenticatedPlayerId,
                sourceKind: "projectile",
                normalDamage: damage,
                position: targetState.position,
                causalId: claim.predictionId
            });
            if (!result.accepted) return result;
            this.recordProjectileResolution(
                {
                    projectileId: projectile?.id ?? claim.predictionId,
                    resolution: result.resolution,
                    position: targetState.position
                },
                { damage: result.damage, sourcePlayerId: authenticatedPlayerId, targetId: claim.targetId }
            );
            return Object.freeze({ accepted: true, resolution: result.resolution, damage: result.damage });
        }
        const target = this.objects.enemies.findAlive(claim.targetId);
        if (!target && this.enemyImpactTombstones.has(claim.targetId)) {
            return Object.freeze({ accepted: true, resolution: "target-already-dead", damage: 0 });
        }
        if (!target) return Object.freeze({ accepted: false, reason: "target-missing" });
        const damage = projectile?.damage ?? COMBAT_CONFIG.weaponDamage;
        if (projectile) this.objects.playerProjectiles.remove(projectile.id);
        target.health = Math.max(0, target.health - damage);
        const resolution = target.health <= 0 ? "enemy-defeated" : "enemy-hit";
        this.recordProjectileResolution(
            { projectileId: projectile?.id ?? claim.predictionId, resolution, position: target.position },
            { damage, sourcePlayerId: authenticatedPlayerId, targetId: claim.targetId }
        );
        if (resolution === "enemy-defeated" && !this.debugTrainingDummy.matches(claim.targetId)) {
            this.metrics.enemyDefeats += 1;
        }
        this.#removeDefeatedEnemies();
        return Object.freeze({ accepted: true, resolution, damage });
    }

    #removeDefeatedEnemies() {
        const defeatedTrainingDummyId =
            this.enemies.find((enemy) => this.debugTrainingDummy.matches(enemy) && enemy.health <= 0)?.id ?? null;
        for (const enemy of this.enemies) {
            if (this.debugTrainingDummy.matches(enemy)) continue;
            if (enemy.health > 0 || this.enemyImpactTombstones.has(enemy.id)) continue;
            recordEnemyImpactTombstone(this.enemyImpactTombstones, {
                targetId: enemy.id,
                defeatedAtTick: this.tick
            });
        }
        if (this.isSeamlessSectorWorld) {
            for (const enemy of this.enemies) {
                if (enemy.health > 0 || !enemy.objectId) continue;
                const resolution = this.worldProgress.resolveEncounter(enemy.objectId);
                for (const collection of resolution.accessCollections ?? []) {
                    const accessModule = collection.module;
                    this.recordReplicationEvent("access-module-collected", {
                        accessModuleId: accessModule.id,
                        encounterId: enemy.objectId,
                        sectorId: accessModule.sectorId,
                        collectedCount: collection.access.collectedModuleIds.length,
                        requiredCount: collection.access.requiredCount
                    });
                    for (const routeId of collection.unlockedRouteIds ?? []) {
                        this.recordReplicationEvent("route-unlocked", {
                            routeId,
                            landmarkId: accessModule.landmarkId,
                            position: vectorState(enemy.position)
                        });
                    }
                    this.eventFlash = {
                        type: "access-module-collected",
                        age: 0,
                        accessModuleId: accessModule.id,
                        position: enemy.position.clone(),
                        collectedCount: collection.access.collectedModuleIds.length,
                        requiredCount: collection.access.requiredCount
                    };
                    if (collection.routeChanged) {
                        this.#setActiveCollisionSurfaces(
                            this.#bossFilteredCollisionSurfaces(
                                collisionSurfacesForSectorProgress(this.world, this.worldProgress)
                            )
                        );
                    }
                }
            }
        }
        this.objects.enemies.removeWhere(({ health }) => health <= 0);
        if (defeatedTrainingDummyId) {
            this.objects.enemyProjectiles.removeOwnedBy(defeatedTrainingDummyId);
            this.debugTrainingDummy.clear();
            this.collisionBroadPhase.invalidateFrame();
        }
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

    #validateBossHazardClaim(player, claim) {
        if (claim.sourceKind !== PLAYER_IMPACT_SOURCE_KIND.BOSS_HAZARD) return Object.freeze({ accepted: true });
        if (this.bossRuntime?.status !== "active") return Object.freeze({ accepted: false, reason: "boss-inactive" });
        const stage = this.#bossStageWorld();
        if (!stage || claim.sourceId !== stage.id)
            return Object.freeze({ accepted: false, reason: "boss-stage-mismatch" });
        if (BOSS_HAZARD_KIND[claim.sourceType] !== true) {
            return Object.freeze({ accepted: false, reason: "boss-hazard-mismatch" });
        }
        const playerSuffix = `:${player.id}`;
        if (!claim.impactId.endsWith(playerSuffix)) return Object.freeze({ accepted: false, reason: "boss-impact-id" });
        const recordKey = claim.impactId.slice(0, -playerSuffix.length);
        const record = this.bossHazardRecords.get(recordKey);
        if (!record || record.stageId !== stage.id || record.attempt !== this.bossRuntime.snapshot().attempt) {
            return Object.freeze({ accepted: false, reason: "boss-hazard-sequence" });
        }
        if (claim.sourceSequence !== record.sequence || claim.sourceType !== record.hazardKind) {
            return Object.freeze({ accepted: false, reason: "boss-hazard-mismatch" });
        }
        if (claim.damage !== record.damage) return Object.freeze({ accepted: false, reason: "boss-hazard-damage" });
        if (this.bossRuntime.hasHazardContact(claim.impactId)) {
            return Object.freeze({ accepted: false, reason: "boss-contact-duplicate" });
        }
        return Object.freeze({
            accepted: true,
            damage: record.damage,
            hazardKind: record.hazardKind,
            stageId: stage.id
        });
    }

    #validateHardpointJammerClaim(player, claim) {
        if (claim.sourceKind !== PLAYER_IMPACT_SOURCE_KIND.HARDPOINT_JAMMER) {
            return Object.freeze({ accepted: true });
        }
        const rope = player.ropeObject.rope;
        if (!rope.isAttached || rope.anchorSurfaceId !== claim.sourceType || typeof rope.attachmentId !== "string") {
            return Object.freeze({ accepted: false, reason: "jammer-attachment-mismatch" });
        }
        if (
            !this.hardpointJammers.validatesImpact({
                groupId: claim.sourceId,
                surfaceId: claim.sourceType,
                cycleSequence: claim.sourceSequence,
                playerId: player.id,
                attachmentId: rope.attachmentId,
                impactId: claim.impactId
            })
        ) {
            return Object.freeze({ accepted: false, reason: "jammer-state-mismatch" });
        }
        if (claim.damage !== HARDPOINT_JAMMER_IMPACT.totalDamage) {
            return Object.freeze({ accepted: false, reason: "jammer-damage-mismatch" });
        }
        return Object.freeze({ accepted: true, damage: HARDPOINT_JAMMER_IMPACT.totalDamage });
    }

    #resolvePlayerImpactClaim(authenticatedPlayerId, claim, { allowRecoveryState }) {
        const player = this.players.find(({ id }) => id === authenticatedPlayerId);
        if (!player) return Object.freeze({ accepted: false, reason: "player-missing" });
        const bossHazard = this.#validateBossHazardClaim(player, claim);
        if (!bossHazard.accepted) return bossHazard;
        const hardpointJammer =
            allowRecoveryState &&
            claim.outcome?.state &&
            claim.sourceKind === PLAYER_IMPACT_SOURCE_KIND.HARDPOINT_JAMMER
                ? Object.freeze({ accepted: true, damage: HARDPOINT_JAMMER_IMPACT.totalDamage })
                : this.#validateHardpointJammerClaim(player, claim);
        if (!hardpointJammer.accepted) return hardpointJammer;
        const impactId = claim.impactId ?? claim.projectileId;
        const isFallDamage = claim.impactType === PLAYER_IMPACT_TYPE.FALL_DAMAGE;
        const isJammerShock = claim.impactType === PLAYER_IMPACT_TYPE.JAMMER_SHOCK;
        const projectile = isFallDamage || isJammerShock ? null : this.objects.enemyProjectiles.find(impactId);
        if (projectile && this.debugTrainingDummy.ownsProjectile(projectile)) {
            this.objects.enemyProjectiles.remove(projectile.id);
            this.recordProjectileResolution({
                projectileId: projectile.id,
                resolution: claim.impactType,
                position: new Vector2(claim.position.x, claim.position.y)
            });
            return Object.freeze({
                accepted: true,
                resolution: claim.impactType,
                damage: 0,
                safeTraining: true
            });
        }
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
            const damage =
                bossHazard.damage ??
                hardpointJammer.damage ??
                (isFallDamage ? fallDamage : (projectile?.damage ?? claim.damage));
            let bossContactApplied = false;
            if (claim.outcome.state) {
                if (!allowRecoveryState) {
                    return Object.freeze({ accepted: false, reason: "recovery-not-authorized" });
                }
                if (claim.sourceKind === PLAYER_IMPACT_SOURCE_KIND.BOSS_HAZARD) {
                    const contact = this.bossRuntime.applyHazardContact({
                        contactId: claim.impactId,
                        playerId: player.id,
                        damage
                    });
                    if (!contact.changed) {
                        return Object.freeze({ accepted: false, reason: contact.reason ?? "boss-contact-duplicate" });
                    }
                    bossContactApplied = true;
                    this.#restoreBossHazardRecovery(player, claim);
                } else {
                    this.#restorePlayer(player, claim.outcome.state);
                }
            } else {
                const stateBeforeImpact = this.playerState(player.id);
                const bossHazardImpact = claim.sourceKind === PLAYER_IMPACT_SOURCE_KIND.BOSS_HAZARD;
                const bossBeforeImpact = bossHazardImpact ? this.bossRuntime.snapshot() : null;
                const partyBeforeImpact = bossHazardImpact
                    ? this.players.map((participant) => this.playerState(participant.id))
                    : null;
                this.#applyVictimImpactTransition(player, claim, damage);
                const digest = createPlayerImpactStateDigest(this.playerState(player.id), {
                    impactType: claim.impactType,
                    respawned: claim.outcome.respawned
                });
                if (digest !== claim.outcome.digest) {
                    if (partyBeforeImpact) {
                        for (const participantState of partyBeforeImpact) {
                            const participant = this.#findPlayer(participantState.id);
                            if (participant) this.#restorePlayer(participant, participantState);
                        }
                    } else {
                        this.#restorePlayer(player, stateBeforeImpact);
                    }
                    if (bossBeforeImpact) this.bossRuntime.restore(bossBeforeImpact);
                    return Object.freeze({ accepted: false, reason: "recovery-required" });
                }
            }
            if (claim.sourceKind === PLAYER_IMPACT_SOURCE_KIND.BOSS_HAZARD && !bossContactApplied) {
                const contact = this.bossRuntime.applyHazardContact({
                    contactId: claim.impactId,
                    playerId: player.id,
                    damage
                });
                if (!contact.changed) {
                    return Object.freeze({ accepted: false, reason: contact.reason ?? "boss-contact-duplicate" });
                }
            }
            return this.#finalizeVictimImpact(player, claim, projectile, damage);
        }
        if (isFallDamage || isJammerShock) return Object.freeze({ accepted: false, reason: "impact-outcome-required" });
        if (!projectile) return Object.freeze({ accepted: false, reason: "projectile-missing" });
        if (projectile.targetId !== authenticatedPlayerId) {
            return Object.freeze({ accepted: false, reason: "target-mismatch" });
        }
        if (claim.impactType === "rope-cut") {
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
            player.ropeImpactState.reset();
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
                player.physics.applyImpulse(
                    projectile.velocity.clone().scale(1 / speed),
                    COMBAT_CONFIG.playerHitKnockback
                );
            }
            player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
            for (const reflected of protection.events) {
                const attacker = this.objects.enemies.find(reflected.attackerId);
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
        this.objects.enemyProjectiles.remove(projectile.id);
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
        if (claim.impactType === PLAYER_IMPACT_TYPE.JAMMER_SHOCK) {
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
            player.ropeImpactState.reset();
            player.ropeObject.attachBufferRemaining = 0;
            player.ropeObject.launcher.clear();
            player.ropeDisabledRemaining = this.ropeDisabledSeconds;
            player.statusEffects.applyElectrified({ sourceId: claim.sourceId });
            return;
        }
        if (claim.impactType === "rope-cut") {
            player.ropeObject.rope.detach();
            player.ropeObject.swingDrag = null;
            player.ropeImpactState.reset();
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
        const bossHazard = claim.sourceKind === PLAYER_IMPACT_SOURCE_KIND.BOSS_HAZARD;
        const protection = player.augmentCombat.absorbPlayerDamage({
            amount: damage,
            type: "combat-hp",
            sourceKind: bossHazard ? `boss-${claim.sourceType}` : "projectile",
            attackerId: null
        });
        player.health = Math.max(0, player.health - protection.appliedDamage);
        const speed = Math.hypot(claim.velocity.x, claim.velocity.y);
        if (!bossHazard && speed > 0) {
            player.physics.applyImpulse(
                new Vector2(claim.velocity.x / speed, claim.velocity.y / speed),
                COMBAT_CONFIG.playerHitKnockback
            );
        }
        player.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
        if (bossHazard && player.health <= 0) {
            this.#resolveBossParticipantDefeat(player, `boss-${claim.sourceType}`);
        } else if (claim.outcome.respawned) {
            this.#resetPlayerAtCheckpoint(player);
        }
    }

    #restoreBossHazardRecovery(player, claim) {
        const recoveredState = claim.outcome.state;
        const fatal = claim.outcome.respawned || recoveredState.lifeState === "spectating";
        if (fatal) {
            const defeat = this.bossRuntime.handlePlayerDefeat(player.id, `boss-${claim.sourceType}`);
            if (defeat.retryStarted) {
                this.#respawnBossParticipants("boss-wipe");
            }
        }
        this.#restorePlayer(player, recoveredState);
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
            if (claim.outcome.respawned) {
                this.#recordPlayerRespawn(player, "fall-damage", impactId, claim.position);
            }
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
        if (claim.impactType === PLAYER_IMPACT_TYPE.JAMMER_SHOCK) {
            this.eventFlash = {
                type: claim.impactType,
                age: 0,
                position: new Vector2(claim.position.x, claim.position.y),
                playerId: player.id
            };
        }
        if (claim.sourceKind === PLAYER_IMPACT_SOURCE_KIND.BOSS_HAZARD) {
            this.recordReplicationEvent("boss-player-hit", {
                impactId,
                contactId: impactId,
                bossStageId: claim.sourceId,
                hazardKind: claim.sourceType,
                hazardSequence: claim.sourceSequence,
                playerId: player.id,
                targetId: player.id,
                damage,
                position: new Vector2(claim.position.x, claim.position.y),
                velocity: new Vector2(claim.velocity.x, claim.velocity.y),
                respawned: claim.outcome.respawned
            });
        }
        if (projectile) this.objects.enemyProjectiles.remove(projectile.id);
        this.recordProjectileResolution(
            {
                projectileId: impactId,
                resolution: claim.impactType,
                position: new Vector2(claim.position.x, claim.position.y)
            },
            {
                damage:
                    claim.impactType === "player-hit" || claim.impactType === PLAYER_IMPACT_TYPE.JAMMER_SHOCK
                        ? damage
                        : 0,
                targetId: player.id,
                ...(claim.sourceKind === PLAYER_IMPACT_SOURCE_KIND.HARDPOINT_JAMMER
                    ? {
                          sourceKind: claim.sourceKind,
                          sourceId: claim.sourceId,
                          sourceType: claim.sourceType,
                          sourceSequence: claim.sourceSequence,
                          effectId: HARDPOINT_JAMMER_IMPACT.effectId
                      }
                    : {})
            }
        );
        this.metrics.recordPlayerImpact(claim.impactType, damage);
        if (claim.outcome.respawned) this.#recordPlayerRespawn(player, "health", impactId, claim.position);
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
                parameters: combatEvent ? { ...combatEvent } : {}
            })
        );
    }

    drainReplicationEvents() {
        const events = Object.freeze(this.replicationEvents);
        this.replicationEvents = [];
        return events;
    }

    respawnPlayerAtCheckpoint(player, reason, causeId = `${reason}:${this.tick}`, overridePosition = null) {
        if (!player || this.runState !== "playing") return false;
        const deathPosition = this.#deathPosition(player.physics.position, player.id);
        this.#resetPlayerAtCheckpoint(player, overridePosition);
        this.#recordPlayerRespawn(player, reason, causeId, deathPosition);
        return true;
    }

    #resetPlayerAtCheckpoint(player, overridePosition = null) {
        const bossStage = this.bossRuntime?.status === "active" ? this.#bossStageWorld() : null;
        const bossRespawn = bossStage
            ? (this.bossRuntime?.respawnPosition?.(this.#bossWorldOffset()) ?? bossStage.entry)
            : null;
        const respawnPosition = overridePosition ??
            bossRespawn ??
            (this.isSeamlessSectorWorld ? this.respawnAnchorForPlayer(player.id)?.position : this.activeCheckpoint) ?? {
                x: 120,
                y: 500
            };
        player.physics.reset(respawnPosition);
        this.collisionBroadPhase.invalidateFrame();
        player.ropeObject.rope.detach();
        player.ropeObject.attachmentCandidate = null;
        player.ropeObject.wasPointerDown = false;
        player.ropeObject.lastPointer = Object.freeze({ x: 0, y: 0, down: false });
        player.ropeObject.attachBufferRemaining = 0;
        player.ropeObject.swingDrag = null;
        player.ropeObject.launcher.clear();
        player.ropeImpactState.reset();
        player.health = player.maxHealth;
        player.weapon.cooldown = 0;
        player.hitInvulnerabilityRemaining = 0;
        player.ropeDisabledRemaining = 0;
        player.lifeState = "active";
        player.foundation.resetRuntime();
        player.augmentCombat.resetForRespawn(player.foundation, player.maxHealth);
        player.statusEffects.reset();
    }

    #deathPosition(position, playerId = this.#primaryPlayerId) {
        const fallbackAnchor = this.respawnAnchorForPlayer(playerId);
        return Object.freeze({
            x: Number.isFinite(position?.x) ? position.x : (fallbackAnchor?.position.x ?? 120),
            y: Number.isFinite(position?.y) ? position.y : WORLD_CONFIG.floorY + 780
        });
    }

    #recordPlayerRespawn(player, reason, causeId, deathPosition = player.physics.position) {
        const normalizedDeathPosition = this.#deathPosition(deathPosition);
        const statusType = this.isSeamlessSectorWorld ? "sector-respawn" : "checkpoint-respawn";
        this.metrics.recordDefeat();
        this.eventFlash = {
            type: statusType,
            age: 0,
            playerId: player.id,
            reason,
            causeId,
            deathPosition: normalizedDeathPosition,
            position: player.physics.position.clone()
        };
        this.recordReplicationEvent("player-respawned", {
            playerId: player.id,
            reason,
            causeId,
            statusType,
            health: player.health,
            deathPosition: normalizedDeathPosition,
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
            current.ropeImpactState.reset();
        }
        this.eventFlash = { type: "completed", age: 0, playerId, position: this.world.summit };
        this.recordReplicationEvent("run-completed", {
            playerId,
            position: { x: this.world.summit.x, y: this.world.summit.y }
        });
        return true;
    }

    windStateSnapshots() {
        return this.world.windZones ? snapshotWindStates(this.world.windZones, this.elapsedSeconds) : Object.freeze([]);
    }

    snapshot() {
        const player = this.#primaryPlayer();
        const playerState = this.playerState(player.id);
        const ropeState = player.ropeObject.renderSnapshot();
        const bossStage = this.bossStageSnapshot();
        return {
            tick: this.tick,
            world: this.world,
            player: playerState,
            rope: playerState.rope,
            aimWorld: playerState.control.aimWorld,
            attachmentCandidate: ropeState.attachmentCandidate,
            eventFlash: eventFlashState(this.eventFlash),
            swingDrag: playerState.control.swingDrag,
            enemies: this.enemyStates(),
            projectiles: this.objects.playerProjectiles.renderSnapshots(),
            enemyProjectiles: this.objects.enemyProjectiles.renderSnapshots(),
            augmentProjectiles: playerState.augmentRuntimeState.combat.actionProjectiles,
            playerHealth: playerState.health,
            playerMaxHealth: playerState.maxHealth,
            ropeDisabledRemaining: playerState.ropeDisabledRemaining,
            playerLifeState: playerState.lifeState,
            runState: this.runState,
            activeCheckpoint: this.activeCheckpoint,
            activeRespawnAnchor: this.activeRespawnAnchor,
            foundationAugment: playerState.foundationAugment,
            selectedAugmentIds: playerState.selectedAugmentIds,
            ropeConfig: this.ropeConfig,
            augmentRuntimeState: playerState.augmentRuntimeState,
            actionState: playerState.actionState,
            ropeShot: playerState.launcher,
            foundationReward: this.foundationRewards.get(player.id) ?? null,
            foundationRewards: Object.fromEntries(this.foundationRewards),
            metrics: this.metrics.snapshot(),
            worldProgress: this.worldProgress?.snapshot() ?? null,
            bossStage,
            bossRuntime: bossStage,
            windStates: this.windStateSnapshots(),
            accessScanStates: this.world.scannerGroups
                ? snapshotAccessScanStates(this.world.scannerGroups, this.elapsedSeconds)
                : Object.freeze([]),
            hardpointJammerStates: this.hardpointJammers.snapshot(),
            resets: this.resets,
            maxAttachDistance: hookReach(player.foundation.effectiveRopeConfig(this.ropeConfig))
        };
    }
}
