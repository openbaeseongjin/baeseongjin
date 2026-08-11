import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";

export class EnemyObject extends SimulationDrivenObject {
    constructor({ id, position, level, radius, health, maxHealth, fireCooldown }) {
        super({ id });
        this.position = position;
        this.level = level;
        this.radius = radius;
        this.health = health;
        this.maxHealth = maxHealth;
        this.fireCooldown = fireCooldown;
    }
}
