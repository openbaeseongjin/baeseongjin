import { normalizeNetworkJson } from "./NetworkJson.js";

export const PROJECTILE_HIT_CLAIM_PROTOCOL_VERSION = 1;

function assertId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function assertTick(value) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("clientTick must be a non-negative safe integer");
    return value;
}

export function createProjectileHitClaim({ predictionId, targetId, clientTick, position }) {
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
        throw new Error("position must contain finite x and y");
    }
    return Object.freeze({
        protocolVersion: PROJECTILE_HIT_CLAIM_PROTOCOL_VERSION,
        predictionId: assertId(predictionId, "predictionId"),
        targetId: assertId(targetId, "targetId"),
        clientTick: assertTick(clientTick),
        position: normalizeNetworkJson(position, "position")
    });
}

export function serializeProjectileHitClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeProjectileHitClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== PROJECTILE_HIT_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported projectile hit claim protocol: ${parsed?.protocolVersion}`);
    }
    return createProjectileHitClaim(parsed);
}
