export const PLAYER_CONFIG = Object.freeze({
    radius: 15,
    gravity: 1250,
    groundAcceleration: 1350,
    airAcceleration: 520,
    groundDrag: 10,
    maxHorizontalSpeed: 360,
    jumpSpeed: 440
});

export const ROPE_CONFIG = Object.freeze({
    maxAttachDistance: 440,
    attachBufferSeconds: 0.1,
    swingDragThreshold: 80,
    swingDragMinHoldSeconds: 0.08,
    swingImpulse: 780
});

export const COMBAT_CONFIG = Object.freeze({
    weaponRange: 320,
    weaponDamage: 10,
    fireInterval: 0.65,
    projectileSpeed: 520,
    projectileRadius: 5,
    enemyRadius: 18,
    enemyHealth: 30,
    enemyFireInterval: 1.4,
    enemyProjectileSpeed: 260,
    enemyProjectileRadius: 7,
    enemyProjectileDamage: 20,
    playerMaxHealth: 100,
    playerHitInvulnerability: 0.45,
    playerHitKnockback: 260,
    ropeDisabledSeconds: 0.6
});

export const WORLD_CONFIG = Object.freeze({
    seed: 20260810,
    levelCount: 48,
    verticalStep: 160,
    laneWidth: 220,
    floorY: 560
});
