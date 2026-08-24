import { defineObjectOwner } from "../objects/GameObject.js";
import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { PROJECTILE_MOTION } from "../physics/ProjectileMotionDefinition.js";
import {
    withHomingProjectileSteering,
    withProjectileLifetime,
    withProjectileMotionSimulation
} from "../physics/ProjectileMotionMixin.js";
import { withEnemyHitPrediction, withPlayerImpactPrediction } from "./ProjectileClientCollision.js";
import {
    PROJECTILE_COLLISION_STATE,
    PROJECTILE_DEFINITION,
    PROJECTILE_HOMING,
    PROJECTILE_INITIAL_COLLISION_STATE,
    PROJECTILE_INVISIBLE_COLLISION_STATES,
    PROJECTILE_KEY,
    PROJECTILE_MOTION_KIND,
    PROJECTILE_REJECTED_COLLISION_STATE,
    PROJECTILE_TYPE
} from "./ProjectileDefinition.js";
import { withProjectileRenderSnapshot } from "./ProjectileRenderSnapshot.js";

export const PROJECTILE_MOTION_CAPABILITY = PROJECTILE_MOTION.CAPABILITY;

function resolveHomingTurnRate(options) {
    const turnRateRadiansPerSecond =
        options.turnRateRadiansPerSecond ?? PROJECTILE_HOMING.DEFAULT_TURN_RATE_RADIANS_PER_SECOND;
    if (!Number.isFinite(turnRateRadiansPerSecond) || turnRateRadiansPerSecond <= 0) {
        throw new Error("homing projectile turn rate must be positive and finite");
    }
    return turnRateRadiansPerSecond;
}

function resolveProjectileLifetime(lifetimeSeconds) {
    if (lifetimeSeconds === null || lifetimeSeconds === undefined) return null;
    if (!Number.isFinite(lifetimeSeconds) || lifetimeSeconds <= 0) {
        throw new Error("projectile lifetime must be positive and finite");
    }
    return lifetimeSeconds;
}

class ProjectileObject extends withProjectileLifetime(withProjectileRenderSnapshot(SimulationDrivenObject)) {
    #clientCollisionState;
    #collisionRejectionPolicy;
    #renderCollection;
    #targetStateCollection;
    #usesOwnerPredictionId;

    constructor({
        id,
        ownerId,
        targetId,
        position,
        velocity,
        damage,
        radius,
        predictionId = null,
        speed = Math.hypot(velocity.x, velocity.y),
        predictCollision = false,
        canCutRope = false,
        motionKind,
        visualPresetId = null,
        turnRateRadiansPerSecond = null,
        lifetimeSeconds = null,
        objectType,
        targetStateCollection,
        renderCollection,
        collisionRejectionPolicy,
        usesOwnerPredictionId
    }) {
        super({ id });
        defineObjectOwner(this, ownerId);
        this.initializeProjectileMotion({ position, velocity });
        this.targetId = targetId;
        this.damage = damage;
        this.radius = radius;
        this.speed = speed;
        this.definition = Object.freeze({
            objectType,
            motionKind,
            visualPresetId,
            turnRateRadiansPerSecond,
            lifetimeSeconds: resolveProjectileLifetime(lifetimeSeconds)
        });
        this.canCutRope = canCutRope;
        if (predictionId !== null) this.predictionId = predictionId;
        this.#targetStateCollection = targetStateCollection;
        this.#renderCollection = renderCollection;
        this.#collisionRejectionPolicy = collisionRejectionPolicy;
        this.#usesOwnerPredictionId = usesOwnerPredictionId;
        this.#clientCollisionState = PROJECTILE_INITIAL_COLLISION_STATE[Boolean(predictCollision)];
    }

    get renderCollection() {
        return this.#renderCollection;
    }

    get targetStateCollection() {
        return this.#targetStateCollection;
    }

    get objectType() {
        return this.definition.objectType;
    }

    get motionKind() {
        return this.definition.motionKind;
    }

    get visualPresetId() {
        return this.definition.visualPresetId;
    }

    get turnRateRadiansPerSecond() {
        return this.definition.turnRateRadiansPerSecond;
    }

    get lifetimeSeconds() {
        return this.definition.lifetimeSeconds;
    }

    isClientCollisionPredictionEnabled() {
        return this.#clientCollisionState !== PROJECTILE_COLLISION_STATE.DISABLED;
    }

    observeClientCollision(isOverlapping) {
        if (this.#clientCollisionState === PROJECTILE_COLLISION_STATE.WAITING_SEPARATION) {
            if (!isOverlapping) this.#clientCollisionState = PROJECTILE_COLLISION_STATE.READY;
            return false;
        }
        return this.#clientCollisionState === PROJECTILE_COLLISION_STATE.READY && isOverlapping;
    }

    beginClientCollision() {
        if (this.#clientCollisionState !== PROJECTILE_COLLISION_STATE.READY) return false;
        this.#clientCollisionState = PROJECTILE_COLLISION_STATE.PENDING;
        return true;
    }

    rejectClientCollision() {
        if (this.#clientCollisionState !== PROJECTILE_COLLISION_STATE.PENDING) return false;
        this.#clientCollisionState = PROJECTILE_REJECTED_COLLISION_STATE[this.#collisionRejectionPolicy];
        return true;
    }

    isClientVisible() {
        return !PROJECTILE_INVISIBLE_COLLISION_STATES.includes(this.#clientCollisionState);
    }

    replicationState(tick) {
        if (this.#usesOwnerPredictionId) this.predictionId ??= PROJECTILE_KEY.prediction(this.ownerId, tick);
        return Object.freeze({
            objectType: this.objectType,
            motionKind: this.motionKind,
            visualPresetId: this.visualPresetId,
            turnRateRadiansPerSecond: this.turnRateRadiansPerSecond,
            lifetimeSeconds: this.lifetimeSeconds,
            ownerId: this.ownerId,
            targetId: this.targetId ?? null,
            predictionId: this.predictionId ?? null,
            radius: this.radius,
            damage: this.damage,
            speed: this.speed,
            canCutRope: this.canCutRope
        });
    }
}

export class HomingProjectileObject extends withEnemyHitPrediction(
    withProjectileMotionSimulation(withHomingProjectileSteering(ProjectileObject))
) {
    constructor(options) {
        const turnRateRadiansPerSecond = resolveHomingTurnRate(options);
        super({
            ...options,
            ...PROJECTILE_DEFINITION[PROJECTILE_TYPE.PLAYER],
            motionKind: PROJECTILE_MOTION_KIND.HOMING,
            turnRateRadiansPerSecond
        });
    }
}

export class BallisticProjectileObject extends withPlayerImpactPrediction(
    withProjectileMotionSimulation(ProjectileObject)
) {
    constructor(options) {
        super({
            ...options,
            ...PROJECTILE_DEFINITION[PROJECTILE_TYPE.ENEMY],
            motionKind: PROJECTILE_MOTION_KIND.BALLISTIC,
            turnRateRadiansPerSecond: null
        });
    }
}

export class EnemyHomingProjectileObject extends withPlayerImpactPrediction(
    withProjectileMotionSimulation(withHomingProjectileSteering(ProjectileObject))
) {
    constructor(options) {
        const turnRateRadiansPerSecond = resolveHomingTurnRate(options);
        super({
            ...options,
            ...PROJECTILE_DEFINITION[PROJECTILE_TYPE.ENEMY],
            motionKind: PROJECTILE_MOTION_KIND.HOMING,
            turnRateRadiansPerSecond
        });
    }
}

const PROJECTILE_FACTORIES = Object.freeze({
    [PROJECTILE_TYPE.PLAYER]: Object.freeze({
        [PROJECTILE_MOTION_KIND.HOMING]: ({ hadLocalPrediction = false, ...state }) =>
            new HomingProjectileObject({ ...state, predictCollision: hadLocalPrediction })
    }),
    [PROJECTILE_TYPE.ENEMY]: Object.freeze({
        [PROJECTILE_MOTION_KIND.BALLISTIC]: ({ hadLocalPrediction: _hadLocalPrediction, ...state }) =>
            new BallisticProjectileObject({ ...state, predictCollision: true }),
        [PROJECTILE_MOTION_KIND.HOMING]: ({ hadLocalPrediction: _hadLocalPrediction, ...state }) =>
            new EnemyHomingProjectileObject({ ...state, predictCollision: true })
    })
});

export function createProjectileObject({
    objectType,
    motionKind = PROJECTILE_DEFINITION[objectType]?.defaultMotionKind,
    ...state
}) {
    const create = PROJECTILE_FACTORIES[objectType]?.[motionKind];
    if (!create) throw new Error(`unsupported projectile object type and motion kind: ${objectType}/${motionKind}`);
    return create(state);
}
