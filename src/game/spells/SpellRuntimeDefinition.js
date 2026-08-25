export const SPELL_EVENT_TYPE = Object.freeze({
    CAST_STARTED: "spell-cast-started",
    PROJECTILE_ENDED: "spell-projectile-ended"
});

export const SPELL_IMPACT_RESOLUTION = Object.freeze({
    SHIELD_BLOCKED: "shield-blocked",
    BOSS_DEFEATED: "boss-defeated",
    BOSS_HIT: "boss-hit",
    ENEMY_DEFEATED: "enemy-defeated",
    ENEMY_HIT: "enemy-hit"
});

export const SPELL_SOURCE_KIND = Object.freeze({
    CAST: "spell-cast",
    PROJECTILE: "spell-projectile",
    AREA: "spell-area"
});

export const SPELL_KEY = Object.freeze({
    projectile: (playerId, tick, sequence) => `${playerId}:spell:${tick}:${sequence}`,
    projectileImpact: (projectileId, targetId) => `${projectileId}:${targetId}`
});

export const SPELL_RUNTIME_SPEC = Object.freeze({
    ZERO: 0,
    UNIT: 1,
    GEOMETRY_EPSILON: 0.000000001,
    MINIMUM_POLYGON_VERTICES: 3,
    PROJECTILE_RADIUS: 5,
    FALLBACK_COLLIDER_TYPE: "circle"
});
