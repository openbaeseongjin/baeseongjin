import assert from "node:assert/strict";
import { StateMachine } from "../src/core/state/StateMachine.js";

export function run() {
    const machine = new StateMachine({
        initialState: "idle",
        transitions: {
            idle: ["run"],
            run: ["idle", "hit"],
            hit: ["idle", "run"]
        }
    });
    assert.deepEqual(machine.snapshot(), { state: "idle", elapsedSeconds: 0 });
    machine.advance(0.2);
    assert.deepEqual(machine.snapshot(), { state: "idle", elapsedSeconds: 0.2 });
    assert.deepEqual(machine.transition("run"), {
        accepted: true,
        changed: true,
        restarted: false,
        from: "idle",
        to: "run"
    });
    machine.advance(0.1);
    assert.equal(machine.snapshot().elapsedSeconds, 0.1);
    assert.equal(machine.transition("run").changed, false);
    assert.equal(machine.snapshot().elapsedSeconds, 0.1, "same-state transition must preserve clip time");
    assert.equal(machine.transition("run", { restart: true }).restarted, true);
    assert.equal(machine.snapshot().elapsedSeconds, 0);
    assert.deepEqual(machine.transition("missing"), {
        accepted: false,
        changed: false,
        restarted: false,
        from: "run",
        to: "missing",
        reason: "transition-not-allowed"
    });
    machine.restore({ state: "hit", elapsedSeconds: 0.35 });
    assert.deepEqual(machine.snapshot(), {
        state: "hit",
        elapsedSeconds: 0.35
    });
    assert.throws(() => machine.restore({ state: "missing" }), /Unknown StateMachine state/);
    assert.throws(() => machine.advance(-1), /non-negative/);
}
