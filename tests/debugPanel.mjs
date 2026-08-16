import assert from "node:assert/strict";
import { DebugSettings } from "../src/game/metrics/DebugSettings.js";
import { DebugPanel, DEBUG_PANEL_LONG_PRESS_MS } from "../src/game/ui/DebugPanel.js";

class FakeEventTarget {
    constructor() {
        this.listeners = new Map();
    }

    addEventListener(type, listener) {
        const listeners = this.listeners.get(type) ?? new Set();
        listeners.add(listener);
        this.listeners.set(type, listeners);
    }

    removeEventListener(type, listener) {
        this.listeners.get(type)?.delete(listener);
    }

    dispatch(type, event = {}) {
        event.target ??= this;
        for (const listener of this.listeners.get(type) ?? []) listener(event);
    }
}

class FakeElement extends FakeEventTarget {
    constructor() {
        super();
        this.hidden = false;
        this.checked = false;
        this.value = "";
        this.options = [];
        this.focused = false;
    }

    append(option) {
        this.options.push(option);
    }

    focus() {
        this.focused = true;
    }
}

function memoryStorage(initialValue = null) {
    const store = new Map(initialValue === null ? [] : [["baeseongjin.debug-settings.v1", initialValue]]);
    return {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, value)
    };
}

export function run() {
    const closeButton = new FakeElement();
    const metricsInput = new FakeElement();
    const startAreaSelect = new FakeElement();
    const root = new FakeElement();
    root.hidden = true;
    root.querySelector = (selector) =>
        ({
            "[data-debug-close]": closeButton,
            "[data-debug-metrics]": metricsInput,
            "[data-debug-start-area]": startAreaSelect
        })[selector] ?? null;
    const trigger = new FakeElement();
    const documentTarget = new FakeEventTarget();
    documentTarget.hidden = false;
    documentTarget.activeElement = trigger;
    documentTarget.createElement = () => new FakeElement();
    const windowTarget = new FakeEventTarget();
    let now = 0;
    const timers = [];
    windowTarget.performance = { now: () => now };
    windowTarget.setTimeout = (callback) => timers.push(callback);

    const areaIds = ["sector-01-01", "sector-03-02"];
    const staleStorage = memoryStorage(JSON.stringify({ version: 1, metrics: true, startAreaId: "retired-area" }));
    const settings = new DebugSettings({ storage: staleStorage, validAreaIds: areaIds });
    assert.equal(settings.snapshot().startAreaId, null, "a stale authored area must be cleared when settings load");
    assert.throws(() => settings.setStartAreaId("retired-area"), /unknown debug start area/);

    const panel = new DebugPanel({ root, trigger, settings, areaIds, documentTarget, windowTarget });
    assert.equal(panel.attach(), true);
    assert.deepEqual(
        startAreaSelect.options.map(({ value }) => value),
        areaIds
    );

    trigger.dispatch("pointerdown", { pointerId: 11, button: 0 });
    now = DEBUG_PANEL_LONG_PRESS_MS + 1;
    documentTarget.dispatch("pointerup", { pointerId: 12 });
    assert.equal(root.hidden, true, "a different pointer must not complete the settings-button hold");
    documentTarget.dispatch("pointerup", { pointerId: 11 });
    assert.equal(root.hidden, false, "the pointer that started the hold must open the debug panel");
    let clickPrevented = false;
    trigger.dispatch("click", {
        preventDefault: () => (clickPrevented = true),
        stopPropagation: () => {}
    });
    assert.equal(clickPrevented, true, "the synthetic click after a long press must not open normal settings");
    timers.splice(0).forEach((callback) => callback());
    closeButton.dispatch("click");
    assert.equal(root.hidden, true);

    now = 2000;
    trigger.dispatch("pointerdown", { pointerId: 21, button: 0 });
    now += DEBUG_PANEL_LONG_PRESS_MS + 1;
    trigger.dispatch("pointerleave", { pointerId: 21 });
    documentTarget.dispatch("pointerup", { pointerId: 21 });
    assert.equal(root.hidden, true, "leaving the settings button must cancel a long press");

    now = 4000;
    trigger.dispatch("pointerdown", { pointerId: 31, button: 0 });
    documentTarget.hidden = true;
    documentTarget.dispatch("visibilitychange");
    documentTarget.hidden = false;
    now += DEBUG_PANEL_LONG_PRESS_MS + 1;
    documentTarget.dispatch("pointerup", { pointerId: 31 });
    assert.equal(root.hidden, true, "a hidden page must clear the pending long press");

    now = 6000;
    trigger.dispatch("pointerdown", { pointerId: 41, button: 0 });
    windowTarget.dispatch("blur");
    now += DEBUG_PANEL_LONG_PRESS_MS + 1;
    documentTarget.dispatch("pointerup", { pointerId: 41 });
    assert.equal(root.hidden, true, "window blur must clear the pending long press");

    trigger.dispatch("pointerdown", { pointerId: 51, button: 2 });
    now += DEBUG_PANEL_LONG_PRESS_MS + 1;
    documentTarget.dispatch("pointerup", { pointerId: 51 });
    assert.equal(root.hidden, true, "a non-primary mouse button must not start the debug gesture");
    assert.equal(panel.detach(), true);
}
