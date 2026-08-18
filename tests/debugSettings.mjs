import assert from "node:assert/strict";
import {
    DebugSettings,
    DEFAULT_DEBUG_SETTINGS,
    normalizeDebugSettings,
    validateDebugAugmentIds
} from "../src/game/metrics/DebugSettings.js";
import {
    ROPE_CONFIG,
    normalizeRopeTuningOverride,
    resolveEffectiveRopeConfig,
    resolveEffectiveRopeDisabledSeconds,
    ropeHookFlightSeconds,
    ropeHookReach
} from "../src/game/config.js";

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
        startAreaId: null,
        ropeTuning: null,
        debugAugmentIds: []
    });
    assert.deepEqual(
        normalizeDebugSettings({
            version: 1,
            metrics: false,
            startAreaId: null,
            ropeTuning: {
                hookSpeed: 1600,
                hookReloadSeconds: 8,
                hookFlightRatio: { numerator: 2, denominator: Number.NaN },
                handOffset: { x: 20, y: -12 },
                ropeDisabledSeconds: 1.2
            }
        }).ropeTuning,
        {
            hookSpeed: 1600,
            hookFlightRatio: { numerator: 2 },
            handOffset: { x: 20, y: -12 },
            ropeDisabledSeconds: 1.2
        },
        "invalid fields must fall back independently without discarding valid Rope values"
    );

    const clamped = resolveEffectiveRopeConfig({
        hookSpeed: 9999,
        hookFlightRatio: { numerator: -1, denominator: 99 },
        handOffset: { x: -20, y: 100 }
    });
    assert.equal(clamped.hookSpeed, 2400);
    assert.deepEqual(clamped.hookFlightRatio, { numerator: 1, denominator: 10 });
    assert.deepEqual(clamped.handOffset, { x: 0, y: 32 });
    assert.equal(resolveEffectiveRopeDisabledSeconds({ ropeDisabledSeconds: 99 }), 3);
    assert.deepEqual(resolveEffectiveRopeConfig(null), ROPE_CONFIG);
    assert.equal(ropeHookFlightSeconds(clamped), 0.1);
    assert.equal(ropeHookReach(clamped), 240);
    assert.equal(normalizeRopeTuningOverride({ hookSpeed: ROPE_CONFIG.hookSpeed }), null);

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
    settings.setRopeTuning({ hookSpeed: 1800, handOffset: { x: 18 }, ropeDisabledSeconds: 1.5 });
    assert.deepEqual(settings.snapshot().ropeTuning, {
        hookSpeed: 1800,
        handOffset: { x: 18 },
        ropeDisabledSeconds: 1.5
    });
    settings.setDebugAugmentIds(["long-rope", "direction-dash", "explosive-trail", "fast-reuse"]);
    assert.deepEqual(settings.snapshot().debugAugmentIds, [
        "long-rope",
        "direction-dash",
        "explosive-trail",
        "fast-reuse"
    ]);
    assert.equal(validateDebugAugmentIds(["direction-dash", "dash-strike"]).valid, false);
    assert.match(validateDebugAugmentIds(["explosive-trail"]).error, /Action을 먼저/);
    assert.match(validateDebugAugmentIds(["direction-dash", "end-wave"]).error, /호환되지/);
    assert.match(validateDebugAugmentIds(["long-rope", "long-rope"]).error, /중복/);
    assert.match(
        validateDebugAugmentIds([
            "fast-launch",
            "long-rope",
            "fast-recover",
            "release-propulsion",
            "electrified-rope",
            "collision-explosion",
            "direction-dash"
        ]).error,
        /최대 6장/
    );
    assert.throws(() => settings.setMetrics("yes"), /boolean/);
    assert.throws(() => settings.setStartAreaId(""), /non-empty/);

    const reloaded = new DebugSettings({ storage });
    assert.deepEqual(reloaded.snapshot(), {
        version: 1,
        metrics: true,
        startAreaId: null,
        ropeTuning: { hookSpeed: 1800, handOffset: { x: 18 }, ropeDisabledSeconds: 1.5 },
        debugAugmentIds: ["long-rope", "direction-dash", "explosive-trail", "fast-reuse"]
    });
    assert.deepEqual(
        normalizeDebugSettings({ version: 1, metrics: false, startAreaId: null, ropeTuning: null }),
        {
            version: 1,
            metrics: false,
            startAreaId: null,
            ropeTuning: null,
            debugAugmentIds: []
        },
        "stored v1 settings from before debug loadouts migrate to an empty loadout"
    );
    assert.deepEqual(
        normalizeDebugSettings({
            version: 1,
            metrics: false,
            startAreaId: null,
            ropeTuning: null,
            debugAugmentIds: ["direction-dash", "dash-strike"]
        }).debugAugmentIds,
        [],
        "an incompatible stored loadout falls back without corrupting other settings"
    );
    settings.setRopeTuning(null);
    assert.equal(settings.snapshot().ropeTuning, null);
    settings.setDebugAugmentIds([]);
    assert.equal(seen.length, 8, "every change notifies subscribers");

    const catalogBound = new DebugSettings({ storage: memoryStorage(), validAreaIds: ["sector-01-01"] });
    catalogBound.setStartAreaId("sector-01-01");
    assert.throws(() => catalogBound.setStartAreaId("missing-area"), /unknown debug start area/);
}
