import { CanvasRenderer } from "./CanvasRenderer.js";
import { PolygonSceneRenderer } from "./PolygonSceneRenderer.js";
import { SpriteSceneRenderer } from "./SpriteSceneRenderer.js";
import { assertSceneRenderer } from "./SceneRenderer.js";

export const DEFAULT_RENDERER_PROFILE = "sprite";
const DEFAULT_FACTORIES = Object.freeze({
    sprite: () => new SpriteSceneRenderer(),
    polygon: () => new PolygonSceneRenderer()
});

export function resolveRendererProfile(search = globalThis.location?.search ?? "", { warn = console.warn } = {}) {
    const requested = new URLSearchParams(search).get("renderer");
    if (!requested) return DEFAULT_RENDERER_PROFILE;
    if (Object.hasOwn(DEFAULT_FACTORIES, requested)) return requested;
    warn(`[renderer] unknown profile '${requested}'; using '${DEFAULT_RENDERER_PROFILE}'`);
    return DEFAULT_RENDERER_PROFILE;
}

export function createGameRenderer({
    canvas,
    profile = DEFAULT_RENDERER_PROFILE,
    sceneRendererFactories = DEFAULT_FACTORIES,
    canvasOptions = undefined
}) {
    if (!canvas) throw new Error("createGameRenderer requires a canvas element");
    if (!sceneRendererFactories || typeof sceneRendererFactories !== "object")
        throw new Error("sceneRendererFactories must be an object");
    const factory = sceneRendererFactories[profile];
    if (factory === undefined) throw new Error(`Unknown renderer profile '${profile}'`);
    if (typeof factory !== "function") throw new Error(`Renderer factory for profile '${profile}' must be a function`);
    const renderer = assertSceneRenderer(factory());
    if (renderer.profile !== profile)
        throw new Error(`Scene renderer profile '${renderer.profile}' does not match '${profile}'`);
    return new CanvasRenderer(canvas, renderer, canvasOptions);
}
