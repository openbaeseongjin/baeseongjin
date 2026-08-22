import { rotateVector } from "../physics/AngularMotion.js";
import { FIXED_LENGTH_ROPE } from "./FixedLengthRopeDefinition.js";

export function ropeLaunchHandPoint(player, handOffset, aimWorld) {
    if (!player?.position) throw new Error("ropeLaunchHandPoint requires player.position");
    if (!handOffset) throw new Error("ropeLaunchHandPoint requires handOffset");
    if (!aimWorld) throw new Error("ropeLaunchHandPoint requires aimWorld");
    const sign = aimWorld.x < player.position.x ? -FIXED_LENGTH_ROPE.UNIT : FIXED_LENGTH_ROPE.UNIT;
    const offset = rotateVector(
        { x: Math.abs(handOffset.x) * sign, y: handOffset.y },
        player.angle ?? FIXED_LENGTH_ROPE.ZERO
    );
    return { x: player.position.x + offset.x, y: player.position.y + offset.y };
}

export function ropeAttachmentPoint(player, rope = player?.rope) {
    if (!player?.position) throw new Error("ropeAttachmentPoint requires player.position");
    if (!rope?.isAttached) {
        return { x: player.position.x, y: player.position.y };
    }
    if (!rope.attachmentOffset) throw new Error("attached rope requires attachmentOffset");
    const offset = rotateVector(rope.attachmentOffset, player.angle ?? FIXED_LENGTH_ROPE.ZERO);
    return { x: player.position.x + offset.x, y: player.position.y + offset.y };
}

export function releaseRopeFromBody(physics, rope) {
    if (!rope?.isAttached) return false;
    if (!physics?.velocity || typeof physics.angularTangentialVelocity !== "function") {
        throw new Error("releaseRopeFromBody requires linear and angular physics");
    }
    const tangentialVelocity = physics.angularTangentialVelocity(rope.attachmentOffset);
    physics.applyImpulse({
        x: tangentialVelocity.x * rope.config.releaseAngularTransfer,
        y: tangentialVelocity.y * rope.config.releaseAngularTransfer
    });
    rope.detach();
    return true;
}
