import { CameraWorldRenderer, RendererGroup } from "../SceneRendererComposition.js";
import {
    EmptyEnvironmentRenderer,
    EnvironmentComponentRenderer,
    EnvironmentRendererDiagnostics
} from "./EnvironmentComponentRenderer.js";
import { PixelBackdropRenderer } from "./renderers/PixelBackdropRenderer.js";
import { PixelTerrainRenderer } from "./renderers/PixelTerrainRenderer.js";
import { PixelDecorationRenderer } from "./renderers/PixelDecorationRenderer.js";

function backdropAtlasIds(definition, authoredAreaEnvironmentDefinitions) {
    return [definition, ...Object.values(authoredAreaEnvironmentDefinitions)].flatMap(({ backdrop }) =>
        backdrop.layers.flatMap(({ frames }) => frames.map(({ atlasId }) => atlasId))
    );
}

function terrainAtlasIds(definition) {
    return Object.values(definition.terrain.materials).flatMap(({ fill, edge }) => [fill.atlasId, edge.atlasId]);
}

function decorationAtlasIds(definition) {
    return Object.values(definition.decoration.groups).flatMap(({ items }) => items.map(({ frame }) => frame.atlasId));
}

export class EnvironmentRendererComposer {
    constructor({
        definition,
        assets,
        authoredAreaEnvironmentDefinitions = Object.freeze({}),
        polygonBackdrop,
        polygonTerrain,
        warn = console.warn
    } = {}) {
        const backdrop = new EnvironmentComponentRenderer({
            id: "backdrop",
            atlasIds: backdropAtlasIds(definition, authoredAreaEnvironmentDefinitions),
            assets,
            renderer: new PixelBackdropRenderer({ definition, assets, authoredAreaEnvironmentDefinitions }),
            fallbackRenderer: polygonBackdrop ?? new EmptyEnvironmentRenderer(),
            warn
        });
        const terrain = new EnvironmentComponentRenderer({
            id: "terrain",
            atlasIds: terrainAtlasIds(definition),
            assets,
            renderer: new PixelTerrainRenderer({ definition, assets }),
            fallbackRenderer: polygonTerrain ?? new EmptyEnvironmentRenderer(),
            warn
        });
        const decoration = new EnvironmentComponentRenderer({
            id: "decoration",
            atlasIds: decorationAtlasIds(definition),
            assets,
            renderer: new PixelDecorationRenderer({ definition, assets }),
            fallbackRenderer: new EmptyEnvironmentRenderer(),
            warn
        });

        this.components = Object.freeze([backdrop, terrain, decoration]);
        this.renderers = new RendererGroup([backdrop, new CameraWorldRenderer([terrain, decoration])]);
        this.status = new EnvironmentRendererDiagnostics(this.components);
    }

    draw(args) {
        this.renderers.draw(args);
    }
}
