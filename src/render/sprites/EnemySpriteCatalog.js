import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";
import { loadEnemySpriteManifest } from "./EnemySpriteManifest.js";

export const DEFAULT_ENEMY_SPRITE_SECTOR_ID = "sector-01";
export const ENEMY_SPRITE_SELECTION_BY_SECTOR_ID = Object.freeze({
    [DEFAULT_ENEMY_SPRITE_SECTOR_ID]: Object.freeze({
        packageId: "sector-01-enemies",
        manifestUrl: runtimeAssetUrl("characters", "sector-01-enemies", "enemy-sprite-manifest.json")
    })
});
export const DEFAULT_ENEMY_SPRITE_MANIFEST_URL =
    ENEMY_SPRITE_SELECTION_BY_SECTOR_ID[DEFAULT_ENEMY_SPRITE_SECTOR_ID].manifestUrl;

export async function loadEnemySpriteDefinitions({
    fetchFn = globalThis.fetch,
    warn = console.warn,
    selectionsBySectorId = ENEMY_SPRITE_SELECTION_BY_SECTOR_ID
} = {}) {
    const entries = await Promise.all(
        Object.entries(selectionsBySectorId).map(async ([sectorId, selection]) => {
            try {
                const definition = await loadEnemySpriteManifest(selection.manifestUrl, { fetchFn });
                if (definition.id !== selection.packageId) {
                    throw new Error(
                        `manifest id '${definition.id}' does not match selected package '${selection.packageId}'`
                    );
                }
                return [sectorId, definition];
            } catch (error) {
                warn(
                    `[renderer:enemy-sprite:${sectorId}] package '${selection.packageId}' failed: ${error.message}; using the default or built-in enemy sprites`
                );
                return null;
            }
        })
    );
    return Object.freeze(Object.fromEntries(entries.filter(Boolean)));
}

export async function loadDefaultEnemySpriteDefinition({ fetchFn = globalThis.fetch, warn = console.warn } = {}) {
    const definitions = await loadEnemySpriteDefinitions({
        fetchFn,
        warn,
        selectionsBySectorId: Object.freeze({
            [DEFAULT_ENEMY_SPRITE_SECTOR_ID]: ENEMY_SPRITE_SELECTION_BY_SECTOR_ID[DEFAULT_ENEMY_SPRITE_SECTOR_ID]
        })
    });
    return definitions[DEFAULT_ENEMY_SPRITE_SECTOR_ID] ?? null;
}
