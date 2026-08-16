import assert from "node:assert/strict";
import { DebugSettings, DEFAULT_DEBUG_SETTINGS, normalizeDebugSettings } from "../src/game/metrics/DebugSettings.js";

function memoryStorage() {
    const store = new Map();
    return {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, value)
    };
}

export function run() {
    assert.deepEqual(normalizeDebugSettings(null), DEFAULT_DEBUG_SETTINGS);
    assert.deepEqual(normalizeDebugSettings({ version: 1, metrics: "yes" }), DEFAULT_DEBUG_SETTINGS);
    assert.deepEqual(normalizeDebugSettings({ version: 1, metrics: true, startAreaId: "" }), DEFAULT_DEBUG_SETTINGS);
    assert.deepEqual(normalizeDebugSettings({ version: 1, metrics: true, startAreaId: null }), {
        version: 1,
        metrics: true,
        startAreaId: null
    });

    const storage = memoryStorage();
    const settings = new DebugSettings({ storage });
    assert.deepEqual(settings.snapshot(), DEFAULT_DEBUG_SETTINGS);

    const seen = [];
    settings.subscribe((value) => seen.push(value));
    assert.deepEqual(seen, [DEFAULT_DEBUG_SETTINGS]);

    settings.setMetrics(true);
    assert.equal(settings.snapshot().metrics, true);
    settings.setStartAreaId("sector-03-02");
    assert.equal(settings.snapshot().startAreaId, "sector-03-02");
    settings.setStartAreaId(null);
    assert.equal(settings.snapshot().startAreaId, null);
    assert.throws(() => settings.setMetrics("yes"), /boolean/);
    assert.throws(() => settings.setStartAreaId(""), /non-empty/);

    const reloaded = new DebugSettings({ storage });
    assert.deepEqual(reloaded.snapshot(), { version: 1, metrics: true, startAreaId: null });
    assert.equal(seen.length, 4, "every change notifies subscribers");
}
