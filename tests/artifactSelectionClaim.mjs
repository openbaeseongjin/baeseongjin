import assert from "node:assert/strict";
import {
    ARTIFACT_SELECTION_CLAIM_PROTOCOL_VERSION,
    createArtifactSelectionClaim,
    deserializeArtifactSelectionClaim,
    serializeArtifactSelectionClaim
} from "../src/game/network/ArtifactSelectionClaim.js";

export function run() {
    const claim = createArtifactSelectionClaim({
        checkpointId: "checkpoint-8",
        artifactId: "rapid-gear",
        clientTick: 42
    });
    assert.equal(claim.protocolVersion, ARTIFACT_SELECTION_CLAIM_PROTOCOL_VERSION);
    assert.deepEqual(deserializeArtifactSelectionClaim(serializeArtifactSelectionClaim(claim)), claim);
    assert.throws(() => createArtifactSelectionClaim({ ...claim, checkpointId: "" }), /checkpointId/);
    assert.throws(() => createArtifactSelectionClaim({ ...claim, artifactId: "" }), /artifactId/);
    assert.throws(() => createArtifactSelectionClaim({ ...claim, clientTick: -1 }), /clientTick/);
}
