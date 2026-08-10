export function evaluateSwingDrag({ anchor, playerPosition, drag, threshold }) {
    const radialX = playerPosition.x - anchor.x;
    const radialY = playerPosition.y - anchor.y;
    const ropeLength = Math.hypot(radialX, radialY);
    if (ropeLength <= 0 || threshold <= 0) return null;

    const tangentX = -radialY / ropeLength;
    const tangentY = radialX / ropeLength;
    const signedDistance = drag.x * tangentX + drag.y * tangentY;
    const directionSign = signedDistance < 0 ? -1 : 1;

    return {
        direction: { x: tangentX * directionSign, y: tangentY * directionSign },
        distance: Math.abs(signedDistance),
        progress: Math.min(1, Math.abs(signedDistance) / threshold),
        triggered: Math.abs(signedDistance) >= threshold
    };
}
