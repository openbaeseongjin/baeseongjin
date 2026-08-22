import { Vector2 } from "../../../../game-kit/index.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_EVENT_TYPE, SWARM_BEHAVIOR_STATE } from "../EnemyBehaviorDefinition.js";
import { directionBetween, eligibleTargets, moveInDirection, nearestTarget } from "../EnemyBehaviorSupport.js";

function swarmGroup(enemy, enemies) {
    return enemies.filter(
        (candidate) =>
            candidate.health > ENEMY_BEHAVIOR_CONFIG.ZERO &&
            candidate.enemyType === enemy.enemyType &&
            candidate.swarmGroupId === enemy.swarmGroupId
    );
}

function groupCenter(group) {
    const center = new Vector2();
    for (const member of group) center.add(member.position);
    return center.scale(ENEMY_BEHAVIOR_CONFIG.UNIT / Math.max(ENEMY_BEHAVIOR_CONFIG.UNIT, group.length));
}

function contactTarget(behavior, enemy, targets) {
    return eligibleTargets(enemy, targets, behavior.acquireRange)
        .filter(({ id }) => enemy.collidedWithActor(id))
        .sort((left, right) => left.id.localeCompare(right.id))[ENEMY_BEHAVIOR_CONFIG.ZERO];
}

export class SwarmChaseState {
    advance(behavior, enemy, { enemies, targets, dt }) {
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
        const target = nearestTarget(enemy, targets, behavior.acquireRange);
        if (!target) return null;
        const center = groupCenter(swarmGroup(enemy, enemies));
        const direction = directionBetween(enemy.position, target.physics.position);
        if (enemy.position.distanceTo(center) > behavior.cohesionDistance) {
            direction.add(directionBetween(enemy.position, center).scale(behavior.cohesionWeight)).normalize();
        }
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
