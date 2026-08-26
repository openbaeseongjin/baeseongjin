import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";
import { loadEnvironmentManifest } from "./EnvironmentManifest.js";

function environmentSelection(packageId) {
    return Object.freeze({
        packageId,
        manifestUrl: runtimeAssetUrl("environments", packageId, "sprite-manifest.json")
    });
}

const SECTOR_01_MAINTENANCE_SELECTION = environmentSelection("sector-01-maintenance");
const SECTOR_02_WORKER_DISTRICT_SELECTION = environmentSelection("sector-02-worker-district");
const SECTOR_03_CENTRAL_EXCHANGE_SELECTION = environmentSelection("sector-03-central-exchange");
const SECTOR_04_UPPER_RESIDENTIAL_SELECTION = environmentSelection("sector-04-upper-residential");
const SECTOR_05_CONTINUITY_CONTROL_SELECTION = environmentSelection("sector-05-continuity-control");
const SECTOR_06_ROOFTOP_EVACUATION_SELECTION = environmentSelection("sector-06-rooftop-evacuation");
const BOSS_03_LOWER_SECTOR_COMMANDER_ARENA_SELECTION = environmentSelection("boss-03-lower-sector-commander-arena");
const BOSS_06_CONTINUITY_WARDEN_ARENA_SELECTION = environmentSelection("boss-06-continuity-warden-arena");

function sectorAreaSelections(sectorNumber, selection) {
    const sectorId = String(sectorNumber).padStart(2, "0");
    return Array.from({ length: 8 }, (_, index) => [
        `sector-${sectorId}-${String(index + 1).padStart(2, "0")}`,
        selection
    ]);
}

export const AUTHORED_AREA_ENVIRONMENT_SELECTIONS = Object.freeze(
    Object.fromEntries([
        ...sectorAreaSelections(1, SECTOR_01_MAINTENANCE_SELECTION),
        ...sectorAreaSelections(2, SECTOR_02_WORKER_DISTRICT_SELECTION),
        ...sectorAreaSelections(3, SECTOR_03_CENTRAL_EXCHANGE_SELECTION),
        ...sectorAreaSelections(4, SECTOR_04_UPPER_RESIDENTIAL_SELECTION),
        ...sectorAreaSelections(5, SECTOR_05_CONTINUITY_CONTROL_SELECTION),
        ...sectorAreaSelections(6, SECTOR_06_ROOFTOP_EVACUATION_SELECTION),
        ["boss-03", BOSS_03_LOWER_SECTOR_COMMANDER_ARENA_SELECTION],
        ["boss-06", BOSS_06_CONTINUITY_WARDEN_ARENA_SELECTION]
    ])
);

function areaIdFor(area) {
    return area?.areaId ?? area?.id ?? null;
}

export function authoredAreaEnvironmentSelectionFor(area) {
    return AUTHORED_AREA_ENVIRONMENT_SELECTIONS[areaIdFor(area)] ?? null;
}

export function authoredAreaEnvironmentDefinitionFor(authoredAreaEnvironmentDefinitions, area, fallbackDefinition) {
    return authoredAreaEnvironmentDefinitions[areaIdFor(area)] ?? fallbackDefinition;
}

export function authoredEnvironmentDefinitionForStableId(
    authoredAreaEnvironmentDefinitions,
    stableId,
    fallbackDefinition
) {
    if (typeof stableId !== "string" || stableId === "") return fallbackDefinition;
    return authoredAreaEnvironmentDefinitions[stableId] ?? fallbackDefinition;
}

export function authoredBossStageEnvironmentDefinitionFor(
    authoredAreaEnvironmentDefinitions,
    bossStage,
    fallbackDefinition
) {
    if (bossStage?.status !== "active") return fallbackDefinition;
    return authoredEnvironmentDefinitionForStableId(
        authoredAreaEnvironmentDefinitions,
        bossStage.stageId,
        fallbackDefinition
    );
}

export async function loadAuthoredAreaEnvironmentDefinitions({
    areaIds = null,
    fetchFn = globalThis.fetch,
    warn = console.warn
} = {}) {
    const selectedAreaIds = areaIds === null ? Object.keys(AUTHORED_AREA_ENVIRONMENT_SELECTIONS) : areaIds;
    if (!Array.isArray(selectedAreaIds)) throw new Error("authored area environment areaIds must be an array or null");
    const definitionsByUrl = Object.create(null);
    const uniqueAreaIds = Object.create(null);
    const loadOnce = (manifestUrl) => {
        if (!definitionsByUrl[manifestUrl]) {
            definitionsByUrl[manifestUrl] = loadEnvironmentManifest(manifestUrl, { fetchFn });
        }
        return definitionsByUrl[manifestUrl];
    };
    const definitions = await Promise.all(
        selectedAreaIds
            .filter((areaId) => {
                if (uniqueAreaIds[areaId]) return false;
                uniqueAreaIds[areaId] = true;
                return true;
            })
            .map(async (areaId) => {
                const selection = AUTHORED_AREA_ENVIRONMENT_SELECTIONS[areaId];
                if (!selection) return null;
                try {
                    const definition = await loadOnce(selection.manifestUrl);
                    return [areaId, definition];
                } catch (error) {
                    warn(
                        `[renderer:environment] ${areaId} package '${selection.packageId}' failed: ${error.message}; using authored backdrop fallback`
                    );
                    return null;
                }
            })
    );
    return Object.freeze(Object.fromEntries(definitions.filter(Boolean)));
}
