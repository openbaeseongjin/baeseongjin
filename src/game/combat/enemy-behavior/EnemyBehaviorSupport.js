import { Vector2 } from "../../../game-kit/index.js";
import { selectNearestPlayer } from "../CombatTargeting.js";
import { ENEMY_TARGET_LIFE_STATE } from "../enemy-weapon/EnemyWeaponDefinition.js";
import { ENEMY_BEHAVIOR_CONFIG } from "./EnemyBehaviorDefinition.js";

export function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

export function eligibleTargets(enemy, targets, range = Number.POSITIVE_INFINITY, { respectActivation = true } = {}) {
    const insideActivation =
        respectActivation && enemy.activation
            ? targets.filter(
                  ({ physics }) =>
                      physics.position.x >= enemy.activation.x &&
                      physics.position.x <= enemy.activation.x + enemy.activation.width &&
                      physics.position.y >= enemy.activation.y &&
                      physics.position.y <= enemy.activation.y + enemy.activation.height
              )
            : targets;
    return insideActivation.filter(
        (target) =>
            target.health > ENEMY_BEHAVIOR_CONFIG.ZERO &&
            target.lifeState === ENEMY_TARGET_LIFE_STATE.ACTIVE &&
            enemy.position.distanceTo(target.physics.position) <= range
    );
}

export function nearestTarget(enemy, targets, range, options) {
    return selectNearestPlayer(enemy.position, eligibleTargets(enemy, targets, range, options), range);
}

export function directionBetween(from, to) {
    return new Vector2(to.x - from.x, to.y - from.y).normalize();
}

export function moveInDirection(enemy, direction, distance, dt) {
    if (
        !Number.isFinite(distance) ||
        distance <= ENEMY_BEHAVIOR_CONFIG.ZERO ||
        !Number.isFinite(dt) ||
        dt <= ENEMY_BEHAVIOR_CONFIG.ZERO ||
        direction.length() === ENEMY_BEHAVIOR_CONFIG.ZERO
    ) {
        return false;
    }
    const start = enemy.predictedSurfacePosition(dt);
    const destination = start.clone().add(direction.clone().scale(distance));
    if (enemy.activation) {
        destination.set(
            clamp(destination.x, enemy.activation.x, enemy.activation.x + enemy.activation.width),
            clamp(destination.y, enemy.activation.y, enemy.activation.y + enemy.activation.height)
        );
    }
    return enemy.queueSurfaceDisplacement(destination.subtract(start), dt);
}

export function frozenDirection(direction) {
    return Object.freeze({ x: direction.x, y: direction.y });
}

export function validateBehaviorDt(dt) {
    if (!Number.isFinite(dt) || dt < ENEMY_BEHAVIOR_CONFIG.ZERO) {
        throw new Error("enemy behavior dt must be finite and non-negative");
    }
}

export function behaviorStepResult(remainingDt, { outcome = null, continueState = false } = {}) {
    return Object.freeze({ remainingDt, outcome, continueState });
}
