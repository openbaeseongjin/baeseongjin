import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { selectNearestPlayer } from "./CombatTargeting.js";
import { advanceEnemyPatrol, createEnemyPatrolState } from "./EnemyPatrol.js";
import { BallisticProjectileObject } from "./ProjectileObject.js";

const ATTACK_STATES = new Set(["idle", "acquire", "track", "lock", "fire", "cooldown"]);
const GEOMETRY_EPSILON = 1e-7;

function crossProduct(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function pointOnSegment(point, start, end) {
    return (
        Math.abs(crossProduct(start, end, point)) <= GEOMETRY_EPSILON &&
        point.x >= Math.min(start.x, end.x) - GEOMETRY_EPSILON &&
        point.x <= Math.max(start.x, end.x) + GEOMETRY_EPSILON &&
        point.y >= Math.min(start.y, end.y) - GEOMETRY_EPSILON &&
        point.y <= Math.max(start.y, end.y) + GEOMETRY_EPSILON
    );
}

function segmentsIntersect(a, b, c, d) {
    const abC = crossProduct(a, b, c);
    const abD = crossProduct(a, b, d);
    const cdA = crossProduct(c, d, a);
    const cdB = crossProduct(c, d, b);
    if (
        ((abC > GEOMETRY_EPSILON && abD < -GEOMETRY_EPSILON) || (abC < -GEOMETRY_EPSILON && abD > GEOMETRY_EPSILON)) &&
        ((cdA > GEOMETRY_EPSILON && cdB < -GEOMETRY_EPSILON) || (cdA < -GEOMETRY_EPSILON && cdB > GEOMETRY_EPSILON))
    ) {
        return true;
    }
    return pointOnSegment(c, a, b) || pointOnSegment(d, a, b) || pointOnSegment(a, c, d) || pointOnSegment(b, c, d);
}

function segmentIntersectsSurface(start, end, surface) {
    const vertices = surface.vertices ?? [];
    for (let index = 0; index < vertices.length; index += 1) {
        if (segmentsIntersect(start, end, vertices[index], vertices[(index + 1) % vertices.length])) return true;
    }
    return false;
}

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
                    canCutRope: !this.rules.includes("no-rope-cut")
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
        activation = null,
        patrol = null,
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
        this.activation = activation ? Object.freeze({ ...activation }) : null;
        this.patrol = createEnemyPatrolState({ patrol, activation: this.activation, origin: this.position });
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
    }
}
