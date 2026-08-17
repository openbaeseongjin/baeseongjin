import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";
import {
    authoredCatalogForRevision,
    authoredWorldFactoryForRevision,
    createSeamlessAuthoredWorld,
    DEFAULT_AUTHORED_AREA_CATALOG
} from "../world/AuthoredWorldFactory.js";
import { GameSimulation } from "./GameSimulation.js";

export function createCurrentGameSimulation(options = {}) {
    return new GameSimulation({ ...options, worldFactory: createSeamlessAuthoredWorld });
}

export function createLegacyAuthoredGameSimulation(options = {}) {
    return new GameSimulation({ ...options, worldCatalog: DEFAULT_AUTHORED_AREA_CATALOG });
}

export function createGameSimulationForWorldRevision({ worldRevision, ...options }) {
    const worldFactory = authoredWorldFactoryForRevision(worldRevision);
    if (worldFactory) return new GameSimulation({ ...options, worldFactory });
    const worldCatalog = authoredCatalogForRevision(worldRevision);
    if (worldCatalog) return new GameSimulation({ ...options, worldCatalog });
    if (worldRevision === WORLD_GENERATION_REVISION) {
        return new GameSimulation({ ...options, worldCatalog: null });
    }
    throw new Error(`unsupported world revision: ${worldRevision}`);
}
