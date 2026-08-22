export const ENEMY_TYPE = Object.freeze({
    SENTRY: "sentry",
    SENTRY_T1: "sentry-t1",
    PATROL_DRONE: "patrol-drone",
    PATROL_DRONE_T1: "patrol-drone-t1",
    PURSUIT_DRONE_T1: "pursuit-drone-t1",
    SHIELD_DRONE_T1: "shield-drone-t1",
    ARTILLERY_DRONE_T1: "artillery-drone-t1",
    SUPPORT_DRONE_T1: "support-drone-t1",
    SWARM_DRONE_T1: "swarm-drone-t1"
});

export const DEFAULT_ENEMY_TYPE_ID = ENEMY_TYPE.SENTRY_T1;
export const AUTHORABLE_ENEMY_TYPE_IDS = Object.freeze([
    ENEMY_TYPE.SENTRY_T1,
    ENEMY_TYPE.PATROL_DRONE_T1,
    ENEMY_TYPE.PURSUIT_DRONE_T1,
    ENEMY_TYPE.SHIELD_DRONE_T1,
    ENEMY_TYPE.ARTILLERY_DRONE_T1,
    ENEMY_TYPE.SUPPORT_DRONE_T1,
    ENEMY_TYPE.SWARM_DRONE_T1
]);
