import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";
import { loadEnemySpriteManifest } from "./EnemySpriteManifest.js";

export const DEFAULT_ENEMY_SPRITE_MANIFEST_URL = runtimeAssetUrl(
    "characters",
    "sector-01-enemies",
    "enemy-sprite-manifest.json"
);

export async function loadDefaultEnemySpriteDefinition({ fetchFn = globalThis.fetch, warn = console.warn } = {}) {
    try {
        return await loadEnemySpriteManifest(DEFAULT_ENEMY_SPRITE_MANIFEST_URL, { fetchFn });
    } catch (error) {
        warn(`[renderer:enemy-sprite] ${error.message}; using built-in enemy mock sprites`);
        return null;
    }
}
