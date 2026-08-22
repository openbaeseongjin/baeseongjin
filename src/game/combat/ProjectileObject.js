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
    PROJECTILE_INITIAL_COLLISION_STATE,
    PROJECTILE_INVISIBLE_COLLISION_STATES,
    PROJECTILE_KEY,
    PROJECTILE_REJECTED_COLLISION_STATE,
    PROJECTILE_TYPE
} from "./ProjectileDefinition.js";
import { withProjectileRenderSnapshot } from "./ProjectileRenderSnapshot.js";

export const PROJECTILE_MOTION_CAPABILITY = PROJECTILE_MOTION.CAPABILITY;

class ProjectileObject extends withProjectileLifetime(withProjectileRenderSnapshot(SimulationDrivenObject)) {
    #clientCollisionState;
    #collisionRejectionPolicy;
    #renderCollection;
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
        objectType,
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
        this.objectType = objectType;
        this.canCutRope = canCutRope;
        if (predictionId !== null) this.predictionId = predictionId;
        this.#renderCollection = renderCollection;
        this.#collisionRejectionPolicy = collisionRejectionPolicy;
        this.#usesOwnerPredictionId = usesOwnerPredictionId;
        this.#clientCollisionState = PROJECTILE_INITIAL_COLLISION_STATE[Boolean(predictCollision)];
    }

    get renderCollection() {
        return this.#renderCollection;
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
        super({ ...options, ...PROJECTILE_DEFINITION[PROJECTILE_TYPE.PLAYER] });
    }
}

export class BallisticProjectileObject extends withPlayerImpactPrediction(
    withProjectileMotionSimulation(ProjectileObject)
) {
    constructor(options) {
        super({ ...options, ...PROJECTILE_DEFINITION[PROJECTILE_TYPE.ENEMY] });
    }
}

const PROJECTILE_FACTORIES = Object.freeze({
    [PROJECTILE_TYPE.PLAYER]: ({ hadLocalPrediction = false, ...state }) =>
        new HomingProjectileObject({ ...state, predictCollision: hadLocalPrediction }),
    [PROJECTILE_TYPE.ENEMY]: ({ hadLocalPrediction: _hadLocalPrediction, ...state }) =>
        new BallisticProjectileObject({ ...state, predictCollision: true })
});

export function createProjectileObject({ objectType, ...state }) {
    const create = PROJECTILE_FACTORIES[objectType];
    if (!create) throw new Error(`unsupported projectile object type: ${objectType}`);
    return create(state);
}
