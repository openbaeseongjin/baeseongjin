import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { AuthorityCommandInbox } from "../src/game/network/AuthorityCommandInbox.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";

function entry(playerId, sequence, horizontal = 0) {
    return {
        playerId,
        sequence,
        command: createPlayerCommand(
            {
                horizontal,
                vertical: 0,
                pointer: { x: 0, y: 0, down: false },
                viewport: { width: 1280, height: 720 }
            },
            { x: 0, y: 0 }
        )
    };
}

export function run() {
    const inbox = new AuthorityCommandInbox({ maxPastTicks: 2, maxFutureTicks: 3 });

    const first = inbox.ingest(createPlayerCommandBatch(10, [entry("player-b", 0), entry("player-a", 4)]), 10);
    assert.deepEqual(first.rejected, []);
    assert.deepEqual(inbox.acknowledgements(), { "player-a": 4, "player-b": 0 });

    const stale = inbox.ingest(createPlayerCommandBatch(11, [entry("player-a", 4)]), 10);
    assert.equal(stale.rejected[0].reason, "stale-sequence");

    const replacement = inbox.ingest(createPlayerCommandBatch(10, [entry("player-a", 5, -1)]), 10);
    assert.equal(replacement.accepted.length, 1);
    const tickTen = inbox.take(10);
    assert.deepEqual(
        tickTen.commands.map(({ playerId, sequence, command }) => [playerId, sequence, command.horizontal]),
        [
            ["player-a", 5, -1],
            ["player-b", 0, 0]
        ]
    );
    assert.equal(inbox.take(10).commands.length, 0, "a tick must be consumed only once");

    const past = inbox.ingest(createPlayerCommandBatch(7, [entry("player-a", 6)]), 10);
    assert.equal(past.rejected[0].reason, "past-tick");
    const future = inbox.ingest(createPlayerCommandBatch(14, [entry("player-a", 6)]), 10);
    assert.equal(future.rejected[0].reason, "future-tick");
    assert.deepEqual(inbox.acknowledgements(), { "player-a": 5, "player-b": 0 });

    const boundary = inbox.ingest(createPlayerCommandBatch(13, [entry("player-a", 6)]), 10);
    assert.equal(boundary.accepted.length, 1);
    assert.equal(inbox.take(13).commands[0].sequence, 6);
}
