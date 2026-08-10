import assert from "node:assert/strict";
import {
    createCommandReceipt,
    deserializeCommandReceipt,
    serializeCommandReceipt
} from "../src/game/network/CommandReceipt.js";

export function run() {
    const receipt = createCommandReceipt({
        serverTick: 10,
        targetTick: 12,
        accepted: [{ playerId: "player-b", sequence: 2 }],
        rejected: [{ playerId: "player-a", sequence: 3, reason: "elapsed-tick" }]
    });
    const roundTrip = deserializeCommandReceipt(serializeCommandReceipt(receipt));
    assert.deepEqual(roundTrip, receipt);
    assert.equal(Object.hasOwn(roundTrip.accepted[0], "command"), false);
    assert.throws(
        () => deserializeCommandReceipt(JSON.stringify({ ...receipt, protocolVersion: 99 })),
        /unsupported command receipt protocol/
    );
    assert.throws(
        () => createCommandReceipt({ serverTick: 0, targetTick: 1, rejected: [{ playerId: "p", sequence: 0 }] }),
        /rejection reason/
    );
}
