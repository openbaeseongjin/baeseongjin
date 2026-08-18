export const AUGMENT_OFFER_CLAIM_PROTOCOL_VERSION = 1;

export function createAugmentOfferClaim({ sourceId, clientTick }) {
    if (typeof sourceId !== "string" || sourceId.length === 0) throw new Error("sourceId must be non-empty");
    if (!Number.isSafeInteger(clientTick) || clientTick < 0) {
        throw new Error("clientTick must be a non-negative safe integer");
    }
    return Object.freeze({ protocolVersion: AUGMENT_OFFER_CLAIM_PROTOCOL_VERSION, sourceId, clientTick });
}

export function serializeAugmentOfferClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeAugmentOfferClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== AUGMENT_OFFER_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported Augment offer claim protocol: ${parsed?.protocolVersion}`);
    }
    return createAugmentOfferClaim(parsed);
}
