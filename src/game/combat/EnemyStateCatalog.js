function transitions(definition) {
    return Object.freeze(
        Object.fromEntries(
            Object.entries(definition).map(([state, destinations]) => [state, Object.freeze(destinations)])
        )
    );
}

export const ENEMY_ATTACK_TRANSITIONS = transitions({
    idle: ["acquire"],
    acquire: ["idle", "track"],
    track: ["idle", "lock"],
    lock: ["idle", "fire"],
    fire: ["idle", "cooldown"],
    cooldown: ["idle", "track"]
});
export const ENEMY_ATTACK_STATES = Object.freeze(Object.keys(ENEMY_ATTACK_TRANSITIONS));

export const ENEMY_BEHAVIOR_TRANSITIONS = Object.freeze({
    pursuit: transitions({ seek: ["windup"], windup: ["dash"], dash: ["recover"], recover: ["seek"] }),
    shield: transitions({ guard: [] }),
    artillery: transitions({ idle: ["telegraph"], telegraph: ["cooldown"], cooldown: ["idle"] }),
    support: transitions({ idle: ["link"], link: ["idle"] }),
    swarm: transitions({ orbit: ["dive"], dive: ["recover"], recover: ["orbit"] })
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
