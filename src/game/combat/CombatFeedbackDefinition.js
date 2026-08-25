import { CLIENT_FEEDBACK_PRESET_ID, CLIENT_FEEDBACK_RESOLUTION } from "./ClientFeedbackEventDefinition.js";

export const COMBAT_EFFECT_TYPE = Object.freeze({
    RING: "ring",
    PARTICLE: "particle",
    TEXT: "text"
});

export const COMBAT_EFFECT_LIFETIME = Object.freeze({
    [COMBAT_EFFECT_TYPE.RING]: 0.3,
    [COMBAT_EFFECT_TYPE.TEXT]: 0.72
});

export const COMBAT_FEEDBACK_LAYOUT = Object.freeze({
    FIRST_INDEX: 0,
    INITIAL_AGE: 0,
    TEXT_OFFSET_Y: -24,
    TEXT_VELOCITY: Object.freeze({ x: 0, y: -34 })
});

export const COMBAT_FEEDBACK_KEY = Object.freeze({
    effect: (event) => event.id ?? `${event.type}:${event.position.x}:${event.position.y}`
});

const DEFAULT_DEFINITION = Object.freeze({
    color: "#67e8f9",
    presetId: CLIENT_FEEDBACK_PRESET_ID.IMPACT,
    strength: 1,
    textSign: 1,
    showText: true,
    emphasis: false
});

const COMBAT_FEEDBACK_BY_RESOLUTION = Object.freeze({
    [CLIENT_FEEDBACK_RESOLUTION.BOSS_DEFEATED]: Object.freeze({
        color: "#fde68a",
        presetId: CLIENT_FEEDBACK_PRESET_ID.ENEMY_DEFEAT,
        strength: 1.45,
        textSign: 1,
        showText: true,
        emphasis: true
    }),
    [CLIENT_FEEDBACK_RESOLUTION.BOSS_PHASE_COMPLETED]: Object.freeze({
        color: "#fde68a",
        presetId: CLIENT_FEEDBACK_PRESET_ID.IMPACT,
        strength: 1.2,
        textSign: 1,
        showText: true,
        emphasis: true
    }),
    [CLIENT_FEEDBACK_RESOLUTION.ENEMY_DEFEATED]: Object.freeze({
        color: "#fde68a",
        presetId: null,
        strength: 1.45,
        textSign: 1,
        showText: true,
        emphasis: true
    }),
    [CLIENT_FEEDBACK_RESOLUTION.PLAYER_HIT]: Object.freeze({
        color: "#fb7185",
        presetId: CLIENT_FEEDBACK_PRESET_ID.ENEMY_IMPACT,
        strength: 1,
        textSign: -1,
        showText: true,
        emphasis: false
    }),
    [CLIENT_FEEDBACK_RESOLUTION.PLATFORM_COLLISION_DAMAGE]: Object.freeze({
        color: "#fb7185",
        presetId: CLIENT_FEEDBACK_PRESET_ID.ENEMY_IMPACT,
        strength: 1,
        textSign: -1,
        showText: true,
        emphasis: false
    }),
    [CLIENT_FEEDBACK_RESOLUTION.ROPE_CUT]: Object.freeze({
        color: "#fb7185",
        presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_CUT,
        strength: 1,
        textSign: 1,
        showText: false,
        emphasis: false
    }),
    [CLIENT_FEEDBACK_RESOLUTION.JAMMER_SHOCK]: Object.freeze({
        color: "#d946ef",
        presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_CUT,
        strength: 1.15,
        textSign: -1,
        showText: false,
        emphasis: true
    })
});

export function combatFeedbackDefinition(resolution) {
    return COMBAT_FEEDBACK_BY_RESOLUTION[resolution] ?? DEFAULT_DEFINITION;
}
