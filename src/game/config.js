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
    hookSpeed: 1400,
    hookFlightRatio: Object.freeze({ numerator: 2, denominator: 7 }),
    hookReloadSeconds: 0.2,
    attachBufferSeconds: 0.1,
    swingDragThresholdViewportRatio: 0.11,
    swingDragMinHoldSeconds: 0.08,
    swingImpulse: 780,
    handOffset: Object.freeze({ x: 12, y: -7 }),
    releaseAngularTransfer: 0.55
});

export function ropeHookFlightSeconds(ropeConfig = ROPE_CONFIG) {
    return ropeConfig.hookFlightRatio.numerator / ropeConfig.hookFlightRatio.denominator;
}

export function ropeHookReach(ropeConfig = ROPE_CONFIG) {
    return (ropeConfig.hookSpeed * ropeConfig.hookFlightRatio.numerator) / ropeConfig.hookFlightRatio.denominator;
}

export const GRAPPLE_LINK_BUDGET = 600;

export const CAMERA_CONFIG = Object.freeze({
    desktopZoom: 1,
    mobileZoom: 0.72
});

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

export const FALL_DAMAGE_CONFIG = Object.freeze({
    safeImpactSpeed: 800,
    lethalImpactSpeed: 1400
});

export const ROPE_IMPACT_CONFIG = Object.freeze({
    minimumSpeed: 620,
    damage: 25
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
