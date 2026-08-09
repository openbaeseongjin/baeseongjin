import assert from "node:assert/strict";
import { InputSampler } from "../src/core/input/InputSampler.js";

export function run() {
    const listeners = new Map();
    const target = {
        addEventListener: (name, fn) => listeners.set(name, fn),
        removeEventListener: (name) => listeners.delete(name)
    };
    const sampler = new InputSampler(target);
    assert.equal(listeners.size, 0);
    sampler.attach();
    listeners.get("keydown")({ code: "KeyD" });
    listeners.get("pointermove")({ clientX: 12, clientY: 34 });
    const snapshot = sampler.snapshot();
    assert.equal(snapshot.horizontal, 1);
    assert.deepEqual(snapshot.pointer, { x: 12, y: 34, down: false });
    assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.pointer));
    sampler.detach();
    assert.equal(listeners.size, 0);
}
