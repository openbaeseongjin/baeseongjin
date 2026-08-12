function freezeRenderers(renderers) {
    if (!Array.isArray(renderers) || renderers.length === 0) {
        throw new Error("Renderer composition requires at least one child renderer");
    }
    for (const renderer of renderers) {
        if (!renderer || typeof renderer.draw !== "function") {
            throw new Error("Every child renderer requires draw({ context, scene, viewport })");
        }
    }
    return Object.freeze([...renderers]);
}

export class RendererGroup {
    constructor(renderers) {
        this.renderers = freezeRenderers(renderers);
    }

    draw(args) {
        for (const renderer of this.renderers) renderer.draw(args);
    }
}

export class SceneRendererComposition extends RendererGroup {
    constructor({ profile, renderers }) {
        if (typeof profile !== "string" || !profile.trim()) {
            throw new Error("Scene renderer composition requires a non-empty profile");
        }
        super(renderers);
        this.profile = profile;
    }
}

export class CameraWorldRenderer extends RendererGroup {
    draw(args) {
        const { context, scene } = args;
        const camera = scene.camera;
        const zoom = camera.zoom ?? 1;
        const impact = scene.impact;
        const decay = impact && impact.age < impact.lifetime ? 1 - impact.age / impact.lifetime : 0;
        context.save();
        context.translate(
            -camera.x * zoom + (impact ? Math.sin(impact.age * 173) * impact.strength * decay : 0),
            -camera.y * zoom + (impact ? Math.cos(impact.age * 137) * impact.strength * decay * 0.65 : 0)
        );
        context.scale(zoom, zoom);
        super.draw(args);
        context.restore();
    }
}
