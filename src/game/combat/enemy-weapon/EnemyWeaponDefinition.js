export const ENEMY_ATTACK_STATE = Object.freeze({
    IDLE: "idle",
    ACQUIRE: "acquire",
    TRACK: "track",
    LOCK: "lock",
    FIRE: "fire",
    COOLDOWN: "cooldown"
});

export const ENEMY_SIMULATION_CAPABILITY = Object.freeze({
    BEHAVIOR: "enemy-behavior",
    PRESENTATION_AIM: "enemy-presentation-aim",
    WEAPON: "enemy-weapon",
    PHYSICS: "enemy-physics"
});

export const ENEMY_RULE = Object.freeze({
    COVER_ENDS_LINE_OF_SIGHT: "cover-ends-los",
    NO_PROJECTILE_ATTACK: "no-projectile-attack",
    CUTTER_FIRE: "cutter-fire"
});

export const ENEMY_TARGET_LIFE_STATE = Object.freeze({
    ACTIVE: "active"
});

export const ENEMY_COLLISION_SURFACE_KIND = Object.freeze({
    COVER: "cover"
});

export const ENEMY_WEAPON_CONFIG = Object.freeze({
    ZERO: 0,
    UNIT: 1,
    MAXIMUM_TRANSITIONS_PER_STEP: 8,
    BEHAVIOR_ORDER: 5,
    PRESENTATION_AIM_ORDER: 9,
    WEAPON_ORDER: 10,
    PHYSICS_ORDER: 15
});

export const ENEMY_ATTACK_STATE_USES_COOLDOWN = Object.freeze({
    [ENEMY_ATTACK_STATE.IDLE]: false,
    [ENEMY_ATTACK_STATE.ACQUIRE]: false,
    [ENEMY_ATTACK_STATE.TRACK]: false,
    [ENEMY_ATTACK_STATE.LOCK]: false,
    [ENEMY_ATTACK_STATE.FIRE]: true,
    [ENEMY_ATTACK_STATE.COOLDOWN]: true
});
