export const DEFAULT_RENDER_CULL_MARGIN = 96;

function finitePositive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function freezeBounds(bounds) {
    return Object.freeze(bounds);
}

export function expandBounds(bounds, margin = 0) {
    const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0;
    return freezeBounds({
        minX: bounds.minX - safeMargin,
        minY: bounds.minY - safeMargin,
        maxX: bounds.maxX + safeMargin,
        maxY: bounds.maxY + safeMargin
    });
}

export function createRenderViewport({ camera, cssWidth, cssHeight, cullMargin = DEFAULT_RENDER_CULL_MARGIN }) {
    const zoom = finitePositive(camera?.zoom, 1);
    const width = finitePositive(cssWidth, 1);
    const height = finitePositive(cssHeight, 1);
    const minX = Number.isFinite(camera?.x) ? camera.x : 0;
    const minY = Number.isFinite(camera?.y) ? camera.y : 0;
    const visibleWorldBounds = freezeBounds({
        minX,
        minY,
        maxX: minX + width / zoom,
        maxY: minY + height / zoom
    });
    return Object.freeze({
        cssWidth: width,
        cssHeight: height,
        zoom,
        cullMargin,
        visibleWorldBounds,
        worldBounds: expandBounds(visibleWorldBounds, cullMargin)
    });
}

export function boundsIntersect(left, right) {
    if (!left || !right) return true;
    return !(left.maxX < right.minX || left.minX > right.maxX || left.maxY < right.minY || left.minY > right.maxY);
}

export function boundsForVertices(vertices) {
    if (!Array.isArray(vertices) || vertices.length === 0) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const vertex of vertices) {
        minX = Math.min(minX, vertex.x);
        minY = Math.min(minY, vertex.y);
        maxX = Math.max(maxX, vertex.x);
        maxY = Math.max(maxY, vertex.y);
    }
    return freezeBounds({ minX, minY, maxX, maxY });
}

export function circleBounds(position, radius = 0) {
    const safeRadius = Number.isFinite(radius) ? Math.max(0, radius) : 0;
    return freezeBounds({
        minX: position.x - safeRadius,
        minY: position.y - safeRadius,
        maxX: position.x + safeRadius,
        maxY: position.y + safeRadius
    });
}

export function centeredBounds(position, size) {
    return freezeBounds({
        minX: position.x - size.width * 0.5,
        minY: position.y - size.height * 0.5,
        maxX: position.x + size.width * 0.5,
        maxY: position.y + size.height * 0.5
    });
}

export function isVisible(viewport, bounds) {
    return boundsIntersect(viewport?.worldBounds, bounds);
}

export function intersectBounds(left, right) {
    if (!boundsIntersect(left, right)) return null;
    return freezeBounds({
        minX: Math.max(left.minX, right.minX),
        minY: Math.max(left.minY, right.minY),
        maxX: Math.min(left.maxX, right.maxX),
        maxY: Math.min(left.maxY, right.maxY)
    });
}
