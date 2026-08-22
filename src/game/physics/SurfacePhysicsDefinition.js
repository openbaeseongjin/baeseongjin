export const SURFACE_MOTION_TYPE = Object.freeze({
    STATIC: "static",
    KINEMATIC: "kinematic",
    DYNAMIC: "dynamic"
});

export const SURFACE_PHYSICS = Object.freeze({
    MINIMUM_EXPLICIT_MASS: 0,
    MINIMUM_MASS: 0.25,
    MASS_RADIUS_DIVISOR: 15,
    DEFAULT_MASS: 1,
    MASS_EXPONENT: 2,
    DEFAULT_COLLISION_DAMPING: 6,
    MINIMUM_DT: 0,
    EMPTY_COLLISION_COUNT: 0,
    ZERO_VECTOR: Object.freeze({ x: 0, y: 0 })
});

export const SURFACE_MOTION_TYPE_BY_STATIC = Object.freeze({
    true: SURFACE_MOTION_TYPE.STATIC,
    false: SURFACE_MOTION_TYPE.DYNAMIC
});

export const VALID_SURFACE_MOTION_TYPE = Object.freeze({
    [SURFACE_MOTION_TYPE.STATIC]: true,
    [SURFACE_MOTION_TYPE.KINEMATIC]: true,
    [SURFACE_MOTION_TYPE.DYNAMIC]: true
});
