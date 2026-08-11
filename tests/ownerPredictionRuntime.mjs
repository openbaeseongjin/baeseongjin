import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { COMBAT_CONFIG, PLAYER_CONFIG } from "../src/game/config.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { MULTIPLAYER_TIMING } from "../src/game/network/MultiplayerTiming.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
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
                    ? { ...player, position: { x, y: player.position.y }, ownerMotionTick: serverTick }
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
    serverPlayer.ropeObject.rope.attach(serverPlayer.physics.position, {
        x: serverPlayer.physics.position.x,
        y: serverPlayer.physics.position.y - 80
    });
    serverPlayer.ropeObject.aimWorld = {
        x: serverPlayer.ropeObject.rope.anchor.x,
        y: serverPlayer.ropeObject.rope.anchor.y
    };
    serverPlayer.ropeObject.lastPointer = { x: 400, y: 300, down: true };
    serverPlayer.ropeObject.lastViewport = { width: 1280, height: 720 };
    serverPlayer.ropeObject.wasPointerDown = true;
    serverPlayer.ropeObject.swingDrag = {
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
        serverPlayer.ropeObject.aimWorld
    );
    const pending = createPlayerCommandBatch(7, [{ playerId: serverPlayer.id, sequence: 0, command: dragCommand }]);

    const predictor = new OwnerPredictionRuntime({ ownerId: serverPlayer.id, predictionLeadTicks: 0 });
    const predicted = predictor.reconcile(snapshot, [pending]);
    server.stepCommandBatch(1 / 120, pending);

    assert.equal(predicted.tick, server.tick);
    close(predicted.position.x, serverPlayer.physics.position.x, "position.x");
    close(predicted.position.y, serverPlayer.physics.position.y, "position.y");
    close(predicted.velocity.x, serverPlayer.physics.velocity.x, "velocity.x");
    close(predicted.velocity.y, serverPlayer.physics.velocity.y, "velocity.y");
    assert.equal(predicted.rope.isAttached, serverPlayer.ropeObject.rope.isAttached);
    close(predicted.rope.length, serverPlayer.ropeObject.rope.length, "rope.length");
    assert.equal(predicted.swingDrag.used, true);
    assert.equal(predicted.swingDrag.used, serverPlayer.ropeObject.swingDrag.used);
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
        "routine snapshots must not overwrite an accepted owner rope"
    );
    assert.equal(predictor.metrics().hardSnaps, 0);
    assert.equal(predictor.applyPredictedImpact({ resolution: "rope-cut" }), true);
    assert.equal(predictor.state().rope.isAttached, false, "predicted rope cut must react before server round trip");
    assert.equal(predictor.applyPredictedImpact({ resolution: "player-hit", velocity: { x: 120, y: 0 } }), true);
    assert.equal(
        predictor.state().hitInvulnerabilityRemaining,
        COMBAT_CONFIG.playerHitInvulnerability,
        "victim prediction must suppress repeated local hit claims before the next server snapshot"
    );

    const overlappingImpacts = new OwnerPredictionRuntime({ ownerId: serverPlayer.id, predictionLeadTicks: 0 });
    overlappingImpacts.reconcile(snapshot, []);
    const overlapBaseline = overlappingImpacts.simulation.playerState(serverPlayer.id);
    const firstImpact = {
        projectileId: "impact-first-rejected",
        resolution: "player-hit",
        velocity: { x: 120, y: 0 }
    };
    const secondImpact = {
        projectileId: "impact-second-rejected",
        resolution: "player-hit",
        velocity: { x: 0, y: -120 }
    };
    const overlapIdle = createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact: false,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 844, height: 390 }
        },
        { x: 0, y: 0 }
    );
    assert.equal(overlappingImpacts.applyPredictedImpact(firstImpact), true);
    overlappingImpacts.advance(overlapIdle);
    assert.equal(overlappingImpacts.applyPredictedImpact(secondImpact), true);
    overlappingImpacts.advance(overlapIdle);

    const secondImpactOnly = new GameSimulation({ worldSeed: snapshot.worldSeed, playerId: serverPlayer.id });
    secondImpactOnly.preparePrediction();
    secondImpactOnly.restoreOwnerPrediction(serverPlayer.id, overlapBaseline, snapshot.serverTick);
    secondImpactOnly.advanceOwnerPrediction(serverPlayer.id, overlapIdle, 1 / 120, snapshot.serverTick + 1);
    secondImpactOnly.applyPredictedOwnerImpact(serverPlayer.id, secondImpact);
    secondImpactOnly.advanceOwnerPrediction(serverPlayer.id, overlapIdle, 1 / 120, snapshot.serverTick + 2);

    assert.equal(
        overlappingImpacts.recordImpactReceipt({ projectileId: firstImpact.projectileId, accepted: false }),
        true
    );
    const afterFirstRejection = overlappingImpacts.state();
    const expectedSecondImpact = secondImpactOnly.ownerPredictionState(serverPlayer.id);
    close(afterFirstRejection.position.x, expectedSecondImpact.position.x, "overlap first rejection position.x");
    close(afterFirstRejection.position.y, expectedSecondImpact.position.y, "overlap first rejection position.y");
    close(afterFirstRejection.velocity.x, expectedSecondImpact.velocity.x, "overlap first rejection velocity.x");
    close(afterFirstRejection.velocity.y, expectedSecondImpact.velocity.y, "overlap first rejection velocity.y");
    close(
        afterFirstRejection.hitInvulnerabilityRemaining,
        expectedSecondImpact.hitInvulnerabilityRemaining,
        "the later pending impact must remain on the corrected timeline"
    );

    const noImpacts = new GameSimulation({ worldSeed: snapshot.worldSeed, playerId: serverPlayer.id });
    noImpacts.preparePrediction();
    noImpacts.restoreOwnerPrediction(serverPlayer.id, overlapBaseline, snapshot.serverTick);
    noImpacts.advanceOwnerPrediction(serverPlayer.id, overlapIdle, 1 / 120, snapshot.serverTick + 1);
    noImpacts.advanceOwnerPrediction(serverPlayer.id, overlapIdle, 1 / 120, snapshot.serverTick + 2);
    assert.equal(
        overlappingImpacts.recordImpactReceipt({ projectileId: secondImpact.projectileId, accepted: false }),
        true
    );
    const afterBothRejections = overlappingImpacts.state();
    const expectedNoImpacts = noImpacts.ownerPredictionState(serverPlayer.id);
    close(afterBothRejections.position.x, expectedNoImpacts.position.x, "overlap final position.x");
    close(afterBothRejections.position.y, expectedNoImpacts.position.y, "overlap final position.y");
    close(afterBothRejections.velocity.x, expectedNoImpacts.velocity.x, "overlap final velocity.x");
    close(afterBothRejections.velocity.y, expectedNoImpacts.velocity.y, "overlap final velocity.y");
    close(
        afterBothRejections.hitInvulnerabilityRemaining,
        expectedNoImpacts.hitInvulnerabilityRemaining,
        "the final rejected impact must use its rebased pre-impact state"
    );

    const lethalServer = new GameSimulation();
    const lethalServerPlayer = primaryPlayer(lethalServer);
    lethalServer.enemies = [];
    lethalServer.tick = 12;
    lethalServer.activeCheckpoint = lethalServer.world.checkpoints[1];
    lethalServerPlayer.health = 10;
    for (const id of ["kept-a", "kept-b", "predicted-loss"]) {
        lethalServerPlayer.artifacts.add({ id, name: id });
    }
    lethalServer.applyArtifactEffects(lethalServerPlayer);
    const lethalSnapshot = buildAuthoritySnapshot({ simulation: lethalServer, acknowledgements: {} });
    const lethalPrediction = new OwnerPredictionRuntime({
        ownerId: lethalServerPlayer.id,
        predictionLeadTicks: 0
    });
    lethalPrediction.reconcile(lethalSnapshot, []);
    const lethalBefore = lethalPrediction.state();
    const lethalImpact = {
        projectileId: "predicted-lethal-impact",
        resolution: "player-hit",
        velocity: { x: 120, y: 0 },
        parameters: { damage: 20 }
    };
    assert.equal(lethalPrediction.applyPredictedImpact(lethalImpact), true);
    const lethalLocal = lethalPrediction.state();
    assert.equal(lethalLocal.health, lethalLocal.maxHealth, "lethal damage must predict full checkpoint health");
    assert.deepEqual(lethalLocal.position, {
        x: lethalServer.activeCheckpoint.x,
        y: lethalServer.activeCheckpoint.y
    });
    assert.deepEqual(
        lethalLocal.artifacts.map(({ id }) => id),
        ["kept-a", "kept-b"],
        "lethal damage must predict deterministic checkpoint artifact loss"
    );
    lethalPrediction.reconcile(lethalSnapshot, []);
    assert.equal(
        lethalPrediction.state().health,
        lethalLocal.health,
        "a pre-impact snapshot must not erase pending predicted health"
    );
    assert.deepEqual(
        lethalPrediction.state().artifacts,
        lethalLocal.artifacts,
        "a pre-impact snapshot must not restore pending predicted artifact loss"
    );
    lethalPrediction.reconcile(lethalSnapshot, [], { rebaseMotion: true });
    assert.deepEqual(
        lethalPrediction.state().position,
        lethalLocal.position,
        "owner motion rebase must replay an impact predicted at the shared motion tick"
    );
    assert.deepEqual(lethalPrediction.state().artifacts, lethalLocal.artifacts);
    assert.equal(
        lethalPrediction.recordImpactReceipt(
            { projectileId: lethalImpact.projectileId, accepted: false },
            lethalSnapshot
        ),
        true
    );
    const rejectedLethal = lethalPrediction.state();
    assert.equal(rejectedLethal.health, lethalBefore.health);
    assert.deepEqual(rejectedLethal.position, lethalBefore.position);
    assert.deepEqual(rejectedLethal.artifacts, lethalBefore.artifacts);

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
    const movingPredictor = new OwnerPredictionRuntime({
        ownerId: movingPlayer.id,
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

    const continuous = new OwnerPredictionRuntime({
        ownerId: movingPlayer.id,
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
    close(replayed.position.x, secondLocalTick.position.x, "pending input replay position.x");
    close(replayed.velocity.x, secondLocalTick.velocity.x, "pending input replay velocity.x");

    const ownerTimeline = new OwnerPredictionRuntime({ ownerId: movingPlayer.id, predictionLeadTicks: 0 });
    ownerTimeline.reconcile(movingSnapshot, []);
    ownerTimeline.advance(move);
    const acceptedAtOwnerTick = ownerTimeline.advance(move);
    ownerTimeline.advance(move);
    const beforeOwnerTickRebase = ownerTimeline.advance(move);
    const ownerTickSnapshot = {
        ...movingSnapshot,
        serverTick: movingSnapshot.serverTick + 1,
        state: {
            ...movingSnapshot.state,
            players: movingSnapshot.state.players.map((player) =>
                player.id === movingPlayer.id
                    ? {
                          ...player,
                          ownerMotionTick: acceptedAtOwnerTick.tick,
                          position: acceptedAtOwnerTick.position,
                          velocity: acceptedAtOwnerTick.velocity,
                          isGrounded: acceptedAtOwnerTick.isGrounded,
                          rope: acceptedAtOwnerTick.rope
                      }
                    : player
            )
        }
    };
    const ownerTickRebase = ownerTimeline.reconcile(ownerTickSnapshot, [], { rebaseMotion: true });
    close(
        ownerTickRebase.position.x,
        beforeOwnerTickRebase.position.x,
        "owner tick rebase must not replay accepted movement twice"
    );
    close(ownerTickRebase.velocity.x, beforeOwnerTickRebase.velocity.x, "owner tick rebase velocity");

    const beforeSmallCorrection = continuous.presentationState();
    continuous.reconcile(withPlayerPosition(movingSnapshot, movingSnapshot.state.players[0].position.x + 20, 7), []);
    close(continuous.presentationState().position.x, beforeSmallCorrection.position.x, "small correction continuity");
    assert.equal(continuous.metrics().correctionDistance, 0, "accepted owner motion must remain the movement source");
    assert.equal(continuous.metrics().hardSnaps, 0);
    for (let tick = 0; tick < 12; tick += 1) continuous.advance(move);
    close(continuous.presentationState().position.x, continuous.state().position.x, "small correction convergence");
    close(continuous.metrics().correctionRemaining, 0, "correction remaining");

    const beforeAuthoritySnapshot = continuous.state();
    continuous.reconcile(
        withPlayerPosition(movingSnapshot, beforeAuthoritySnapshot.position.x + 200, beforeAuthoritySnapshot.tick),
        []
    );
    close(continuous.state().position.x, beforeAuthoritySnapshot.position.x, "routine snapshots must not rewind owner");
    assert.equal(continuous.metrics().hardSnaps, 0);
    const rejectedMotionRebase = continuous.reconcile(
        withPlayerPosition(movingSnapshot, beforeAuthoritySnapshot.position.x + 200, beforeAuthoritySnapshot.tick),
        [],
        { rebaseMotion: true }
    );
    assert.notEqual(rejectedMotionRebase.position.x, beforeAuthoritySnapshot.position.x);
    assert.equal(continuous.metrics().hardSnaps, 1, "rejected owner motion must converge to shared state");

    const stalled = new OwnerPredictionRuntime({ ownerId: movingPlayer.id });
    stalled.reconcile(movingSnapshot, []);
    const stalledPosition = stalled.state().position;
    const resumedServerTick = stalled.state().tick + 48;
    stalled.reconcile({ ...movingSnapshot, serverTick: resumedServerTick }, []);
    assert.equal(
        stalled.state().tick,
        resumedServerTick + stalled.predictionLeadTicks,
        "a client that missed frames must rejoin the server input window"
    );
    assert.deepEqual(stalled.state().position, stalledPosition, "clock recovery must not rewind owner motion");

    const respawnPredictor = new OwnerPredictionRuntime({ ownerId: movingPlayer.id, predictionLeadTicks: 0 });
    respawnPredictor.reconcile(movingSnapshot, []);
    for (let tick = 0; tick < 12; tick += 1) respawnPredictor.advance(move);
    const respawnPosition = movingServer.world.checkpoints[0];
    const respawnTick = respawnPredictor.state().tick + 1;
    const respawnSnapshot = {
        ...movingSnapshot,
        serverTick: respawnTick,
        state: {
            ...movingSnapshot.state,
            players: movingSnapshot.state.players.map((player) =>
                player.id === movingPlayer.id
                    ? {
                          ...player,
                          position: { x: respawnPosition.x, y: respawnPosition.y },
                          velocity: { x: 0, y: 0 },
                          isGrounded: false,
                          rope: { ...player.rope, isAttached: false, anchor: null }
                      }
                    : player
            )
        },
        events: [
            {
                eventId: "event-respawn-local",
                eventType: "player-respawned",
                tick: respawnTick,
                playerId: movingPlayer.id,
                reason: "fall",
                health: movingPlayer.maxHealth,
                artifactIds: [],
                position: { x: respawnPosition.x, y: respawnPosition.y }
            }
        ]
    };
    const respawned = respawnPredictor.reconcile(respawnSnapshot, []);
    assert.deepEqual(respawned.position, { x: respawnPosition.x, y: respawnPosition.y });
    assert.deepEqual(respawned.velocity, { x: 0, y: 0 });
    assert.equal(respawned.rope.isAttached, false, "a confirmed fall must restore the checkpoint transition");

    const predictedCheckpoint = movingServer.world.checkpoints[1];
    const predictedFall = new OwnerPredictionRuntime({ ownerId: movingPlayer.id, predictionLeadTicks: 0 });
    predictedFall.reconcile(
        {
            ...movingSnapshot,
            state: { ...movingSnapshot.state, activeCheckpointId: predictedCheckpoint.id }
        },
        []
    );
    predictedFall.advance(move);
    const predictedRespawn = predictedFall.predictFall();
    assert.deepEqual(predictedRespawn.position, { x: predictedCheckpoint.x, y: predictedCheckpoint.y });
    assert.deepEqual(predictedRespawn.velocity, { x: 0, y: 0 });
    assert.equal(predictedRespawn.rope.isAttached, false, "the owner must feel its fall before the server receipt");

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
    const attackPredictor = new OwnerPredictionRuntime({
        ownerId: movingPlayer.id,
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
    const secondPlayerPredictor = new OwnerPredictionRuntime({ ownerId: secondPlayerId, predictionLeadTicks: 0 });
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
        () => new OwnerPredictionRuntime({ ownerId: secondPlayerId, simulation: new GameSimulation() }),
        /prediction simulation ownerId mismatch/,
        "a mismatched injected simulation must fail before it can emit wrongly owned events"
    );

    assert.throws(
        () => predictor.reconcile({ ...snapshot, worldSeed: snapshot.worldSeed + 1 }, []),
        /world seed mismatch/
    );
    assert.throws(
        () =>
            predictor.reconcile(
                {
                    ...snapshot,
                    state: {
                        ...snapshot.state,
                        players: snapshot.state.players.map((player) => ({
                            ...player,
                            ownerMotionTick: snapshot.serverTick + MULTIPLAYER_TIMING.maxFutureTicks + 1
                        }))
                    }
                },
                []
            ),
        /invalid ownerMotionTick/
    );
    const missing = new OwnerPredictionRuntime({ ownerId: "missing-player" });
    assert.throws(() => missing.reconcile(snapshot, []), /missing predicted ownerId/);
}
