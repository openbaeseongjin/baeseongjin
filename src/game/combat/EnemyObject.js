import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { segmentIntersectsSurface } from "../world/PolygonGeometry.js";
import { selectNearestPlayer } from "./CombatTargeting.js";
import { ENEMY_BEHAVIOR_CAPABILITY } from "./EnemyBehaviors.js";
import { advanceEnemyPatrol, createEnemyPatrolState } from "./EnemyPatrol.js";
import { BallisticProjectileObject } from "./ProjectileObject.js";

const ATTACK_STATES = new Set(["idle", "acquire", "track", "lock", "fire", "cooldown"]);
function hasLineOfSight(enemy, target, surfaces) {
    if (!enemy.rules.includes("cover-ends-los")) return true;
    return !surfaces.some(
        (surface) =>
            surface.collision !== false &&
            surface.kind === "cover" &&
            (enemy.areaId === null || surface.areaId === enemy.areaId) &&
            segmentIntersectsSurface(enemy.position, target.physics.position, surface)
    );
}

function selectLockedTarget(enemy, targets, range, canAcquireTarget, surfaces) {
    const eligibleTargets = enemy.activation
        ? targets.filter(
              ({ physics }) =>
                  physics.position.x >= enemy.activation.x &&
                  physics.position.x <= enemy.activation.x + enemy.activation.width &&
                  physics.position.y >= enemy.activation.y &&
                  physics.position.y <= enemy.activation.y + enemy.activation.height
          )
        : targets;
    const visibleTargets = eligibleTargets.filter((target) => hasLineOfSight(enemy, target, surfaces));
    const lockedTarget =
        enemy.lockedTargetId === null
            ? null
            : (visibleTargets.find(
                  (target) =>
                      target.id === enemy.lockedTargetId &&
                      target.health > 0 &&
                      target.lifeState === "active" &&
                      enemy.position.distanceTo(target.physics.position) <= range
              ) ?? null);
    if (lockedTarget) return lockedTarget;
    if (!canAcquireTarget) return null;
    return selectNearestPlayer(enemy.position, visibleTargets, range);
}

function aimAt(enemy, target) {
    const dx = target.physics.position.x - enemy.position.x;
    const dy = target.physics.position.y - enemy.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0) return false;
    enemy.aimDirection = Object.freeze({ x: dx / distance, y: dy / distance });
    return true;
}

function transitionAttack(enemy, state, durationSeconds = 0) {
    enemy.attackState = state;
    enemy.attackStateRemaining = durationSeconds;
}

function resetAttack(enemy) {
    enemy.lockedTargetId = null;
    enemy.aimDirection = null;
    enemy.fireCooldown = 0;
    transitionAttack(enemy, "idle");
}

function consumeStateTime(enemy, remainingDt) {
    const consumed = Math.min(remainingDt, enemy.attackStateRemaining);
    enemy.attackStateRemaining = Math.max(0, enemy.attackStateRemaining - consumed);
    return consumed;
}

const withEnemyWeaponSimulation = createSimulationCapabilityMixin({
    id: "enemy-weapon",
    order: 10,
    apply({ targets, projectiles, registry, config, surfaces = [], dt }) {
        if (this.rules.includes("no-projectile-attack")) {
            resetAttack(this);
            return null;
        }
        const target = selectLockedTarget(
            this,
            targets,
            config.enemyAttackRange,
            this.attackState === "idle",
            surfaces
        );
        if (!target) {
            resetAttack(this);
            advanceEnemyPatrol(this, dt);
            return null;
        }
        this.lockedTargetId = target.id;
        if (this.attackState === "idle") transitionAttack(this, "acquire", config.enemyAcquireSeconds);

        let remainingDt = Math.max(0, dt);
        let spawnedProjectile = null;
        for (let transitions = 0; transitions < 8; transitions += 1) {
            if (this.attackState === "acquire") {
                const consumed = consumeStateTime(this, remainingDt);
                remainingDt -= consumed;
                if (this.attackStateRemaining > 0) break;
                transitionAttack(this, "track", config.enemyTrackSeconds);
                if (!aimAt(this, target)) break;
                continue;
            }
            if (this.attackState === "track") {
                if (!aimAt(this, target)) break;
                const consumed = consumeStateTime(this, remainingDt);
                remainingDt -= consumed;
                if (this.attackStateRemaining > 0) break;
                transitionAttack(this, "lock", config.enemyLockSeconds);
                continue;
            }
            if (this.attackState === "lock") {
                const consumed = consumeStateTime(this, remainingDt);
                remainingDt -= consumed;
                if (this.attackStateRemaining > 0 || !this.aimDirection) break;
                const direction = this.position.clone();
                direction.set(
                    this.aimDirection.x * config.enemyProjectileSpeed,
                    this.aimDirection.y * config.enemyProjectileSpeed
                );
                spawnedProjectile = new BallisticProjectileObject({
                    id: registry.createId("enemy-projectile"),
                    ownerId: this.id,
                    targetId: target.id,
                    position: this.position.clone(),
                    velocity: direction,
                    radius: config.enemyProjectileRadius,
                    damage: config.enemyProjectileDamage,
                    canCutRope: this.rules.includes("cutter-fire")
                });
                projectiles.push(spawnedProjectile);
                this.fireCooldown = config.enemyFireInterval;
                transitionAttack(this, "fire", config.enemyFireFlashSeconds);
                if (remainingDt <= 0) break;
                continue;
            }
            if (this.attackState === "fire") {
                const consumed = consumeStateTime(this, remainingDt);
                remainingDt -= consumed;
                if (this.attackStateRemaining > 0) break;
                transitionAttack(this, "cooldown", this.fireCooldown);
                this.aimDirection = null;
                continue;
            }
            if (this.attackState === "cooldown") {
                const consumed = consumeStateTime(this, remainingDt);
                remainingDt -= consumed;
                this.fireCooldown = this.attackStateRemaining;
                if (this.attackStateRemaining > 0) break;
                this.fireCooldown = 0;
                transitionAttack(this, "track", config.enemyTrackSeconds);
                if (!aimAt(this, target)) break;
                continue;
            }
            break;
        }
        return spawnedProjectile;
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
        displayName = enemyType,
        activation = null,
        patrol = null,
        behavior = null,
        swarmGroupId = null,
        rules = [],
        radius,
        health,
        maxHealth,
        fireCooldown,
        attackState = "idle",
        attackStateRemaining = 0,
        aimDirection = null,
        lockedTargetId = null
    }) {
        super({ id });
        this.position = position;
        this.level = level;
        this.areaId = areaId;
        this.objectId = objectId;
        this.enemyType = enemyType;
        this.displayName = displayName;
        this.activation = activation ? Object.freeze({ ...activation }) : null;
        this.patrol = createEnemyPatrolState({ patrol, activation: this.activation, origin: this.position });
        this.swarmGroupId = swarmGroupId;
        this.lockedTargetId = lockedTargetId;
        this.rules = Object.freeze([...rules]);
        this.radius = radius;
        this.health = health;
        this.maxHealth = maxHealth;
        this.attackState = ATTACK_STATES.has(attackState) ? attackState : "idle";
        this.attackStateRemaining = Math.max(0, attackStateRemaining ?? 0);
        this.aimDirection = aimDirection ? Object.freeze({ x: aimDirection.x, y: aimDirection.y }) : null;
        this.fireCooldown =
            this.attackState === "cooldown" || this.attackState === "fire" ? Math.max(0, fireCooldown ?? 0) : 0;
        Object.defineProperty(this, "behavior", {
            value: behavior,
            enumerable: false,
            writable: false
        });
        if (behavior !== null) {
            if (typeof behavior.advance !== "function" || typeof behavior.snapshot !== "function") {
                throw new Error("enemy behavior must expose advance and snapshot");
            }
            this.registerSimulationCapability({
                id: ENEMY_BEHAVIOR_CAPABILITY,
                order: 5,
                apply: (context) => behavior.advance(this, context)
            });
        }
    }

    enemyBehaviorSnapshot() {
        return this.behavior?.snapshot() ?? null;
    }

    blocksImpactFrom(sourcePosition) {
        return this.behavior?.blocksImpactFrom?.(this, sourcePosition) ?? false;
    }
}
