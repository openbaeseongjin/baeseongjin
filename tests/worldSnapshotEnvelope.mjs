import assert from "node:assert/strict";
import { createPredictableSpawnEvent } from "../src/game/network/PredictableObjectEvent.js";
import {
    createWorldSnapshotEnvelope,
    deserializeWorldSnapshotEnvelope,
    serializeWorldSnapshotEnvelope
} from "../src/game/network/WorldSnapshotEnvelope.js";

function snapshot(overrides = {}) {
    return createWorldSnapshotEnvelope({
        serverTick: 240,
        worldSeed: 20260810,
        worldRevision: "world-v1",
        acknowledgements: { "player-b": 3, "player-a": 8 },
        state: { players: [{ id: "player-a", health: 80 }], enemies: [] },
        events: [
            createPredictableSpawnEvent({
                eventId: "event-2",
                objectId: "projectile-1",
                objectType: "enemy-projectile",
                spawnTick: 239,
                position: { x: 20, y: 30 },
                velocity: { x: 100, y: 0 },
                parameters: { damage: 10 }
            }),
            { eventId: "event-1", tick: 238, eventType: "player-hit", playerId: "player-a" }
        ],
        ...overrides
    });
}

export function run() {
    const original = snapshot();
    assert.deepEqual(Object.keys(original.acknowledgements), ["player-a", "player-b"]);
    assert.deepEqual(
        original.events.map(({ eventId }) => eventId),
        ["event-1", "event-2"]
    );
    const restored = deserializeWorldSnapshotEnvelope(serializeWorldSnapshotEnvelope(original));
    assert.deepEqual(restored, original);
    assert.ok(Object.isFrozen(restored.state.players) && Object.isFrozen(restored.events[0]));

    assert.throws(() => snapshot({ acknowledgements: { player: -1 } }), /sequence/);
    assert.throws(
        () =>
            snapshot({
                events: [
                    { eventId: "same", tick: 1 },
                    { eventId: "same", tick: 2 }
                ]
            }),
        /duplicate eventId/
    );
    assert.throws(() => snapshot({ state: { projectiles: [] } }), /spawn and resolve events/);
    assert.throws(() => snapshot({ state: { enemies: [{ health: Number.NaN }] } }), /finite/);
    assert.throws(() => deserializeWorldSnapshotEnvelope('{"protocolVersion":2,"serverTick":0}'), /unsupported/);
}
