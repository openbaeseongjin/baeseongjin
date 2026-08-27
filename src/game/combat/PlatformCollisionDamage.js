export const PLATFORM_COLLISION_DAMAGE_RESOLUTION = "platform-collision-damage";

export const PLATFORM_COLLISION_DAMAGE_EVENT_TYPE = Object.freeze({
    APPLIED: "player-platform-collision-damaged",
    PREDICTED: "predicted-player-platform-collision-damaged"
});

export const PLATFORM_COLLISION_DAMAGE_ID = Object.freeze({
    forPlayerTick: (playerId, tick) => `${playerId}:${PLATFORM_COLLISION_DAMAGE_RESOLUTION}:${tick}`,
    predictionKey: (impactId) => `${PLATFORM_COLLISION_DAMAGE_RESOLUTION}:${impactId}`
});

export function platformCollisionDamageForImpactSpeed(impactSpeed, maxHealth, config) {
    if (!Number.isFinite(impactSpeed) || impactSpeed < 0) {
        throw new Error("impactSpeed must be non-negative and finite");
    }
    if (!Number.isFinite(maxHealth) || maxHealth <= 0) {
        throw new Error("maxHealth must be positive and finite");
    }
    if (
        !Number.isFinite(config?.damageStartImpactSpeed) ||
        !Number.isFinite(config?.damageStartRatio) ||
        !Number.isFinite(config?.lethalImpactSpeed) ||
        config.damageStartImpactSpeed < 0 ||
        config.damageStartRatio <= 0 ||
        config.damageStartRatio >= 1 ||
        config.lethalImpactSpeed <= config.damageStartImpactSpeed
    ) {
        throw new Error("platform collision damage config requires ordered damage speeds and a start ratio below one");
    }
    if (impactSpeed < config.damageStartImpactSpeed) return 0;
    const progress = Math.min(
        1,
        (impactSpeed - config.damageStartImpactSpeed) / (config.lethalImpactSpeed - config.damageStartImpactSpeed)
    );
    const startDamage = maxHealth * config.damageStartRatio;
    return Math.ceil(startDamage + (maxHealth - startDamage) * progress);
}
