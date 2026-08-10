import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { LocalAuthority } from "../src/game/runtime/LocalAuthority.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

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

    const sharedWorld = new GameSimulation();
    const partner = sharedWorld.addPlayer({ x: 180, y: 500 });
    assert.equal(sharedWorld.players.length, 2);
    assert.equal(sharedWorld.players[0], sharedWorld.playerEntity);
    assert.equal(sharedWorld.players[1], partner.entity);
    assert.notEqual(partner.physics, sharedWorld.player);
    assert.notEqual(partner.rope, sharedWorld.rope);
    assert.notEqual(partner.artifacts, sharedWorld.artifacts);
    assert.equal(partner.physics.position.x, 180);
    assert.equal(sharedWorld.world, sharedWorld.snapshot().world);

    const eventRun = new GameSimulation();
    eventRun.playerEntity.weapon.cooldown = 0;
    eventRun.step(1 / 120, command);
    const spawnEvents = eventRun.drainReplicationEvents();
    assert.equal(spawnEvents[0].eventType, "spawn");
    assert.equal(spawnEvents[0].tick, 1);
    assert.equal(spawnEvents[0].objectId, eventRun.projectiles[0].id);
    assert.deepEqual(eventRun.drainReplicationEvents(), [], "replication events must drain exactly once");

    const target = eventRun.enemies.find((enemy) => enemy.id === eventRun.projectiles[0].targetId);
    eventRun.projectiles[0].position = target.position.clone();
    eventRun.step(0, command);
    const resolveEvents = eventRun.drainReplicationEvents().filter((event) => event.eventType === "resolve");
    assert.equal(resolveEvents[0].objectId, spawnEvents[0].objectId);
    assert.match(resolveEvents[0].resolution, /enemy-hit|enemy-defeated/);

    const defeated = new GameSimulation();
    defeated.playerEntity.health = 0;
    defeated.enemies.pop();
    const expectedEnemyCount = defeated.enemies.length;
    const respawnCheckpoint = defeated.world.checkpoints[2];
    defeated.activeCheckpoint = respawnCheckpoint;
    for (const id of ["a", "b", "c"]) defeated.artifacts.add({ id });
    defeated.step(1 / 60, command);
    assert.equal(defeated.snapshot().runState, "defeated");
    const defeatActiveSeconds = defeated.snapshot().metrics.activeSeconds;
    assert.equal(defeated.snapshot().playerLifeState, "downed");
    assert.equal(defeated.snapshot().defeatReason, "health");
    defeated.projectiles.push({ id: "stale-player-shot" });
    defeated.enemyProjectiles.push({ id: "stale-enemy-shot" });
    defeated.step(2, command);
    assert.equal(defeated.snapshot().runState, "playing");
    assert.equal(defeated.snapshot().playerHealth, defeated.snapshot().playerMaxHealth);
    assert.equal(defeated.snapshot().enemies.length, expectedEnemyCount);
    assert.equal(defeated.snapshot().projectiles.length, 0);
    assert.equal(defeated.snapshot().enemyProjectiles.length, 0);
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
    assert.equal(
        defeated.snapshot().metrics.activeSeconds,
        defeatActiveSeconds,
        "defeat delay must not count as active play"
    );
    assert.equal(defeated.snapshot().metrics.defeats, 1);

    const completed = new GameSimulation();
    completed.rope.attach(completed.player.position, {
        x: completed.player.position.x,
        y: completed.player.position.y - 100
    });
    completed.player.position.x = completed.world.summit.x;
    completed.player.position.y = completed.world.summit.y;
    completed.step(1 / 120, command);
    assert.equal(completed.snapshot().runState, "completed");
    assert.equal(completed.snapshot().rope.isAttached, false);
    assert.equal(completed.snapshot().restartRemaining, 0);
    completed.playerEntity.health = 1;
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
    const targetCheckpoint = checkpointRun.world.checkpoints[2];
    checkpointRun.player.position.x = targetCheckpoint.x;
    checkpointRun.player.position.y = targetCheckpoint.y;
    checkpointRun.step(1 / 60, command);
    assert.equal(checkpointRun.snapshot().activeCheckpoint.id, targetCheckpoint.id);
    assert.equal(checkpointRun.snapshot().eventFlash.type, "checkpoint");
    const earlierCheckpoint = checkpointRun.world.checkpoints[1];
    checkpointRun.player.position.x = earlierCheckpoint.x;
    checkpointRun.player.position.y = earlierCheckpoint.y;
    checkpointRun.step(1 / 60, command);
    assert.equal(
        checkpointRun.snapshot().activeCheckpoint.id,
        targetCheckpoint.id,
        "checkpoint progress must not go backward"
    );

    const rewardRun = new GameSimulation();
    const firstRewardCheckpoint = rewardRun.world.checkpoints[1];
    rewardRun.player.position.x = firstRewardCheckpoint.x;
    rewardRun.player.position.y = firstRewardCheckpoint.y;
    rewardRun.step(1 / 60, command);
    assert.equal(rewardRun.snapshot().artifactReward.selectedIndex, 0);
    const rewardPausedSeconds = rewardRun.snapshot().metrics.activeSeconds;
    const pausedPosition = rewardRun.player.position.clone();
    rewardRun.step(1, command);
    assert.deepEqual(rewardRun.player.position, pausedPosition, "artifact selection must pause world physics");
    assert.equal(
        rewardRun.snapshot().metrics.activeSeconds,
        rewardPausedSeconds,
        "reward choice time must stay excluded"
    );
    assert.equal(rewardRun.snapshot().metrics.checkpointsReached, 1);
    assert.equal(rewardRun.snapshot().metrics.firstRewardSeconds, rewardPausedSeconds);
    const neutralCommand = { ...command, horizontal: 0, vertical: 0 };
    rewardRun.step(1 / 60, neutralCommand);
    rewardRun.step(1 / 60, { ...neutralCommand, horizontal: 1 });
    assert.equal(rewardRun.snapshot().artifactReward.selectedIndex, 1);
    rewardRun.step(1 / 60, neutralCommand);
    rewardRun.step(1 / 60, { ...neutralCommand, vertical: -1 });
    assert.equal(rewardRun.snapshot().artifactReward, null);
    assert.equal(rewardRun.snapshot().artifacts[0].id, "rapid-gear");
    assert.equal(rewardRun.playerEntity.weapon.fireInterval, 0.65 * 0.75);
    assert.equal(rewardRun.snapshot().eventFlash.artifact.id, "rapid-gear");
    assert.deepEqual(rewardRun.snapshot().rewardedCheckpointIds, [firstRewardCheckpoint.id]);

    const secondRewardCheckpoint = rewardRun.world.checkpoints[2];
    rewardRun.player.position.x = secondRewardCheckpoint.x;
    rewardRun.player.position.y = secondRewardCheckpoint.y;
    rewardRun.step(1 / 60, neutralCommand);
    rewardRun.step(1 / 60, { ...neutralCommand, horizontal: 1 });
    rewardRun.step(1 / 60, neutralCommand);
    rewardRun.step(1 / 60, { ...neutralCommand, vertical: -1 });
    assert.deepEqual(
        rewardRun.snapshot().artifacts.map((artifact) => artifact.id),
        ["rapid-gear", "rapid-gear"]
    );
    assert.equal(rewardRun.playerEntity.weapon.fireInterval, 0.65 * 0.75 * 0.75);
    rewardRun.player.position.x = firstRewardCheckpoint.x;
    rewardRun.player.position.y = firstRewardCheckpoint.y;
    rewardRun.step(1 / 60, neutralCommand);
    assert.equal(
        rewardRun.snapshot().artifactReward,
        null,
        "revisiting an earlier checkpoint must not duplicate rewards"
    );
}
