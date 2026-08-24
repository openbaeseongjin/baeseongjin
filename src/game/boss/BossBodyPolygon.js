const NORMALIZED_VERTICES_BY_PRESET = Object.freeze({
    "continuity-warden": Object.freeze([
        [-0.22, -0.5],
        [0.22, -0.5],
        [0.32, -0.28],
        [0.42, 0.08],
        [0.3, 0.5],
        [-0.3, 0.5],
        [-0.42, 0.08],
        [-0.32, -0.28]
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
