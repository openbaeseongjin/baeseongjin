const DIRECTION_EPSILON = 0.000001;

export function directionBetween(from, to, fallback = { x: 1, y: 0 }) {
    const x = to.x - from.x;
    const y = to.y - from.y;
    const magnitude = Math.hypot(x, y);
    return magnitude > DIRECTION_EPSILON
        ? Object.freeze({ x: x / magnitude, y: y / magnitude })
        : Object.freeze({ ...fallback });
}
