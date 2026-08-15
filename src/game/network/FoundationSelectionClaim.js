export const FOUNDATION_SELECTION_CLAIM_PROTOCOL_VERSION = 1;

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

export function createFoundationSelectionClaim({ sourceId, foundationId, clientTick }) {
    if (!Number.isSafeInteger(clientTick) || clientTick < 0) {
        throw new Error("clientTick must be a non-negative safe integer");
    }
    return Object.freeze({
        protocolVersion: FOUNDATION_SELECTION_CLAIM_PROTOCOL_VERSION,
        sourceId: requireId(sourceId, "sourceId"),
        foundationId: requireId(foundationId, "foundationId"),
        clientTick
    });
}

export function serializeFoundationSelectionClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeFoundationSelectionClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== FOUNDATION_SELECTION_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported Foundation selection claim protocol: ${parsed?.protocolVersion}`);
    }
    return createFoundationSelectionClaim(parsed);
}
