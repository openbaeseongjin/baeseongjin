export const WORLD_FALL_BOUNDARY = Object.freeze({
    recoveryMargin: 780
});

export function worldFallRecoveryY(worldBottomY, fallbackBottomY) {
    const resolvedBottomY = Number.isFinite(worldBottomY) ? worldBottomY : fallbackBottomY;
    if (!Number.isFinite(resolvedBottomY)) {
        throw new TypeError("World fall boundary requires a finite bottom Y");
    }
    return resolvedBottomY + WORLD_FALL_BOUNDARY.recoveryMargin;
}
