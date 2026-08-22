import {
    ENEMY_BEHAVIOR_CONFIG,
    ENEMY_BEHAVIOR_EVENT_TYPE,
    PURSUIT_BEHAVIOR_STATE
} from "../EnemyBehaviorDefinition.js";
import {
    behaviorStepResult,
    directionBetween,
    frozenDirection,
    moveInDirection,
    nearestTarget
} from "../EnemyBehaviorSupport.js";

export class PursuitSeekState {
    advance(behavior, enemy, { targets, dt, remainingDt }) {
        const target = nearestTarget(enemy, targets, behavior.acquireRange);
        if (!target) {
            behavior.targetId = null;
            return behaviorStepResult(remainingDt);
        }
        behavior.targetId = target.id;
        const direction = directionBetween(enemy.position, target.physics.position);
        const distance = enemy.position.distanceTo(target.physics.position);
        if (distance <= behavior.triggerDistance) {
            behavior.transition(PURSUIT_BEHAVIOR_STATE.WINDUP, behavior.windupSeconds);
            behavior.dashDirection = direction;
            return behaviorStepResult(remainingDt, {
                outcome: Object.freeze({ type: ENEMY_BEHAVIOR_EVENT_TYPE.PURSUIT_WINDUP, targetId: target.id }),
                continueState: remainingDt > ENEMY_BEHAVIOR_CONFIG.ZERO
            });
        }
        moveInDirection(
            enemy,
            direction,
            Math.min(distance - behavior.triggerDistance, behavior.moveSpeed * remainingDt),
            dt
        );
        return behaviorStepResult(remainingDt);
    }
}

export class PursuitWindupState {
    advance(behavior, _enemy, { remainingDt }) {
        const nextRemainingDt = remainingDt - behavior.consume(remainingDt);
        if (behavior.remainingSeconds > ENEMY_BEHAVIOR_CONFIG.ZERO) return behaviorStepResult(nextRemainingDt);
        behavior.transition(PURSUIT_BEHAVIOR_STATE.DASH, behavior.dashSeconds);
        return behaviorStepResult(nextRemainingDt, {
            outcome: Object.freeze({
                type: ENEMY_BEHAVIOR_EVENT_TYPE.PURSUIT_DASH_STARTED,
                targetId: behavior.targetId,
                direction: frozenDirection(behavior.dashDirection)
            }),
            continueState: nextRemainingDt > ENEMY_BEHAVIOR_CONFIG.ZERO
        });
    }
}

export class PursuitDashState {
    advance(behavior, enemy, { dt, remainingDt }) {
        const consumed = behavior.consume(remainingDt);
        const nextRemainingDt = remainingDt - consumed;
        moveInDirection(enemy, behavior.dashDirection, behavior.dashSpeed * consumed, dt);
        if (behavior.remainingSeconds > ENEMY_BEHAVIOR_CONFIG.ZERO) return behaviorStepResult(nextRemainingDt);
        behavior.transition(PURSUIT_BEHAVIOR_STATE.RECOVER, behavior.recoverySeconds);
        return behaviorStepResult(nextRemainingDt, {
            outcome: Object.freeze({ type: ENEMY_BEHAVIOR_EVENT_TYPE.PURSUIT_RECOVERY_STARTED }),
            continueState: nextRemainingDt > ENEMY_BEHAVIOR_CONFIG.ZERO
        });
    }
}

export class PursuitRecoverState {
    advance(behavior, _enemy, { remainingDt }) {
        const nextRemainingDt = remainingDt - behavior.consume(remainingDt);
        if (behavior.remainingSeconds > ENEMY_BEHAVIOR_CONFIG.ZERO) return behaviorStepResult(nextRemainingDt);
        behavior.transition(PURSUIT_BEHAVIOR_STATE.SEEK);
        behavior.targetId = null;
        return behaviorStepResult(nextRemainingDt, {
            continueState: nextRemainingDt > ENEMY_BEHAVIOR_CONFIG.ZERO
        });
    }
}

export const PURSUIT_BEHAVIOR_STATE_DEFINITION = Object.freeze({
    [PURSUIT_BEHAVIOR_STATE.SEEK]: Object.freeze(new PursuitSeekState()),
    [PURSUIT_BEHAVIOR_STATE.WINDUP]: Object.freeze(new PursuitWindupState()),
    [PURSUIT_BEHAVIOR_STATE.DASH]: Object.freeze(new PursuitDashState()),
    [PURSUIT_BEHAVIOR_STATE.RECOVER]: Object.freeze(new PursuitRecoverState())
});
