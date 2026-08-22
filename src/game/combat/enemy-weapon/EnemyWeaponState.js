import { TimedStateController } from "../../../core/state/TimedStateController.js";
import { PROJECTILE_TYPE } from "../ProjectileDefinition.js";
import { BallisticProjectileObject } from "../ProjectileObject.js";
import { ENEMY_ATTACK_STATES, ENEMY_ATTACK_TRANSITIONS, normalizeEnemyState } from "../EnemyStateCatalog.js";
import {
    ENEMY_ATTACK_STATE,
    ENEMY_ATTACK_STATE_USES_COOLDOWN,
    ENEMY_RULE,
    ENEMY_WEAPON_CONFIG
} from "./EnemyWeaponDefinition.js";
import { directionFromEnemyToTarget, selectEnemyWeaponTarget } from "./EnemyWeaponTargeting.js";
import { enemyWeaponStateById } from "./states/EnemyWeaponStateCatalog.js";

export class EnemyWeaponState {
    #controller;

    constructor({
        attackState = ENEMY_ATTACK_STATE.IDLE,
        attackStateRemaining = ENEMY_WEAPON_CONFIG.ZERO,
        aimDirection = null,
        lockedTargetId = null,
        fireCooldown = ENEMY_WEAPON_CONFIG.ZERO
    } = {}) {
        this.#controller = new TimedStateController({
            initialState: ENEMY_ATTACK_STATE.IDLE,
            transitions: ENEMY_ATTACK_TRANSITIONS,
            state: normalizeEnemyState(attackState, ENEMY_ATTACK_STATES, ENEMY_ATTACK_STATE.IDLE),
            remainingSeconds: Math.max(ENEMY_WEAPON_CONFIG.ZERO, attackStateRemaining ?? ENEMY_WEAPON_CONFIG.ZERO)
        });
        this.lockedTargetId = lockedTargetId;
        this.aimDirection = aimDirection ? Object.freeze({ x: aimDirection.x, y: aimDirection.y }) : null;
        this.fireCooldown = ENEMY_ATTACK_STATE_USES_COOLDOWN[this.state]
            ? Math.max(ENEMY_WEAPON_CONFIG.ZERO, fireCooldown ?? ENEMY_WEAPON_CONFIG.ZERO)
            : ENEMY_WEAPON_CONFIG.ZERO;
    }

    get state() {
        return this.#controller.state;
    }

    get remainingSeconds() {
        return this.#controller.remainingSeconds;
    }

    transition(state, durationSeconds = ENEMY_WEAPON_CONFIG.ZERO, { restart = false } = {}) {
        const result = this.#controller.transition(state, { durationSeconds, restart });
        if (!result.accepted) {
            throw new Error(`invalid enemy attack transition: ${result.from} -> ${result.to}`);
        }
    }

    consume(dt) {
        return this.#controller.consume(dt);
    }

    aimAt(enemy, target) {
        const direction = directionFromEnemyToTarget(enemy, target);
        if (!direction) return false;
        this.aimDirection = direction;
        return true;
    }

    clearAim() {
        this.aimDirection = null;
    }

    setFireCooldown(value) {
        this.fireCooldown = value;
    }

    reset() {
        this.lockedTargetId = null;
        this.aimDirection = null;
        this.fireCooldown = ENEMY_WEAPON_CONFIG.ZERO;
        this.transition(ENEMY_ATTACK_STATE.IDLE, ENEMY_WEAPON_CONFIG.ZERO, { restart: true });
    }

    advance(enemy, { visibleTargets, range, dt, ...context }) {
        const currentState = enemyWeaponStateById(this.state);
        const target = selectEnemyWeaponTarget({
            enemy,
            visibleTargets,
            range,
            lockedTargetId: this.lockedTargetId,
            canAcquireTarget: currentState.canAcquireTarget
        });
        if (!target) {
            this.reset();
            return Object.freeze({ spawnedProjectile: null, shouldAdvancePatrol: true });
        }
        this.lockedTargetId = target.id;
        let remainingDt = Math.max(ENEMY_WEAPON_CONFIG.ZERO, dt);
        let spawnedProjectile = null;
        for (
            let transitions = ENEMY_WEAPON_CONFIG.ZERO;
            transitions < ENEMY_WEAPON_CONFIG.MAXIMUM_TRANSITIONS_PER_STEP;
            transitions += ENEMY_WEAPON_CONFIG.UNIT
        ) {
            const result = enemyWeaponStateById(this.state).advance(this, {
                enemy,
                target,
                remainingDt,
                ...context
            });
            remainingDt = result.remainingDt;
            spawnedProjectile = result.spawnedProjectile ?? spawnedProjectile;
            if (!result.continueState) break;
        }
        return Object.freeze({ spawnedProjectile, shouldAdvancePatrol: false });
    }

    spawnProjectile({ enemy, target, config, projectiles, registry }) {
        const velocity = enemy.position.clone();
        velocity.set(
            this.aimDirection.x * config.enemyProjectileSpeed,
            this.aimDirection.y * config.enemyProjectileSpeed
        );
        const projectile = new BallisticProjectileObject({
            id: registry.createId(PROJECTILE_TYPE.ENEMY),
            ownerId: enemy.id,
            targetId: target.id,
            position: enemy.position.clone(),
            velocity,
            radius: config.enemyProjectileRadius,
            damage: config.enemyProjectileDamage,
            canCutRope: enemy.rules.includes(ENEMY_RULE.CUTTER_FIRE)
        });
        projectiles.push(projectile);
        return projectile;
    }

    snapshot() {
        return Object.freeze({
            lockedTargetId: this.lockedTargetId,
            attackState: this.state,
            attackStateRemaining: this.remainingSeconds,
            aimDirection: this.aimDirection,
            fireCooldown: this.fireCooldown
        });
    }

    restore({ attackState, attackStateRemaining, aimDirection, lockedTargetId, fireCooldown }) {
        const normalizedState = normalizeEnemyState(attackState, ENEMY_ATTACK_STATES, ENEMY_ATTACK_STATE.IDLE);
        this.#controller.restore({
            state: normalizedState,
            remainingSeconds: Math.max(ENEMY_WEAPON_CONFIG.ZERO, attackStateRemaining ?? ENEMY_WEAPON_CONFIG.ZERO)
        });
        this.lockedTargetId = lockedTargetId ?? null;
        this.aimDirection = aimDirection ? Object.freeze({ x: aimDirection.x, y: aimDirection.y }) : null;
        this.fireCooldown = ENEMY_ATTACK_STATE_USES_COOLDOWN[normalizedState]
            ? Math.max(ENEMY_WEAPON_CONFIG.ZERO, fireCooldown ?? ENEMY_WEAPON_CONFIG.ZERO)
            : ENEMY_WEAPON_CONFIG.ZERO;
    }
}
