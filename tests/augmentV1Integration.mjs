import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { EnemyObject } from "../src/game/combat/EnemyObject.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createAugmentImpactClaim } from "../src/game/network/AugmentImpactClaim.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

function command({ action = false, aimWorld = { x: 1000, y: 500 } } = {}) {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact: false,
            action,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        aimWorld
    );
}

function impactClaim({ player, enemy, eventId, effectId = "default-punch", damage = 10, knockback = true }) {
    return createAugmentImpactClaim({
        eventId,
        predictionId: eventId,
        sourcePlayerId: player.id,
        targetId: enemy.id,
        clientTick: 0,
        effectId,
        sourceKind: "integration-test",
        sourcePosition: player.physics.position,
        contactPosition: enemy.position,
        damage,
        ...(knockback ? { knockback: { direction: { x: 1, y: 0 }, distance: 50, duration: 0.25 } } : {})
    });
}

function plainEnemy(id, x, health = 100, properties = {}) {
    return new EnemyObject({
        id,
        position: new Vector2(x, 500),
        level: 1,
        radius: 18,
        health,
        maxHealth: 100,
        fireCooldown: 0,
        ...properties
    });
}

function verticalWall(x) {
    return {
        id: `wall:${x}`,
        x,
        y: 0,
        width: 20,
        height: 700,
        topY: 0,
        collision: true,
        oneWay: false,
        vertices: [
            { x, y: 0 },
            { x: x + 20, y: 0 },
            { x: x + 20, y: 700 },
            { x, y: 700 }
        ]
    };
}

export function run() {
    const serverSimulation = new GameSimulation({ playerId: "impact-owner" });
    const serverPlayer = serverSimulation.players[0];
    serverPlayer.physics.position.set(100, 500);
    const lethalEnemy = plainEnemy("impact-target", 135, 10);
    serverSimulation.enemies = [lethalEnemy];
    const session = new AuthorityServerSession({ simulation: serverSimulation });
    const lethalClaim = impactClaim({
        player: serverPlayer,
        enemy: lethalEnemy,
        eventId: `${serverPlayer.id}:default-punch:0:impact-target:0`
    });
    const lethalReceipt = session.submitAugmentImpact(serverPlayer.id, lethalClaim);
    assert.equal(lethalReceipt.accepted, true);
    assert.equal(lethalReceipt.resolution, "applied");
    assert.equal(lethalReceipt.knockbackApplied, false, "lethal damage skips its own movement");
    assert.equal(session.submitAugmentImpact(serverPlayer.id, lethalClaim), lethalReceipt, "same event is idempotent");
    assert.equal(serverSimulation.metrics.enemyDefeats, 1);
    serverSimulation.drainReplicationEvents();

    const lateClaim = createAugmentImpactClaim({
        ...lethalClaim,
        eventId: `${serverPlayer.id}:default-punch:0:impact-target:late`,
        predictionId: `${serverPlayer.id}:default-punch:0:impact-target:late`
    });
    const lateReceipt = session.submitAugmentImpact(serverPlayer.id, lateClaim);
    assert.equal(lateReceipt.accepted, true);
    assert.equal(lateReceipt.resolution, "target-already-dead");
    assert.equal(lateReceipt.damage, 0);
    assert.equal(serverSimulation.metrics.enemyDefeats, 1, "late death cannot duplicate defeat metrics");
    assert.deepEqual(serverSimulation.drainReplicationEvents(), [], "late death is presentation-silent");

    const unknownClaim = createAugmentImpactClaim({
        ...lethalClaim,
        eventId: `${serverPlayer.id}:default-punch:0:never-known:0`,
        predictionId: `${serverPlayer.id}:default-punch:0:never-known:0`,
        targetId: "never-known"
    });
    assert.equal(session.submitAugmentImpact(serverPlayer.id, unknownClaim).reason, "target-missing");

    const shieldSimulation = new GameSimulation({ playerId: "shield-owner" });
    const shieldPlayer = shieldSimulation.players[0];
    shieldPlayer.physics.position.set(100, 500);
    const shieldEnemy = plainEnemy("shield-target", 135, 100, {
        behavior: {
            advance() {},
            snapshot() {
                return null;
            },
            blocksImpactFrom(enemy, sourcePosition) {
                return sourcePosition.x < enemy.position.x;
            }
        }
    });
    shieldSimulation.enemies = [shieldEnemy];
    const shieldSession = new AuthorityServerSession({ simulation: shieldSimulation });
    const shieldReceipt = shieldSession.submitAugmentImpact(
        shieldPlayer.id,
        impactClaim({
            player: shieldPlayer,
            enemy: shieldEnemy,
            eventId: `${shieldPlayer.id}:default-punch:0:shield-target:0`
        })
    );
    assert.equal(shieldReceipt.accepted, true);
    assert.equal(shieldReceipt.resolution, "shield-blocked");
    assert.equal(shieldEnemy.health, 100);
    assert.equal(shieldEnemy.knockbackSnapshot(), null);

    const ownerSimulation = new GameSimulation({ playerId: "prediction-owner" });
    const owner = ownerSimulation.players[0];
    owner.physics.position.set(100, 500);
    const punchTarget = ownerSimulation.enemies[0];
    punchTarget.position.set(140, 500);
    ownerSimulation.enemies = [punchTarget];
    const predicted = ownerSimulation.advanceOwnerPrediction(
        owner.id,
        command({ action: true, aimWorld: { x: 200, y: 500 } }),
        1 / 120,
        1
    );
    assert.equal(predicted.augmentImpactEvents[0].effectId, "default-punch");
    assert.equal(predicted.augmentImpactEvents[0].damage, 10);
    assert.equal(predicted.augmentEvents[0].eventType, "augment-action-started");
    assert.equal(predicted.augmentEvents[0].actionId, "default-punch");

    const emptyPunchSimulation = new GameSimulation({ playerId: "empty-punch-owner" });
    emptyPunchSimulation.enemies = [];
    const emptyPunch = emptyPunchSimulation.advanceOwnerPrediction(
        emptyPunchSimulation.players[0].id,
        command({ action: true, aimWorld: { x: 500, y: 500 } }),
        1 / 120,
        1
    );
    assert.equal(emptyPunch.augmentImpactEvents.length, 0, "an empty punch must not invent an impact");
    assert.equal(emptyPunch.augmentEvents[0].actionId, "default-punch", "an empty punch still needs input feedback");

    const dashSimulation = new GameSimulation({ playerId: "dash-owner" });
    dashSimulation.enemies = [];
    const dashPlayer = dashSimulation.players[0];
    dashPlayer.foundation.select("direction-dash");
    dashPlayer.physics.position.set(100, 300);
    const dashStartX = dashPlayer.physics.position.x;
    dashSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 1000, y: 300 } }));
    for (let index = 0; index < 30; index += 1) {
        dashSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 1000, y: 300 } }));
    }
    assert.ok(
        Math.abs(dashPlayer.physics.position.x - dashStartX - 150) < 1,
        "direction dash moves 150px over 0.25 seconds"
    );

    const reboundSimulation = new GameSimulation({ playerId: "rebound-owner" });
    reboundSimulation.enemies = [];
    const reboundPlayer = reboundSimulation.players[0];
    reboundPlayer.foundation.select("dash-strike");
    reboundPlayer.foundation.select("collision-rebound");
    reboundPlayer.physics.position.set(100, 300);
    reboundSimulation.activeCollisionSurfaces = [verticalWall(145)];
    reboundSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 1000, y: 300 } }));
    for (let index = 0; index < 8 && reboundPlayer.physics.velocity.x >= 0; index += 1) {
        reboundSimulation.step(1 / 120, command({ aimWorld: { x: 1000, y: 300 } }));
    }
    assert.ok(reboundPlayer.physics.velocity.x < 0, "collision rebound reflects from the actual wall normal");

    const shotWallSimulation = new GameSimulation({ playerId: "shot-wall-owner" });
    const shotWallPlayer = shotWallSimulation.players[0];
    shotWallPlayer.foundation.select("straight-shot");
    shotWallPlayer.physics.position.set(100, 300);
    shotWallSimulation.activeCollisionSurfaces = [verticalWall(150)];
    const behindWallEnemy = shotWallSimulation.enemies[0];
    behindWallEnemy.position.set(190, 300);
    shotWallSimulation.enemies = [behindWallEnemy];
    const behindWallHealth = behindWallEnemy.health;
    shotWallSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 1000, y: 300 } }));
    for (let index = 0; index < 8; index += 1) {
        shotWallSimulation.step(1 / 120, command({ aimWorld: { x: 1000, y: 300 } }));
    }
    assert.equal(behindWallEnemy.health, behindWallHealth, "a wall terminates the shot before a farther enemy");
    assert.equal(shotWallPlayer.augmentCombat.snapshot().actionProjectiles.length, 0);

    const electricSimulation = new GameSimulation({ playerId: "electric-owner" });
    const electricPlayer = electricSimulation.players[0];
    electricPlayer.foundation.select("electrified-rope");
    electricPlayer.physics.position.set(100, 500);
    const electricEnemy = electricSimulation.enemies[0];
    electricEnemy.position.set(100, 450);
    electricSimulation.enemies = [electricEnemy];
    assert.equal(electricPlayer.ropeObject.rope.attach(electricPlayer.physics.position, { x: 100, y: 400 }), true);
    const electricOutcome = electricSimulation.dispatchOwnerInput(electricPlayer.id, command(), 0.1);
    assert.equal(electricOutcome.augmentImpactEvents.length, 1);
    assert.equal(electricOutcome.augmentImpactEvents[0].effectId, "electrified-rope");
    assert.equal(electricOutcome.augmentImpactEvents[0].damage, 2);

    const guardSimulation = new GameSimulation({ playerId: "guard-owner" });
    const guardPlayer = guardSimulation.players[0];
    guardPlayer.foundation.select("instant-guard");
    guardPlayer.foundation.select("damage-reflect");
    const guardAttacker = guardSimulation.enemies[0];
    guardSimulation.enemies = [guardAttacker];
    guardSimulation.step(1 / 120, command({ action: true }));
    const guardHealth = guardPlayer.health;
    assert.equal(
        guardSimulation.applyPredictedOwnerImpact(guardPlayer.id, {
            projectileId: "guard-projectile",
            resolution: "player-hit",
            velocity: { x: 200, y: 0 },
            parameters: { damage: 20, ownerId: guardAttacker.id, sourceKind: "projectile" }
        }),
        true
    );
    assert.equal(guardPlayer.health, guardHealth, "instant guard blocks HP damage only");
    assert.ok(guardPlayer.physics.velocity.x > 0, "guard does not cancel the same hit's knockback");
    const reflected = guardSimulation.drainQueuedAugmentImpactEvents(guardPlayer.id);
    assert.equal(reflected.length, 1);
    assert.equal(reflected[0].effectId, "damage-reflect");
    assert.equal(reflected[0].damage, 20);

    const explosionSimulation = new GameSimulation({ playerId: "explosion-owner" });
    const explosionPlayer = explosionSimulation.players[0];
    explosionPlayer.foundation.select("collision-explosion");
    explosionPlayer.physics.position.set(100, 500);
    explosionPlayer.physics.velocity.set(700, 0);
    const direct = explosionSimulation.enemies[0];
    direct.position.set(110, 500);
    const splash = plainEnemy("splash-target", 180, 100);
    explosionSimulation.enemies = [direct, splash];
    assert.equal(explosionPlayer.ropeObject.rope.attach(explosionPlayer.physics.position, { x: 100, y: 400 }), true);
    const explosionOutcome = explosionSimulation.advanceOwnerPrediction(explosionPlayer.id, command(), 1 / 120, 1);
    assert.equal(explosionOutcome.ropeImpactEvents.length, 0, "direct target must not also use legacy Rope damage");
    assert.deepEqual(
        explosionOutcome.augmentImpactEvents.map(({ effectId, damage }) => [effectId, damage]),
        [
            ["collision-explosion-direct", 25],
            ["collision-explosion-splash", 12.5]
        ]
    );
}
