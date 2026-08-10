import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { PLAYER_CONFIG } from "../src/game/config.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { LocalPlayerPredictor } from "../src/game/runtime/LocalPlayerPredictor.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { commandForLocalSimulation } from "../src/game/MultiplayerGameApp.js";

function close(actual, expected, label) {
    assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} != ${expected}`);
}

function primaryPlayer(simulation) {
    return simulation.players.find(({ id }) => id === simulation.getPrimaryPlayerId());
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
    const rewardNavigation = commandForLocalSimulation(
        createPlayerCommand(
            {
                horizontal: 1,
                vertical: -1,
                interact: true,
                pointer: { x: 100, y: 100, down: true },
                viewport: { width: 844, height: 390 }
            },
            { x: 100, y: 100 }
        ),
        true
    );
    assert.equal(rewardNavigation.horizontal, 0, "artifact navigation must not move local prediction");
    assert.equal(rewardNavigation.vertical, 0, "artifact confirmation must not jump local prediction");
    assert.equal(rewardNavigation.pointer.down, false, "artifact navigation must not attach the local rope");

    const server = new GameSimulation();
    const serverPlayer = primaryPlayer(server);
    server.enemies = [];
    server.tick = 6;
    serverPlayer.rope.attach(serverPlayer.physics.position, {
        x: serverPlayer.physics.position.x,
        y: serverPlayer.physics.position.y - 80
    });
    serverPlayer.aimWorld = { x: serverPlayer.rope.anchor.x, y: serverPlayer.rope.anchor.y };
    serverPlayer.lastPointer = { x: 400, y: 300, down: true };
    serverPlayer.lastViewport = { width: 1280, height: 720 };
    serverPlayer.wasPointerDown = true;
    serverPlayer.swingDrag = {
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
        serverPlayer.aimWorld
    );
    const pending = createPlayerCommandBatch(7, [{ playerId: serverPlayer.id, sequence: 0, command: dragCommand }]);

    const predictor = new LocalPlayerPredictor({ playerId: serverPlayer.id, predictionLeadTicks: 0 });
    const predicted = predictor.reconcile(snapshot, [pending]);
    server.stepCommandBatch(1 / 120, pending);

    assert.equal(predicted.tick, server.tick);
    close(predicted.position.x, serverPlayer.physics.position.x, "position.x");
    close(predicted.position.y, serverPlayer.physics.position.y, "position.y");
    close(predicted.velocity.x, serverPlayer.physics.velocity.x, "velocity.x");
    close(predicted.velocity.y, serverPlayer.physics.velocity.y, "velocity.y");
    assert.equal(predicted.rope.isAttached, serverPlayer.rope.isAttached);
    close(predicted.rope.length, serverPlayer.rope.length, "rope.length");
    assert.equal(predicted.swingDrag.used, true);
    assert.equal(predicted.swingDrag.used, serverPlayer.swingDrag.used);
    close(predicted.ropeDamageBoostRemaining, serverPlayer.ropeDamageBoostRemaining, "rope boost");

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
    assert.equal(
        predictor.presentationState().rope.isAttached,
        true,
        "routine snapshots must not overwrite owner rope"
    );
    assert.equal(predictor.metrics().hardSnaps, 0);
    assert.equal(predictor.applyPredictedImpact({ resolution: "rope-cut" }), true);
    assert.equal(predictor.state().rope.isAttached, false, "predicted rope cut must react before server round trip");

    const movingServer = new GameSimulation();
    const movingPlayer = primaryPlayer(movingServer);
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
        playerId: movingPlayer.id,
        predictionLeadTicks: 0
    });
    const movingPrediction = movingPredictor.reconcile(movingSnapshot, [
        createPlayerCommandBatch(7, [{ playerId: movingPlayer.id, sequence: 0, command: move }]),
        createPlayerCommandBatch(9, [{ playerId: movingPlayer.id, sequence: 1, command: move }])
    ]);
    assert.ok(movingPrediction.velocity.x > 10, "local prediction must simulate held input on the missing tick");
    assert.equal(
        movingPredictor.renderSnapshot().world.seed,
        movingSnapshot.worldSeed,
        "render consumers must receive local simulation state through the predictor contract"
    );
    const collisionStart = movingPredictor.state().position.x;
    assert.equal(
        movingPredictor.resolveCollisions(
            [
                {
                    id: "overlapping-player",
                    position: { ...movingPredictor.state().position },
                    radius: PLAYER_CONFIG.radius,
                    lifeState: "active"
                }
            ],
            PLAYER_CONFIG.radius
        ),
        true,
        "the predictor must own collision mutation of its composed player simulation"
    );
    assert.notEqual(movingPredictor.state().position.x, collisionStart);

    const continuous = new LocalPlayerPredictor({
        playerId: movingPlayer.id,
        predictionLeadTicks: 0
    });
    continuous.reconcile(movingSnapshot, []);
    const firstLocalTick = continuous.advance(move);
    const secondLocalTick = continuous.advance(move);
    assert.equal(firstLocalTick.tick, movingSnapshot.serverTick + 1);
    assert.equal(secondLocalTick.tick, movingSnapshot.serverTick + 2);
    assert.ok(secondLocalTick.position.x > firstLocalTick.position.x, "prediction must move between network sends");
    const replayed = continuous.reconcile(movingSnapshot, []);
    assert.equal(replayed.tick, secondLocalTick.tick, "owner simulation must keep its current client tick");
    close(replayed.position.x, secondLocalTick.position.x, "client-owned position.x");
    close(replayed.velocity.x, secondLocalTick.velocity.x, "client-owned velocity.x");

    const beforeSmallCorrection = continuous.presentationState();
    continuous.reconcile(withPlayerPosition(movingSnapshot, movingSnapshot.state.players[0].position.x + 20, 7), []);
    close(continuous.presentationState().position.x, beforeSmallCorrection.position.x, "small correction continuity");
    assert.equal(
        continuous.metrics().correctionDistance,
        0,
        "routine authority snapshots must not correct owner motion"
    );
    assert.equal(continuous.metrics().hardSnaps, 0);
    for (let tick = 0; tick < 12; tick += 1) continuous.advance(move);
    close(continuous.presentationState().position.x, continuous.state().position.x, "small correction convergence");
    close(continuous.metrics().correctionRemaining, 0, "correction remaining");

    const beforeAuthoritySnapshot = continuous.state();
    continuous.reconcile(
        withPlayerPosition(movingSnapshot, beforeAuthoritySnapshot.position.x + 200, beforeAuthoritySnapshot.tick),
        []
    );
    close(
        continuous.state().position.x,
        beforeAuthoritySnapshot.position.x,
        "authority must not rewind owner position"
    );
    assert.equal(continuous.metrics().hardSnaps, 0);

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
        playerId: movingPlayer.id,
        predictionLeadTicks: 0
    });
    attackPredictor.reconcile(attackSnapshot, []);
    const attackTick = attackPredictor.advance(move).tick;
    const predictedAttacks = attackPredictor.drainPredictedEvents();
    assert.equal(predictedAttacks.length, 1, "owner fire must emit a local predicted spawn");
    assert.equal(predictedAttacks[0].predictionId, `${movingPlayer.id}:${attackTick}`);
    assert.deepEqual(attackPredictor.drainPredictedEvents(), []);

    const secondPlayerId = "player-2";
    const secondPlayerSnapshot = {
        ...attackSnapshot,
        state: {
            ...attackSnapshot.state,
            players: attackSnapshot.state.players.map((player) => ({ ...player, id: secondPlayerId }))
        }
    };
    const secondPlayerPredictor = new LocalPlayerPredictor({ playerId: secondPlayerId, predictionLeadTicks: 0 });
    secondPlayerPredictor.reconcile(secondPlayerSnapshot, []);
    secondPlayerPredictor.advance(move);
    const secondPlayerAttacks = secondPlayerPredictor.drainPredictedEvents();
    assert.equal(secondPlayerAttacks.length, 1);
    assert.equal(
        secondPlayerAttacks[0].ownerId,
        secondPlayerId,
        "a second client's predicted shot must use its authority player id"
    );
    assert.throws(
        () => new LocalPlayerPredictor({ playerId: secondPlayerId, simulation: new GameSimulation() }),
        /prediction simulation playerId mismatch/,
        "a mismatched injected simulation must fail before it can emit wrongly owned events"
    );

    assert.throws(
        () => predictor.reconcile({ ...snapshot, worldSeed: snapshot.worldSeed + 1 }, []),
        /world seed mismatch/
    );
    const missing = new LocalPlayerPredictor({ playerId: "missing-player" });
    assert.throws(() => missing.reconcile(snapshot, []), /missing predicted playerId/);
}
