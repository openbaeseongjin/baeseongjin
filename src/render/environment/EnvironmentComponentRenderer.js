function uniqueAtlasIds(atlasIds) {
    if (!Array.isArray(atlasIds) || atlasIds.length === 0) {
        throw new Error("EnvironmentComponentRenderer requires at least one atlas id");
    }
    return Object.freeze([...new Set(atlasIds)]);
}

export class EmptyEnvironmentRenderer {
    draw() {}
}

export class EnvironmentComponentRenderer {
    constructor({
        id,
        atlasIds = null,
        atlasIdsForScene = null,
        assets,
        renderer,
        fallbackRenderer,
        warn = console.warn
    } = {}) {
        if (typeof id !== "string" || !id.trim()) {
            throw new Error("EnvironmentComponentRenderer requires a non-empty id");
        }
        if (!renderer || typeof renderer.draw !== "function") {
            throw new Error(`Environment component '${id}' requires a renderer`);
        }
        if (!fallbackRenderer || typeof fallbackRenderer.draw !== "function") {
            throw new Error(`Environment component '${id}' requires a fallback renderer`);
        }
        if (atlasIdsForScene !== null && typeof atlasIdsForScene !== "function") {
            throw new Error(`Environment component '${id}' atlasIdsForScene must be a function`);
        }
        this.id = id;
        this.atlasIds = atlasIds === null ? null : uniqueAtlasIds(atlasIds);
        if (!this.atlasIds && !atlasIdsForScene) {
            throw new Error(`Environment component '${id}' requires atlasIds or atlasIdsForScene`);
        }
        this.atlasIdsForScene = atlasIdsForScene;
        this.assets = assets;
        this.renderer = renderer;
        this.fallbackRenderer = fallbackRenderer;
        this.warn = warn;
        this.status = Object.freeze({ status: "pending", atlasIds: Object.freeze([]) });
        this.warnedFailureKeys = new Set();
    }

    currentAtlasIds(scene) {
        const atlasIds = this.atlasIdsForScene ? this.atlasIdsForScene(scene) : this.atlasIds;
        if (!Array.isArray(atlasIds) || atlasIds.length === 0) {
            throw new Error(`Environment component '${this.id}' requires at least one current atlas id`);
        }
        return atlasIds;
    }

    assessStatus(scene) {
        const atlasIds = this.currentAtlasIds(scene);
        const failedAtlasIds = this.assets
            ? atlasIds.filter((atlasId) => {
                  const asset = this.assets.assets?.[atlasId];
                  return !asset || asset.status === "failed";
              })
            : [...atlasIds];
        const nextStatus = failedAtlasIds.length
            ? "failed"
            : this.assets && atlasIds.every((atlasId) => this.assets.isReady(atlasId))
              ? "ready"
              : "pending";
        this.status = Object.freeze({
            status: nextStatus,
            atlasIds: Object.freeze(failedAtlasIds)
        });
        if (nextStatus === "failed") this.warnFailure(failedAtlasIds);
        return this.status;
    }

    warnFailure(atlasIds) {
        const key = atlasIds.join(",");
        if (this.warnedFailureKeys.has(key)) return;
        this.warnedFailureKeys.add(key);
        this.warn(`[renderer:environment] ${this.id} atlas failed: ${atlasIds.join(", ")}; using component fallback`);
    }

    draw(args) {
        const status = this.assessStatus(args.scene);
        const activeRenderer = status.status === "ready" ? this.renderer : this.fallbackRenderer;
        activeRenderer.draw(args);
    }
}

export class EnvironmentRendererDiagnostics {
    constructor(components) {
        this.components = Object.freeze([...components]);
    }

    component(componentId) {
        return this.components.find(({ id }) => id === componentId)?.status ?? null;
    }

    get backdrop() {
        return this.component("backdrop");
    }

    get terrain() {
        return this.component("terrain");
    }

    anyFailed() {
        return this.components.some(({ status }) => status.status === "failed");
    }

    failedComponents() {
        return this.components.filter(({ status }) => status.status === "failed").map(({ id }) => id);
    }

    failedAtlasIds() {
        return [
            ...new Set(
                this.components
                    .filter(({ status }) => status.status === "failed")
                    .flatMap(({ status }) => status.atlasIds)
            )
        ];
    }
}
