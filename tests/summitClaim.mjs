import assert from "node:assert/strict";
import {
    SUMMIT_CLAIM_PROTOCOL_VERSION,
    createSummitClaim,
    createSummitClaimReceipt,
    deserializeSummitClaim,
    serializeSummitClaim
} from "../src/game/network/SummitClaim.js";

export function run() {
    const claim = createSummitClaim({ clientTick: 42, position: { x: 120, y: 320 } });
    assert.equal(claim.protocolVersion, SUMMIT_CLAIM_PROTOCOL_VERSION);
    assert.deepEqual(deserializeSummitClaim(serializeSummitClaim(claim)), claim);
    assert.throws(() => createSummitClaim({ ...claim, clientTick: -1 }), /clientTick/);
    assert.throws(() => createSummitClaim({ ...claim, position: { x: Number.NaN, y: 0 } }), /position/);
    assert.throws(() => createSummitClaimReceipt({ accepted: false }), /requires a reason/);
}
