import { CanvasRenderer } from "./CanvasRenderer.js";
import { PolygonSceneRenderer } from "./PolygonSceneRenderer.js";
import { assertSceneRenderer } from "./SceneRenderer.js";

export const DEFAULT_RENDERER_PROFILE = "polygon";
const DEFAULT_FACTORIES = Object.freeze({ polygon: () => new PolygonSceneRenderer() });

export function createGameRenderer({
    canvas,
    profile = DEFAULT_RENDERER_PROFILE,
    sceneRendererFactories = DEFAULT_FACTORIES
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
    return new CanvasRenderer(canvas, renderer);
}
