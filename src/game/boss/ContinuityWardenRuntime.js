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
import { ContinuityWardenJumpMotion } from "./ContinuityWardenJumpMotion.js";
import {
    CONTINUITY_WARDEN_ACTION_PHASE as ACTION_PHASE,
    CONTINUITY_WARDEN_EVENT,
    CONTINUITY_WARDEN_HAZARD,
    CONTINUITY_WARDEN_ID,
    CONTINUITY_WARDEN_LOCOMOTION_STATE,
    CONTINUITY_WARDEN_OBJECT_KIND as OBJECT_KIND,
    CONTINUITY_WARDEN_PATTERN as PATTERN,
    CONTINUITY_WARDEN_PROJECTILE_PRESET_ID,
    CONTINUITY_WARDEN_STATE,
    CONTINUITY_WARDEN_SUMMON_ENEMY_TYPES,
    CONTINUITY_WARDEN_SURFACE_KIND
} from "./ContinuityWardenDefinition.js";

export { CONTINUITY_WARDEN_STATE } from "./ContinuityWardenDefinition.js";
const INTENSITY = Object.freeze({ EARLY: "early", MID: "mid", LATE: "late" });
const CHAIN_MAX = Object.freeze({ [INTENSITY.EARLY]: 0, [INTENSITY.MID]: 1, [INTENSITY.LATE]: 2 });
const CHAIN_TRANSITION_SECONDS = 0.15;
const PATTERN_ORDER = Object.freeze({
    [INTENSITY.EARLY]: Object.freeze([
        PATTERN.BATON,
        PATTERN.GROUND_DASH,
        PATTERN.MISSILE,
        PATTERN.SUMMON,
        PATTERN.GUARD,
        PATTERN.CHARGE,
        PATTERN.SECURITY
    ]),
    [INTENSITY.MID]: Object.freeze([
        PATTERN.BATON,
        PATTERN.DIAGONAL_DASH,
        PATTERN.MISSILE,
        PATTERN.SUMMON,
        PATTERN.COUNTER,
        PATTERN.BACK_SWING,
        PATTERN.SECURITY,
        PATTERN.CHARGE
    ]),
    [INTENSITY.LATE]: Object.freeze([
        PATTERN.MISSILE,
        PATTERN.SECURITY,
        PATTERN.SUMMON,
        PATTERN.GROUND_DASH,
        PATTERN.COUNTER,
        PATTERN.BATON,
        PATTERN.CHARGE,
        PATTERN.SECURITY,
        PATTERN.MISSILE
    ])
});
const PATTERN_START_HANDLER = Object.freeze({
    [PATTERN.BATON]: "_beginBaton",
    [PATTERN.BACK_SWING]: "_beginBackSwing",
    [PATTERN.GROUND_DASH]: "_beginGroundDash",
    [PATTERN.DIAGONAL_DASH]: "_beginDiagonalDash",
    [PATTERN.CHARGE]: "_beginCharge",
    [PATTERN.MISSILE]: "_beginJumpMissile",
    [PATTERN.SUMMON]: "_beginSummon",
    [PATTERN.GUARD]: "_beginGuard",
    [PATTERN.COUNTER]: "_beginCounter",
    [PATTERN.SECURITY]: "_beginSecurity"
});
const STATE_ADVANCE_HANDLER = Object.freeze({
    [CONTINUITY_WARDEN_STATE.BATON_1]: "_advanceBaton",
    [CONTINUITY_WARDEN_STATE.BATON_2]: "_advanceBaton",
    [CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM]: "_advanceBaton",
    [CONTINUITY_WARDEN_STATE.BACK_SWING]: "_advanceSingleAttack",
    [CONTINUITY_WARDEN_STATE.GROUND_DASH]: "_advanceMotionAttack",
    [CONTINUITY_WARDEN_STATE.DIAGONAL_DASH]: "_advanceMotionAttack",
    [CONTINUITY_WARDEN_STATE.CHARGE]: "_advanceCharge",
    [CONTINUITY_WARDEN_STATE.JUMP]: "_advanceJumpMissile",
    [CONTINUITY_WARDEN_STATE.LANDING]: "_advanceLanding",
    [CONTINUITY_WARDEN_STATE.SUMMON]: "_advanceSummon",
    [CONTINUITY_WARDEN_STATE.GUARD]: "_advanceGuard",
    [CONTINUITY_WARDEN_STATE.COUNTER_READY]: "_advanceCounter",
    [CONTINUITY_WARDEN_STATE.COUNTER_BASH]: "_advanceSingleAttack",
    [CONTINUITY_WARDEN_STATE.SECURITY_COMMAND]: "_advanceSecurity",
    [CONTINUITY_WARDEN_STATE.SECURITY_ACTIVE]: "_advanceSecurity"
});
const BATON_NEXT_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.BATON_1]: CONTINUITY_WARDEN_STATE.BATON_2,
    [CONTINUITY_WARDEN_STATE.BATON_2]: CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM
});
const SECURITY_BAND = Object.freeze({ LOW: "low", HIGH: "high" });
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
const PRESENTED_PAD_SURFACE_KIND = Object.freeze({
    [CONTINUITY_WARDEN_SURFACE_KIND.MAIN]: true,
    [CONTINUITY_WARDEN_SURFACE_KIND.LEDGE]: true,
    [CONTINUITY_WARDEN_SURFACE_KIND.RECOVERY]: true,
    [CONTINUITY_WARDEN_SURFACE_KIND.DEPARTURE]: true
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
    bodyWidth: 96,
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
    beamSeconds: 0.8,
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
    summonCount: 2,
    summonCooldownSeconds: 15,
    summonSkipAliveCount: 6,
    summonWarningSize: 110,
    emitterSize: Object.freeze({ width: 95, height: 650 })
});

function positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function positiveInteger(value, fallback) {
    return Number.isSafeInteger(value) && value > 0 ? value : fallback;
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

function finiteNumbers(value, fallback) {
    return Array.isArray(value) && value.length === fallback.length && value.every(Number.isFinite)
        ? Object.freeze([...value])
        : fallback;
}

function landingPosition(surface) {
    return freezeComposite({
        x: surface.bounds.x + surface.bounds.width * 0.5,
        y: surface.bounds.y - DEFAULT.bodyHeight * 0.5
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
    constructor(definition, snapshot = null) {
        super(definition);
        this.config = this.#configuration();
        this.scaledHealth = null;
        this.health = 0;
        this.state = CONTINUITY_WARDEN_STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = 0;
        this.patternIndex = 0;
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
        this.recoveries = Object.create(null);
        this.boardingReadyPlayerIds = new Set();
        this.victoryCameraRemaining = 0;
        this.chainDepth = 0;
        this.pendingChainPattern = null;
        this.missileSalvoSequence = 0;
        this.missileFiredThisJump = false;
        this.minionSummonSequence = 0;
        this.summonCooldownRemaining = 0;
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
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
                    width: DEFAULT.bodyWidth,
                    height: DEFAULT.bodyHeight
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
            .map(landingPosition)
            .sort((left, right) => left.x - right.x);
        const recoveryPoints = [...(this.definition.arena.recoveryPoints ?? [])]
            .filter((entry) => Number.isFinite(entry.x) && Number.isFinite(entry.y))
            .map(({ id, x, y }) => freezeComposite({ id, x, y }))
            .sort((left, right) => left.x - right.x);
        const halfBodyWidth = DEFAULT.bodyWidth * 0.5;
        const guardInset = positive(parameters.guardEdgeInset, 200);
        return freezeComposite({
            mainBounds,
            combatBounds,
            groundCenterY: mainBounds.y - DEFAULT.bodyHeight * 0.5,
            combatMinX: mainBounds.x + halfBodyWidth,
            combatMaxX: mainBounds.x + mainBounds.width - halfBodyWidth,
            guardMinX: mainBounds.x + guardInset,
            guardMaxX: mainBounds.x + mainBounds.width - guardInset,
            ledgeTargets,
            recoveryPoints,
            lowBeamBounds: bounds(parameters.lowBeamBounds, { x: 980, y: -1200, width: 3160, height: 130 }),
            highBeamBounds: bounds(parameters.highBeamBounds, { x: 980, y: -1485, width: 3160, height: 270 }),
            gateBounds: bounds(parameters.gateBounds, { x: 4360, y: -1750, width: 480, height: 760 }),
            bridgeBounds: bounds(parameters.bridgeBounds, { x: 4120, y: -1115, width: 240, height: 130 }),
            boardingBounds: bounds(parameters.boardingBounds, { x: 4920, y: -1220, width: 360, height: 235 }),
            shuttlePosition: point(parameters.shuttlePosition, { x: 5150, y: -1345 }),
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
            beamGapSeconds: positive(parameters.beamGapSeconds, DEFAULT.beamGapSeconds),
            securityRecoverySeconds: positive(parameters.securityRecoverySeconds, DEFAULT.securityRecoverySeconds),
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
            summonCount: positiveInteger(parameters.minionSummonCount, DEFAULT.summonCount),
            summonCooldownSeconds: positive(parameters.minionSummonCooldownSeconds, DEFAULT.summonCooldownSeconds),
            summonSkipAliveCount: positiveInteger(parameters.minionSummonSkipAliveCount, DEFAULT.summonSkipAliveCount),
            summonPoints: Object.freeze([
                point(parameters.summonLeft, {
                    x: mainBounds.x + mainBounds.width * 0.25,
                    y: mainBounds.y - 180
                }),
                point(parameters.summonRight, {
                    x: mainBounds.x + mainBounds.width * 0.75,
                    y: mainBounds.y - 180
                })
            ]),
            emitterLeft: point(parameters.emitterLeft, {
                x: mainBounds.x + DEFAULT.emitterSize.width * 0.5,
                y: mainBounds.y - DEFAULT.emitterSize.height * 0.5
            }),
            emitterRight: point(parameters.emitterRight, {
                x: mainBounds.x + mainBounds.width - DEFAULT.emitterSize.width * 0.5,
                y: mainBounds.y - DEFAULT.emitterSize.height * 0.5
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
        this.patternIndex = 0;
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
        this.recoveries = Object.create(null);
        this.boardingReadyPlayerIds = new Set();
        this.victoryCameraRemaining = 0;
        this.chainDepth = 0;
        this.pendingChainPattern = null;
        this.missileSalvoSequence = 0;
        this.missileFiredThisJump = false;
        this.minionSummonSequence = 0;
        this.summonCooldownRemaining = 0;
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        this.jumpTarget = { ...this.bodyPosition };
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

    #chooseNearest(players) {
        return players.reduce(
            (nearest, player) =>
                !nearest ||
                compositeDistance(player.position, this.bodyPosition) <
                    compositeDistance(nearest.position, this.bodyPosition)
                    ? player
                    : nearest,
            null
        );
    }

    #updateTarget(context) {
        const players = this.#combatPlayers(context);
        if (this.state === CONTINUITY_WARDEN_STATE.CHARGE) {
            return players.find(({ id }) => id === this.targetPlayerId) ?? null;
        }
        const target = this.#chooseNearest(players);
        if (!target) return null;
        this.targetPlayerId = target.id;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        return target;
    }

    #intensity() {
        const ratio = this.maximumHealth() > 0 ? this.health / this.maximumHealth() : 0;
        if (ratio > 0.67) return INTENSITY.EARLY;
        if (ratio > 0.34) return INTENSITY.MID;
        return INTENSITY.LATE;
    }

    #guardPositionAvailable() {
        return this.bodyPosition.x >= this.config.guardMinX && this.bodyPosition.x <= this.config.guardMaxX;
    }

    #summonPatternAvailable(context) {
        const aliveCount = Number.isSafeInteger(context.bossSummonedEnemyCount) ? context.bossSummonedEnemyCount : 0;
        return this.summonCooldownRemaining <= 0 && aliveCount < this.config.summonSkipAliveCount;
    }

    #nextScheduledPattern(context) {
        const order = PATTERN_ORDER[this.#intensity()];
        for (let inspected = 0; inspected < order.length; inspected += 1) {
            const pattern = order[this.patternIndex % order.length];
            this.patternIndex += 1;
            if (pattern !== PATTERN.SUMMON || this.#summonPatternAvailable(context)) return pattern;
        }
        return PATTERN.BATON;
    }

    #beginNextPattern(context) {
        const target = this.#updateTarget(context);
        if (!target) {
            this._beginNeutral();
            return;
        }
        let pattern;
        if (this.pendingChainPattern) {
            pattern = this.pendingChainPattern;
            this.pendingChainPattern = null;
        } else {
            this.chainDepth = 0;
            pattern = this.#nextScheduledPattern(context);
        }
        if ((pattern === PATTERN.GUARD || pattern === PATTERN.COUNTER) && !this.#guardPositionAvailable()) {
            pattern = PATTERN.GROUND_DASH;
        }
        const handler = PATTERN_START_HANDLER[pattern];
        if (!handler || typeof this[handler] !== "function") throw new Error(`Unsupported Warden pattern: ${pattern}`);
        this[handler](target);
    }

    #endWithChain(recoverySeconds, followupPattern) {
        const cap = CHAIN_MAX[this.#intensity()] ?? 0;
        if (followupPattern && this.chainDepth < cap) {
            this.chainDepth += 1;
            this.pendingChainPattern = followupPattern;
            this._beginNeutral(Math.min(recoverySeconds, CHAIN_TRANSITION_SECONDS));
            return;
        }
        this.chainDepth = 0;
        this.pendingChainPattern = null;
        this._beginNeutral(recoverySeconds);
    }

    _beginNeutral(seconds = DEFAULT.neutralSeconds) {
        this.state = CONTINUITY_WARDEN_STATE.NEUTRAL;
        this.actionPhase = ACTION_PHASE.RECOVERY;
        this.timer = seconds;
        this.motionElapsed = 0;
        this.motionSeconds = 0;
        this.locomotionState = CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
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

    _beginDiagonalDash(target) {
        this.state = CONTINUITY_WARDEN_STATE.DIAGONAL_DASH;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.meleeTelegraphSeconds;
        const onLedge = Math.abs(this.bodyPosition.y - this.config.groundCenterY) > 20;
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

    #jumpLandingTarget(target) {
        const onGround = Math.abs(this.bodyPosition.y - this.config.groundCenterY) <= 20;
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

    _beginJumpMissile(target) {
        this.state = CONTINUITY_WARDEN_STATE.JUMP;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.jumpTelegraphSeconds;
        this.targetPlayerId = target.id;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        this.jumpTarget = { ...this.#jumpLandingTarget(target) };
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
        if (!target) return false;
        const origin = compositeWorldPoint(
            { x: this.bodyPosition.x, y: this.bodyPosition.y - DEFAULT.bodyHeight * 0.2 },
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
        this.timer = this.config.securityTelegraphSeconds;
        this.facing = target.position.x < this.bodyPosition.x ? -1 : 1;
        this.emit("boss-attack-telegraphed", {
            kind: CONTINUITY_WARDEN_STATE.SUMMON,
            targetPlayerId: target.id,
            summonCount: this.config.summonCount
        });
    }

    _advanceSummon(_dt, context = {}) {
        if (!this.#summonPatternAvailable(context)) {
            this._beginNeutral();
            return;
        }
        this.actionPhase = ACTION_PHASE.ACTIVE;
        this.minionSummonSequence += 1;
        this.summonCooldownRemaining = this.config.summonCooldownSeconds;
        this.emit("boss-attack-started", {
            kind: CONTINUITY_WARDEN_STATE.SUMMON,
            sequence: this.minionSummonSequence,
            summonCount: this.config.summonCount
        });
        for (let index = 0; index < this.config.summonCount; index += 1) {
            const poolIndex =
                ((this.minionSummonSequence - 1) * this.config.summonCount + index) %
                CONTINUITY_WARDEN_SUMMON_ENEMY_TYPES.length;
            const localPosition = this.config.summonPoints[index % this.config.summonPoints.length];
            this.emit(CONTINUITY_WARDEN_EVENT.ENEMY_SUMMONED, {
                enemyId: CONTINUITY_WARDEN_ID.SUMMONED_ENEMY(this.attempt, this.minionSummonSequence, index),
                enemyType: CONTINUITY_WARDEN_SUMMON_ENEMY_TYPES[poolIndex],
                position: compositeWorldPoint(localPosition, context.worldOffset ?? { x: 0, y: 0 }),
                summonSequence: this.minionSummonSequence,
                summonIndex: index
            });
        }
        this._beginNeutral(this.config.meleeRecoverySeconds);
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
        if (intensity === INTENSITY.EARLY) return [this.patternIndex % 2 ? SECURITY_BAND.LOW : SECURITY_BAND.HIGH];
        if (intensity === INTENSITY.MID) {
            return this.patternIndex % 2
                ? [SECURITY_BAND.LOW, SECURITY_BAND.HIGH]
                : [SECURITY_BAND.HIGH, SECURITY_BAND.LOW];
        }
        return this.patternIndex % 2
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
        if (!target) return false;
        return compositeDistance(target.position, this.bodyPosition) <= this.config.comboRange;
    }

    _advanceBaton(dt, context = {}) {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.#activateAttack();
            return;
        }
        if (this.actionPhase !== ACTION_PHASE.ACTIVE) {
            this._beginNeutral();
            return;
        }
        const nextState = BATON_NEXT_STATE[this.state];
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

    #activateSecurityBand() {
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

    _advanceSecurity() {
        if (this.state === CONTINUITY_WARDEN_STATE.SECURITY_COMMAND) {
            this.#activateSecurityBand();
            return;
        }
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
        this.#activateSecurityBand();
    }

    #updateRecoveries(context) {
        for (const player of this.#localPlayers(context)) {
            if (!this.recoveries[player.id]?.active) continue;
            const returnedToMain =
                player.position.x >= this.config.mainBounds.x &&
                player.position.x <= this.config.mainBounds.x + this.config.mainBounds.width &&
                player.position.y >= this.config.mainBounds.y - 220 &&
                player.position.y <= this.config.mainBounds.y + this.config.mainBounds.height;
            if (!returnedToMain) continue;
            this.recoveries[player.id] = { active: false, protection: false };
            this.emit("boss-player-recovery-completed", { playerId: player.id });
        }
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
        this.summonCooldownRemaining = Math.max(0, this.summonCooldownRemaining - dt);
        for (const outcome of this.statusEffects.advance(dt)) {
            if (outcome.type === "damage") this.health = Math.max(0, this.health - outcome.damage);
        }
        if (!this.statusEffects.canAct()) {
            this.body.holdKinematicPosition();
            return freezeComposite({ accepted: true, changed: true });
        }
        this.#updateRecoveries(context);
        this.#updateTarget(context);
        this.timer = Math.max(0, this.timer - dt);
        if (
            this.state === CONTINUITY_WARDEN_STATE.JUMP &&
            this.actionPhase === ACTION_PHASE.ACTIVE &&
            this.jumpMotion.active
        ) {
            this._advanceJumpMissile(dt, context);
        } else if (this.actionPhase === ACTION_PHASE.ACTIVE && this.motionElapsed < this.motionSeconds) {
            const handler = STATE_ADVANCE_HANDLER[this.state];
            if (handler === "_advanceMotionAttack" || handler === "_advanceCharge") this[handler](dt, context);
        }
        if (this.timer > 0) return freezeComposite({ accepted: true, changed: true });
        if (this.state === CONTINUITY_WARDEN_STATE.NEUTRAL) this.#beginNextPattern(context);
        else {
            const handler = STATE_ADVANCE_HANDLER[this.state];
            if (!handler || typeof this[handler] !== "function")
                throw new Error(`Unsupported Warden state: ${this.state}`);
            this[handler](dt, context);
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
            this.victoryCameraRemaining = this.#victoryOffsets().playerControlAt;
            this.body.holdKinematicPosition();
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
            weakpointDamageRatio: 0
        });
        return Object.freeze({ ...snapshot, collider: this.body.collider });
    }

    #bodyHazardBounds() {
        return {
            x: this.bodyPosition.x - DEFAULT.bodyWidth * 0.5,
            y: this.bodyPosition.y - DEFAULT.bodyHeight * 0.5,
            width: DEFAULT.bodyWidth,
            height: DEFAULT.bodyHeight
        };
    }

    #motionPathHazardBounds() {
        const halfWidth = DEFAULT.bodyWidth * 0.5;
        const halfHeight = DEFAULT.bodyHeight * 0.5;
        const minX = Math.min(this.motionStart.x, this.motionTarget.x) - halfWidth;
        const minY = Math.min(this.motionStart.y, this.motionTarget.y) - halfHeight;
        return {
            x: minX,
            y: minY,
            width: Math.abs(this.motionTarget.x - this.motionStart.x) + DEFAULT.bodyWidth,
            height: Math.abs(this.motionTarget.y - this.motionStart.y) + DEFAULT.bodyHeight
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
                damage: this.config.damage
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
        return this.recoveries[playerId]?.protection === true;
    }

    recoverPlayer(playerId, worldOffset = { x: 0, y: 0 }, currentPosition = null) {
        const local = compositeLocalPoint(currentPosition ?? this.definition.arena.entry, worldOffset);
        const target = this.config.recoveryPoints.reduce(
            (closest, candidate) =>
                !closest || Math.abs(candidate.x - local.x) < Math.abs(closest.x - local.x) ? candidate : closest,
            null
        );
        const recoveryTarget = target ?? this.definition.arena.entry;
        this.recoveries[playerId] = { active: true, protection: true };
        this.emit("boss-player-recovered", { playerId, target: recoveryTarget });
        return compositeWorldPoint(recoveryTarget, worldOffset);
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
        const gateOpen = this.#victoryGateOpen();
        const gateLit = completed && (gateOpen || victoryStage === "gate-light");
        const shuttleRevealed = completed && (victoryStage === "shuttle-reveal" || victoryStage === "player-control");
        const beamBand =
            this.state === CONTINUITY_WARDEN_STATE.SECURITY_ACTIVE ? this.securitySequence[this.securityIndex] : null;
        const objects = [
            {
                id: TARGET_ID,
                kind: OBJECT_KIND.WARDEN,
                variant: this.definition.arena.boss.visualPresetId,
                position: compositeWorldPoint(this.bodyPosition, worldOffset),
                size: { width: DEFAULT.bodyWidth, height: DEFAULT.bodyHeight },
                state: this.state,
                defeatStage: victoryStage,
                actionState: this.actionPhase,
                remainingSeconds: this.timer,
                locomotionState: this.locomotionState,
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
                id: CONTINUITY_WARDEN_ID.EMITTER_LEFT,
                kind: OBJECT_KIND.EMITTER,
                variant: "left",
                position: compositeWorldPoint(this.config.emitterLeft, worldOffset),
                size: DEFAULT.emitterSize,
                state: beamBand ? "active" : "idle",
                active: true
            },
            {
                id: CONTINUITY_WARDEN_ID.EMITTER_RIGHT,
                kind: OBJECT_KIND.EMITTER,
                variant: "right",
                position: compositeWorldPoint(this.config.emitterRight, worldOffset),
                size: DEFAULT.emitterSize,
                state: beamBand ? "active" : "idle",
                active: true
            },
            {
                id: CONTINUITY_WARDEN_ID.DEPARTURE_GATE,
                kind: OBJECT_KIND.GATE,
                position: compositeWorldPoint(
                    {
                        x: this.config.gateBounds.x + this.config.gateBounds.width * 0.5,
                        y: this.config.gateBounds.y + this.config.gateBounds.height * 0.5
                    },
                    worldOffset
                ),
                size: { width: this.config.gateBounds.width, height: this.config.gateBounds.height },
                state: gateOpen ? "open" : gateLit ? "light" : "locked",
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
                size: { width: 500, height: 390 },
                state: shuttleRevealed ? "boarding" : "hidden",
                active: shuttleRevealed
            }
        ];
        if (this.state === CONTINUITY_WARDEN_STATE.SUMMON && this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            for (const [index, summonPoint] of this.config.summonPoints.entries()) {
                objects.push({
                    id: CONTINUITY_WARDEN_ID.SUMMON_WARNING(index),
                    kind: OBJECT_KIND.HAZARD,
                    variant: CONTINUITY_WARDEN_STATE.SUMMON,
                    position: compositeWorldPoint(summonPoint, worldOffset),
                    size: { width: DEFAULT.summonWarningSize, height: DEFAULT.summonWarningSize },
                    state: ACTION_PHASE.TELEGRAPH,
                    damaging: false,
                    active: true,
                    cameraPriority: CAMERA_PRIORITY.HAZARD
                });
            }
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
                position: compositeWorldPoint(this.config.shuttlePosition, worldOffset),
                size: { width: 1, height: 1 },
                state: "pan-right",
                remainingSeconds: this.victoryCameraRemaining,
                active: true
            });
        }
        const padSurfaceObjects = [];
        for (const surface of this.definition.arena.surfaces) {
            if (PRESENTED_PAD_SURFACE_KIND[surface.kind] !== true) continue;
            padSurfaceObjects.push({
                id: CONTINUITY_WARDEN_ID.PRESENTATION_SURFACE(surface.id),
                kind: OBJECT_KIND.PAD_SURFACE,
                variant: surface.kind,
                position: compositeWorldPoint(
                    {
                        x: surface.bounds.x + surface.bounds.width * 0.5,
                        y: surface.bounds.y + surface.bounds.height * 0.5
                    },
                    worldOffset
                ),
                size: { width: surface.bounds.width, height: surface.bounds.height },
                state: "active",
                active: true
            });
        }
        return Object.freeze([...padSurfaceObjects, ...objects].map((object) => freezeComposite(object)));
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
                summonCooldownRemaining: this.summonCooldownRemaining,
                securitySequence: this.securitySequence,
                securityIndex: this.securityIndex
            }),
            state: this.state,
            actionPhase: this.actionPhase,
            timer: this.timer,
            healthValue: this.health,
            patternIndex: this.patternIndex,
            hazardSequence: this.hazardSequence,
            targetPlayerId: this.targetPlayerId,
            facing: this.facing,
            motionStart: this.motionStart,
            motionTarget: this.motionTarget,
            motionElapsed: this.motionElapsed,
            motionSeconds: this.motionSeconds,
            securitySequence: this.securitySequence,
            securityIndex: this.securityIndex,
            recoveries: this.recoveries,
            boardingReadyPlayerIds: [...this.boardingReadyPlayerIds].sort(),
            victoryCameraRemaining: this.victoryCameraRemaining,
            chainDepth: this.chainDepth,
            pendingChainPattern: this.pendingChainPattern,
            missileSalvoSequence: this.missileSalvoSequence,
            missileFiredThisJump: this.missileFiredThisJump,
            minionSummonSequence: this.minionSummonSequence,
            summonCooldownRemaining: this.summonCooldownRemaining,
            locomotionState: this.locomotionState,
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
        this.patternIndex = snapshot.patternIndex ?? 0;
        this.hazardSequence = snapshot.hazardSequence ?? snapshot.mechanism?.hazardSequence ?? 0;
        this.targetPlayerId = snapshot.targetPlayerId ?? snapshot.mechanism?.targetPlayerId ?? null;
        this.facing = snapshot.facing ?? snapshot.mechanism?.direction ?? -1;
        this.motionStart = { ...snapshot.motionStart };
        this.motionTarget = { ...snapshot.motionTarget };
        this.motionElapsed = snapshot.motionElapsed ?? 0;
        this.motionSeconds = snapshot.motionSeconds ?? 0;
        this.securitySequence = [...(snapshot.securitySequence ?? snapshot.mechanism?.securitySequence ?? [])];
        this.securityIndex = snapshot.securityIndex ?? snapshot.mechanism?.securityIndex ?? 0;
        this.recoveries = Object.fromEntries(
            Object.entries(snapshot.recoveries ?? {}).map(([id, value]) => [id, { ...value }])
        );
        this.boardingReadyPlayerIds = new Set(snapshot.boardingReadyPlayerIds ?? []);
        this.victoryCameraRemaining = snapshot.victoryCameraRemaining ?? 0;
        this.chainDepth = snapshot.chainDepth ?? 0;
        this.pendingChainPattern = snapshot.pendingChainPattern ?? null;
        this.missileSalvoSequence = snapshot.missileSalvoSequence ?? 0;
        this.missileFiredThisJump = snapshot.missileFiredThisJump ?? false;
        this.minionSummonSequence = snapshot.minionSummonSequence ?? 0;
        this.summonCooldownRemaining =
            snapshot.summonCooldownRemaining ?? snapshot.mechanism?.summonCooldownRemaining ?? 0;
        this.locomotionState =
            snapshot.locomotionState ??
            snapshot.mechanism?.locomotionState ??
            CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        this.jumpTarget = {
            ...(snapshot.jumpTarget ?? snapshot.body?.position ?? this.definition.arena.boss.position)
        };
        this.statusEffects.restore(snapshot.statusEffects ?? null);
        this.body.restore(snapshot.body);
        this.bodyPosition = { x: this.body.position.x, y: this.body.position.y };
        if (snapshot.jumpMotion) this.jumpMotion.restore(snapshot.jumpMotion);
        else this.jumpMotion.cancel(this.bodyPosition);
        return this;
    }
}
