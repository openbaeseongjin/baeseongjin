import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import {
    createPlayerCommandBatch,
    deserializePlayerCommandBatch,
    serializePlayerCommandBatch
} from "../src/game/network/PlayerCommandBatch.js";

function command(horizontal, interact = false, action = false) {
    return createPlayerCommand(
        {
            horizontal,
            vertical: 0,
            interact,
            action,
            pointer: { x: 10, y: 20, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 30, y: 40 }
    );
}

export function run() {
    const reversed = createPlayerCommandBatch(7, [
        { playerId: "player-b", sequence: 12, command: command(-1) },
        { playerId: "player-a", sequence: 4, command: command(1) }
    ]);
    const ordered = createPlayerCommandBatch(7, [
        { playerId: "player-a", sequence: 4, command: command(1) },
        { playerId: "player-b", sequence: 12, command: command(-1) }
    ]);
    assert.equal(serializePlayerCommandBatch(reversed), serializePlayerCommandBatch(ordered));
    assert.deepEqual(
        reversed.commands.map(({ playerId, sequence }) => [playerId, sequence]),
        [
            ["player-a", 4],
            ["player-b", 12]
        ]
    );
    const restored = deserializePlayerCommandBatch(serializePlayerCommandBatch(reversed));
    assert.deepEqual(restored, reversed);
    const interacting = createPlayerCommandBatch(8, [{ playerId: "player-a", sequence: 5, command: command(0, true) }]);
    assert.equal(
        deserializePlayerCommandBatch(serializePlayerCommandBatch(interacting)).commands[0].command.interact,
        true
    );
    const acting = createPlayerCommandBatch(9, [
        { playerId: "player-a", sequence: 6, command: command(0, false, true) }
    ]);
    assert.equal(deserializePlayerCommandBatch(serializePlayerCommandBatch(acting)).commands[0].command.action, true);
    assert.ok(Object.isFrozen(restored) && Object.isFrozen(restored.commands[0].command.pointer));
    assert.throws(
        () =>
            createPlayerCommandBatch(0, [
                { playerId: "same", sequence: 0, command: command(0) },
                { playerId: "same", sequence: 1, command: command(0) }
            ]),
        /duplicate playerId/
    );
    assert.throws(() => createPlayerCommandBatch(-1, []), /tick/);
    assert.throws(() => deserializePlayerCommandBatch('{"protocolVersion":5,"tick":0,"commands":[]}'), /unsupported/);
    assert.throws(
        () => createPlayerCommandBatch(0, [{ playerId: "player", sequence: -1, command: command(0) }]),
        /sequence/
    );
    assert.throws(() => createPlayerCommandBatch(0, [{ playerId: "player", command: command(0) }]), /sequence/);
    assert.throws(
        () =>
            createPlayerCommandBatch(0, [
                { playerId: "player", sequence: 0, command: { ...command(0), horizontal: 2 } }
            ]),
        /movement axes/
    );
}
