import assert from "node:assert/strict";
import { InputSampler } from "../src/core/input/InputSampler.js";

export function run() {
    const listeners = new Map();
    const documentListeners = new Map();
    const ropeReleases = [];
    const documentTarget = {
        hidden: false,
        addEventListener: (name, fn) => documentListeners.set(name, fn),
        removeEventListener: (name) => documentListeners.delete(name)
    };
    const target = {
        innerWidth: 1000,
        innerHeight: 700,
        document: documentTarget,
        addEventListener: (name, fn) => listeners.set(name, fn),
        removeEventListener: (name) => listeners.delete(name)
    };
    const sampler = new InputSampler(target, target, {
        onRopeRelease: (input, reason) => ropeReleases.push({ input, reason })
    });
    assert.equal(listeners.size, 0);
    sampler.attach();
    listeners.get("keydown")({ code: "KeyD" });
    listeners.get("pointermove")({ clientX: 12, clientY: 34, pointerType: "mouse" });
    const snapshot = sampler.snapshot();
    assert.equal(snapshot.horizontal, 1);
    assert.equal(snapshot.interact, false);
    assert.equal(snapshot.action, false);
    assert.deepEqual(snapshot.pointer, { x: 12, y: 34, down: false });
    assert.deepEqual(snapshot.viewport, { width: 1000, height: 700 });
    assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.pointer));
    listeners.get("keydown")({ code: "KeyW" });
    assert.equal(sampler.snapshot().vertical, -1);
    assert.equal(sampler.snapshot().interact, true, "keyboard jump must keep the contextual interaction intent");
    listeners.get("keyup")({ code: "KeyW" });
    listeners.get("keydown")({ code: "ArrowUp" });
    assert.equal(sampler.snapshot().interact, true, "the alternate keyboard jump must share the same interaction");
    listeners.get("keyup")({ code: "ArrowUp" });
    listeners.get("keydown")({ code: "KeyE" });
    assert.equal(sampler.snapshot().interact, false, "Gate panels must not introduce a separate PC interaction key");
    listeners.get("keyup")({ code: "KeyE" });
    let contextPrevented = false;
    listeners.get("pointerdown")({
        pointerType: "mouse",
        pointerId: 9,
        button: 2,
        clientX: 70,
        clientY: 75,
        preventDefault: () => (contextPrevented = true)
    });
    assert.equal(sampler.snapshot().action, true, "right click must drive the shared Action intent");
    assert.equal(sampler.snapshot().pointer.down, false, "right click must not start a Rope gesture");
    assert.equal(contextPrevented, true);
    listeners.get("pointerup")({ pointerType: "mouse", pointerId: 9, button: 2 });
    assert.equal(sampler.snapshot().action, false);
    listeners.get("pointerdown")({ pointerType: "mouse", pointerId: 10, clientX: 80, clientY: 90 });
    listeners.get("blur")();
    assert.equal(ropeReleases.length, 1, "losing window focus must synchronously release an active rope gesture");
    assert.equal(ropeReleases[0].reason, "blur");
    assert.equal(ropeReleases[0].input.pointer.down, false, "the release callback must receive cleared input");
    listeners.get("pointerup")({ pointerType: "mouse", pointerId: 10 });
    assert.equal(ropeReleases.length, 1, "blur followed by pointerup must not emit a duplicate release");

    listeners.get("pointerdown")({ pointerType: "mouse", pointerId: 11, clientX: 100, clientY: 110 });
    listeners.get("pointerup")({ pointerType: "mouse", pointerId: 11 });
    assert.equal(ropeReleases.length, 2, "a normal pointerup must flush the release before the next frame");
    assert.equal(ropeReleases[1].reason, "pointerup");

    listeners.get("pointerdown")({ pointerType: "mouse", pointerId: 12, clientX: 120, clientY: 130 });
    listeners.get("pointerleave")({ pointerType: "mouse", pointerId: 12, relatedTarget: null });
    assert.equal(ropeReleases.length, 3, "leaving the document for browser chrome must release the rope gesture");
    assert.equal(ropeReleases[2].reason, "pointer-leave");

    listeners.get("pointerdown")({ pointerType: "mouse", pointerId: 13, clientX: 140, clientY: 150 });
    documentTarget.hidden = true;
    documentListeners.get("visibilitychange")();
    assert.equal(ropeReleases.length, 4, "a hidden document must release before animation frames pause");
    assert.equal(ropeReleases[3].reason, "visibility-hidden");
    sampler.detach();
    assert.equal(listeners.size, 0);
    assert.equal(documentListeners.size, 0);

    const touchListeners = new Map();
    const captured = [];
    const surface = {
        clientWidth: 1000,
        clientHeight: 640,
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
        addEventListener: (name, fn) => touchListeners.set(name, fn),
        removeEventListener: (name) => touchListeners.delete(name),
        setPointerCapture: (id) => captured.push(id)
    };
    const touchTarget = {
        innerWidth: 1000,
        addEventListener: () => {},
        removeEventListener: () => {}
    };
    const touchRopeReleases = [];
    const touchSampler = new InputSampler(touchTarget, surface, {
        onRopeRelease: (input, reason) => touchRopeReleases.push({ input, reason })
    });
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
    assert.equal(touchRopeReleases.length, 1);
    assert.equal(touchRopeReleases[0].reason, "pointerup");
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 3, clientX: 400, clientY: 240 });
    touchListeners.get("pointercancel")({ pointerType: "touch", pointerId: 3 });
    assert.equal(touchSampler.snapshot().pointer.down, false);
    assert.equal(touchRopeReleases.length, 2);
    assert.equal(touchRopeReleases[1].reason, "pointercancel");

    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 4, clientX: 250, clientY: 590 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.horizontal, -1, "the bottom-left square must emit the same command as keyboard left");
    assert.equal(touchSnapshot.pointer.down, false, "movement buttons must not start a rope gesture");
    assert.equal(touchSnapshot.mobileControls.left, true);

    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 5, clientX: 500, clientY: 590 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.vertical, -1, "the bottom-center square must emit the same command as keyboard jump");
    assert.equal(touchSnapshot.mobileControls.jump, true);
    assert.equal(touchSnapshot.interact, true, "holding mobile jump must expose the contextual interaction intent");

    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 6, clientX: 400, clientY: 240 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.pointer.down, true, "a second finger must operate the rope while movement is held");
    assert.deepEqual(touchSnapshot.pointer, { x: 400, y: 240, down: true });

    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 4 });
    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 5 });
    assert.equal(touchRopeReleases.length, 2, "movement and jump releases must not terminate the rope gesture");
    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 6 });
    assert.equal(touchRopeReleases.length, 3, "the rope finger must remain the only release trigger");
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 7, clientX: 750, clientY: 590 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.horizontal, 1, "the bottom-right square must emit the same command as keyboard right");
    assert.equal(touchSnapshot.mobileControls.right, true);
    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 7 });
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 8, clientX: 750, clientY: 480 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.action, false, "the elevated mobile button must select an aim mode, not fire blindly");
    assert.equal(touchSnapshot.mobileControls.action, true);
    assert.equal(touchSnapshot.mobileControls.aimMode, "action");
    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 8 });
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 9, clientX: 700, clientY: 220 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.action, true, "world touch in Action Aim must drive the shared Action intent");
    assert.equal(touchSnapshot.pointer.down, false, "Action Aim must not launch the Rope");
    assert.equal(touchSnapshot.mobileControls.actionPointerDown, true);
    assert.deepEqual(touchSnapshot.pointer, { x: 700, y: 220, down: false });
    touchListeners.get("pointermove")({ pointerType: "touch", pointerId: 9, clientX: 760, clientY: 180 });
    assert.deepEqual(touchSampler.snapshot().pointer, { x: 760, y: 180, down: false });
    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 9 });
    assert.equal(touchSampler.snapshot().action, false);

    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 10, clientX: 750, clientY: 480 });
    touchListeners.get("pointerup")({ pointerType: "touch", pointerId: 10 });
    assert.equal(touchSampler.snapshot().mobileControls.aimMode, "rope");
    touchListeners.get("pointerdown")({ pointerType: "touch", pointerId: 11, clientX: 680, clientY: 210 });
    touchSnapshot = touchSampler.snapshot();
    assert.equal(touchSnapshot.pointer.down, true, "world touch in Rope Aim must preserve Rope gestures");
    assert.equal(touchSnapshot.action, false);
}
