import {
    COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION,
    CompositeBossEncounterRuntime,
    compositeDistance,
    compositeLocalPoint,
    compositeWorldPoint,
    freezeComposite
} from "./CompositeBossEncounterRuntime.js";
import { KinematicPhysicsBody } from "../physics/KinematicPhysicsBody.js";
import { PHYSICS_ACTOR_KIND } from "../physics/PlayerPhysicsDefinition.js";
import { PolygonCollider } from "../physics/colliders/PolygonCollider.js";
import { bossBodyPolygonVertices } from "./BossBodyPolygon.js";
import { CombatStatusEffectPool } from "../status-effects/CombatStatusEffectPool.js";
import { selectNearestPositionTarget } from "../combat/CombatTargeting.js";
import { ContinuityWardenJumpMotion } from "./ContinuityWardenJumpMotion.js";
import { CONTINUITY_WARDEN_SUPPORT_KIND, ContinuityWardenSpatialQuery } from "./ContinuityWardenSpatialQuery.js";
import {
    CONTINUITY_WARDEN_LOCOMOTION_PRIORITY,
    createContinuityWardenStateCatalog
} from "./ContinuityWardenStateCatalog.js";
import { CONTINUITY_WARDEN_STATE_LANE, ContinuityWardenStatePool } from "./ContinuityWardenStatePool.js";
import { BOSS_ENEMY_SUMMON_EVENT, BossEnemySummonPattern } from "./BossEnemySummonPattern.js";
import {
    CONTINUITY_WARDEN_ACTION_PHASE as ACTION_PHASE,
    CONTINUITY_WARDEN_EVENT,
    CONTINUITY_WARDEN_GATE_SIZE,
    CONTINUITY_WARDEN_GATE_STATE,
    CONTINUITY_WARDEN_HAZARD,
    CONTINUITY_WARDEN_HUD_LABEL,
    CONTINUITY_WARDEN_ID,
    CONTINUITY_WARDEN_LOCOMOTION_STATE,
    CONTINUITY_WARDEN_OBJECT_KIND as OBJECT_KIND,
    CONTINUITY_WARDEN_PATTERN as PATTERN,
    CONTINUITY_WARDEN_PROJECTILE_PRESET_ID,
    CONTINUITY_WARDEN_REACTION_STATE,
    CONTINUITY_WARDEN_SECURITY_STAR_SIZE,
    CONTINUITY_WARDEN_SECURITY_STAR_STATE,
    CONTINUITY_WARDEN_SECTOR_ID as SECTOR_ID,
    CONTINUITY_WARDEN_SHUTTLE_CONTACT_ANCHOR,
    CONTINUITY_WARDEN_SHUTTLE_SIZE,
    CONTINUITY_WARDEN_SHUTTLE_STATE,
    CONTINUITY_WARDEN_STATE,
    CONTINUITY_WARDEN_SURFACE_KIND
} from "./ContinuityWardenDefinition.js";

export { CONTINUITY_WARDEN_STATE } from "./ContinuityWardenDefinition.js";
const INTENSITY = Object.freeze({ EARLY: "early", MID: "mid", LATE: "late" });
const PATTERN_WEIGHT = Object.freeze({
    [INTENSITY.EARLY]: Object.freeze({
        [PATTERN.BATON]: 1,
        [PATTERN.GROUND_DASH]: 1,
        [PATTERN.MISSILE]: 1,
        [PATTERN.SUMMON]: 1,
        [PATTERN.GUARD]: 1,
        [PATTERN.CHARGE]: 1,
        [PATTERN.SECURITY]: 1
    }),
    [INTENSITY.MID]: Object.freeze({
        [PATTERN.BATON]: 1,
        [PATTERN.DIAGONAL_DASH]: 1,
        [PATTERN.MISSILE]: 1,
        [PATTERN.SUMMON]: 1,
        [PATTERN.COUNTER]: 1,
        [PATTERN.BACK_SWING]: 1,
        [PATTERN.SECURITY]: 1,
        [PATTERN.CHARGE]: 1
    }),
    [INTENSITY.LATE]: Object.freeze({
        [PATTERN.MISSILE]: 2,
        [PATTERN.SECURITY]: 2,
        [PATTERN.SUMMON]: 1,
        [PATTERN.GROUND_DASH]: 1,
        [PATTERN.COUNTER]: 1,
        [PATTERN.BATON]: 1,
        [PATTERN.CHARGE]: 1
    })
});
const SECURITY_BAND = Object.freeze({ LOW: "low", HIGH: "high" });
const SECURITY_BEAM_CONTACT_ID_MARKER = ":pulse:";
const SECURITY_BEAM_TIME_EPSILON = 1e-9;
const SECURITY_BEAM_HAZARD_KIND = Object.freeze({
    [CONTINUITY_WARDEN_HAZARD.SECURITY_LOW]: true,
    [CONTINUITY_WARDEN_HAZARD.SECURITY_HIGH]: true
});
const MELEE_HAZARD_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.BATON_1]: true,
    [CONTINUITY_WARDEN_STATE.BATON_2]: true,
    [CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM]: true,
    [CONTINUITY_WARDEN_STATE.BACK_SWING]: true,
    [CONTINUITY_WARDEN_STATE.COUNTER_BASH]: true
});
const MOTION_HAZARD_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.GROUND_DASH]: true,
    [CONTINUITY_WARDEN_STATE.DIAGONAL_DASH]: true,
    [CONTINUITY_WARDEN_STATE.CHARGE]: true
});
const CAMERA_PRIORITY = Object.freeze({ BODY: 1, HAZARD: 5 });
const HUD_WARNING_BY_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.SECURITY_COMMAND]: CONTINUITY_WARDEN_HUD_LABEL.SECURITY_WARNING
});
const SECURITY_STAR_STATE_BY_WARDEN_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.SECURITY_COMMAND]: CONTINUITY_WARDEN_SECURITY_STAR_STATE.TELEGRAPH
});
const SECURITY_STAR_STATE_BY_ACTION_PHASE = Object.freeze({
    [ACTION_PHASE.ACTIVE]: CONTINUITY_WARDEN_SECURITY_STAR_STATE.ACTIVE,
    [ACTION_PHASE.GAP]: CONTINUITY_WARDEN_SECURITY_STAR_STATE.ENDING
});
const SECURITY_STAR_PROGRESS_DURATION = Object.freeze({
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.TELEGRAPH]: ({ securityTelegraphSeconds }) => securityTelegraphSeconds,
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.ENDING]: ({ beamGapSeconds }) => beamGapSeconds
});
const OPENING_DIALOGUE = Object.freeze([
    Object.freeze({
        speakerId: "continuity-warden",
        text: "Maintenance worker. Your evacuation clearance has been revoked."
    }),
    Object.freeze({ speakerId: "local-player", text: "I know." }),
    Object.freeze({ speakerId: "continuity-warden", text: "Then leave the pad." }),
    Object.freeze({ speakerId: "local-player", text: "Open the gate." })
]);
const TARGET_ID = CONTINUITY_WARDEN_ID.BODY;
const DEFAULT = Object.freeze({
    bodyWidth: 120,
    bodyHeight: 150,
    neutralSeconds: 0.55,
    meleeTelegraphSeconds: 0.6,
    meleeActiveSeconds: 0.35,
    meleeRecoverySeconds: 0.9,
    chargeTelegraphSeconds: 0.9,
    chargeSpeed: 900,
    chargeRecoverySeconds: 1.8,
    guardSeconds: 1.5,
    counterSeconds: 1.2,
    comboRange: 260,
    securityTelegraphSeconds: 1,
    beamSeconds: 3,
    beamPulseSeconds: 0.5,
    beamDamage: 20,
    beamGapSeconds: 0.3,
    securityRecoverySeconds: 0.8,
    victoryBatonDropSeconds: 0.35,
    victoryShieldFallSeconds: 0.35,
    victoryUnconsciousSeconds: 0.3,
    victorySecurityOffSeconds: 0.3,
    victoryGateLightSeconds: 0.3,
    victoryCameraSeconds: 2,
    damage: 25,
    groundDashDistance: 420,
    dashSeconds: 0.45,
    jumpGravity: 1500,
    jumpDurationSeconds: 0.95,
    jumpTelegraphSeconds: 0.4,
    landingActiveSeconds: 0.3,
    landingRecoverySeconds: 0.45,
    landingBurstRadius: 150,
    missileSpeed: 480,
    missileDamage: 20,
    missileRadius: 26,
    missileLifetimeSeconds: 5,
    missileTurnRateRadiansPerSecond: 1.75,
    missileFanAnglesDegrees: Object.freeze([-50, -25, 0, 25, 50]),
    walkSpeed: 240,
    trackingStopDistance: 220,
    locomotionLandingSeconds: 0.15,
    damagedReactionSeconds: 0.1,
    securityStarSize: CONTINUITY_WARDEN_SECURITY_STAR_SIZE
});
const STABLE_LOCOMOTION_STATE = Object.freeze({
    [CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED]: true,
    [CONTINUITY_WARDEN_LOCOMOTION_STATE.WALK]: true
});
const FRONT_BLOCKING_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.GUARD]: true,
    [CONTINUITY_WARDEN_STATE.COUNTER_READY]: true
});

function positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function point(value, fallback) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y) ? { x: value.x, y: value.y } : { ...fallback };
}

function bounds(value, fallback) {
    return Number.isFinite(value?.x) &&
        Number.isFinite(value?.y) &&
        positive(value.width, 0) &&
        positive(value.height, 0)
        ? { x: value.x, y: value.y, width: value.width, height: value.height }
        : { ...fallback };
}

function anchoredVisualCenter(position, size, anchor) {
    return {
        x: position.x + size.width * (0.5 - anchor.x),
        y: position.y + size.height * (0.5 - anchor.y)
    };
}

function securityStarState(wardenState, actionPhase) {
    if (wardenState === CONTINUITY_WARDEN_STATE.SECURITY_ACTIVE) {
        return SECURITY_STAR_STATE_BY_ACTION_PHASE[actionPhase] ?? CONTINUITY_WARDEN_SECURITY_STAR_STATE.ENDING;
    }
    return SECURITY_STAR_STATE_BY_WARDEN_STATE[wardenState] ?? CONTINUITY_WARDEN_SECURITY_STAR_STATE.IDLE;
}

function securityStarAnimationProgress(state, timer, config) {
    const durationResolver = SECURITY_STAR_PROGRESS_DURATION[state];
    if (!durationResolver) return 0;
    const duration = durationResolver(config);
    return Math.max(0, Math.min(1, 1 - timer / duration));
}

function gatePresentationState({ open, lit }) {
    if (open) return CONTINUITY_WARDEN_GATE_STATE.OPEN;
    if (lit) return CONTINUITY_WARDEN_GATE_STATE.LIGHT;
    return CONTINUITY_WARDEN_GATE_STATE.LOCKED;
}

function gateOpeningProgress({ stage, elapsed, offsets, open }) {
    if (open) return 1;
    if (stage !== "gate-light") return 0;
    return Math.min(1, Math.max(0, (elapsed - offsets.gateLightAt) / (offsets.gateOpenAt - offsets.gateLightAt)));
}

function finiteNumbers(value, fallback) {
    return Array.isArray(value) && value.length === fallback.length && value.every(Number.isFinite)
        ? Object.freeze([...value])
        : fallback;
}

function landingPosition(surface, bodyHeight) {
    return freezeComposite({
        x: surface.bounds.x + surface.bounds.width * 0.5,
        y: surface.bounds.y - bodyHeight * 0.5
    });
}

function translatedBounds(value, offset = { x: 0, y: 0 }) {
    return freezeComposite({
        x: value.x + offset.x,
        y: value.y + offset.y,
        width: value.width,
        height: value.height
    });
}

function collisionSurface(id, kind, value, offset, grappleable = true) {
    const translated = translatedBounds(value, offset);
    return freezeComposite({
        id,
        kind,
        collision: true,
        oneWay: false,
        grappleable,
        ropeOccluder: true,
        projectileOccluder: true,
        x: translated.x,
        y: translated.y,
        width: translated.width,
        height: translated.height,
        topY: translated.y,
        position: { x: translated.x + translated.width * 0.5, y: translated.y },
        vertices: [
            { x: translated.x, y: translated.y },
            { x: translated.x + translated.width, y: translated.y },
            { x: translated.x + translated.width, y: translated.y + translated.height },
            { x: translated.x, y: translated.y + translated.height }
        ]
    });
}

export class ContinuityWardenRuntime extends CompositeBossEncounterRuntime {
    constructor(definition, snapshot = null, { worldSeed = 1 } = {}) {
        super(definition);
        this.worldSeed = worldSeed;
        this.config = this.#configuration();
        this.summonPattern = new BossEnemySummonPattern({
            bossStageId: definition.id,
            sectorId: SECTOR_ID,
            ...this.config.summonPattern
        });
        this.spatialQuery = new ContinuityWardenSpatialQuery({ surfaces: definition.arena.surfaces });
        this.stateCatalog = createContinuityWardenStateCatalog();
        this.statePool = new ContinuityWardenStatePool({
            catalog: this.stateCatalog,
            worldSeed,
            attempt: this.attempt
        });
        this.scaledHealth = null;
        this.state = CONTINUITY_WARDEN_STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = 0;
        this.hazardSequence = 0;
        this.targetPlayerId = null;
        this.facing = -1;
        this.bodyPosition = { ...definition.arena.boss.position };
        this.motionStart = { ...this.bodyPosition };
        this.motionTarget = { ...this.bodyPosition };
        this.motionElapsed = 0;
        this.motionSeconds = 0;
        this.securitySequence = [];
        this.securityIndex = 0;
        this.boardingReadyPlayerIds = new Set();
        this.victoryCameraRemaining = 0;
        this.chainBonusPattern = null;
        this.missileSalvoSequence = 0;
        this.missileFiredThisJump = false;
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        this.locomotionTarget = null;
        this.locomotionLandingPending = false;
        this.locomotionTimer = 0;
        this.walkDistance = 0;
        this.reactionState = null;
        this.reactionTimer = 0;
        this.previousBodyPosition = { ...this.bodyPosition };
        this.jumpTarget = { ...this.bodyPosition };
        this.jumpMotion = new ContinuityWardenJumpMotion({
            position: this.bodyPosition,
            gravity: this.config.jumpGravity
        });
        this.statusEffects = new CombatStatusEffectPool();
        this.resetAttempt({ preserveCompleted: false });
        this.body = new KinematicPhysicsBody({
            id: TARGET_ID,
            actorKind: PHYSICS_ACTOR_KIND.BOSS,
            position: this.bodyPosition,
            collider: new PolygonCollider({
                vertices: bossBodyPolygonVertices(definition.arena.boss.visualPresetId, {
                    width: this.config.bodyWidth,
                    height: this.config.bodyHeight
                })
            }),
            canGroundActors: false
        });
        if (snapshot) this.restore(snapshot);
    }

    start({ participantIds }) {
        const outcome = super.start({ participantIds });
        if (outcome.accepted) {
            this.emit("boss-dialogue", { channel: "player-bark", lines: OPENING_DIALOGUE });
        }
        return outcome;
    }

    #configuration() {
        const parameters = this.definition.arena.mechanics?.[0]?.parameters ?? {};
        const surfaces = this.definition.arena.surfaces ?? [];
        const bodyWidth = positive(this.definition.arena.boss?.collider?.width, DEFAULT.bodyWidth);
        const bodyHeight = positive(this.definition.arena.boss?.collider?.height, DEFAULT.bodyHeight);
        const mainSurface = surfaces.find(({ kind }) => kind === CONTINUITY_WARDEN_SURFACE_KIND.MAIN);
        const mainBounds = bounds(mainSurface?.bounds, { x: 1000, y: -1100, width: 3120, height: 115 });
        const combatBounds = bounds(this.definition.arena.phaseZones?.[0]?.bounds, {
            x: mainBounds.x,
            y: mainBounds.y - 650,
            width: mainBounds.width,
            height: 870
        });
        const ledgeTargets = surfaces
            .filter(({ kind }) => kind === CONTINUITY_WARDEN_SURFACE_KIND.LEDGE)
            .map((surface) => landingPosition(surface, bodyHeight))
            .sort((left, right) => left.x - right.x);
        const gateBounds = bounds(parameters.gateBounds, { x: 4360, y: -1750, width: 480, height: 760 });
        const departureSurface = surfaces.find(({ kind }) => kind === CONTINUITY_WARDEN_SURFACE_KIND.DEPARTURE);
        const departureBounds = bounds(departureSurface?.bounds, {
            x: gateBounds.x,
            y: gateBounds.y + gateBounds.height,
            width: CONTINUITY_WARDEN_GATE_SIZE.width,
            height: 135
        });
        const boardingBounds = bounds(parameters.boardingBounds, { x: 4920, y: -1220, width: 360, height: 235 });
        const halfBodyWidth = bodyWidth * 0.5;
        const guardInset = positive(parameters.guardEdgeInset, 200);
        return freezeComposite({
            mainBounds,
            combatBounds,
            bodyWidth,
            bodyHeight,
            groundCenterY: mainBounds.y - bodyHeight * 0.5,
            combatMinX: mainBounds.x + halfBodyWidth,
            combatMaxX: mainBounds.x + mainBounds.width - halfBodyWidth,
            guardMinX: mainBounds.x + guardInset,
            guardMaxX: mainBounds.x + mainBounds.width - guardInset,
            ledgeTargets,
            lowBeamBounds: bounds(parameters.lowBeamBounds, { x: 980, y: -1200, width: 3160, height: 130 }),
            highBeamBounds: bounds(parameters.highBeamBounds, { x: 980, y: -1485, width: 3160, height: 270 }),
            gateBounds,
            departureBounds,
            bridgeBounds: bounds(parameters.bridgeBounds, { x: 4120, y: -1115, width: 240, height: 130 }),
            boardingBounds,
            shuttlePosition: point(parameters.shuttlePosition, {
                x: boardingBounds.x + boardingBounds.width * 0.5,
                y: gateBounds.y + gateBounds.height
            }),
            meleeTelegraphSeconds: positive(parameters.meleeTelegraphSeconds, DEFAULT.meleeTelegraphSeconds),
            meleeActiveSeconds: positive(parameters.meleeActiveSeconds, DEFAULT.meleeActiveSeconds),
            meleeRecoverySeconds: positive(parameters.meleeRecoverySeconds, DEFAULT.meleeRecoverySeconds),
            chargeTelegraphSeconds: positive(parameters.chargeTelegraphSeconds, DEFAULT.chargeTelegraphSeconds),
            chargeSpeed: positive(parameters.chargeSpeed, DEFAULT.chargeSpeed),
            chargeRecoverySeconds: positive(parameters.chargeRecoverySeconds, DEFAULT.chargeRecoverySeconds),
            guardSeconds: positive(parameters.guardSeconds, DEFAULT.guardSeconds),
            counterSeconds: positive(parameters.counterSeconds, DEFAULT.counterSeconds),
            comboRange: positive(parameters.comboRange, DEFAULT.comboRange),
            securityTelegraphSeconds: positive(parameters.securityTelegraphSeconds, DEFAULT.securityTelegraphSeconds),
            beamSeconds: positive(parameters.beamSeconds, DEFAULT.beamSeconds),
            beamPulseSeconds: positive(parameters.beamPulseSeconds, DEFAULT.beamPulseSeconds),
            beamDamage: positive(parameters.beamDamage, DEFAULT.beamDamage),
            beamGapSeconds: positive(parameters.beamGapSeconds, DEFAULT.beamGapSeconds),
            securityRecoverySeconds: positive(parameters.securityRecoverySeconds, DEFAULT.securityRecoverySeconds),
            walkSpeed: positive(parameters.walkSpeed, DEFAULT.walkSpeed),
            trackingStopDistance: positive(parameters.trackingStopDistance, DEFAULT.trackingStopDistance),
            victoryBatonDropSeconds: positive(parameters.victoryBatonDropSeconds, DEFAULT.victoryBatonDropSeconds),
            victoryShieldFallSeconds: positive(parameters.victoryShieldFallSeconds, DEFAULT.victoryShieldFallSeconds),
            victoryUnconsciousSeconds: positive(
                parameters.victoryUnconsciousSeconds,
                DEFAULT.victoryUnconsciousSeconds
            ),
            victorySecurityOffSeconds: positive(
                parameters.victorySecurityOffSeconds,
                DEFAULT.victorySecurityOffSeconds
            ),
            victoryGateLightSeconds: positive(parameters.victoryGateLightSeconds, DEFAULT.victoryGateLightSeconds),
            victoryCameraSeconds: positive(parameters.victoryCameraSeconds, DEFAULT.victoryCameraSeconds),
            damage: positive(parameters.damage, DEFAULT.damage),
            jumpGravity: positive(parameters.jumpGravity, DEFAULT.jumpGravity),
            jumpDurationSeconds: positive(parameters.jumpDurationSeconds, DEFAULT.jumpDurationSeconds),
            jumpTelegraphSeconds: positive(parameters.jumpTelegraphSeconds, DEFAULT.jumpTelegraphSeconds),
            landingActiveSeconds: positive(parameters.landingActiveSeconds, DEFAULT.landingActiveSeconds),
            landingRecoverySeconds: positive(parameters.landingRecoverySeconds, DEFAULT.landingRecoverySeconds),
            landingBurstRadius: positive(parameters.landingBurstRadius, DEFAULT.landingBurstRadius),
            missileSpeed: positive(parameters.missileSpeed, DEFAULT.missileSpeed),
            missileDamage: positive(parameters.missileDamage, DEFAULT.missileDamage),
            missileRadius: positive(parameters.missileRadius, DEFAULT.missileRadius),
            missileLifetimeSeconds: positive(parameters.missileLifetimeSeconds, DEFAULT.missileLifetimeSeconds),
            missileTurnRateRadiansPerSecond: positive(
                parameters.missileTurnRateRadiansPerSecond,
                DEFAULT.missileTurnRateRadiansPerSecond
            ),
            missileFanAnglesDegrees: finiteNumbers(parameters.missileFanAnglesDegrees, DEFAULT.missileFanAnglesDegrees),
            summonPattern: freezeComposite({
                count: parameters.minionSummonCount,
                cooldownSeconds: parameters.minionSummonCooldownSeconds,
                skipAliveCount: parameters.minionSummonSkipAliveCount,
                telegraphSeconds: parameters.minionSummonTelegraphSeconds,
                recoverySeconds: parameters.minionSummonRecoverySeconds,
                warningSize: parameters.minionSummonWarningSize,
                spawnPoints: [
                    point(parameters.summonLeft, {
                        x: mainBounds.x + mainBounds.width * 0.25,
                        y: mainBounds.y - 180
                    }),
                    point(parameters.summonRight, {
                        x: mainBounds.x + mainBounds.width * 0.75,
                        y: mainBounds.y - 180
                    })
                ]
            }),
            emitterLeft: point(parameters.emitterLeft, {
                x: mainBounds.x + DEFAULT.securityStarSize.width * 0.5,
                y: mainBounds.y - DEFAULT.securityStarSize.height * 0.5
            }),
            emitterRight: point(parameters.emitterRight, {
                x: mainBounds.x + mainBounds.width - DEFAULT.securityStarSize.width * 0.5,
                y: mainBounds.y - DEFAULT.securityStarSize.height * 0.5
            })
        });
    }

    maximumHealth() {
        return this.scaledHealth?.maxHealth ?? 0;
    }

    totalHealth() {
        return this.health;
    }

    resetAttempt({ preserveCompleted }) {
        const rosterCount = Math.max(1, this.scalingRoster.length || 1);
        this.scaledHealth = this.definition.scaledHealth(rosterCount);
        const completed = preserveCompleted && this.status === "completed";
        this.health = completed ? 0 : this.scaledHealth.maxHealth;
        this.state = completed ? CONTINUITY_WARDEN_STATE.DEFEATED : CONTINUITY_WARDEN_STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = completed ? 0 : DEFAULT.neutralSeconds;
        this.hazardSequence = 0;
        this.targetPlayerId = null;
        this.facing = -1;
        this.bodyPosition = { ...this.definition.arena.boss.position };
        this.motionStart = { ...this.bodyPosition };
        this.motionTarget = { ...this.bodyPosition };
        this.motionElapsed = 0;
        this.motionSeconds = 0;
        this.securitySequence = [];
        this.securityIndex = 0;
        this.boardingReadyPlayerIds = new Set();
        this.victoryCameraRemaining = 0;
        this.chainBonusPattern = null;
        this.missileSalvoSequence = 0;
        this.missileFiredThisJump = false;
        this.summonPattern.reset();
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        this.jumpTarget = { ...this.bodyPosition };
        this.locomotionTarget = null;
        this.locomotionLandingPending = false;
        this.locomotionTimer = 0;
        this.walkDistance = 0;
        this.reactionState = null;
        this.reactionTimer = 0;
        this.previousBodyPosition = { ...this.bodyPosition };
        this.statePool.resetAttempt({ attempt: this.attempt });
        this.jumpMotion?.cancel(this.bodyPosition);
        this.body?.setKinematicPosition(this.bodyPosition, 0);
        this.body?.holdKinematicPosition();
    }

    #localPlayers(context) {
        const offset = context.worldOffset ?? { x: 0, y: 0 };
        return (context.players ?? [])
            .map((player) => ({
                id: player.id ?? player.playerId,
                position: compositeLocalPoint(player.physics?.position ?? player.position, offset)
            }))
            .filter(
                ({ id, position }) =>
                    typeof id === "string" && Number.isFinite(position.x) && Number.isFinite(position.y)
            );
    }

    #combatPlayers(context) {
        const combat = this.config.combatBounds;
        return this.#localPlayers(context).filter(
            ({ id, position }) =>
                !this.recoveryProtected(id) &&
                position.x >= combat.x &&
                position.x <= combat.x + combat.width &&
                position.y >= combat.y &&
                position.y <= combat.y + combat.height
        );
    }

    #updateTarget(context) {
        const players = this.#combatPlayers(context);
        if (this.state !== CONTINUITY_WARDEN_STATE.NEUTRAL || context.canSelectTarget === false) {
            return players.find(({ id }) => id === this.targetPlayerId) ?? null;
        }
        const target = selectNearestPositionTarget(this.bodyPosition, players);
        if (!target) {
            this.targetPlayerId = null;
            return null;
        }
        this.targetPlayerId = target.id;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        return target;
    }

    #bodyFoot(position = this.bodyPosition) {
        return { x: position.x, y: position.y + this.config.bodyHeight * 0.5 };
    }

    #targetSupport(target) {
        if (!target) return null;
        const foot = { x: target.position.x, y: target.position.y + 15 };
        return (
            this.spatialQuery.currentSupport(foot, { tolerance: 24 }) ??
            this.spatialQuery.supportBelow(foot, { maxDistance: 520 })
        );
    }

    #spatialContext(target) {
        const foot = this.#bodyFoot();
        const previousFoot = this.#bodyFoot(this.previousBodyPosition);
        const inspected = this.spatialQuery.inspect(foot, { previousFoot });
        return Object.freeze({
            ...inspected,
            foot: Object.freeze(foot),
            previousFoot: Object.freeze(previousFoot),
            targetSupport: this.#targetSupport(target)
        });
    }

    #supportPosition(support, targetX) {
        const halfWidth = this.config.bodyWidth * 0.5;
        return {
            x: Math.max(support.minX + halfWidth, Math.min(support.maxX - halfWidth, targetX)),
            y: support.topY - this.config.bodyHeight * 0.5
        };
    }

    #moveHorizontally(targetX, support, dt) {
        const destination = this.#supportPosition(support, targetX);
        const delta = destination.x - this.bodyPosition.x;
        const step = Math.sign(delta) * Math.min(Math.abs(delta), this.config.walkSpeed * dt);
        this.bodyPosition = { x: this.bodyPosition.x + step, y: destination.y };
        this.walkDistance += Math.abs(step);
        this.body.setKinematicPosition(this.bodyPosition, dt);
        this.facing = delta === 0 ? this.facing : Math.sign(delta);
        return Math.abs(destination.x - this.bodyPosition.x) <= Number.EPSILON;
    }

    #nextJumpSupport(current, target) {
        if (!current || !target || current.id === target.id) return null;
        if (current.supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.GROUND) return target;
        const platforms = this.spatialQuery.supports
            .filter(({ supportKind }) => supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.PLATFORM)
            .sort((left, right) => left.minX - right.minX);
        const currentIndex = platforms.findIndex(({ id }) => id === current.id);
        const targetIndex = platforms.findIndex(({ id }) => id === target.id);
        if (currentIndex < 0 || targetIndex < 0) return target;
        return platforms[currentIndex + Math.sign(targetIndex - currentIndex)] ?? target;
    }

    canGround(spatial) {
        return Boolean(spatial.current && !this.locomotionLandingPending);
    }

    enterGrounded(spatial) {
        if (spatial.current) this.bodyPosition = this.#supportPosition(spatial.current, this.bodyPosition.x);
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        this.body.holdKinematicPosition();
    }

    advanceGrounded() {
        this.body.holdKinematicPosition();
    }

    canWalk(spatial, target) {
        if (!spatial.current || this.locomotionLandingPending) return false;
        if (!target) return false;
        if (spatial.targetSupport && spatial.targetSupport.id !== spatial.current.id) return false;
        return Math.abs(target.position.x - this.bodyPosition.x) > this.config.trackingStopDistance;
    }

    enterWalk() {
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.WALK;
    }

    advanceWalk(dt, _context, spatial, target) {
        if (!spatial.current || !target) return;
        this.#moveHorizontally(target.position.x, spatial.current, dt);
    }

    canJump(spatial) {
        if (this.jumpMotion.active) {
            return this.jumpMotion.phase === CONTINUITY_WARDEN_LOCOMOTION_STATE.JUMP;
        }
        return Boolean(
            spatial.current &&
            spatial.targetSupport &&
            spatial.targetSupport.id !== spatial.current.id &&
            spatial.targetSupport.supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.PLATFORM &&
            !this.locomotionLandingPending
        );
    }

    enterJump(spatial, target) {
        if (this.jumpMotion.active) return;
        const support = this.#nextJumpSupport(spatial.current, spatial.targetSupport);
        if (!support) return;
        const landing = this.#supportPosition(support, target?.position.x ?? this.bodyPosition.x);
        this.jumpMotion.begin({
            position: this.bodyPosition,
            target: landing,
            durationSeconds: this.config.jumpDurationSeconds
        });
        this.locomotionTarget = { ...landing };
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.JUMP;
    }

    #advanceLocomotionMotion(dt) {
        const wasActive = this.jumpMotion.active;
        this.jumpMotion.advance(dt);
        this.bodyPosition = { x: this.jumpMotion.position.x, y: this.jumpMotion.position.y };
        this.body.setKinematicPosition(this.bodyPosition, dt);
        if (wasActive && !this.jumpMotion.active) {
            this.locomotionLandingPending = true;
            this.locomotionTarget = null;
        }
    }

    advanceJump(dt) {
        this.#advanceLocomotionMotion(dt);
    }

    canDescend(spatial) {
        if (
            !spatial.current ||
            spatial.current.supportKind !== CONTINUITY_WARDEN_SUPPORT_KIND.PLATFORM ||
            this.jumpMotion.active ||
            this.locomotionLandingPending
        ) {
            return false;
        }
        return Boolean(
            spatial.targetSupport?.supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.GROUND ||
            (spatial.targetSupport && spatial.targetSupport.topY > spatial.current.topY)
        );
    }

    enterDescend(spatial, target) {
        const support = spatial.current;
        const centerX = (support.minX + support.maxX) * 0.5;
        const direction = (target?.position.x ?? this.bodyPosition.x) < centerX ? -1 : 1;
        const halfWidth = this.config.bodyWidth * 0.5;
        const edgeX = direction < 0 ? support.minX + halfWidth : support.maxX - halfWidth;
        const dropX = edgeX + direction * (halfWidth + 2);
        const ground = this.#mainSupport();
        this.locomotionTarget = ground ? { edgeX, ...this.#supportPosition(ground, dropX) } : null;
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.DESCEND;
    }

    advanceDescend(dt, _context, spatial) {
        if (!spatial.current || !this.locomotionTarget) return;
        const reached = this.#moveHorizontally(this.locomotionTarget.edgeX, spatial.current, dt);
        if (!reached) return;
        this.jumpMotion.beginDrop({ position: this.bodyPosition, target: this.locomotionTarget });
    }

    canFall(spatial) {
        return (
            (this.jumpMotion.active && this.jumpMotion.phase === CONTINUITY_WARDEN_LOCOMOTION_STATE.FALL) ||
            (!this.jumpMotion.active && !spatial.current && Boolean(spatial.below))
        );
    }

    enterFall(spatial) {
        if (!this.jumpMotion.active && spatial.below) {
            this.jumpMotion.beginDrop({
                position: this.bodyPosition,
                target: this.#supportPosition(spatial.below, this.bodyPosition.x)
            });
        }
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.FALL;
    }

    advanceFall(dt) {
        this.#advanceLocomotionMotion(dt);
    }

    canLand(spatial) {
        return Boolean(this.locomotionLandingPending || spatial.landing);
    }

    enterLanding(spatial) {
        const support = spatial.landing?.support ?? spatial.current;
        if (support) {
            this.bodyPosition = this.#supportPosition(support, spatial.landing?.foot.x ?? this.bodyPosition.x);
            this.jumpMotion.cancel(this.bodyPosition);
            this.body.setKinematicPosition(this.bodyPosition, 0);
        }
        this.locomotionLandingPending = true;
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.LANDING;
        this.locomotionTimer = DEFAULT.locomotionLandingSeconds;
        this.body.holdKinematicPosition();
    }

    advanceLocomotionLanding(dt) {
        this.locomotionTimer = Math.max(0, this.locomotionTimer - dt);
        if (this.locomotionTimer <= 0) this.locomotionLandingPending = false;
    }

    enterDamagedReaction() {
        this.reactionState = CONTINUITY_WARDEN_REACTION_STATE.DAMAGED;
        this.reactionTimer = DEFAULT.damagedReactionSeconds;
    }

    advanceDamagedReaction(dt) {
        this.reactionTimer = Math.max(0, this.reactionTimer - dt);
        if (this.reactionTimer <= 0) this.reactionState = null;
    }

    #advanceNeutralLocomotion(dt, context, target, spatial) {
        const stateContext = { runtime: this, dt, context, spatial, target };
        const nextState = CONTINUITY_WARDEN_LOCOMOTION_PRIORITY.find((stateId) =>
            this.statePool.canEnter(stateId, stateContext)
        );
        if (!nextState) return;
        if (nextState !== this.locomotionState) {
            if (this.stateCatalog[this.locomotionState]) this.statePool.exit(this.locomotionState, stateContext);
            this.locomotionState = nextState;
            this.statePool.enter(nextState, stateContext);
        }
        this.statePool.advance(this.locomotionState, stateContext);
    }

    #intensity() {
        const ratio = this.maximumHealth() > 0 ? this.health / this.maximumHealth() : 0;
        if (ratio > 0.67) return INTENSITY.EARLY;
        if (ratio > 0.34) return INTENSITY.MID;
        return INTENSITY.LATE;
    }

    patternWeight(pattern) {
        return PATTERN_WEIGHT[this.#intensity()][pattern] ?? 0;
    }

    #guardPositionAvailable() {
        return this.bodyPosition.x >= this.config.guardMinX && this.bodyPosition.x <= this.config.guardMaxX;
    }

    #summonPatternAvailable(context) {
        const aliveCount = Number.isSafeInteger(context.bossSummonedEnemyCount) ? context.bossSummonedEnemyCount : 0;
        return this.summonPattern.canSummon(aliveCount);
    }

    canBaton(target) {
        return Boolean(target);
    }

    canBackSwing(target) {
        return Boolean(target);
    }

    #mainSupport() {
        return this.spatialQuery.supports.find(
            ({ supportKind }) => supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.GROUND
        );
    }

    canGroundDash(spatial) {
        return spatial.current?.supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.GROUND;
    }

    canDiagonalDash() {
        return this.config.ledgeTargets.length > 0;
    }

    canCharge(spatial) {
        return spatial.current?.supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.GROUND;
    }

    canMissile() {
        return this.config.ledgeTargets.length > 0;
    }

    canSummon(context) {
        return this.#summonPatternAvailable(context);
    }

    canGuard() {
        return this.#guardPositionAvailable();
    }

    canCounter() {
        return this.#guardPositionAvailable();
    }

    canSecurity() {
        return true;
    }

    #beginNextPattern(context, target = this.#updateTarget(context), spatial = this.#spatialContext(target)) {
        if (!target) {
            this._beginNeutral();
            return;
        }
        if (
            !spatial.current ||
            this.jumpMotion.active ||
            this.locomotionLandingPending ||
            STABLE_LOCOMOTION_STATE[this.locomotionState] !== true
        ) {
            return;
        }
        const selected = this.statePool.select({
            lane: CONTINUITY_WARDEN_STATE_LANE.ATTACK,
            context: { runtime: this, context, target, spatial },
            chainStateId: this.chainBonusPattern
        });
        this.chainBonusPattern = null;
        if (!selected) {
            this._beginNeutral();
            return;
        }
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        this.body.holdKinematicPosition();
        selected.definition.enter({ runtime: this, context, target, spatial });
    }

    #endWithChain(recoverySeconds, followupPattern) {
        this.chainBonusPattern = this.#intensity() === INTENSITY.EARLY ? null : (followupPattern ?? null);
        this._beginNeutral(recoverySeconds);
    }

    _beginNeutral(seconds = DEFAULT.neutralSeconds) {
        this.state = CONTINUITY_WARDEN_STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = seconds;
        this.motionElapsed = 0;
        this.motionSeconds = 0;
        this.body.holdKinematicPosition();
    }

    _beginBaton(target) {
        this.state = CONTINUITY_WARDEN_STATE.BATON_1;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.meleeTelegraphSeconds;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        this.emit("boss-attack-telegraphed", { kind: this.state, targetPlayerId: target.id });
    }

    _beginBackSwing(target) {
        this.state = CONTINUITY_WARDEN_STATE.BACK_SWING;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.meleeTelegraphSeconds;
        this.facing = target.position.x < this.bodyPosition.x ? 1 : -1;
        this.emit("boss-attack-telegraphed", { kind: this.state, targetPlayerId: target.id });
    }

    #setMotion(target, seconds) {
        this.motionStart = { ...this.bodyPosition };
        this.motionTarget = { ...target };
        this.motionElapsed = 0;
        this.motionSeconds = positive(seconds, DEFAULT.dashSeconds);
    }

    _beginGroundDash(target) {
        this.state = CONTINUITY_WARDEN_STATE.GROUND_DASH;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.meleeTelegraphSeconds;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        const x = Math.max(
            this.config.combatMinX,
            Math.min(this.config.combatMaxX, this.bodyPosition.x + this.facing * DEFAULT.groundDashDistance)
        );
        this.#setMotion({ x, y: this.config.groundCenterY }, DEFAULT.dashSeconds);
        this.emit("boss-attack-telegraphed", { kind: this.state, targetPlayerId: target.id, direction: this.facing });
    }

    _beginDiagonalDash(target, spatial) {
        this.state = CONTINUITY_WARDEN_STATE.DIAGONAL_DASH;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.meleeTelegraphSeconds;
        const onLedge = spatial.current?.supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.PLATFORM;
        const closestLedge = this.config.ledgeTargets.reduce(
            (closest, candidate) =>
                !closest || Math.abs(candidate.x - target.position.x) < Math.abs(closest.x - target.position.x)
                    ? candidate
                    : closest,
            null
        );
        const targetPosition = onLedge
            ? {
                  x: Math.max(this.config.combatMinX, Math.min(this.config.combatMaxX, target.position.x)),
                  y: this.config.groundCenterY
              }
            : (closestLedge ?? {
                  x: Math.max(this.config.combatMinX, Math.min(this.config.combatMaxX, target.position.x)),
                  y: this.config.groundCenterY
              });
        this.facing = targetPosition.x < this.bodyPosition.x ? -1 : 1;
        this.#setMotion(targetPosition, DEFAULT.dashSeconds);
        this.emit("boss-attack-telegraphed", { kind: this.state, targetPlayerId: target.id, target: targetPosition });
    }

    _beginCharge(target) {
        this.state = CONTINUITY_WARDEN_STATE.CHARGE;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.chargeTelegraphSeconds;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        const targetX = this.facing < 0 ? this.config.combatMinX : this.config.combatMaxX;
        const distance = Math.abs(targetX - this.bodyPosition.x);
        this.#setMotion({ x: targetX, y: this.config.groundCenterY }, distance / this.config.chargeSpeed);
        this.emit("boss-attack-telegraphed", {
            kind: this.state,
            targetPlayerId: target.id,
            direction: this.facing,
            targetX
        });
    }

    #jumpLandingTarget(target, spatial) {
        const onGround = spatial.current?.supportKind === CONTINUITY_WARDEN_SUPPORT_KIND.GROUND;
        if (onGround && this.config.ledgeTargets.length > 0) {
            return this.config.ledgeTargets.reduce((closest, candidate) =>
                !closest || Math.abs(candidate.x - target.position.x) < Math.abs(closest.x - target.position.x)
                    ? candidate
                    : closest
            );
        }
        const landingOffset = target.position.x < this.bodyPosition.x ? 140 : -140;
        return freezeComposite({
            x: Math.max(this.config.combatMinX, Math.min(this.config.combatMaxX, target.position.x + landingOffset)),
            y: this.config.groundCenterY
        });
    }

    _beginJumpMissile(target, spatial) {
        this.state = CONTINUITY_WARDEN_STATE.JUMP;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.jumpTelegraphSeconds;
        this.targetPlayerId = target.id;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        this.jumpTarget = { ...this.#jumpLandingTarget(target, spatial) };
        this.missileFiredThisJump = false;
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.TAKEOFF;
        this.emit("boss-attack-telegraphed", {
            kind: CONTINUITY_WARDEN_STATE.MISSILE,
            targetPlayerId: target.id,
            missileCount: this.config.missileFanAnglesDegrees.length,
            target: this.jumpTarget
        });
    }

    #fireMissileSalvo(context) {
        const target = this.#combatPlayers(context).find(({ id }) => id === this.targetPlayerId);
        if (!target) {
            if (context.canSelectTarget === false) this.missileFiredThisJump = true;
            return false;
        }
        const origin = compositeWorldPoint(
            { x: this.bodyPosition.x, y: this.bodyPosition.y - this.config.bodyHeight * 0.2 },
            context.worldOffset ?? { x: 0, y: 0 }
        );
        const targetPosition = compositeWorldPoint(target.position, context.worldOffset ?? { x: 0, y: 0 });
        const baseAngle = Math.atan2(targetPosition.y - origin.y, targetPosition.x - origin.x);
        this.missileSalvoSequence += 1;
        for (const [index, degrees] of this.config.missileFanAnglesDegrees.entries()) {
            const angle = baseAngle + (degrees * Math.PI) / 180;
            const velocity = {
                x: Math.cos(angle) * this.config.missileSpeed,
                y: Math.sin(angle) * this.config.missileSpeed
            };
            this.emit(CONTINUITY_WARDEN_EVENT.MISSILE_FIRED, {
                projectileId: CONTINUITY_WARDEN_ID.MISSILE(this.attempt, this.missileSalvoSequence, index),
                ownerId: CONTINUITY_WARDEN_ID.MISSILE_OWNER,
                targetPlayerId: target.id,
                position: origin,
                velocity,
                speed: this.config.missileSpeed,
                damage: this.config.missileDamage,
                radius: this.config.missileRadius,
                lifetimeSeconds: this.config.missileLifetimeSeconds,
                turnRateRadiansPerSecond: this.config.missileTurnRateRadiansPerSecond,
                visualPresetId: CONTINUITY_WARDEN_PROJECTILE_PRESET_ID,
                fanIndex: index,
                fanAngleDegrees: degrees
            });
        }
        this.missileFiredThisJump = true;
        return true;
    }

    _advanceJumpMissile(dt, context = {}) {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.actionPhase = ACTION_PHASE.ACTIVE;
            this.timer = this.config.jumpDurationSeconds;
            this.jumpMotion.begin({
                position: this.bodyPosition,
                target: this.jumpTarget,
                durationSeconds: this.config.jumpDurationSeconds
            });
            this.locomotionState = this.jumpMotion.phase;
            this.emit("boss-attack-started", {
                kind: CONTINUITY_WARDEN_STATE.MISSILE,
                targetPlayerId: this.targetPlayerId,
                missileCount: this.config.missileFanAnglesDegrees.length
            });
            return;
        }
        const wasActive = this.jumpMotion.active;
        this.jumpMotion.advance(dt);
        this.bodyPosition = { x: this.jumpMotion.position.x, y: this.jumpMotion.position.y };
        this.body.setKinematicPosition(this.bodyPosition, dt);
        this.locomotionState = this.jumpMotion.phase;
        if (!this.missileFiredThisJump && this.locomotionState === CONTINUITY_WARDEN_LOCOMOTION_STATE.FALL) {
            this.#fireMissileSalvo(context);
        }
        if (!wasActive || this.jumpMotion.active) {
            if (this.jumpMotion.active) this.timer = Math.max(this.timer, Number.EPSILON);
            return;
        }
        this.state = CONTINUITY_WARDEN_STATE.LANDING;
        this.actionPhase = ACTION_PHASE.ACTIVE;
        this.timer = this.config.landingActiveSeconds;
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.LANDING;
        this.hazardSequence += 1;
        this.emit("boss-attack-started", {
            kind: CONTINUITY_WARDEN_HAZARD.LANDING_BURST,
            sequence: this.hazardSequence
        });
    }

    _advanceLanding() {
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        this._beginNeutral(this.config.landingRecoverySeconds);
    }

    _beginSummon(target) {
        this.state = CONTINUITY_WARDEN_STATE.SUMMON;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.summonPattern.telegraphSeconds;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        this.emit("boss-attack-telegraphed", {
            kind: CONTINUITY_WARDEN_STATE.SUMMON,
            targetPlayerId: target.id,
            summonCount: this.summonPattern.count
        });
    }

    _advanceSummon(dt, context = {}) {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.timer = Math.max(0, this.timer - dt);
            if (this.timer > 0) return;
        }
        if (!this.#summonPatternAvailable(context)) {
            this._beginNeutral();
            return;
        }
        this.actionPhase = ACTION_PHASE.ACTIVE;
        const wave = this.summonPattern.summon({
            attempt: this.attempt,
            worldOffset: context.worldOffset ?? { x: 0, y: 0 }
        });
        this.emit("boss-attack-started", {
            kind: CONTINUITY_WARDEN_STATE.SUMMON,
            sequence: wave.sequence,
            summonCount: this.summonPattern.count
        });
        for (const request of wave.requests) this.emit(BOSS_ENEMY_SUMMON_EVENT.ENEMY_SUMMONED, request);
        this._beginNeutral(this.summonPattern.recoverySeconds);
    }

    _beginGuard(target) {
        this.state = CONTINUITY_WARDEN_STATE.GUARD;
        this.actionPhase = ACTION_PHASE.ACTIVE;
        this.timer = this.config.guardSeconds;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        this.emit("boss-guard-started", { targetPlayerId: target.id, direction: this.facing });
    }

    _beginCounter(target) {
        this.state = CONTINUITY_WARDEN_STATE.COUNTER_READY;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.counterSeconds;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        this.emit("boss-counter-ready", { targetPlayerId: target.id, direction: this.facing });
    }

    #securityBands() {
        const intensity = this.#intensity();
        const alternate = this.statePool.selectionSequence % 2;
        if (intensity === INTENSITY.EARLY) return [alternate ? SECURITY_BAND.LOW : SECURITY_BAND.HIGH];
        if (intensity === INTENSITY.MID) {
            return alternate ? [SECURITY_BAND.LOW, SECURITY_BAND.HIGH] : [SECURITY_BAND.HIGH, SECURITY_BAND.LOW];
        }
        return alternate
            ? [SECURITY_BAND.LOW, SECURITY_BAND.HIGH, SECURITY_BAND.LOW]
            : [SECURITY_BAND.HIGH, SECURITY_BAND.LOW, SECURITY_BAND.HIGH];
    }

    _beginSecurity() {
        this.state = CONTINUITY_WARDEN_STATE.SECURITY_COMMAND;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.securityTelegraphSeconds;
        this.securitySequence = this.#securityBands();
        this.securityIndex = 0;
        this.emit("boss-attack-telegraphed", { kind: "security-sequence", sequence: this.securitySequence });
    }

    #activateAttack() {
        this.actionPhase = ACTION_PHASE.ACTIVE;
        this.timer = this.config.meleeActiveSeconds;
        this.hazardSequence += 1;
        this.emit("boss-attack-started", { kind: this.state, sequence: this.hazardSequence });
    }

    #comboTargetInRange(context) {
        const target = this.#combatPlayers(context).find(({ id }) => id === this.targetPlayerId);
        if (!target) return context.canSelectTarget === false;
        return compositeDistance(target.position, this.bodyPosition) <= this.config.comboRange;
    }

    advanceBatonState(dt, context = {}, nextState = null) {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.#activateAttack();
            return;
        }
        if (this.actionPhase !== ACTION_PHASE.ACTIVE) {
            this._beginNeutral();
            return;
        }
        if (!nextState || !this.#comboTargetInRange(context)) {
            this._beginNeutral(this.config.meleeRecoverySeconds);
            return;
        }
        this.state = nextState;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.meleeTelegraphSeconds * 0.65;
        this.emit("boss-attack-telegraphed", { kind: this.state, targetPlayerId: this.targetPlayerId });
    }

    _advanceSingleAttack() {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.#activateAttack();
            return;
        }
        this._beginNeutral(this.config.meleeRecoverySeconds);
    }

    #advanceMotion(dt) {
        this.motionElapsed = Math.min(this.motionSeconds, this.motionElapsed + dt);
        const progress = this.motionSeconds > 0 ? this.motionElapsed / this.motionSeconds : 1;
        this.bodyPosition = {
            x: this.motionStart.x + (this.motionTarget.x - this.motionStart.x) * progress,
            y: this.motionStart.y + (this.motionTarget.y - this.motionStart.y) * progress
        };
        this.body.setKinematicPosition(this.bodyPosition, dt);
    }

    _advanceMotionAttack(dt) {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.actionPhase = ACTION_PHASE.ACTIVE;
            this.timer = this.motionSeconds;
            this.hazardSequence += 1;
            this.emit("boss-attack-started", { kind: this.state, sequence: this.hazardSequence });
            return;
        }
        if (this.actionPhase === ACTION_PHASE.ACTIVE && this.motionElapsed < this.motionSeconds) {
            this.#advanceMotion(dt);
            if (this.motionElapsed < this.motionSeconds) this.timer = Math.max(this.timer, Number.EPSILON);
            return;
        }
        this.bodyPosition = { ...this.motionTarget };
        this.body.setKinematicPosition(this.bodyPosition, dt);
        this.#endWithChain(this.config.meleeRecoverySeconds, PATTERN.BATON);
    }

    _advanceCharge(dt) {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.actionPhase = ACTION_PHASE.ACTIVE;
            this.timer = this.motionSeconds;
            this.hazardSequence += 1;
            this.emit("boss-attack-started", {
                kind: this.state,
                sequence: this.hazardSequence,
                direction: this.facing
            });
            return;
        }
        if (this.actionPhase === ACTION_PHASE.ACTIVE && this.motionElapsed < this.motionSeconds) {
            this.#advanceMotion(dt);
            if (this.motionElapsed < this.motionSeconds) this.timer = Math.max(this.timer, Number.EPSILON);
            return;
        }
        this.bodyPosition = { ...this.motionTarget };
        this.body.setKinematicPosition(this.bodyPosition, dt);
        this._beginNeutral(this.#chargeRecoverySeconds());
    }

    #chargeRecoverySeconds() {
        const intensity = this.#intensity();
        const scale = intensity === INTENSITY.LATE ? 0.65 : intensity === INTENSITY.MID ? 0.85 : 1;
        return this.config.chargeRecoverySeconds * scale;
    }

    _advanceGuard() {
        this.emit("boss-guard-ended", {});
        this._beginNeutral();
    }

    _advanceCounter() {
        this.emit("boss-counter-ended", {});
        this._beginNeutral();
    }

    activateSecurityBand() {
        this.state = CONTINUITY_WARDEN_STATE.SECURITY_ACTIVE;
        this.actionPhase = ACTION_PHASE.ACTIVE;
        this.timer = this.config.beamSeconds;
        this.hazardSequence += 1;
        this.emit("boss-attack-started", {
            kind: `security-beam-${this.securitySequence[this.securityIndex]}`,
            sequence: this.hazardSequence,
            index: this.securityIndex
        });
    }

    advanceSecurityCommand() {
        this.activateSecurityBand();
    }

    advanceSecurityActive() {
        if (this.actionPhase === ACTION_PHASE.ACTIVE) {
            const finishedBand = this.securitySequence[this.securityIndex];
            this.securityIndex += 1;
            if (this.securityIndex >= this.securitySequence.length) {
                const followup = finishedBand === SECURITY_BAND.HIGH ? PATTERN.GROUND_DASH : PATTERN.CHARGE;
                this.#endWithChain(this.config.securityRecoverySeconds, followup);
                return;
            }
            this.actionPhase = ACTION_PHASE.GAP;
            this.timer = this.config.beamGapSeconds;
            return;
        }
        this.activateSecurityBand();
    }

    advance(dt, context = {}) {
        if (!Number.isFinite(dt) || dt <= 0) {
            return freezeComposite({ accepted: this.status === "active", changed: false });
        }
        if (this.status === "completed") {
            this.victoryCameraRemaining = Math.max(0, this.victoryCameraRemaining - dt);
            this.body.holdKinematicPosition();
            return freezeComposite({ accepted: true, changed: this.victoryCameraRemaining > 0 });
        }
        if (this.status !== "active") return freezeComposite({ accepted: false, changed: false });
        this.previousBodyPosition = { ...this.bodyPosition };
        this.summonPattern.advance(dt);
        if (this.reactionState) {
            this.statePool.advance(this.reactionState, { runtime: this, dt, context });
        }
        for (const outcome of this.statusEffects.advance(dt)) {
            if (outcome.type === "damage") this.health = Math.max(0, this.health - outcome.damage);
        }
        if (!this.statusEffects.canAct()) {
            this.body.holdKinematicPosition();
            return freezeComposite({ accepted: true, changed: true });
        }
        const target = this.#updateTarget(context);
        const locomotionSpatial = this.state === CONTINUITY_WARDEN_STATE.NEUTRAL ? this.#spatialContext(target) : null;
        if (this.state === CONTINUITY_WARDEN_STATE.NEUTRAL) {
            this.#advanceNeutralLocomotion(dt, context, target, locomotionSpatial);
        }
        this.timer = Math.max(0, this.timer - dt);
        const stateContext = {
            runtime: this,
            dt,
            context,
            target,
            spatial: locomotionSpatial
        };
        if (
            this.state === CONTINUITY_WARDEN_STATE.JUMP &&
            this.actionPhase === ACTION_PHASE.ACTIVE &&
            this.jumpMotion.active
        ) {
            this.statePool.advance(this.state, stateContext);
        } else if (this.actionPhase === ACTION_PHASE.ACTIVE && this.motionElapsed < this.motionSeconds) {
            this.statePool.advance(this.state, stateContext);
        }
        if (this.timer > 0) return freezeComposite({ accepted: true, changed: true });
        if (this.state === CONTINUITY_WARDEN_STATE.NEUTRAL) {
            this.#beginNextPattern(context, target, this.#spatialContext(target));
        } else {
            if (!this.stateCatalog[this.state]) throw new Error(`Unsupported Warden state: ${this.state}`);
            this.statePool.advance(this.state, stateContext);
        }
        return freezeComposite({ accepted: true, changed: true });
    }

    #impactFromFront(impactPosition) {
        if (!Number.isFinite(impactPosition?.x)) return true;
        return (impactPosition.x - this.bodyPosition.x) * this.facing >= 0;
    }

    #victoryOffsets() {
        const c = this.config;
        const batonDropAt = 0;
        const shieldFallAt = batonDropAt + c.victoryBatonDropSeconds;
        const unconsciousAt = shieldFallAt + c.victoryShieldFallSeconds;
        const securityOffAt = unconsciousAt + c.victoryUnconsciousSeconds;
        const gateLightAt = securityOffAt + c.victorySecurityOffSeconds;
        const gateOpenAt = gateLightAt + c.victoryGateLightSeconds;
        const cameraPanSeconds = Math.max(0.4, c.victoryCameraSeconds);
        const shuttleRevealAt = gateOpenAt + Math.max(0, cameraPanSeconds - 0.4);
        const playerControlAt = gateOpenAt + cameraPanSeconds;
        return {
            batonDropAt,
            shieldFallAt,
            unconsciousAt,
            securityOffAt,
            gateLightAt,
            gateOpenAt,
            shuttleRevealAt,
            playerControlAt
        };
    }

    #victoryElapsed() {
        const { playerControlAt } = this.#victoryOffsets();
        return Math.max(0, playerControlAt - this.victoryCameraRemaining);
    }

    #victoryStage() {
        if (this.status !== "completed") return null;
        const offsets = this.#victoryOffsets();
        const elapsed = this.#victoryElapsed();
        if (elapsed < offsets.shieldFallAt) return "baton-drop";
        if (elapsed < offsets.unconsciousAt) return "shield-fall";
        if (elapsed < offsets.securityOffAt) return "unconscious";
        if (elapsed < offsets.gateLightAt) return "security-off";
        if (elapsed < offsets.gateOpenAt) return "gate-light";
        if (elapsed < offsets.shuttleRevealAt) return "gate-open";
        if (elapsed < offsets.playerControlAt) return "shuttle-reveal";
        return "player-control";
    }

    #beginCounterBash() {
        this.state = CONTINUITY_WARDEN_STATE.COUNTER_BASH;
        this.actionPhase = ACTION_PHASE.ACTIVE;
        this.timer = this.config.meleeActiveSeconds;
        this.hazardSequence += 1;
        this.emit("boss-attack-started", { kind: this.state, sequence: this.hazardSequence });
    }

    applyImpact({ impactId, sourcePlayerId = null, baseDamage, targetId = null, impactPosition = null }) {
        if (this.status !== "active") {
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "encounter-not-active",
                appliedDamage: 0
            });
        }
        if (sourcePlayerId && this.participants.get(sourcePlayerId) !== "active") {
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "participant-not-active",
                appliedDamage: 0
            });
        }
        if (typeof impactId !== "string" || !Number.isFinite(baseDamage) || baseDamage < 0) {
            throw new Error("Boss06 impact is invalid");
        }
        if (this.processedImpactIds.has(impactId)) {
            return freezeComposite({
                accepted: true,
                changed: false,
                reason: "impact-already-processed",
                appliedDamage: 0
            });
        }
        this.processedImpactIds.add(impactId);
        if (targetId !== TARGET_ID) {
            return freezeComposite({ accepted: true, changed: false, reason: "target-mismatch", appliedDamage: 0 });
        }
        const front = this.#impactFromFront(impactPosition);
        if (front && this.state === CONTINUITY_WARDEN_STATE.GUARD) {
            this.emit("boss-guard-blocked", { impactId, sourcePlayerId, direction: this.facing });
            return freezeComposite({
                accepted: true,
                changed: false,
                reason: "guard-blocked",
                appliedDamage: 0,
                normalDamage: 0
            });
        }
        if (front && this.state === CONTINUITY_WARDEN_STATE.COUNTER_READY) {
            this.#beginCounterBash();
            this.emit("boss-counter-triggered", { impactId, sourcePlayerId, direction: this.facing });
            return freezeComposite({
                accepted: true,
                changed: true,
                reason: "counter-bash",
                appliedDamage: 0,
                normalDamage: 0
            });
        }
        const appliedDamage = Math.min(this.health, baseDamage);
        this.health -= appliedDamage;
        if (appliedDamage > 0) {
            this.statePool.enter(CONTINUITY_WARDEN_REACTION_STATE.DAMAGED, { runtime: this });
            this.emit("boss-damaged", {
                impactId,
                sourcePlayerId,
                targetId,
                damage: appliedDamage,
                health: this.health,
                flank: !front
            });
        }
        const completed = this.health <= 0;
        if (completed) {
            this.status = "completed";
            this.state = CONTINUITY_WARDEN_STATE.DEFEATED;
            this.actionPhase = ACTION_PHASE.RECOVERY;
            this.timer = 0;
            this.securitySequence = [];
            this.jumpMotion.cancel(this.bodyPosition);
            this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
            this.reactionState = null;
            this.reactionTimer = 0;
            this.victoryCameraRemaining = this.#victoryOffsets().playerControlAt;
            this.body.holdKinematicPosition();
            this.statePool.enter(CONTINUITY_WARDEN_STATE.DEFEATED, { runtime: this });
            this.emit("boss-encounter-completed", { targetId, sourcePlayerId });
        }
        return freezeComposite({
            accepted: true,
            changed: appliedDamage > 0,
            appliedDamage,
            normalDamage: appliedDamage,
            weakpointHit: false,
            completed
        });
    }

    applyDamage({ sourcePlayerId = null, damage, impactId = null, targetId = TARGET_ID, impactPosition = null }) {
        return this.applyImpact({
            impactId: impactId ?? `${this.definition.id}:impact:${this.eventSequence + 1}`,
            sourcePlayerId,
            baseDamage: damage,
            targetId,
            impactPosition
        });
    }

    impactTargetSnapshot(targetId, worldOffset = { x: 0, y: 0 }) {
        const snapshot = freezeComposite({
            id: targetId,
            impactTargetKind: "boss",
            active: this.status === "active" && targetId === TARGET_ID,
            position: compositeWorldPoint(this.bodyPosition, worldOffset),
            health: this.health,
            maxHealth: this.maximumHealth(),
            phase: 1,
            phaseCount: 1,
            phaseFloor: 0,
            phaseMaxHealth: this.maximumHealth(),
            weakpointExposed: false,
            normalDamageMultiplier: 1,
            weakpointDamageRatio: 0,
            blocksFrontImpact: FRONT_BLOCKING_STATE[this.state] === true,
            direction: this.facing
        });
        return Object.freeze({ ...snapshot, collider: this.body.collider.snapshot() });
    }

    #bodyHazardBounds() {
        return {
            x: this.bodyPosition.x - this.config.bodyWidth * 0.5,
            y: this.bodyPosition.y - this.config.bodyHeight * 0.5,
            width: this.config.bodyWidth,
            height: this.config.bodyHeight
        };
    }

    #motionPathHazardBounds() {
        const halfWidth = this.config.bodyWidth * 0.5;
        const halfHeight = this.config.bodyHeight * 0.5;
        const minX = Math.min(this.motionStart.x, this.motionTarget.x) - halfWidth;
        const minY = Math.min(this.motionStart.y, this.motionTarget.y) - halfHeight;
        return {
            x: minX,
            y: minY,
            width: Math.abs(this.motionTarget.x - this.motionStart.x) + this.config.bodyWidth,
            height: Math.abs(this.motionTarget.y - this.motionStart.y) + this.config.bodyHeight
        };
    }

    #currentHazardDefinition() {
        if (this.state === CONTINUITY_WARDEN_STATE.LANDING) {
            const diameter = this.config.landingBurstRadius * 2;
            return {
                kind: CONTINUITY_WARDEN_HAZARD.LANDING_BURST,
                bounds: {
                    x: this.bodyPosition.x - this.config.landingBurstRadius,
                    y: this.bodyPosition.y - this.config.landingBurstRadius,
                    width: diameter,
                    height: diameter
                },
                bodyContact: false
            };
        }
        if (MELEE_HAZARD_STATE[this.state] === true) {
            return { kind: this.state, bounds: this.#meleeHazardBounds(), bodyContact: false };
        }
        if (MOTION_HAZARD_STATE[this.state] === true) {
            return { kind: this.state, bounds: this.#bodyHazardBounds(), bodyContact: true };
        }
        if (this.state !== CONTINUITY_WARDEN_STATE.SECURITY_ACTIVE) return null;
        const band = this.securitySequence[this.securityIndex];
        return {
            kind:
                band === SECURITY_BAND.HIGH
                    ? CONTINUITY_WARDEN_HAZARD.SECURITY_HIGH
                    : CONTINUITY_WARDEN_HAZARD.SECURITY_LOW,
            bounds: band === SECURITY_BAND.HIGH ? this.config.highBeamBounds : this.config.lowBeamBounds,
            bodyContact: false
        };
    }

    #meleeHazardBounds() {
        const behind = this.state === CONTINUITY_WARDEN_STATE.BACK_SWING;
        const sign = behind ? -this.facing : this.facing;
        const width = this.state === CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM ? 150 : 180;
        const height = this.state === CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM ? 190 : 120;
        return {
            x: this.bodyPosition.x + sign * 95 - (sign < 0 ? width : 0),
            y: this.bodyPosition.y - height * 0.55,
            width,
            height
        };
    }

    contactIdsForHazardObservation({ hazard, contactIdPrefix, playerId, overlapping, dt, emit = true }) {
        if (SECURITY_BEAM_HAZARD_KIND[hazard?.kind] !== true) {
            return super.contactIdsForHazardObservation({ contactIdPrefix, playerId, overlapping });
        }
        if (!overlapping || emit === false) return Object.freeze([]);
        const pulseIndex = this.#securityBeamPulseIndex();
        return pulseIndex > 0
            ? Object.freeze([`${contactIdPrefix}${SECURITY_BEAM_CONTACT_ID_MARKER}${pulseIndex}:${playerId}`])
            : Object.freeze([]);
    }

    hazardRecordKeyForContact(contactId, playerId) {
        return (
            this.#securityBeamPulseContact(contactId, playerId)?.recordKey ??
            super.hazardRecordKeyForContact(contactId, playerId)
        );
    }

    validatesHazardContactId({ contactId, playerId, hazardKind, recordKey }) {
        if (SECURITY_BEAM_HAZARD_KIND[hazardKind] !== true) {
            return super.validatesHazardContactId({ contactId, playerId, hazardKind, recordKey });
        }
        const pulse = this.#securityBeamPulseContact(contactId, playerId);
        return Boolean(pulse && pulse.recordKey === recordKey);
    }

    #securityBeamPulseIndex() {
        const elapsed = Math.max(0, this.config.beamSeconds - this.timer);
        return Math.min(
            Math.floor((this.config.beamSeconds + SECURITY_BEAM_TIME_EPSILON) / this.config.beamPulseSeconds),
            Math.floor((elapsed + SECURITY_BEAM_TIME_EPSILON) / this.config.beamPulseSeconds) + 1
        );
    }

    hazardContactSnapshot() {
        return Object.freeze(
            [...this.processedHazardContactIds]
                .filter((contactId) => contactId.includes(SECURITY_BEAM_CONTACT_ID_MARKER))
                .sort()
        );
    }

    restoreHazardContacts(snapshot) {
        for (const contactId of snapshot ?? []) {
            if (typeof contactId === "string" && contactId.includes(SECURITY_BEAM_CONTACT_ID_MARKER)) {
                this.processedHazardContactIds.add(contactId);
            }
        }
        return this.hazardContactSnapshot();
    }

    #securityBeamPulseContact(contactId, playerId) {
        if (typeof contactId !== "string" || typeof playerId !== "string") return null;
        const playerSuffix = `:${playerId}`;
        if (!contactId.endsWith(playerSuffix)) return null;
        const withoutPlayer = contactId.slice(0, -playerSuffix.length);
        const markerIndex = withoutPlayer.lastIndexOf(SECURITY_BEAM_CONTACT_ID_MARKER);
        if (markerIndex < 1) return null;
        const pulseIndex = Number(withoutPlayer.slice(markerIndex + SECURITY_BEAM_CONTACT_ID_MARKER.length));
        const maximumPulseCount = Math.floor(
            (this.config.beamSeconds + SECURITY_BEAM_TIME_EPSILON) / this.config.beamPulseSeconds
        );
        if (!Number.isSafeInteger(pulseIndex) || pulseIndex < 1 || pulseIndex > maximumPulseCount) return null;
        return Object.freeze({ recordKey: withoutPlayer.slice(0, markerIndex), pulseIndex });
    }

    activeHazards(worldOffset = { x: 0, y: 0 }) {
        if (this.status !== "active" || this.actionPhase !== ACTION_PHASE.ACTIVE) return Object.freeze([]);
        const hazard = this.#currentHazardDefinition();
        if (!hazard) return Object.freeze([]);
        return Object.freeze([
            freezeComposite({
                id: `${this.definition.id}:${hazard.kind}:${this.hazardSequence}`,
                kind: hazard.kind,
                sequence: this.hazardSequence,
                bounds: translatedBounds(hazard.bounds, worldOffset),
                ...(hazard.bodyContact
                    ? {
                          position: compositeWorldPoint(this.bodyPosition, worldOffset),
                          collider: this.body.collider.snapshot()
                      }
                    : {}),
                damage: SECURITY_BEAM_HAZARD_KIND[hazard.kind] === true ? this.config.beamDamage : this.config.damage
            })
        ]);
    }

    #victoryGateOpen() {
        if (this.status !== "completed") return false;
        const stage = this.#victoryStage();
        return stage === "gate-open" || stage === "shuttle-reveal" || stage === "player-control";
    }

    dynamicCollisionSurfaces(worldOffset = { x: 0, y: 0 }) {
        if (this.#victoryGateOpen()) {
            return Object.freeze([
                collisionSurface(
                    CONTINUITY_WARDEN_ID.THRESHOLD_BRIDGE,
                    "threshold-bridge",
                    this.config.bridgeBounds,
                    worldOffset,
                    true
                )
            ]);
        }
        return Object.freeze([
            collisionSurface(
                CONTINUITY_WARDEN_ID.DEPARTURE_GATE,
                "departure-gate",
                this.config.gateBounds,
                worldOffset,
                true
            )
        ]);
    }

    collisionActors(worldOffset = { x: 0, y: 0 }) {
        return Object.freeze([this.body.collisionActor(worldOffset)]);
    }

    ropeAttachmentActors() {
        return Object.freeze([]);
    }

    recoveryProtected(playerId) {
        return false;
    }

    recoverPlayer() {
        return null;
    }

    respawnPosition(worldOffset = { x: 0, y: 0 }) {
        return compositeWorldPoint(this.definition.arena.entry, worldOffset);
    }

    victoryRecoveryPosition(worldOffset = { x: 0, y: 0 }) {
        return compositeWorldPoint(
            {
                x: this.config.bridgeBounds.x + this.config.bridgeBounds.width * 0.5,
                y: this.definition.arena.exit.y
            },
            worldOffset
        );
    }

    boardingZone(worldOffset = { x: 0, y: 0 }) {
        if (this.status !== "completed" || this.victoryCameraRemaining > 0) return null;
        return translatedBounds(this.config.boardingBounds, worldOffset);
    }

    markBoardingReady(playerId) {
        if (this.status !== "completed" || this.participants.get(playerId) === "disconnected") {
            return freezeComposite({ accepted: false, changed: false, allReady: false });
        }
        if (this.boardingReadyPlayerIds.has(playerId)) {
            return freezeComposite({ accepted: true, changed: false, allReady: this.allParticipantsReady() });
        }
        this.boardingReadyPlayerIds.add(playerId);
        this.emit("boss-boarding-ready", { playerId, readyPlayerIds: [...this.boardingReadyPlayerIds].sort() });
        return freezeComposite({ accepted: true, changed: true, allReady: this.allParticipantsReady() });
    }

    allParticipantsReady() {
        const connected = [...this.participants.entries()]
            .filter(([, status]) => status !== "disconnected")
            .map(([playerId]) => playerId);
        return connected.length > 0 && connected.every((playerId) => this.boardingReadyPlayerIds.has(playerId));
    }

    presentationObjects(worldOffset = { x: 0, y: 0 }) {
        const completed = this.status === "completed";
        const jumpMotion = this.jumpMotion.snapshot();
        const victoryStage = completed ? this.#victoryStage() : null;
        const victoryOffsets = completed ? this.#victoryOffsets() : null;
        const victoryElapsed = completed ? this.#victoryElapsed() : 0;
        const gateOpen = this.#victoryGateOpen();
        const gateLit = completed && (gateOpen || victoryStage === "gate-light");
        const gateProgress = gateOpeningProgress({
            stage: victoryStage,
            elapsed: victoryElapsed,
            offsets: victoryOffsets,
            open: gateOpen
        });
        const shuttleRevealed = completed && (victoryStage === "shuttle-reveal" || victoryStage === "player-control");
        const beamBand =
            this.state === CONTINUITY_WARDEN_STATE.SECURITY_ACTIVE ? this.securitySequence[this.securityIndex] : null;
        const starState = securityStarState(this.state, this.actionPhase);
        const starBand = this.state === CONTINUITY_WARDEN_STATE.SECURITY_COMMAND ? this.securitySequence[0] : beamBand;
        const starBeamBounds =
            starBand === SECURITY_BAND.HIGH
                ? this.config.highBeamBounds
                : starBand === SECURITY_BAND.LOW
                  ? this.config.lowBeamBounds
                  : null;
        const starY = starBeamBounds ? starBeamBounds.y + starBeamBounds.height * 0.5 : this.config.emitterLeft.y;
        const starProgress = securityStarAnimationProgress(starState, this.timer, this.config);
        const securityStars = [
            {
                id: CONTINUITY_WARDEN_ID.SECURITY_STAR_LEFT,
                kind: OBJECT_KIND.SECURITY_STAR,
                variant: "left",
                position: compositeWorldPoint(
                    { x: starBeamBounds?.x ?? this.config.emitterLeft.x, y: starY },
                    worldOffset
                ),
                size: DEFAULT.securityStarSize,
                state: starState,
                animationProgress: starProgress,
                active: true
            },
            {
                id: CONTINUITY_WARDEN_ID.SECURITY_STAR_RIGHT,
                kind: OBJECT_KIND.SECURITY_STAR,
                variant: "right",
                position: compositeWorldPoint(
                    {
                        x: starBeamBounds ? starBeamBounds.x + starBeamBounds.width : this.config.emitterRight.x,
                        y: starY
                    },
                    worldOffset
                ),
                size: DEFAULT.securityStarSize,
                state: starState,
                animationProgress: starProgress,
                active: true
            }
        ];
        const objects = [
            {
                id: TARGET_ID,
                kind: OBJECT_KIND.WARDEN,
                variant: this.definition.arena.boss.visualPresetId,
                position: compositeWorldPoint(this.bodyPosition, worldOffset),
                size: { width: this.config.bodyWidth, height: this.config.bodyHeight },
                state: this.state,
                defeatStage: victoryStage,
                actionState: this.actionPhase,
                remainingSeconds: this.timer,
                locomotionState: this.locomotionState,
                movementProgress: this.walkDistance,
                reactionState: this.reactionState,
                verticalVelocity: jumpMotion.velocity.y,
                motionProgress:
                    jumpMotion.active && jumpMotion.durationSeconds > 0
                        ? jumpMotion.elapsedSeconds / jumpMotion.durationSeconds
                        : 0,
                missileArmed: this.state === CONTINUITY_WARDEN_STATE.JUMP && this.missileFiredThisJump === false,
                direction: this.facing,
                physicsBody: true,
                ropeAttachable: this.body.isRopeableSurface(),
                active: true,
                targetPlayerId: this.targetPlayerId,
                cameraPriority: CAMERA_PRIORITY.BODY
            },
            {
                id: CONTINUITY_WARDEN_ID.DEPARTURE_GATE,
                kind: OBJECT_KIND.GATE,
                position: compositeWorldPoint(
                    {
                        x: this.config.departureBounds.x + CONTINUITY_WARDEN_GATE_SIZE.width * 0.5,
                        y: this.config.departureBounds.y
                    },
                    worldOffset
                ),
                size: CONTINUITY_WARDEN_GATE_SIZE,
                state: gatePresentationState({ open: gateOpen, lit: gateLit }),
                stateProgress: gateProgress,
                active: true
            },
            {
                id: CONTINUITY_WARDEN_ID.THRESHOLD_BRIDGE,
                kind: OBJECT_KIND.BRIDGE,
                position: compositeWorldPoint(
                    {
                        x: this.config.bridgeBounds.x + this.config.bridgeBounds.width * 0.5,
                        y: this.config.bridgeBounds.y + this.config.bridgeBounds.height * 0.5
                    },
                    worldOffset
                ),
                size: { width: this.config.bridgeBounds.width, height: this.config.bridgeBounds.height },
                state: gateOpen ? "active" : "stored",
                active: gateOpen
            },
            {
                id: CONTINUITY_WARDEN_ID.SHUTTLE,
                kind: OBJECT_KIND.SHUTTLE,
                position: compositeWorldPoint(this.config.shuttlePosition, worldOffset),
                size: CONTINUITY_WARDEN_SHUTTLE_SIZE,
                state: shuttleRevealed
                    ? CONTINUITY_WARDEN_SHUTTLE_STATE.BOARDING
                    : CONTINUITY_WARDEN_SHUTTLE_STATE.HIDDEN,
                active: shuttleRevealed
            }
        ];
        if (this.state === CONTINUITY_WARDEN_STATE.SUMMON && this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            objects.push(
                ...this.summonPattern.presentationWarnings({
                    kind: OBJECT_KIND.HAZARD,
                    variant: CONTINUITY_WARDEN_STATE.SUMMON,
                    state: ACTION_PHASE.TELEGRAPH,
                    worldOffset,
                    cameraPriority: CAMERA_PRIORITY.HAZARD
                })
            );
        }
        if (
            (MELEE_HAZARD_STATE[this.state] === true ||
                MOTION_HAZARD_STATE[this.state] === true ||
                this.state === CONTINUITY_WARDEN_STATE.LANDING) &&
            (this.actionPhase === ACTION_PHASE.TELEGRAPH || this.actionPhase === ACTION_PHASE.ACTIVE)
        ) {
            const hazard = this.#currentHazardDefinition();
            const localBounds =
                this.actionPhase === ACTION_PHASE.TELEGRAPH && MOTION_HAZARD_STATE[this.state] === true
                    ? this.#motionPathHazardBounds()
                    : hazard.bounds;
            objects.push({
                id: CONTINUITY_WARDEN_ID.ATTACK_HAZARD,
                kind: OBJECT_KIND.HAZARD,
                variant: hazard.kind,
                position: compositeWorldPoint(
                    { x: localBounds.x + localBounds.width * 0.5, y: localBounds.y + localBounds.height * 0.5 },
                    worldOffset
                ),
                size: { width: localBounds.width, height: localBounds.height },
                state: this.actionPhase,
                direction: this.facing,
                damaging: this.actionPhase === ACTION_PHASE.ACTIVE,
                active: true,
                targetPlayerId: this.targetPlayerId,
                cameraPriority: CAMERA_PRIORITY.HAZARD
            });
        }
        if (this.state === CONTINUITY_WARDEN_STATE.SECURITY_COMMAND) {
            for (const [index, band] of this.securitySequence.entries()) {
                const localBounds =
                    band === SECURITY_BAND.HIGH ? this.config.highBeamBounds : this.config.lowBeamBounds;
                objects.push({
                    id: CONTINUITY_WARDEN_ID.SECURITY_WARNING(index),
                    kind: OBJECT_KIND.BEAM,
                    variant: band,
                    order: index + 1,
                    position: compositeWorldPoint(
                        { x: localBounds.x + localBounds.width * 0.5, y: localBounds.y + localBounds.height * 0.5 },
                        worldOffset
                    ),
                    size: { width: localBounds.width, height: localBounds.height },
                    state: "telegraph",
                    actionState: this.actionPhase,
                    damaging: false,
                    active: true,
                    targetPlayerId: this.targetPlayerId,
                    cameraPriority: CAMERA_PRIORITY.HAZARD
                });
            }
        } else if (beamBand) {
            const localBounds =
                beamBand === SECURITY_BAND.HIGH ? this.config.highBeamBounds : this.config.lowBeamBounds;
            objects.push({
                id: CONTINUITY_WARDEN_ID.SECURITY_BEAM,
                kind: OBJECT_KIND.BEAM,
                variant: beamBand,
                position: compositeWorldPoint(
                    { x: localBounds.x + localBounds.width * 0.5, y: localBounds.y + localBounds.height * 0.5 },
                    worldOffset
                ),
                size: { width: localBounds.width, height: localBounds.height },
                state: "active",
                actionState: this.actionPhase,
                damaging: this.actionPhase === ACTION_PHASE.ACTIVE,
                active: true,
                targetPlayerId: this.targetPlayerId,
                cameraPriority: CAMERA_PRIORITY.HAZARD
            });
        }
        if (completed && this.victoryCameraRemaining > 0) {
            objects.push({
                id: CONTINUITY_WARDEN_ID.VICTORY_CAMERA,
                kind: OBJECT_KIND.CAMERA,
                position: compositeWorldPoint(
                    anchoredVisualCenter(
                        this.config.shuttlePosition,
                        CONTINUITY_WARDEN_SHUTTLE_SIZE,
                        CONTINUITY_WARDEN_SHUTTLE_CONTACT_ANCHOR
                    ),
                    worldOffset
                ),
                size: { width: 1, height: 1 },
                state: "pan-right",
                remainingSeconds: this.victoryCameraRemaining,
                active: true
            });
        }
        return Object.freeze([...objects, ...securityStars].map((object) => freezeComposite(object)));
    }

    snapshot() {
        return this.baseSnapshot({
            phase: 1,
            phaseHealths: this.scaledHealth.phaseHealths,
            phaseFloors: this.scaledHealth.phaseFloors,
            currentPhase: this.definition.phases[0],
            currentTargetId: TARGET_ID,
            objectiveLabel:
                this.status === "completed"
                    ? this.allParticipantsReady()
                        ? "EVACUATION COMPLETE"
                        : "MAINTENANCE SHUTTLE / BOARDING"
                    : this.definition.phases[0]?.hud?.objective,
            warningLabel: HUD_WARNING_BY_STATE[this.state] ?? "",
            health: this.health,
            currentHealth: this.health,
            vulnerability: freezeComposite({ active: false, targetId: TARGET_ID, remainingSeconds: 0 }),
            mechanism: freezeComposite({
                state: this.state,
                actionPhase: this.actionPhase,
                hazardSequence: this.hazardSequence,
                direction: this.facing,
                targetPlayerId: this.targetPlayerId,
                locomotionState: this.locomotionState,
                summonCooldownRemaining: this.summonPattern.cooldownRemaining,
                securitySequence: this.securitySequence,
                securityIndex: this.securityIndex
            }),
            state: this.state,
            actionPhase: this.actionPhase,
            timer: this.timer,
            healthValue: this.health,
            stateSelection: this.statePool.snapshot(),
            hazardSequence: this.hazardSequence,
            targetPlayerId: this.targetPlayerId,
            facing: this.facing,
            motionStart: this.motionStart,
            motionTarget: this.motionTarget,
            motionElapsed: this.motionElapsed,
            motionSeconds: this.motionSeconds,
            securitySequence: this.securitySequence,
            securityIndex: this.securityIndex,
            boardingReadyPlayerIds: [...this.boardingReadyPlayerIds].sort(),
            victoryCameraRemaining: this.victoryCameraRemaining,
            chainBonusPattern: this.chainBonusPattern,
            missileSalvoSequence: this.missileSalvoSequence,
            missileFiredThisJump: this.missileFiredThisJump,
            summonPattern: this.summonPattern.snapshot(),
            locomotionState: this.locomotionState,
            reactionState: this.reactionState,
            reactionTimer: this.reactionTimer,
            locomotionTarget: this.locomotionTarget,
            locomotionLandingPending: this.locomotionLandingPending,
            locomotionTimer: this.locomotionTimer,
            walkDistance: this.walkDistance,
            jumpTarget: this.jumpTarget,
            jumpMotion: this.jumpMotion.snapshot(),
            body: this.body.snapshot(),
            statusEffects: this.statusEffects.snapshot()
        });
    }

    restore(snapshot) {
        if (snapshot?.snapshotRevision !== COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION) {
            throw new Error("Boss06 snapshot revision mismatch");
        }
        this.restoreBase(snapshot);
        this.scaledHealth = this.definition.scaledHealth(Math.max(1, this.scalingRoster.length || 1));
        this.health = snapshot.healthValue ?? snapshot.health;
        this.state = snapshot.state ?? snapshot.mechanism?.state;
        this.actionPhase = snapshot.actionPhase ?? snapshot.mechanism?.actionPhase;
        this.timer = snapshot.timer ?? 0;
        this.statePool.restore(snapshot.stateSelection);
        this.hazardSequence = snapshot.hazardSequence ?? snapshot.mechanism?.hazardSequence ?? 0;
        this.targetPlayerId = snapshot.targetPlayerId ?? snapshot.mechanism?.targetPlayerId ?? null;
        this.facing = snapshot.facing ?? snapshot.mechanism?.direction ?? -1;
        this.motionStart = { ...snapshot.motionStart };
        this.motionTarget = { ...snapshot.motionTarget };
        this.motionElapsed = snapshot.motionElapsed ?? 0;
        this.motionSeconds = snapshot.motionSeconds ?? 0;
        this.securitySequence = [...(snapshot.securitySequence ?? snapshot.mechanism?.securitySequence ?? [])];
        this.securityIndex = snapshot.securityIndex ?? snapshot.mechanism?.securityIndex ?? 0;
        this.boardingReadyPlayerIds = new Set(snapshot.boardingReadyPlayerIds ?? []);
        this.victoryCameraRemaining = snapshot.victoryCameraRemaining ?? 0;
        this.chainBonusPattern = snapshot.chainBonusPattern ?? null;
        if (this.chainBonusPattern !== null && !this.stateCatalog[this.chainBonusPattern]) {
            throw new Error("Boss06 snapshot chain bonus pattern is invalid");
        }
        this.missileSalvoSequence = snapshot.missileSalvoSequence ?? 0;
        this.missileFiredThisJump = snapshot.missileFiredThisJump ?? false;
        this.summonPattern.restore(
            snapshot.summonPattern ?? {
                sequence: snapshot.minionSummonSequence,
                cooldownRemaining: snapshot.summonCooldownRemaining ?? snapshot.mechanism?.summonCooldownRemaining
            }
        );
        this.locomotionState =
            snapshot.locomotionState ??
            snapshot.mechanism?.locomotionState ??
            CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        this.reactionState = snapshot.reactionState ?? null;
        this.reactionTimer = snapshot.reactionTimer ?? 0;
        if (this.reactionState !== null && this.reactionState !== CONTINUITY_WARDEN_REACTION_STATE.DAMAGED) {
            throw new Error("Boss06 snapshot reaction state is invalid");
        }
        if (!Number.isFinite(this.reactionTimer) || this.reactionTimer < 0) {
            throw new Error("Boss06 snapshot reaction timer is invalid");
        }
        this.locomotionTarget = snapshot.locomotionTarget ? { ...snapshot.locomotionTarget } : null;
        this.locomotionLandingPending = snapshot.locomotionLandingPending === true;
        this.locomotionTimer = snapshot.locomotionTimer ?? 0;
        this.walkDistance = snapshot.walkDistance ?? 0;
        this.jumpTarget = {
            ...(snapshot.jumpTarget ?? snapshot.body?.position ?? this.definition.arena.boss.position)
        };
        this.statusEffects.restore(snapshot.statusEffects ?? null);
        this.body.restore(snapshot.body);
        this.bodyPosition = { x: this.body.position.x, y: this.body.position.y };
        this.previousBodyPosition = { ...this.bodyPosition };
        if (snapshot.jumpMotion) this.jumpMotion.restore(snapshot.jumpMotion);
        else this.jumpMotion.cancel(this.bodyPosition);
        const restoredFoot = this.#bodyFoot();
        if (
            this.status === "active" &&
            !this.jumpMotion.active &&
            !this.spatialQuery.currentSupport(restoredFoot) &&
            !this.spatialQuery.supportBelow(restoredFoot)
        ) {
            throw new Error("Boss06 snapshot body has no authored support route");
        }
        return this;
    }
}
