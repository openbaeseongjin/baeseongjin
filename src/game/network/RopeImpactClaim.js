import { normalizeNetworkJson } from "./NetworkJson.js";

export const ROPE_IMPACT_CLAIM_PROTOCOL_VERSION = 1;
const ROPE_IMPACT_TARGET_KIND = Object.freeze({ enemy: true, boss: true });

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function requireTargetKind(value) {
    if (!Object.hasOwn(ROPE_IMPACT_TARGET_KIND, value)) throw new Error("targetKind must be enemy or boss");
    return value;
}

function requireVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return normalizeNetworkJson(value, label);
}

export function createRopeImpactClaim({
    predictionId,
    targetId,
    targetKind = "enemy",
    clientTick,
    position,
    velocity
}) {
    if (!Number.isSafeInteger(clientTick) || clientTick < 0) {
        throw new Error("clientTick must be a non-negative safe integer");
    }
    return Object.freeze({
        protocolVersion: ROPE_IMPACT_CLAIM_PROTOCOL_VERSION,
        predictionId: requireId(predictionId, "predictionId"),
        targetId: requireId(targetId, "targetId"),
        targetKind: requireTargetKind(targetKind),
        clientTick,
        position: requireVector(position, "position"),
        velocity: requireVector(velocity, "velocity")
    });
}

export function createRopeImpactReceipt({
    predictionId,
    accepted,
    reason,
    resolution,
    damage = 0,
    normalDamage = damage,
    weakpointDamage = 0,
    weakpointHit = false
}) {
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    if (!accepted && (typeof reason !== "string" || reason.length === 0)) {
        throw new Error("rejected rope impact receipt requires a reason");
    }
    if (
        accepted &&
        resolution !== "enemy-hit" &&
        resolution !== "enemy-defeated" &&
        resolution !== "target-already-dead" &&
        resolution !== "boss-hit" &&
        resolution !== "boss-phase-completed" &&
        resolution !== "boss-defeated"
    ) {
        throw new Error("accepted rope impact receipt requires an impact resolution");
    }
    if (!Number.isFinite(damage) || damage < 0) throw new Error("damage must be non-negative");
    if (!Number.isFinite(normalDamage) || normalDamage < 0) throw new Error("normalDamage must be non-negative");
    if (!Number.isFinite(weakpointDamage) || weakpointDamage < 0) {
        throw new Error("weakpointDamage must be non-negative");
    }
    if (typeof weakpointHit !== "boolean") throw new Error("weakpointHit must be boolean");
    return Object.freeze({
        predictionId: requireId(predictionId, "predictionId"),
        accepted,
        ...(reason === undefined ? {} : { reason }),
        ...(resolution === undefined ? {} : { resolution }),
        damage,
        normalDamage,
        weakpointDamage,
        weakpointHit
    });
}

export function serializeRopeImpactClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeRopeImpactClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== ROPE_IMPACT_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported rope impact claim protocol: ${parsed?.protocolVersion}`);
    }
    return createRopeImpactClaim(parsed);
}
