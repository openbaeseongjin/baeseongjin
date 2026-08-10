import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { CommandRecorder, createDeterminismDigest, replayCommands } from "../src/game/replay/CommandReplay.js";
import { LocalAuthority } from "../src/game/runtime/LocalAuthority.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

export function run() {
    const recorder = new CommandRecorder();
    for (let index = 0; index < 180; index += 1) {
        const command = createPlayerCommand(
            {
                horizontal: index < 90 ? 1 : -1,
                vertical: index === 30 ? -1 : 0,
                pointer: { x: 640, y: 160, down: false },
                viewport: { width: 1280, height: 720 }
            },
            { x: 200, y: 200 }
        );
        recorder.record(1 / 120, command);
    }
    const frames = recorder.snapshot();
    assert.ok(Object.isFrozen(frames) && Object.isFrozen(frames[0].command.pointer));
    assert.throws(() => recorder.record(0, frames[0].command), /positive finite dt/);

    const first = replayCommands(new LocalAuthority(new GameSimulation()), frames);
    const second = replayCommands(new LocalAuthority(new GameSimulation()), frames);
    assert.deepEqual(createDeterminismDigest(first), createDeterminismDigest(second));
}
