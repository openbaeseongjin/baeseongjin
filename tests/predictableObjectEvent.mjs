import assert from "node:assert/strict";
import {
    createPredictableResolveEvent,
    createPredictableSpawnEvent,
    deserializePredictableObjectEvent,
    serializePredictableObjectEvent
} from "../src/game/network/PredictableObjectEvent.js";

export function run() {
    const spawn = createPredictableSpawnEvent({
        eventId: "event-12",
        objectId: "projectile-4",
        objectType: "enemy-projectile",
        spawnTick: 240,
        position: { x: 30, y: 50 },
        velocity: { x: -120, y: 20 },
        parameters: { radius: 6, damage: 10, ownerId: "enemy-2" }
    });
    const restoredSpawn = deserializePredictableObjectEvent(serializePredictableObjectEvent(spawn));
    assert.deepEqual(restoredSpawn, spawn);
    assert.ok(Object.isFrozen(restoredSpawn.parameters));

    const resolve = createPredictableResolveEvent({
        eventId: "event-13",
        objectId: "projectile-4",
        tick: 251,
        resolution: "rope-cut",
        position: { x: 19, y: 53 }
    });
    assert.deepEqual(deserializePredictableObjectEvent(serializePredictableObjectEvent(resolve)), resolve);

    assert.throws(() => createPredictableSpawnEvent({ ...spawn, eventId: "", spawnTick: 0 }), /eventId/);
    assert.throws(() => createPredictableSpawnEvent({ ...spawn, spawnTick: -1 }), /spawnTick/);
    assert.throws(
        () => createPredictableSpawnEvent({ ...spawn, spawnTick: 0, velocity: { x: Infinity, y: 0 } }),
        /velocity/
    );
    assert.throws(
        () => createPredictableSpawnEvent({ ...spawn, spawnTick: 0, parameters: { damage: Number.NaN } }),
        /finite/
    );
    assert.throws(() => deserializePredictableObjectEvent('{"protocolVersion":1,"eventType":"unknown"}'), /event type/);
}
