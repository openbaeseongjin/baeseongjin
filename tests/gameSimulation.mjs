import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { BallisticProjectileObject } from "../src/game/combat/ProjectileObject.js";
import { COMBAT_CONFIG, FALL_DAMAGE_CONFIG, ROPE_IMPACT_CONFIG } from "../src/game/config.js";
import { fallDamageForImpactSpeed } from "../src/game/combat/FallDamage.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { LocalAuthority } from "../src/game/runtime/LocalAuthority.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

function primaryPlayer(simulation) {
    return simulation.players.find(({ id }) => id === simulation.getPrimaryPlayerId());
}

export function run() {
    const first = new LocalAuthority(new GameSimulation());
    const second = new LocalAuthority(new GameSimulation());
    const input = {
        horizontal: 1,
        vertical: 0,
        pointer: { x: 0, y: 0, down: false },
        viewport: { width: 1280, height: 720 }
    };
    const command = createPlayerCommand(input, { x: 0, y: 0 });
    assert.ok(
        Object.isFrozen(command) &&
            Object.isFrozen(command.pointer) &&
            Object.isFrozen(command.viewport) &&
            Object.isFrozen(command.aimWorld)
    );

    for (let step = 0; step < 240; step += 1) {
        first.step(1 / 120, command);
        second.step(1 / 120, command);
    }
    const firstState = first.snapshot();
    const secondState = second.snapshot();
    assert.deepEqual(
        { position: firstState.player.position, velocity: firstState.player.velocity, resets: firstState.resets },
        { position: secondState.player.position, velocity: secondState.player.velocity, resets: secondState.resets },
        "the same commands and world seed must produce the same authoritative state"
    );
    assert.equal(firstState.tick, 240);

    const boundaryWorld = new GameSimulation({ playerId: "boundary-player" });
    assert.equal(boundaryWorld.getPrimaryPlayerId(), "boundary-player");
    assert.equal(boundaryWorld.hasPlayer("boundary-player"), true);
    assert.equal(boundaryWorld.hasPlayer("missing-player"), false);
    assert.equal(
        boundaryWorld.applyOwnerMotion("boundary-player", {
            position: { x: 160, y: 420 },
            velocity: { x: 320, y: -140 },
            angle: 0.4,
            angularVelocity: -1.5,
            isGrounded: false,
            rope: { isAttached: false, anchor: null, attachmentOffset: null }
        }),
        true
    );
    assert.deepEqual(boundaryWorld.playerState("boundary-player").position, { x: 160, y: 420 });
    assert.deepEqual(boundaryWorld.playerState("boundary-player").velocity, { x: 320, y: -140 });
    assert.ok(Math.abs(boundaryWorld.playerState("boundary-player").angle - 0.4) < Number.EPSILON * 4);
    assert.equal(boundaryWorld.playerState("boundary-player").angularVelocity, -1.5);
    const restoredPlayer = primaryPlayer(boundaryWorld);
    assert.equal(
        restoredPlayer.ropeObject.launcher.launch(
            restoredPlayer.physics.position,
            { x: 1, y: 0 },
            { x: restoredPlayer.physics.position.x + 80, y: restoredPlayer.physics.position.y }
        ),
        true
    );
    assert.equal(restoredPlayer.ropeObject.launcher.inFlight, true);
    boundaryWorld.applyOwnerMotion("boundary-player", {
        position: { x: 160, y: 420 },
        velocity: { x: 320, y: -140 },
        angle: 0.4,
        angularVelocity: -1.5,
        isGrounded: false,
        rope: { isAttached: false, anchor: null, attachmentOffset: null },
        launcher: null
    });
    assert.equal(
        restoredPlayer.ropeObject.launcher.inFlight,
        false,
        "an owner-motion restore with a null launcher must clear an already flying hook"
    );
    assert.equal(
        restoredPlayer.ropeObject.launcher.launch(
            restoredPlayer.physics.position,
            { x: 1, y: 0 },
            { x: restoredPlayer.physics.position.x + 80, y: restoredPlayer.physics.position.y }
        ),
        true
    );
    boundaryWorld.applyOwnerMotion("boundary-player", {
        position: { x: 160, y: 420 },
        velocity: { x: 320, y: -140 },
        angle: 0.4,
        angularVelocity: -1.5,
        isGrounded: false,
        rope: { isAttached: false, anchor: null, attachmentOffset: null }
    });
    assert.equal(
        restoredPlayer.ropeObject.launcher.inFlight,
        false,
        "an owner-motion restore without launcher state must clear an already flying hook"
    );
    for (const alias of [
        "player",
        "rope",
        "playerEntity",
        "aimWorld",
        "attachmentCandidate",
        "wasPointerDown",
        "attachBufferRemaining",
        "swingDrag"
    ]) {
        assert.equal(
            Object.hasOwn(boundaryWorld, alias) || alias in boundaryWorld,
            false,
            `${alias} alias must be removed`
        );
    }

    const sharedWorld = new GameSimulation();
    const sharedPrimary = primaryPlayer(sharedWorld);
    const partner = sharedWorld.addPlayer({ x: 180, y: 500 });
    assert.equal(sharedWorld.players.length, 2);
    assert.equal(sharedWorld.players[0], sharedPrimary);
    assert.equal(sharedWorld.players[1], partner.entity);
    assert.notEqual(partner.physics, sharedPrimary.physics);
    assert.notEqual(partner.rope, sharedPrimary.ropeObject.rope);
    assert.notEqual(partner.foundation, sharedPrimary.foundation);
    assert.equal(partner.physics.position.x, 180);
    sharedPrimary.ropeObject.aimWorld = { x: 40, y: 50 };
    sharedPrimary.ropeObject.swingDrag = { used: true };
    assert.equal(sharedPrimary.ropeObject.aimWorld.x, 40);
    assert.equal(sharedPrimary.ropeObject.swingDrag.used, true);
    assert.deepEqual(partner.entity.ropeObject.aimWorld, { x: 0, y: 0 });
    assert.equal(partner.entity.ropeObject.swingDrag, null);
    const primaryPosition = sharedPrimary.physics.position.clone();
    sharedWorld.dispatchOwnerInput(partner.entity.id, { ...command, horizontal: -1 }, 1 / 120);
    assert.ok(partner.physics.velocity.x < 0);
    assert.deepEqual(sharedPrimary.physics.position, primaryPosition);
    assert.equal(sharedWorld.world, sharedWorld.snapshot().world);

    const batchWorld = new GameSimulation();
    const batchPrimary = primaryPlayer(batchWorld);
    const batchPartner = batchWorld.addPlayer({ x: 180, y: 500 });
    const leftCommand = createPlayerCommand({ ...input, horizontal: -1 }, { x: 0, y: 0 });
    batchWorld.stepCommandBatch(
        1 / 120,
        createPlayerCommandBatch(1, [
            { playerId: batchPrimary.id, sequence: 0, command },
            { playerId: batchPartner.entity.id, sequence: 0, command: leftCommand }
        ])
    );
    assert.ok(batchPrimary.physics.velocity.x > 0);
    assert.ok(batchPartner.physics.velocity.x < 0);
    batchPartner.rope.attach(batchPartner.physics.position, {
        x: batchPartner.physics.position.x,
        y: batchPartner.physics.position.y - 80
    });
    batchPartner.entity.ropeObject.wasPointerDown = true;
    batchPartner.entity.ropeObject.lastPointer = { x: 200, y: 100, down: true };
    batchPartner.entity.ropeObject.lastViewport = { width: 1280, height: 720 };
    batchWorld.stepCommandBatch(
        1 / 120,
        createPlayerCommandBatch(2, [{ playerId: batchPrimary.id, sequence: 1, command }])
    );
    assert.equal(batchPartner.rope.isAttached, true, "a missing command must not invent a rope release");
    assert.throws(() => batchWorld.stepCommandBatch(1 / 120, createPlayerCommandBatch(4, [])), /must equal 3/);

    const eventRun = new GameSimulation();
    const eventPlayer = primaryPlayer(eventRun);
    const eventAuthority = new LocalAuthority(eventRun);
    eventPlayer.weapon.cooldown = 0;
    eventAuthority.step(1 / 120, command);
    assert.equal(
        eventRun.projectiles.length,
        0,
        "the retained automatic weapon system must be disabled for the default player"
    );
    eventPlayer.weapon.isEnabled = true;
    eventAuthority.step(1 / 120, command);
    const spawnEvents = eventAuthority.drainEvents();
    assert.equal(spawnEvents[0].eventType, "spawn");
    assert.equal(spawnEvents[0].tick, 2);
    assert.equal(spawnEvents[0].objectId, eventRun.projectiles[0].id);
    assert.equal(spawnEvents[0].parameters.predictionId, `${eventPlayer.id}:2`);
    assert.equal(
        eventPlayer.physics.collider.overlapsCircle(
            eventPlayer.physics.position,
            spawnEvents[0].position,
            spawnEvents[0].parameters.radius
        ),
        false,
        "single-player LocalAuthority must publish a projectile spawn outside the player collider"
    );
    assert.deepEqual(eventRun.drainReplicationEvents(), [], "replication events must drain exactly once");

    const target = eventRun.enemies.find((enemy) => enemy.id === eventRun.projectiles[0].targetId);
    eventRun.projectiles[0].position = target.position.clone();
    eventRun.step(0, command);
    const resolveEvents = eventRun.drainReplicationEvents().filter((event) => event.eventType === "resolve");
    assert.equal(resolveEvents[0].objectId, spawnEvents[0].objectId);
    assert.match(resolveEvents[0].resolution, /enemy-hit|enemy-defeated/);

    const localImpactSimulation = new GameSimulation();
    localImpactSimulation.enemies = [];
    const localImpactPlayer = primaryPlayer(localImpactSimulation);
    const localImpactAuthority = new LocalAuthority(localImpactSimulation);
    const localImpactProjectile = new BallisticProjectileObject({
        id: "local-enemy-impact",
        ownerId: "local-enemy",
        targetId: localImpactPlayer.id,
        position: localImpactPlayer.physics.position.clone(),
        velocity: localImpactPlayer.physics.velocity.clone(),
        radius: 7,
        damage: 20
    });
    localImpactSimulation.enemyProjectiles.push(localImpactProjectile);
    const localHealthBeforeImpact = localImpactPlayer.health;
    localImpactAuthority.step(0, command);
    assert.equal(
        localImpactPlayer.health,
        localHealthBeforeImpact,
        "the shared simulation must wait for a victim claim in single-player too"
    );
    const localImpactReceipt = localImpactAuthority.submitImpactClaim({
        projectileId: localImpactProjectile.id,
        clientTick: localImpactSimulation.tick,
        resolution: "player-hit",
        position: localImpactPlayer.physics.position
    });
    assert.equal(localImpactReceipt.accepted, true);
    assert.equal(localImpactPlayer.health, localHealthBeforeImpact - localImpactProjectile.damage);
    assert.equal(localImpactSimulation.metrics.damageTaken, localImpactProjectile.damage);

    const landingPlatform = {
        id: "fall-damage-platform",
        x: 0,
        y: 200,
        width: 240,
        height: 20,
        topY: 200,
        oneWay: true,
        vertices: [
            { x: 0, y: 200 },
            { x: 240, y: 200 },
            { x: 240, y: 220 },
            { x: 0, y: 220 }
        ]
    };
    const landingSimulation = new GameSimulation();
    landingSimulation.enemies = [];
    landingSimulation.activeCollisionSurfaces = [landingPlatform];
    const landingPlayer = primaryPlayer(landingSimulation);
    landingPlayer.physics.position.set(120, 180);
    landingPlayer.physics.velocity.set(0, 1100);
    const expectedFallDamage = fallDamageForImpactSpeed(
        1100 + landingPlayer.physics.config.gravity / 120,
        landingPlayer.maxHealth,
        FALL_DAMAGE_CONFIG
    );
    landingSimulation.step(1 / 120, { ...command, horizontal: 0 });
    assert.equal(landingPlayer.health, landingPlayer.maxHealth - expectedFallDamage);
    assert.equal(landingSimulation.metrics.damageTaken, expectedFallDamage);
    const landingDamageEvent = landingSimulation
        .drainReplicationEvents()
        .find(({ eventType }) => eventType === "player-fall-damaged");
    assert.equal(landingDamageEvent.damage, expectedFallDamage);
    assert.equal(landingDamageEvent.targetId, landingPlayer.id);
    const healthAfterLanding = landingPlayer.health;
    landingSimulation.step(1 / 120, { ...command, horizontal: 0 });
    assert.equal(landingPlayer.health, healthAfterLanding, "ground contact must not repeat fall damage each tick");

    const lethalLandingSimulation = new GameSimulation();
    lethalLandingSimulation.enemies = [];
    lethalLandingSimulation.activeCollisionSurfaces = [landingPlatform];
    lethalLandingSimulation.activeCheckpoint = lethalLandingSimulation.world.checkpoints[1];
    const lethalLandingPlayer = primaryPlayer(lethalLandingSimulation);
    lethalLandingPlayer.physics.position.set(120, 180);
    lethalLandingPlayer.physics.velocity.set(0, FALL_DAMAGE_CONFIG.lethalImpactSpeed);
    lethalLandingSimulation.step(1 / 120, { ...command, horizontal: 0 });
    assert.equal(lethalLandingPlayer.health, lethalLandingPlayer.maxHealth);
    assert.deepEqual(
        { x: lethalLandingPlayer.physics.position.x, y: lethalLandingPlayer.physics.position.y },
        {
            x: lethalLandingSimulation.activeCheckpoint.x,
            y: lethalLandingSimulation.activeCheckpoint.y
        },
        "a lethal landing must immediately respawn only that player at the active checkpoint"
    );
    assert.equal(lethalLandingSimulation.eventFlash.reason, "fall-damage");

    const ropeImpactSimulation = new GameSimulation();
    const ropeImpactPlayer = primaryPlayer(ropeImpactSimulation);
    const ropeImpactEnemy = ropeImpactSimulation.enemies[0];
    ropeImpactSimulation.enemies = [ropeImpactEnemy];
    ropeImpactSimulation.activeCollisionSurfaces = [];
    ropeImpactPlayer.physics.position.set(0, 0);
    ropeImpactPlayer.physics.velocity.set(ROPE_IMPACT_CONFIG.minimumSpeed + 100, 0);
    ropeImpactPlayer.ropeObject.rope.attach(ropeImpactPlayer.physics.position, { x: 0, y: -80 });
    ropeImpactEnemy.position.set(20, 0);
    const ropeImpactHealth = ropeImpactEnemy.health;
    ropeImpactSimulation.step(0, { ...command, horizontal: 0 });
    assert.equal(ropeImpactEnemy.health, ropeImpactHealth - ROPE_IMPACT_CONFIG.damage);
    const ropeImpactEvent = ropeImpactSimulation
        .drainReplicationEvents()
        .find((event) => event.eventType === "resolve" && event.parameters?.sourceKind === "rope-impact");
    assert.equal(ropeImpactEvent.resolution, "enemy-hit");
    assert.equal(ropeImpactEvent.parameters.damage, ROPE_IMPACT_CONFIG.damage);
    ropeImpactSimulation.step(0, { ...command, horizontal: 0 });
    assert.equal(
        ropeImpactEnemy.health,
        ropeImpactHealth - ROPE_IMPACT_CONFIG.damage,
        "remaining overlapped must not deal repeated rope collision damage"
    );
    ropeImpactEnemy.position.set(200, 0);
    ropeImpactSimulation.step(0, { ...command, horizontal: 0 });
    ropeImpactEnemy.position.set(20, 0);
    ropeImpactSimulation.step(0, { ...command, horizontal: 0 });
    assert.equal(
        ropeImpactEnemy.health,
        ropeImpactHealth - ROPE_IMPACT_CONFIG.damage * 2,
        "separating and making a new high-speed rope collision must rearm the attack"
    );

    const expirationSimulation = new GameSimulation();
    expirationSimulation.enemies = [];
    const expiringProjectile = new BallisticProjectileObject({
        id: "expiring-enemy-projectile",
        ownerId: "expiration-enemy",
        targetId: expirationSimulation.getPrimaryPlayerId(),
        position: new Vector2(-500, -500),
        velocity: new Vector2(10, 0),
        damage: 20,
        radius: 7
    });
    expiringProjectile.ageSeconds = COMBAT_CONFIG.enemyProjectileLifetimeSeconds - 1 / 120;
    expirationSimulation.enemyProjectiles.push(expiringProjectile);
    expirationSimulation.recordProjectileSpawn(expiringProjectile, "enemy-projectile");
    expirationSimulation.drainReplicationEvents();
    expirationSimulation.step(1 / 120, command);
    assert.equal(expirationSimulation.enemyProjectiles.length, 0);
    assert.equal(
        expirationSimulation.drainReplicationEvents().find(({ objectId }) => objectId === expiringProjectile.id)
            ?.resolution,
        "expired",
        "server projectile expiry must replicate as a deterministic resolve event"
    );

    const defeated = new GameSimulation();
    const defeatedPlayer = primaryPlayer(defeated);
    defeated.enemies = [];
    const respawnCheckpoint = defeated.world.checkpoints[2];
    defeated.activeCheckpoint = respawnCheckpoint;
    defeatedPlayer.health = 0;
    defeated.step(1 / 60, command);
    assert.equal(defeated.snapshot().runState, "playing", "death must not pause the shared world");
    assert.equal(defeated.snapshot().playerLifeState, "active");
    assert.equal(defeated.snapshot().playerHealth, defeated.snapshot().playerMaxHealth);
    assert.equal(defeated.snapshot().activeCheckpoint.id, respawnCheckpoint.id);
    assert.equal(defeated.snapshot().player.position.x, respawnCheckpoint.x);
    assert.equal(defeated.snapshot().player.position.y, respawnCheckpoint.y);
    assert.equal(defeated.snapshot().eventFlash.type, "checkpoint-respawn");
    assert.equal(defeated.snapshot().eventFlash.reason, "health");
    assert.equal(defeated.snapshot().metrics.defeats, 1);
    assert.equal(defeated.snapshot().resets, 1);
    const respawnEvent = defeated.drainReplicationEvents().find(({ eventType }) => eventType === "player-respawned");
    assert.equal(respawnEvent.playerId, defeatedPlayer.id);
    assert.equal(respawnEvent.reason, "health");
    assert.equal(respawnEvent.statusType, "checkpoint-respawn");
    assert.ok(Number.isFinite(respawnEvent.deathPosition.x));
    assert.ok(Number.isFinite(respawnEvent.deathPosition.y));
    assert.notDeepEqual(
        respawnEvent.deathPosition,
        respawnEvent.position,
        "the presentation event must preserve the pre-respawn position"
    );
    assert.equal(respawnEvent.artifactIds, undefined);

    const teamLoss = new GameSimulation();
    const teamPrimary = primaryPlayer(teamLoss);
    const lossPartner = teamLoss.addPlayer({ x: 150, y: 500 });
    const teamCheckpoint = teamLoss.world.checkpoints[2];
    teamLoss.activeCheckpoint = teamCheckpoint;
    teamPrimary.health = 0;
    lossPartner.entity.health = 0;
    teamLoss.step(1 / 120, command);
    assert.equal(teamLoss.runState, "playing", "simultaneous deaths must not create a team-wipe delay");
    for (const player of teamLoss.players) {
        assert.equal(player.lifeState, "active");
        assert.equal(player.physics.position.x, teamCheckpoint.x);
        assert.equal(player.physics.position.y, teamCheckpoint.y);
    }
    assert.equal(teamLoss.metrics.defeats, 2);
    assert.equal(teamLoss.resets, 2);

    const fallWorld = new GameSimulation();
    const fallPartner = fallWorld.addPlayer({ x: 150, y: 500 });
    fallWorld.enemies = [];
    const fallCheckpoint = fallWorld.world.checkpoints[1];
    fallWorld.activeCheckpoint = fallCheckpoint;
    fallPartner.entity.health = 12;
    fallPartner.physics.position.y = Number.POSITIVE_INFINITY;
    fallWorld.step(1 / 120, command);
    assert.equal(fallWorld.runState, "playing", "falling must not pause the cooperative world");
    assert.equal(fallPartner.entity.lifeState, "active");
    assert.equal(fallPartner.entity.health, fallPartner.entity.maxHealth);
    assert.equal(fallPartner.physics.position.x, fallCheckpoint.x);
    assert.equal(fallPartner.physics.position.y, fallCheckpoint.y);
    const fallEvent = fallWorld.drainReplicationEvents().find(({ eventType }) => eventType === "player-respawned");
    assert.equal(fallEvent.playerId, fallPartner.entity.id);
    assert.equal(fallEvent.reason, "fall");
    assert.ok(Number.isFinite(fallEvent.deathPosition.x));
    assert.ok(Number.isFinite(fallEvent.deathPosition.y));
    assert.equal(fallEvent.artifactIds, undefined);

    const soloFall = new GameSimulation();
    const soloPlayer = primaryPlayer(soloFall);
    soloFall.enemies = [];
    soloFall.activeCheckpoint = soloFall.world.checkpoints[1];
    soloPlayer.health = 25;
    soloPlayer.physics.position.y = Number.POSITIVE_INFINITY;
    soloFall.step(1 / 120, command);
    assert.equal(soloFall.runState, "playing");
    assert.equal(soloPlayer.lifeState, "active");
    assert.equal(soloPlayer.health, soloPlayer.maxHealth);
    assert.equal(soloPlayer.physics.position.x, soloFall.activeCheckpoint.x);
    assert.equal(soloPlayer.physics.position.y, soloFall.activeCheckpoint.y);
    assert.equal(soloFall.eventFlash.type, "checkpoint-respawn");
    assert.equal(soloFall.eventFlash.reason, "fall");

    const checkpointRun = new GameSimulation();
    const checkpointPlayer = primaryPlayer(checkpointRun);
    const targetCheckpoint = checkpointRun.world.checkpoints[2];
    checkpointPlayer.physics.position.x = targetCheckpoint.x;
    checkpointPlayer.physics.position.y = targetCheckpoint.y;
    checkpointRun.step(1 / 60, command);
    assert.equal(checkpointRun.snapshot().activeCheckpoint.id, targetCheckpoint.id);
    assert.equal(checkpointRun.snapshot().eventFlash.type, "checkpoint");
    const earlierCheckpoint = checkpointRun.world.checkpoints[1];
    checkpointPlayer.physics.position.x = earlierCheckpoint.x;
    checkpointPlayer.physics.position.y = earlierCheckpoint.y;
    checkpointRun.step(1 / 60, command);
    assert.equal(
        checkpointRun.snapshot().activeCheckpoint.id,
        targetCheckpoint.id,
        "checkpoint progress must not go backward"
    );

    const checkpointNoReward = new GameSimulation();
    const checkpointNoRewardPlayer = primaryPlayer(checkpointNoReward);
    const noRewardCheckpoint = checkpointNoReward.world.checkpoints[2];
    checkpointNoRewardPlayer.physics.position.x = noRewardCheckpoint.x;
    checkpointNoRewardPlayer.physics.position.y = noRewardCheckpoint.y;
    checkpointNoReward.step(1 / 60, command);
    assert.equal(checkpointNoReward.snapshot().activeCheckpoint.id, noRewardCheckpoint.id);
    assert.equal(
        checkpointNoReward.snapshot().foundationReward,
        null,
        "reaching a checkpoint must not open an artifact or reward chooser"
    );
    assert.equal(
        checkpointNoReward.snapshot().metrics.firstFoundationSeconds,
        null,
        "first Foundation time must remain unset until an actual Foundation selection"
    );
    assert.equal(checkpointNoRewardPlayer.weapon.fireInterval, COMBAT_CONFIG.fireInterval);
    assert.equal(checkpointNoRewardPlayer.weapon.damage, COMBAT_CONFIG.weaponDamage);

    const coopCheckpointRun = new GameSimulation();
    const coopPrimary = primaryPlayer(coopCheckpointRun);
    const coopPartner = coopCheckpointRun.addPlayer({ x: 160, y: 500 }).entity;
    const coopCheckpoint = coopCheckpointRun.world.checkpoints[1];
    coopPrimary.physics.position.set(120, 500);
    coopPartner.physics.position.set(coopCheckpoint.x, coopCheckpoint.y);
    const coopNeutral = { ...command, horizontal: 0, vertical: 0 };
    const commands = (primary, partner) =>
        new Map([
            [coopPrimary.id, primary],
            [coopPartner.id, partner]
        ]);
    coopCheckpointRun.stepPlayers(1 / 60, commands(coopNeutral, coopNeutral));
    assert.equal(
        coopCheckpointRun.snapshot().activeCheckpoint.id,
        coopCheckpoint.id,
        "either active player must activate the shared checkpoint"
    );
    assert.equal(coopCheckpointRun.foundationRewards.size, 0, "a shared checkpoint must not open a reward chooser");
    coopCheckpointRun.stepPlayers(1 / 60, commands({ ...coopNeutral, horizontal: 1 }, coopNeutral));
    assert.ok(coopPrimary.physics.velocity.x > 0, "movement must continue when no chooser is open");
}
