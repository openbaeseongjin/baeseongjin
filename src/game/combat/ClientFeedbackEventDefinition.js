import {
    ACTION_EVENT_TYPE,
    ACTION_MODIFIER_ID,
    ACTION_PREDICTED_RESOLUTION,
    ACTION_SIGNATURE_ID,
    BASE_ACTION_ID
} from "../augments/actions/ActionAugmentDefinition.js";
import { ELECTRIFIED_STATUS_ID } from "../status-effects/ElectrifiedStatusEffect.js";
import { PLAYER_IMPACT_TYPE } from "../network/PlayerImpactClaim.js";

export const CLIENT_FEEDBACK_EVENT_TYPE = Object.freeze({
    PLAYER_RESPAWNED: "player-respawned",
    RESOLVE: "resolve",
    PREDICTED_RESOLVE: "predicted-resolve",
    AUGMENT_ACTION_STARTED: ACTION_EVENT_TYPE.STARTED,
    PREDICTED_AUGMENT_ACTION_STARTED: "predicted-augment-action-started",
    SPAWN: "spawn",
    PREDICTED_SPAWN: "predicted-spawn",
    AUGMENT_SHOT_ENDED: ACTION_EVENT_TYPE.SHOT_ENDED,
    PREDICTED_AUGMENT_SHOT_ENDED: "predicted-augment-shot-ended",
    PLAYER_FALL_DAMAGED: "player-fall-damaged",
    PREDICTED_PLAYER_FALL_DAMAGED: "predicted-player-fall-damaged",
    BOSS_PLAYER_HIT: "boss-player-hit",
    ENEMY_BEHAVIOR_PLAYER_HIT: "enemy-behavior-player-hit"
});

export const CLIENT_FEEDBACK_RESOLUTION = Object.freeze({
    ENEMY_HIT: ACTION_PREDICTED_RESOLUTION.ENEMY_HIT,
    ENEMY_DEFEATED: ACTION_PREDICTED_RESOLUTION.ENEMY_DEFEATED,
    BOSS_HIT: "boss-hit",
    BOSS_PHASE_COMPLETED: "boss-phase-completed",
    BOSS_DEFEATED: "boss-defeated",
    PLAYER_HIT: PLAYER_IMPACT_TYPE.PLAYER_HIT,
    ROPE_CUT: PLAYER_IMPACT_TYPE.ROPE_CUT,
    JAMMER_SHOCK: PLAYER_IMPACT_TYPE.JAMMER_SHOCK,
    FALL_DAMAGE: PLAYER_IMPACT_TYPE.FALL_DAMAGE,
    SHIELD_BLOCKED: ACTION_PREDICTED_RESOLUTION.SHIELD_BLOCKED,
    TARGET_ALREADY_DEAD: "target-already-dead"
});

export const CLIENT_FEEDBACK_SOURCE_KIND = Object.freeze({
    ROPE_IMPACT: "rope-impact",
    AUGMENT_IMPACT: "augment-impact"
});

export const CLIENT_FEEDBACK_EFFECT_ID = Object.freeze({
    DAMAGE_REFLECT: ACTION_SIGNATURE_ID.DAMAGE_REFLECT,
    ELECTRIFIED_ROPE: "electrified-rope",
    ELECTRIFIED_STATUS: ELECTRIFIED_STATUS_ID
});

export const CLIENT_FEEDBACK_OBJECT_TYPE = Object.freeze({
    ENEMY_PROJECTILE: "enemy-projectile"
});

export const CLIENT_FEEDBACK_EVENT_CONFIG = Object.freeze({
    EMPTY_VIEWER_ID_LENGTH: 0,
    CAUSAL_LIMIT: 128,
    INITIAL_AGE: 0,
    ACTION_AFTERIMAGE_LIFETIME: 0.42,
    ROPE_CUT_LIFETIME: 0.8,
    DEFAULT_DIRECTION: Object.freeze({ x: 1, y: 0 })
});

export const CLIENT_FEEDBACK_ACTION_ID = Object.freeze({
    DEFAULT_PUNCH: BASE_ACTION_ID.DEFAULT_PUNCH,
    STRAIGHT_SHOT: BASE_ACTION_ID.STRAIGHT_SHOT,
    INSTANT_GUARD: BASE_ACTION_ID.INSTANT_GUARD,
    DIRECTION_DASH: BASE_ACTION_ID.DIRECTION_DASH,
    DASH_STRIKE: BASE_ACTION_ID.DASH_STRIKE
});

export const CLIENT_FEEDBACK_PRESET_ID = Object.freeze({
    PLAYER_PUNCH: "player-punch",
    PLAYER_SHOT: "player-shot",
    PLAYER_GUARD: "player-guard",
    PLAYER_DASH: "player-dash",
    PLAYER_SHOT_IMPACT: "player-shot-impact",
    IMPACT: "impact",
    ARTILLERY_STRIKE: "artillery-strike",
    ENEMY_MUZZLE: "enemy-muzzle",
    ENEMY_IMPACT: "enemy-impact",
    ENEMY_DEFEAT: "enemy-defeat",
    WIND_FLOW: "wind-flow",
    SHIELD_BLOCK: "shield-block",
    DAMAGE_REFLECT: "damage-reflect",
    ROPE_CONTACT: "rope-contact",
    ROPE_CUT: "rope-cut",
    ROPE_LAUNCH: "rope-launch",
    ROPE_FLIGHT: "rope-flight",
    ROPE_ATTACH: "rope-attach",
    ROPE_PULSE: "rope-pulse",
    ROPE_DISSIPATE: "rope-dissipate",
    ROPE_RELEASE: "rope-release",
    ROPE_LINK: ACTION_MODIFIER_ID.ROPE_LINK,
    ROPE_TENSION: "rope-tension",
    ROPE_TENSION_ELECTRIC: "rope-tension-electric",
    PLAYER_MOTION: "player-motion",
    PLAYER_IMPULSE: "player-impulse"
});

const EVENT_GROUP = Object.freeze({
    RESOLVE: Object.freeze([CLIENT_FEEDBACK_EVENT_TYPE.RESOLVE, CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_RESOLVE]),
    ACTION_STARTED: Object.freeze([
        CLIENT_FEEDBACK_EVENT_TYPE.AUGMENT_ACTION_STARTED,
        CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_AUGMENT_ACTION_STARTED
    ]),
    SPAWN: Object.freeze([CLIENT_FEEDBACK_EVENT_TYPE.SPAWN, CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_SPAWN]),
    SHOT_ENDED: Object.freeze([
        CLIENT_FEEDBACK_EVENT_TYPE.AUGMENT_SHOT_ENDED,
        CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_AUGMENT_SHOT_ENDED
    ]),
    FALL_DAMAGE: Object.freeze([
        CLIENT_FEEDBACK_EVENT_TYPE.PLAYER_FALL_DAMAGED,
        CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_PLAYER_FALL_DAMAGED
    ]),
    DIRECT_PLAYER_HIT: Object.freeze([
        CLIENT_FEEDBACK_EVENT_TYPE.BOSS_PLAYER_HIT,
        CLIENT_FEEDBACK_EVENT_TYPE.ENEMY_BEHAVIOR_PLAYER_HIT
    ])
});

const COMBAT_RESOLUTIONS = Object.freeze([
    CLIENT_FEEDBACK_RESOLUTION.ENEMY_HIT,
    CLIENT_FEEDBACK_RESOLUTION.ENEMY_DEFEATED,
    CLIENT_FEEDBACK_RESOLUTION.BOSS_HIT,
    CLIENT_FEEDBACK_RESOLUTION.BOSS_PHASE_COMPLETED,
    CLIENT_FEEDBACK_RESOLUTION.BOSS_DEFEATED,
    CLIENT_FEEDBACK_RESOLUTION.PLAYER_HIT,
    CLIENT_FEEDBACK_RESOLUTION.ROPE_CUT,
    CLIENT_FEEDBACK_RESOLUTION.JAMMER_SHOCK,
    CLIENT_FEEDBACK_RESOLUTION.FALL_DAMAGE
]);

const ACTION_PRESET = Object.freeze({
    [CLIENT_FEEDBACK_ACTION_ID.DEFAULT_PUNCH]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_PUNCH,
    [CLIENT_FEEDBACK_ACTION_ID.STRAIGHT_SHOT]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT,
    [CLIENT_FEEDBACK_ACTION_ID.INSTANT_GUARD]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_GUARD,
    [CLIENT_FEEDBACK_ACTION_ID.DIRECTION_DASH]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_DASH,
    [CLIENT_FEEDBACK_ACTION_ID.DASH_STRIKE]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_DASH
});

const IMPACT_STATE = Object.freeze({
    [CLIENT_FEEDBACK_RESOLUTION.PLAYER_HIT]: Object.freeze({ lifetime: 0.24, strength: 9 }),
    [CLIENT_FEEDBACK_RESOLUTION.JAMMER_SHOCK]: Object.freeze({ lifetime: 0.24, strength: 9 }),
    [CLIENT_FEEDBACK_RESOLUTION.FALL_DAMAGE]: Object.freeze({ lifetime: 0.24, strength: 9 }),
    [CLIENT_FEEDBACK_RESOLUTION.ENEMY_DEFEATED]: Object.freeze({ lifetime: 0.2, strength: 6 }),
    [CLIENT_FEEDBACK_RESOLUTION.BOSS_DEFEATED]: Object.freeze({ lifetime: 0.2, strength: 6 }),
    [CLIENT_FEEDBACK_RESOLUTION.BOSS_PHASE_COMPLETED]: Object.freeze({ lifetime: 0.16, strength: 4 }),
    DEFAULT: Object.freeze({ lifetime: 0.12, strength: 2.5 })
});

const AUGMENT_EFFECT_LIFETIME = Object.freeze({
    [CLIENT_FEEDBACK_EFFECT_ID.DAMAGE_REFLECT]: 0.28,
    DEFAULT: 0.45
});

export class ClientFeedbackEventDefinition {
    constructor({ predicate, present }) {
        if (typeof predicate !== "function" || typeof present !== "function") {
            throw new Error("ClientFeedbackEventDefinition requires predicate and present functions");
        }
        this.predicate = predicate;
        this.present = present;
        Object.freeze(this);
    }
}

export const CLIENT_FEEDBACK_KEY = Object.freeze({
    actionPresentation: (ownerId, activationId) => `${ownerId}:${activationId}`,
    particle: (ownerId, causalId) => `${ownerId ?? "world"}:${causalId}`,
    continuous: (emitterId, sequence) => `${emitterId}:${sequence}`
});

export function actionParticlePreset(actionId) {
    return ACTION_PRESET[actionId] ?? CLIENT_FEEDBACK_PRESET_ID.IMPACT;
}

export function impactState(resolution) {
    const definition = IMPACT_STATE[resolution] ?? IMPACT_STATE.DEFAULT;
    return { age: 0, lifetime: definition.lifetime, strength: definition.strength };
}

export function mergeImpactState(current, incoming) {
    if (!current) return incoming;
    const lifetime = Math.max(current.lifetime, incoming.lifetime);
    const remaining = Math.max(current.lifetime - current.age, incoming.lifetime - incoming.age);
    return {
        age: Math.max(0, lifetime - remaining),
        lifetime,
        strength: Math.max(current.strength, incoming.strength)
    };
}

export function augmentEffectLifetime(effectId) {
    return AUGMENT_EFFECT_LIFETIME[effectId] ?? AUGMENT_EFFECT_LIFETIME.DEFAULT;
}

export function eventEffectId(event) {
    return event.effectId ?? event.parameters?.effectId;
}

export function eventSourceKind(event) {
    return event.parameters?.sourceKind;
}

export function createClientFeedbackEvent(event, resolution, index = 0) {
    const parameters = event.parameters ?? {};
    const targetId = event.targetId ?? event.playerId ?? parameters.targetId ?? null;
    const sourcePlayerId = event.sourcePlayerId ?? parameters.sourcePlayerId ?? null;
    const personalViewerId = [
        CLIENT_FEEDBACK_RESOLUTION.PLAYER_HIT,
        CLIENT_FEEDBACK_RESOLUTION.ROPE_CUT,
        CLIENT_FEEDBACK_RESOLUTION.JAMMER_SHOCK,
        CLIENT_FEEDBACK_RESOLUTION.FALL_DAMAGE
    ].includes(resolution)
        ? targetId
        : sourcePlayerId;
    return Object.freeze({
        id: event.eventId ?? event.predictionId ?? event.projectileId ?? `client-feedback-${index}`,
        type: resolution,
        position: Object.freeze({ x: event.position.x, y: event.position.y }),
        damage: event.damage ?? parameters.damage ?? 0,
        sourcePlayerId,
        targetId,
        personalViewerId
    });
}

export function personalFeedbackVisible(event, viewerId) {
    return event.personalViewerId === viewerId;
}

export const CLIENT_FEEDBACK_EVENT = Object.freeze({
    RESPAWN_DETACH_SUPPRESSION: new ClientFeedbackEventDefinition({
        predicate: (event) => event.eventType === CLIENT_FEEDBACK_EVENT_TYPE.PLAYER_RESPAWNED,
        present: (event, context) => context.suppressDetach(event.playerId)
    }),
    ROPE_CUT_DETACH_SUPPRESSION: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            EVENT_GROUP.RESOLVE.includes(event.eventType) &&
            [CLIENT_FEEDBACK_RESOLUTION.ROPE_CUT, CLIENT_FEEDBACK_RESOLUTION.JAMMER_SHOCK].includes(event.resolution),
        present: (event, context) =>
            context.suppressDetach(event.targetId ?? event.playerId ?? event.parameters?.targetId)
    }),
    ROPE_IMPACT_DETACH_SUPPRESSION: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            EVENT_GROUP.RESOLVE.includes(event.eventType) &&
            eventSourceKind(event) === CLIENT_FEEDBACK_SOURCE_KIND.ROPE_IMPACT,
        present: (event, context) =>
            context.suppressDetach(event.targetId ?? event.playerId ?? event.parameters?.targetId)
    }),
    ACTION_AFTERIMAGE: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.ACTION_STARTED.includes(event.eventType),
        present: (event, context) => context.appendActionAfterimage(event)
    }),
    AUGMENT_EFFECT: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            eventSourceKind(event) === CLIENT_FEEDBACK_SOURCE_KIND.AUGMENT_IMPACT &&
            Boolean(eventEffectId(event)) &&
            event.resolution !== CLIENT_FEEDBACK_RESOLUTION.TARGET_ALREADY_DEAD,
        present: (event, context) => context.appendAugmentEffect(event)
    }),
    ACTION_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.ACTION_STARTED.includes(event.eventType),
        present: (event, context) =>
            context.appendParticle(event, {
                presetId: actionParticlePreset(event.actionId ?? event.parameters?.actionId)
            })
    }),
    SPAWN_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.SPAWN.includes(event.eventType),
        present: (event, context) => {
            const stationary = Math.hypot(event.velocity?.x ?? 0, event.velocity?.y ?? 0) < 1;
            context.appendParticle(event, {
                presetId:
                    event.objectType === CLIENT_FEEDBACK_OBJECT_TYPE.ENEMY_PROJECTILE
                        ? stationary
                            ? CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE
                            : CLIENT_FEEDBACK_PRESET_ID.ENEMY_MUZZLE
                        : CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT
            });
        }
    }),
    SHOT_ENDED_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.SHOT_ENDED.includes(event.eventType),
        present: (event, context) =>
            context.appendParticle(event, { presetId: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT_IMPACT })
    }),
    SHIELD_BLOCK_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            EVENT_GROUP.RESOLVE.includes(event.eventType) &&
            event.resolution === CLIENT_FEEDBACK_RESOLUTION.SHIELD_BLOCKED,
        present: (event, context) => context.appendParticle(event, { presetId: CLIENT_FEEDBACK_PRESET_ID.SHIELD_BLOCK })
    }),
    DAMAGE_REFLECT_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            EVENT_GROUP.RESOLVE.includes(event.eventType) &&
            eventEffectId(event) === CLIENT_FEEDBACK_EFFECT_ID.DAMAGE_REFLECT,
        present: (event, context) =>
            context.appendParticle(event, {
                presetId: CLIENT_FEEDBACK_PRESET_ID.DAMAGE_REFLECT,
                position: event.sourcePosition ?? event.parameters?.sourcePosition,
                targetPosition: event.position ?? event.parameters?.position
            })
    }),
    ELECTRIFIED_ROPE_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => eventEffectId(event) === CLIENT_FEEDBACK_EFFECT_ID.ELECTRIFIED_ROPE,
        present: (event, context) => context.appendParticle(event, { presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_CONTACT })
    }),
    ELECTRIFIED_STATUS_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => eventEffectId(event) === CLIENT_FEEDBACK_EFFECT_ID.ELECTRIFIED_STATUS,
        present: (event, context) => context.appendParticle(event, { presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_CONTACT })
    }),
    ARTILLERY_HIT_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            event.eventType === CLIENT_FEEDBACK_EVENT_TYPE.ENEMY_BEHAVIOR_PLAYER_HIT &&
            event.sourceKind === CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE,
        present: (event, context) =>
            context.appendParticle(event, {
                presetId: CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE,
                position: event.impactPosition ?? event.position,
                bounds: event.bounds ?? null
            })
    }),
    FALL_DAMAGE_COMBAT: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.FALL_DAMAGE.includes(event.eventType),
        present: (event, context) => context.appendCombatEvent(event, CLIENT_FEEDBACK_RESOLUTION.FALL_DAMAGE)
    }),
    RESOLVE_COMBAT: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            EVENT_GROUP.RESOLVE.includes(event.eventType) && COMBAT_RESOLUTIONS.includes(event.resolution),
        present: (event, context) => context.appendCombatEvent(event, event.resolution)
    }),
    DIRECT_PLAYER_HIT_COMBAT: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.DIRECT_PLAYER_HIT.includes(event.eventType),
        present: (event, context) => context.appendCombatEvent(event, CLIENT_FEEDBACK_RESOLUTION.PLAYER_HIT)
    }),
    PERSONAL_IMPACT: new ClientFeedbackEventDefinition({
        predicate: () => true,
        present: (event, context) => context.setImpact(impactState(event.type))
    }),
    PERSONAL_ROPE_CUT: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            [CLIENT_FEEDBACK_RESOLUTION.ROPE_CUT, CLIENT_FEEDBACK_RESOLUTION.JAMMER_SHOCK].includes(event.type),
        present: (event, context) => context.setRopeCut(event)
    })
});
