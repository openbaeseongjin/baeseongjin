function finite(value, label) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    return value;
}

export function projectWorldToScreen(position, camera) {
    const zoom = finite(camera?.zoom ?? 1, "camera.zoom");
    if (zoom <= 0) throw new Error("camera.zoom must be positive");
    return Object.freeze({
        x: (finite(position?.x, "position.x") - finite(camera?.x, "camera.x")) * zoom,
        y: (finite(position?.y, "position.y") - finite(camera?.y, "camera.y")) * zoom
    });
}

export function resolveScreenEdgeGuide({ target, camera, viewportWidth, viewportHeight, insets = {} }) {
    const width = finite(viewportWidth, "viewportWidth");
    const height = finite(viewportHeight, "viewportHeight");
    if (width <= 0 || height <= 0) throw new Error("viewport size must be positive");
    const screen = projectWorldToScreen(target, camera);
    if (screen.x >= 0 && screen.x <= width && screen.y >= 0 && screen.y <= height) return null;

    const left = Math.max(0, insets.left ?? 28);
    const right = Math.min(width, width - (insets.right ?? 28));
    const top = Math.max(0, insets.top ?? 48);
    const bottom = Math.min(height, height - (insets.bottom ?? 28));
    const center = { x: width * 0.5, y: height * 0.5 };
    const dx = screen.x - center.x;
    const dy = screen.y - center.y;
    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return null;

    const horizontalScale =
        Math.abs(dx) < 1e-9 ? Number.POSITIVE_INFINITY : (dx > 0 ? right - center.x : center.x - left) / Math.abs(dx);
    const verticalScale =
        Math.abs(dy) < 1e-9 ? Number.POSITIVE_INFINITY : (dy > 0 ? bottom - center.y : center.y - top) / Math.abs(dy);
    const scale = Math.min(horizontalScale, verticalScale);
    const edge = horizontalScale < verticalScale ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";
    return Object.freeze({
        x: center.x + dx * scale,
        y: center.y + dy * scale,
        angle: Math.atan2(dy, dx),
        edge,
        target: Object.freeze({ x: target.x, y: target.y })
    });
}
