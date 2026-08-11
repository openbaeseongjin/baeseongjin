import { normalizeNetworkJson } from "./NetworkJson.js";

export const SUMMIT_CLAIM_PROTOCOL_VERSION = 1;

function requireTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

function requirePosition(value) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) throw new Error("position must be finite");
    return normalizeNetworkJson(value, "position");
}

export function createSummitClaim({ clientTick, position }) {
    return Object.freeze({
        protocolVersion: SUMMIT_CLAIM_PROTOCOL_VERSION,
        clientTick: requireTick(clientTick, "clientTick"),
        position: requirePosition(position)
    });
}

export function createSummitClaimReceipt({ accepted, reason, resolution }) {
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    if (!accepted && (typeof reason !== "string" || reason.length === 0)) {
        throw new Error("rejected summit receipt requires a reason");
    }
    if (resolution !== undefined && (typeof resolution !== "string" || resolution.length === 0)) {
        throw new Error("resolution must be non-empty when provided");
    }
    return Object.freeze({
        accepted,
        ...(reason === undefined ? {} : { reason }),
        ...(resolution === undefined ? {} : { resolution })
    });
}

export function serializeSummitClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeSummitClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== SUMMIT_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported summit claim protocol: ${parsed?.protocolVersion}`);
    }
    return createSummitClaim(parsed);
}
