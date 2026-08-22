export const PHYSICS_ACTOR_KIND = Object.freeze({
    ENEMY: "enemy"
});

export const PLAYER_PHYSICS = Object.freeze({
    INITIAL_POSITION: Object.freeze({ x: 120, y: 500 }),
    ZERO_VECTOR: Object.freeze({ x: 0, y: 0 }),
    IDLE_HORIZONTAL_INPUT: 0,
    JUMP_VERTICAL_THRESHOLD: 0,
    MINIMUM_IMPACT_SPEED: 0
});
