import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import {
    createPlayerCommandBatch,
    deserializePlayerCommandBatch,
    serializePlayerCommandBatch
} from "../src/game/network/PlayerCommandBatch.js";

function command(horizontal) {
    return createPlayerCommand(
        {
            horizontal,
            vertical: 0,
            pointer: { x: 10, y: 20, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 30, y: 40 }
    );
}

export function run() {
    const reversed = createPlayerCommandBatch(7, [
        { playerId: "player-b", command: command(-1) },
        { playerId: "player-a", command: command(1) }
    ]);
    const ordered = createPlayerCommandBatch(7, [
        { playerId: "player-a", command: command(1) },
        { playerId: "player-b", command: command(-1) }
    ]);
    assert.equal(serializePlayerCommandBatch(reversed), serializePlayerCommandBatch(ordered));
    assert.deepEqual(
        reversed.commands.map(({ playerId }) => playerId),
        ["player-a", "player-b"]
    );
    const restored = deserializePlayerCommandBatch(serializePlayerCommandBatch(reversed));
    assert.deepEqual(restored, reversed);
    assert.ok(Object.isFrozen(restored) && Object.isFrozen(restored.commands[0].command.pointer));
    assert.throws(
        () =>
            createPlayerCommandBatch(0, [
                { playerId: "same", command: command(0) },
                { playerId: "same", command: command(0) }
            ]),
        /duplicate playerId/
    );
    assert.throws(() => createPlayerCommandBatch(-1, []), /tick/);
    assert.throws(() => deserializePlayerCommandBatch('{"protocolVersion":2,"tick":0,"commands":[]}'), /unsupported/);
    assert.throws(
        () => createPlayerCommandBatch(0, [{ playerId: "player", command: { ...command(0), horizontal: 2 } }]),
        /movement axes/
    );
}
