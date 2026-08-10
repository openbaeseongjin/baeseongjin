import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { ROPE_CONFIG } from "../src/game/config.js";
import { FixedLengthRope } from "../src/game/rope/FixedLengthRope.js";

export function run() {
    const rope = new FixedLengthRope(ROPE_CONFIG);
    const position = new Vector2(0, 300);
    const velocity = new Vector2(180, 0);

    assert.equal(rope.attach(position, { x: 0, y: 0 }), true);
    assert.equal(rope.length, 300, "attachment must lock the current distance as its radius");
    rope.apply(position, velocity, 1 / 120);
    assert.deepEqual(
        { x: velocity.x, y: velocity.y },
        { x: 180, y: 0 },
        "attachment by itself must preserve existing tangential velocity"
    );

    position.set(0, 360);
    velocity.set(180, 90);
    rope.apply(position, velocity, 1 / 120);
    assert.equal(position.distanceTo(rope.anchor), 300, "constraint must restore the fixed rope radius");
    assert.deepEqual({ x: velocity.x, y: velocity.y }, { x: 180, y: 0 }, "constraint must remove only radial speed");
    assert.ok(rope.tension > 0);

    const releaseVelocity = velocity.clone();
    rope.detach();
    rope.apply(position, velocity, 1 / 120);
    assert.deepEqual(velocity, releaseVelocity, "release must preserve momentum");
    assert.equal(rope.attach(position, { x: ROPE_CONFIG.maxAttachDistance + 1, y: 300 }), false);

    const orbitRope = new FixedLengthRope(ROPE_CONFIG);
    const orbitPosition = new Vector2(0, 300);
    const orbitVelocity = new Vector2(260, 0);
    orbitRope.attach(orbitPosition, { x: 0, y: 0 });
    const initialSpeed = orbitVelocity.length();
    const simulationStep = 1 / 1000;
    for (let step = 0; step < 8000; step += 1) {
        orbitRope.apply(orbitPosition, orbitVelocity, simulationStep);
        orbitPosition.add(orbitVelocity.clone().scale(simulationStep));
    }
    assert.ok(
        Math.abs(orbitVelocity.length() - initialSpeed) < 1,
        "fixed constraint must retain tangential speed without damping"
    );
}
