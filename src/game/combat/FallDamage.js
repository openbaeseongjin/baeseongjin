export function fallDamageForImpactSpeed(impactSpeed, maxHealth, config) {
    if (!Number.isFinite(impactSpeed) || impactSpeed < 0) {
        throw new Error("impactSpeed must be non-negative and finite");
    }
    if (!Number.isFinite(maxHealth) || maxHealth <= 0) {
        throw new Error("maxHealth must be positive and finite");
    }
    if (
        !Number.isFinite(config?.safeImpactSpeed) ||
        !Number.isFinite(config?.lethalImpactSpeed) ||
        config.safeImpactSpeed < 0 ||
        config.lethalImpactSpeed <= config.safeImpactSpeed
    ) {
        throw new Error("fall damage config requires an ordered safe and lethal impact speed");
    }
    if (impactSpeed <= config.safeImpactSpeed) return 0;
    const ratio = Math.min(
        1,
        (impactSpeed - config.safeImpactSpeed) / (config.lethalImpactSpeed - config.safeImpactSpeed)
    );
    return Math.min(maxHealth, Math.ceil(maxHealth * ratio));
}
