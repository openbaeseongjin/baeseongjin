import { CameraWorldRenderer, RendererGroup } from "../SceneRendererComposition.js";
import {
    EmptyEnvironmentRenderer,
    EnvironmentComponentRenderer,
    EnvironmentRendererDiagnostics
} from "./EnvironmentComponentRenderer.js";
import { authoredBackdropEnvironmentAreas, PixelBackdropRenderer } from "./renderers/PixelBackdropRenderer.js";
import { PixelTerrainRenderer } from "./renderers/PixelTerrainRenderer.js";
import { PixelDecorationRenderer } from "./renderers/PixelDecorationRenderer.js";
import {
    authoredAreaEnvironmentDefinitionFor,
    authoredBossStageEnvironmentDefinitionFor
} from "./AuthoredAreaEnvironmentCatalog.js";
import { currentEnvironmentArea } from "./AltitudeZoneResolver.js";

function backdropAtlasIds(definition) {
    return definition.backdrop.layers.flatMap(({ frames }) => frames.map(({ atlasId }) => atlasId));
}

function terrainAtlasIds(definition) {
    return Object.values(definition.terrain.materials).flatMap(({ fill, edge }) => [fill.atlasId, edge.atlasId]);
}

function decorationAtlasIds(definition) {
    return Object.values(definition.decoration.groups).flatMap(({ items }) => items.map(({ frame }) => frame.atlasId));
}

function componentAtlasIds(definition) {
    return Object.freeze({
        backdrop: Object.freeze([...new Set(backdropAtlasIds(definition))]),
        terrain: Object.freeze([...new Set(terrainAtlasIds(definition))]),
        decoration: Object.freeze([...new Set(decorationAtlasIds(definition))])
    });
}

function componentAtlasIdsByDefinition(definition, authoredAreaEnvironmentDefinitions) {
    return Object.freeze(
        Object.fromEntries(
            [definition, ...Object.values(authoredAreaEnvironmentDefinitions)].map((candidate) => [
                candidate.id,
                componentAtlasIds(candidate)
            ])
        )
    );
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
        const atlasIdsByDefinitionId = componentAtlasIdsByDefinition(definition, authoredAreaEnvironmentDefinitions);
        const definitionForScene = (scene) =>
            authoredAreaEnvironmentDefinitionFor(
                authoredAreaEnvironmentDefinitions,
                currentEnvironmentArea(scene),
                definition
            );
        const definitionForTerrainScene = (scene) =>
            authoredBossStageEnvironmentDefinitionFor(
                authoredAreaEnvironmentDefinitions,
                scene.bossStage,
                definitionForScene(scene)
            );
        const definitionForComponent = Object.freeze({
            terrain: definitionForTerrainScene,
            decoration: definitionForScene
        });
        const atlasIdsForScene = (componentId) => (scene) =>
            atlasIdsByDefinitionId[definitionForComponent[componentId](scene).id][componentId];
        let cachedBackdropDefinitions = Object.freeze([]);
        let cachedBackdropAtlasIds = atlasIdsByDefinitionId[definition.id].backdrop;
        const backdropAtlasIdsForScene = (scene) => {
            const definitions = authoredBackdropEnvironmentAreas(scene).map((area) =>
                authoredAreaEnvironmentDefinitionFor(authoredAreaEnvironmentDefinitions, area, definition)
            );
            if (
                definitions.length === cachedBackdropDefinitions.length &&
                definitions.every((candidate, index) => candidate === cachedBackdropDefinitions[index])
            ) {
                return cachedBackdropAtlasIds;
            }
            cachedBackdropDefinitions = Object.freeze(definitions);
            cachedBackdropAtlasIds = Object.freeze([
                ...new Set(definitions.flatMap((candidate) => atlasIdsByDefinitionId[candidate.id].backdrop))
            ]);
            return cachedBackdropAtlasIds;
        };
        const backdrop = new EnvironmentComponentRenderer({
            id: "backdrop",
            atlasIds: atlasIdsByDefinitionId[definition.id].backdrop,
            atlasIdsForScene: backdropAtlasIdsForScene,
            assets,
            renderer: new PixelBackdropRenderer({ definition, assets, authoredAreaEnvironmentDefinitions }),
            fallbackRenderer: polygonBackdrop ?? new EmptyEnvironmentRenderer(),
            warn
        });
        const terrain = new EnvironmentComponentRenderer({
            id: "terrain",
            atlasIds: atlasIdsByDefinitionId[definition.id].terrain,
            atlasIdsForScene: atlasIdsForScene("terrain"),
            assets,
            renderer: new PixelTerrainRenderer({ definition, assets, authoredAreaEnvironmentDefinitions }),
            fallbackRenderer: polygonTerrain ?? new EmptyEnvironmentRenderer(),
            warn
        });
        const decoration = new EnvironmentComponentRenderer({
            id: "decoration",
            atlasIds: atlasIdsByDefinitionId[definition.id].decoration,
            atlasIdsForScene: atlasIdsForScene("decoration"),
            assets,
            renderer: new PixelDecorationRenderer({ definition, assets, authoredAreaEnvironmentDefinitions }),
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
