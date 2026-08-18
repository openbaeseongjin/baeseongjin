import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { EnemyObject } from "../src/game/combat/EnemyObject.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { createProjectileHitClaim } from "../src/game/network/ProjectileHitClaim.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
import {
    createCurrentGameSimulation,
    createGameSimulationForWorldRevision
} from "../src/game/simulation/GameSimulationFactory.js";
import { COMBAT_CONFIG } from "../src/game/config.js";

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
    const replayServer = createCurrentGameSimulation({ worldSeed: 3141 });
    const replayOwner = replayServer.players[0];
    replayOwner.weapon.isEnabled = true;
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
    replayPredictor.simulation.players[0].weapon.isEnabled = true;
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

    const claimServer = createCurrentGameSimulation({ worldSeed: 3141 });
    const claimOwner = claimServer.players[0];
    claimOwner.weapon.isEnabled = true;
    const claimEnemy = enemyNear(claimServer);
    const claimSession = new AuthorityServerSession({
        simulation: claimServer,
        snapshotIntervalTicks: 1
    });
    const expectedSpawn = claimOwner.weapon.projectileSpawnPosition(claimOwner, claimEnemy);
    const firstClientTick = claimServer.getTick() + 1;
    const firstClaim = {
        predictionId: `${claimOwner.id}:${firstClientTick}`,
        clientTick: firstClientTick,
        objectType: "player-projectile",
        ownerId: claimOwner.id,
        targetId: claimEnemy.id,
        position: { x: expectedSpawn.x + 100, y: expectedSpawn.y + 100 },
        velocity: { x: 1, y: 0 },
        radius: 6,
        damage: 10,
        speed: 520
    };
    const firstReceipt = claimSession.submitProjectileSpawnClaim(claimOwner.id, firstClaim);
    assert.equal(firstReceipt.accepted, true, "an owner spawn claim with valid ownership must be accepted");
    assert.equal(claimServer.projectiles.length, 1, "the accepted claim must spawn the shared projectile");
    assert.equal(
        claimServer.projectiles[0].predictionId,
        firstClaim.predictionId,
        "the shared projectile must carry the claim prediction id"
    );
    assert.equal(
        claimServer.projectiles[0].targetId,
        claimEnemy.id,
        "the shared projectile must keep the owner's chosen target"
    );
    const duplicateReceipt = claimSession.submitProjectileSpawnClaim(claimOwner.id, firstClaim);
    assert.equal(duplicateReceipt, firstReceipt, "a repeated spawn claim must be idempotent");

    const earlyClaim = {
        ...firstClaim,
        predictionId: `${claimOwner.id}:${firstClientTick + 2}`,
        clientTick: firstClientTick + 2
    };
    const earlyReceipt = claimSession.submitProjectileSpawnClaim(claimOwner.id, earlyClaim);
    assert.equal(earlyReceipt.accepted, false, "a spawn claim inside the fire interval must stay rejected");
    assert.equal(earlyReceipt.reason, "fire-interval");

    const fireIntervalTicks = Math.round(COMBAT_CONFIG.fireInterval * 120);
    for (let step = 0; step < fireIntervalTicks + 2; step += 1) claimSession.advance();
    const laterClientTick = firstClientTick + fireIntervalTicks + 1;
    const farClaim = {
        ...firstClaim,
        predictionId: `${claimOwner.id}:${laterClientTick}`,
        clientTick: laterClientTick,
        position: { x: expectedSpawn.x + 600, y: expectedSpawn.y }
    };
    const farReceipt = claimSession.submitProjectileSpawnClaim(claimOwner.id, farClaim);
    assert.equal(
        farReceipt.accepted,
        true,
        "the owner's spawn event data must be applied as-is once the fire interval has passed"
    );
    assert.equal(claimServer.projectiles.length, 2, "the later claim must spawn the second shared projectile");
    assert.equal(
        claimServer.projectiles[1].position.x,
        farClaim.position.x,
        "the shared projectile must use the owner's claimed spawn position without re-deriving it"
    );

    const hitServer = createCurrentGameSimulation({ worldSeed: 2718 });
    const hitOwner = hitServer.players[0];
    hitOwner.weapon.isEnabled = true;
    const hitEnemy = enemyNear(hitServer);
    const hitSession = new AuthorityServerSession({ simulation: hitServer });
    const hitTick = hitServer.getTick() + 1;
    const spawnReceipt = hitSession.submitProjectileSpawnClaim(hitOwner.id, {
        predictionId: `${hitOwner.id}:${hitTick}`,
        clientTick: hitTick,
        targetId: hitEnemy.id,
        position: hitOwner.physics.position
    });
    assert.equal(spawnReceipt.accepted, true);
    for (let step = 0; step < 60; step += 1) hitSession.advance();
    const hitClaimTick = hitServer.getTick();
    const observedPosition = { x: hitEnemy.position.x, y: hitEnemy.position.y };
    hitEnemy.position.x += 600;
    hitServer.projectiles = [];
    const hitReceipt = hitSession.submitHitClaim(
        hitOwner.id,
        createProjectileHitClaim({
            predictionId: `${hitOwner.id}:${hitTick}`,
            targetId: hitEnemy.id,
            clientTick: hitClaimTick,
            position: observedPosition
        })
    );
    assert.equal(
        hitReceipt.accepted,
        true,
        "server trajectory drift or earlier replica expiry must not reject an authorized owner hit"
    );
}
