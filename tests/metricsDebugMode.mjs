import assert from "node:assert/strict";
import { isMetricsPanelEnabled } from "../src/game/metrics/MetricsDebugMode.js";

export function run() {
    assert.equal(isMetricsPanelEnabled(""), false);
    assert.equal(isMetricsPanelEnabled("?metrics=0"), false);
    assert.equal(isMetricsPanelEnabled("?metrics=1"), true);
    assert.equal(isMetricsPanelEnabled("?foo=bar&metrics=1"), true);
}
