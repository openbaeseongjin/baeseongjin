import { ELECTRIFIED_STATUS_ID } from "../status-effects/ElectrifiedStatusEffect.js";
import { SPELL_ID, SPELL_SPEC } from "../spells/SpellDefinition.js";
import { SPELL_EVENT_TYPE, SPELL_IMPACT_RESOLUTION } from "../spells/SpellRuntimeDefinition.js";
import { PLAYER_IMPACT_TYPE } from "../network/PlayerImpactClaim.js";
import { ENEMY_LIFECYCLE_EVENT_TYPE } from "./EnemyImpactTombstones.js";
import { PLATFORM_COLLISION_DAMAGE_EVENT_TYPE } from "./PlatformCollisionDamage.js";
import { LOWER_SECTOR_COMMANDER_HAZARD } from "../boss/LowerSectorCommanderDefinition.js";
import { AUGMENT_IMPACT_EVENT_SOURCE_KIND } from "../augments/AugmentImpactEventDefinition.js";
import { ROPE_AUGMENT_STATIC_VALUES } from "../augments/rope/RopeAugmentTuning.js";
import { PLAYER_DAMAGE_REPLICATION_EVENT_TYPE } from "./PlayerDamageEvent.js";
import { ENEMY_BEHAVIOR_REPLICATION_EVENT_TYPE } from "./enemy-behavior/EnemyBehaviorDefinition.js";

export const CLIENT_FEEDBACK_EVENT_TYPE = Object.freeze({
    PLAYER_RESPAWNED: "player-respawned",
    ENEMY_DEFEATED: ENEMY_LIFECYCLE_EVENT_TYPE.DEFEATED,
    RESOLVE: "resolve",
    PREDICTED_RESOLVE: "predicted-resolve",
    SPELL_CAST_STARTED: SPELL_EVENT_TYPE.CAST_STARTED,
    PREDICTED_SPELL_CAST_STARTED: "predicted-spell-cast-started",
    SPAWN: "spawn",
    PREDICTED_SPAWN: "predicted-spawn",
    SPELL_PROJECTILE_ENDED: SPELL_EVENT_TYPE.PROJECTILE_ENDED,
    PREDICTED_SPELL_PROJECTILE_ENDED: "predicted-spell-projectile-ended",
    PLAYER_PLATFORM_COLLISION_DAMAGED: PLATFORM_COLLISION_DAMAGE_EVENT_TYPE.APPLIED,
    PREDICTED_PLAYER_PLATFORM_COLLISION_DAMAGED: PLATFORM_COLLISION_DAMAGE_EVENT_TYPE.PREDICTED,
    BOSS_PLAYER_HIT: PLAYER_DAMAGE_REPLICATION_EVENT_TYPE.BOSS_HIT,
    BOSS_ATTACK_STARTED: "boss-attack-started",
    ENEMY_BEHAVIOR_PLAYER_HIT: ENEMY_BEHAVIOR_REPLICATION_EVENT_TYPE.PLAYER_HIT
});

export const CLIENT_FEEDBACK_RESOLUTION = Object.freeze({
    ENEMY_HIT: SPELL_IMPACT_RESOLUTION.ENEMY_HIT,
    ENEMY_DEFEATED: SPELL_IMPACT_RESOLUTION.ENEMY_DEFEATED,
    BOSS_HIT: "boss-hit",
    BOSS_PHASE_COMPLETED: "boss-phase-completed",
    BOSS_DEFEATED: "boss-defeated",
    PLAYER_HIT: PLAYER_IMPACT_TYPE.PLAYER_HIT,
    ROPE_CUT: PLAYER_IMPACT_TYPE.ROPE_CUT,
    JAMMER_SHOCK: PLAYER_IMPACT_TYPE.JAMMER_SHOCK,
    PLATFORM_COLLISION_DAMAGE: PLAYER_IMPACT_TYPE.PLATFORM_COLLISION_DAMAGE,
    SHIELD_BLOCKED: SPELL_IMPACT_RESOLUTION.SHIELD_BLOCKED,
    TARGET_ALREADY_DEAD: "target-already-dead"
});

export const CLIENT_FEEDBACK_SOURCE_KIND = Object.freeze({
    ROPE_IMPACT: "rope-impact",
    AUGMENT_IMPACT: AUGMENT_IMPACT_EVENT_SOURCE_KIND
});

export const CLIENT_FEEDBACK_EFFECT_ID = Object.freeze({
    COLLISION_EXPLOSION_DIRECT: "collision-explosion-direct",
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
    ROPE_CUT_LIFETIME: 0.8,
    DEFAULT_DIRECTION: Object.freeze({ x: 1, y: 0 })
});

export const CLIENT_FEEDBACK_PRESET_ID = Object.freeze({
    PLAYER_SHOT: "player-shot",
    PLAYER_GUARD: "player-guard",
    PLAYER_DASH: "player-dash",
    PLAYER_SHOT_IMPACT: "player-shot-impact",
    IMPACT: "impact",
    ARTILLERY_STRIKE: "artillery-strike",
    ENEMY_MUZZLE: "enemy-muzzle",
    ENEMY_IMPACT: "enemy-impact",
    ENEMY_DEFEAT: "enemy-defeat",
    ENEMY_DEATH_EXPLOSION: "enemy-death-explosion",
    BOSS_WARDEN_MELEE_ACTIVE: "boss-warden-melee-active",
    BOSS_WARDEN_BEAM_ACTIVE: "boss-warden-beam-active",
    BOSS_WARDEN_MELEE_IMPACT: "boss-warden-melee-impact",
    BOSS_WARDEN_BEAM_IMPACT: "boss-warden-beam-impact",
    BOSS_COMMANDER_HAMMER_GROUND_IMPACT: "boss-commander-hammer-ground-impact",
    WIND_FLOW: "wind-flow",
    SHIELD_BLOCK: "shield-block",
    ROPE_CONTACT: "rope-contact",
    ROPE_CUT: "rope-cut",
    ROPE_LAUNCH: "rope-launch",
    ROPE_FLIGHT: "rope-flight",
    ROPE_ATTACH: "rope-attach",
    ROPE_PULSE: "rope-pulse",
    ROPE_DISSIPATE: "rope-dissipate",
    ROPE_RELEASE: "rope-release",
    ROPE_TENSION: "rope-tension",
    ROPE_TENSION_ELECTRIC: "rope-tension-electric",
    PLAYER_MOTION: "player-motion",
    PLAYER_IMPULSE: "player-impulse"
});

const EVENT_GROUP = Object.freeze({
    RESOLVE: Object.freeze([CLIENT_FEEDBACK_EVENT_TYPE.RESOLVE, CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_RESOLVE]),
    SPELL_STARTED: Object.freeze([
        CLIENT_FEEDBACK_EVENT_TYPE.SPELL_CAST_STARTED,
        CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_SPELL_CAST_STARTED
    ]),
    SPAWN: Object.freeze([CLIENT_FEEDBACK_EVENT_TYPE.SPAWN, CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_SPAWN]),
    SHOT_ENDED: Object.freeze([
        CLIENT_FEEDBACK_EVENT_TYPE.SPELL_PROJECTILE_ENDED,
        CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_SPELL_PROJECTILE_ENDED
    ]),
    PLATFORM_COLLISION_DAMAGE: Object.freeze([
        CLIENT_FEEDBACK_EVENT_TYPE.PLAYER_PLATFORM_COLLISION_DAMAGED,
        CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_PLAYER_PLATFORM_COLLISION_DAMAGED
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
    CLIENT_FEEDBACK_RESOLUTION.PLATFORM_COLLISION_DAMAGE
]);

const SPELL_PRESET = Object.freeze({
    [SPELL_ID.ENERGY_ORB]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT,
    [SPELL_ID.LONG_RANGE_ORB]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT,
    [SPELL_ID.OVERCHARGED_ORB]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT,
    [SPELL_ID.IGNITION_ORB]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT,
    [SPELL_ID.ARCANE_SLASH]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT_IMPACT,
    [SPELL_ID.MOBILITY_SURGE]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_GUARD,
    [SPELL_ID.LOW_GRAVITY]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_GUARD,
    [SPELL_ID.COOLDOWN_RESET]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_GUARD,
    [SPELL_ID.FREEZE_BOLT]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT,
    [SPELL_ID.GATHERING_ORB]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT,
    [SPELL_ID.METEOR]: CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE,
    [SPELL_ID.FROST_BURST]: CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE,
    [SPELL_ID.SHATTER_BOMB]: CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE,
    [SPELL_ID.THERMAL_LASER]: CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE,
    [SPELL_ID.ELECTRIC_ORB]: CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE,
    [SPELL_ID.PHYSICS_DASH]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_DASH,
    [SPELL_ID.CHAIN_DASH]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_DASH,
    [SPELL_ID.THRUSTER_FLIGHT]: CLIENT_FEEDBACK_PRESET_ID.PLAYER_DASH
});

const IMPACT_STATE = Object.freeze({
    [CLIENT_FEEDBACK_RESOLUTION.PLAYER_HIT]: Object.freeze({ lifetime: 0.24, strength: 9 }),
    [CLIENT_FEEDBACK_RESOLUTION.JAMMER_SHOCK]: Object.freeze({ lifetime: 0.24, strength: 9 }),
    [CLIENT_FEEDBACK_RESOLUTION.PLATFORM_COLLISION_DAMAGE]: Object.freeze({ lifetime: 0.24, strength: 9 }),
    [CLIENT_FEEDBACK_RESOLUTION.ENEMY_DEFEATED]: Object.freeze({ lifetime: 0.2, strength: 6 }),
    [CLIENT_FEEDBACK_RESOLUTION.BOSS_DEFEATED]: Object.freeze({ lifetime: 0.2, strength: 6 }),
    [CLIENT_FEEDBACK_RESOLUTION.BOSS_PHASE_COMPLETED]: Object.freeze({ lifetime: 0.16, strength: 4 }),
    DEFAULT: Object.freeze({ lifetime: 0.12, strength: 2.5 })
});
const COMMANDER_HAMMER_GROUND_HAZARD = Object.freeze({
    [LOWER_SECTOR_COMMANDER_HAZARD.HAMMER]: true,
    [LOWER_SECTOR_COMMANDER_HAZARD.GRAB_HAMMER]: true
});

const BOSS_WARDEN_HAZARD_FAMILY = Object.freeze({
    MELEE: "melee",
    BEAM: "beam"
});

const BOSS_WARDEN_HAZARD_FAMILY_BY_KIND = Object.freeze({
    "baton-1": BOSS_WARDEN_HAZARD_FAMILY.MELEE,
    "baton-2": BOSS_WARDEN_HAZARD_FAMILY.MELEE,
    "overhead-slam": BOSS_WARDEN_HAZARD_FAMILY.MELEE,
    "back-swing": BOSS_WARDEN_HAZARD_FAMILY.MELEE,
    "counter-bash": BOSS_WARDEN_HAZARD_FAMILY.MELEE,
    "security-beam-low": BOSS_WARDEN_HAZARD_FAMILY.BEAM,
    "security-beam-high": BOSS_WARDEN_HAZARD_FAMILY.BEAM
});

const BOSS_WARDEN_IMPACT_PRESET_BY_FAMILY = Object.freeze({
    [BOSS_WARDEN_HAZARD_FAMILY.MELEE]: CLIENT_FEEDBACK_PRESET_ID.BOSS_WARDEN_MELEE_IMPACT,
    [BOSS_WARDEN_HAZARD_FAMILY.BEAM]: CLIENT_FEEDBACK_PRESET_ID.BOSS_WARDEN_BEAM_IMPACT
});

const BOSS_WARDEN_IMPACT_DIRECTION_BY_FAMILY = Object.freeze({
    [BOSS_WARDEN_HAZARD_FAMILY.MELEE]: Object.freeze({ x: 0, y: -1 }),
    [BOSS_WARDEN_HAZARD_FAMILY.BEAM]: Object.freeze({ x: 1, y: 0 })
});

const AUGMENT_EFFECT_LIFETIME = Object.freeze({ DEFAULT: 0.45 });
const BOSS_COMMANDER_GROUND_IMPACT_DIRECTION = Object.freeze({ x: 0, y: -1 });

const AREA_ATTACK_RING_TRIGGER = Object.freeze({
    CAST: "cast",
    IMPACT: "impact",
    PROJECTILE_ENDED: "projectile-ended"
});

const AREA_ATTACK_RING_TRIGGER_BY_EVENT_TYPE = Object.freeze({
    [CLIENT_FEEDBACK_EVENT_TYPE.SPELL_CAST_STARTED]: AREA_ATTACK_RING_TRIGGER.CAST,
    [CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_SPELL_CAST_STARTED]: AREA_ATTACK_RING_TRIGGER.CAST,
    [CLIENT_FEEDBACK_EVENT_TYPE.RESOLVE]: AREA_ATTACK_RING_TRIGGER.IMPACT,
    [CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_RESOLVE]: AREA_ATTACK_RING_TRIGGER.IMPACT,
    [CLIENT_FEEDBACK_EVENT_TYPE.SPELL_PROJECTILE_ENDED]: AREA_ATTACK_RING_TRIGGER.PROJECTILE_ENDED,
    [CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_SPELL_PROJECTILE_ENDED]: AREA_ATTACK_RING_TRIGGER.PROJECTILE_ENDED
});

class AreaAttackRingDefinition {
    constructor({ trigger, radius, color }) {
        if (!Object.values(AREA_ATTACK_RING_TRIGGER).includes(trigger)) {
            throw new Error("AreaAttackRingDefinition requires a supported trigger");
        }
        if (!Number.isFinite(radius) || radius <= 0) {
            throw new Error("AreaAttackRingDefinition requires a positive radius");
        }
        if (typeof color !== "string" || color.length === 0) {
            throw new Error("AreaAttackRingDefinition requires a color");
        }
        this.trigger = trigger;
        this.radius = radius;
        this.color = color;
        Object.freeze(this);
    }

    request(event) {
        if (AREA_ATTACK_RING_TRIGGER_BY_EVENT_TYPE[event.eventType] !== this.trigger || !event.position) return null;
        const causalId =
            event.projectileId ??
            event.activationId ??
            event.parameters?.eventId ??
            event.predictionId ??
            event.eventId;
        if (typeof causalId !== "string" || causalId.length === 0) return null;
        return Object.freeze({
            causalId,
            effectId: event.spellId ?? eventEffectId(event),
            position: event.position,
            radius: this.radius,
            color: this.color
        });
    }
}

const AREA_ATTACK_RING_BY_SPELL = Object.freeze({
    [SPELL_ID.GATHERING_ORB]: new AreaAttackRingDefinition({
        trigger: AREA_ATTACK_RING_TRIGGER.PROJECTILE_ENDED,
        radius: SPELL_SPEC.GATHERING_ORB.projectile.explosionRadius,
        color: "#c084fc"
    }),
    [SPELL_ID.METEOR]: new AreaAttackRingDefinition({
        trigger: AREA_ATTACK_RING_TRIGGER.PROJECTILE_ENDED,
        radius: SPELL_SPEC.METEOR.projectile.explosionRadius,
        color: "#fb923c"
    }),
    [SPELL_ID.FROST_BURST]: new AreaAttackRingDefinition({
        trigger: AREA_ATTACK_RING_TRIGGER.CAST,
        radius: SPELL_SPEC.FROST_BURST.area.radius,
        color: "#6f9fff"
    }),
    [SPELL_ID.SHATTER_BOMB]: new AreaAttackRingDefinition({
        trigger: AREA_ATTACK_RING_TRIGGER.PROJECTILE_ENDED,
        radius: SPELL_SPEC.SHATTER_BOMB.projectile.explosionRadius,
        color: "#fbbf24"
    })
});

const AREA_ATTACK_RING_BY_EFFECT = Object.freeze({
    [CLIENT_FEEDBACK_EFFECT_ID.COLLISION_EXPLOSION_DIRECT]: new AreaAttackRingDefinition({
        trigger: AREA_ATTACK_RING_TRIGGER.IMPACT,
        radius: ROPE_AUGMENT_STATIC_VALUES.collisionExplosionRadius,
        color: "#fbbf24"
    })
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
    particle: (ownerId, causalId) => `${ownerId ?? "world"}:${causalId}`,
    enemyDefeat: (event) =>
        event.causalId ??
        event.predictionId ??
        event.parameters?.predictionId ??
        event.eventId ??
        event.targetId ??
        event.enemyId ??
        event.parameters?.targetId,
    continuous: (emitterId, sequence) => `${emitterId}:${sequence}`
});

export function spellParticlePreset(spellId) {
    return SPELL_PRESET[spellId] ?? CLIENT_FEEDBACK_PRESET_ID.IMPACT;
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

export function areaAttackRingRequest(event) {
    const definition = AREA_ATTACK_RING_BY_SPELL[event.spellId] ?? AREA_ATTACK_RING_BY_EFFECT[eventEffectId(event)];
    return definition?.request(event) ?? null;
}

export function eventEffectId(event) {
    return event.effectId ?? event.parameters?.effectId;
}

export function eventSourceKind(event) {
    return event.sourceKind ?? event.parameters?.sourceKind;
}

export function bossWardenImpactPreset(event) {
    const hazardKind = event.hazardKind ?? event.parameters?.sourceType;
    const family = BOSS_WARDEN_HAZARD_FAMILY_BY_KIND[hazardKind];
    return BOSS_WARDEN_IMPACT_PRESET_BY_FAMILY[family] ?? null;
}

export function bossWardenImpactDirection(event) {
    const hazardKind = event.hazardKind ?? event.parameters?.sourceType;
    const family = BOSS_WARDEN_HAZARD_FAMILY_BY_KIND[hazardKind];
    return BOSS_WARDEN_IMPACT_DIRECTION_BY_FAMILY[family] ?? CLIENT_FEEDBACK_EVENT_CONFIG.DEFAULT_DIRECTION;
}

export function createClientFeedbackEvent(event, resolution, index = 0) {
    const parameters = event.parameters ?? {};
    const targetId = event.targetId ?? event.playerId ?? parameters.targetId ?? null;
    const sourcePlayerId = event.sourcePlayerId ?? parameters.sourcePlayerId ?? null;
    const personalViewerId = [
        CLIENT_FEEDBACK_RESOLUTION.PLAYER_HIT,
        CLIENT_FEEDBACK_RESOLUTION.ROPE_CUT,
        CLIENT_FEEDBACK_RESOLUTION.JAMMER_SHOCK,
        CLIENT_FEEDBACK_RESOLUTION.PLATFORM_COLLISION_DAMAGE
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
    AUGMENT_EFFECT: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            eventSourceKind(event) === CLIENT_FEEDBACK_SOURCE_KIND.AUGMENT_IMPACT &&
            Boolean(eventEffectId(event)) &&
            event.resolution !== CLIENT_FEEDBACK_RESOLUTION.TARGET_ALREADY_DEAD,
        present: (event, context) => context.appendAugmentEffect(event)
    }),
    AREA_ATTACK_RING: new ClientFeedbackEventDefinition({
        predicate: (event) => areaAttackRingRequest(event) !== null,
        present: (event, context) => context.appendAreaAttackRing(event)
    }),
    SPELL_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.SPELL_STARTED.includes(event.eventType),
        present: (event, context) =>
            context.appendParticle(event, {
                presetId: spellParticlePreset(event.spellId ?? event.parameters?.spellId)
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
    ENEMY_DEFEAT_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            event.eventType === CLIENT_FEEDBACK_EVENT_TYPE.ENEMY_DEFEATED ||
            (event.eventType === CLIENT_FEEDBACK_EVENT_TYPE.PREDICTED_RESOLVE &&
                event.resolution === CLIENT_FEEDBACK_RESOLUTION.ENEMY_DEFEATED),
        present: (event, context) =>
            context.appendParticle(
                { ...event, eventId: CLIENT_FEEDBACK_KEY.enemyDefeat(event) },
                { presetId: CLIENT_FEEDBACK_PRESET_ID.ENEMY_DEATH_EXPLOSION }
            )
    }),
    SHOT_ENDED_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.SHOT_ENDED.includes(event.eventType),
        present: (event, context) =>
            context.appendParticle(event, {
                presetId:
                    event.spellId === SPELL_ID.METEOR
                        ? CLIENT_FEEDBACK_PRESET_ID.ARTILLERY_STRIKE
                        : CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT_IMPACT
            })
    }),
    SHIELD_BLOCK_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            EVENT_GROUP.RESOLVE.includes(event.eventType) &&
            event.resolution === CLIENT_FEEDBACK_RESOLUTION.SHIELD_BLOCKED,
        present: (event, context) => context.appendParticle(event, { presetId: CLIENT_FEEDBACK_PRESET_ID.SHIELD_BLOCK })
    }),
    ELECTRIFIED_ROPE_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => eventEffectId(event) === CLIENT_FEEDBACK_EFFECT_ID.ELECTRIFIED_ROPE,
        present: (event, context) => context.appendParticle(event, { presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_CONTACT })
    }),
    ELECTRIFIED_STATUS_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) => eventEffectId(event) === CLIENT_FEEDBACK_EFFECT_ID.ELECTRIFIED_STATUS,
        present: (event, context) => context.appendParticle(event, { presetId: CLIENT_FEEDBACK_PRESET_ID.ROPE_CONTACT })
    }),
    BOSS_WARDEN_HIT_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            event.eventType === CLIENT_FEEDBACK_EVENT_TYPE.BOSS_PLAYER_HIT && Boolean(bossWardenImpactPreset(event)),
        present: (event, context) =>
            context.appendParticle(event, {
                presetId: bossWardenImpactPreset(event),
                position: event.position,
                direction: bossWardenImpactDirection(event)
            })
    }),
    BOSS_COMMANDER_HAMMER_GROUND_PARTICLE: new ClientFeedbackEventDefinition({
        predicate: (event) =>
            event.eventType === CLIENT_FEEDBACK_EVENT_TYPE.BOSS_ATTACK_STARTED &&
            COMMANDER_HAMMER_GROUND_HAZARD[event.kind] === true &&
            Number.isFinite(event.impactPosition?.x) &&
            Number.isFinite(event.impactPosition?.y),
        present: (event, context) =>
            context.appendParticle(event, {
                presetId: CLIENT_FEEDBACK_PRESET_ID.BOSS_COMMANDER_HAMMER_GROUND_IMPACT,
                position: event.impactPosition,
                direction: BOSS_COMMANDER_GROUND_IMPACT_DIRECTION
            })
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
    PLATFORM_COLLISION_DAMAGE_COMBAT: new ClientFeedbackEventDefinition({
        predicate: (event) => EVENT_GROUP.PLATFORM_COLLISION_DAMAGE.includes(event.eventType),
        present: (event, context) =>
            context.appendCombatEvent(event, CLIENT_FEEDBACK_RESOLUTION.PLATFORM_COLLISION_DAMAGE)
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
