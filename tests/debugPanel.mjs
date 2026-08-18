import assert from "node:assert/strict";
import { ROPE_TUNING_FIELDS } from "../src/game/config.js";
import { DebugSettings } from "../src/game/metrics/DebugSettings.js";
import { DebugPanel, DEBUG_PANEL_HOLD_MS } from "../src/game/ui/DebugPanel.js";

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

class FakeClassList {
    constructor() {
        this.classes = new Set();
    }

    add(name) {
        this.classes.add(name);
    }

    remove(name) {
        this.classes.delete(name);
    }

    contains(name) {
        return this.classes.has(name);
    }
}

class FakeElement extends FakeEventTarget {
    constructor() {
        super();
        this.checked = false;
        this.value = "";
        this.options = [];
        this.classList = new FakeClassList();
        this.dataset = {};
        this.textContent = "";
        this.disabled = false;
        this.min = "";
        this.max = "";
        this.step = "";
    }

    append(option) {
        this.options.push(option);
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
    const metricsInput = new FakeElement();
    const startAreaSelect = new FakeElement();
    const applyButton = new FakeElement();
    const ropeFieldset = new FakeElement();
    const ropeResetButton = new FakeElement();
    const ropeReachOutput = new FakeElement();
    const ropeFlightOutput = new FakeElement();
    const ropeModeOutput = new FakeElement();
    const augmentFieldset = new FakeElement();
    const augmentResetButton = new FakeElement();
    const augmentModeOutput = new FakeElement();
    const augmentSelects = Array.from({ length: 6 }, () => {
        const select = new FakeElement();
        const empty = new FakeElement();
        empty.value = "";
        empty.textContent = "비어 있음";
        select.append(empty);
        return select;
    });
    const ropeInputs = ROPE_TUNING_FIELDS.map(({ path }) => {
        const input = new FakeElement();
        input.dataset.debugRopeField = path;
        return input;
    });
    const documentTarget = new FakeEventTarget();
    documentTarget.createElement = () => new FakeElement();
    documentTarget.querySelector = (selector) =>
        ({
            "[data-debug-metrics]": metricsInput,
            "[data-debug-start-area]": startAreaSelect,
            "[data-debug-apply]": applyButton,
            "[data-debug-rope-tuning]": ropeFieldset,
            "[data-debug-rope-reset]": ropeResetButton,
            "[data-debug-rope-reach]": ropeReachOutput,
            "[data-debug-rope-flight]": ropeFlightOutput,
            "[data-debug-rope-mode]": ropeModeOutput,
            "[data-debug-augment-loadout]": augmentFieldset,
            "[data-debug-augment-reset]": augmentResetButton,
            "[data-debug-augment-mode]": augmentModeOutput
        })[selector] ?? null;
    documentTarget.querySelectorAll = (selector) =>
        selector === "[data-debug-rope-field]"
            ? ropeInputs
            : selector === "[data-debug-augment-slot]"
              ? augmentSelects
              : [];
    const trigger = new FakeElement();
    const windowTarget = new FakeEventTarget();
    let nextTimerId = 1;
    const timers = new Map();
    windowTarget.setTimeout = (callback) => {
        const id = nextTimerId;
        nextTimerId += 1;
        timers.set(id, callback);
        return id;
    };
    windowTarget.clearTimeout = (id) => timers.delete(id);

    const areaIds = ["sector-01-01", "sector-03-02"];
    const staleStorage = memoryStorage(JSON.stringify({ version: 1, metrics: true, startAreaId: "retired-area" }));
    const settings = new DebugSettings({ storage: staleStorage, validAreaIds: areaIds });
    assert.equal(settings.snapshot().startAreaId, null, "a stale authored area must be cleared when settings load");
    assert.throws(() => settings.setStartAreaId("retired-area"), /unknown debug start area/);

    let activated = 0;
    let applied = 0;
    const panel = new DebugPanel({ trigger, settings, areaIds, documentTarget, windowTarget });
    panel.onActivate = () => (activated += 1);
    panel.onApply = () => (applied += 1);
    let now = 0;
    windowTarget.performance = { now: () => now };
    assert.equal(panel.attach(), true);
    assert.deepEqual(
        startAreaSelect.options.map(({ value }) => value),
        areaIds
    );
    assert.equal(metricsInput.checked, true, "the stored metrics toggle must render into the panel");
    assert.equal(startAreaSelect.value, "", "the default start area must render as the empty option");
    assert.equal(ropeInputs.find(({ dataset }) => dataset.debugRopeField === "hookSpeed").value, "1200");
    assert.equal(ropeFlightOutput.textContent, "0.333초");
    assert.equal(ropeReachOutput.textContent, "400.0px");
    assert.match(ropeModeOutput.textContent, /새 Run으로 즉시 재시작/);
    assert.equal(ropeFieldset.disabled, false);
    assert.equal(ropeInputs[0].min, String(ROPE_TUNING_FIELDS[0].min));
    assert.equal(augmentSelects.length, 6);
    assert.equal(augmentSelects[0].options.length, 23, "each slot contains empty plus all 22 Catalog cards");
    assert.match(augmentSelects[0].options[1].textContent, /^\[.+\] .+/);
    assert.equal(augmentSelects[0].disabled, false);
    assert.equal(augmentSelects[1].disabled, true, "only the next ordered slot is enabled");
    assert.match(augmentModeOutput.textContent, /선택 0\/6/);

    trigger.dispatch("pointerdown", { pointerId: 11, pointerType: "mouse", button: 0 });
    assert.equal(
        trigger.classList.contains("settings-trigger--holding"),
        true,
        "holding the settings button must show the hold indicator"
    );
    assert.equal(timers.size, 1, "a primary press must arm the hold timer");
    for (const callback of [...timers.values()]) callback();
    timers.clear();
    assert.equal(activated, 1, "the hold timer must activate debug mode");
    assert.equal(
        trigger.classList.contains("settings-trigger--holding"),
        false,
        "activation must clear the hold indicator"
    );
    now += 50;
    let clickPrevented = false;
    trigger.dispatch("click", {
        preventDefault: () => (clickPrevented = true),
        stopPropagation: () => {}
    });
    assert.equal(clickPrevented, true, "the click right after a hold must not open normal settings");
    now += 1000;
    let laterClickPrevented = false;
    trigger.dispatch("click", {
        preventDefault: () => (laterClickPrevented = true),
        stopPropagation: () => {}
    });
    assert.equal(laterClickPrevented, false, "a later normal click must pass through to the settings menu");

    trigger.dispatch("pointerdown", { pointerId: 21, pointerType: "mouse", button: 0 });
    trigger.dispatch("pointerleave", { pointerId: 21 });
    assert.equal(timers.size, 0, "leaving the settings button must cancel the hold");
    assert.equal(
        trigger.classList.contains("settings-trigger--holding"),
        false,
        "cancelling must clear the hold indicator"
    );

    trigger.dispatch("pointerdown", { pointerId: 31, pointerType: "mouse", button: 2 });
    assert.equal(timers.size, 0, "a non-primary mouse button must not start the debug gesture");

    trigger.dispatch("pointerdown", { pointerId: 41, pointerType: "mouse", button: 0 });
    trigger.dispatch("pointercancel", { pointerId: 41 });
    assert.equal(timers.size, 0, "a pointer cancel must abort the hold");

    metricsInput.checked = false;
    metricsInput.dispatch("change");
    assert.equal(settings.snapshot().metrics, false, "the panel toggle must persist into settings");
    startAreaSelect.value = "sector-03-02";
    startAreaSelect.dispatch("change");
    assert.equal(settings.snapshot().startAreaId, "sector-03-02", "the start map select must persist into settings");
    startAreaSelect.value = "";
    startAreaSelect.dispatch("change");
    assert.equal(settings.snapshot().startAreaId, null);

    augmentSelects[0].value = "direction-dash";
    augmentSelects[0].dispatch("change");
    assert.deepEqual(settings.snapshot().debugAugmentIds, ["direction-dash"]);
    assert.equal(augmentSelects[1].disabled, false);
    const incompatibleAction = augmentSelects[1].options.find(({ value }) => value === "dash-strike");
    const compatibleSignature = augmentSelects[1].options.find(({ value }) => value === "explosive-trail");
    assert.equal(incompatibleAction.disabled, true, "a second base Action must be explained by a disabled option");
    assert.equal(compatibleSignature.disabled, false);
    augmentSelects[1].value = "explosive-trail";
    augmentSelects[1].dispatch("change");
    augmentSelects[2].value = "fast-reuse";
    augmentSelects[2].dispatch("change");
    assert.deepEqual(settings.snapshot().debugAugmentIds, ["direction-dash", "explosive-trail", "fast-reuse"]);
    augmentSelects[1].value = "";
    augmentSelects[1].dispatch("change");
    assert.deepEqual(
        settings.snapshot().debugAugmentIds,
        ["direction-dash", "fast-reuse"],
        "clearing a slot keeps later cards that remain compatible and compacts their order"
    );
    augmentResetButton.dispatch("click");
    assert.deepEqual(settings.snapshot().debugAugmentIds, []);

    const hookSpeedInput = ropeInputs.find(({ dataset }) => dataset.debugRopeField === "hookSpeed");
    hookSpeedInput.value = "1800";
    hookSpeedInput.dispatch("input");
    assert.equal(ropeReachOutput.textContent, "600.0px", "editing must update derived values before commit");
    hookSpeedInput.dispatch("change");
    assert.deepEqual(settings.snapshot().ropeTuning, { hookSpeed: 1800 });
    ropeResetButton.dispatch("click");
    assert.equal(settings.snapshot().ropeTuning, null);
    assert.equal(hookSpeedInput.value, "1200");

    panel.setRopeTuningEnabled(false);
    assert.equal(ropeFieldset.disabled, true);
    assert.match(ropeModeOutput.textContent, /멀티 세션에서는 비활성/);
    assert.equal(augmentFieldset.disabled, true);
    assert.equal(applyButton.disabled, true);
    assert.match(augmentModeOutput.textContent, /공유 증강 loadout 프로토콜 미구현/);
    applyButton.dispatch("click");
    assert.equal(applied, 0, "multiplayer mode cannot apply local-only debug settings");
    panel.setRopeTuningEnabled(true);
    assert.equal(ropeFieldset.disabled, false);
    assert.equal(augmentFieldset.disabled, false);
    assert.equal(applyButton.disabled, false);

    hookSpeedInput.value = "1700";
    applyButton.dispatch("click");
    assert.equal(applied, 1, "the apply button must notify the app to apply debug settings immediately");
    assert.deepEqual(
        settings.snapshot().ropeTuning,
        { hookSpeed: 1700 },
        "Apply must commit the current input even when change has not fired yet"
    );

    assert.equal(panel.detach(), true);
    assert.equal(panel.detach(), false, "detach must be idempotent");
    assert.equal(panel.attach(), true, "a detached debug panel must support reattachment");
    assert.deepEqual(
        startAreaSelect.options.map(({ value }) => value),
        areaIds,
        "reattaching must not duplicate the generated start-area options"
    );
    assert.equal(panel.detach(), true);
}
