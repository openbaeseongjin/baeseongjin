export const BOSS04_GUARD_GEOMETRY = Object.freeze({
    "guard-a": Object.freeze([
        Object.freeze({ x: -120, y: 0 }),
        Object.freeze({ x: -57.6, y: -72 }),
        Object.freeze({ x: 72, y: -63 }),
        Object.freeze({ x: 120, y: 0 }),
        Object.freeze({ x: 52.8, y: 72 }),
        Object.freeze({ x: -76.8, y: 63 })
    ]),
    "guard-b": Object.freeze([
        Object.freeze({ x: -130, y: 0 }),
        Object.freeze({ x: -62.4, y: -67.2 }),
        Object.freeze({ x: 78, y: -58.8 }),
        Object.freeze({ x: 130, y: 0 }),
        Object.freeze({ x: 57.2, y: 67.2 }),
        Object.freeze({ x: -83.2, y: 58.8 })
    ])
});

export function boss04GuardGeometry(role) {
    const vertices = BOSS04_GUARD_GEOMETRY[role];
    if (!vertices) throw new Error(`Boss04 guard geometry is missing for ${role}`);
    return vertices;
}
