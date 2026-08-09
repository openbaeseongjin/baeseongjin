import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { ROPE_CONFIG } from "../src/game/config.js";
import { ElasticRope } from "../src/game/rope/ElasticRope.js";

export function run() {
    const rope = new ElasticRope(ROPE_CONFIG);
    const position = new Vector2(0, 300);
    const velocity = new Vector2(180, 0);

    assert.equal(rope.attach(position, { x: 0, y: 0 }), true);
    assert.ok(rope.restLength < rope.currentLength, "attachment must begin in a stretched state");
    assert.ok(rope.currentLength / rope.restLength > 1.2, "attachment must provide a noticeable initial pull");
    const attachedRestLength = rope.restLength;
    rope.apply(position, velocity, 1 / 120);
    assert.ok(rope.restLength < attachedRestLength, "an attached rope must reel in automatically");
    assert.ok(velocity.y < 0, "spring tension must pull the player toward the anchor");
    assert.ok(rope.tension > 0);

    const releaseVelocity = velocity.clone();
    rope.detach();
    rope.apply(position, velocity, 1 / 120);
    assert.deepEqual(velocity, releaseVelocity, "release must preserve momentum");
    assert.equal(rope.attach(position, { x: ROPE_CONFIG.maxAttachDistance + 1, y: 300 }), false);

    const clampRope = new ElasticRope(ROPE_CONFIG);
    const clampPosition = new Vector2(0, 300);
    const clampVelocity = new Vector2(0, 500);
    clampRope.attach(clampPosition, { x: 0, y: 0 });
    clampPosition.y = 400;
    clampRope.apply(clampPosition, clampVelocity, 1 / 120);
    const maximumLength = clampRope.restLength * ROPE_CONFIG.maximumStretchRatio;
    assert.ok(clampPosition.isFinite(), "maximum-length correction must keep the player position finite");
    assert.ok(clampVelocity.isFinite(), "maximum-length correction must keep the player velocity finite");
    assert.ok(
        Math.abs(clampPosition.distanceTo(clampRope.anchor) - maximumLength) < 0.001,
        "maximum-length correction must clamp to the rope limit without teleporting"
    );

    const conservationRope = new ElasticRope({
        ...ROPE_CONFIG,
        retractSpeed: 0,
        maximumStretchRatio: 10
    });
    const orbitPosition = new Vector2(0, 300);
    const orbitVelocity = new Vector2(260, 0);
    conservationRope.attach(orbitPosition, { x: 0, y: 0 });
    const energy = () => {
        const stretch = Math.max(0, orbitPosition.distanceTo(conservationRope.anchor) - conservationRope.restLength);
        return orbitVelocity.length() ** 2 * 0.5 + ROPE_CONFIG.springStrength * stretch ** 2 * 0.5;
    };
    const initialEnergy = energy();
    const simulationStep = 1 / 1000;
    for (let step = 0; step < 8000; step += 1) {
        conservationRope.apply(orbitPosition, orbitVelocity, simulationStep);
        orbitPosition.add(orbitVelocity.clone().scale(simulationStep));
    }
    const retainedEnergyRatio = energy() / initialEnergy;
    assert.ok(retainedEnergyRatio > 0.97, `swing energy must be retained, got ${retainedEnergyRatio}`);
}
