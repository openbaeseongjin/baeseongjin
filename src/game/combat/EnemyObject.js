import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { selectNearestPlayer } from "./CombatTargeting.js";
import { BallisticProjectileObject } from "./ProjectileObject.js";

const withEnemyWeaponSimulation = createSimulationCapabilityMixin({
    id: "enemy-weapon",
    order: 10,
    apply({ targets, projectiles, registry, config, dt }) {
        this.fireCooldown = Math.max(0, (this.fireCooldown ?? 0) - dt);
        if (this.fireCooldown > 0) return null;
        const target = selectNearestPlayer(this.position, targets, config.enemyAttackRange);
        if (!target) return null;
        const direction = target.physics.position.clone().subtract(this.position);
        const distance = direction.length();
        if (distance <= 0) return null;
        direction.scale(config.enemyProjectileSpeed / distance);
        const projectile = new BallisticProjectileObject({
            id: registry.createId("enemy-projectile"),
            ownerId: this.id,
            targetId: target.id,
            position: this.position.clone(),
            velocity: direction,
            radius: config.enemyProjectileRadius,
            damage: config.enemyProjectileDamage
        });
        projectiles.push(projectile);
        this.fireCooldown = config.enemyFireInterval;
        return projectile;
    }
});

export class EnemyObject extends withEnemyWeaponSimulation(SimulationDrivenObject) {
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
