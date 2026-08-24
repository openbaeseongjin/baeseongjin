export const AUGMENT_SELECTION_CLAIM_PROTOCOL_VERSION = 2;

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

export function createAugmentSelectionClaim({ sourceId, augmentId, clientTick, authorityTick }) {
    if (!Number.isSafeInteger(clientTick) || clientTick < 0) {
        throw new Error("clientTick must be a non-negative safe integer");
    }
    if (!Number.isSafeInteger(authorityTick) || authorityTick < 0) {
        throw new Error("authorityTick must be a non-negative safe integer");
    }
    return Object.freeze({
        protocolVersion: AUGMENT_SELECTION_CLAIM_PROTOCOL_VERSION,
        sourceId: requireId(sourceId, "sourceId"),
        augmentId: requireId(augmentId, "augmentId"),
        clientTick,
        authorityTick
    });
}

export function serializeAugmentSelectionClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeAugmentSelectionClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== AUGMENT_SELECTION_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported Augment selection claim protocol: ${parsed?.protocolVersion}`);
    }
    return createAugmentSelectionClaim(parsed);
}
