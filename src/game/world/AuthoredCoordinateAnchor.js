const COORDINATE_ANCHOR_POINTS = Object.freeze({
    "top-left": Object.freeze({ x: 0, y: 0 }),
    "top-center": Object.freeze({ x: 0.5, y: 0 }),
    "top-right": Object.freeze({ x: 1, y: 0 }),
    "center-left": Object.freeze({ x: 0, y: 0.5 }),
    center: Object.freeze({ x: 0.5, y: 0.5 }),
    "center-right": Object.freeze({ x: 1, y: 0.5 }),
    "bottom-left": Object.freeze({ x: 0, y: 1 }),
    "bottom-center": Object.freeze({ x: 0.5, y: 1 }),
    "bottom-right": Object.freeze({ x: 1, y: 1 })
});

export const AUTHORED_COORDINATE_ANCHORS = Object.freeze(Object.keys(COORDINATE_ANCHOR_POINTS));

export function assertAuthoredCoordinateAnchor(value, label = "coordinateAnchor") {
    if (typeof value !== "string" || !Object.hasOwn(COORDINATE_ANCHOR_POINTS, value)) {
        throw new Error(`${label} must be one of: ${AUTHORED_COORDINATE_ANCHORS.join(", ")}`);
    }
    return value;
}

export function authoredCoordinateAnchorPoint(value = "center") {
    return COORDINATE_ANCHOR_POINTS[assertAuthoredCoordinateAnchor(value)];
}

export function anchoredRectangleBounds(position, size, coordinateAnchor) {
    const anchor = authoredCoordinateAnchorPoint(coordinateAnchor);
    if (
        !Number.isFinite(position?.x) ||
        !Number.isFinite(position?.y) ||
        !Number.isFinite(size?.width) ||
        !Number.isFinite(size?.height) ||
        size.width <= 0 ||
        size.height <= 0
    ) {
        throw new Error("anchored rectangle requires a finite position and positive size");
    }
    return Object.freeze({
        x: position.x - size.width * anchor.x,
        y: position.y - size.height * anchor.y,
        width: size.width,
        height: size.height
    });
}
