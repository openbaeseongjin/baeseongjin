export const PHYSICS = Object.freeze({
    MINIMUM_DT: 0,
    MINIMUM_GRAVITY_SCALE: 0,
    DEFAULT_GRAVITY_SCALE: 1,
    DEFAULT_IMPULSE_SCALE: 1,
    ZERO_VECTOR: Object.freeze({ x: 0, y: 0 })
});

export const PHYSICS_VECTOR_LABEL = Object.freeze({
    POSITION: "physics position",
    VELOCITY: "physics velocity",
    ACCELERATION: "physics acceleration",
    IMPULSE: "physics impulse"
});
