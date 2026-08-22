export const ACTION_AUGMENT_CATEGORY = Object.freeze({
    BASE_ACTION: "base-action",
    SIGNATURE: "signature",
    UNIVERSAL_MODIFIER: "universal-modifier"
});

export const BASE_ACTION_ID = Object.freeze({
    DEFAULT_PUNCH: "default-punch",
    DIRECTION_DASH: "direction-dash",
    DASH_STRIKE: "dash-strike",
    INSTANT_GUARD: "instant-guard",
    PUSH_AWAY: "push-away",
    STRAIGHT_SHOT: "straight-shot",
    SLOW_FALL: "slow-fall"
});

export const ACTION_SIGNATURE_ID = Object.freeze({
    EXPLOSIVE_TRAIL: "explosive-trail",
    COLLISION_REBOUND: "collision-rebound",
    DAMAGE_REFLECT: "damage-reflect",
    WALL_IMPACT: "wall-impact",
    PIERCING_SHOT: "piercing-shot",
    END_WAVE: "end-wave"
});

export const ACTION_MODIFIER_ID = Object.freeze({
    FAST_REUSE: "fast-reuse",
    EXTRA_CHARGE: "extra-charge",
    ROPE_LINK: "rope-link",
    POST_ACTION_SHIELD: "post-action-shield"
});

export const ACTION_EVENT_TYPE = Object.freeze({
    STARTED: "augment-action-started",
    ENDED: "action-ended",
    DAMAGE_REFLECTED: "damage-reflected",
    EXPLOSIVE_TRAIL_DETONATED: "explosive-trail-detonated",
    SLOW_FALL_END_WAVE: "slow-fall-end-wave",
    POST_ACTION_SHIELD_APPLIED: "post-action-shield-applied",
    ROPE_LINK_READY: "augment-rope-link-ready",
    SHOT_ENDED: "augment-shot-ended"
});

export const ACTION_END_REASON = Object.freeze({
    RESOLVED: "resolved",
    RELEASED: "released",
    LANDED: "landed",
    COMPLETED: "completed"
});

export const ACTION_DAMAGE_TYPE = Object.freeze({
    COMBAT_HP: "combat-hp"
});

export const ACTION_SOURCE_KIND = Object.freeze({
    CONTACT: "contact",
    PROJECTILE: "projectile",
    DEFAULT_PUNCH: "default-punch",
    ACTION_AREA: "action-area",
    ACTION_CONTACT: "action-contact",
    ACTION_PROJECTILE: "action-projectile",
    ACTION_TRAIL: "action-trail",
    KNOCKBACK_WALL_CONTACT: "knockback-wall-contact"
});

export const ACTION_TARGET_KIND = Object.freeze({
    WALL: "wall",
    ENEMY: "enemy"
});

export const ACTION_PENDING_EFFECT_TYPE = Object.freeze({
    EXPLOSIVE_TRAIL: ACTION_SIGNATURE_ID.EXPLOSIVE_TRAIL
});

export const ACTION_REJECTION_REASON = Object.freeze({
    ACTION_ACTIVE: "action-active",
    CHARGE_DEPLETED: "charge-depleted",
    NOT_AIRBORNE: "not-airborne",
    REBOUND_INACTIVE: "rebound-inactive",
    WALL_IMPACT_INACTIVE: "wall-impact-inactive",
    PIERCE_INACTIVE: "pierce-inactive",
    TRAIL_INACTIVE: "trail-inactive",
    DUPLICATE_ENEMY: "duplicate-enemy",
    DUPLICATE_TARGET: "duplicate-target"
});

export const ACTION_PREDICTED_RESOLUTION = Object.freeze({
    SHIELD_BLOCKED: "shield-blocked",
    ENEMY_DEFEATED: "enemy-defeated",
    ENEMY_HIT: "enemy-hit"
});

export const ACTION_KEY = Object.freeze({
    activation: (baseActionId, sequence) => `action:${baseActionId}:${sequence}`,
    projectile: (playerId, tick, sequence) => `${playerId}:${BASE_ACTION_ID.STRAIGHT_SHOT}:${tick}:${sequence}`,
    projectileImpact: (projectileId, targetId) => `${projectileId}:${targetId}`,
    impact: (playerId, effectId, tick, targetId) => `${playerId}:${effectId}:${tick}:${targetId}`,
    loadout: (loadout) =>
        loadout ? `${loadout.baseActionId}|${loadout.signatureId ?? ""}|${loadout.modifierIds.join(",")}` : ""
});

export const ACTION_STATE_CONFIG = Object.freeze({
    ZERO: 0,
    UNIT: 1,
    DEFAULT_MAX_HEALTH: 100,
    DIRECTION_EPSILON: 0.000001,
    BASE_CHARGES: 1,
    EXTRA_CHARGES: 1,
    ROPE_LINK_WINDOW_SECONDS: 1,
    FAST_REUSE_COOLDOWN_MULTIPLIER: 0.6,
    ROPE_LINK_COOLDOWN_MULTIPLIER: 0.5,
    POST_ACTION_SHIELD_RATIO: 0.15,
    POST_ACTION_SHIELD_SECONDS: 2
});

export const ACTION_RUNTIME_CONFIG = Object.freeze({
    GEOMETRY_EPSILON: 0.000000001,
    MINIMUM_POLYGON_VERTICES: 3,
    PROJECTILE_RADIUS: 5,
    HALF: 0.5,
    VECTOR_REFLECTION_SCALE: 2,
    CONTACT_KNOCKBACK_SECONDS: 0.25,
    FALLBACK_COLLIDER_TYPE: "circle"
});
