import assert from "node:assert/strict";
import { WorldUnlockPresentation } from "../src/game/presentation/WorldUnlockPresentation.js";

function close(actual, expected, message) {
    assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: expected ${expected}, got ${actual}`);
}

export function run() {
    const routeId = "sector-01:landmark:08:route:sector-02:landmark:01";
    const world = {
        objects: [
            {
                id: `${routeId}:transit-lock`,
                kind: "access-transit-lock",
                routeLockId: routeId,
                position: { x: 1000, y: 500 }
            }
        ]
    };
    const camera = { x: 0, y: 0, zoom: 1, initialized: true };
    const presentation = new WorldUnlockPresentation();
    const event = { eventId: "event:unlock:1", eventType: "route-unlocked", routeId };
    assert.equal(
        presentation.prepare([event], { world, camera, cssWidth: 200, cssHeight: 100 }),
        true,
        "a Sector route unlock must start the reusable camera scene"
    );
    const teammatePresentation = new WorldUnlockPresentation();
    assert.equal(
        teammatePresentation.prepare([event], {
            world,
            camera: { x: 40, y: 20, zoom: 1, initialized: true },
            cssWidth: 200,
            cssHeight: 100
        }),
        true,
        "the same shared event must start the scene independently on every connected client"
    );
    let phase = presentation.advance(0.175, camera);
    assert.equal(phase.holding, true);
    close(camera.x, 450, "travel midpoint x");
    close(camera.y, 225, "travel midpoint y");
    presentation.advance(0.175, camera);
    assert.deepEqual(camera, { x: 900, y: 450, zoom: 1, initialized: true });
    presentation.advance(0.5, camera);
    phase = presentation.advance(0.175, camera);
    assert.equal(phase.holding, true);
    close(camera.x, 450, "return midpoint x");
    close(camera.y, 225, "return midpoint y");
    phase = presentation.advance(0.175, camera);
    assert.deepEqual(phase, { holding: false, released: true, focusPosition: null });
    assert.deepEqual(camera, { x: 0, y: 0, zoom: 1, initialized: true });
    assert.equal(
        presentation.prepare([event], { world, camera, cssWidth: 200, cssHeight: 100 }),
        false,
        "a repeated snapshot event must not replay the unlock scene"
    );
    assert.equal(
        presentation.prepare(
            [{ eventId: "event:ordinary-route", eventType: "route-unlocked", routeId: "intra-sector-route" }],
            { world, camera, cssWidth: 200, cssHeight: 100 }
        ),
        false,
        "a route without a transit device must not start the Sector camera scene"
    );
}
