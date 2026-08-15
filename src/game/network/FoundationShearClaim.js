import { normalizeNetworkJson } from "./NetworkJson.js";

export const FOUNDATION_SHEAR_CLAIM_PROTOCOL_VERSION = 1;

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function requireVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) throw new Error(`${label} must be finite`);
    return normalizeNetworkJson(value, label);
}

export function createFoundationShearClaim({ predictionId, targetId, targetKind, clientTick, anchor, playerPosition }) {
    if (!Number.isSafeInteger(clientTick) || clientTick < 0) {
        throw new Error("clientTick must be a non-negative safe integer");
    }
    if (targetKind !== "enemy" && targetKind !== "calibration-dummy") {
        throw new Error("targetKind must be enemy or calibration-dummy");
    }
    return Object.freeze({
        protocolVersion: FOUNDATION_SHEAR_CLAIM_PROTOCOL_VERSION,
        predictionId: requireId(predictionId, "predictionId"),
        targetId: requireId(targetId, "targetId"),
        targetKind,
        clientTick,
        anchor: requireVector(anchor, "anchor"),
        playerPosition: requireVector(playerPosition, "playerPosition")
    });
}

export function createFoundationShearReceipt({ predictionId, accepted, reason, resolution, damage = 0 }) {
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    if (!accepted && (typeof reason !== "string" || reason.length === 0)) {
        throw new Error("rejected Foundation Shear receipt requires a reason");
    }
    if (resolution !== undefined && (typeof resolution !== "string" || resolution.length === 0)) {
        throw new Error("resolution must be non-empty when provided");
    }
    if (!Number.isFinite(damage) || damage < 0) throw new Error("damage must be non-negative");
    return Object.freeze({
        predictionId: requireId(predictionId, "predictionId"),
        accepted,
        ...(reason === undefined ? {} : { reason }),
        ...(resolution === undefined ? {} : { resolution }),
        damage
    });
}

export function serializeFoundationShearClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeFoundationShearClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== FOUNDATION_SHEAR_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported Foundation Shear claim protocol: ${parsed?.protocolVersion}`);
    }
    return createFoundationShearClaim(parsed);
}
