import { normalizeNetworkJson } from "./NetworkJson.js";

export const PLAYER_IMPACT_CLAIM_PROTOCOL_VERSION = 4;
const IMPACT_TYPES = new Set(["rope-cut", "player-hit"]);
const FNV_64_OFFSET = 0xcbf29ce484222325n;
const FNV_64_PRIME = 0x100000001b3n;

function assertTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error(`${label} must be a non-negative safe integer`);
    }
    return value;
}

function assertId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function assertBoolean(value, label) {
    if (typeof value !== "boolean") throw new Error(`${label} must be boolean`);
    return value;
}

function assertFinite(value, label, { minimum = -Infinity, exclusiveMinimum = false } = {}) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    if (exclusiveMinimum ? value <= minimum : value < minimum) {
        const comparison = exclusiveMinimum ? "greater than" : "at least";
        throw new Error(`${label} must be ${comparison} ${minimum}`);
    }
    return value;
}

function assertFiniteVector(value, label) {
    assertFinite(value?.x, `${label}.x`);
    assertFinite(value?.y, `${label}.y`);
    return value;
}

function assertArtifactList(value, label) {
    if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
    for (const [index, artifact] of value.entries()) {
        if (!artifact || Array.isArray(artifact) || typeof artifact !== "object") {
            throw new Error(`${label}[${index}] must be an object`);
        }
        assertId(artifact.id, `${label}[${index}].id`);
    }
    return value;
}

function assertSwingDrag(value, label) {
    if (value === null) return value;
    if (!value || Array.isArray(value) || typeof value !== "object") {
        throw new Error(`${label} must be an object or null`);
    }
    assertFiniteVector(value.origin, `${label}.origin`);
    if (value.direction !== null) assertFiniteVector(value.direction, `${label}.direction`);
    assertFinite(value.progress, `${label}.progress`, { minimum: 0 });
    assertFinite(value.age, `${label}.age`, { minimum: 0 });
    assertBoolean(value.used, `${label}.used`);
    return value;
}

function normalizeImpactRecoveryState(state) {
    if (!state || Array.isArray(state) || typeof state !== "object") {
        throw new Error("outcome.state must be an object");
    }
    const normalized = normalizeNetworkJson(state, "outcome.state");
    assertId(normalized.id, "outcome.state.id");
    assertFiniteVector(normalized.position, "outcome.state.position");
    assertFiniteVector(normalized.velocity, "outcome.state.velocity");
    assertFinite(normalized.angle, "outcome.state.angle");
    assertFinite(normalized.angularVelocity, "outcome.state.angularVelocity");
    assertBoolean(normalized.isGrounded, "outcome.state.isGrounded");
    assertFinite(normalized.maxHealth, "outcome.state.maxHealth", { minimum: 0, exclusiveMinimum: true });
    assertFinite(normalized.health, "outcome.state.health", { minimum: 0 });
    if (normalized.health > normalized.maxHealth) {
        throw new Error("outcome.state.health must not exceed outcome.state.maxHealth");
    }
    assertFinite(normalized.hitInvulnerabilityRemaining, "outcome.state.hitInvulnerabilityRemaining", {
        minimum: 0
    });
    assertFinite(normalized.ropeDisabledRemaining, "outcome.state.ropeDisabledRemaining", { minimum: 0 });
    if (normalized.lifeState !== "active") throw new Error("outcome.state.lifeState must be active");

    assertBoolean(normalized.rope?.isAttached, "outcome.state.rope.isAttached");
    if (normalized.rope.isAttached) {
        assertFiniteVector(normalized.rope.anchor, "outcome.state.rope.anchor");
        assertFiniteVector(normalized.rope.attachmentOffset, "outcome.state.rope.attachmentOffset");
        assertFinite(normalized.rope.length, "outcome.state.rope.length", { minimum: 0, exclusiveMinimum: true });
        assertFinite(normalized.rope.currentLength, "outcome.state.rope.currentLength", {
            minimum: 0,
            exclusiveMinimum: true
        });
    } else {
        if (normalized.rope.anchor !== null) throw new Error("outcome.state.rope.anchor must be null when detached");
        if (normalized.rope.attachmentOffset !== null) {
            throw new Error("outcome.state.rope.attachmentOffset must be null when detached");
        }
        if (normalized.rope.length !== 0 || normalized.rope.currentLength !== 0) {
            throw new Error("outcome.state detached rope lengths must be zero");
        }
    }
    assertFinite(normalized.rope.tension, "outcome.state.rope.tension", { minimum: 0 });

    assertFiniteVector(normalized.control?.aimWorld, "outcome.state.control.aimWorld");
    assertFinite(normalized.control?.lastPointer?.x, "outcome.state.control.lastPointer.x");
    assertFinite(normalized.control?.lastPointer?.y, "outcome.state.control.lastPointer.y");
    assertBoolean(normalized.control?.lastPointer?.down, "outcome.state.control.lastPointer.down");
    for (const flag of ["pressed", "released"]) {
        if (normalized.control.lastPointer[flag] !== undefined) {
            assertBoolean(normalized.control.lastPointer[flag], `outcome.state.control.lastPointer.${flag}`);
        }
    }
    assertFinite(normalized.control?.lastViewport?.width, "outcome.state.control.lastViewport.width", {
        minimum: 0,
        exclusiveMinimum: true
    });
    assertFinite(normalized.control?.lastViewport?.height, "outcome.state.control.lastViewport.height", {
        minimum: 0,
        exclusiveMinimum: true
    });
    assertBoolean(normalized.control?.wasPointerDown, "outcome.state.control.wasPointerDown");
    assertFinite(normalized.control?.attachBufferRemaining, "outcome.state.control.attachBufferRemaining", {
        minimum: 0
    });
    assertSwingDrag(normalized.control?.swingDrag, "outcome.state.control.swingDrag");

    assertFinite(normalized.weapon?.range, "outcome.state.weapon.range", { minimum: 0 });
    assertFinite(normalized.weapon?.damage, "outcome.state.weapon.damage", { minimum: 0 });
    assertFinite(normalized.weapon?.fireInterval, "outcome.state.weapon.fireInterval", {
        minimum: 0,
        exclusiveMinimum: true
    });
    assertFinite(normalized.weapon?.cooldown, "outcome.state.weapon.cooldown", { minimum: 0 });
    assertArtifactList(normalized.artifacts, "outcome.state.artifacts");
    assertFinite(normalized.ropeDamageBoostRemaining, "outcome.state.ropeDamageBoostRemaining", { minimum: 0 });
    assertArtifactList(normalized.lastCheckpointLoss, "outcome.state.lastCheckpointLoss");
    return normalized;
}

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
        angle: quantized(state.angle, 0.001),
        angularVelocity: quantized(state.angularVelocity, 0.001),
        isGrounded: state.isGrounded,
        maxHealth: quantized(state.maxHealth, 0.001),
        ropeDisabledTicks: quantized(state.ropeDisabledRemaining, 1 / 120),
        lifeState: state.lifeState,
        rope: {
            isAttached: state.rope.isAttached,
            anchor: state.rope.isAttached ? quantizedVector(state.rope.anchor, 0.1) : null,
            attachmentOffset: state.rope.isAttached ? quantizedVector(state.rope.attachmentOffset, 0.1) : null,
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
    assertTick(clientTick, "clientTick");
    if (!IMPACT_TYPES.has(impactType)) throw new Error(`unsupported impactType: ${impactType}`);
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
        throw new Error("position must contain finite x and y");
    }
    if (!Number.isFinite(velocity?.x) || !Number.isFinite(velocity?.y)) {
        throw new Error("velocity must contain finite x and y");
    }
    if (!Number.isFinite(damage) || damage < 0) throw new Error("damage must be non-negative and finite");
    if (!outcome || Array.isArray(outcome) || typeof outcome !== "object") {
        throw new Error("outcome must be an object");
    }
    assertBoolean(outcome.respawned, "outcome.respawned");
    if (!/^[0-9a-f]{16}$/.test(outcome.digest)) throw new Error("outcome.digest must be a 64-bit hex digest");
    if (impactType !== "player-hit" && outcome.respawned) {
        throw new Error("only player-hit impacts may respawn the victim");
    }

    const hasRecoveryState = outcome.state !== undefined;
    const hasRecoveryId = outcome.recoveryId !== undefined;
    const hasStateTick = outcome.stateTick !== undefined;
    if (hasRecoveryState !== hasRecoveryId || hasRecoveryState !== hasStateTick) {
        throw new Error("impact recovery requires state, stateTick, and recoveryId together");
    }
    const normalizedState = hasRecoveryState ? normalizeImpactRecoveryState(outcome.state) : null;
    if (
        normalizedState &&
        createPlayerImpactStateDigest(normalizedState, { impactType, respawned: outcome.respawned }) !== outcome.digest
    ) {
        throw new Error("outcome state does not match its digest");
    }
    const normalizedOutcome = Object.freeze({
        respawned: outcome.respawned,
        digest: outcome.digest,
        ...(normalizedState
            ? {
                  recoveryId: assertId(outcome.recoveryId, "outcome.recoveryId"),
                  stateTick: assertTick(outcome.stateTick, "outcome.stateTick"),
                  state: normalizedState
              }
            : {})
    });
    return Object.freeze({
        protocolVersion: PLAYER_IMPACT_CLAIM_PROTOCOL_VERSION,
        projectileId,
        clientTick,
        impactType,
        position: normalizeNetworkJson(position, "position"),
        velocity: normalizeNetworkJson(velocity, "velocity"),
        damage,
        outcome: normalizedOutcome
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

export function createPlayerImpactReceipt({
    projectileId,
    accepted,
    resolution = null,
    damage = 0,
    reason = null,
    recoveryId = null
}) {
    if (typeof projectileId !== "string" || projectileId.length === 0) {
        throw new Error("projectileId must be non-empty");
    }
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    if (!accepted) {
        if (typeof reason !== "string" || reason.length === 0) throw new Error("rejected receipt reason is required");
        if (reason === "state-diverged") {
            return Object.freeze({
                projectileId,
                accepted,
                reason,
                recoveryId: assertId(recoveryId, "recoveryId")
            });
        }
        if (recoveryId !== null) throw new Error("only state-diverged receipts may include recoveryId");
        return Object.freeze({ projectileId, accepted, reason });
    }
    if (recoveryId !== null) throw new Error("accepted impact receipts must not include recoveryId");
    if (!IMPACT_TYPES.has(resolution)) throw new Error(`unsupported impact resolution: ${resolution}`);
    if (!Number.isFinite(damage) || damage < 0) throw new Error("damage must be non-negative and finite");
    return Object.freeze({ projectileId, accepted, resolution, damage });
}
