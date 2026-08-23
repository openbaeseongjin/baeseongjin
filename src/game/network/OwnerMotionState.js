import { normalizeNetworkJson } from "./NetworkJson.js";
import { ropeHookFlightSeconds, ropeHookReach } from "../config.js";

export const OWNER_MOTION_STATE_PROTOCOL_VERSION = 9;
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

function ropeAnchorOwner(rope) {
    const ownerId = rope?.anchorOwnerId ?? null;
    const localOffset = rope?.anchorLocalOffset ?? null;
    if ((ownerId === null) !== (localOffset === null)) {
        throw new Error("rope anchor owner ID and local offset must be paired");
    }
    if (ownerId === null) return Object.freeze({ ownerId: null, localOffset: null });
    if (typeof ownerId !== "string" || !ownerId) throw new Error("rope anchor ownerId must be non-empty");
    return Object.freeze({ ownerId, localOffset: finiteVector(localOffset, "rope.anchorLocalOffset") });
}

function normalizeLauncherTarget(target) {
    if (target === null || target === undefined) return null;
    const attachment = target.ropeAttachment ?? null;
    if (attachment !== null) {
        if (typeof attachment.ownerId !== "string" || !attachment.ownerId) {
            throw new Error("launcher target rope attachment ownerId must be non-empty");
        }
        finiteVector(attachment.localAnchor, "launcher target rope attachment localAnchor");
    }
    const point = finiteVector(target, "launcher.shot.target");
    return Object.freeze({
        x: point.x,
        y: point.y,
        anchorVelocity: finiteVector(target.anchorVelocity ?? { x: 0, y: 0 }, "launcher.shot.target.anchorVelocity"),
        ropeAttachment:
            attachment === null
                ? null
                : Object.freeze({
                      ownerId: attachment.ownerId,
                      localAnchor: finiteVector(attachment.localAnchor, "launcher target rope attachment localAnchor")
                  })
    });
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
    const origin = finiteVector(shot.origin, "launcher.shot.origin");
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
            origin,
            tip: finiteVector(
                shot.tip ?? {
                    x: origin.x + direction.x * shot.traveled,
                    y: origin.y + direction.y * shot.traveled
                },
                "launcher.shot.tip"
            ),
            direction,
            target: normalizeLauncherTarget(shot.target),
            traveled: shot.traveled,
            elapsed: shot.elapsed
        }),
        cooldownRemaining: launcher.cooldownRemaining
    });
}

function normalizeRopeImpactState(state) {
    if (!state || typeof state !== "object" || Array.isArray(state)) {
        throw new Error("ropeImpactState must be an object");
    }
    if (typeof state.swingArmed !== "boolean" || typeof state.released !== "boolean") {
        throw new Error("ropeImpactState swingArmed and released must be boolean");
    }
    finiteNonNegative(state.releaseCarryRemaining, "ropeImpactState.releaseCarryRemaining");
    if (!state.released && state.releaseCarryRemaining > 0) {
        throw new Error("attached ropeImpactState cannot retain release carry");
    }
    if (!state.swingArmed && (state.released || state.releaseCarryRemaining > 0)) {
        throw new Error("unarmed ropeImpactState cannot be released");
    }
    if (
        !Array.isArray(state.touchingTargetIds) ||
        state.touchingTargetIds.some((targetId) => typeof targetId !== "string" || targetId.length === 0)
    ) {
        throw new Error("ropeImpactState.touchingTargetIds must contain non-empty strings");
    }
    return Object.freeze({
        swingArmed: state.swingArmed,
        released: state.released,
        releaseCarryRemaining: state.releaseCarryRemaining,
        touchingTargetIds: Object.freeze([...new Set(state.touchingTargetIds)].sort())
    });
}

export function createOwnerMotionState({
    clientTick,
    authorityTick,
    position,
    velocity,
    angle = 0,
    angularVelocity = 0,
    isGrounded,
    rope,
    ropeImpactState,
    launcher = null,
    augmentRuntimeState = null,
    respawnAnchorId = null
}) {
    if (typeof isGrounded !== "boolean") throw new Error("isGrounded must be boolean");
    if (typeof rope?.isAttached !== "boolean") throw new Error("rope.isAttached must be boolean");
    const ropeLength = finiteNonNegative(rope.length, "rope.length");
    if (rope.isAttached && ropeLength <= 0) throw new Error("attached rope.length must be positive");
    const attachmentId = rope.attachmentId ?? null;
    if (rope.isAttached && (typeof attachmentId !== "string" || !attachmentId)) {
        throw new Error("attached rope.attachmentId must be non-empty");
    }
    const anchorOwner = ropeAnchorOwner(rope);
    const anchorSurfaceId = rope.anchorSurfaceId ?? null;
    if (anchorSurfaceId !== null && (typeof anchorSurfaceId !== "string" || !anchorSurfaceId)) {
        throw new Error("rope.anchorSurfaceId must be null or non-empty");
    }
    if (!Number.isFinite(angle)) throw new Error("angle must be finite");
    if (!Number.isFinite(angularVelocity)) throw new Error("angularVelocity must be finite");
    if (respawnAnchorId !== null && (typeof respawnAnchorId !== "string" || respawnAnchorId.length === 0)) {
        throw new Error("respawnAnchorId must be null or a non-empty string");
    }
    return Object.freeze({
        protocolVersion: OWNER_MOTION_STATE_PROTOCOL_VERSION,
        clientTick: assertTick(clientTick, "clientTick"),
        authorityTick: assertTick(authorityTick, "authorityTick"),
        position: finiteVector(position, "position"),
        velocity: finiteVector(velocity, "velocity"),
        angle,
        angularVelocity,
        isGrounded,
        respawnAnchorId,
        rope: Object.freeze({
            isAttached: rope.isAttached,
            anchor: rope.isAttached ? finiteVector(rope.anchor, "rope.anchor") : null,
            attachmentId: rope.isAttached ? attachmentId : null,
            anchorSurfaceId: rope.isAttached ? anchorSurfaceId : null,
            anchorOwnerId: rope.isAttached ? anchorOwner.ownerId : null,
            anchorLocalOffset: rope.isAttached ? anchorOwner.localOffset : null,
            attachmentOffset: rope.isAttached ? finiteVector(rope.attachmentOffset, "rope.attachmentOffset") : null,
            length: rope.isAttached ? ropeLength : 0
        }),
        ropeImpactState: normalizeRopeImpactState(ropeImpactState),
        launcher: normalizeLauncher(launcher),
        augmentRuntimeState:
            augmentRuntimeState === null
                ? null
                : normalizeNetworkJson(JSON.parse(JSON.stringify(augmentRuntimeState)), "augmentRuntimeState")
    });
}

export function createOwnerMotionReceipt({ clientTick, accepted, reason, resolution, ropeReleased, ropeAttachmentId }) {
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
    if (ropeAttachmentId !== undefined && (typeof ropeAttachmentId !== "string" || !ropeAttachmentId)) {
        throw new Error("ropeAttachmentId must be non-empty when provided");
    }
    if (ropeReleased === true && ropeAttachmentId === undefined) {
        throw new Error("ropeReleased receipt requires ropeAttachmentId");
    }
    return Object.freeze({
        clientTick: assertTick(clientTick, "clientTick"),
        accepted,
        ...(reason === undefined ? {} : { reason }),
        ...(resolution === undefined ? {} : { resolution }),
        ...(ropeReleased === undefined ? {} : { ropeReleased }),
        ...(ropeAttachmentId === undefined ? {} : { ropeAttachmentId })
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
