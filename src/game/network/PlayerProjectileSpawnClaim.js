import { normalizeNetworkJson } from "./NetworkJson.js";

export const PLAYER_PROJECTILE_SPAWN_CLAIM_PROTOCOL_VERSION = 1;

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

export function createPlayerProjectileSpawnClaim({ predictionId, clientTick, targetId, position }) {
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
        throw new Error("position must contain finite x and y");
    }
    return Object.freeze({
        protocolVersion: PLAYER_PROJECTILE_SPAWN_CLAIM_PROTOCOL_VERSION,
        predictionId: assertId(predictionId, "predictionId"),
        clientTick: assertTick(clientTick),
        targetId: assertId(targetId, "targetId"),
        position: normalizeNetworkJson(position, "position")
    });
}

export function serializePlayerProjectileSpawnClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializePlayerProjectileSpawnClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== PLAYER_PROJECTILE_SPAWN_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported player projectile spawn claim protocol: ${parsed?.protocolVersion}`);
    }
    return createPlayerProjectileSpawnClaim(parsed);
}

export function createPlayerProjectileSpawnReceipt({ predictionId, accepted, projectileId, reason }) {
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    const receipt = {
        predictionId: assertId(predictionId, "predictionId"),
        accepted
    };
    if (accepted) receipt.projectileId = assertId(projectileId, "projectileId");
    else receipt.reason = assertId(reason, "reason");
    return Object.freeze(receipt);
}
