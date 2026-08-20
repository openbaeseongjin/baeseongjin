import { normalizeNetworkJson } from "./NetworkJson.js";

export const AUGMENT_IMPACT_CLAIM_PROTOCOL_VERSION = 2;

const ACCEPTED_RESOLUTIONS = new Set(["applied", "shield-blocked", "target-already-dead", "duplicate"]);
const REJECTED_REASONS = new Set(["target-missing", "invalid"]);

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function requireNonNegativeSafeInteger(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error(`${label} must be a non-negative safe integer`);
    }
    return value;
}

function requireNonNegativeNumber(value, label) {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`${label} must be a non-negative finite number`);
    }
    return value;
}

function requireVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return normalizeNetworkJson(value, label);
}

function requireKnockback(value) {
    if (value === undefined) return undefined;
    const direction = requireVector(value.direction, "knockback.direction");
    return Object.freeze({
        direction,
        distance: requireNonNegativeNumber(value.distance, "knockback.distance"),
        duration: requireNonNegativeNumber(value.duration, "knockback.duration")
    });
}

export function createAugmentImpactClaim({
    eventId,
    predictionId,
    sourcePlayerId,
    targetId,
    clientTick,
    effectId,
    sourceKind,
    sourcePosition,
    contactPosition,
    damage,
    impactSpeed,
    knockback
}) {
    return Object.freeze({
        protocolVersion: AUGMENT_IMPACT_CLAIM_PROTOCOL_VERSION,
        eventId: requireId(eventId, "eventId"),
        predictionId: requireId(predictionId, "predictionId"),
        sourcePlayerId: requireId(sourcePlayerId, "sourcePlayerId"),
        targetId: requireId(targetId, "targetId"),
        clientTick: requireNonNegativeSafeInteger(clientTick, "clientTick"),
        effectId: requireId(effectId, "effectId"),
        sourceKind: requireId(sourceKind, "sourceKind"),
        sourcePosition: requireVector(sourcePosition, "sourcePosition"),
        contactPosition: requireVector(contactPosition, "contactPosition"),
        damage: requireNonNegativeNumber(damage, "damage"),
        ...(impactSpeed === undefined ? {} : { impactSpeed: requireNonNegativeNumber(impactSpeed, "impactSpeed") }),
        ...(knockback === undefined ? {} : { knockback: requireKnockback(knockback) })
    });
}

export function createAugmentImpactReceipt({
    eventId,
    predictionId,
    accepted,
    resolution,
    reason,
    damage = 0,
    knockbackApplied = false
}) {
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    if (accepted) {
        if (!ACCEPTED_RESOLUTIONS.has(resolution)) {
            throw new Error("accepted augment impact receipt requires a supported resolution");
        }
        if (reason !== undefined)
            throw new Error("accepted augment impact receipt must not include a rejection reason");
    } else {
        if (!REJECTED_REASONS.has(reason)) {
            throw new Error("rejected augment impact receipt requires a supported reason");
        }
        if (resolution !== undefined) throw new Error("rejected augment impact receipt must not include a resolution");
    }
    if (typeof knockbackApplied !== "boolean") throw new Error("knockbackApplied must be boolean");
    return Object.freeze({
        protocolVersion: AUGMENT_IMPACT_CLAIM_PROTOCOL_VERSION,
        eventId: requireId(eventId, "eventId"),
        predictionId: requireId(predictionId, "predictionId"),
        accepted,
        ...(resolution === undefined ? {} : { resolution }),
        ...(reason === undefined ? {} : { reason }),
        damage: requireNonNegativeNumber(damage, "damage"),
        knockbackApplied
    });
}

export function serializeAugmentImpactClaim(claim) {
    return JSON.stringify(claim);
}

export function deserializeAugmentImpactClaim(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== AUGMENT_IMPACT_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported augment impact claim protocol: ${parsed?.protocolVersion}`);
    }
    return createAugmentImpactClaim(parsed);
}

export function serializeAugmentImpactReceipt(receipt) {
    return JSON.stringify(receipt);
}

export function deserializeAugmentImpactReceipt(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== AUGMENT_IMPACT_CLAIM_PROTOCOL_VERSION) {
        throw new Error(`unsupported augment impact receipt protocol: ${parsed?.protocolVersion}`);
    }
    return createAugmentImpactReceipt(parsed);
}
