import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_EVENT_TYPE, SWARM_BEHAVIOR_STATE } from "../EnemyBehaviorDefinition.js";
import { directionBetween, eligibleTargets, moveInDirection } from "../EnemyBehaviorSupport.js";

function contactTarget(behavior, enemy, targets) {
    return eligibleTargets(enemy, targets, behavior.acquireRange, { respectActivation: false })
        .filter(({ id }) => enemy.collidedWithActor(id))
        .sort((left, right) => left.id.localeCompare(right.id))[ENEMY_BEHAVIOR_CONFIG.ZERO];
}

export class SwarmChaseState {
    advance(behavior, enemy, { targets, swarmFlocks, dt }) {
        const contacted = contactTarget(behavior, enemy, targets);
        if (contacted) {
            behavior.recoilDirection = directionBetween(contacted.physics.position, enemy.position);
            behavior.transition(SWARM_BEHAVIOR_STATE.RECOIL, behavior.recoverySeconds);
            return Object.freeze({
                type: ENEMY_BEHAVIOR_EVENT_TYPE.SWARM_CONTACT,
                targetId: contacted.id,
                damage: behavior.contactDamage
            });
        }
        const flock = swarmFlocks?.get(enemy.swarmGroupId);
        const target = flock?.targetWithin(behavior.acquireRange) ?? null;
        if (!target) return null;
        const direction = flock.chaseDirection(enemy.id, target, {
            neighborRadius: behavior.neighborRadius,
            separationDistance: behavior.separationDistance,
            separationWeight: behavior.separationWeight,
            alignmentWeight: behavior.alignmentWeight,
            cohesionWeight: behavior.cohesionWeight,
            targetWeight: behavior.targetWeight,
            maneuverWeight: behavior.maneuverWeight,
            maximumTurnRadians: behavior.maximumTurnRadiansPerSecond * dt
        });
        moveInDirection(enemy, direction, behavior.chaseSpeed * dt, dt);
        return null;
    }
}

export class SwarmRecoilState {
    advance(behavior, enemy, { dt }) {
        const consumed = behavior.consume(dt);
        moveInDirection(enemy, behavior.recoilDirection, behavior.recoilSpeed * consumed, dt);
        if (behavior.remainingSeconds <= ENEMY_BEHAVIOR_CONFIG.ZERO) {
            behavior.transition(SWARM_BEHAVIOR_STATE.CHASE);
            return Object.freeze({ type: ENEMY_BEHAVIOR_EVENT_TYPE.SWARM_RECOIL_ENDED });
        }
        return null;
    }
}

export const SWARM_BEHAVIOR_STATE_DEFINITION = Object.freeze({
    [SWARM_BEHAVIOR_STATE.CHASE]: Object.freeze(new SwarmChaseState()),
    [SWARM_BEHAVIOR_STATE.RECOIL]: Object.freeze(new SwarmRecoilState())
});
