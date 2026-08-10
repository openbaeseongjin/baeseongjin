import assert from "node:assert/strict";
import { InputSampler } from "../src/core/input/InputSampler.js";

export function run() {
    const listeners = new Map();
    const target = {
        innerWidth: 1000,
        addEventListener: (name, fn) => listeners.set(name, fn),
        removeEventListener: (name) => listeners.delete(name)
    };
    const sampler = new InputSampler(target);
    assert.equal(listeners.size, 0);
    sampler.attach();
    listeners.get("keydown")({ code: "KeyD" });
    listeners.get("pointermove")({ clientX: 12, clientY: 34, pointerType: "mouse" });
    const snapshot = sampler.snapshot();
    assert.equal(snapshot.horizontal, 1);
    assert.deepEqual(snapshot.pointer, { x: 12, y: 34, down: false });
    assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.pointer));
    sampler.detach();
    assert.equal(listeners.size, 0);

    const touchListeners = new Map();
    const captured = [];
    const surface = {
        clientWidth: 1000,
        addEventListener: (name, fn) => touchListeners.set(name, fn),
        removeEventListener: (name) => touchListeners.delete(name),
        setPointerCapture: (id) => captured.push(id)
    };
    const touchTarget = {
        innerWidth: 1000,
        addEventListener: () => {},
        removeEventListener: () => {}
    };
    const touchSampler = new InputSampler(touchTarget, surface);
    touchSampler.attach();
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 1, clientX: 140, clientY: 600 });
    touchListeners.get("pointermove")({ pointerType: "touch", pointerId: 1, clientX: 204, clientY: 530 });
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 2, clientX: 760, clientY: 300 });
    let touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.horizontal, 1);
    assert.equal(touchSnapshot.vertical, -1);
    assert.deepEqual(touchSnapshot.pointer, { x: 760, y: 252, down: true });
    assert.deepEqual(captured, [1, 2]);
    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 2 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.horizontal, 1, "releasing the rope finger must not release movement");
    assert.equal(touchSnapshot.pointer.down, false);
    touchListeners.get("pointercancel")({ pointerType: "touch", pointerId: 1 });
    assert.equal(touchSampler.snapshot().horizontal, 0);
}
