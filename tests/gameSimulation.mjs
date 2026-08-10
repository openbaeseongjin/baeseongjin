import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
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
            isGrounded: false,
            rope: { isAttached: false, anchor: null }
        }),
        true
    );
    assert.deepEqual(boundaryWorld.playerState("boundary-player").position, { x: 160, y: 420 });
    assert.deepEqual(boundaryWorld.playerState("boundary-player").velocity, { x: 320, y: -140 });
    for (const alias of [
        "player",
        "rope",
        "artifacts",
        "playerEntity",
        "aimWorld",
        "attachmentCandidate",
        "wasPointerDown",
        "attachBufferRemaining",
        "swingDrag",
        "ropeDamageBoostRemaining",
        "lastCheckpointLoss",
        "artifactReward"
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
    assert.notEqual(partner.rope, sharedPrimary.rope);
    assert.notEqual(partner.artifacts, sharedPrimary.artifacts);
    assert.equal(partner.physics.position.x, 180);
    sharedPrimary.aimWorld = { x: 40, y: 50 };
    sharedPrimary.swingDrag = { used: true };
    assert.equal(sharedPrimary.aimWorld.x, 40);
    assert.equal(sharedPrimary.swingDrag.used, true);
    assert.deepEqual(partner.entity.aimWorld, { x: 0, y: 0 });
    assert.equal(partner.entity.swingDrag, null);
    const primaryPosition = sharedPrimary.physics.position.clone();
    sharedWorld.updatePlayer(partner.entity, { ...command, horizontal: -1 }, 1 / 120);
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
    batchPartner.entity.wasPointerDown = true;
    batchPartner.entity.lastPointer = { x: 200, y: 100, down: true };
    batchPartner.entity.lastViewport = { width: 1280, height: 720 };
    batchWorld.stepCommandBatch(
        1 / 120,
        createPlayerCommandBatch(2, [{ playerId: batchPrimary.id, sequence: 1, command }])
    );
    assert.equal(batchPartner.rope.isAttached, true, "a missing command must not invent a rope release");
    assert.throws(() => batchWorld.stepCommandBatch(1 / 120, createPlayerCommandBatch(4, [])), /must equal 3/);

    const eventRun = new GameSimulation();
    const eventPlayer = primaryPlayer(eventRun);
    eventPlayer.weapon.cooldown = 0;
    eventRun.step(1 / 120, command);
    const spawnEvents = eventRun.drainReplicationEvents();
    assert.equal(spawnEvents[0].eventType, "spawn");
    assert.equal(spawnEvents[0].tick, 1);
    assert.equal(spawnEvents[0].objectId, eventRun.projectiles[0].id);
    assert.equal(spawnEvents[0].parameters.predictionId, `${eventPlayer.id}:1`);
    assert.deepEqual(eventRun.drainReplicationEvents(), [], "replication events must drain exactly once");

    const target = eventRun.enemies.find((enemy) => enemy.id === eventRun.projectiles[0].targetId);
    eventRun.projectiles[0].position = target.position.clone();
    eventRun.step(0, command);
    const resolveEvents = eventRun.drainReplicationEvents().filter((event) => event.eventType === "resolve");
    assert.equal(resolveEvents[0].objectId, spawnEvents[0].objectId);
    assert.match(resolveEvents[0].resolution, /enemy-hit|enemy-defeated/);

    const defeated = new GameSimulation();
    const defeatedPlayer = primaryPlayer(defeated);
    defeated.enemies = [];
    const respawnCheckpoint = defeated.world.checkpoints[2];
    defeated.activeCheckpoint = respawnCheckpoint;
    for (const id of ["a", "b", "c"]) defeatedPlayer.artifacts.add({ id });
    defeatedPlayer.health = 0;
    defeated.step(1 / 60, command);
    assert.equal(defeated.snapshot().runState, "playing", "death must not pause the shared world");
    assert.equal(defeated.snapshot().playerLifeState, "active");
    assert.equal(defeated.snapshot().playerHealth, defeated.snapshot().playerMaxHealth);
    assert.equal(defeated.snapshot().activeCheckpoint.id, respawnCheckpoint.id);
    assert.equal(defeated.snapshot().player.position.x, respawnCheckpoint.x);
    assert.equal(defeated.snapshot().player.position.y, respawnCheckpoint.y);
    assert.deepEqual(
        defeated.snapshot().artifacts.map((artifact) => artifact.id),
        ["a", "b"]
    );
    assert.deepEqual(
        defeated.snapshot().lastCheckpointLoss.map((artifact) => artifact.id),
        ["c"]
    );
    assert.equal(defeated.snapshot().eventFlash.type, "artifact-loss");
    assert.equal(defeated.snapshot().eventFlash.reason, "health");
    assert.equal(defeated.snapshot().metrics.defeats, 1);
    assert.equal(defeated.snapshot().resets, 1);
    const respawnEvent = defeated.drainReplicationEvents().find(({ eventType }) => eventType === "player-respawned");
    assert.equal(respawnEvent.playerId, defeatedPlayer.id);
    assert.equal(respawnEvent.reason, "health");
    assert.deepEqual(respawnEvent.artifactIds, ["c"]);

    const teamLoss = new GameSimulation();
    const teamPrimary = primaryPlayer(teamLoss);
    const lossPartner = teamLoss.addPlayer({ x: 150, y: 500 });
    const teamCheckpoint = teamLoss.world.checkpoints[2];
    teamLoss.activeCheckpoint = teamCheckpoint;
    for (const id of ["a1", "a2", "a3"]) teamPrimary.artifacts.add({ id });
    for (const id of ["b1", "b2", "b3"]) lossPartner.artifacts.add({ id });
    teamPrimary.health = 0;
    lossPartner.entity.health = 0;
    teamLoss.step(1 / 120, command);
    assert.equal(teamLoss.runState, "playing", "simultaneous deaths must not create a team-wipe delay");
    for (const player of teamLoss.players) {
        assert.equal(player.lifeState, "active");
        assert.equal(player.physics.position.x, teamCheckpoint.x);
        assert.equal(player.physics.position.y, teamCheckpoint.y);
        assert.equal(player.artifacts.snapshot().length, 2);
        assert.equal(player.lastCheckpointLoss.length, 1);
    }
    assert.deepEqual(
        teamPrimary.lastCheckpointLoss.map(({ id }) => id),
        ["a3"]
    );
    assert.deepEqual(
        lossPartner.entity.lastCheckpointLoss.map(({ id }) => id),
        ["b3"]
    );
    const lossEvents = teamLoss.drainReplicationEvents().filter(({ eventType }) => eventType === "artifact-loss");
    assert.deepEqual(lossEvents.map(({ playerId }) => playerId).sort(), teamLoss.players.map(({ id }) => id).sort());
    assert.equal(teamLoss.metrics.defeats, 2);
    assert.equal(teamLoss.resets, 2);

    const fallWorld = new GameSimulation();
    const fallPartner = fallWorld.addPlayer({ x: 150, y: 500 });
    fallWorld.enemies = [];
    const fallCheckpoint = fallWorld.world.checkpoints[1];
    fallWorld.activeCheckpoint = fallCheckpoint;
    fallPartner.entity.health = 12;
    for (const id of ["f1", "f2", "f3"]) fallPartner.entity.artifacts.add({ id });
    fallPartner.physics.position.y = Number.POSITIVE_INFINITY;
    fallWorld.step(1 / 120, command);
    assert.equal(fallWorld.runState, "playing", "falling must not pause the cooperative world");
    assert.equal(fallPartner.entity.lifeState, "active");
    assert.equal(fallPartner.entity.health, fallPartner.entity.maxHealth);
    assert.equal(fallPartner.physics.position.x, fallCheckpoint.x);
    assert.equal(fallPartner.physics.position.y, fallCheckpoint.y);
    assert.deepEqual(
        fallPartner.entity.artifacts.snapshot().map(({ id }) => id),
        ["f1", "f2"]
    );
    const fallEvent = fallWorld.drainReplicationEvents().find(({ eventType }) => eventType === "player-respawned");
    assert.equal(fallEvent.playerId, fallPartner.entity.id);
    assert.equal(fallEvent.reason, "fall");
    assert.deepEqual(fallEvent.artifactIds, ["f3"]);

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

    const completed = new GameSimulation();
    const completedPlayer = primaryPlayer(completed);
    completedPlayer.rope.attach(completedPlayer.physics.position, {
        x: completedPlayer.physics.position.x,
        y: completedPlayer.physics.position.y - 100
    });
    completedPlayer.physics.position.x = completed.world.summit.x;
    completedPlayer.physics.position.y = completed.world.summit.y;
    completed.step(1 / 120, command);
    assert.equal(completed.snapshot().runState, "completed");
    assert.equal(completed.snapshot().rope.isAttached, false);
    completedPlayer.health = 1;
    completed.step(1, command);
    assert.equal(completed.snapshot().playerHealth, 1, "combat and physics must pause after completion");
    completed.step(20, command);
    assert.equal(
        completed.snapshot().runState,
        "completed",
        "the summit ends the single large world without a stage restart"
    );
    assert.equal(completed.snapshot().playerHealth, 1);

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

    const rewardRun = new GameSimulation();
    const rewardPlayer = primaryPlayer(rewardRun);
    const firstRewardCheckpoint = rewardRun.world.checkpoints[1];
    rewardPlayer.physics.position.x = firstRewardCheckpoint.x;
    rewardPlayer.physics.position.y = firstRewardCheckpoint.y;
    rewardRun.step(1 / 60, command);
    assert.equal(rewardRun.snapshot().artifactReward.selectedIndex, 0);
    const rewardStartedSeconds = rewardRun.snapshot().metrics.activeSeconds;
    const firstRewardSeconds = rewardRun.snapshot().metrics.firstRewardSeconds;
    const choosingVelocityX = rewardPlayer.physics.velocity.x;
    rewardRun.step(1 / 60, { ...command, horizontal: 1, vertical: -1 });
    assert.ok(
        rewardRun.snapshot().metrics.activeSeconds > rewardStartedSeconds,
        "artifact choice time must remain part of the live world"
    );
    assert.equal(rewardPlayer.physics.velocity.x, choosingVelocityX, "reward navigation must not also move the player");
    assert.equal(rewardRun.snapshot().metrics.checkpointsReached, 1);
    assert.equal(rewardRun.snapshot().metrics.firstRewardSeconds, firstRewardSeconds);
    const neutralCommand = { ...command, horizontal: 0, vertical: 0 };
    rewardRun.step(1 / 60, neutralCommand);
    rewardRun.step(1 / 60, { ...neutralCommand, horizontal: 1 });
    assert.equal(rewardRun.snapshot().artifactReward.selectedIndex, 1);
    rewardRun.step(1 / 60, neutralCommand);
    rewardRun.step(1 / 60, { ...neutralCommand, vertical: -1 });
    assert.equal(rewardRun.snapshot().artifactReward, null);
    assert.equal(rewardRun.snapshot().artifacts[0].id, "rapid-gear");
    assert.equal(rewardPlayer.weapon.fireInterval, 0.65 * 0.75);
    assert.equal(rewardRun.snapshot().eventFlash.artifact.id, "rapid-gear");
    assert.deepEqual(rewardRun.snapshot().rewardedCheckpointIds, [firstRewardCheckpoint.id]);

    const secondRewardCheckpoint = rewardRun.world.checkpoints[2];
    rewardPlayer.physics.position.x = secondRewardCheckpoint.x;
    rewardPlayer.physics.position.y = secondRewardCheckpoint.y;
    rewardRun.step(1 / 60, neutralCommand);
    rewardRun.step(1 / 60, { ...neutralCommand, horizontal: 1 });
    rewardRun.step(1 / 60, neutralCommand);
    rewardRun.step(1 / 60, { ...neutralCommand, vertical: -1 });
    assert.deepEqual(
        rewardRun.snapshot().artifacts.map((artifact) => artifact.id),
        ["rapid-gear", "rapid-gear"]
    );
    assert.equal(rewardPlayer.weapon.fireInterval, 0.65 * 0.75 * 0.75);
    rewardPlayer.physics.position.x = firstRewardCheckpoint.x;
    rewardPlayer.physics.position.y = firstRewardCheckpoint.y;
    rewardRun.step(1 / 60, neutralCommand);
    assert.equal(
        rewardRun.snapshot().artifactReward,
        null,
        "revisiting an earlier checkpoint must not duplicate rewards"
    );

    const coopRewardRun = new GameSimulation();
    const coopPrimary = primaryPlayer(coopRewardRun);
    const coopPartner = coopRewardRun.addPlayer({ x: 160, y: 500 }).entity;
    const coopCheckpoint = coopRewardRun.world.checkpoints[1];
    coopPrimary.physics.position.set(120, 500);
    coopPartner.physics.position.set(coopCheckpoint.x, coopCheckpoint.y);
    const coopNeutral = { ...command, horizontal: 0, vertical: 0 };
    const commands = (primary, partner) =>
        new Map([
            [coopPrimary.id, primary],
            [coopPartner.id, partner]
        ]);
    coopRewardRun.stepPlayers(1 / 60, commands(coopNeutral, coopNeutral));
    assert.equal(
        coopRewardRun.snapshot().activeCheckpoint.id,
        coopCheckpoint.id,
        "either active player must activate the shared checkpoint"
    );
    assert.equal(coopRewardRun.artifactRewards.size, 2);
    const pausedPartnerPosition = coopPartner.physics.position.clone();
    coopRewardRun.stepPlayers(1 / 60, commands({ ...coopNeutral, vertical: -1 }, { ...coopNeutral, horizontal: 1 }));
    assert.equal(coopPrimary.artifacts.snapshot()[0].id, "power-core");
    assert.equal(coopPartner.artifacts.snapshot().length, 0, "one choice must not change the partner inventory");
    assert.equal(coopRewardRun.artifactRewards.size, 1);
    assert.equal(coopPartner.physics.position.x, pausedPartnerPosition.x, "reward navigation must not move its owner");
    coopRewardRun.stepPlayers(1 / 60, commands({ ...coopNeutral, horizontal: 1 }, coopNeutral));
    assert.ok(coopPrimary.physics.velocity.x > 0, "a player who chose must keep moving while a partner decides");
    coopRewardRun.stepPlayers(1 / 60, commands(coopNeutral, { ...coopNeutral, vertical: -1 }));
    assert.equal(coopRewardRun.artifactRewards.size, 0);
    assert.equal(coopPartner.artifacts.snapshot()[0].id, "rapid-gear");
    assert.deepEqual([...coopRewardRun.rewardedCheckpointIds], [coopCheckpoint.id]);
}
