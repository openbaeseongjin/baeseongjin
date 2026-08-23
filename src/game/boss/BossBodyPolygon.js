const NORMALIZED_VERTICES_BY_PRESET = Object.freeze({
    "gate-locking-carriage": Object.freeze([
        [-0.45, -0.25],
        [-0.33, -0.42],
        [0.33, -0.42],
        [0.45, -0.25],
        [0.4, 0.25],
        [-0.4, 0.25]
    ]),
    "residential-security-pursuer": Object.freeze([
        [-0.5, -0.32],
        [-0.38, -0.5],
        [0.34, -0.5],
        [0.5, -0.2],
        [0.5, 0.32],
        [0.32, 0.5],
        [-0.38, 0.5],
        [-0.5, 0.22]
    ])
});

export function bossBodyPolygonVertices(presetId, { width, height }, scale = 1) {
    const normalized = NORMALIZED_VERTICES_BY_PRESET[presetId];
    if (!normalized) throw new Error(`Boss body polygon preset is not registered: ${presetId}`);
    if (![width, height, scale].every(Number.isFinite) || width <= 0 || height <= 0 || scale <= 0) {
        throw new TypeError("Boss body polygon size must be positive");
    }
    return Object.freeze(normalized.map(([x, y]) => Object.freeze({ x: x * width * scale, y: y * height * scale })));
}
