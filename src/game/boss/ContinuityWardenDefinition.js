import { ENEMY_TYPE } from "../EnemyType.js";

const SUMMONED_ENEMY_PREFIX = "boss-06:summoned-enemy:";

export const CONTINUITY_WARDEN_STATE = Object.freeze({
    NEUTRAL: "neutral",
    BATON_1: "baton-1",
    BATON_2: "baton-2",
    OVERHEAD_SLAM: "overhead-slam",
    BACK_SWING: "back-swing",
    GROUND_DASH: "ground-thruster-dash",
    DIAGONAL_DASH: "diagonal-thruster-dash",
    CHARGE: "charge",
    JUMP: "jump",
    LANDING: "landing",
    MISSILE: "homing-missile-salvo",
    SUMMON: "enemy-summon",
    GUARD: "guard",
    COUNTER_READY: "counter-ready",
    COUNTER_BASH: "counter-bash",
    SECURITY_COMMAND: "security-command",
    SECURITY_ACTIVE: "security-active",
    DEFEATED: "defeated"
});

export const CONTINUITY_WARDEN_ACTION_PHASE = Object.freeze({
    TELEGRAPH: "telegraph",
    ACTIVE: "active",
    GAP: "gap",
    RECOVERY: "recovery"
});

export const CONTINUITY_WARDEN_LOCOMOTION_STATE = Object.freeze({
    GROUNDED: "grounded",
    TAKEOFF: "takeoff",
    JUMP: "jump",
    FALL: "fall",
    LANDING: "landing"
});

export const CONTINUITY_WARDEN_PATTERN = Object.freeze({
    BATON: "baton",
    BACK_SWING: "back-swing",
    GROUND_DASH: "ground-dash",
    DIAGONAL_DASH: "diagonal-dash",
    CHARGE: "charge",
    JUMP: "jump",
    MISSILE: "homing-missile",
    SUMMON: "enemy-summon",
    GUARD: "guard",
    COUNTER: "counter",
    SECURITY: "security"
});

export const CONTINUITY_WARDEN_HAZARD = Object.freeze({
    SECURITY_LOW: "security-beam-low",
    SECURITY_HIGH: "security-beam-high",
    LANDING_BURST: "landing-burst"
});

export const CONTINUITY_WARDEN_EVENT = Object.freeze({
    MISSILE_FIRED: "boss-missile-fired",
    ENEMY_SUMMONED: "boss-enemy-summoned"
});

export const CONTINUITY_WARDEN_HAZARD_KIND = Object.freeze({
    [CONTINUITY_WARDEN_STATE.BATON_1]: true,
    [CONTINUITY_WARDEN_STATE.BATON_2]: true,
    [CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM]: true,
    [CONTINUITY_WARDEN_STATE.BACK_SWING]: true,
    [CONTINUITY_WARDEN_STATE.GROUND_DASH]: true,
    [CONTINUITY_WARDEN_STATE.DIAGONAL_DASH]: true,
    [CONTINUITY_WARDEN_STATE.CHARGE]: true,
    [CONTINUITY_WARDEN_STATE.COUNTER_BASH]: true,
    [CONTINUITY_WARDEN_HAZARD.SECURITY_LOW]: true,
    [CONTINUITY_WARDEN_HAZARD.SECURITY_HIGH]: true,
    [CONTINUITY_WARDEN_HAZARD.LANDING_BURST]: true
});

export const CONTINUITY_WARDEN_OBJECT_KIND = Object.freeze({
    WARDEN: "boss-continuity-warden",
    EMITTER: "boss-security-emitter",
    HAZARD: "boss-warden-hazard",
    BEAM: "boss-security-beam",
    GATE: "boss-departure-gate",
    BRIDGE: "boss-threshold-bridge",
    SHUTTLE: "boss-maintenance-shuttle",
    CAMERA: "boss-victory-camera",
    PAD_SURFACE: "boss-pad-surface"
});

export const CONTINUITY_WARDEN_ID = Object.freeze({
    BODY: "boss-06:continuity-warden:body",
    MISSILE_OWNER: "boss-06:continuity-warden:missile-rack",
    EMITTER_LEFT: "boss-06:emitter-left",
    EMITTER_RIGHT: "boss-06:emitter-right",
    DEPARTURE_GATE: "boss-06:departure-gate",
    THRESHOLD_BRIDGE: "boss-06:threshold-bridge",
    SHUTTLE: "boss-06:maintenance-shuttle",
    ATTACK_HAZARD: "boss-06:attack-hazard",
    SECURITY_WARNING: (index) => `boss-06:security-beam-warning:${index}`,
    SECURITY_BEAM: "boss-06:security-beam",
    VICTORY_CAMERA: "boss-06:victory-camera",
    MISSILE: (attempt, sequence, index) => `boss-06:missile:${attempt}:${sequence}:${index}`,
    SUMMON_WARNING: (index) => `boss-06:summon-warning:${index}`,
    SUMMONED_ENEMY_PREFIX,
    SUMMONED_ENEMY: (attempt, sequence, index) => `${SUMMONED_ENEMY_PREFIX}${attempt}:${sequence}:${index}`,
    isSummonedEnemy: (id) => typeof id === "string" && id.startsWith(SUMMONED_ENEMY_PREFIX),
    PRESENTATION_SURFACE: (surfaceId) => `${surfaceId}:presentation`
});

export const CONTINUITY_WARDEN_SURFACE_KIND = Object.freeze({
    MAIN: "main-security-runway",
    LEDGE: "raised-ledge",
    RECOVERY: "recovery-deck",
    DEPARTURE: "departure-deck",
    GRAPPLE_TARGET: "grapple-target"
});

export const CONTINUITY_WARDEN_PROJECTILE_PRESET_ID = "boss-homing-missile";

export const CONTINUITY_WARDEN_SUMMON_ENEMY_TYPES = Object.freeze([
    ENEMY_TYPE.PATROL_DRONE_T1,
    ENEMY_TYPE.PURSUIT_DRONE_T1,
    ENEMY_TYPE.SHIELD_DRONE_T1,
    ENEMY_TYPE.ARTILLERY_DRONE_T1
]);
