import { normalizeNetworkJson } from "./NetworkJson.js";

export const ROPE_SWING_CLAIM_PROTOCOL_VERSION = 1;

function assertId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function assertTick(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error("clientTick must be a non-negative safe integer");
    }
    return value;
}

function assertVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return normalizeNetworkJson(value, label);
}

export function createRopeSwingClaim({ predictionId, clientTick, position, anchor }) {
    return Object.freeze({
        protocolVersion: ROPE_SWING_CLAIM_PROTOCOL_VERSION,
        predictionId: assertId(predictionId, "predictionId"),
        clientTick: assertTick(clientTick),
        position: assertVector(position, "position"),
        anchor: assertVector(anchor, "anchor")
    });
}

export function serializeRopeSwingClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeRopeSwingClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== ROPE_SWING_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported rope swing claim protocol: ${parsed?.protocolVersion}`);
    }
    return createRopeSwingClaim(parsed);
}

export function createRopeSwingReceipt({ predictionId, accepted, duration, reason }) {
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    const receipt = {
        predictionId: assertId(predictionId, "predictionId"),
        accepted
    };
    if (accepted) {
        if (!Number.isFinite(duration) || duration <= 0) throw new Error("duration must be positive");
        receipt.duration = duration;
    } else {
        receipt.reason = assertId(reason, "reason");
    }
    return Object.freeze(receipt);
}
