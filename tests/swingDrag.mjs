import assert from "node:assert/strict";
import { ROPE_CONFIG } from "../src/game/config.js";
import { evaluateSwingDrag, getSwingDragThreshold } from "../src/game/rope/SwingDrag.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

export function run() {
    assert.equal(getSwingDragThreshold({ width: 844, height: 390 }, 0.11), 42.9);
    assert.equal(getSwingDragThreshold({ width: 1280, height: 720 }, 0.11), 79.2);
    const verticalRope = { anchor: { x: 0, y: 0 }, playerPosition: { x: 0, y: 100 }, threshold: 40 };
    const left = evaluateSwingDrag({ ...verticalRope, drag: { x: -40, y: 80 } });
    assert.equal(left.triggered, true);
    assert.deepEqual(left.direction, { x: -1, y: 0 });
    assert.equal(left.distance, 40, "dragging along the rope must not contribute to the trigger");

    const radialOnly = evaluateSwingDrag({ ...verticalRope, drag: { x: 0, y: 200 } });
    assert.equal(radialOnly.triggered, false);
    assert.equal(radialOnly.progress, 0);

    const horizontalRope = { anchor: { x: 0, y: 0 }, playerPosition: { x: 100, y: 0 }, threshold: 40 };
    const upward = evaluateSwingDrag({ ...horizontalRope, drag: { x: 100, y: -50 } });
    assert.equal(upward.triggered, true);
    assert.deepEqual(upward.direction, { x: 0, y: -1 });

    let impulseCount = 0;
    let appliedMagnitude = 0;
    const app = new GameSimulation();
    const player = app.players.find(({ id }) => id === app.getPrimaryPlayerId());
    player.physics.position.set(0, 100);
    player.physics.addImpulse = (_direction, magnitude) => {
        impulseCount += 1;
        appliedMagnitude = magnitude;
    };
    player.rope.attach(player.physics.position, { x: 0, y: 0 });
    player.swingDrag = { origin: { x: 100, y: 100 }, direction: null, progress: 0, age: 0, used: false };
    app.eventFlash = { type: "attach", age: 0 };
    const viewport = { width: 1280, height: 720 };
    app.updateSwingDrag({ x: 20, y: 200 }, viewport, 0.04);
    assert.equal(impulseCount, 0, "a fast pointer adjustment immediately after attachment must not trigger a swing");
    app.updateSwingDrag({ x: 20, y: 200 }, viewport, 0.04);
    app.updateSwingDrag({ x: 0, y: 200 }, viewport, 0.04);
    assert.equal(impulseCount, 1, "each attachment must grant exactly one swing impulse");
    assert.equal(appliedMagnitude, ROPE_CONFIG.swingImpulse, "swing must use the configured impulse strength");
    assert.equal(player.swingDrag.used, true);
    assert.equal(app.eventFlash.type, "swing");
}
