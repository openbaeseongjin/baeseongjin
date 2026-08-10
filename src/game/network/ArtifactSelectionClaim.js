export const ARTIFACT_SELECTION_CLAIM_PROTOCOL_VERSION = 1;

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

export function createArtifactSelectionClaim({ checkpointId, artifactId, clientTick }) {
    if (!Number.isSafeInteger(clientTick) || clientTick < 0) {
        throw new Error("clientTick must be a non-negative safe integer");
    }
    return Object.freeze({
        protocolVersion: ARTIFACT_SELECTION_CLAIM_PROTOCOL_VERSION,
        checkpointId: requireId(checkpointId, "checkpointId"),
        artifactId: requireId(artifactId, "artifactId"),
        clientTick
    });
}

export function serializeArtifactSelectionClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeArtifactSelectionClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== ARTIFACT_SELECTION_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported artifact selection claim protocol: ${parsed?.protocolVersion}`);
    }
    return createArtifactSelectionClaim(parsed);
}
