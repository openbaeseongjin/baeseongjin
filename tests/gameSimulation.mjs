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

    const defeated = new GameSimulation();
    defeated.playerEntity.health = 0;
    defeated.enemies.pop();
    const expectedEnemyCount = defeated.world.enemySpawns.length;
    defeated.step(1 / 60, command);
    assert.equal(defeated.snapshot().runState, "defeated");
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
}
