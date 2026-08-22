import {
    ENEMY_BEHAVIOR_CONFIG,
    ENEMY_BEHAVIOR_EVENT_TYPE,
    SUPPORT_BEHAVIOR_STATE
} from "../EnemyBehaviorDefinition.js";

function woundedTarget(behavior, enemy, enemies) {
    return enemies
        .filter(
            (candidate) =>
                candidate !== enemy &&
                candidate.health > ENEMY_BEHAVIOR_CONFIG.ZERO &&
                candidate.health < candidate.maxHealth &&
                enemy.position.distanceTo(candidate.position) <= behavior.range
        )
        .sort((left, right) => {
            const ratioDifference = left.health / left.maxHealth - right.health / right.maxHealth;
            const distanceDifference =
                enemy.position.distanceTo(left.position) - enemy.position.distanceTo(right.position);
            return ratioDifference || distanceDifference || left.id.localeCompare(right.id);
        })[ENEMY_BEHAVIOR_CONFIG.ZERO];
}

function heal(behavior, target, dt) {
    const previousHealth = target.health;
    target.health = Math.min(target.maxHealth, target.health + behavior.healingPerSecond * dt);
    return Object.freeze({
        type: ENEMY_BEHAVIOR_EVENT_TYPE.SUPPORT_LINK,
        targetId: target.id,
        healing: target.health - previousHealth
    });
}

export class SupportIdleState {
    advance(behavior, enemy, { enemies, dt }) {
        const target = woundedTarget(behavior, enemy, enemies);
        if (!target) return null;
        behavior.targetId = target.id;
        behavior.transition(SUPPORT_BEHAVIOR_STATE.LINK);
        return heal(behavior, target, dt);
    }
}

export class SupportLinkState {
    advance(behavior, enemy, { enemies, dt }) {
        const target = woundedTarget(behavior, enemy, enemies);
        if (!target) {
            const endedTargetId = behavior.targetId;
            behavior.targetId = null;
            behavior.transition(SUPPORT_BEHAVIOR_STATE.IDLE);
            return endedTargetId
                ? Object.freeze({ type: ENEMY_BEHAVIOR_EVENT_TYPE.SUPPORT_LINK_ENDED, targetId: endedTargetId })
                : null;
        }
        behavior.targetId = target.id;
        return heal(behavior, target, dt);
    }
}

export const SUPPORT_BEHAVIOR_STATE_DEFINITION = Object.freeze({
    [SUPPORT_BEHAVIOR_STATE.IDLE]: Object.freeze(new SupportIdleState()),
    [SUPPORT_BEHAVIOR_STATE.LINK]: Object.freeze(new SupportLinkState())
});
