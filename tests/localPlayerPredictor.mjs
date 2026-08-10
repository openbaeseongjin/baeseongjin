import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { LocalPlayerPredictor } from "../src/game/runtime/LocalPlayerPredictor.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

function close(actual, expected, label) {
    assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} != ${expected}`);
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

    assert.throws(
        () => predictor.reconcile({ ...snapshot, worldSeed: snapshot.worldSeed + 1 }, []),
        /world seed mismatch/
    );
    const missing = new LocalPlayerPredictor({ playerId: "missing-player" });
    assert.throws(() => missing.reconcile(snapshot, []), /missing predicted playerId/);
}
