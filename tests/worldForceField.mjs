import assert from "node:assert/strict";
import { evaluateWindZone, sampleWorldForce } from "../src/game/world/WorldForceField.js";

const pulsed = Object.freeze({
    id: "wind:pulsed",
    bounds: Object.freeze({ x: -50, y: -100, width: 100, height: 200 }),
    direction: Object.freeze({ x: 2, y: 0 }),
    mode: "pulsed",
    strength: 300,
    cycle: Object.freeze({ lull: 1, warning: 0.5, active: 2, decay: 0.5 })
});

export function run() {
    assert.equal(evaluateWindZone(pulsed, 0.5).phase, "lull");
    assert.equal(evaluateWindZone(pulsed, 1.25).phase, "warning");
    assert.equal(evaluateWindZone(pulsed, 2).phase, "active");
    assert.equal(evaluateWindZone(pulsed, 3.75).phase, "decay");
    assert.deepEqual(sampleWorldForce([pulsed], { x: 500, y: 0 }, 2), {
        x: 0,
        y: 0,
        activeZones: []
    });
    assert.deepEqual(sampleWorldForce([pulsed], { x: 0, y: 0 }, 2), {
        x: 300,
        y: 0,
        activeZones: [{ id: "wind:pulsed", phase: "active", multiplier: 1, phaseTime: 0.5 }]
    });
    assert.deepEqual(
        sampleWorldForce([pulsed], { x: 0, y: 0 }, 6),
        sampleWorldForce([pulsed], { x: 0, y: 0 }, 2),
        "pulsed wind must be deterministic across complete cycles"
    );
}
