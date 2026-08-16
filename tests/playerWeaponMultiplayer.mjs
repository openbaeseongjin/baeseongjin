import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { EnemyObject } from "../src/game/combat/EnemyObject.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { MULTIPLAYER_TIMING } from "../src/game/network/MultiplayerTiming.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
import {
    createCurrentGameSimulation,
    createGameSimulationForWorldRevision
} from "../src/game/simulation/GameSimulationFactory.js";

function idleCommand() {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact: false,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
}

function enemyNear(simulation, offsetX = 200) {
    const owner = simulation.players[0];
    const enemy = new EnemyObject({
        id: "enemy-near",
        position: new Vector2(owner.physics.position.x + offsetX, owner.physics.position.y),
        level: 1,
        enemyType: "sentry-t1",
        radius: 18,
        health: 100,
        maxHealth: 100,
        fireCooldown: 1
    });
    simulation.enemies = [enemy];
    return enemy;
}

export function run() {
    assert.ok(MULTIPLAYER_TIMING.spawnClaimPositionTolerance > MULTIPLAYER_TIMING.hitClaimPositionTolerance);

    const replayServer = createCurrentGameSimulation({ worldSeed: 3141 });
    const replayOwner = replayServer.players[0];
    enemyNear(replayServer);
    const replaySnapshot = buildAuthoritySnapshot({ simulation: replayServer });
    const replayPredictor = new OwnerPredictionRuntime({
        ownerId: replayOwner.id,
        predictionLeadTicks: 30,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: replaySnapshot.worldSeed,
            playerId: replayOwner.id,
            worldRevision: replaySnapshot.worldRevision
        })
    });
    replayPredictor.reconcile(replaySnapshot, [
        createPlayerCommandBatch(replaySnapshot.serverTick + 5, [
            { playerId: replayOwner.id, sequence: 0, command: idleCommand() }
        ])
    ]);
    assert.equal(
        replayPredictor.drainPredictedEvents().some(({ eventType }) => eventType === "predicted-spawn"),
        false,
        "the reconcile replay must not fire the automatic weapon"
    );
    let liveFired = false;
    for (let step = 0; step < 60 && !liveFired; step += 1) {
        replayPredictor.advance(idleCommand());
        liveFired = replayPredictor.drainPredictedEvents().some(({ eventType }) => eventType === "predicted-spawn");
    }
    assert.equal(liveFired, true, "live prediction must still fire the automatic weapon near an enemy");

    const toleranceServer = createCurrentGameSimulation({ worldSeed: 3141 });
    const toleranceOwner = toleranceServer.players[0];
    const toleranceEnemy = enemyNear(toleranceServer);
    const toleranceSession = new AuthorityServerSession({
        simulation: toleranceServer,
        snapshotIntervalTicks: 1
    });
    const expectedSpawn = toleranceOwner.weapon.projectileSpawnPosition(toleranceOwner, toleranceEnemy);
    const clientTick = toleranceServer.getTick() + 1;
    const acceptedReceipt = toleranceSession.submitProjectileSpawnClaim(toleranceOwner.id, {
        predictionId: `${toleranceOwner.id}:${clientTick}`,
        clientTick,
        objectType: "player-projectile",
        ownerId: toleranceOwner.id,
        targetId: toleranceEnemy.id,
        position: { x: expectedSpawn.x + 100, y: expectedSpawn.y + 100 },
        velocity: { x: 1, y: 0 },
        radius: 6,
        damage: 10,
        speed: 520
    });
    assert.equal(
        acceptedReceipt.accepted,
        true,
        "a spawn claim offset within the prediction lead tolerance must be accepted"
    );
    toleranceOwner.weapon.cooldown = 0;
    const farReceipt = toleranceSession.submitProjectileSpawnClaim(toleranceOwner.id, {
        predictionId: `${toleranceOwner.id}:${clientTick + 2}`,
        clientTick: clientTick + 2,
        objectType: "player-projectile",
        ownerId: toleranceOwner.id,
        targetId: toleranceEnemy.id,
        position: { x: expectedSpawn.x + 600, y: expectedSpawn.y },
        velocity: { x: 1, y: 0 },
        radius: 6,
        damage: 10,
        speed: 520
    });
    assert.equal(farReceipt.accepted, false, "a spawn claim far beyond the lead tolerance must stay rejected");
    assert.equal(farReceipt.reason, "position-mismatch");
}
