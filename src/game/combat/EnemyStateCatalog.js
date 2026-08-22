import {
    ARTILLERY_BEHAVIOR_STATE,
    ENEMY_BEHAVIOR_KIND,
    PURSUIT_BEHAVIOR_STATE,
    SHIELD_BEHAVIOR_STATE,
    SUPPORT_BEHAVIOR_STATE,
    SWARM_BEHAVIOR_STATE
} from "./enemy-behavior/EnemyBehaviorDefinition.js";
import { ENEMY_ATTACK_STATE } from "./enemy-weapon/EnemyWeaponDefinition.js";

function transitions(definition) {
    return Object.freeze(
        Object.fromEntries(
            Object.entries(definition).map(([state, destinations]) => [state, Object.freeze(destinations)])
        )
    );
}

export const ENEMY_ATTACK_TRANSITIONS = transitions({
    [ENEMY_ATTACK_STATE.IDLE]: [ENEMY_ATTACK_STATE.ACQUIRE],
    [ENEMY_ATTACK_STATE.ACQUIRE]: [ENEMY_ATTACK_STATE.IDLE, ENEMY_ATTACK_STATE.TRACK],
    [ENEMY_ATTACK_STATE.TRACK]: [ENEMY_ATTACK_STATE.IDLE, ENEMY_ATTACK_STATE.LOCK],
    [ENEMY_ATTACK_STATE.LOCK]: [ENEMY_ATTACK_STATE.IDLE, ENEMY_ATTACK_STATE.FIRE],
    [ENEMY_ATTACK_STATE.FIRE]: [ENEMY_ATTACK_STATE.IDLE, ENEMY_ATTACK_STATE.COOLDOWN],
    [ENEMY_ATTACK_STATE.COOLDOWN]: [ENEMY_ATTACK_STATE.IDLE, ENEMY_ATTACK_STATE.TRACK]
});
export const ENEMY_ATTACK_STATES = Object.freeze(Object.keys(ENEMY_ATTACK_TRANSITIONS));

export const ENEMY_BEHAVIOR_TRANSITIONS = Object.freeze({
    [ENEMY_BEHAVIOR_KIND.PURSUIT]: transitions({
        [PURSUIT_BEHAVIOR_STATE.SEEK]: [PURSUIT_BEHAVIOR_STATE.WINDUP],
        [PURSUIT_BEHAVIOR_STATE.WINDUP]: [PURSUIT_BEHAVIOR_STATE.DASH],
        [PURSUIT_BEHAVIOR_STATE.DASH]: [PURSUIT_BEHAVIOR_STATE.RECOVER],
        [PURSUIT_BEHAVIOR_STATE.RECOVER]: [PURSUIT_BEHAVIOR_STATE.SEEK]
    }),
    [ENEMY_BEHAVIOR_KIND.SHIELD]: transitions({ [SHIELD_BEHAVIOR_STATE.GUARD]: [] }),
    [ENEMY_BEHAVIOR_KIND.ARTILLERY]: transitions({
        [ARTILLERY_BEHAVIOR_STATE.IDLE]: [ARTILLERY_BEHAVIOR_STATE.TELEGRAPH],
        [ARTILLERY_BEHAVIOR_STATE.TELEGRAPH]: [ARTILLERY_BEHAVIOR_STATE.COOLDOWN],
        [ARTILLERY_BEHAVIOR_STATE.COOLDOWN]: [ARTILLERY_BEHAVIOR_STATE.IDLE]
    }),
    [ENEMY_BEHAVIOR_KIND.SUPPORT]: transitions({
        [SUPPORT_BEHAVIOR_STATE.IDLE]: [SUPPORT_BEHAVIOR_STATE.LINK],
        [SUPPORT_BEHAVIOR_STATE.LINK]: [SUPPORT_BEHAVIOR_STATE.IDLE]
    }),
    [ENEMY_BEHAVIOR_KIND.SWARM]: transitions({
        [SWARM_BEHAVIOR_STATE.ORBIT]: [SWARM_BEHAVIOR_STATE.DIVE],
        [SWARM_BEHAVIOR_STATE.DIVE]: [SWARM_BEHAVIOR_STATE.RECOVER],
        [SWARM_BEHAVIOR_STATE.RECOVER]: [SWARM_BEHAVIOR_STATE.ORBIT]
    })
});
export const ENEMY_BEHAVIOR_STATES = Object.freeze(
    Object.fromEntries(
        Object.entries(ENEMY_BEHAVIOR_TRANSITIONS).map(([kind, stateTransitions]) => [
            kind,
            Object.freeze(Object.keys(stateTransitions))
        ])
    )
);

export function normalizeEnemyState(state, availableStates, fallback) {
    return availableStates.includes(state) ? state : fallback;
}
