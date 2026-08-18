import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";
import { loadEnvironmentManifest } from "./EnvironmentManifest.js";

const SECTOR_01_MAINTENANCE_SELECTION = Object.freeze({
    packageId: "sector-01-maintenance",
    manifestUrl: runtimeAssetUrl("environments", "sector-01-maintenance", "sprite-manifest.json")
});

export const AUTHORED_AREA_ENVIRONMENT_SELECTIONS = Object.freeze(
    Object.fromEntries(
        Array.from({ length: 8 }, (_, index) => [
            `sector-01-${String(index + 1).padStart(2, "0")}`,
            SECTOR_01_MAINTENANCE_SELECTION
        ])
    )
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
