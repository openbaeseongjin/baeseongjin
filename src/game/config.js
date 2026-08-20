export const PLAYER_CONFIG = Object.freeze({
    radius: 15,
    gravity: 1250,
    groundAcceleration: 1350,
    airAcceleration: 520,
    groundDrag: 10,
    maxHorizontalSpeed: 360,
    jumpSpeed: 440,
    angularInertia: 112.5,
    maxAngularSpeed: 12,
    airAngularDamping: 0.35,
    groundUprightStrength: 42,
    groundUprightDamping: 11
});

export const ROPE_CONFIG = Object.freeze({
    hookSpeed: 1200,
    hookFlightRatio: Object.freeze({ numerator: 1, denominator: 3 }),
    hookReloadSeconds: 0.5,
    attachBufferSeconds: 0.1,
    swingDragThresholdViewportRatio: 0.11,
    swingDragMinHoldSeconds: 0.08,
    swingImpulse: 780,
    handOffset: Object.freeze({ x: 12, y: -7 }),
    releaseAngularTransfer: 0.55
});

export const ROPE_TUNING_FIELDS = Object.freeze(
    [
        { path: "hookSpeed", min: 400, max: 2400, step: 50 },
        { path: "hookFlightRatio.numerator", min: 1, max: 7, step: 1 },
        { path: "hookFlightRatio.denominator", min: 2, max: 10, step: 1 },
        { path: "hookReloadSeconds", min: 0, max: 1, step: 0.05 },
        { path: "attachBufferSeconds", min: 0, max: 0.5, step: 0.02 },
        { path: "swingDragThresholdViewportRatio", min: 0.02, max: 0.3, step: 0.01 },
        { path: "swingDragMinHoldSeconds", min: 0, max: 0.5, step: 0.01 },
        { path: "swingImpulse", min: 0, max: 2000, step: 20 },
        { path: "handOffset.x", min: 0, max: 32, step: 1 },
        { path: "handOffset.y", min: -32, max: 32, step: 1 },
        { path: "releaseAngularTransfer", min: 0, max: 1, step: 0.05 },
        { path: "ropeDisabledSeconds", min: 0, max: 3, step: 0.1 }
    ].map((field) => Object.freeze(field))
);

const ROPE_TUNING_FIELD_BY_PATH = new Map(ROPE_TUNING_FIELDS.map((field) => [field.path, field]));

function valueAtPath(value, path) {
    return path.split(".").reduce((current, key) => current?.[key], value);
}

function setPath(target, path, value) {
    const [group, key] = path.split(".");
    if (!key) {
        target[group] = value;
        return;
    }
    target[group] ??= {};
    target[group][key] = value;
}

function clampedOverride(override, path, fallback) {
    const candidate = valueAtPath(override, path);
    if (!Number.isFinite(candidate)) return fallback;
    const { min, max } = ROPE_TUNING_FIELD_BY_PATH.get(path);
    return Math.max(min, Math.min(max, candidate));
}

export function resolveEffectiveRopeConfig(override = null, baseConfig = ROPE_CONFIG) {
    const source = override && typeof override === "object" && !Array.isArray(override) ? override : null;
    return Object.freeze({
        hookSpeed: clampedOverride(source, "hookSpeed", baseConfig.hookSpeed),
        hookFlightRatio: Object.freeze({
            numerator: clampedOverride(source, "hookFlightRatio.numerator", baseConfig.hookFlightRatio.numerator),
            denominator: clampedOverride(source, "hookFlightRatio.denominator", baseConfig.hookFlightRatio.denominator)
        }),
        hookReloadSeconds: clampedOverride(source, "hookReloadSeconds", baseConfig.hookReloadSeconds),
        attachBufferSeconds: clampedOverride(source, "attachBufferSeconds", baseConfig.attachBufferSeconds),
        swingDragThresholdViewportRatio: clampedOverride(
            source,
            "swingDragThresholdViewportRatio",
            baseConfig.swingDragThresholdViewportRatio
        ),
        swingDragMinHoldSeconds: clampedOverride(source, "swingDragMinHoldSeconds", baseConfig.swingDragMinHoldSeconds),
        swingImpulse: clampedOverride(source, "swingImpulse", baseConfig.swingImpulse),
        handOffset: Object.freeze({
            x: clampedOverride(source, "handOffset.x", baseConfig.handOffset.x),
            y: clampedOverride(source, "handOffset.y", baseConfig.handOffset.y)
        }),
        releaseAngularTransfer: clampedOverride(source, "releaseAngularTransfer", baseConfig.releaseAngularTransfer)
    });
}

export function ropeHookFlightSeconds(ropeConfig = ROPE_CONFIG) {
    return ropeConfig.hookFlightRatio.numerator / ropeConfig.hookFlightRatio.denominator;
}

export function ropeHookReach(ropeConfig = ROPE_CONFIG) {
    return (ropeConfig.hookSpeed * ropeConfig.hookFlightRatio.numerator) / ropeConfig.hookFlightRatio.denominator;
}

export const GRAPPLE_LINK_BUDGET = 600;

export const CAMERA_CONFIG = Object.freeze({
    desktopZoom: 1,
    authoredMobileBaselineZoom: 0.72,
    referenceViewport: Object.freeze({ width: 1920, height: 1080 })
});

export function resolveMobileCameraZoom(
    authoredMobileZoom = CAMERA_CONFIG.authoredMobileBaselineZoom,
    { cssWidth = CAMERA_CONFIG.referenceViewport.width, cssHeight = CAMERA_CONFIG.referenceViewport.height } = {}
) {
    const authoredZoom =
        Number.isFinite(authoredMobileZoom) && authoredMobileZoom > 0
            ? authoredMobileZoom
            : CAMERA_CONFIG.authoredMobileBaselineZoom;
    const width = Number.isFinite(cssWidth) && cssWidth > 1 ? cssWidth : CAMERA_CONFIG.referenceViewport.width;
    const height = Number.isFinite(cssHeight) && cssHeight > 1 ? cssHeight : CAMERA_CONFIG.referenceViewport.height;
    const viewportFit = Math.min(
        1,
        width / CAMERA_CONFIG.referenceViewport.width,
        height / CAMERA_CONFIG.referenceViewport.height
    );
    return viewportFit * (authoredZoom / CAMERA_CONFIG.authoredMobileBaselineZoom);
}

export const COMBAT_CONFIG = Object.freeze({
    automaticWeaponEnabled: false,
    weaponRange: 320,
    weaponDamage: 10,
    fireInterval: 0.65,
    projectileSpeed: 520,
    projectileRadius: 5,
    projectileSpawnClearance: 8,
    playerProjectileLifetimeSeconds: 8,
    enemyRadius: 18,
    enemyHealth: 100,
    enemyAttackRange: 760,
    enemyAcquireSeconds: 0.25,
    enemyTrackSeconds: 0.8,
    enemyLockSeconds: 0.2,
    enemyFireFlashSeconds: 0.08,
    enemyFireInterval: 1.0,
    enemyProjectileSpeed: 520,
    enemyProjectileRadius: 7,
    enemyProjectileDamage: 20,
    enemyProjectileLifetimeSeconds: 8,
    playerMaxHealth: 100,
    playerHitInvulnerability: 0.45,
    playerHitKnockback: 260,
    ropeDisabledSeconds: 0.6
});

export function resolveEffectiveRopeDisabledSeconds(override = null, baseSeconds = COMBAT_CONFIG.ropeDisabledSeconds) {
    const source = override && typeof override === "object" && !Array.isArray(override) ? override : null;
    return clampedOverride(source, "ropeDisabledSeconds", baseSeconds);
}

export function normalizeRopeTuningOverride(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "object" || Array.isArray(value)) return null;
    const defaults = { ...ROPE_CONFIG, ropeDisabledSeconds: COMBAT_CONFIG.ropeDisabledSeconds };
    const normalized = {};
    for (const { path, min, max } of ROPE_TUNING_FIELDS) {
        const candidate = valueAtPath(value, path);
        if (!Number.isFinite(candidate) || candidate < min || candidate > max) continue;
        if (candidate !== valueAtPath(defaults, path)) setPath(normalized, path, candidate);
    }
    for (const nested of Object.values(normalized)) {
        if (nested && typeof nested === "object") Object.freeze(nested);
    }
    return Object.keys(normalized).length === 0 ? null : Object.freeze(normalized);
}

export const FALL_DAMAGE_CONFIG = Object.freeze({
    safeImpactSpeed: 800,
    maximumDamageImpactSpeed: 1400,
    damageScale: 0.5
});

export const ROPE_IMPACT_CONFIG = Object.freeze({
    minimumSpeed: 620,
    referenceSpeed: 1000,
    referenceDamage: 100
});

export const AUGMENT_IMPACT_CONFIG = Object.freeze({
    baseDamage: 25,
    electrifiedDamagePerSecond: 100,
    electrifiedPulseSeconds: 0.1
});

export const WIND_CONFIG = Object.freeze({
    groundedFactor: 0.35,
    shadowFactor: 0.15,
    defaultFalloff: 0
});

export const WORLD_CONFIG = Object.freeze({
    seed: 20260810,
    levelCount: 48,
    verticalStep: 185,
    minimumVerticalGain: 150,
    laneWidth: 340,
    enemySpawnInterval: 1,
    checkpointInterval: 8,
    checkpointRadius: 38,
    summitRadius: 42,
    floorY: 560
});
