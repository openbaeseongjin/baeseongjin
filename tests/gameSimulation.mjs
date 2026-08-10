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
}
