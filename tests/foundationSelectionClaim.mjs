import assert from "node:assert/strict";
import {
    createFoundationSelectionClaim,
    deserializeFoundationSelectionClaim,
    serializeFoundationSelectionClaim
} from "../src/game/network/FoundationSelectionClaim.js";

export function run() {
    const claim = createFoundationSelectionClaim({
        sourceId: "sector-01-04:maintenance-node",
        foundationId: "relay-link",
        clientTick: 120
    });
    assert.deepEqual(deserializeFoundationSelectionClaim(serializeFoundationSelectionClaim(claim)), claim);
    assert.throws(() => createFoundationSelectionClaim({ ...claim, sourceId: "" }), /sourceId/);
    assert.throws(() => createFoundationSelectionClaim({ ...claim, foundationId: "" }), /foundationId/);
    assert.throws(() => createFoundationSelectionClaim({ ...claim, clientTick: -1 }), /clientTick/);
}
