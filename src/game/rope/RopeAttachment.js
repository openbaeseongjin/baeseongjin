import { rotateVector } from "../physics/AngularMotion.js";

export function ropeAttachmentPoint(player, rope = player?.rope) {
    if (!player?.position) throw new Error("ropeAttachmentPoint requires player.position");
    if (!rope?.isAttached) {
        return { x: player.position.x, y: player.position.y };
    }
    if (!rope.attachmentOffset) throw new Error("attached rope requires attachmentOffset");
    const offset = rotateVector(rope.attachmentOffset, player.angle ?? 0);
    return { x: player.position.x + offset.x, y: player.position.y + offset.y };
}

export function releaseRopeFromBody(physics, rope) {
    if (!rope?.isAttached) return false;
    if (!physics?.velocity || !physics.angularMotion) {
        throw new Error("releaseRopeFromBody requires rigid-body velocity and angular motion");
    }
    const tangentialVelocity = physics.angularMotion.tangentialVelocity(rope.attachmentOffset);
    physics.velocity.x += tangentialVelocity.x * rope.config.releaseAngularTransfer;
    physics.velocity.y += tangentialVelocity.y * rope.config.releaseAngularTransfer;
    rope.detach();
    return true;
}
