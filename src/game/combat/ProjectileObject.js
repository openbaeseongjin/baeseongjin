import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { defineObjectOwner } from "../objects/GameObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { advanceHomingProjectileMotion, advanceProjectileMotion } from "./ProjectileMotion.js";

const withHomingProjectileMotion = createSimulationCapabilityMixin({
    id: "homing-projectile-motion",
    order: 20,
    apply({ dt, targetPosition = null, speed = 0 }) {
        if (targetPosition) advanceHomingProjectileMotion(this, targetPosition, speed, dt);
        else advanceProjectileMotion(this, dt);
    }
});

const withBallisticProjectileMotion = createSimulationCapabilityMixin({
    id: "ballistic-projectile-motion",
    order: 20,
    apply({ dt }) {
        advanceProjectileMotion(this, dt);
    }
});

class ProjectileObject extends SimulationDrivenObject {
    constructor({ id, ownerId, targetId, position, velocity, damage, radius, predictionId = null }) {
        super({ id });
        defineObjectOwner(this, ownerId);
        this.targetId = targetId;
        this.position = position;
        this.velocity = velocity;
        this.damage = damage;
        this.radius = radius;
        this.ageSeconds = 0;
        if (predictionId !== null) this.predictionId = predictionId;
    }
}

export class HomingProjectileObject extends withHomingProjectileMotion(ProjectileObject) {}

export class BallisticProjectileObject extends withBallisticProjectileMotion(ProjectileObject) {}
