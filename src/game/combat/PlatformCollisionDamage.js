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
        !Number.isFinite(config?.safeImpactSpeed) ||
        !Number.isFinite(config?.maximumDamageImpactSpeed) ||
        !Number.isFinite(config?.damageScale) ||
        config.safeImpactSpeed < 0 ||
        config.maximumDamageImpactSpeed <= config.safeImpactSpeed ||
        config.damageScale <= 0
    ) {
        throw new Error("platform collision damage config requires ordered impact speeds and a positive damage scale");
    }
    if (impactSpeed <= config.safeImpactSpeed) return 0;
    const ratio = Math.min(
        1,
        (impactSpeed - config.safeImpactSpeed) / (config.maximumDamageImpactSpeed - config.safeImpactSpeed)
    );
    return Math.min(maxHealth, Math.ceil(maxHealth * ratio * config.damageScale));
}
