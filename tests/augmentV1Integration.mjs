import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { EnemyObject } from "../src/game/combat/EnemyObject.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createAugmentImpactClaim } from "../src/game/network/AugmentImpactClaim.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { closestPointOnPolygon, pointInPolygon } from "../src/game/world/PolygonGeometry.js";

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

function verticalWall(x, width = 20) {
    return {
        id: `wall:${x}`,
        x,
        y: 0,
        width,
        height: 700,
        topY: 0,
        collision: true,
        oneWay: false,
        vertices: [
            { x, y: 0 },
            { x: x + width, y: 0 },
            { x: x + width, y: 700 },
            { x, y: 700 }
        ]
    };
}

function oneWayPlatform(y, x = 0, width = 400) {
    return {
        id: `one-way:${x}:${y}`,
        x,
        y,
        width,
        height: 16,
        topY: y,
        collision: true,
        oneWay: true,
        oneWayEdgeEnd: 1,
        vertices: [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + 16 },
            { x, y: y + 16 }
        ]
    };
}

function solidBox(id, x, y, width, height) {
    return {
        id,
        x,
        y,
        width,
        height,
        topY: y,
        collision: true,
        oneWay: false,
        vertices: [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height }
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
    lethalEnemy.position.set(400, 500);
    const lethalReceipt = session.submitAugmentImpact(serverPlayer.id, lethalClaim);
    assert.equal(lethalReceipt.accepted, true);
    assert.equal(
        lethalReceipt.reason,
        undefined,
        "server target movement after the client impact must not reject a valid owner formula"
    );
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
    dashSimulation.activeCollisionSurfaces = [];
    const dashStartX = dashPlayer.physics.position.x;
    dashSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 1000, y: 300 } }));
    assert.ok(
        Math.abs(dashPlayer.physics.position.x - dashStartX - 150) < 0.000001,
        "blink resolves its full distance on activation tick"
    );
    assert.equal(dashPlayer.augmentCombat.actionState.activeAction, null, "blink leaves no 0.25s active action");
    const heldPosition = dashPlayer.physics.position.x;
    for (let index = 0; index < 30; index += 1) {
        dashSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 1000, y: 300 } }));
    }
    assert.equal(dashPlayer.physics.position.x, heldPosition, "holding Action does not blink again");

    const velocityBeforeBlink = { x: -120, y: -30 };
    dashPlayer.physics.velocity.set(velocityBeforeBlink.x, velocityBeforeBlink.y);
    dashPlayer.physics.setAngularState(0.4, 2.5);
    dashPlayer.ropeObject.aimWorld = Object.freeze({ x: 1000, y: dashPlayer.physics.position.y });
    dashPlayer.augmentCombat.wasActionDown = false;
    dashPlayer.augmentCombat.advance({
        player: dashPlayer,
        foundation: dashPlayer.foundation,
        command: command({ action: true, aimWorld: { x: 1000, y: dashPlayer.physics.position.y } }),
        dt: 0,
        enemies: [],
        surfaces: [],
        tick: 100
    });
    assert.deepEqual(
        { x: dashPlayer.physics.velocity.x, y: dashPlayer.physics.velocity.y },
        velocityBeforeBlink,
        "blink preserves linear velocity"
    );
    assert.equal(dashPlayer.physics.angularVelocity, 2.5, "blink preserves angular velocity");

    const blockedSimulation = new GameSimulation({ playerId: "blink-wall-owner" });
    blockedSimulation.enemies = [];
    const blockedPlayer = blockedSimulation.players[0];
    blockedPlayer.foundation.select("direction-dash");
    blockedPlayer.physics.position.set(100, 300);
    blockedSimulation.activeCollisionSurfaces = [verticalWall(145, 2)];
    blockedSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 1000, y: 300 } }));
    assert.ok(blockedPlayer.physics.position.x > 100, "a nearby thin wall still allows the safe part of blink");
    assert.ok(blockedPlayer.physics.position.x <= 130.001, "blink cannot cross a thin wall");

    const thickWallPlayer = new GameSimulation({ playerId: "blink-thick-wall" }).players[0];
    const thickWall = verticalWall(145, 100);
    const thickResult = thickWallPlayer.physics.collider.farthestSafePositionAlong({
        start: { x: 100, y: 300 },
        direction: { x: 1, y: 0 },
        distance: 150,
        surfaces: [thickWall]
    });
    assert.ok(thickResult.position.x <= 130.001, "blink cannot cross a thick solid");
    const touchingResult = thickWallPlayer.physics.collider.farthestSafePositionAlong({
        start: { x: 130, y: 300 },
        direction: { x: 1, y: 0 },
        distance: 150,
        surfaces: [thickWall]
    });
    assert.ok(touchingResult.distance <= 0.001, "blink into a touching solid does not jump behind it");
    const tangentResult = thickWallPlayer.physics.collider.farthestSafePositionAlong({
        start: { x: 130, y: 300 },
        direction: { x: 0, y: -1 },
        distance: 150,
        surfaces: [thickWall]
    });
    assert.equal(tangentResult.distance, 150, "blink can move tangentially from a touching solid without jitter");

    const corner = solidBox("corner", 155, 340, 30, 30);
    const cornerResult = thickWallPlayer.physics.collider.farthestSafePositionAlong({
        start: { x: 100, y: 300 },
        direction: { x: 1, y: 1 },
        distance: 150,
        surfaces: [corner]
    });
    const cornerClosest = closestPointOnPolygon(cornerResult.position, corner.vertices);
    assert.equal(pointInPolygon(cornerResult.position, corner.vertices), false);
    assert.ok(
        Math.hypot(cornerResult.position.x - cornerClosest.x, cornerResult.position.y - cornerClosest.y) >=
            thickWallPlayer.physics.collider.radius - 0.001,
        "blink ends outside a polygon corner"
    );
    assert.ok(cornerResult.distance < 150, "a polygon corner shortens blink instead of being skipped");

    const oneWayDownSimulation = new GameSimulation({ playerId: "blink-one-way-down" });
    oneWayDownSimulation.enemies = [];
    const oneWayDownPlayer = oneWayDownSimulation.players[0];
    oneWayDownPlayer.foundation.select("direction-dash");
    oneWayDownPlayer.physics.position.set(100, 250);
    oneWayDownPlayer.physics.isGrounded = false;
    oneWayDownSimulation.activeCollisionSurfaces = [oneWayPlatform(300)];
    oneWayDownSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 100, y: 1000 } }));
    assert.ok(oneWayDownPlayer.physics.position.y <= 285.001, "downward blink stops above a one-way platform");

    const oneWayUpSimulation = new GameSimulation({ playerId: "blink-one-way-up" });
    oneWayUpSimulation.enemies = [];
    const oneWayUpPlayer = oneWayUpSimulation.players[0];
    oneWayUpPlayer.foundation.select("direction-dash");
    oneWayUpPlayer.physics.position.set(100, 350);
    oneWayUpPlayer.physics.isGrounded = false;
    oneWayUpSimulation.activeCollisionSurfaces = [oneWayPlatform(300)];
    oneWayUpSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 100, y: 0 } }));
    assert.ok(oneWayUpPlayer.physics.position.y < 250, "upward blink passes through a one-way platform from below");

    const ropeBlinkSimulation = new GameSimulation({ playerId: "blink-rope-owner" });
    ropeBlinkSimulation.enemies = [];
    const ropeBlinkPlayer = ropeBlinkSimulation.players[0];
    ropeBlinkPlayer.foundation.select("direction-dash");
    ropeBlinkPlayer.physics.position.set(100, 300);
    ropeBlinkSimulation.activeCollisionSurfaces = [];
    assert.equal(ropeBlinkPlayer.ropeObject.rope.attach(ropeBlinkPlayer.physics.position, { x: 100, y: 150 }), true);
    ropeBlinkSimulation.step(1 / 120, command({ action: true, aimWorld: { x: 1000, y: 300 } }));
    assert.equal(ropeBlinkPlayer.ropeObject.rope.isAttached, true, "blink keeps the attached Rope");
    ropeBlinkSimulation.step(1 / 120, command({ action: false, aimWorld: { x: 1000, y: 300 } }));
    assert.ok(
        [
            ropeBlinkPlayer.physics.position.x,
            ropeBlinkPlayer.physics.position.y,
            ropeBlinkPlayer.physics.velocity.x,
            ropeBlinkPlayer.physics.velocity.y
        ].every(Number.isFinite),
        "the next Rope physics tick after blink remains finite"
    );

    const trailSimulation = new GameSimulation({ playerId: "blink-trail-owner" });
    const trailPlayer = trailSimulation.players[0];
    trailPlayer.foundation.select("direction-dash");
    trailPlayer.foundation.select("explosive-trail");
    trailPlayer.physics.position.set(100, 300);
    trailPlayer.ropeObject.aimWorld = Object.freeze({ x: 1000, y: 300 });
    const onPathEnemy = plainEnemy("trail-on-path", 145);
    const trailBehindWallEnemy = plainEnemy("trail-behind-wall", 230);
    onPathEnemy.position.y = 300;
    trailBehindWallEnemy.position.y = 300;
    const trailBegin = trailPlayer.augmentCombat.advance({
        player: trailPlayer,
        foundation: trailPlayer.foundation,
        command: command({ action: true, aimWorld: { x: 1000, y: 300 } }),
        dt: 0,
        enemies: [onPathEnemy, trailBehindWallEnemy],
        surfaces: [verticalWall(180, 2)],
        tick: 200
    });
    assert.equal(trailBegin.impactEvents.length, 0);
    const actualTrailEnd = trailPlayer.physics.position.x;
    assert.ok(actualTrailEnd < 180);
    const trailDetonation = trailPlayer.augmentCombat.advance({
        player: trailPlayer,
        foundation: trailPlayer.foundation,
        command: command({ action: false, aimWorld: { x: 1000, y: 300 } }),
        dt: 0.5,
        enemies: [onPathEnemy, trailBehindWallEnemy],
        surfaces: [verticalWall(180, 2)],
        tick: 201
    });
    assert.deepEqual(
        trailDetonation.impactEvents.map(({ targetId }) => targetId),
        ["trail-on-path"],
        "explosive trail uses only the actual collision-shortened blink path"
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
