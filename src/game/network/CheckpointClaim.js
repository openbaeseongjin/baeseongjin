import { normalizeNetworkJson } from "./NetworkJson.js";

export const CHECKPOINT_CLAIM_PROTOCOL_VERSION = 2;

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function requireTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

function requirePosition(value) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) throw new Error("position must be finite");
    return normalizeNetworkJson(value, "position");
}

export function createCheckpointClaim({ checkpointId, clientTick, authorityTick, position }) {
    return Object.freeze({
        protocolVersion: CHECKPOINT_CLAIM_PROTOCOL_VERSION,
        checkpointId: requireId(checkpointId, "checkpointId"),
        clientTick: requireTick(clientTick, "clientTick"),
        authorityTick: requireTick(authorityTick, "authorityTick"),
        position: requirePosition(position)
    });
}

export function createCheckpointClaimReceipt({ checkpointId, accepted, reason, resolution }) {
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    if (!accepted && (typeof reason !== "string" || reason.length === 0)) {
        throw new Error("rejected checkpoint receipt requires a reason");
    }
    if (resolution !== undefined && (typeof resolution !== "string" || resolution.length === 0)) {
        throw new Error("resolution must be non-empty when provided");
    }
    return Object.freeze({
        checkpointId: requireId(checkpointId, "checkpointId"),
        accepted,
        ...(reason === undefined ? {} : { reason }),
        ...(resolution === undefined ? {} : { resolution })
    });
}

export function serializeCheckpointClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeCheckpointClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== CHECKPOINT_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported checkpoint claim protocol: ${parsed?.protocolVersion}`);
    }
    return createCheckpointClaim(parsed);
}
