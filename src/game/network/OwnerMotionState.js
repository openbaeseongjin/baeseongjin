import { normalizeNetworkJson } from "./NetworkJson.js";

export const OWNER_MOTION_STATE_PROTOCOL_VERSION = 2;

function assertTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

function finiteVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) throw new Error(`${label} must be finite`);
    return normalizeNetworkJson(value, label);
}

export function createOwnerMotionState({
    clientTick,
    position,
    velocity,
    angle = 0,
    angularVelocity = 0,
    isGrounded,
    rope
}) {
    if (typeof isGrounded !== "boolean") throw new Error("isGrounded must be boolean");
    if (typeof rope?.isAttached !== "boolean") throw new Error("rope.isAttached must be boolean");
    if (!Number.isFinite(angle)) throw new Error("angle must be finite");
    if (!Number.isFinite(angularVelocity)) throw new Error("angularVelocity must be finite");
    return Object.freeze({
        protocolVersion: OWNER_MOTION_STATE_PROTOCOL_VERSION,
        clientTick: assertTick(clientTick, "clientTick"),
        position: finiteVector(position, "position"),
        velocity: finiteVector(velocity, "velocity"),
        angle,
        angularVelocity,
        isGrounded,
        rope: Object.freeze({
            isAttached: rope.isAttached,
            anchor: rope.isAttached ? finiteVector(rope.anchor, "rope.anchor") : null,
            attachmentOffset: rope.isAttached ? finiteVector(rope.attachmentOffset, "rope.attachmentOffset") : null
        })
    });
}

export function createOwnerMotionReceipt({ clientTick, accepted, reason, resolution, ropeReleased }) {
    if (typeof accepted !== "boolean") throw new Error("accepted must be boolean");
    if (!accepted && (typeof reason !== "string" || reason.length === 0)) {
        throw new Error("rejected owner motion receipt requires a reason");
    }
    if (resolution !== undefined && (typeof resolution !== "string" || resolution.length === 0)) {
        throw new Error("resolution must be non-empty when provided");
    }
    if (ropeReleased !== undefined && typeof ropeReleased !== "boolean") {
        throw new Error("ropeReleased must be boolean when provided");
    }
    return Object.freeze({
        clientTick: assertTick(clientTick, "clientTick"),
        accepted,
        ...(reason === undefined ? {} : { reason }),
        ...(resolution === undefined ? {} : { resolution }),
        ...(ropeReleased === undefined ? {} : { ropeReleased })
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
