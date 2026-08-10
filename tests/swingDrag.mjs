import assert from "node:assert/strict";
import { GameApp } from "../src/game/GameApp.js";
import { evaluateSwingDrag } from "../src/game/rope/SwingDrag.js";

export function run() {
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
    const app = Object.create(GameApp.prototype);
    app.rope = { anchor: { x: 0, y: 0 } };
    app.player = {
        position: { x: 0, y: 100 },
        addImpulse() {
            impulseCount += 1;
        }
    };
    app.swingDrag = { origin: { x: 100, y: 100 }, direction: null, progress: 0, used: false };
    app.eventFlash = { type: "attach", age: 0 };
    app.updateSwingDrag({ x: 50, y: 200 });
    app.updateSwingDrag({ x: 20, y: 200 });
    assert.equal(impulseCount, 1, "each attachment must grant exactly one swing impulse");
    assert.equal(app.swingDrag.used, true);
    assert.equal(app.eventFlash.type, "swing");
}
