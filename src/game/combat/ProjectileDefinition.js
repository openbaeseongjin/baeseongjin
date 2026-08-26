export const PROJECTILE_TYPE = Object.freeze({
    PLAYER: "player-projectile",
    ENEMY: "enemy-projectile"
});

export const PROJECTILE_MOTION_KIND = Object.freeze({
    BALLISTIC: "ballistic",
    HOMING: "homing"
});

export const PROJECTILE_COLLIDER_PRESET_ID = Object.freeze({
    CIRCLE: "projectile-circle",
    HOMING_MISSILE_RECT: "homing-missile-rect"
});

const PROJECTILE_COLLIDER_GEOMETRY = Object.freeze({
    MINIMUM_DIRECTION_LENGTH: 0.000000001,
    MISSILE_MINIMUM_WIDTH: 28,
    MISSILE_WIDTH_RADIUS_MULTIPLIER: 1.65,
    MISSILE_MINIMUM_HEIGHT: 10,
    MISSILE_HEIGHT_RADIUS_MULTIPLIER: 0.55
});

class ProjectileColliderDefinition {
    constructor(id) {
        this.id = id;
        Object.freeze(this);
    }

    snapshot() {
        throw new Error(`${this.constructor.name} must implement snapshot()`);
    }
}

class CircleProjectileColliderDefinition extends ProjectileColliderDefinition {
    snapshot({ radius }) {
        return Object.freeze({ type: "circle", radius });
    }
}

class HomingMissileRectColliderDefinition extends ProjectileColliderDefinition {
    size(radius) {
        return Object.freeze({
            width: Math.max(
                PROJECTILE_COLLIDER_GEOMETRY.MISSILE_MINIMUM_WIDTH,
                radius * PROJECTILE_COLLIDER_GEOMETRY.MISSILE_WIDTH_RADIUS_MULTIPLIER
            ),
            height: Math.max(
                PROJECTILE_COLLIDER_GEOMETRY.MISSILE_MINIMUM_HEIGHT,
                radius * PROJECTILE_COLLIDER_GEOMETRY.MISSILE_HEIGHT_RADIUS_MULTIPLIER
            )
        });
    }

    snapshot({ radius, velocity }) {
        const size = this.size(radius);
        const halfWidth = size.width * 0.5;
        const halfHeight = size.height * 0.5;
        const magnitude = Math.hypot(velocity.x, velocity.y);
        const forward =
            magnitude > PROJECTILE_COLLIDER_GEOMETRY.MINIMUM_DIRECTION_LENGTH
                ? { x: velocity.x / magnitude, y: velocity.y / magnitude }
                : { x: 1, y: 0 };
        const side = { x: -forward.y, y: forward.x };
        const vertex = (forwardScale, sideScale) =>
            Object.freeze({
                x: forward.x * forwardScale + side.x * sideScale,
                y: forward.y * forwardScale + side.y * sideScale
            });
        return Object.freeze({
            type: "polygon",
            vertices: Object.freeze([
                vertex(-halfWidth, -halfHeight),
                vertex(halfWidth, -halfHeight),
                vertex(halfWidth, halfHeight),
                vertex(-halfWidth, halfHeight)
            ])
        });
    }
}

const PROJECTILE_COLLIDER_DEFINITION = Object.freeze({
    [PROJECTILE_COLLIDER_PRESET_ID.CIRCLE]: new CircleProjectileColliderDefinition(
        PROJECTILE_COLLIDER_PRESET_ID.CIRCLE
    ),
    [PROJECTILE_COLLIDER_PRESET_ID.HOMING_MISSILE_RECT]: new HomingMissileRectColliderDefinition(
        PROJECTILE_COLLIDER_PRESET_ID.HOMING_MISSILE_RECT
    )
});

export function projectileColliderDefinition(id) {
    const definition = PROJECTILE_COLLIDER_DEFINITION[id];
    if (!definition) throw new Error(`unknown projectile collider preset: ${id}`);
    return definition;
}

export const PROJECTILE_HOMING = Object.freeze({
    DEFAULT_TURN_RATE_RADIANS_PER_SECOND: Math.PI * 2,
    FULL_ROTATION_RADIANS: Math.PI * 2,
    HALF_ROTATION_RADIANS: Math.PI
});

export const PROJECTILE_TARGET_COLLECTION = Object.freeze({
    ENEMIES: "enemies",
    COMBAT_TARGETS: "combatTargets",
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
        targetStateCollection: PROJECTILE_TARGET_COLLECTION.COMBAT_TARGETS,
        renderCollection: PROJECTILE_RENDER_COLLECTION.PLAYER,
        collisionRejectionPolicy: PROJECTILE_COLLISION_REJECTION.CONSUME,
        usesOwnerPredictionId: true,
        colliderPresetId: PROJECTILE_COLLIDER_PRESET_ID.CIRCLE
    }),
    [PROJECTILE_TYPE.ENEMY]: Object.freeze({
        objectType: PROJECTILE_TYPE.ENEMY,
        defaultMotionKind: PROJECTILE_MOTION_KIND.BALLISTIC,
        targetStateCollection: PROJECTILE_TARGET_COLLECTION.PLAYERS,
        renderCollection: PROJECTILE_RENDER_COLLECTION.ENEMY,
        collisionRejectionPolicy: PROJECTILE_COLLISION_REJECTION.RETRY_AFTER_SEPARATION,
        usesOwnerPredictionId: false,
        colliderPresetId: PROJECTILE_COLLIDER_PRESET_ID.CIRCLE
    })
});
