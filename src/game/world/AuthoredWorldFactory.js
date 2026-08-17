import { WORLD_CONFIG } from "../config.js";
import { assembleAuthoredWorld } from "./AuthoredWorldAssembler.js";
import { CURRENT_AUTHORED_AREA_CATALOG } from "./areas/CurrentAuthoredAreaCatalog.js";
import { SECTOR_01_AREA_CATALOG } from "./areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "./areas/sector02/Sector02AreaCatalog.js";
import {
    createLegacyAreaSeamlessSectorRuntimeWorld,
    SEAMLESS_SECTOR_RUNTIME_REVISION
} from "./sectors/LegacyAreaSeamlessSectorRuntime.js";

export const DEFAULT_AUTHORED_AREA_CATALOG = CURRENT_AUTHORED_AREA_CATALOG;
export const DEFAULT_AUTHORED_WORLD_REVISION = SEAMLESS_SECTOR_RUNTIME_REVISION;

const AUTHORED_CATALOGS_BY_REVISION = new Map([
    [DEFAULT_AUTHORED_AREA_CATALOG.revision, DEFAULT_AUTHORED_AREA_CATALOG],
    [SECTOR_01_AREA_CATALOG.revision, SECTOR_01_AREA_CATALOG],
    [SECTOR_02_AREA_CATALOG.revision, SECTOR_02_AREA_CATALOG]
]);

export function authoredCatalogForRevision(revision) {
    return AUTHORED_CATALOGS_BY_REVISION.get(revision) ?? null;
}

export function authoredWorldFactoryForRevision(revision) {
    return revision === SEAMLESS_SECTOR_RUNTIME_REVISION ? createLegacyAreaSeamlessSectorRuntimeWorld : null;
}

export function createSeamlessAuthoredWorld(options = {}) {
    return createLegacyAreaSeamlessSectorRuntimeWorld(options);
}

export function createAuthoredWorld({
    catalog = DEFAULT_AUTHORED_AREA_CATALOG,
    seed = WORLD_CONFIG.seed,
    floorY = WORLD_CONFIG.floorY,
    checkpointRadius = WORLD_CONFIG.checkpointRadius,
    summitRadius = WORLD_CONFIG.summitRadius
} = {}) {
    return assembleAuthoredWorld(catalog, { seed, floorY, checkpointRadius, summitRadius });
}
