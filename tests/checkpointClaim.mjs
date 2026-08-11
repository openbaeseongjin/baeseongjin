import assert from "node:assert/strict";
import {
    CHECKPOINT_CLAIM_PROTOCOL_VERSION,
    createCheckpointClaim,
    createCheckpointClaimReceipt,
    deserializeCheckpointClaim,
    serializeCheckpointClaim
} from "../src/game/network/CheckpointClaim.js";

export function run() {
    const claim = createCheckpointClaim({
        checkpointId: "checkpoint-8",
        clientTick: 42,
        position: { x: 120, y: 320 }
    });
    assert.equal(claim.protocolVersion, CHECKPOINT_CLAIM_PROTOCOL_VERSION);
    assert.deepEqual(deserializeCheckpointClaim(serializeCheckpointClaim(claim)), claim);
    assert.throws(() => createCheckpointClaim({ ...claim, checkpointId: "" }), /checkpointId/);
    assert.throws(() => createCheckpointClaim({ ...claim, clientTick: -1 }), /clientTick/);
    assert.throws(() => createCheckpointClaim({ ...claim, position: { x: Number.NaN, y: 0 } }), /position/);
    assert.throws(
        () => createCheckpointClaimReceipt({ checkpointId: claim.checkpointId, accepted: false }),
        /requires a reason/
    );
}
