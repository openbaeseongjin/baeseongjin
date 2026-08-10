import { normalizeNetworkJson } from "./NetworkJson.js";

export const PLAYER_IMPACT_CLAIM_PROTOCOL_VERSION = 1;
const IMPACT_TYPES = new Set(["rope-cut", "player-hit"]);

export function createPlayerImpactClaim({ projectileId, clientTick, impactType, position }) {
    if (typeof projectileId !== "string" || projectileId.length === 0) {
        throw new Error("projectileId must be non-empty");
    }
    if (!Number.isSafeInteger(clientTick) || clientTick < 0) {
        throw new Error("clientTick must be a non-negative safe integer");
    }
    if (!IMPACT_TYPES.has(impactType)) throw new Error(`unsupported impactType: ${impactType}`);
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
        throw new Error("position must contain finite x and y");
    }
    return Object.freeze({
        protocolVersion: PLAYER_IMPACT_CLAIM_PROTOCOL_VERSION,
        projectileId,
        clientTick,
        impactType,
        position: normalizeNetworkJson(position, "position")
    });
}

export function serializePlayerImpactClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializePlayerImpactClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== PLAYER_IMPACT_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported player impact claim protocol: ${parsed?.protocolVersion}`);
    }
    return createPlayerImpactClaim(parsed);
}
