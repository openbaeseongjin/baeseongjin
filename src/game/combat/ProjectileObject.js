import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { defineObjectOwner } from "../objects/GameObject.js";

export class ProjectileObject extends SimulationDrivenObject {
    constructor({ id, ownerId, targetId, position, velocity, damage, radius, predictionId = null }) {
        super({ id });
        defineObjectOwner(this, ownerId);
        this.targetId = targetId;
        this.position = position;
        this.velocity = velocity;
        this.damage = damage;
        this.radius = radius;
        if (predictionId !== null) this.predictionId = predictionId;
    }
}
