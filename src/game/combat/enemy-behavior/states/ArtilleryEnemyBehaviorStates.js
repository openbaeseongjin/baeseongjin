import {
    ARTILLERY_BEHAVIOR_STATE,
    ENEMY_BEHAVIOR_CONFIG,
    ENEMY_BEHAVIOR_EVENT_TYPE
} from "../EnemyBehaviorDefinition.js";
import { nearestTarget } from "../EnemyBehaviorSupport.js";

export class ArtilleryIdleState {
    advance(behavior, enemy, { targets, dt }) {
        const target = nearestTarget(enemy, targets, behavior.acquireRange);
        if (!target) {
            behavior.mobility.advance(enemy, { dt });
            return null;
        }
        behavior.transition(ARTILLERY_BEHAVIOR_STATE.TELEGRAPH, behavior.telegraphSeconds);
        behavior.targetId = target.id;
        behavior.targetPosition = { x: target.physics.position.x, y: target.physics.position.y };
        return Object.freeze({
            type: ENEMY_BEHAVIOR_EVENT_TYPE.ARTILLERY_TELEGRAPH,
            targetId: target.id,
            position: Object.freeze({ ...behavior.targetPosition }),
            radius: behavior.strikeRadius
        });
    }
}

export class ArtilleryTelegraphState {
    advance(behavior, _enemy, { dt }) {
        behavior.consume(dt);
        if (behavior.remainingSeconds > ENEMY_BEHAVIOR_CONFIG.ZERO) return null;
        const outcome = Object.freeze({
            type: ENEMY_BEHAVIOR_EVENT_TYPE.ARTILLERY_STRIKE,
            targetId: behavior.targetId,
            position: Object.freeze({ ...behavior.targetPosition }),
            radius: behavior.strikeRadius,
            damage: behavior.damage
        });
        behavior.transition(ARTILLERY_BEHAVIOR_STATE.COOLDOWN, behavior.cooldownSeconds);
        return outcome;
    }
}

export class ArtilleryCooldownState {
    advance(behavior, enemy, { targets, dt }) {
        const target = nearestTarget(enemy, targets, behavior.acquireRange);
        behavior.mobility.advance(enemy, { focusPosition: target?.physics.position ?? null, dt });
        behavior.consume(dt);
        if (behavior.remainingSeconds <= ENEMY_BEHAVIOR_CONFIG.ZERO) {
            behavior.transition(ARTILLERY_BEHAVIOR_STATE.IDLE);
            behavior.targetId = null;
            behavior.targetPosition = null;
        }
        return null;
    }
}

export const ARTILLERY_BEHAVIOR_STATE_DEFINITION = Object.freeze({
    [ARTILLERY_BEHAVIOR_STATE.IDLE]: Object.freeze(new ArtilleryIdleState()),
    [ARTILLERY_BEHAVIOR_STATE.TELEGRAPH]: Object.freeze(new ArtilleryTelegraphState()),
    [ARTILLERY_BEHAVIOR_STATE.COOLDOWN]: Object.freeze(new ArtilleryCooldownState())
});
