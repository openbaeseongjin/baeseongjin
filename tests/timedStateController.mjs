import assert from "node:assert/strict";
import { TimedStateController } from "../src/core/state/TimedStateController.js";

const TRANSITIONS = Object.freeze({ idle: Object.freeze(["windup"]), windup: Object.freeze(["fire"]), fire: [] });

export function run() {
    const controller = new TimedStateController({ initialState: "idle", transitions: TRANSITIONS });
    assert.equal(controller.state, "idle");
    assert.equal(controller.transition("windup", { durationSeconds: 0.25 }).accepted, true);
    assert.equal(controller.consume(0.1), 0.1);
    assert.deepEqual(controller.snapshot(), {
        state: "windup",
        elapsedSeconds: 0.1,
        remainingSeconds: 0.15
    });
    assert.equal(controller.consume(1), 0.15, "a timed state only consumes its remaining budget");
    assert.equal(controller.transition("fire", { durationSeconds: 0.05 }).accepted, true);
    assert.equal(
        controller.transition("idle").accepted,
        false,
        "the wrapped StateMachine still owns transition validity"
    );

    const restored = new TimedStateController({
        initialState: "idle",
        transitions: TRANSITIONS,
        state: "windup",
        remainingSeconds: 0.2
    });
    assert.deepEqual(restored.snapshot(), { state: "windup", elapsedSeconds: 0, remainingSeconds: 0.2 });
    assert.throws(() => restored.setRemainingSeconds(-1), /non-negative/);
}
