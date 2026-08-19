export const STAGE_SAVE_POINT_LOCAL_BOUNDS = Object.freeze({
    x: -38,
    y: -78,
    width: 76,
    height: 82
});

export const STAGE_SAVE_POINT_CULL_RADIUS = 82;

export function stageSavePointBounds(position) {
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
        throw new Error("Stage save point position must be finite");
    }
    return Object.freeze({
        x: position.x + STAGE_SAVE_POINT_LOCAL_BOUNDS.x,
        y: position.y + STAGE_SAVE_POINT_LOCAL_BOUNDS.y,
        width: STAGE_SAVE_POINT_LOCAL_BOUNDS.width,
        height: STAGE_SAVE_POINT_LOCAL_BOUNDS.height
    });
}

export function circleOverlapsStageSavePoint(position, radius, triggerBounds) {
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y) || !Number.isFinite(radius) || radius <= 0) {
        return false;
    }
    if (
        !Number.isFinite(triggerBounds?.x) ||
        !Number.isFinite(triggerBounds?.y) ||
        !Number.isFinite(triggerBounds?.width) ||
        !Number.isFinite(triggerBounds?.height)
    ) {
        return false;
    }
    const closestX = Math.max(triggerBounds.x, Math.min(position.x, triggerBounds.x + triggerBounds.width));
    const closestY = Math.max(triggerBounds.y, Math.min(position.y, triggerBounds.y + triggerBounds.height));
    return Math.hypot(position.x - closestX, position.y - closestY) <= radius;
}

export function playerOverlapsStageSavePoint(player, anchor) {
    return circleOverlapsStageSavePoint(
        player?.physics?.position,
        player?.physics?.collider?.radius,
        anchor?.triggerBounds
    );
}
