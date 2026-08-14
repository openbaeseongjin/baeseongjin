import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { selectNearestPlayer } from "./CombatTargeting.js";
import { advanceEnemyPatrol, createEnemyPatrolState } from "./EnemyPatrol.js";
import { BallisticProjectileObject } from "./ProjectileObject.js";

function selectLockedTarget(enemy, targets, range, canAcquireTarget) {
    const eligibleTargets = enemy.activation
        ? targets.filter(
              ({ physics }) =>
                  physics.position.x >= enemy.activation.x &&
                  physics.position.x <= enemy.activation.x + enemy.activation.width &&
                  physics.position.y >= enemy.activation.y &&
                  physics.position.y <= enemy.activation.y + enemy.activation.height
          )
        : targets;
    const lockedTarget =
        enemy.lockedTargetId === null
            ? null
            : (eligibleTargets.find(
                  (target) =>
                      target.id === enemy.lockedTargetId &&
                      target.health > 0 &&
                      target.lifeState === "active" &&
                      enemy.position.distanceTo(target.physics.position) <= range
              ) ?? null);
    if (lockedTarget) return lockedTarget;
    if (!canAcquireTarget) return null;
    return selectNearestPlayer(enemy.position, eligibleTargets, range);
}

const withEnemyWeaponSimulation = createSimulationCapabilityMixin({
    id: "enemy-weapon",
    order: 10,
    apply({ targets, projectiles, registry, config, dt }) {
        this.fireCooldown = Math.max(0, (this.fireCooldown ?? 0) - dt);
        const target = selectLockedTarget(this, targets, config.enemyAttackRange, this.fireCooldown <= 0);
        if (!target) {
            this.lockedTargetId = null;
            advanceEnemyPatrol(this, dt);
            return null;
        }
        this.lockedTargetId = target.id;
        if (this.fireCooldown > 0) return null;
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
            damage: config.enemyProjectileDamage,
            canCutRope: !this.rules.includes("no-rope-cut")
        });
        projectiles.push(projectile);
        this.fireCooldown = config.enemyFireInterval;
        return projectile;
    }
});

export class EnemyObject extends withEnemyWeaponSimulation(SimulationDrivenObject) {
    constructor({
        id,
        position,
        level,
        areaId = null,
        objectId = null,
        enemyType = "sentry-t1",
        activation = null,
        patrol = null,
        rules = [],
        radius,
        health,
        maxHealth,
        fireCooldown
    }) {
        super({ id });
        this.position = position;
        this.level = level;
        this.areaId = areaId;
        this.objectId = objectId;
        this.enemyType = enemyType;
        this.activation = activation ? Object.freeze({ ...activation }) : null;
        this.patrol = createEnemyPatrolState({ patrol, activation: this.activation, origin: this.position });
        this.lockedTargetId = null;
        this.rules = Object.freeze([...rules]);
        this.radius = radius;
        this.health = health;
        this.maxHealth = maxHealth;
        this.fireCooldown = fireCooldown;
    }
}
