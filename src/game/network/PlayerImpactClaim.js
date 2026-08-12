import { normalizeNetworkJson } from "./NetworkJson.js";

export const PLAYER_IMPACT_CLAIM_PROTOCOL_VERSION = 2;
const IMPACT_TYPES = new Set(["rope-cut", "player-hit"]);
const FNV_64_OFFSET = 0xcbf29ce484222325n;
const FNV_64_PRIME = 0x100000001b3n;

function quantized(value, step) {
    return Math.round(value / step);
}

function quantizedVector(value, step) {
    return { x: quantized(value.x, step), y: quantized(value.y, step) };
}

function impactStateProjection(state, { impactType, respawned }) {
    if (impactType === "rope-cut") {
        return {
            ropeDisabledTicks: quantized(state.ropeDisabledRemaining, 1 / 120),
            ropeAttached: state.rope.isAttached
        };
    }
    const projection = {
        health: quantized(state.health, 0.001),
        velocity: quantizedVector(state.velocity, 0.1),
        hitInvulnerabilityTicks: quantized(state.hitInvulnerabilityRemaining, 1 / 120)
    };
    if (!respawned) return projection;
    return {
        ...projection,
        position: quantizedVector(state.position, 0.1),
        isGrounded: state.isGrounded,
        maxHealth: quantized(state.maxHealth, 0.001),
        ropeDisabledTicks: quantized(state.ropeDisabledRemaining, 1 / 120),
        lifeState: state.lifeState,
        rope: {
            isAttached: state.rope.isAttached,
            anchor: state.rope.isAttached ? quantizedVector(state.rope.anchor, 0.1) : null,
            length: quantized(state.rope.length, 0.1),
            currentLength: quantized(state.rope.currentLength, 0.1)
        },
        weapon: {
            range: quantized(state.weapon.range, 0.001),
            damage: quantized(state.weapon.damage, 0.001),
            fireInterval: quantized(state.weapon.fireInterval, 0.001),
            cooldownTicks: quantized(state.weapon.cooldown, 1 / 120)
        },
        artifacts: state.artifacts.map(({ id }) => id),
        ropeDamageBoostTicks: quantized(state.ropeDamageBoostRemaining, 1 / 120),
        lastCheckpointLoss: state.lastCheckpointLoss.map(({ id }) => id)
    };
}

export function createPlayerImpactStateDigest(state, { impactType, respawned }) {
    if (!IMPACT_TYPES.has(impactType)) throw new Error(`unsupported impactType: ${impactType}`);
    if (typeof respawned !== "boolean") throw new Error("respawned must be boolean");
    const serialized = JSON.stringify(impactStateProjection(state, { impactType, respawned }));
    let hash = FNV_64_OFFSET;
    for (let index = 0; index < serialized.length; index += 1) {
        hash ^= BigInt(serialized.charCodeAt(index));
        hash = BigInt.asUintN(64, hash * FNV_64_PRIME);
    }
    return hash.toString(16).padStart(16, "0");
}

export function createPlayerImpactClaim({
    projectileId,
    clientTick,
    impactType,
    position,
    velocity,
    damage = 0,
    outcome
}) {
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
    if (!Number.isFinite(velocity?.x) || !Number.isFinite(velocity?.y)) {
        throw new Error("velocity must contain finite x and y");
    }
    if (!Number.isFinite(damage) || damage < 0) throw new Error("damage must be non-negative and finite");
    if (
        typeof outcome !== "object" ||
        typeof outcome.respawned !== "boolean" ||
        !/^[0-9a-f]{16}$/.test(outcome.digest) ||
        (outcome.state !== undefined && (typeof outcome.state !== "object" || outcome.state === null))
    ) {
        throw new Error("outcome must contain respawned, digest, and optional state");
    }
    if (impactType !== "player-hit" && outcome.respawned) {
        throw new Error("only player-hit impacts may respawn the victim");
    }
    if (
        outcome.state &&
        createPlayerImpactStateDigest(outcome.state, { impactType, respawned: outcome.respawned }) !== outcome.digest
    ) {
        throw new Error("outcome state does not match its digest");
    }
    return Object.freeze({
        protocolVersion: PLAYER_IMPACT_CLAIM_PROTOCOL_VERSION,
        projectileId,
        clientTick,
        impactType,
        position: normalizeNetworkJson(position, "position"),
        velocity: normalizeNetworkJson(velocity, "velocity"),
        damage,
        outcome: normalizeNetworkJson(outcome, "outcome")
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

export function createPlayerImpactReceipt({ projectileId, accepted, resolution = null, damage = 0, reason = null }) {
    if (typeof projectileId !== "string" || projectileId.length === 0) {
        throw new Error("projectileId must be non-empty");
    }
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    if (!accepted) {
        if (typeof reason !== "string" || reason.length === 0) throw new Error("rejected receipt reason is required");
        return Object.freeze({ projectileId, accepted, reason });
    }
    if (!IMPACT_TYPES.has(resolution)) throw new Error(`unsupported impact resolution: ${resolution}`);
    if (!Number.isFinite(damage) || damage < 0) throw new Error("damage must be non-negative and finite");
    return Object.freeze({ projectileId, accepted, resolution, damage });
}
