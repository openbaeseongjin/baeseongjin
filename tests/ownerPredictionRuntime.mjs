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

    const acceptedBodyImpact = new OwnerPredictionRuntime({ ownerId: serverPlayer.id, predictionLeadTicks: 0 });
    acceptedBodyImpact.reconcile(snapshot, []);
    const bodyImpact = {
        projectileId: "accepted-body-impact",
        resolution: "player-hit",
        velocity: { x: 120, y: 0 },
        parameters: { damage: 17 }
    };
    assert.equal(acceptedBodyImpact.applyPredictedImpact(bodyImpact), true);
    const predictedBodyHealth = acceptedBodyImpact.state().health;
    assert.equal(
        acceptedBodyImpact.recordImpactReceipt({
            projectileId: bodyImpact.projectileId,
            accepted: true,
            resolution: bodyImpact.resolution,
            damage: bodyImpact.parameters.damage
        }),
        true
    );
    acceptedBodyImpact.reconcile(snapshot, []);
    assert.equal(
        acceptedBodyImpact.state().health,
        predictedBodyHealth,
        "an accepted receipt must not let a pre-impact snapshot heal predicted damage"
    );
    const confirmedBodySnapshot = {
        ...snapshot,
        serverTick: snapshot.serverTick + 1,
        state: {
            ...snapshot.state,
            players: snapshot.state.players.map((player) =>
                player.id === serverPlayer.id
                    ? {
                          ...player,
                          health: predictedBodyHealth,
                          hitInvulnerabilityRemaining: acceptedBodyImpact.state().hitInvulnerabilityRemaining
                      }
                    : player
            )
        },
        events: [
            {
                eventId: "accepted-body-impact-resolution",
                eventType: "resolve",
                objectId: bodyImpact.projectileId,
                tick: snapshot.serverTick + 1,
                resolution: bodyImpact.resolution,
                position: { x: 0, y: 0 },
                parameters: { damage: bodyImpact.parameters.damage }
            }
        ]
    };
    acceptedBodyImpact.reconcile(confirmedBodySnapshot, []);
    assert.equal(acceptedBodyImpact.pendingImpacts.size, 0, "the authority resolve event must settle the body impact");
    assert.equal(acceptedBodyImpact.state().health, predictedBodyHealth);
    acceptedBodyImpact.reconcile({ ...snapshot, serverTick: snapshot.serverTick + 2 }, []);
    assert.equal(
        acceptedBodyImpact.state().health,
        predictedBodyHealth,
        "later shared snapshots must not overwrite client-owned health"
    );

    const acceptedRopeImpact = new OwnerPredictionRuntime({ ownerId: serverPlayer.id, predictionLeadTicks: 0 });
    acceptedRopeImpact.reconcile(snapshot, []);
    const ropeImpact = {
        projectileId: "accepted-rope-impact",
        resolution: "rope-cut",
        velocity: { x: 0, y: -120 },
        parameters: { damage: 0 }
    };
    assert.equal(acceptedRopeImpact.applyPredictedImpact(ropeImpact), true);
    assert.equal(
        acceptedRopeImpact.recordImpactReceipt({
            projectileId: ropeImpact.projectileId,
            accepted: true,
            resolution: ropeImpact.resolution,
            damage: 0
        }),
        true
    );
    acceptedRopeImpact.reconcile(snapshot, [], { rebaseMotion: true });
    assert.equal(
        acceptedRopeImpact.state().rope.isAttached,
        false,
        "an accepted receipt must keep a predicted rope cut through a stale motion rebase"
    );
    const confirmedRopeSnapshot = {
        ...snapshot,
        serverTick: snapshot.serverTick + 1,
        state: {
            ...snapshot.state,
            players: snapshot.state.players.map((player) =>
                player.id === serverPlayer.id
                    ? {
                          ...player,
                          rope: { ...player.rope, isAttached: false, anchor: null },
                          ropeDisabledRemaining: acceptedRopeImpact.state().ropeDisabledRemaining
                      }
                    : player
            )
        },
        events: [
            {
                eventId: "accepted-rope-impact-resolution",
                eventType: "resolve",
                objectId: ropeImpact.projectileId,
                tick: snapshot.serverTick + 1,
                resolution: ropeImpact.resolution,
                position: { x: 0, y: 0 },
                parameters: {}
            }
        ]
    };
    acceptedRopeImpact.reconcile(confirmedRopeSnapshot, []);
    assert.equal(acceptedRopeImpact.pendingImpacts.size, 0, "the authority resolve event must settle the rope impact");
    assert.equal(acceptedRopeImpact.state().rope.isAttached, false);
    acceptedRopeImpact.reconcile({ ...snapshot, serverTick: snapshot.serverTick + 2 }, []);
    assert.equal(
        acceptedRopeImpact.state().rope.isAttached,
        false,
        "later shared snapshots must not overwrite the client-owned rope result"
    );

    const clientFinalImpact = new OwnerPredictionRuntime({ ownerId: serverPlayer.id, predictionLeadTicks: 0 });
    clientFinalImpact.reconcile(snapshot, []);
    const rejectedClientBody = {
        projectileId: "client-final-body-impact",
        resolution: "player-hit",
        velocity: { x: 120, y: 0 },
        parameters: { damage: 17 }
    };
    assert.equal(clientFinalImpact.applyPredictedImpact(rejectedClientBody), true);
    const clientFinalHealth = clientFinalImpact.state().health;
    assert.equal(
        clientFinalImpact.recordImpactReceipt({
            projectileId: rejectedClientBody.projectileId,
            accepted: false,
            reason: "trajectory-mismatch"
        }),
        true
    );
    assert.equal(
        clientFinalImpact.state().health,
        clientFinalHealth,
        "a server rejection must not heal damage already resolved by the victim client"
    );
    const rejectedClientRope = {
        projectileId: "client-final-rope-impact",
        resolution: "rope-cut",
        velocity: { x: 0, y: -120 },
        parameters: { damage: 0 }
    };
    assert.equal(clientFinalImpact.applyPredictedImpact(rejectedClientRope), true);
    assert.equal(clientFinalImpact.state().rope.isAttached, false);
    assert.equal(
        clientFinalImpact.recordImpactReceipt({
            projectileId: rejectedClientRope.projectileId,
            accepted: false,
            reason: "trajectory-mismatch"
        }),
        true
    );
    assert.equal(
        clientFinalImpact.state().rope.isAttached,
        false,
        "a server rejection must not reattach a rope already cut by the victim client"
    );

    const overlappingImpacts = new OwnerPredictionRuntime({ ownerId: serverPlayer.id, predictionLeadTicks: 0 });
    overlappingImpacts.reconcile(snapshot, []);
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
    const beforeFirstRejection = overlappingImpacts.state();

    assert.equal(
        overlappingImpacts.recordImpactReceipt({ projectileId: firstImpact.projectileId, accepted: false }),
        true
    );
    const afterFirstRejection = overlappingImpacts.state();
    close(afterFirstRejection.position.x, beforeFirstRejection.position.x, "rejection must preserve position.x");
    close(afterFirstRejection.position.y, beforeFirstRejection.position.y, "rejection must preserve position.y");
    close(afterFirstRejection.velocity.x, beforeFirstRejection.velocity.x, "rejection must preserve velocity.x");
    close(afterFirstRejection.velocity.y, beforeFirstRejection.velocity.y, "rejection must preserve velocity.y");
    assert.equal(afterFirstRejection.health, beforeFirstRejection.health, "rejection must preserve client HP");
    close(
        afterFirstRejection.hitInvulnerabilityRemaining,
        beforeFirstRejection.hitInvulnerabilityRemaining,
        "rejection must preserve client hit invulnerability"
    );
    const beforeSecondRejection = overlappingImpacts.state();
    assert.equal(
        overlappingImpacts.recordImpactReceipt({ projectileId: secondImpact.projectileId, accepted: false }),
        true
    );
    const afterBothRejections = overlappingImpacts.state();
    close(afterBothRejections.position.x, beforeSecondRejection.position.x, "final rejection must preserve position.x");
    close(afterBothRejections.position.y, beforeSecondRejection.position.y, "final rejection must preserve position.y");
    close(afterBothRejections.velocity.x, beforeSecondRejection.velocity.x, "final rejection must preserve velocity.x");
    close(afterBothRejections.velocity.y, beforeSecondRejection.velocity.y, "final rejection must preserve velocity.y");
    assert.equal(afterBothRejections.health, beforeSecondRejection.health, "final rejection must preserve client HP");
    close(
        afterBothRejections.hitInvulnerabilityRemaining,
        beforeSecondRejection.hitInvulnerabilityRemaining,
        "final rejection must preserve client hit invulnerability"
    );

    const overlappingSwings = new OwnerPredictionRuntime({ ownerId: serverPlayer.id, predictionLeadTicks: 0 });
    overlappingSwings.reconcile(snapshot, []);
    const overlappingSwingPlayer = primaryPlayer(overlappingSwings.simulation);
    overlappingSwingPlayer.ropeDamageBoostRemaining = 3;
    overlappingSwings.simulation.applyArtifactEffects(overlappingSwingPlayer);
    const firstSwingTick = overlappingSwings.state().tick;
    overlappingSwings.recordPredictedRopeSwing(firstSwingTick, 0);
    const firstSwingPrediction = overlappingSwings.drainPredictedEvents()[0];
    overlappingSwings.advance(overlapIdle);
    const secondSwingPreviousBoost = overlappingSwings.state().ropeDamageBoostRemaining;
    overlappingSwingPlayer.ropeObject.rope.attach(overlappingSwingPlayer.physics.position, {
        x: overlappingSwingPlayer.physics.position.x,
        y: overlappingSwingPlayer.physics.position.y - 80
    });
    overlappingSwingPlayer.ropeDamageBoostRemaining = 3;
    overlappingSwings.simulation.applyArtifactEffects(overlappingSwingPlayer);
    const secondSwingTick = overlappingSwings.state().tick;
    overlappingSwings.recordPredictedRopeSwing(secondSwingTick, secondSwingPreviousBoost);
    const secondSwingPrediction = overlappingSwings.drainPredictedEvents()[0];
    const secondSwingBoost = overlappingSwings.state().ropeDamageBoostRemaining;
    assert.equal(
        overlappingSwings.recordRopeSwingReceipt({
            predictionId: firstSwingPrediction.predictionId,
            accepted: false
        }),
        true
    );
    close(
        overlappingSwings.state().ropeDamageBoostRemaining,
        secondSwingBoost,
        "rejecting an earlier swing must keep the later pending swing"
    );
    assert.equal(
        overlappingSwings.recordRopeSwingReceipt({
            predictionId: secondSwingPrediction.predictionId,
            accepted: false
        }),
        true
    );
    close(
        overlappingSwings.state().ropeDamageBoostRemaining,
        0,
        "rejecting the final swing must use the baseline corrected after the earlier rejection"
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
    assert.equal(rejectedLethal.health, lethalLocal.health, "rejection must not heal a lethal client impact");
    assert.deepEqual(rejectedLethal.position, lethalLocal.position, "rejection must not undo client respawn");
    assert.deepEqual(
        rejectedLethal.artifacts,
        lethalLocal.artifacts,
        "rejection must not restore artifacts lost by the client"
    );

    const checkpointServer = new GameSimulation();
    const checkpointPlayer = primaryPlayer(checkpointServer);
    checkpointServer.enemies = [];
    checkpointServer.tick = 18;
    const previousCheckpoint = checkpointServer.activeCheckpoint;
    const reachedCheckpoint = checkpointServer.world.checkpoints[1];
    checkpointPlayer.physics.position.set(reachedCheckpoint.x, reachedCheckpoint.y);
    checkpointPlayer.health = 10;
    checkpointPlayer.ropeObject.rope.attach(checkpointPlayer.physics.position, {
        x: checkpointPlayer.physics.position.x,
        y: checkpointPlayer.physics.position.y - 80
    });
    const checkpointSnapshot = buildAuthoritySnapshot({ simulation: checkpointServer, acknowledgements: {} });
    const checkpointPrediction = new OwnerPredictionRuntime({
        ownerId: checkpointPlayer.id,
        predictionLeadTicks: 0
    });
    checkpointPrediction.reconcile(checkpointSnapshot, []);
    const checkpointCandidate = checkpointPrediction.checkpointClaimCandidate();
    assert.equal(checkpointCandidate.checkpointId, reachedCheckpoint.id);
    assert.equal(checkpointPrediction.applyPredictedCheckpoint(checkpointCandidate), true);
    assert.equal(
        checkpointPrediction.renderSnapshot().activeCheckpoint.id,
        reachedCheckpoint.id,
        "checkpoint progress must change before the server receipt"
    );
    assert.equal(checkpointPrediction.state().rope.isAttached, false);
    assert.equal(checkpointPrediction.artifactReward().checkpointId, reachedCheckpoint.id);

    const afterCheckpointLethal = {
        projectileId: "impact-after-predicted-checkpoint",
        resolution: "player-hit",
        velocity: { x: 0, y: 120 },
        parameters: { damage: 20 }
    };
    assert.equal(checkpointPrediction.applyPredictedImpact(afterCheckpointLethal), true);
    assert.deepEqual(
        checkpointPrediction.state().position,
        { x: reachedCheckpoint.x, y: reachedCheckpoint.y },
        "a lethal impact after local checkpoint reach must respawn at the new checkpoint"
    );
    assert.equal(
        checkpointPrediction.recordCheckpointReceipt(
            { checkpointId: reachedCheckpoint.id, accepted: false },
            checkpointSnapshot
        ),
        true
    );
    assert.equal(checkpointPrediction.renderSnapshot().activeCheckpoint.id, previousCheckpoint.id);
    assert.equal(checkpointPrediction.artifactReward(), null);
    assert.deepEqual(
        checkpointPrediction.state().position,
        { x: previousCheckpoint.x, y: previousCheckpoint.y },
        "checkpoint rejection must replay the later lethal impact against the previous checkpoint"
    );

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
    const locallyRespawned = respawnPredictor.predictFall();
    const respawnTick = respawnPredictor.state().tick + 1;
    const sharedRespawnPosition = { x: respawnPosition.x + 24, y: respawnPosition.y };
    const respawnSnapshot = {
        ...movingSnapshot,
        serverTick: respawnTick,
        state: {
            ...movingSnapshot.state,
            players: movingSnapshot.state.players.map((player) =>
                player.id === movingPlayer.id
                    ? {
                          ...player,
                          position: sharedRespawnPosition,
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
                position: sharedRespawnPosition
            }
        ]
    };
    const respawned = respawnPredictor.reconcile(respawnSnapshot, []);
    assert.deepEqual(respawned.position, locallyRespawned.position, "shared fall confirmation must not move the owner");
    assert.deepEqual(respawned.velocity, locallyRespawned.velocity);
    assert.equal(respawned.rope.isAttached, false, "a confirmed fall must keep the local checkpoint transition");

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

    const overlappingShots = new OwnerPredictionRuntime({ ownerId: movingPlayer.id, predictionLeadTicks: 0 });
    overlappingShots.reconcile(attackSnapshot, []);
    overlappingShots.advance(move);
    const firstShotPrediction = overlappingShots.drainPredictedEvents()[0];
    const overlappingShotPlayer = primaryPlayer(overlappingShots.simulation);
    overlappingShotPlayer.weapon.cooldown = 0;
    overlappingShots.advance(move);
    const secondShotPrediction = overlappingShots.drainPredictedEvents()[0];
    const secondShotCooldown = overlappingShots.state().weaponCooldown;
    assert.equal(
        overlappingShots.recordProjectileSpawnReceipt({
            predictionId: firstShotPrediction.predictionId,
            accepted: false
        }),
        true
    );
    close(
        overlappingShots.state().weaponCooldown,
        secondShotCooldown,
        "rejecting an earlier shot must keep the later pending shot cooldown"
    );
    assert.equal(
        overlappingShots.recordProjectileSpawnReceipt({
            predictionId: secondShotPrediction.predictionId,
            accepted: false
        }),
        true
    );
    close(overlappingShots.state().weaponCooldown, 0, "the final rejected shot must restore its ready baseline");

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
