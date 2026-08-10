import assert from "node:assert/strict";
import { PLAYER_CONFIG, ROPE_CONFIG } from "../src/game/config.js";
import { PlayerPhysics } from "../src/game/physics/PlayerPhysics.js";
import { FixedLengthRope } from "../src/game/rope/FixedLengthRope.js";
import { polygonBounds } from "../src/game/world/PolygonGeometry.js";

const noInput = Object.freeze({ horizontal: 0, vertical: 0 });

export function run() {
    const vertices = [
        { x: 0, y: 200 },
        { x: 240, y: 200 },
        { x: 210, y: 270 },
        { x: 35, y: 260 }
    ];
    const platform = { ...polygonBounds(vertices), vertices, topY: 200, oneWay: true };
    const rope = new FixedLengthRope(ROPE_CONFIG);

    const rising = new PlayerPhysics(PLAYER_CONFIG);
    rising.position.set(100, 235);
    rising.velocity.set(0, -500);
    rising.step(1 / 30, noInput, [platform], rope);
    assert.ok(
        rising.position.y < platform.y + platform.height,
        "player must pass upward through a horizontal platform"
    );
    assert.ok(rising.velocity.y < 0, "platform underside must not cancel upward velocity");

    const falling = new PlayerPhysics(PLAYER_CONFIG);
    falling.position.set(100, 160);
    falling.velocity.set(0, 500);
    falling.step(1 / 20, noInput, [platform], rope);
    assert.equal(falling.position.y, platform.y - PLAYER_CONFIG.radius, "player must land from above");
    assert.equal(falling.velocity.y, 0);
    assert.equal(falling.isGrounded, true);

    const swingConfig = {
        ...PLAYER_CONFIG,
        gravity: 0,
        airAcceleration: 0
    };
    const swingRope = new FixedLengthRope(ROPE_CONFIG);
    const swinging = new PlayerPhysics(swingConfig);
    swinging.position.set(0, 300);
    swinging.velocity.set(700, 0);
    swingRope.attach(swinging.position, { x: 0, y: 0 });
    swinging.position.y = 400;
    swinging.step(1 / 120, noInput, [], swingRope);
    assert.equal(swinging.velocity.x, 700, "movement speed limits must not reduce tangential swing velocity");

    const controlledSwing = new PlayerPhysics({ ...swingConfig, airAcceleration: PLAYER_CONFIG.airAcceleration });
    const controlledRope = new FixedLengthRope(ROPE_CONFIG);
    controlledSwing.position.set(0, 300);
    controlledRope.attach(controlledSwing.position, { x: 0, y: 0 });
    controlledSwing.step(1 / 120, { horizontal: 1, vertical: 0 }, [], controlledRope);
    assert.equal(controlledSwing.velocity.x, 0, "held directional input must not create continuous swing acceleration");

    const gravitySwing = new PlayerPhysics({ ...PLAYER_CONFIG, airAcceleration: 0 });
    const gravityRope = new FixedLengthRope(ROPE_CONFIG);
    gravitySwing.position.set(300, 0);
    gravityRope.attach(gravitySwing.position, { x: 0, y: 0 });
    gravitySwing.step(1 / 120, noInput, [], gravityRope);
    assert.ok(gravitySwing.velocity.y > 0, "gravity must accelerate the player along the rope tangent");

    const bottomSwing = new PlayerPhysics({ ...PLAYER_CONFIG, airAcceleration: 0 });
    const bottomRope = new FixedLengthRope(ROPE_CONFIG);
    bottomSwing.position.set(0, 300);
    bottomRope.attach(bottomSwing.position, { x: 0, y: 0 });
    bottomSwing.step(1 / 120, noInput, [], bottomRope);
    assert.equal(bottomSwing.velocity.y, 0, "gravity must not stretch a fixed rope at the bottom of the arc");

    controlledSwing.velocity.set(10, 20);
    controlledSwing.addImpulse({ x: 0, y: -1 }, 620);
    assert.deepEqual(
        { x: controlledSwing.velocity.x, y: controlledSwing.velocity.y },
        { x: 10, y: -600 },
        "swing impulse must preserve the velocity component outside its chosen tangent"
    );
}
