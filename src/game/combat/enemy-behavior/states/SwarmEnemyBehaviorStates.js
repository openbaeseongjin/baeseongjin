import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_EVENT_TYPE, SWARM_BEHAVIOR_STATE } from "../EnemyBehaviorDefinition.js";
import { directionBetween, moveInDirection, nearestTarget } from "../EnemyBehaviorSupport.js";

export class SwarmOrbitState {
    advance(behavior, enemy, { enemies, targets }) {
        const target = nearestTarget(enemy, targets, behavior.acquireRange);
        if (!target) return null;
        const group = enemies
            .filter(
                (candidate) => candidate.enemyType === enemy.enemyType && candidate.swarmGroupId === enemy.swarmGroupId
            )
            .sort((left, right) => left.id.localeCompare(right.id));
        const hasDiver = group.some(
            (candidate) => candidate !== enemy && candidate.enemyBehaviorSnapshot()?.state === SWARM_BEHAVIOR_STATE.DIVE
        );
        const firstReady = group.find(
            (candidate) => candidate.enemyBehaviorSnapshot()?.state === SWARM_BEHAVIOR_STATE.ORBIT
        );
        if (hasDiver || firstReady !== enemy) return null;
        behavior.transition(SWARM_BEHAVIOR_STATE.DIVE, behavior.diveSeconds);
        behavior.diveDirection = directionBetween(enemy.position, target.physics.position);
        return Object.freeze({ type: ENEMY_BEHAVIOR_EVENT_TYPE.SWARM_DIVE_STARTED, targetId: target.id });
    }
}

export class SwarmDiveState {
    advance(behavior, enemy, { dt }) {
        const consumed = behavior.consume(dt);
        moveInDirection(enemy, behavior.diveDirection, behavior.diveSpeed * consumed, dt);
        if (behavior.remainingSeconds <= ENEMY_BEHAVIOR_CONFIG.ZERO) {
            behavior.transition(SWARM_BEHAVIOR_STATE.RECOVER, behavior.recoverySeconds);
            return Object.freeze({ type: ENEMY_BEHAVIOR_EVENT_TYPE.SWARM_RECOVERY_STARTED });
        }
        return null;
    }
}

export class SwarmRecoverState {
    advance(behavior, _enemy, { dt }) {
        behavior.consume(dt);
        if (behavior.remainingSeconds <= ENEMY_BEHAVIOR_CONFIG.ZERO) {
            behavior.transition(SWARM_BEHAVIOR_STATE.ORBIT);
        }
        return null;
    }
}

export const SWARM_BEHAVIOR_STATE_DEFINITION = Object.freeze({
    [SWARM_BEHAVIOR_STATE.ORBIT]: Object.freeze(new SwarmOrbitState()),
    [SWARM_BEHAVIOR_STATE.DIVE]: Object.freeze(new SwarmDiveState()),
    [SWARM_BEHAVIOR_STATE.RECOVER]: Object.freeze(new SwarmRecoverState())
});
