import { ENEMY_TYPE } from "../EnemyType.js";
import {
    ARTILLERY_BEHAVIOR_STATE,
    PURSUIT_BEHAVIOR_STATE,
    SHIELD_BEHAVIOR_STATE,
    SUPPORT_BEHAVIOR_STATE,
    SWARM_BEHAVIOR_STATE
} from "./enemy-behavior/EnemyBehaviorDefinition.js";
import { ENEMY_ATTACK_STATE } from "./enemy-weapon/EnemyWeaponDefinition.js";

export class EnemyFeedbackDefinition {
    constructor({ predicate, request }) {
        if (typeof predicate !== "function" || typeof request !== "function") {
            throw new Error("EnemyFeedbackDefinition requires predicate and request functions");
        }
        this.predicate = predicate;
        this.request = request;
        Object.freeze(this);
    }
}

function directionTo(from, to) {
    if (!from || !to) return null;
    return { x: to.x - from.x, y: to.y - from.y };
}

export const ENEMY_FEEDBACK = Object.freeze({
    TRACK: new EnemyFeedbackDefinition({
        predicate: (enemy) =>
            enemy.attackState === ENEMY_ATTACK_STATE.TRACK &&
            Boolean(enemy.aimDirection ?? enemy.presentationAimDirection),
        request: (enemy) => ({
            id: `aim:${enemy.id}:track`,
            presetId: "enemy-aim",
            position: enemy.position,
            direction: enemy.aimDirection ?? enemy.presentationAimDirection,
            options: { density: 0.45 }
        })
    }),
    LOCK: new EnemyFeedbackDefinition({
        predicate: (enemy) =>
            enemy.attackState === ENEMY_ATTACK_STATE.LOCK &&
            Boolean(enemy.aimDirection ?? enemy.presentationAimDirection),
        request: (enemy) => ({
            id: `aim:${enemy.id}:lock`,
            presetId: "enemy-aim",
            position: enemy.position,
            direction: enemy.aimDirection ?? enemy.presentationAimDirection,
            options: { density: 0.75 }
        })
    }),
    SHIELD_GUARD: new EnemyFeedbackDefinition({
        predicate: (enemy, _byId, state) =>
            enemy.enemyType === ENEMY_TYPE.SHIELD_DRONE_T1 && state === SHIELD_BEHAVIOR_STATE.GUARD,
        request: (enemy) => ({
            id: `shield:${enemy.id}`,
            presetId: "shield-flow",
            position: enemy.position,
            direction: enemy.behaviorState?.guardDirection
        })
    }),
    SUPPORT_LINK: new EnemyFeedbackDefinition({
        predicate: (enemy, byId, state) =>
            Boolean(
                enemy.enemyType === ENEMY_TYPE.SUPPORT_DRONE_T1 &&
                state === SUPPORT_BEHAVIOR_STATE.LINK &&
                byId.get(enemy.behaviorState?.targetId)?.position
            ),
        request: (enemy, byId) => {
            const targetPosition = byId.get(enemy.behaviorState?.targetId).position;
            return {
                id: `support:${enemy.id}`,
                presetId: "support-link",
                position: enemy.position,
                direction: directionTo(enemy.position, targetPosition),
                options: { targetPosition }
            };
        }
    }),
    SWARM_ORBIT: new EnemyFeedbackDefinition({
        predicate: (enemy, _byId, state) =>
            enemy.enemyType === ENEMY_TYPE.SWARM_DRONE_T1 && state === SWARM_BEHAVIOR_STATE.ORBIT,
        request: (enemy) => ({
            id: `swarm:${enemy.id}:orbit`,
            presetId: "swarm-orbit",
            position: enemy.position,
            direction: enemy.behaviorState?.diveDirection
        })
    }),
    SWARM_DIVE: new EnemyFeedbackDefinition({
        predicate: (enemy, _byId, state) =>
            enemy.enemyType === ENEMY_TYPE.SWARM_DRONE_T1 && state === SWARM_BEHAVIOR_STATE.DIVE,
        request: (enemy) => ({
            id: `swarm:${enemy.id}:dive`,
            presetId: "swarm-dive",
            position: enemy.position,
            direction: enemy.behaviorState?.diveDirection
        })
    }),
    PURSUIT_WINDUP: new EnemyFeedbackDefinition({
        predicate: (enemy, _byId, state) =>
            enemy.enemyType === ENEMY_TYPE.PURSUIT_DRONE_T1 && state === PURSUIT_BEHAVIOR_STATE.WINDUP,
        request: (enemy) => ({
            id: `pursuit:${enemy.id}`,
            presetId: "pursuit-converge",
            position: enemy.position,
            direction: enemy.behaviorState?.dashDirection,
            options: { targetPosition: enemy.position }
        })
    }),
    PURSUIT_DASH: new EnemyFeedbackDefinition({
        predicate: (enemy, _byId, state) =>
            enemy.enemyType === ENEMY_TYPE.PURSUIT_DRONE_T1 && state === PURSUIT_BEHAVIOR_STATE.DASH,
        request: (enemy) => ({
            id: `pursuit:${enemy.id}`,
            presetId: "enemy-muzzle",
            position: enemy.position,
            direction: enemy.behaviorState?.dashDirection
        })
    }),
    ARTILLERY_TELEGRAPH: new EnemyFeedbackDefinition({
        predicate: (enemy, _byId, state) =>
            enemy.enemyType === ENEMY_TYPE.ARTILLERY_DRONE_T1 && state === ARTILLERY_BEHAVIOR_STATE.TELEGRAPH,
        request: (enemy) => {
            const targetPosition = enemy.behaviorState?.targetPosition;
            const radius = enemy.behaviorState?.strikeRadius ?? 72;
            return {
                id: `artillery:${enemy.id}`,
                presetId: "artillery-warning",
                position: targetPosition,
                direction: directionTo(enemy.position, targetPosition),
                options: {
                    bounds: targetPosition && {
                        minX: targetPosition.x - radius,
                        minY: targetPosition.y - radius,
                        maxX: targetPosition.x + radius,
                        maxY: targetPosition.y + radius
                    },
                    targetPosition
                }
            };
        }
    })
});
