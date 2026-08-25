export const STAGE_TRANSITION_LAYOUT = Object.freeze({
    verticalDistance: 2160
});

export function stageOriginFromGate(sourceExit, targetEntry) {
    if (
        !Number.isFinite(sourceExit?.x) ||
        !Number.isFinite(sourceExit?.y) ||
        !Number.isFinite(targetEntry?.x) ||
        !Number.isFinite(targetEntry?.y)
    ) {
        throw new TypeError("Stage transition endpoints must be finite");
    }
    return Object.freeze({
        x: sourceExit.x - targetEntry.x,
        y: sourceExit.y - STAGE_TRANSITION_LAYOUT.verticalDistance - targetEntry.y
    });
}
