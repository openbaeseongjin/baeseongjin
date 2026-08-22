import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";
import { authoredWorldFactoryForRevision, createSeamlessAuthoredWorld } from "../world/AuthoredWorldFactory.js";
import { GameSimulation } from "./GameSimulation.js";

export function createCurrentGameSimulation(options = {}) {
    return new GameSimulation({ ...options, worldFactory: createSeamlessAuthoredWorld });
}

export function createGameSimulationForWorldRevision({ worldRevision, ...options }) {
    const worldFactory = authoredWorldFactoryForRevision(worldRevision);
    if (worldFactory) return new GameSimulation({ ...options, worldFactory });
    if (worldRevision === WORLD_GENERATION_REVISION) {
        return new GameSimulation({ ...options, worldCatalog: null });
    }
    throw new Error(`unsupported world revision: ${worldRevision}`);
}
