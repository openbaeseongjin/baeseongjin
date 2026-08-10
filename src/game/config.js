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
    initialRestRatio: 1,
    springStrength: 46,
    radialDamping: 0,
    minimumRestLength: 90,
    maximumStretchRatio: 1.35,
    retractSpeed: 0,
    attachBufferSeconds: 0.1,
    swingDragThreshold: 44,
    swingImpulse: 460
});

export const WORLD_CONFIG = Object.freeze({
    seed: 20260810,
    levelCount: 48,
    verticalStep: 160,
    laneWidth: 220,
    floorY: 560
});
