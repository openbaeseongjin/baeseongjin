import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { LocalAuthority } from "../src/game/runtime/LocalAuthority.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

export function run() {
    const first = new LocalAuthority(new GameSimulation());
    const second = new LocalAuthority(new GameSimulation());
    const input = { horizontal: 1, vertical: 0, pointer: { x: 0, y: 0, down: false } };
    const command = createPlayerCommand(input, { x: 0, y: 0 });
    assert.ok(Object.isFrozen(command) && Object.isFrozen(command.pointer) && Object.isFrozen(command.aimWorld));

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
}
