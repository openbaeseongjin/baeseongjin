import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { colliderSnapshotBoundingRadius, colliderSnapshotsEqual } from "../physics/colliders/Collider.js";
import { createCollider } from "../physics/colliders/ColliderFactory.js";
import { withSurfacePhysics } from "../physics/SurfacePhysicsMixin.js";
import { selectNearestPlayer } from "./CombatTargeting.js";
import { ENEMY_BEHAVIOR_CAPABILITY } from "./EnemyBehaviors.js";
import { createEnemyPatrolState, restoreEnemyPatrolState } from "./EnemyPatrol.js";
import { Vector2 } from "../../game-kit/index.js";
import { enemyCollisionMotionType, enemyImpactDisplacementEnabled } from "./EnemyMobility.js";
import { ENEMY_TYPE } from "../EnemyType.js";
import { withEnemyRenderSnapshot } from "./EnemyRenderSnapshot.js";
import {
    ENEMY_ATTACK_STATE,
    ENEMY_RULE,
    ENEMY_SIMULATION_CAPABILITY,
    ENEMY_WEAPON_CONFIG
} from "./enemy-weapon/EnemyWeaponDefinition.js";
import { withEnemyPhysicsSimulation, withEnemyWeaponSimulation } from "./enemy-weapon/EnemyWeaponSimulation.js";
import { directionFromEnemyToTarget, visibleEnemyTargets } from "./enemy-weapon/EnemyWeaponTargeting.js";
import { EnemyActivationState } from "./EnemyActivationState.js";
import { CombatStatusEffectPool } from "../status-effects/CombatStatusEffectPool.js";
import { EnemyDamageAttribution } from "./EnemyDamageAttribution.js";

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
        impulse: state.impulse,
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
        impulse: assertFinite(
            knockbackState.impulse ?? knockbackState.distance / knockbackState.durationSeconds,
            "knockbackState.impulse",
            { minimum: 0, exclusiveMinimum: true }
        ),
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
function updatePresentationAimDirection(enemy, visibleTargets, range) {
    if (enemy.enemyType !== ENEMY_TYPE.SENTRY && enemy.enemyType !== ENEMY_TYPE.SENTRY_T1) {
        enemy.presentationAimDirection = null;
        return;
    }
    const nearestTarget = selectNearestPlayer(enemy.position, visibleTargets, range);
    enemy.presentationAimDirection = nearestTarget ? directionFromEnemyToTarget(enemy, nearestTarget) : null;
}

const withEnemyPresentationAimSimulation = createSimulationCapabilityMixin({
    id: ENEMY_SIMULATION_CAPABILITY.PRESENTATION_AIM,
    order: ENEMY_WEAPON_CONFIG.PRESENTATION_AIM_ORDER,
    apply({ targets, range, surfaces = [] }) {
        updatePresentationAimDirection(this, visibleEnemyTargets(this, targets, surfaces), range);
        return this.presentationAimDirection;
    }
});

class EnemyBodyObject extends withSurfacePhysics(
    withEnemyRenderSnapshot(withEnemyPhysicsSimulation(withEnemyPresentationAimSimulation(SimulationDrivenObject)))
) {
    constructor({
        id,
        position,
        level,
        sectorId = null,
        areaId = null,
        objectId = null,
        enemyType = ENEMY_TYPE.SENTRY_T1,
        displayName = enemyType,
        activation = null,
        awakened = false,
        patrol = null,
        behavior = null,
        swarmGroupId = null,
        rules = [],
        radius,
        collider = null,
        health,
        maxHealth,
        experienceReward,
        fireCooldown,
        attackState = ENEMY_ATTACK_STATE.IDLE,
        attackStateRemaining = ENEMY_WEAPON_CONFIG.ZERO,
        aimDirection = null,
        presentationAimDirection = null,
        lockedTargetId = null,
        weaponRange = null,
        impactDisplacementEnabled = null,
        knockbackState = null,
        velocity = null,
        statusEffects = new CombatStatusEffectPool()
    }) {
        super({ id });
        const resolvedCollider = createCollider(collider, { fallbackRadius: radius });
        this.initializeSurfacePhysics({
            position,
            velocity: velocity ? new Vector2(velocity.x, velocity.y) : new Vector2(),
            collider: resolvedCollider,
            motionType: enemyCollisionMotionType(enemyType)
        });
        this.level = level;
        this.sectorId = sectorId;
        this.areaId = areaId;
        this.objectId = objectId;
        this.enemyType = enemyType;
        this.displayName = displayName;
        Object.defineProperty(this, "activationState", {
            value: new EnemyActivationState(activation, awakened),
            enumerable: false,
            writable: false
        });
        this.activation = this.activationState.bounds;
        this.patrol = createEnemyPatrolState({
            patrol,
            activation: this.activation,
            origin: this.position,
            enemyType
        });
        this.swarmGroupId = swarmGroupId;
        this.rules = Object.freeze([...rules]);
        this.radius =
            Number.isFinite(radius) && radius > 0
                ? radius
                : colliderSnapshotBoundingRadius(resolvedCollider.snapshot());
        this.health = health;
        this.maxHealth = maxHealth;
        this.experienceReward = assertFinite(experienceReward, "experienceReward", { minimum: 0 });
        Object.defineProperty(this, "damageAttribution", {
            value: new EnemyDamageAttribution(),
            enumerable: false,
            writable: false
        });
        this.statusEffects = statusEffects;
        this.presentationAimDirection = presentationAimDirection
            ? Object.freeze({ x: presentationAimDirection.x, y: presentationAimDirection.y })
            : null;
        this.weaponRange = Number.isFinite(weaponRange) && weaponRange > 0 ? weaponRange : null;
        this.impactDisplacementEnabled =
            enemyImpactDisplacementEnabled(enemyType) && impactDisplacementEnabled !== false;
        this.knockbackState = createKnockbackState(knockbackState);
        Object.defineProperty(this, "behavior", {
            value: behavior,
            enumerable: false,
            writable: false
        });
        Object.defineProperty(this, "lastActorCollisionIds", {
            value: Object.freeze([]),
            enumerable: false,
            writable: true
        });
        Object.defineProperty(this, "lastSurfaceCollisionNormals", {
            value: Object.freeze([]),
            enumerable: false,
            writable: true
        });
        if (behavior !== null) {
            if (typeof behavior.advance !== "function" || typeof behavior.snapshot !== "function") {
                throw new Error("enemy behavior must expose advance and snapshot");
            }
            this.registerSimulationCapability({
                id: ENEMY_BEHAVIOR_CAPABILITY,
                order: ENEMY_WEAPON_CONFIG.BEHAVIOR_ORDER,
                apply: (context) => {
                    this.beginSurfacePhysicsStep();
                    if (!this.statusEffects.canAct()) return Object.freeze([]);
                    return behavior.advance(this, context);
                }
            });
        }
    }

    get attackState() {
        return this.weaponState?.state ?? ENEMY_ATTACK_STATE.IDLE;
    }

    get attackStateRemaining() {
        return this.weaponState?.remainingSeconds ?? ENEMY_WEAPON_CONFIG.ZERO;
    }

    get lockedTargetId() {
        return this.weaponState?.lockedTargetId ?? null;
    }

    get aimDirection() {
        return this.weaponState?.aimDirection ?? null;
    }

    get fireCooldown() {
        return this.weaponState?.fireCooldown ?? ENEMY_WEAPON_CONFIG.ZERO;
    }

    get lifeState() {
        return this.health > 0 ? "active" : "inactive";
    }

    get experienceCreditPlayerId() {
        return this.damageAttribution.lastDamagedByPlayerId;
    }

    recordPlayerDamage(sourcePlayerId, damage) {
        return this.damageAttribution.recordPlayerDamage(sourcePlayerId, damage);
    }

    heal(amount) {
        const healing = assertFinite(amount, "enemy healing", { minimum: 0 });
        const previousHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + healing);
        this.damageAttribution.clearIfFullyHealed(this.health, this.maxHealth);
        return this.health - previousHealth;
    }

    resetDamageAttribution() {
        return this.damageAttribution.reset();
    }

    observeActivation(targets) {
        return this.activationState.observe(targets);
    }

    get awakened() {
        return this.activationState.awakened;
    }

    enemyBehaviorSnapshot() {
        return this.behavior?.snapshot() ?? null;
    }

    collidedWithActor(actorId) {
        return this.lastActorCollisionIds.includes(actorId);
    }

    advanceEnemyPhysicsStep(dt, surfaces, collisionActors = [], collisionBroadPhase = null) {
        const resolution = this.advanceSurfacePhysics(dt, surfaces, {
            actorId: this.id,
            actorRef: this,
            actors: collisionActors,
            broadPhase: collisionBroadPhase
        });
        this.lastActorCollisionIds = resolution.collidedActorIds;
        this.lastSurfaceCollisionNormals = resolution.collisionNormals;
        this.carryActorCollisionVelocity(
            {
                x: this.velocity.x - this.surfaceControlVelocity.x,
                y: this.velocity.y - this.surfaceControlVelocity.y
            },
            dt
        );
        return resolution;
    }

    restoreNetworkState(state) {
        const behaviorState = state?.behaviorState ?? null;
        if (
            state?.id !== this.id ||
            state.sectorId !== this.sectorId ||
            state.objectId !== this.objectId ||
            state.enemyType !== this.enemyType ||
            !colliderSnapshotsEqual(
                this.collider.snapshot(),
                state.collider ?? { type: "circle", radius: state.radius ?? this.radius }
            ) ||
            !restoreEnemyPatrolState(this.patrol, state.patrol ?? null) ||
            (this.behavior === null) !== (behaviorState === null)
        ) {
            return false;
        }
        if (this.behavior && typeof this.behavior.restore !== "function") return false;
        if (!this.activationState.restore(state.awakened ?? this.activation === null)) return false;
        this.setPhysicsPosition({
            x: assertFinite(state.position?.x, "enemy.position.x"),
            y: assertFinite(state.position?.y, "enemy.position.y")
        });
        this.setPhysicsVelocity({
            x: assertFinite(state.velocity?.x ?? 0, "enemy.velocity.x"),
            y: assertFinite(state.velocity?.y ?? 0, "enemy.velocity.y")
        });
        this.clearSurfacePhysicsStep();
        this.lastActorCollisionIds = Object.freeze([]);
        this.health = assertFinite(state.health, "enemy.health", { minimum: 0 });
        this.maxHealth = assertFinite(state.maxHealth, "enemy.maxHealth", { minimum: 0, exclusiveMinimum: true });
        this.experienceReward = assertFinite(
            state.experienceReward ?? this.experienceReward,
            "enemy.experienceReward",
            {
                minimum: 0
            }
        );
        this.resetDamageAttribution();
        const aimDirection = state.aimDirection
            ? {
                  x: assertFinite(state.aimDirection.x, "enemy.aimDirection.x"),
                  y: assertFinite(state.aimDirection.y, "enemy.aimDirection.y")
              }
            : null;
        this.weaponState?.restore({
            attackState: state.attackState,
            attackStateRemaining: assertFinite(
                state.attackStateRemaining ?? ENEMY_WEAPON_CONFIG.ZERO,
                "enemy.attackStateRemaining",
                { minimum: ENEMY_WEAPON_CONFIG.ZERO }
            ),
            aimDirection,
            lockedTargetId: state.lockedTargetId ?? null,
            fireCooldown: assertFinite(state.fireCooldown ?? ENEMY_WEAPON_CONFIG.ZERO, "enemy.fireCooldown", {
                minimum: ENEMY_WEAPON_CONFIG.ZERO
            })
        });
        this.presentationAimDirection = state.presentationAimDirection
            ? Object.freeze({
                  x: assertFinite(state.presentationAimDirection.x, "enemy.presentationAimDirection.x"),
                  y: assertFinite(state.presentationAimDirection.y, "enemy.presentationAimDirection.y")
              })
            : null;
        this.knockbackState = createKnockbackState(state.knockbackState);
        this.statusEffects.restore(state.statusEffects ?? null);
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

    canApplyExternalImpulse() {
        return this.impactDisplacementEnabled;
    }

    applyExternalImpulse({ direction, impulse, observationSeconds = 0.25 }) {
        if (!this.canApplyExternalImpulse()) return false;
        const normalizedDirection = normalizeImpactDirection(direction, "direction");
        const magnitude = assertFinite(impulse, "impulse", { minimum: 0, exclusiveMinimum: true });
        const durationSeconds = assertFinite(observationSeconds, "observationSeconds", {
            minimum: 0,
            exclusiveMinimum: true
        });
        this.applyImpulse(normalizedDirection, magnitude);
        this.knockbackState = {
            direction: normalizedDirection,
            impulse: magnitude,
            distance: magnitude * durationSeconds,
            durationSeconds,
            remainingSeconds: durationSeconds
        };
        return true;
    }

    applyImpactKnockback({ direction, distance, durationSeconds }) {
        return this.applyExternalImpulse({
            direction,
            impulse: distance / durationSeconds,
            observationSeconds: durationSeconds
        });
    }

    advanceImpactKnockback(dt, surfaces = [], collisionActors = [], collisionBroadPhase = null) {
        if (!this.knockbackState) return Object.freeze({ moved: false, collided: false });
        const stepDt = assertFinite(dt, "dt", { minimum: 0 });
        if (stepDt <= 0) return Object.freeze({ moved: false, collided: false });
        const state = this.knockbackState;
        state.remainingSeconds = Math.max(0, state.remainingSeconds - stepDt);
        if (state.remainingSeconds <= 0) this.knockbackState = null;
        return Object.freeze({ moved: false, collided: this.lastSurfaceCollisionNormals.length > 0 });
    }
}

export class EnemyObject extends withEnemyWeaponSimulation(EnemyBodyObject) {}

export class UnarmedEnemyObject extends EnemyBodyObject {}

const ENEMY_OBJECT_CLASS_BY_PROJECTILE_ATTACK = Object.freeze({
    true: EnemyObject,
    false: UnarmedEnemyObject
});

export function createEnemyObject({ usesProjectileAttack = null, ...options }) {
    const enabled = usesProjectileAttack ?? !options.rules?.includes(ENEMY_RULE.NO_PROJECTILE_ATTACK);
    const EnemyClass = ENEMY_OBJECT_CLASS_BY_PROJECTILE_ATTACK[Boolean(enabled)];
    return new EnemyClass(options);
}
