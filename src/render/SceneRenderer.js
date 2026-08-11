export function assertSceneRenderer(renderer) {
    if (
        !renderer ||
        typeof renderer.profile !== "string" ||
        !renderer.profile.trim() ||
        typeof renderer.draw !== "function"
    ) {
        throw new Error("Scene renderer requires a non-empty profile and draw({ context, scene, viewport })");
    }
    return renderer;
}

export function assertGameRenderer(renderer) {
    if (!renderer || typeof renderer.draw !== "function" || typeof renderer.screenToWorld !== "function") {
        throw new Error("Game renderer requires draw() and screenToWorld()");
    }
    if (!Number.isFinite(renderer.cssWidth) || !Number.isFinite(renderer.cssHeight)) {
        throw new Error("Game renderer requires finite cssWidth and cssHeight");
    }
    return renderer;
}
