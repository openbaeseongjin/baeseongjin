import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { defineObjectOwner } from "../objects/GameObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { withEnemyHitPrediction, withPlayerImpactPrediction } from "./ProjectileClientCollision.js";
import { advanceHomingProjectileMotion, advanceProjectileMotion } from "./ProjectileMotion.js";
import { withProjectileRenderSnapshot } from "./ProjectileRenderSnapshot.js";

export const PROJECTILE_MOTION_CAPABILITY = "projectile-motion";

const withHomingProjectileMotion = createSimulationCapabilityMixin({
    id: PROJECTILE_MOTION_CAPABILITY,
    order: 20,
    apply({ dt, state = null, targetPosition = null, speed = this.speed }) {
        targetPosition ??= state?.enemies?.find(({ id }) => id === this.targetId)?.position ?? null;
        if (targetPosition) advanceHomingProjectileMotion(this, targetPosition, speed, dt);
        else advanceProjectileMotion(this, dt);
    }
});

const withBallisticProjectileMotion = createSimulationCapabilityMixin({
    id: PROJECTILE_MOTION_CAPABILITY,
    order: 20,
    apply({ dt }) {
        advanceProjectileMotion(this, dt);
    }
});

class ProjectileObject extends withProjectileRenderSnapshot(SimulationDrivenObject) {
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
        this.targetId = targetId;
        this.position = position;
        this.velocity = velocity;
        this.damage = damage;
        this.radius = radius;
        this.ageSeconds = 0;
        this.speed = speed;
        this.objectType = objectType;
        this.canCutRope = canCutRope;
        if (predictionId !== null) this.predictionId = predictionId;
        this.#renderCollection = renderCollection;
        this.#collisionRejectionPolicy = collisionRejectionPolicy;
        this.#usesOwnerPredictionId = usesOwnerPredictionId;
        this.#clientCollisionState = predictCollision ? "ready" : "disabled";
    }

    get renderCollection() {
        return this.#renderCollection;
    }

    isClientCollisionPredictionEnabled() {
        return this.#clientCollisionState !== "disabled";
    }

    observeClientCollision(isOverlapping) {
        if (this.#clientCollisionState === "waiting-separation") {
            if (!isOverlapping) this.#clientCollisionState = "ready";
            return false;
        }
        return this.#clientCollisionState === "ready" && isOverlapping;
    }

    beginClientCollision() {
        if (this.#clientCollisionState !== "ready") return false;
        this.#clientCollisionState = "pending";
        return true;
    }

    rejectClientCollision() {
        if (this.#clientCollisionState !== "pending") return false;
        this.#clientCollisionState =
            this.#collisionRejectionPolicy === "retry-after-separation" ? "waiting-separation" : "consumed";
        return true;
    }

    isClientVisible() {
        return this.#clientCollisionState !== "pending" && this.#clientCollisionState !== "consumed";
    }

    replicationState(tick) {
        if (this.#usesOwnerPredictionId) this.predictionId ??= `${this.ownerId}:${tick}`;
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

export class HomingProjectileObject extends withEnemyHitPrediction(withHomingProjectileMotion(ProjectileObject)) {
    constructor(options) {
        super({
            ...options,
            objectType: "player-projectile",
            renderCollection: "projectiles",
            collisionRejectionPolicy: "consume",
            usesOwnerPredictionId: true
        });
    }
}

export class BallisticProjectileObject extends withPlayerImpactPrediction(
    withBallisticProjectileMotion(ProjectileObject)
) {
    constructor(options) {
        super({
            ...options,
            objectType: "enemy-projectile",
            renderCollection: "enemyProjectiles",
            collisionRejectionPolicy: "retry-after-separation",
            usesOwnerPredictionId: false
        });
    }
}

const PROJECTILE_FACTORIES = new Map([
    [
        "player-projectile",
        ({ hadLocalPrediction = false, ...state }) =>
            new HomingProjectileObject({ ...state, predictCollision: hadLocalPrediction })
    ],
    [
        "enemy-projectile",
        ({ hadLocalPrediction: _hadLocalPrediction, ...state }) =>
            new BallisticProjectileObject({ ...state, predictCollision: true })
    ]
]);

export function createProjectileObject({ objectType, ...state }) {
    const create = PROJECTILE_FACTORIES.get(objectType);
    if (!create) throw new Error(`unsupported projectile object type: ${objectType}`);
    return create(state);
}
