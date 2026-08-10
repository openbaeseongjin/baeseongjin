import assert from "node:assert/strict";
import {
    createPredictableResolveEvent,
    createPredictableSpawnEvent
} from "../src/game/network/PredictableObjectEvent.js";
import { PredictableProjectileStore } from "../src/game/runtime/PredictableProjectileStore.js";

export function run() {
    const store = new PredictableProjectileStore();
    const enemySpawn = createPredictableSpawnEvent({
        eventId: "event-1",
        objectId: "enemy-projectile-1",
        objectType: "enemy-projectile",
        spawnTick: 10,
        position: { x: 0, y: 0 },
        velocity: { x: 120, y: 0 },
        parameters: { radius: 7, damage: 20, ownerId: "enemy-1", targetId: "player-1" }
    });
    store.apply([enemySpawn], 12, { enemies: [] });
    assert.equal(store.snapshot().enemyProjectiles[0].position.x, 2, "late spawn must catch up by server ticks");
    store.update(1 / 120, { enemies: [] });
    assert.equal(store.snapshot().enemyProjectiles[0].position.x, 3);

    const playerSpawn = createPredictableSpawnEvent({
        eventId: "event-2",
        objectId: "projectile-1",
        objectType: "player-projectile",
        spawnTick: 12,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        parameters: { radius: 5, damage: 10, speed: 520, ownerId: "player-1", targetId: "enemy-1" }
    });
    store.apply([playerSpawn], 12, { enemies: [{ id: "enemy-1", position: { x: 100, y: 0 } }] });
    store.update(1 / 120, { enemies: [{ id: "enemy-1", position: { x: 100, y: 0 } }] });
    assert.ok(store.snapshot().projectiles[0].position.x > 4, "player projectile must home toward its target");

    store.apply(
        [
            createPredictableResolveEvent({
                eventId: "event-3",
                objectId: "projectile-1",
                tick: 13,
                resolution: "enemy-hit",
                position: { x: 5, y: 0 }
            })
        ],
        13,
        { enemies: [] }
    );
    assert.equal(store.snapshot().projectiles.length, 0);
}
