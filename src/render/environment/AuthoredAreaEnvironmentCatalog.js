import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";
import { loadEnvironmentManifest } from "./EnvironmentManifest.js";

const SECTOR_01_MAINTENANCE_SELECTION = Object.freeze({
    packageId: "sector-01-maintenance",
    manifestUrl: runtimeAssetUrl("environments", "sector-01-maintenance", "sprite-manifest.json")
});

const SECTOR_02_WORKER_DISTRICT_SELECTION = Object.freeze({
    packageId: "sector-02-worker-district",
    manifestUrl: runtimeAssetUrl("environments", "sector-02-worker-district", "sprite-manifest.json")
});

const SECTOR_03_CENTRAL_EXCHANGE_SELECTION = Object.freeze({
    packageId: "sector-03-central-exchange",
    manifestUrl: runtimeAssetUrl("environments", "sector-03-central-exchange", "sprite-manifest.json")
});

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
        ...sectorAreaSelections(3, SECTOR_03_CENTRAL_EXCHANGE_SELECTION)
    ])
);

export async function loadAuthoredAreaEnvironmentDefinitions({ fetchFn = globalThis.fetch, warn = console.warn } = {}) {
    const definitionsByUrl = new Map();
    const loadOnce = (manifestUrl) => {
        if (!definitionsByUrl.has(manifestUrl)) {
            definitionsByUrl.set(manifestUrl, loadEnvironmentManifest(manifestUrl, { fetchFn }));
        }
        return definitionsByUrl.get(manifestUrl);
    };
    const definitions = await Promise.all(
        Object.entries(AUTHORED_AREA_ENVIRONMENT_SELECTIONS).map(async ([areaId, selection]) => {
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
