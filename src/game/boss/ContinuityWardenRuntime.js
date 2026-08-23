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

export const CONTINUITY_WARDEN_STATE = Object.freeze({
    NEUTRAL: "neutral",
    BATON_1: "baton-1",
    BATON_2: "baton-2",
    OVERHEAD_SLAM: "overhead-slam",
    BACK_SWING: "back-swing",
    GROUND_DASH: "ground-thruster-dash",
    DIAGONAL_DASH: "diagonal-thruster-dash",
    CHARGE: "charge",
    GUARD: "guard",
    COUNTER_READY: "counter-ready",
    COUNTER_BASH: "counter-bash",
    SECURITY_COMMAND: "security-command",
    SECURITY_ACTIVE: "security-active",
    DEFEATED: "defeated"
});

const ACTION_PHASE = Object.freeze({
    TELEGRAPH: "telegraph",
    ACTIVE: "active",
    GAP: "gap",
    RECOVERY: "recovery"
});
const PATTERN = Object.freeze({
    BATON: "baton",
    BACK_SWING: "back-swing",
    GROUND_DASH: "ground-dash",
    DIAGONAL_DASH: "diagonal-dash",
    CHARGE: "charge",
    GUARD: "guard",
    COUNTER: "counter",
    SECURITY: "security"
});
const INTENSITY = Object.freeze({ EARLY: "early", MID: "mid", LATE: "late" });
const PATTERN_ORDER = Object.freeze({
    [INTENSITY.EARLY]: Object.freeze([
        PATTERN.BATON,
        PATTERN.GROUND_DASH,
        PATTERN.GUARD,
        PATTERN.CHARGE,
        PATTERN.SECURITY
    ]),
    [INTENSITY.MID]: Object.freeze([
        PATTERN.BATON,
        PATTERN.DIAGONAL_DASH,
        PATTERN.COUNTER,
        PATTERN.BACK_SWING,
        PATTERN.SECURITY,
        PATTERN.CHARGE
    ]),
    [INTENSITY.LATE]: Object.freeze([
        PATTERN.SECURITY,
        PATTERN.GROUND_DASH,
        PATTERN.COUNTER,
        PATTERN.BATON,
        PATTERN.CHARGE,
        PATTERN.SECURITY
    ])
});
const PATTERN_START_HANDLER = Object.freeze({
    [PATTERN.BATON]: "_beginBaton",
    [PATTERN.BACK_SWING]: "_beginBackSwing",
    [PATTERN.GROUND_DASH]: "_beginGroundDash",
    [PATTERN.DIAGONAL_DASH]: "_beginDiagonalDash",
    [PATTERN.CHARGE]: "_beginCharge",
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
const OBJECT_KIND = Object.freeze({
    WARDEN: "boss-continuity-warden",
    EMITTER: "boss-security-emitter",
    HAZARD: "boss-warden-hazard",
    BEAM: "boss-security-beam",
    GATE: "boss-departure-gate",
    BRIDGE: "boss-threshold-bridge",
    SHUTTLE: "boss-maintenance-shuttle",
    CAMERA: "boss-victory-camera",
    PAD_SURFACE: "boss-pad-surface"
});
const CAMERA_PRIORITY = Object.freeze({ BODY: 1, HAZARD: 5 });
const PRESENTED_PAD_SURFACE_KIND = Object.freeze({
    "main-security-runway": true,
    "raised-ledge": true,
    "recovery-deck": true,
    "departure-deck": true
});
const TARGET_ID = "boss-06:continuity-warden:body";
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
    securityTelegraphSeconds: 1,
    beamSeconds: 0.8,
    beamGapSeconds: 0.3,
    securityRecoverySeconds: 0.8,
    victoryCameraSeconds: 2,
    damage: 25,
    groundDashDistance: 420,
    dashSeconds: 0.45
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

    #configuration() {
        const parameters = this.definition.arena.mechanics?.[0]?.parameters ?? {};
        return freezeComposite({
            mainBounds: bounds(parameters.mainBounds, { x: 1000, y: -1100, width: 3120, height: 115 }),
            groundCenterY: finite(parameters.groundCenterY, -1175),
            combatMinX: finite(parameters.combatMinX, 1048),
            combatMaxX: finite(parameters.combatMaxX, 4072),
            guardMinX: finite(parameters.guardMinX, 1250),
            guardMaxX: finite(parameters.guardMaxX, 3870),
            ledgeLeft: point(parameters.ledgeLeft, { x: 1930, y: -1455 }),
            ledgeRight: point(parameters.ledgeRight, { x: 3240, y: -1455 }),
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
            securityTelegraphSeconds: positive(parameters.securityTelegraphSeconds, DEFAULT.securityTelegraphSeconds),
            beamSeconds: positive(parameters.beamSeconds, DEFAULT.beamSeconds),
            beamGapSeconds: positive(parameters.beamGapSeconds, DEFAULT.beamGapSeconds),
            securityRecoverySeconds: positive(parameters.securityRecoverySeconds, DEFAULT.securityRecoverySeconds),
            victoryCameraSeconds: positive(parameters.victoryCameraSeconds, DEFAULT.victoryCameraSeconds),
            damage: positive(parameters.damage, DEFAULT.damage)
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
        return this.#localPlayers(context).filter(
            ({ id, position }) =>
                !this.recoveryProtected(id) && position.x >= 1000 && position.x <= 4120 && position.y <= -900
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

    #beginNextPattern(context) {
        const target = this.#updateTarget(context);
        if (!target) {
            this._beginNeutral();
            return;
        }
        const order = PATTERN_ORDER[this.#intensity()];
        let pattern = order[this.patternIndex % order.length];
        this.patternIndex += 1;
        if ((pattern === PATTERN.GUARD || pattern === PATTERN.COUNTER) && !this.#guardPositionAvailable()) {
            pattern = PATTERN.GROUND_DASH;
        }
        const handler = PATTERN_START_HANDLER[pattern];
        if (!handler || typeof this[handler] !== "function") throw new Error(`Unsupported Warden pattern: ${pattern}`);
        this[handler](target);
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

    _beginDiagonalDash(target) {
        this.state = CONTINUITY_WARDEN_STATE.DIAGONAL_DASH;
        this.actionPhase = ACTION_PHASE.TELEGRAPH;
        this.timer = this.config.meleeTelegraphSeconds;
        const onLedge = Math.abs(this.bodyPosition.y - this.config.groundCenterY) > 20;
        const targetPosition = onLedge
            ? {
                  x: Math.max(this.config.combatMinX, Math.min(this.config.combatMaxX, target.position.x)),
                  y: this.config.groundCenterY
              }
            : target.position.x < this.bodyPosition.x
              ? this.config.ledgeLeft
              : this.config.ledgeRight;
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

    _advanceBaton() {
        if (this.actionPhase === ACTION_PHASE.TELEGRAPH) {
            this.#activateAttack();
            return;
        }
        if (this.actionPhase !== ACTION_PHASE.ACTIVE) {
            this._beginNeutral();
            return;
        }
        const nextState = BATON_NEXT_STATE[this.state];
        if (!nextState) {
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
        this._beginNeutral(this.config.meleeRecoverySeconds);
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
        this._beginNeutral(this.config.chargeRecoverySeconds);
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
            this.securityIndex += 1;
            if (this.securityIndex >= this.securitySequence.length) {
                this._beginNeutral(this.config.securityRecoverySeconds);
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
        this.#updateRecoveries(context);
        this.#updateTarget(context);
        this.timer = Math.max(0, this.timer - dt);
        if (this.actionPhase === ACTION_PHASE.ACTIVE && this.motionElapsed < this.motionSeconds) {
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
            this.victoryCameraRemaining = this.config.victoryCameraSeconds;
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
        if (MELEE_HAZARD_STATE[this.state] === true) {
            return { kind: this.state, bounds: this.#meleeHazardBounds(), bodyContact: false };
        }
        if (MOTION_HAZARD_STATE[this.state] === true) {
            return { kind: this.state, bounds: this.#bodyHazardBounds(), bodyContact: true };
        }
        if (this.state !== CONTINUITY_WARDEN_STATE.SECURITY_ACTIVE) return null;
        const band = this.securitySequence[this.securityIndex];
        return {
            kind: `security-beam-${band}`,
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

    dynamicCollisionSurfaces(worldOffset = { x: 0, y: 0 }) {
        if (this.status === "completed") {
            return Object.freeze([
                collisionSurface(
                    `${this.definition.id}:threshold-bridge`,
                    "threshold-bridge",
                    this.config.bridgeBounds,
                    worldOffset,
                    true
                )
            ]);
        }
        return Object.freeze([
            collisionSurface(
                `${this.definition.id}:departure-gate`,
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
        const local = compositeLocalPoint(currentPosition ?? { x: 2600, y: 0 }, worldOffset);
        const target = local.x < 2600 ? { x: 770, y: -722 } : { x: 4240, y: -722 };
        this.recoveries[playerId] = { active: true, protection: true };
        this.emit("boss-player-recovered", { playerId, target });
        return compositeWorldPoint(target, worldOffset);
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
                actionState: this.actionPhase,
                direction: this.facing,
                physicsBody: true,
                ropeAttachable: this.body.isRopeableSurface(),
                active: true,
                targetPlayerId: this.targetPlayerId,
                cameraPriority: CAMERA_PRIORITY.BODY
            },
            {
                id: "boss-06:emitter-left",
                kind: OBJECT_KIND.EMITTER,
                variant: "left",
                position: compositeWorldPoint({ x: 1058, y: -1420 }, worldOffset),
                size: { width: 95, height: 650 },
                state: beamBand ? "active" : "idle",
                active: true
            },
            {
                id: "boss-06:emitter-right",
                kind: OBJECT_KIND.EMITTER,
                variant: "right",
                position: compositeWorldPoint({ x: 4118, y: -1420 }, worldOffset),
                size: { width: 95, height: 650 },
                state: beamBand ? "active" : "idle",
                active: true
            },
            {
                id: "boss-06:departure-gate",
                kind: OBJECT_KIND.GATE,
                position: compositeWorldPoint(
                    {
                        x: this.config.gateBounds.x + this.config.gateBounds.width * 0.5,
                        y: this.config.gateBounds.y + this.config.gateBounds.height * 0.5
                    },
                    worldOffset
                ),
                size: { width: this.config.gateBounds.width, height: this.config.gateBounds.height },
                state: completed ? "open" : "locked",
                active: true
            },
            {
                id: "boss-06:threshold-bridge",
                kind: OBJECT_KIND.BRIDGE,
                position: compositeWorldPoint(
                    {
                        x: this.config.bridgeBounds.x + this.config.bridgeBounds.width * 0.5,
                        y: this.config.bridgeBounds.y + this.config.bridgeBounds.height * 0.5
                    },
                    worldOffset
                ),
                size: { width: this.config.bridgeBounds.width, height: this.config.bridgeBounds.height },
                state: completed ? "active" : "stored",
                active: completed
            },
            {
                id: "boss-06:maintenance-shuttle",
                kind: OBJECT_KIND.SHUTTLE,
                position: compositeWorldPoint(this.config.shuttlePosition, worldOffset),
                size: { width: 500, height: 390 },
                state: completed ? "boarding" : "hidden",
                active: completed
            }
        ];
        if (
            (MELEE_HAZARD_STATE[this.state] === true || MOTION_HAZARD_STATE[this.state] === true) &&
            (this.actionPhase === ACTION_PHASE.TELEGRAPH || this.actionPhase === ACTION_PHASE.ACTIVE)
        ) {
            const hazard = this.#currentHazardDefinition();
            const localBounds =
                this.actionPhase === ACTION_PHASE.TELEGRAPH && MOTION_HAZARD_STATE[this.state] === true
                    ? this.#motionPathHazardBounds()
                    : hazard.bounds;
            objects.push({
                id: "boss-06:attack-hazard",
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
                    id: `boss-06:security-beam-warning:${index}`,
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
                id: "boss-06:security-beam",
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
                id: "boss-06:victory-camera",
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
                id: `${surface.id}:presentation`,
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
            body: this.body.snapshot()
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
        this.body.restore(snapshot.body);
        this.bodyPosition = { x: this.body.position.x, y: this.body.position.y };
        return this;
    }
}
