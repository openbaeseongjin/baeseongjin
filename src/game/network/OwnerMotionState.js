import { normalizeNetworkJson } from "./NetworkJson.js";

export const OWNER_MOTION_STATE_PROTOCOL_VERSION = 1;

function finiteVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) throw new Error(`${label} must be finite`);
    return normalizeNetworkJson(value, label);
}

export function createOwnerMotionState({ clientTick, position, velocity, isGrounded, rope }) {
    if (!Number.isSafeInteger(clientTick) || clientTick < 0) throw new Error("clientTick must be non-negative");
    if (typeof isGrounded !== "boolean") throw new Error("isGrounded must be boolean");
    if (typeof rope?.isAttached !== "boolean") throw new Error("rope.isAttached must be boolean");
    return Object.freeze({
        protocolVersion: OWNER_MOTION_STATE_PROTOCOL_VERSION,
        clientTick,
        position: finiteVector(position, "position"),
        velocity: finiteVector(velocity, "velocity"),
        isGrounded,
        rope: Object.freeze({
            isAttached: rope.isAttached,
            anchor: rope.isAttached ? finiteVector(rope.anchor, "rope.anchor") : null
        })
    });
}

export function serializeOwnerMotionState(state) {
    return JSON.stringify(state);
}

export function deserializeOwnerMotionState(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== OWNER_MOTION_STATE_PROTOCOL_VERSION) {
        throw new Error(`unsupported owner motion state protocol: ${parsed?.protocolVersion}`);
    }
    return createOwnerMotionState(parsed);
}
