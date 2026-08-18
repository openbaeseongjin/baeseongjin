import { normalizeNetworkJson } from "./NetworkJson.js";
import { ropeHookFlightSeconds, ropeHookReach } from "../config.js";

export const OWNER_MOTION_STATE_PROTOCOL_VERSION = 4;
const LAUNCHER_NUMERIC_TOLERANCE = 1e-6;

function assertTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

function finiteVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) throw new Error(`${label} must be finite`);
    return normalizeNetworkJson(value, label);
}

function finiteNonNegative(value, label) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be non-negative`);
    return value;
}

function normalizeLauncher(launcher) {
    if (launcher === undefined || launcher === null) return null;
    if (typeof launcher !== "object" || Array.isArray(launcher)) throw new Error("launcher must be an object");
    finiteNonNegative(launcher.cooldownRemaining, "launcher.cooldownRemaining");
    if (launcher.shot === null || launcher.shot === undefined) {
        return Object.freeze({ shot: null, cooldownRemaining: launcher.cooldownRemaining });
    }
    const shot = launcher.shot;
    if (typeof shot !== "object" || Array.isArray(shot)) throw new Error("launcher.shot must be an object");
    const direction = finiteVector(shot.direction, "launcher.shot.direction");
    const magnitude = Math.hypot(direction.x, direction.y);
    if (magnitude <= 0 || Math.abs(magnitude - 1) > LAUNCHER_NUMERIC_TOLERANCE) {
        throw new Error("launcher.shot.direction must be approximately normalized");
    }
    finiteNonNegative(shot.traveled, "launcher.shot.traveled");
    finiteNonNegative(shot.elapsed, "launcher.shot.elapsed");
    if (shot.traveled > ropeHookReach() * 1.2 + LAUNCHER_NUMERIC_TOLERANCE) {
        throw new Error("launcher.shot.traveled must not exceed the hook reach");
    }
    if (shot.elapsed > ropeHookFlightSeconds() * 1.2 + LAUNCHER_NUMERIC_TOLERANCE) {
        throw new Error("launcher.shot.elapsed must not exceed the hook flight lifetime");
    }
    return Object.freeze({
        shot: Object.freeze({
            origin: finiteVector(shot.origin, "launcher.shot.origin"),
            direction,
            target:
                shot.target !== null && shot.target !== undefined
                    ? finiteVector(shot.target, "launcher.shot.target")
                    : null,
            traveled: shot.traveled,
            elapsed: shot.elapsed
        }),
        cooldownRemaining: launcher.cooldownRemaining
    });
}

export function createOwnerMotionState({
    clientTick,
    position,
    velocity,
    angle = 0,
    angularVelocity = 0,
    isGrounded,
    rope,
    launcher = null,
    augmentRuntimeState = null
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
        }),
        launcher: normalizeLauncher(launcher),
        augmentRuntimeState:
            augmentRuntimeState === null
                ? null
                : normalizeNetworkJson(JSON.parse(JSON.stringify(augmentRuntimeState)), "augmentRuntimeState")
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
