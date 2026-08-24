export const PROJECTILE_TYPE = Object.freeze({
    PLAYER: "player-projectile",
    ENEMY: "enemy-projectile"
});

export const PROJECTILE_MOTION_KIND = Object.freeze({
    BALLISTIC: "ballistic",
    HOMING: "homing"
});

export const PROJECTILE_HOMING = Object.freeze({
    DEFAULT_TURN_RATE_RADIANS_PER_SECOND: Math.PI * 2,
    FULL_ROTATION_RADIANS: Math.PI * 2,
    HALF_ROTATION_RADIANS: Math.PI
});

export const PROJECTILE_TARGET_COLLECTION = Object.freeze({
    ENEMIES: "enemies",
    PLAYERS: "players"
});

export const PROJECTILE_RENDER_COLLECTION = Object.freeze({
    PLAYER: "projectiles",
    ENEMY: "enemyProjectiles"
});

export const PROJECTILE_COLLISION_STATE = Object.freeze({
    READY: "ready",
    DISABLED: "disabled",
    WAITING_SEPARATION: "waiting-separation",
    PENDING: "pending",
    CONSUMED: "consumed"
});

export const PROJECTILE_COLLISION_REJECTION = Object.freeze({
    CONSUME: "consume",
    RETRY_AFTER_SEPARATION: "retry-after-separation"
});

export const PROJECTILE_KEY = Object.freeze({
    prediction: (ownerId, tick) => `${ownerId}:${tick}`
});

export const PROJECTILE_INITIAL_COLLISION_STATE = Object.freeze({
    true: PROJECTILE_COLLISION_STATE.READY,
    false: PROJECTILE_COLLISION_STATE.DISABLED
});

export const PROJECTILE_REJECTED_COLLISION_STATE = Object.freeze({
    [PROJECTILE_COLLISION_REJECTION.CONSUME]: PROJECTILE_COLLISION_STATE.CONSUMED,
    [PROJECTILE_COLLISION_REJECTION.RETRY_AFTER_SEPARATION]: PROJECTILE_COLLISION_STATE.WAITING_SEPARATION
});

export const PROJECTILE_INVISIBLE_COLLISION_STATES = Object.freeze([
    PROJECTILE_COLLISION_STATE.PENDING,
    PROJECTILE_COLLISION_STATE.CONSUMED
]);

export const PROJECTILE_DEFINITION = Object.freeze({
    [PROJECTILE_TYPE.PLAYER]: Object.freeze({
        objectType: PROJECTILE_TYPE.PLAYER,
        defaultMotionKind: PROJECTILE_MOTION_KIND.HOMING,
        targetStateCollection: PROJECTILE_TARGET_COLLECTION.ENEMIES,
        renderCollection: PROJECTILE_RENDER_COLLECTION.PLAYER,
        collisionRejectionPolicy: PROJECTILE_COLLISION_REJECTION.CONSUME,
        usesOwnerPredictionId: true
    }),
    [PROJECTILE_TYPE.ENEMY]: Object.freeze({
        objectType: PROJECTILE_TYPE.ENEMY,
        defaultMotionKind: PROJECTILE_MOTION_KIND.BALLISTIC,
        targetStateCollection: PROJECTILE_TARGET_COLLECTION.PLAYERS,
        renderCollection: PROJECTILE_RENDER_COLLECTION.ENEMY,
        collisionRejectionPolicy: PROJECTILE_COLLISION_REJECTION.RETRY_AFTER_SEPARATION,
        usesOwnerPredictionId: false
    })
});
