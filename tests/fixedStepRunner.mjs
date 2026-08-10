import assert from "node:assert/strict";
import { FixedStepRunner } from "../src/core/sim/FixedStepRunner.js";

export function run() {
    const events = [];
    const runner = new FixedStepRunner({
        stepHz: 10,
        maxCatchUpSteps: 2,
        step: () => events.push("step"),
        render: () => events.push("render")
    });
    runner.reset(0);
    const first = runner.frame(100, Object.freeze({}));
    assert.equal(first.steps, 1);
    assert.deepEqual(events, ["step", "render"]);
    events.length = 0;
    const delayed = runner.frame(600, Object.freeze({}));
    assert.equal(delayed.steps, 2);
    assert.equal(delayed.droppedSteps, 3);
    assert.ok(delayed.alpha >= 0 && delayed.alpha <= 1);
    assert.deepEqual(events, ["step", "step", "render"]);
}
