import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { segmentIntersectsSurface } from "../world/PolygonGeometry.js";
import { CircleCollider } from "../physics/colliders/CircleCollider.js";
import { withSurfacePhysics } from "../physics/SurfacePhysicsMixin.js";
import { selectNearestPlayer } from "./CombatTargeting.js";
import { ENEMY_BEHAVIOR_CAPABILITY } from "./EnemyBehaviors.js";
import { advanceEnemyPatrol, createEnemyPatrolState, restoreEnemyPatrolState } from "./EnemyPatrol.js";
import { BallisticProjectileObject } from "./ProjectileObject.js";
import { Vector2 } from "../../game-kit/index.js";
import { enemyImpactDisplacementEnabled } from "./EnemyMobility.js";
import { TimedStateController } from "../../core/state/TimedStateController.js";
import { ENEMY_ATTACK_STATES, ENEMY_ATTACK_TRANSITIONS, normalizeEnemyState } from "./EnemyStateCatalog.js";
import { withEnemyRenderSnapshot } from "./EnemyRenderSnapshot.js";

function assertFinite(value, label, { minimum = -Infinity, exclusiveMinimum = false } = {}) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    if (exclusiveMinimum ? value <= minimum : value < minimum) {
        const comparison = exclusiveMinimum ? "greater than" : "at least";
        throw new Error(`${label} must be ${comparison} ${minimum}`);
    }
    return value;
}

function normalizeImpactDirection(value, label) {
    assertFinite(value?.x, `${label}.x`);
    assertFinite(value?.y, `${label}.y`);
    const direction = new Vector2(value.x, value.y);
    if (direction.length() === 0) throw new Error(`${label} must be non-zero`);
    return direction.normalize();
}

function cloneKnockbackState(state) {
    if (!state) return null;
    return Object.freeze({
        direction: Object.freeze({ x: state.direction.x, y: state.direction.y }),
        distance: state.distance,
        durationSeconds: state.durationSeconds,
        remainingSeconds: state.remainingSeconds,
        sourcePlayerId: state.sourcePlayerId ?? null,
        sourceEffectId: state.sourceEffectId ?? null,
        wallImpactEligible: state.wallImpactEligible === true,
        wallImpactTriggered: state.wallImpactTriggered === true
    });
}

function createKnockbackState(knockbackState) {
    if (!knockbackState) return null;
    return {
        direction: normalizeImpactDirection(knockbackState.direction, "knockbackState.direction"),
        distance: assertFinite(knockbackState.distance, "knockbackState.distance", {
            minimum: 0,
            exclusiveMinimum: true
        }),
        durationSeconds: assertFinite(knockbackState.durationSeconds, "knockbackState.durationSeconds", {
            minimum: 0,
            exclusiveMinimum: true
        }),
        remainingSeconds: assertFinite(knockbackState.remainingSeconds, "knockbackState.remainingSeconds", {
            minimum: 0
        }),
        sourcePlayerId: knockbackState.sourcePlayerId ?? null,
        sourceEffectId: knockbackState.sourceEffectId ?? null,
        wallImpactEligible: knockbackState.wallImpactEligible === true,
        wallImpactTriggered: knockbackState.wallImpactTriggered === true
    };
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

function visibleTargetsForEnemy(enemy, targets, surfaces) {
    const eligibleTargets = enemy.activation
        ? targets.filter(
              ({ physics }) =>
                  physics.position.x >= enemy.activation.x &&
                  physics.position.x <= enemy.activation.x + enemy.activation.width &&
                  physics.position.y >= enemy.activation.y &&
                  physics.position.y <= enemy.activation.y + enemy.activation.height
          )
        : targets;
    return eligibleTargets.filter((target) => hasLineOfSight(enemy, target, surfaces));
}

function selectLockedTarget(enemy, visibleTargets, range, canAcquireTarget) {
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

function directionTo(enemy, target) {
    const dx = target.physics.position.x - enemy.position.x;
    const dy = target.physics.position.y - enemy.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0) return null;
    return Object.freeze({ x: dx / distance, y: dy / distance });
}

function aimAt(enemy, target) {
    const direction = directionTo(enemy, target);
    if (!direction) return false;
    enemy.aimDirection = direction;
    return true;
}

function updatePresentationAimDirection(enemy, visibleTargets, range) {
    if (enemy.enemyType !== "sentry" && enemy.enemyType !== "sentry-t1") {
        enemy.presentationAimDirection = null;
        return;
    }
    const nearestTarget = selectNearestPlayer(enemy.position, visibleTargets, range);
    enemy.presentationAimDirection = nearestTarget ? directionTo(enemy, nearestTarget) : null;
}

const withEnemyPresentationAimSimulation = createSimulationCapabilityMixin({
    id: "enemy-presentation-aim",
    order: 9,
    apply({ targets, range, surfaces = [] }) {
        updatePresentationAimDirection(this, visibleTargetsForEnemy(this, targets, surfaces), range);
        return this.presentationAimDirection;
    }
});

function transitionAttack(enemy, state, durationSeconds = 0, { restart = false } = {}) {
    const result = enemy.attackStateController.transition(state, { durationSeconds, restart });
    if (!result.accepted) throw new Error(`invalid enemy attack transition: ${result.from} -> ${result.to}`);
}

function resetAttack(enemy) {
    enemy.lockedTargetId = null;
    enemy.aimDirection = null;
    enemy.fireCooldown = 0;
    transitionAttack(enemy, "idle", 0, { restart: true });
}

function consumeStateTime(enemy, remainingDt) {
    return enemy.attackStateController.consume(remainingDt);
}

const withEnemyWeaponSimulation = createSimulationCapabilityMixin({
    id: "enemy-weapon",
    order: 10,
    apply({ targets, collisionActors = targets, projectiles, registry, config, surfaces = [], dt }) {
        this.beginSurfacePhysicsStep();
        const visibleTargets = visibleTargetsForEnemy(this, targets, surfaces);
        if (this.rules.includes("no-projectile-attack")) {
            resetAttack(this);
            this.advanceEnemyPhysicsStep(dt, surfaces, collisionActors);
            return null;
        }
        const target = selectLockedTarget(this, visibleTargets, config.enemyAttackRange, this.attackState === "idle");
        if (!target) {
            resetAttack(this);
            advanceEnemyPatrol(this, dt);
            this.advanceEnemyPhysicsStep(dt, surfaces, collisionActors);
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
        this.advanceEnemyPhysicsStep(dt, surfaces, collisionActors);
        return spawnedProjectile;
    }
});

export class EnemyObject extends withSurfacePhysics(
    withEnemyRenderSnapshot(withEnemyWeaponSimulation(withEnemyPresentationAimSimulation(SimulationDrivenObject)))
) {
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
        presentationAimDirection = null,
        lockedTargetId = null,
        impactDisplacementEnabled = null,
        knockbackState = null
    }) {
        super({ id });
        this.initializeSurfacePhysics({
            position,
            velocity: new Vector2(),
            collider: new CircleCollider({ radius })
        });
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
        Object.defineProperty(this, "attackStateController", {
            value: new TimedStateController({
                initialState: "idle",
                transitions: ENEMY_ATTACK_TRANSITIONS,
                state: normalizeEnemyState(attackState, ENEMY_ATTACK_STATES, "idle"),
                remainingSeconds: Math.max(0, attackStateRemaining ?? 0)
            }),
            enumerable: false,
            writable: false
        });
        this.aimDirection = aimDirection ? Object.freeze({ x: aimDirection.x, y: aimDirection.y }) : null;
        this.presentationAimDirection = presentationAimDirection
            ? Object.freeze({ x: presentationAimDirection.x, y: presentationAimDirection.y })
            : null;
        this.fireCooldown =
            this.attackState === "cooldown" || this.attackState === "fire" ? Math.max(0, fireCooldown ?? 0) : 0;
        this.impactDisplacementEnabled =
            enemyImpactDisplacementEnabled(enemyType) && impactDisplacementEnabled !== false;
        this.knockbackState = createKnockbackState(knockbackState);
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
                apply: (context) => {
                    this.beginSurfacePhysicsStep();
                    return behavior.advance(this, context);
                }
            });
        }
    }

    get attackState() {
        return this.attackStateController.state;
    }

    get attackStateRemaining() {
        return this.attackStateController.remainingSeconds;
    }

    get lifeState() {
        return this.health > 0 ? "active" : "inactive";
    }

    enemyBehaviorSnapshot() {
        return this.behavior?.snapshot() ?? null;
    }

    advanceEnemyPhysicsStep(dt, surfaces, collisionActors = []) {
        const resolution = this.advanceSurfacePhysics(dt, surfaces, {
            actorId: this.id,
            actors: collisionActors
        });
        this.velocity.set(0, 0);
        return resolution;
    }

    restoreNetworkState(state) {
        const behaviorState = state?.behaviorState ?? null;
        if (
            state?.id !== this.id ||
            state.objectId !== this.objectId ||
            state.enemyType !== this.enemyType ||
            !restoreEnemyPatrolState(this.patrol, state.patrol ?? null) ||
            (this.behavior === null) !== (behaviorState === null)
        ) {
            return false;
        }
        if (this.behavior && typeof this.behavior.restore !== "function") return false;
        this.position.set(
            assertFinite(state.position?.x, "enemy.position.x"),
            assertFinite(state.position?.y, "enemy.position.y")
        );
        this.velocity.set(0, 0);
        this.surfacePhysicsStepPending = false;
        this.health = assertFinite(state.health, "enemy.health", { minimum: 0 });
        this.maxHealth = assertFinite(state.maxHealth, "enemy.maxHealth", { minimum: 0, exclusiveMinimum: true });
        this.lockedTargetId = state.lockedTargetId ?? null;
        this.attackStateController.restore({
            state: normalizeEnemyState(state.attackState, ENEMY_ATTACK_STATES, "idle"),
            remainingSeconds: Math.max(0, state.attackStateRemaining ?? 0)
        });
        this.aimDirection = state.aimDirection
            ? Object.freeze({
                  x: assertFinite(state.aimDirection.x, "enemy.aimDirection.x"),
                  y: assertFinite(state.aimDirection.y, "enemy.aimDirection.y")
              })
            : null;
        this.presentationAimDirection = state.presentationAimDirection
            ? Object.freeze({
                  x: assertFinite(state.presentationAimDirection.x, "enemy.presentationAimDirection.x"),
                  y: assertFinite(state.presentationAimDirection.y, "enemy.presentationAimDirection.y")
              })
            : null;
        this.fireCooldown =
            this.attackState === "cooldown" || this.attackState === "fire" ? Math.max(0, state.fireCooldown ?? 0) : 0;
        this.knockbackState = createKnockbackState(state.knockbackState);
        this.behavior?.restore(behaviorState);
        return true;
    }

    blocksImpactFrom(sourcePosition) {
        return this.behavior?.blocksImpactFrom?.(this, sourcePosition) ?? false;
    }

    knockbackSnapshot() {
        return cloneKnockbackState(this.knockbackState);
    }

    canApplyImpactKnockback() {
        return this.impactDisplacementEnabled;
    }

    applyImpactKnockback({ direction, distance, durationSeconds }) {
        if (!this.canApplyImpactKnockback()) return false;
        this.knockbackState = {
            direction: normalizeImpactDirection(direction, "direction"),
            distance: assertFinite(distance, "distance", { minimum: 0, exclusiveMinimum: true }),
            durationSeconds: assertFinite(durationSeconds, "durationSeconds", { minimum: 0, exclusiveMinimum: true }),
            remainingSeconds: assertFinite(durationSeconds, "durationSeconds", { minimum: 0, exclusiveMinimum: true })
        };
        return true;
    }

    advanceImpactKnockback(dt, surfaces = []) {
        if (!this.knockbackState) return Object.freeze({ moved: false, collided: false });
        const stepDt = assertFinite(dt, "dt", { minimum: 0 });
        if (stepDt <= 0) return Object.freeze({ moved: false, collided: false });
        const state = this.knockbackState;
        const appliedSeconds = Math.min(stepDt, state.remainingSeconds);
        const speed = state.distance / state.durationSeconds;
        this.beginSurfacePhysicsStep();
        this.queueSurfaceDisplacement(state.direction.clone().scale(speed * appliedSeconds), appliedSeconds);
        const resolution = this.advanceEnemyPhysicsStep(appliedSeconds, surfaces);
        state.remainingSeconds = Math.max(0, state.remainingSeconds - appliedSeconds);
        if (state.remainingSeconds <= 0) this.knockbackState = null;
        return Object.freeze({ moved: true, collided: resolution.collisionNormals.length > 0 });
    }
}
