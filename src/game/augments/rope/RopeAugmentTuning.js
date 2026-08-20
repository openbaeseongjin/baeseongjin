import { AUGMENT_IMPACT_CONFIG } from "../../config.js";

function requirePositiveNumber(value, label) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${label} must be a positive finite number`);
    }
    return value;
}

function scaleByPercent(baseValue, percentIncrease) {
    requirePositiveNumber(baseValue, "baseValue");
    if (!Number.isFinite(percentIncrease)) {
        throw new Error("percentIncrease must be finite");
    }
    return baseValue * (1 + percentIncrease);
}

function scaleByReduction(baseValue, percentReduction) {
    requirePositiveNumber(baseValue, "baseValue");
    if (!Number.isFinite(percentReduction) || percentReduction < 0 || percentReduction >= 1) {
        throw new Error("percentReduction must be finite and between 0 (inclusive) and 1 (exclusive)");
    }
    return baseValue * (1 - percentReduction);
}

export const ROPE_AUGMENT_TUNING_RULES = Object.freeze({
    integerStep: 5,
    decimalStep: 0.5,
    fineDecimalStep: 0.05,
    upgradesUsePercentages: true
});

export const ROPE_AUGMENT_PERCENTAGES = Object.freeze({
    fastLaunchSpeed: 0.5,
    longRopeReach: 0.2,
    fastRecoverReloadReduction: 0.5,
    releasePropulsionVelocity: 0.25,
    collisionExplosionSplashDamage: 0.5
});

export const ROPE_AUGMENT_STATIC_VALUES = Object.freeze({
    baseHookSpeed: 1200,
    baseReach: 400,
    baseReloadSeconds: 0.5,
    contactBandPadding: 10,
    collisionExplosionRadius: 120,
    collisionExplosionKnockbackDistance: 100,
    collisionExplosionKnockbackSeconds: 0.25,
    electrifiedDamagePerSecond: AUGMENT_IMPACT_CONFIG.electrifiedDamagePerSecond,
    electrifiedPulseSeconds: AUGMENT_IMPACT_CONFIG.electrifiedPulseSeconds
});

export function createRopeAugmentTuning({
    hookSpeed = ROPE_AUGMENT_STATIC_VALUES.baseHookSpeed,
    reach = ROPE_AUGMENT_STATIC_VALUES.baseReach,
    hookReloadSeconds = ROPE_AUGMENT_STATIC_VALUES.baseReloadSeconds,
    impactDamage
} = {}) {
    const resolvedHookSpeed = requirePositiveNumber(hookSpeed, "hookSpeed");
    const resolvedReach = requirePositiveNumber(reach, "reach");
    const resolvedHookReloadSeconds = requirePositiveNumber(hookReloadSeconds, "hookReloadSeconds");
    const resolvedImpactDamage = requirePositiveNumber(impactDamage, "impactDamage");
    const hookFlightSeconds = resolvedReach / resolvedHookSpeed;
    const fastLaunchSpeed = scaleByPercent(resolvedHookSpeed, ROPE_AUGMENT_PERCENTAGES.fastLaunchSpeed);
    const longRopeReach = scaleByPercent(resolvedReach, ROPE_AUGMENT_PERCENTAGES.longRopeReach);
    const electrifiedDamagePerSecond = ROPE_AUGMENT_STATIC_VALUES.electrifiedDamagePerSecond;
    const electrifiedPulseSeconds = ROPE_AUGMENT_STATIC_VALUES.electrifiedPulseSeconds;
    return Object.freeze({
        rules: ROPE_AUGMENT_TUNING_RULES,
        baseRope: Object.freeze({
            hookSpeed: resolvedHookSpeed,
            reach: resolvedReach,
            hookFlightSeconds,
            hookReloadSeconds: resolvedHookReloadSeconds
        }),
        commonRope: Object.freeze({
            fastLaunch: Object.freeze({
                hookSpeed: fastLaunchSpeed,
                reach: resolvedReach,
                hookFlightSeconds: resolvedReach / fastLaunchSpeed
            }),
            longRope: Object.freeze({
                hookSpeed: resolvedHookSpeed,
                reach: longRopeReach,
                hookFlightSeconds: longRopeReach / resolvedHookSpeed
            }),
            fastRecover: Object.freeze({
                hookReloadSeconds: scaleByReduction(
                    resolvedHookReloadSeconds,
                    ROPE_AUGMENT_PERCENTAGES.fastRecoverReloadReduction
                )
            }),
            releasePropulsion: Object.freeze({
                velocityMultiplier: 1 + ROPE_AUGMENT_PERCENTAGES.releasePropulsionVelocity
            }),
            electrifiedRope: Object.freeze({
                contactBandPadding: ROPE_AUGMENT_STATIC_VALUES.contactBandPadding,
                damagePerSecond: electrifiedDamagePerSecond,
                pulseSeconds: electrifiedPulseSeconds,
                damagePerPulse: electrifiedDamagePerSecond * electrifiedPulseSeconds
            }),
            collisionExplosion: Object.freeze({
                radius: ROPE_AUGMENT_STATIC_VALUES.collisionExplosionRadius,
                directDamage: resolvedImpactDamage,
                splashDamage: resolvedImpactDamage * ROPE_AUGMENT_PERCENTAGES.collisionExplosionSplashDamage,
                knockbackDistance: ROPE_AUGMENT_STATIC_VALUES.collisionExplosionKnockbackDistance,
                knockbackSeconds: ROPE_AUGMENT_STATIC_VALUES.collisionExplosionKnockbackSeconds
            })
        })
    });
}

export function createModifiedRopeProfile(
    baseProfile,
    { speedPercent = 0, reachPercent = 0, reloadReductionPercent = 0 } = {}
) {
    const hookSpeed = scaleByPercent(
        requirePositiveNumber(baseProfile?.hookSpeed, "baseProfile.hookSpeed"),
        speedPercent
    );
    const reach = scaleByPercent(requirePositiveNumber(baseProfile?.reach, "baseProfile.reach"), reachPercent);
    const hookReloadSeconds = scaleByReduction(
        requirePositiveNumber(baseProfile?.hookReloadSeconds, "baseProfile.hookReloadSeconds"),
        reloadReductionPercent
    );
    return Object.freeze({
        hookSpeed,
        reach,
        hookFlightSeconds: reach / hookSpeed,
        hookReloadSeconds
    });
}

export function applyReleasePropulsion(baseVelocity, velocityMultiplier = 1.25) {
    requirePositiveNumber(velocityMultiplier, "velocityMultiplier");
    if (!Number.isFinite(baseVelocity?.x) || !Number.isFinite(baseVelocity?.y)) {
        throw new Error("baseVelocity must contain finite x and y");
    }
    return Object.freeze({
        x: baseVelocity.x * velocityMultiplier,
        y: baseVelocity.y * velocityMultiplier
    });
}
