import {
    ENEMY_BEHAVIOR_CONFIG,
    ENEMY_BEHAVIOR_EVENT_TYPE,
    SUPPORT_BEHAVIOR_STATE
} from "../EnemyBehaviorDefinition.js";
import { directionBetween, moveInDirection, nearestTarget } from "../EnemyBehaviorSupport.js";

function healthRatio(enemy) {
    return enemy.health / enemy.maxHealth;
}

function woundedTargets(behavior, enemy, enemies) {
    return enemies
        .filter(
            (candidate) =>
                candidate !== enemy &&
                candidate.health > ENEMY_BEHAVIOR_CONFIG.ZERO &&
                candidate.health < candidate.maxHealth &&
                enemy.position.distanceTo(candidate.position) <= behavior.recognitionRange
        )
        .sort((left, right) => {
            const ratioDifference = healthRatio(left) - healthRatio(right);
            const distanceDifference =
                enemy.position.distanceTo(left.position) - enemy.position.distanceTo(right.position);
            return ratioDifference || distanceDifference || left.id.localeCompare(right.id);
        });
}

function treatmentTarget(behavior, enemy, enemies) {
    const candidates = woundedTargets(behavior, enemy, enemies);
    const mostUrgent = candidates[ENEMY_BEHAVIOR_CONFIG.ZERO] ?? null;
    const current = candidates.find(({ id }) => id === behavior.targetId) ?? null;
    if (!current || !mostUrgent) return mostUrgent;
    return healthRatio(mostUrgent) <= healthRatio(current) - behavior.retargetHealthRatioGap ? mostUrgent : current;
}

function heal(behavior, healer, target, dt) {
    const previousHealth = target.health;
    const requestedHealing = Math.min(target.maxHealth - target.health, behavior.healingPerSecond * dt);
    const healing = Math.min(requestedHealing, healer.health / behavior.healthSpentPerHealing);
    const healthSpent = healing * behavior.healthSpentPerHealing;
    target.health += healing;
    healer.health = Math.max(ENEMY_BEHAVIOR_CONFIG.ZERO, healer.health - healthSpent);
    return Object.freeze({
        type: ENEMY_BEHAVIOR_EVENT_TYPE.SUPPORT_LINK,
        targetId: target.id,
        healing: target.health - previousHealth,
        healthSpent
    });
}

function approachTarget(behavior, enemy, target, dt) {
    const distance = enemy.position.distanceTo(target.position);
    if (distance <= behavior.linkRange) return false;
    return moveInDirection(
        enemy,
        directionBetween(enemy.position, target.position),
        Math.min(distance - behavior.linkRange, behavior.approachSpeed * dt),
        dt
    );
}

function retreatWhileLinked(behavior, enemy, target, players, dt) {
    const player = nearestTarget(enemy, players, behavior.retreatRange);
    if (!player) return false;
    const start = enemy.predictedSurfacePosition(dt);
    const away = directionBetween(player.physics.position, start);
    const destination = start.clone().add(away.scale(behavior.retreatSpeed * dt));
    const targetOffset = directionBetween(target.position, destination);
    const targetDistance = target.position.distanceTo(destination);
    if (targetDistance > behavior.linkRange) {
        destination.set(
            target.position.x + targetOffset.x * behavior.linkRange,
            target.position.y + targetOffset.y * behavior.linkRange
        );
    }
    return enemy.queueSurfaceDisplacement(destination.subtract(start), dt);
}

function advanceTreatment(behavior, enemy, target, players, dt) {
    behavior.targetId = target.id;
    if (approachTarget(behavior, enemy, target, dt)) return null;
    retreatWhileLinked(behavior, enemy, target, players, dt);
    return heal(behavior, enemy, target, dt);
}

export class SupportIdleState {
    advance(behavior, enemy, { enemies, targets, dt }) {
        const target = treatmentTarget(behavior, enemy, enemies);
        if (!target) {
            const player = nearestTarget(enemy, targets, behavior.recognitionRange, { respectActivation: false });
            behavior.mobility.advance(enemy, { focusPosition: player?.physics.position ?? null, dt });
            return null;
        }
        behavior.transition(SUPPORT_BEHAVIOR_STATE.LINK);
        return advanceTreatment(behavior, enemy, target, targets, dt);
    }
}

export class SupportLinkState {
    advance(behavior, enemy, { enemies, targets, dt }) {
        const target = treatmentTarget(behavior, enemy, enemies);
        if (!target) {
            const endedTargetId = behavior.targetId;
            behavior.targetId = null;
            behavior.transition(SUPPORT_BEHAVIOR_STATE.IDLE);
            return endedTargetId
                ? Object.freeze({ type: ENEMY_BEHAVIOR_EVENT_TYPE.SUPPORT_LINK_ENDED, targetId: endedTargetId })
                : null;
        }
        return advanceTreatment(behavior, enemy, target, targets, dt);
    }
}

export const SUPPORT_BEHAVIOR_STATE_DEFINITION = Object.freeze({
    [SUPPORT_BEHAVIOR_STATE.IDLE]: Object.freeze(new SupportIdleState()),
    [SUPPORT_BEHAVIOR_STATE.LINK]: Object.freeze(new SupportLinkState())
});
