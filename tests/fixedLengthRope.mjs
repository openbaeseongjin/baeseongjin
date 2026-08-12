import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { PLAYER_CONFIG, ROPE_CONFIG } from "../src/game/config.js";
import { AngularMotion } from "../src/game/physics/AngularMotion.js";
import { FixedLengthRope } from "../src/game/rope/FixedLengthRope.js";
import { ropeAttachmentPoint } from "../src/game/rope/RopeAttachment.js";

function angularMotion() {
    return new AngularMotion({
        inertia: PLAYER_CONFIG.angularInertia,
        maxSpeed: 12,
        airDamping: 0,
        uprightStrength: 0,
        uprightDamping: 0
    });
}

function handPosition(position, angular, rope) {
    return ropeAttachmentPoint({ position, angle: angular.angle }, rope);
}

function radialPointSpeed(position, velocity, angular, rope) {
    const hand = handPosition(position, angular, rope);
    const delta = { x: hand.x - rope.anchor.x, y: hand.y - rope.anchor.y };
    const distance = Math.hypot(delta.x, delta.y);
    const pointVelocity = angular.pointVelocity(velocity, rope.attachmentOffset);
    return (pointVelocity.x * delta.x + pointVelocity.y * delta.y) / distance;
}

export function run() {
    const rope = new FixedLengthRope(ROPE_CONFIG);
    const position = new Vector2(0, 300);
    const velocity = new Vector2();
    const angular = angularMotion();

    assert.equal(rope.attach(position, { x: 0, y: 0 }), true);
    assert.deepEqual(
        { x: rope.attachmentOffset.x, y: rope.attachmentOffset.y },
        ROPE_CONFIG.handOffset,
        "attachment must select the hand on the anchor-facing side"
    );
    assert.equal(
        rope.length,
        Math.hypot(ROPE_CONFIG.handOffset.x, 300 + ROPE_CONFIG.handOffset.y),
        "attachment must lock the hand-to-anchor distance"
    );
    const attachmentAtRest = handPosition(position, angular, rope);
    const tangent = {
        x: -(attachmentAtRest.y - rope.anchor.y) / rope.length,
        y: (attachmentAtRest.x - rope.anchor.x) / rope.length
    };
    velocity.set(tangent.x * 180, tangent.y * 180);
    const initialVelocity = velocity.clone();
    rope.apply(position, velocity, angular, 1 / 120);
    assert.deepEqual(
        { x: velocity.x, y: velocity.y },
        { x: initialVelocity.x, y: initialVelocity.y },
        "attachment by itself must preserve existing tangential velocity"
    );

    position.set(0, 360);
    velocity.set(180, 90);
    rope.apply(position, velocity, angular, 1 / 120);
    assert.ok(
        Math.abs(
            Math.hypot(handPosition(position, angular, rope).x, handPosition(position, angular, rope).y) - rope.length
        ) < 0.001,
        "constraint must restore the fixed hand-to-anchor radius"
    );
    assert.ok(Math.abs(radialPointSpeed(position, velocity, angular, rope)) < 0.001);
    assert.notEqual(angular.velocity, 0, "an off-centre rope impulse must create angular velocity");
    assert.ok(rope.tension > 0);

    const releaseVelocity = velocity.clone();
    rope.detach();
    rope.apply(position, velocity, angular, 1 / 120);
    assert.deepEqual(velocity, releaseVelocity, "release must preserve momentum");
    assert.equal(rope.attach(position, { x: ROPE_CONFIG.maxAttachDistance + 1000, y: 300 }), false);

    const orbitRope = new FixedLengthRope(ROPE_CONFIG);
    const orbitPosition = new Vector2(0, 300);
    const orbitVelocity = new Vector2(260, 0);
    const orbitAngular = angularMotion();
    orbitRope.attach(orbitPosition, { x: 0, y: 0 });
    const initialSpeed = orbitVelocity.length();
    const simulationStep = 1 / 1000;
    for (let step = 0; step < 8000; step += 1) {
        orbitRope.apply(orbitPosition, orbitVelocity, orbitAngular, simulationStep);
        orbitPosition.add(orbitVelocity.clone().scale(simulationStep));
        orbitAngular.integrate(simulationStep);
        orbitRope.apply(orbitPosition, orbitVelocity, orbitAngular, simulationStep);
    }
    assert.ok(
        Math.abs(orbitVelocity.length() - initialSpeed) < 25,
        "off-centre fixed constraint must keep long-running orbital speed bounded without damping"
    );
}
