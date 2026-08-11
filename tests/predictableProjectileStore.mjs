import assert from "node:assert/strict";
import {
    createPredictableResolveEvent,
    createPredictableSpawnEvent
} from "../src/game/network/PredictableObjectEvent.js";
import { PredictableProjectileStore } from "../src/game/runtime/PredictableProjectileStore.js";
import { ClientCombatFeedback } from "../src/game/combat/ClientCombatFeedback.js";
import { SimulationDrivenObject } from "../src/game/objects/SimulationDrivenObject.js";

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
    assert.ok([...store.objects.values()][0] instanceof SimulationDrivenObject);
    assert.equal(store.snapshot().enemyProjectiles[0].position.x, 2, "late spawn must catch up by server ticks");
    store.update(1 / 120, { enemies: [] });
    assert.equal(store.snapshot().enemyProjectiles[0].position.x, 3);

    const enemyHitStore = new PredictableProjectileStore();
    enemyHitStore.apply([enemySpawn], 10, { enemies: [] });
    const localPlayer = {
        id: "player-1",
        position: { x: 0, y: 0 },
        radius: 18,
        health: 100,
        lifeState: "active",
        hitInvulnerabilityRemaining: 0,
        rope: { isAttached: false, anchor: null }
    };
    const predictedPlayerHit = enemyHitStore.update(0, { enemies: [], localPlayer }, 20);
    assert.equal(predictedPlayerHit[0].resolution, "player-hit", "victim client must predict its own hit");
    assert.equal(predictedPlayerHit[0].projectileId, "enemy-projectile-1");
    assert.equal(enemyHitStore.snapshot().enemyProjectiles.length, 0);
    const confirmedPlayerHit = createPredictableResolveEvent({
        eventId: "event-player-hit",
        objectId: "enemy-projectile-1",
        tick: 20,
        resolution: "player-hit",
        position: { x: 0, y: 0 },
        parameters: { damage: 20 }
    });
    assert.deepEqual(
        enemyHitStore.apply([confirmedPlayerHit], 20, { enemies: [] }),
        [],
        "authority must not replay victim-predicted feedback"
    );

    const rejectedImpactStore = new PredictableProjectileStore();
    rejectedImpactStore.apply([enemySpawn], 10, { enemies: [] });
    const rejectedImpact = rejectedImpactStore.update(0, { enemies: [], localPlayer }, 20)[0];
    assert.equal(
        rejectedImpactStore.snapshot().enemyProjectiles.length,
        0,
        "a locally claimed projectile must stay hidden while its receipt is pending"
    );
    rejectedImpactStore.applyImpactReceipts([
        { projectileId: rejectedImpact.projectileId, accepted: false, reason: "trajectory-mismatch" }
    ]);
    assert.equal(
        rejectedImpactStore.snapshot().enemyProjectiles.length,
        1,
        "a rejected impact claim must restore the still-simulating projectile"
    );
    assert.equal(rejectedImpactStore.locallyResolvedObjectIds.size, 0);
    assert.equal(rejectedImpactStore.metrics().predictionCancellations, 1);

    const burstStore = new PredictableProjectileStore();
    const secondEnemySpawn = createPredictableSpawnEvent({
        eventId: "event-burst-2",
        objectId: "enemy-projectile-2",
        objectType: "enemy-projectile",
        spawnTick: 10,
        position: { x: 0, y: 0 },
        velocity: { x: 120, y: 0 },
        parameters: { radius: 7, damage: 20, ownerId: "enemy-2", targetId: "player-1" }
    });
    burstStore.apply([enemySpawn, secondEnemySpawn], 10, { enemies: [] });
    const burstHits = burstStore.update(0, { enemies: [], localPlayer }, 20);
    assert.equal(burstHits.length, 1, "one client tick may claim only one local player impact");
    assert.equal(
        burstStore.snapshot().enemyProjectiles.length,
        1,
        "unclaimed projectiles must remain available after local invulnerability starts"
    );

    const ropeCutStore = new PredictableProjectileStore();
    ropeCutStore.apply([enemySpawn], 10, { enemies: [] });
    const predictedRopeCut = ropeCutStore.update(0, {
        enemies: [],
        localPlayer: {
            ...localPlayer,
            rope: { isAttached: true, anchor: { x: 0, y: -100 } }
        }
    });
    assert.equal(predictedRopeCut[0].resolution, "rope-cut", "rope collision must win over body collision");

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

    const resolveEvent = createPredictableResolveEvent({
        eventId: "event-3",
        objectId: "projectile-1",
        tick: 13,
        resolution: "enemy-hit",
        position: { x: 5, y: 0 },
        parameters: { damage: 10 }
    });
    store.apply([resolveEvent], 13, { enemies: [] });
    assert.equal(store.snapshot().projectiles.length, 0);

    const feedback = new ClientCombatFeedback();
    feedback.apply([resolveEvent]);
    assert.ok(feedback.snapshot().combatEffects.length > 0, "a resolve event must create local client effects");
    assert.ok(feedback.snapshot().impact, "a resolve event must create local client impact feedback");
    feedback.update(1);
    assert.equal(feedback.snapshot().combatEffects.length, 0, "client effects must expire on the client clock");
    assert.equal(feedback.snapshot().impact, null);

    const predictedStore = new PredictableProjectileStore();
    const predictedSpawn = {
        eventType: "predicted-spawn",
        predictionId: "player-1:20",
        tick: 20,
        objectType: "player-projectile",
        ownerId: "player-1",
        targetId: "enemy-1",
        radius: 5,
        damage: 10,
        speed: 520,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 }
    };
    predictedStore.predict([predictedSpawn]);
    assert.equal(predictedStore.snapshot().projectiles.length, 1, "local fire must appear before server spawn");
    const confirmedSpawn = createPredictableSpawnEvent({
        eventId: "event-4",
        objectId: "projectile-server-1",
        objectType: "player-projectile",
        spawnTick: 20,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        parameters: {
            predictionId: "player-1:server-20",
            radius: 5,
            damage: 10,
            speed: 520,
            ownerId: "player-1",
            targetId: "enemy-1"
        }
    });
    predictedStore.apply([confirmedSpawn], 20, { enemies: [] });
    assert.equal(
        predictedStore.snapshot().projectiles.length,
        1,
        "server confirmation must not duplicate a prediction when client and server ticks differ"
    );
    assert.equal(predictedStore.snapshot().projectiles[0].id, "projectile-server-1");
    const predictedHit = predictedStore.update(0, {
        enemies: [{ id: "enemy-1", position: { x: 0, y: 0 }, radius: 18, health: 40 }]
    });
    assert.equal(predictedHit.length, 1, "local collision must produce immediate feedback");
    assert.equal(predictedStore.snapshot().projectiles.length, 0);
    const confirmedHit = createPredictableResolveEvent({
        eventId: "event-5",
        objectId: "projectile-server-1",
        tick: 21,
        resolution: "enemy-hit",
        position: { x: 0, y: 0 },
        parameters: { damage: 10 }
    });
    assert.deepEqual(
        predictedStore.apply([confirmedHit], 21, { enemies: [] }),
        [],
        "authority resolve must not replay predicted hit feedback"
    );

    predictedStore.predict([{ ...predictedSpawn, predictionId: "player-1:30", tick: 30 }]);
    const cancelledSpawn = createPredictableSpawnEvent({
        ...confirmedSpawn,
        eventId: "event-6",
        objectId: "projectile-server-2",
        spawnTick: 30,
        parameters: { ...confirmedSpawn.parameters, predictionId: "player-1:30" }
    });
    predictedStore.apply([cancelledSpawn], 30, { enemies: [] });
    predictedStore.apply(
        [
            createPredictableResolveEvent({
                eventId: "event-7",
                objectId: "projectile-server-2",
                tick: 31,
                resolution: "target-missing",
                position: { x: 0, y: 0 },
                parameters: {}
            })
        ],
        31,
        { enemies: [] }
    );
    assert.equal(predictedStore.metrics().predictionCancellations, 1);
}
