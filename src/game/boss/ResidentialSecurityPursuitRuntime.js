import { withAngularPhysics } from "../physics/AngularPhysicsMixin.js";
import { KinematicPhysicsBody } from "../physics/KinematicPhysicsBody.js";
import { rotateVector } from "../physics/AngularMotion.js";
import { PHYSICS_ACTOR_KIND } from "../physics/PlayerPhysicsDefinition.js";
import { PolygonCollider } from "../physics/colliders/PolygonCollider.js";

export const RESIDENTIAL_PURSUIT_STATE = Object.freeze({
    CHASE: "chase",
    TELEGRAPH: "telegraph",
    TRACK: "track",
    RISE: "rise",
    CONFIRM: "confirm",
    ATTACK: "attack",
    EXPOSED: "exposed",
    RECOVERY: "recovery",
    REPOSITION: "reposition",
    STOPPED: "stopped"
});

const ATTACK_KIND = Object.freeze({
    CHARGE: "charge",
    SLAM: "ground-slam",
    DIVE: "diagonal-dive"
});

const MECHANIC_TYPE_TO_ATTACK = Object.freeze({
    "simple-lock-charge": ATTACK_KIND.CHARGE,
    "rotating-ground-slam": ATTACK_KIND.SLAM,
    "diagonal-dive": ATTACK_KIND.DIVE
});
const PRESENTATION_KIND_BY_ATTACK = Object.freeze({
    [ATTACK_KIND.CHARGE]: "boss-charge-line",
    [ATTACK_KIND.SLAM]: "boss-slam-zone",
    [ATTACK_KIND.DIVE]: "boss-dive-line"
});
const ATTACK_PRESENTATION_ACTIVE_STATE = Object.freeze({
    [RESIDENTIAL_PURSUIT_STATE.TELEGRAPH]: true,
    [RESIDENTIAL_PURSUIT_STATE.RISE]: true,
    [RESIDENTIAL_PURSUIT_STATE.TRACK]: true,
    [RESIDENTIAL_PURSUIT_STATE.CONFIRM]: true,
    [RESIDENTIAL_PURSUIT_STATE.ATTACK]: true
});

const EVENT = Object.freeze({
    TELEGRAPHED: "boss-attack-telegraphed",
    LOCKED: "boss-attack-locked",
    STARTED: "boss-attack-started",
    VALID_IMPACT: "boss-valid-architecture-impact",
    MISSED: "boss-attack-missed",
    WEAKPOINT_CLOSED: "boss-weakpoint-closed",
    REPOSITION_STARTED: "boss-phase-reposition-started",
    REPOSITION_COMPLETED: "boss-phase-reposition-completed"
});

const PHASE_DEFAULT = Object.freeze({
    0: Object.freeze({
        attackKind: ATTACK_KIND.CHARGE,
        chaseSeconds: 1.25,
        chaseSpeed: 260,
        telegraphSeconds: 0.6,
        attackSpeed: 760,
        attackDistance: 2200,
        recoverySeconds: 0.8,
        exposureSeconds: 6,
        rotationSpeed: 0
    }),
    1: Object.freeze({
        attackKind: ATTACK_KIND.SLAM,
        chaseSeconds: 1.25,
        chaseSpeed: 300,
        telegraphSeconds: 0.75,
        attackSpeed: 620,
        attackDistance: 1600,
        recoverySeconds: 0.8,
        exposureSeconds: 5,
        rotationSpeed: Math.PI * 1.5
    }),
    2: Object.freeze({
        attackKind: ATTACK_KIND.DIVE,
        chaseSeconds: 0.75,
        chaseSpeed: 360,
        telegraphSeconds: 0.75,
        confirmSeconds: 0.25,
        attackSpeed: 920,
        attackDistance: 2100,
        recoverySeconds: 0.8,
        exposureSeconds: 4,
        riseDistance: 280,
        rotationSpeed: 0
    })
});

const BODY_DEFAULT = Object.freeze({ width: 420, height: 180 });
const ZERO = Object.freeze({ x: 0, y: 0 });
const ANGULAR_CONFIG = Object.freeze({
    inertia: 1,
    maxSpeed: Math.PI * 3,
    airDamping: 0,
    uprightStrength: 0,
    uprightDamping: 0
});
const HAZARD_SCALE = 1.06;
const IMPACT_HINT_SECONDS = 0.45;
const COLLISION_SAFE_RATIO = 0.0001;
const REPOSITION_SPEED = 540;

class RotatingKinematicBody extends withAngularPhysics(KinematicPhysicsBody) {
    constructor(options) {
        super(options);
        this.initializeAngularPhysics(ANGULAR_CONFIG);
    }
}

function freeze(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freeze(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freeze(entry)])));
}

function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function point(value, fallback) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y) ? { x: value.x, y: value.y } : { ...fallback };
}

function vectorLength(vector) {
    return Math.hypot(vector.x, vector.y);
}

function normalized(vector, fallback = { x: 1, y: 0 }) {
    const length = vectorLength(vector);
    return length > Number.EPSILON ? { x: vector.x / length, y: vector.y / length } : { ...fallback };
}

function worldPosition(target) {
    const position = target?.physics?.position ?? target?.position;
    return Number.isFinite(position?.x) && Number.isFinite(position?.y) ? position : null;
}

function activePlayer(target) {
    return target?.lifeState !== "defeated" && target?.lifeState !== "dead" && target?.health !== 0;
}

function nearestPlayer(players, position, worldOffset) {
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const player of players ?? []) {
        if (!activePlayer(player)) continue;
        const world = worldPosition(player);
        if (!world) continue;
        const local = { x: world.x - worldOffset.x, y: world.y - worldOffset.y };
        const distance = Math.hypot(local.x - position.x, local.y - position.y);
        if (distance >= nearestDistance) continue;
        nearest = { id: player.id ?? player.playerId ?? null, position: local };
        nearestDistance = distance;
    }
    return nearest;
}

function currentMechanic(definition, phaseIndex) {
    const phase = definition.phases[phaseIndex] ?? {};
    const ids = phase.mechanicIds ?? [phase.mechanicId].filter(Boolean);
    return (
        definition.arena.mechanics.find(({ id, type }) => ids.includes(id) && MECHANIC_TYPE_TO_ATTACK[type]) ??
        definition.arena.mechanics.find(({ type }) => MECHANIC_TYPE_TO_ATTACK[type]) ??
        {}
    );
}

function phaseMechanics(definition, phaseIndex) {
    const phase = definition.phases[phaseIndex] ?? {};
    const ids = phase.mechanicIds ?? [phase.mechanicId].filter(Boolean);
    return definition.arena.mechanics.filter(({ id }) => ids.includes(id));
}

function validSurfaceIds(phase, mechanic) {
    const byId = Object.create(null);
    for (const id of [
        ...(phase.validSurfaceIds ?? []),
        ...(phase.vulnerability?.validSurfaceIds ?? []),
        ...(mechanic.validSurfaceIds ?? []),
        ...(mechanic.parameters?.validSurfaceIds ?? []),
        ...(mechanic.parameters?.validArchitectureSurfaceIds ?? [])
    ]) {
        if (typeof id === "string" && id) byId[id] = id;
    }
    return Object.freeze(Object.values(byId));
}

function bodyVertices(size, angle = 0, scale = 1) {
    const halfWidth = size.width * scale * 0.5;
    const halfHeight = size.height * scale * 0.5;
    return [
        { x: -halfWidth, y: -halfHeight * 0.72 },
        { x: -halfWidth * 0.78, y: -halfHeight },
        { x: halfWidth * 0.72, y: -halfHeight },
        { x: halfWidth, y: -halfHeight * 0.35 },
        { x: halfWidth, y: halfHeight * 0.65 },
        { x: halfWidth * 0.68, y: halfHeight },
        { x: -halfWidth * 0.72, y: halfHeight },
        { x: -halfWidth, y: halfHeight * 0.45 }
    ].map((vertex) => rotateVector(vertex, angle));
}

function phaseStartPosition(definition, phaseIndex, fallback) {
    const phase = definition.phases[phaseIndex] ?? {};
    const mechanic = currentMechanic(definition, phaseIndex);
    const previousReposition =
        phaseIndex > 0
            ? phaseMechanics(definition, phaseIndex - 1).find(({ type }) => type === "phase-reposition")
            : null;
    return point(
        phase.bossPosition ?? phase.startPosition ?? mechanic.parameters?.bossStartPosition,
        phaseIndex === 0
            ? fallback
            : (previousReposition?.position ?? mechanic.position ?? mechanic.parameters?.repositionTarget ?? fallback)
    );
}

function phaseConfig(definition, phaseIndex) {
    const fallback = PHASE_DEFAULT[phaseIndex] ?? PHASE_DEFAULT[0];
    const phase = definition.phases[phaseIndex] ?? {};
    const mechanic = currentMechanic(definition, phaseIndex);
    const parameters = mechanic.parameters ?? {};
    return freeze({
        attackKind: MECHANIC_TYPE_TO_ATTACK[mechanic.type] ?? fallback.attackKind,
        chaseSeconds: positive(parameters.chaseSeconds ?? parameters.recoverySeconds, fallback.chaseSeconds),
        chaseSpeed: positive(parameters.chaseSpeed, fallback.chaseSpeed),
        telegraphSeconds: positive(parameters.telegraphSeconds ?? parameters.windupSeconds, fallback.telegraphSeconds),
        trackSeconds: positive(parameters.trackSeconds, fallback.telegraphSeconds),
        riseSeconds: positive(parameters.riseSeconds, 0.35),
        confirmSeconds: positive(parameters.confirmSeconds, fallback.confirmSeconds ?? 0.25),
        directionLockSeconds: positive(parameters.directionLockSeconds, 0.2),
        attackSpeed: positive(
            parameters.travelSpeed ?? parameters.attackSpeed ?? parameters.slamSpeed ?? parameters.diveSpeed,
            fallback.attackSpeed
        ),
        attackDistance: positive(parameters.travelDistance ?? parameters.attackDistance, fallback.attackDistance),
        recoverySeconds: positive(
            parameters.missRecoverySeconds ?? parameters.recoverySeconds,
            fallback.recoverySeconds
        ),
        exposureSeconds: positive(phase.vulnerability?.durationSeconds, fallback.exposureSeconds),
        riseDistance: positive(parameters.riseDistance, fallback.riseDistance ?? 1),
        rotationSpeed: finite(parameters.rotationSpeed, fallback.rotationSpeed),
        validSurfaceIds: validSurfaceIds(phase, mechanic)
    });
}

export class ResidentialSecurityPursuitRuntime {
    constructor(definition, snapshot = null) {
        this.definition = definition;
        this.bossSpec = definition.arena?.boss ?? {};
        this.bodySize = freeze({
            width: positive(this.bossSpec.collider?.width, BODY_DEFAULT.width),
            height: positive(this.bossSpec.collider?.height, BODY_DEFAULT.height)
        });
        this.phaseConfigs = freeze(definition.phases.map((_, index) => phaseConfig(definition, index)));
        this.phaseStartPositions = freeze(
            definition.phases.map((_, index) => phaseStartPosition(definition, index, this.bossSpec.position ?? ZERO))
        );
        this.body = new RotatingKinematicBody({
            id: this.bossSpec.actorId ?? `${definition.id}:pursuer`,
            actorKind: PHYSICS_ACTOR_KIND.BOSS,
            position: this.phaseStartPositions[0],
            collider: this.#collider(),
            canGroundActors: true,
            ropeAttachment: true
        });
        this.hazardBody = new KinematicPhysicsBody({
            id: `${definition.id}:attack-hazard`,
            actorKind: PHYSICS_ACTOR_KIND.BOSS_HAZARD,
            position: this.phaseStartPositions[0],
            collider: this.#collider(HAZARD_SCALE)
        });
        this.reset(0);
        if (snapshot) this.restore(snapshot);
    }

    #config() {
        return this.phaseConfigs[this.phaseIndex] ?? this.phaseConfigs[0];
    }

    #collider(scale = 1) {
        return new PolygonCollider({ vertices: bodyVertices(this.bodySize, this.body?.angle ?? 0, scale) });
    }

    #syncColliders() {
        this.body.replaceCollider(this.#collider());
        this.hazardBody.replaceCollider(this.#collider(HAZARD_SCALE));
    }

    #holdBodies() {
        this.body.holdKinematicPosition();
        this.hazardBody.setKinematicPosition(this.body.position, 0);
        this.hazardBody.holdKinematicPosition();
    }

    #setPosition(position, dt) {
        this.body.setKinematicPosition(position, dt);
        this.hazardBody.setKinematicPosition(position, dt);
    }

    #setAngle(angle, angularVelocity = 0) {
        this.body.setAngularState(angle, angularVelocity);
        this.#syncColliders();
    }

    #beginChase() {
        this.state = RESIDENTIAL_PURSUIT_STATE.CHASE;
        this.remainingSeconds = this.#config().chaseSeconds;
        this.weakpointExposed = false;
        this.impactSurfaceId = null;
        this.impactHintRemainingSeconds = 0;
        this.#holdBodies();
        return null;
    }

    #phaseZone() {
        const phase = this.definition.phases[this.phaseIndex] ?? {};
        return (
            phase.arenaBounds ??
            phase.bounds ??
            this.definition.arena.phaseZones?.find(
                (zone) =>
                    zone.phase === this.phaseIndex + 1 ||
                    zone.phaseIndex === this.phaseIndex ||
                    zone.phaseId === phase.id ||
                    zone.id === phase.zoneId
            )?.bounds ??
            null
        );
    }

    #playerReachedPhase(context) {
        const bounds = this.#phaseZone();
        if (!bounds) return true;
        const offset = context.worldOffset ?? ZERO;
        return (context.players ?? []).some((player) => {
            if (!activePlayer(player)) return false;
            const position = worldPosition(player);
            return (
                position &&
                position.x >= bounds.x + offset.x &&
                position.x <= bounds.x + bounds.width + offset.x &&
                position.y >= bounds.y + offset.y &&
                position.y <= bounds.y + bounds.height + offset.y
            );
        });
    }

    #surfaceBounds(surface, offset) {
        if ([surface.x, surface.y, surface.width, surface.height].every(Number.isFinite)) {
            return {
                x: surface.x - offset.x,
                y: surface.y - offset.y,
                width: surface.width,
                height: surface.height
            };
        }
        const vertices = surface.vertices ?? [];
        const xs = vertices.map(({ x }) => x - offset.x);
        const ys = vertices.map(({ y }) => y - offset.y);
        return xs.length > 0
            ? {
                  x: Math.min(...xs),
                  y: Math.min(...ys),
                  width: Math.max(...xs) - Math.min(...xs),
                  height: Math.max(...ys) - Math.min(...ys)
              }
            : null;
    }

    #repositionCandidateClear(position, context) {
        const body = {
            x: position.x - this.bodySize.width * 0.5,
            y: position.y - this.bodySize.height * 0.5,
            width: this.bodySize.width,
            height: this.bodySize.height
        };
        const offset = context.worldOffset ?? ZERO;
        return (context.surfaces ?? []).every((surface) => {
            if (surface.collision === false) return true;
            const bounds = this.#surfaceBounds(surface, offset);
            return (
                !bounds ||
                body.x + body.width <= bounds.x ||
                body.x >= bounds.x + bounds.width ||
                body.y + body.height <= bounds.y ||
                body.y >= bounds.y + bounds.height
            );
        });
    }

    #resolveRepositionTarget(context) {
        const desired = this.phaseStartPositions[this.phaseIndex];
        if (this.#repositionCandidateClear(desired, context)) return { ...desired };
        const zone = this.#phaseZone();
        if (!zone) return { ...desired };
        const halfWidth = this.bodySize.width * 0.5;
        const halfHeight = this.bodySize.height * 0.5;
        const step = Math.max(80, Math.min(halfWidth, halfHeight));
        const candidates = [];
        for (let y = zone.y + halfHeight; y <= zone.y + zone.height - halfHeight; y += step) {
            for (let x = zone.x + halfWidth; x <= zone.x + zone.width - halfWidth; x += step) {
                candidates.push({ x, y });
            }
        }
        candidates.sort((left, right) => {
            if (this.#config().attackKind === ATTACK_KIND.DIVE && left.y !== right.y) return left.y - right.y;
            return (
                Math.hypot(left.x - desired.x, left.y - desired.y) -
                Math.hypot(right.x - desired.x, right.y - desired.y)
            );
        });
        return candidates.find((candidate) => this.#repositionCandidateClear(candidate, context)) ?? { ...desired };
    }

    #advanceChase(dt, context) {
        const offset = context.worldOffset ?? ZERO;
        const target = nearestPlayer(context.players, this.body.position, offset);
        if (!target) {
            this.#holdBodies();
            return;
        }
        const deltaToTarget = {
            x: target.position.x - this.body.position.x,
            y: target.position.y - this.body.position.y
        };
        const distanceToTarget = vectorLength(deltaToTarget);
        const stopDistance = Math.max(this.bodySize.width, this.bodySize.height) * 0.8;
        if (distanceToTarget <= stopDistance) {
            this.#holdBodies();
            return;
        }
        const direction = normalized(deltaToTarget, this.direction);
        const distance = Math.min(this.#config().chaseSpeed * dt, distanceToTarget - stopDistance);
        const delta = { x: direction.x * distance, y: direction.y * distance };
        const worldStart = { x: this.body.position.x + offset.x, y: this.body.position.y + offset.y };
        const hit = this.body.collider.firstSolidContactAlong(worldStart, delta, context.surfaces ?? []);
        const amount = hit ? Math.max(0, hit.amount - COLLISION_SAFE_RATIO) : 1;
        this.direction = direction;
        this.#setPosition(
            { x: this.body.position.x + delta.x * amount, y: this.body.position.y + delta.y * amount },
            dt
        );
    }

    #targetForAttack(context, { retainSelection = false } = {}) {
        const worldOffset = context.worldOffset ?? ZERO;
        const selected = retainSelection
            ? (context.players ?? []).find(({ id, playerId }) => (id ?? playerId) === this.targetPlayerId)
            : null;
        const selectedWorld = worldPosition(selected);
        if (selectedWorld) {
            return { x: selectedWorld.x - worldOffset.x, y: selectedWorld.y - worldOffset.y };
        }
        const nearest = retainSelection ? null : nearestPlayer(context.players, this.body.position, worldOffset);
        if (nearest) this.targetPlayerId = nearest.id;
        return (
            nearest?.position ?? {
                x: this.body.position.x + this.direction.x * this.#config().attackDistance,
                y: this.body.position.y + this.direction.y * this.#config().attackDistance
            }
        );
    }

    #beginTelegraph(context) {
        const config = this.#config();
        const target = this.#targetForAttack(context);
        this.state =
            config.attackKind === ATTACK_KIND.DIVE
                ? RESIDENTIAL_PURSUIT_STATE.RISE
                : RESIDENTIAL_PURSUIT_STATE.TELEGRAPH;
        this.remainingSeconds = config.attackKind === ATTACK_KIND.DIVE ? config.riseSeconds : config.telegraphSeconds;
        this.attackStart = { x: this.body.position.x, y: this.body.position.y };
        this.lockedTarget = { ...target };
        this.direction = normalized(
            {
                x: this.lockedTarget.x - this.attackStart.x,
                y: this.lockedTarget.y - this.attackStart.y
            },
            this.direction
        );
        this.attackTarget = {
            x:
                config.attackKind === ATTACK_KIND.DIVE
                    ? this.attackStart.x
                    : this.attackStart.x + this.direction.x * config.attackDistance,
            y:
                config.attackKind === ATTACK_KIND.DIVE
                    ? this.attackStart.y - config.riseDistance
                    : this.attackStart.y + this.direction.y * config.attackDistance
        };
        this.movementProgress = 0;
        this.#holdBodies();
        return EVENT.TELEGRAPHED;
    }

    #beginDiveTrack(context) {
        this.state = RESIDENTIAL_PURSUIT_STATE.TRACK;
        this.remainingSeconds = this.#config().trackSeconds;
        this.attackStart = { x: this.body.position.x, y: this.body.position.y };
        this.lockedTarget = { ...this.#targetForAttack(context, { retainSelection: true }) };
        this.attackTarget = { ...this.lockedTarget };
        this.#holdBodies();
        return EVENT.TELEGRAPHED;
    }

    #lockTelegraphedAttack() {
        this.state = RESIDENTIAL_PURSUIT_STATE.CONFIRM;
        this.remainingSeconds = this.#config().directionLockSeconds;
        this.attackStart = { x: this.body.position.x, y: this.body.position.y };
        this.direction = normalized(
            {
                x: this.lockedTarget.x - this.attackStart.x,
                y: this.lockedTarget.y - this.attackStart.y
            },
            this.direction
        );
        this.attackTarget = {
            x: this.attackStart.x + this.direction.x * this.#config().attackDistance,
            y: this.attackStart.y + this.direction.y * this.#config().attackDistance
        };
        this.#holdBodies();
        return EVENT.LOCKED;
    }

    #lockTrackedDive() {
        this.state = RESIDENTIAL_PURSUIT_STATE.CONFIRM;
        this.remainingSeconds = this.#config().confirmSeconds;
        this.attackStart = { x: this.body.position.x, y: this.body.position.y };
        this.direction = normalized(
            {
                x: this.lockedTarget.x - this.attackStart.x,
                y: this.lockedTarget.y - this.attackStart.y
            },
            this.direction
        );
        this.attackTarget = {
            x: this.attackStart.x + this.direction.x * this.#config().attackDistance,
            y: this.attackStart.y + this.direction.y * this.#config().attackDistance
        };
        this.#holdBodies();
        return EVENT.LOCKED;
    }

    #beginAttack() {
        this.state = RESIDENTIAL_PURSUIT_STATE.ATTACK;
        this.hazardSequence += 1;
        this.movementProgress = 0;
        if (this.#config().attackKind !== ATTACK_KIND.SLAM) {
            this.#setAngle(Math.atan2(this.direction.y, this.direction.x));
        } else {
            this.#setAngle(this.body.angle, this.#config().rotationSpeed);
        }
        return EVENT.STARTED;
    }

    #beginRecovery(surfaceId = null, impactPosition = null) {
        this.state = RESIDENTIAL_PURSUIT_STATE.RECOVERY;
        this.remainingSeconds = this.#config().recoverySeconds;
        this.weakpointExposed = false;
        this.impactSurfaceId = surfaceId;
        this.impactPosition = impactPosition ? { ...impactPosition } : null;
        this.impactHintRemainingSeconds = surfaceId ? IMPACT_HINT_SECONDS : 0;
        this.#setAngle(0);
        this.#holdBodies();
        return EVENT.MISSED;
    }

    #beginExposure(surfaceId, impactPosition) {
        this.state = RESIDENTIAL_PURSUIT_STATE.EXPOSED;
        this.remainingSeconds = this.#config().exposureSeconds;
        this.weakpointExposed = true;
        this.impactSurfaceId = surfaceId;
        this.impactPosition = { ...impactPosition };
        this.impactHintRemainingSeconds = IMPACT_HINT_SECONDS;
        if (this.#config().attackKind === ATTACK_KIND.SLAM) this.#setAngle(0);
        this.#holdBodies();
        return EVENT.VALID_IMPACT;
    }

    #advanceAttack(dt, context) {
        const config = this.#config();
        if (config.attackKind === ATTACK_KIND.SLAM) {
            this.body.integrateAngularPhysics(dt);
            this.#syncColliders();
        }
        const remainingDistance = Math.max(
            0,
            config.attackDistance -
                Math.hypot(this.body.position.x - this.attackStart.x, this.body.position.y - this.attackStart.y)
        );
        const distance = Math.min(remainingDistance, config.attackSpeed * dt);
        const delta = { x: this.direction.x * distance, y: this.direction.y * distance };
        const worldOffset = context.worldOffset ?? ZERO;
        const worldStart = { x: this.body.position.x + worldOffset.x, y: this.body.position.y + worldOffset.y };
        const hit = this.body.collider.firstSolidContactAlong(worldStart, delta, context.surfaces ?? []);
        if (hit) {
            const amount = Math.max(0, hit.amount - COLLISION_SAFE_RATIO);
            const localPosition = {
                x: this.body.position.x + delta.x * amount,
                y: this.body.position.y + delta.y * amount
            };
            this.#setPosition(localPosition, dt);
            const impactPosition = { x: localPosition.x, y: localPosition.y };
            const valid = config.validSurfaceIds.includes(hit.surface.id);
            return valid
                ? freeze({ changed: true, eventType: this.#beginExposure(hit.surface.id, impactPosition) })
                : freeze({ changed: true, eventType: this.#beginRecovery(hit.surface.id, impactPosition) });
        }
        const next = { x: this.body.position.x + delta.x, y: this.body.position.y + delta.y };
        this.#setPosition(next, dt);
        const traveled = Math.hypot(next.x - this.attackStart.x, next.y - this.attackStart.y);
        this.movementProgress = Math.min(1, traveled / config.attackDistance);
        if (this.movementProgress >= 1) {
            return freeze({ changed: true, eventType: this.#beginRecovery() });
        }
        return freeze({ changed: true, eventType: null });
    }

    #advanceReposition(dt, context) {
        if (!this.repositionTargetResolved) {
            this.repositionTarget = this.#resolveRepositionTarget(context);
            this.repositionTargetResolved = true;
        }
        const delta = {
            x: this.repositionTarget.x - this.body.position.x,
            y: this.repositionTarget.y - this.body.position.y
        };
        const distance = vectorLength(delta);
        if (distance <= REPOSITION_SPEED * dt) {
            this.#setPosition(this.repositionTarget, dt);
            this.repositionComplete = true;
            this.#holdBodies();
            if (!this.#playerReachedPhase(context)) return freeze({ changed: true, eventType: null });
            this.#beginChase();
            return freeze({ changed: true, eventType: EVENT.REPOSITION_COMPLETED });
        }
        const direction = normalized(delta);
        this.direction = direction;
        this.#setPosition(
            {
                x: this.body.position.x + direction.x * REPOSITION_SPEED * dt,
                y: this.body.position.y + direction.y * REPOSITION_SPEED * dt
            },
            dt
        );
        return freeze({ changed: true, eventType: null });
    }

    reset(phaseIndex) {
        this.phaseIndex = phaseIndex;
        this.state = RESIDENTIAL_PURSUIT_STATE.CHASE;
        this.remainingSeconds = this.#config().chaseSeconds;
        this.direction = { x: 1, y: 0 };
        this.lockedTarget = { ...this.phaseStartPositions[phaseIndex] };
        this.attackStart = { ...this.phaseStartPositions[phaseIndex] };
        this.attackTarget = { ...this.phaseStartPositions[phaseIndex] };
        this.repositionTarget = { ...this.phaseStartPositions[phaseIndex] };
        this.targetPlayerId = null;
        this.weakpointExposed = false;
        this.hazardSequence = 0;
        this.movementProgress = 0;
        this.impactSurfaceId = null;
        this.impactPosition = null;
        this.impactHintRemainingSeconds = 0;
        this.repositionComplete = false;
        this.repositionTargetResolved = true;
        this.#setPosition(this.phaseStartPositions[phaseIndex], 0);
        this.#setAngle(0);
        this.#holdBodies();
    }

    advance(dt, context = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Residential Pursuit dt must be non-negative");
        context ??= {};
        if (dt === 0 || this.state === RESIDENTIAL_PURSUIT_STATE.STOPPED) {
            return freeze({ changed: false, eventType: null });
        }
        this.impactHintRemainingSeconds = Math.max(0, this.impactHintRemainingSeconds - dt);
        if (this.state === RESIDENTIAL_PURSUIT_STATE.ATTACK) return this.#advanceAttack(dt, context);
        if (this.state === RESIDENTIAL_PURSUIT_STATE.REPOSITION) {
            if (this.repositionComplete && !this.#playerReachedPhase(context)) {
                this.#holdBodies();
                return freeze({ changed: true, eventType: null });
            }
            if (this.repositionComplete) {
                this.#beginChase();
                return freeze({ changed: true, eventType: EVENT.REPOSITION_COMPLETED });
            }
            return this.#advanceReposition(dt, context);
        }

        if (this.state === RESIDENTIAL_PURSUIT_STATE.CHASE) this.#advanceChase(dt, context);

        if (this.state === RESIDENTIAL_PURSUIT_STATE.RISE) {
            const target = this.#targetForAttack(context, { retainSelection: true });
            this.lockedTarget = { ...target };
            const riseDelta = {
                x: this.attackTarget.x - this.body.position.x,
                y: this.attackTarget.y - this.body.position.y
            };
            const riseDistance = vectorLength(riseDelta);
            if (riseDistance > 0) {
                const riseStep = Math.min(
                    riseDistance,
                    (this.#config().riseDistance / this.#config().riseSeconds) * dt
                );
                const riseDirection = normalized(riseDelta, { x: 0, y: -1 });
                this.#setPosition(
                    {
                        x: this.body.position.x + riseDirection.x * riseStep,
                        y: this.body.position.y + riseDirection.y * riseStep
                    },
                    dt
                );
            }
        }

        if (this.state === RESIDENTIAL_PURSUIT_STATE.TRACK) {
            const target = this.#targetForAttack(context, { retainSelection: true });
            this.lockedTarget = { ...target };
            this.attackTarget = { ...target };
            this.direction = normalized(
                { x: target.x - this.body.position.x, y: target.y - this.body.position.y },
                this.direction
            );
        }
        if (this.state !== RESIDENTIAL_PURSUIT_STATE.RISE) this.#holdBodies();
        this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);
        if (this.remainingSeconds > 0) return freeze({ changed: true, eventType: null });

        if (this.state === RESIDENTIAL_PURSUIT_STATE.CHASE) {
            return freeze({ changed: true, eventType: this.#beginTelegraph(context) });
        }
        if (this.state === RESIDENTIAL_PURSUIT_STATE.RISE) {
            return freeze({ changed: true, eventType: this.#beginDiveTrack(context) });
        }
        if (this.state === RESIDENTIAL_PURSUIT_STATE.TRACK) {
            return freeze({ changed: true, eventType: this.#lockTrackedDive() });
        }
        if (this.state === RESIDENTIAL_PURSUIT_STATE.TELEGRAPH) {
            return freeze({ changed: true, eventType: this.#lockTelegraphedAttack() });
        }
        if (this.state === RESIDENTIAL_PURSUIT_STATE.CONFIRM) {
            return freeze({ changed: true, eventType: this.#beginAttack() });
        }
        if (this.state === RESIDENTIAL_PURSUIT_STATE.EXPOSED) {
            this.weakpointExposed = false;
            this.state = RESIDENTIAL_PURSUIT_STATE.RECOVERY;
            this.remainingSeconds = this.#config().recoverySeconds;
            return freeze({ changed: true, eventType: EVENT.WEAKPOINT_CLOSED });
        }
        if (this.state === RESIDENTIAL_PURSUIT_STATE.RECOVERY) {
            return freeze({ changed: true, eventType: this.#beginChase() });
        }
        return freeze({ changed: false, eventType: null });
    }

    completePhase(nextPhaseIndex) {
        this.phaseIndex = nextPhaseIndex;
        this.state = RESIDENTIAL_PURSUIT_STATE.REPOSITION;
        this.remainingSeconds = 0;
        this.repositionTarget = { ...this.phaseStartPositions[nextPhaseIndex] };
        this.repositionComplete = false;
        this.repositionTargetResolved = false;
        this.weakpointExposed = false;
        this.movementProgress = 0;
        this.#setAngle(0);
        this.#holdBodies();
        return freeze({ eventType: EVENT.REPOSITION_STARTED });
    }

    stop() {
        this.state = RESIDENTIAL_PURSUIT_STATE.STOPPED;
        this.remainingSeconds = 0;
        this.weakpointExposed = false;
        this.#setAngle(0);
        this.#holdBodies();
    }

    isWeakpointActive(targetId) {
        return this.weakpointExposed && targetId === this.definition.phases[this.phaseIndex].weakTargetId;
    }

    isCombatActive() {
        return this.state !== RESIDENTIAL_PURSUIT_STATE.REPOSITION && this.state !== RESIDENTIAL_PURSUIT_STATE.STOPPED;
    }

    collisionActors(offset = ZERO) {
        const actors = [this.body.collisionActor(offset)];
        if (this.state === RESIDENTIAL_PURSUIT_STATE.ATTACK) actors.push(this.hazardBody.collisionActor(offset));
        return Object.freeze(actors);
    }

    #weakpointPosition(offset) {
        const fallbackByPhase = [
            { x: -this.bodySize.width * 0.4, y: 0 },
            { x: 0, y: this.bodySize.height * 0.38 },
            { x: 0, y: -this.bodySize.height * 0.25 }
        ];
        const authored = this.definition.phases[this.phaseIndex]?.vulnerability?.offset;
        const local = rotateVector(point(authored, fallbackByPhase[this.phaseIndex] ?? ZERO), this.body.angle);
        return { x: this.body.position.x + local.x + offset.x, y: this.body.position.y + local.y + offset.y };
    }

    presentationObjects(offset = ZERO) {
        const config = this.#config();
        const weakpointRadius = positive(this.definition.phases[this.phaseIndex].vulnerability?.radius, 45);
        const attackVisible = ATTACK_PRESENTATION_ACTIVE_STATE[this.state] === true;
        const attackDelta = {
            x: this.attackTarget.x - this.attackStart.x,
            y: this.attackTarget.y - this.attackStart.y
        };
        const attackLength = Math.max(1, vectorLength(attackDelta));
        const attackCenter = {
            x: this.attackStart.x + attackDelta.x * 0.5 + offset.x,
            y: this.attackStart.y + attackDelta.y * 0.5 + offset.y
        };
        return freeze([
            {
                id: this.body.id,
                kind: "boss-residential-pursuer",
                physicsBody: true,
                variant: config.attackKind,
                state: this.state,
                position: { x: this.body.position.x + offset.x, y: this.body.position.y + offset.y },
                velocity: { x: this.body.velocity.x, y: this.body.velocity.y },
                size: this.bodySize,
                bounds: this.bodySize,
                rotation: this.body.angle,
                direction: this.direction,
                damaging: false,
                movementProgress: this.movementProgress,
                ropeAttachable: this.body.ropeAttachment !== null
            },
            {
                id: this.hazardBody.id,
                kind: PRESENTATION_KIND_BY_ATTACK[config.attackKind],
                hazardKind: config.attackKind,
                state: this.state,
                actionState: this.state,
                active: attackVisible && this.state !== RESIDENTIAL_PURSUIT_STATE.ATTACK,
                damaging: false,
                hazardActive: this.state === RESIDENTIAL_PURSUIT_STATE.ATTACK,
                position:
                    config.attackKind === ATTACK_KIND.SLAM
                        ? { x: this.lockedTarget.x + offset.x, y: this.lockedTarget.y + offset.y }
                        : attackCenter,
                size:
                    config.attackKind === ATTACK_KIND.SLAM
                        ? { width: this.bodySize.width * 1.4, height: this.bodySize.width * 1.4 }
                        : { width: attackLength, height: this.bodySize.height * HAZARD_SCALE },
                rotation: Math.atan2(attackDelta.y, attackDelta.x),
                direction: this.direction,
                movementProgress: this.movementProgress,
                path: { startX: this.attackStart.x + offset.x, targetX: this.attackTarget.x + offset.x }
            },
            {
                id: this.definition.phases[this.phaseIndex].weakTargetId,
                kind: "boss-weakpoint",
                variant: this.definition.phases[this.phaseIndex].vulnerability?.visualPresetId,
                state: this.weakpointExposed ? "exposed" : "secured",
                active: true,
                position: this.#weakpointPosition(offset),
                size: { width: weakpointRadius * 2, height: weakpointRadius * 2 },
                radius: weakpointRadius
            },
            {
                id: `${this.definition.id}:architecture-impact`,
                kind: "boss-architecture-impact",
                variant: "dust-spark",
                state: this.weakpointExposed ? "valid" : "invalid",
                active: this.impactHintRemainingSeconds > 0 && this.impactPosition !== null,
                position: this.impactPosition
                    ? { x: this.impactPosition.x + offset.x, y: this.impactPosition.y + offset.y }
                    : { x: this.body.position.x + offset.x, y: this.body.position.y + offset.y },
                size: { width: 180, height: 180 },
                remainingSeconds: this.impactHintRemainingSeconds,
                surfaceId: this.impactSurfaceId
            }
        ]);
    }

    beamGeometry(offset = ZERO) {
        return freeze({
            id: `${this.definition.id}:unused-beam`,
            position: { x: this.body.position.x + offset.x, y: this.body.position.y + offset.y },
            velocity: { x: 0, y: 0 },
            size: { width: 1, height: 1 },
            active: false,
            damaging: false
        });
    }

    snapshot() {
        const config = this.#config();
        return freeze({
            state: this.state,
            phaseIndex: this.phaseIndex,
            positionX: this.body.position.x,
            positionY: this.body.position.y,
            velocity: { x: this.body.velocity.x, y: this.body.velocity.y },
            angle: this.body.angle,
            angularVelocity: this.body.angularVelocity,
            direction: this.direction,
            remainingSeconds: this.remainingSeconds,
            movementProgress: this.movementProgress,
            motionStartX: this.attackStart.x,
            motionTargetX: this.attackTarget.x,
            attackStart: this.attackStart,
            attackTarget: this.attackTarget,
            lockedTarget: this.lockedTarget,
            repositionTarget: this.repositionTarget,
            repositionComplete: this.repositionComplete,
            repositionTargetResolved: this.repositionTargetResolved,
            attackKind: config.attackKind,
            hazardKind: this.state === RESIDENTIAL_PURSUIT_STATE.ATTACK ? config.attackKind : null,
            hazardActorId: this.state === RESIDENTIAL_PURSUIT_STATE.ATTACK ? this.hazardBody.id : null,
            hazardSequence: this.hazardSequence,
            targetPlayerId: this.targetPlayerId,
            weakpointExposed: this.weakpointExposed,
            persistentWeakpoint: false,
            activeTargetId: this.weakpointExposed ? this.definition.phases[this.phaseIndex].weakTargetId : null,
            impactSurfaceId: this.impactSurfaceId,
            impactPosition: this.impactPosition,
            impactHintRemainingSeconds: this.impactHintRemainingSeconds,
            body: this.body.snapshot(),
            hazard: this.hazardBody.snapshot()
        });
    }

    restore(snapshot) {
        if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
            throw new Error("Residential Pursuit snapshot must be an object");
        }
        if (!Object.values(RESIDENTIAL_PURSUIT_STATE).includes(snapshot.state)) {
            throw new Error("invalid Residential Pursuit state");
        }
        if (!Number.isSafeInteger(snapshot.phaseIndex) || snapshot.phaseIndex !== this.phaseIndex) {
            throw new Error("invalid Residential Pursuit phaseIndex");
        }
        for (const [label, value] of Object.entries({
            remainingSeconds: snapshot.remainingSeconds,
            movementProgress: snapshot.movementProgress,
            impactHintRemainingSeconds: snapshot.impactHintRemainingSeconds
        })) {
            if (!Number.isFinite(value) || value < 0 || (label === "movementProgress" && value > 1)) {
                throw new Error(`invalid Residential Pursuit ${label}`);
            }
        }
        if (!Number.isSafeInteger(snapshot.hazardSequence) || snapshot.hazardSequence < 0) {
            throw new Error("invalid Residential Pursuit hazardSequence");
        }
        this.state = snapshot.state;
        this.remainingSeconds = snapshot.remainingSeconds;
        this.movementProgress = snapshot.movementProgress;
        this.direction = point(snapshot.direction, { x: 1, y: 0 });
        this.attackStart = point(snapshot.attackStart, this.phaseStartPositions[this.phaseIndex]);
        this.attackTarget = point(snapshot.attackTarget, this.attackStart);
        this.lockedTarget = point(snapshot.lockedTarget, this.attackTarget);
        this.repositionTarget = point(snapshot.repositionTarget, this.phaseStartPositions[this.phaseIndex]);
        this.repositionComplete = snapshot.repositionComplete === true;
        this.repositionTargetResolved = snapshot.repositionTargetResolved !== false;
        this.targetPlayerId = snapshot.targetPlayerId ?? null;
        this.weakpointExposed = snapshot.weakpointExposed === true;
        this.hazardSequence = snapshot.hazardSequence;
        this.impactSurfaceId = snapshot.impactSurfaceId ?? null;
        this.impactPosition = snapshot.impactPosition ? point(snapshot.impactPosition, ZERO) : null;
        this.impactHintRemainingSeconds = snapshot.impactHintRemainingSeconds;
        this.body.restore(snapshot.body);
        this.body.setAngularState(finite(snapshot.angle, 0), finite(snapshot.angularVelocity, 0));
        this.hazardBody.restore(snapshot.hazard);
        this.#syncColliders();
        return this;
    }
}
