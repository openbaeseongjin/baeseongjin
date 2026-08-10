import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { LocalPlayerPredictor } from "../src/game/runtime/LocalPlayerPredictor.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

function close(actual, expected, label) {
    assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} != ${expected}`);
}

function withPlayerPosition(snapshot, x, serverTick) {
    return {
        ...snapshot,
        serverTick,
        state: {
            ...snapshot.state,
            players: snapshot.state.players.map((player) =>
                player.id === snapshot.state.players[0].id
                    ? { ...player, position: { x, y: player.position.y } }
                    : player
            )
        }
    };
}

export function run() {
    const server = new GameSimulation();
    server.enemies = [];
    server.tick = 6;
    server.rope.attach(server.player.position, {
        x: server.player.position.x,
        y: server.player.position.y - 80
    });
    server.playerEntity.aimWorld = { x: server.rope.anchor.x, y: server.rope.anchor.y };
    server.playerEntity.lastPointer = { x: 400, y: 300, down: true };
    server.playerEntity.lastViewport = { width: 1280, height: 720 };
    server.playerEntity.wasPointerDown = true;
    server.playerEntity.swingDrag = {
        origin: { x: 400, y: 300 },
        direction: null,
        progress: 0,
        age: 0.1,
        used: false
    };
    const snapshot = buildAuthoritySnapshot({ simulation: server, acknowledgements: {} });
    const dragCommand = createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact: false,
            pointer: { x: 300, y: 300, down: true },
            viewport: { width: 1280, height: 720 }
        },
        server.playerEntity.aimWorld
    );
    const pending = createPlayerCommandBatch(7, [
        { playerId: server.playerEntity.id, sequence: 0, command: dragCommand }
    ]);

    const predictor = new LocalPlayerPredictor({ playerId: server.playerEntity.id, predictionLeadTicks: 0 });
    const predicted = predictor.reconcile(snapshot, [pending]);
    server.stepCommandBatch(1 / 120, pending);

    assert.equal(predicted.tick, server.tick);
    close(predicted.position.x, server.player.position.x, "position.x");
    close(predicted.position.y, server.player.position.y, "position.y");
    close(predicted.velocity.x, server.player.velocity.x, "velocity.x");
    close(predicted.velocity.y, server.player.velocity.y, "velocity.y");
    assert.equal(predicted.rope.isAttached, server.rope.isAttached);
    close(predicted.rope.length, server.rope.length, "rope.length");
    assert.equal(predicted.swingDrag.used, true);
    assert.equal(predicted.swingDrag.used, server.playerEntity.swingDrag.used);
    close(predicted.ropeDamageBoostRemaining, server.playerEntity.ropeDamageBoostRemaining, "rope boost");

    const detachedSnapshot = {
        ...snapshot,
        serverTick: predicted.tick,
        state: {
            ...snapshot.state,
            players: snapshot.state.players.map((player) => ({
                ...player,
                rope: { ...player.rope, isAttached: false, anchor: null }
            }))
        }
    };
    predictor.reconcile(detachedSnapshot, []);
    assert.equal(predictor.presentationState().rope.isAttached, false);
    assert.equal(predictor.metrics().hardSnaps, 1, "rope topology changes must bypass smoothing");

    const movingServer = new GameSimulation();
    movingServer.enemies = [];
    movingServer.tick = 6;
    const movingSnapshot = buildAuthoritySnapshot({ simulation: movingServer, acknowledgements: {} });
    const move = createPlayerCommand(
        {
            horizontal: 1,
            vertical: 0,
            interact: false,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 844, height: 390 }
        },
        { x: 0, y: 0 }
    );
    const movingPredictor = new LocalPlayerPredictor({
        playerId: movingServer.playerEntity.id,
        predictionLeadTicks: 0
    });
    const movingPrediction = movingPredictor.reconcile(movingSnapshot, [
        createPlayerCommandBatch(7, [{ playerId: movingServer.playerEntity.id, sequence: 0, command: move }]),
        createPlayerCommandBatch(9, [{ playerId: movingServer.playerEntity.id, sequence: 1, command: move }])
    ]);
    assert.ok(movingPrediction.velocity.x > 10, "local prediction must simulate held input on the missing tick");

    const continuous = new LocalPlayerPredictor({
        playerId: movingServer.playerEntity.id,
        predictionLeadTicks: 0
    });
    continuous.reconcile(movingSnapshot, []);
    const firstLocalTick = continuous.advance(move);
    const secondLocalTick = continuous.advance(move);
    assert.equal(firstLocalTick.tick, movingSnapshot.serverTick + 1);
    assert.equal(secondLocalTick.tick, movingSnapshot.serverTick + 2);
    assert.ok(secondLocalTick.position.x > firstLocalTick.position.x, "prediction must move between network sends");
    const replayed = continuous.reconcile(movingSnapshot, []);
    assert.equal(replayed.tick, secondLocalTick.tick, "reconciliation must replay to the current predicted tick");
    close(replayed.position.x, secondLocalTick.position.x, "replayed position.x");
    close(replayed.velocity.x, secondLocalTick.velocity.x, "replayed velocity.x");

    const beforeSmallCorrection = continuous.presentationState();
    continuous.reconcile(withPlayerPosition(movingSnapshot, movingSnapshot.state.players[0].position.x + 20, 7), []);
    close(continuous.presentationState().position.x, beforeSmallCorrection.position.x, "small correction continuity");
    assert.ok(continuous.metrics().correctionDistance > 0);
    assert.equal(continuous.metrics().hardSnaps, 0);
    for (let tick = 0; tick < 12; tick += 1) continuous.advance(move);
    close(continuous.presentationState().position.x, continuous.state().position.x, "small correction convergence");
    close(continuous.metrics().correctionRemaining, 0, "correction remaining");

    const beforeHardSnap = continuous.state();
    continuous.reconcile(withPlayerPosition(movingSnapshot, beforeHardSnap.position.x + 200, beforeHardSnap.tick), []);
    close(continuous.presentationState().position.x, continuous.state().position.x, "hard snap position");
    assert.equal(continuous.metrics().hardSnaps, 1);

    const attackSnapshot = {
        ...movingSnapshot,
        state: {
            ...movingSnapshot.state,
            enemies: [
                {
                    id: "enemy-local-target",
                    position: {
                        x: movingSnapshot.state.players[0].position.x + 10,
                        y: movingSnapshot.state.players[0].position.y
                    },
                    radius: 18,
                    health: 40,
                    maxHealth: 40,
                    fireCooldown: 1
                }
            ]
        }
    };
    const attackPredictor = new LocalPlayerPredictor({
        playerId: movingServer.playerEntity.id,
        predictionLeadTicks: 0
    });
    attackPredictor.reconcile(attackSnapshot, []);
    const attackTick = attackPredictor.advance(move).tick;
    const predictedAttacks = attackPredictor.drainPredictedEvents();
    assert.equal(predictedAttacks.length, 1, "owner fire must emit a local predicted spawn");
    assert.equal(predictedAttacks[0].predictionId, `${movingServer.playerEntity.id}:${attackTick}`);
    assert.deepEqual(attackPredictor.drainPredictedEvents(), []);

    assert.throws(
        () => predictor.reconcile({ ...snapshot, worldSeed: snapshot.worldSeed + 1 }, []),
        /world seed mismatch/
    );
    const missing = new LocalPlayerPredictor({ playerId: "missing-player" });
    assert.throws(() => missing.reconcile(snapshot, []), /missing predicted playerId/);
}
