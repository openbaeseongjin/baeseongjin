import assert from "node:assert/strict";
import { InputSampler } from "../src/core/input/InputSampler.js";

export function run() {
    const listeners = new Map();
    const target = {
        innerWidth: 1000,
        innerHeight: 700,
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
    assert.deepEqual(snapshot.viewport, { width: 1000, height: 700 });
    assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.pointer));
    sampler.detach();
    assert.equal(listeners.size, 0);

    const touchListeners = new Map();
    const captured = [];
    const surface = {
        clientWidth: 1000,
        clientHeight: 640,
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
    let touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.horizontal, 0, "touch input must not create mobile walking movement");
    assert.equal(touchSnapshot.vertical, 0, "touch input must not create a mobile jump");
    assert.deepEqual(touchSnapshot.pointer, { x: 204, y: 530, down: true });
    assert.deepEqual(touchSnapshot.viewport, { width: 1000, height: 640 });
    assert.deepEqual(captured, [1]);
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 2, clientX: 760, clientY: 300 });
    assert.deepEqual(touchSampler.snapshot().pointer, { x: 204, y: 530, down: true });
    assert.deepEqual(captured, [1], "a second finger must not steal or capture the active rope gesture");
    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 1 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.pointer.down, false);
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 3, clientX: 400, clientY: 240 });
    touchListeners.get("pointercancel")({ pointerType: "touch", pointerId: 3 });
    assert.equal(touchSampler.snapshot().pointer.down, false);
}
