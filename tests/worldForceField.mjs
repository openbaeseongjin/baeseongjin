import assert from "node:assert/strict";
import { evaluateWindZone, sampleWorldForce, windOccludingSurfaces } from "../src/game/world/WorldForceField.js";

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

    const falloff = Object.freeze({
        ...pulsed,
        id: "wind:falloff",
        mode: "continuous",
        strength: 100,
        falloff: 40
    });
    assert.deepEqual(
        sampleWorldForce([falloff], { x: 0, y: 0 }, 0),
        { x: 100, y: 0, activeZones: [{ id: "wind:falloff", phase: "active", multiplier: 1, phaseTime: 0 }] },
        "a falloff region must not reduce force at the zone centre"
    );
    const nearEdge = sampleWorldForce([falloff], { x: -40, y: 0 }, 0);
    assert.ok(
        nearEdge.x < 100 && nearEdge.x > 0,
        `a point inside the falloff band must receive reduced force, got ${nearEdge.x}`
    );

    const occludedZone = Object.freeze({
        id: "wind:occluded",
        bounds: Object.freeze({ x: -100, y: 0, width: 200, height: 200 }),
        direction: Object.freeze({ x: 1, y: 0 }),
        mode: "continuous",
        strength: 100
    });
    const wall = Object.freeze({
        vertices: Object.freeze([
            { x: -10, y: -100 },
            { x: -10, y: 100 },
            { x: 10, y: 100 },
            { x: 10, y: -100 }
        ])
    });
    const shadowed = sampleWorldForce([occludedZone], { x: 50, y: 0 }, 0, { occluders: [wall] });
    const unshadowed = sampleWorldForce([occludedZone], { x: 50, y: 0 }, 0);
    assert.equal(unshadowed.x, 100, "an unoccluded point must receive full force");
    assert.ok(
        shadowed.x < unshadowed.x,
        `a point behind an occluder must receive reduced wind force, got ${shadowed.x}`
    );

    const surfaces = [
        { id: "platform", oneWay: true, collision: undefined },
        { id: "wall", oneWay: false, collision: undefined },
        { id: "grapple", oneWay: false, collision: false },
        { id: "wind-wall", oneWay: false, collision: false, windOcclusion: true }
    ];
    assert.deepEqual(
        windOccludingSurfaces(surfaces).map(({ id }) => id),
        ["wall", "wind-wall"],
        "wind occluders must include solid non-one-way surfaces and explicitly flagged wind walls"
    );
}
