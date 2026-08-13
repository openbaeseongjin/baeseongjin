import { AUDIO_CATEGORIES } from "./AudioManifest.js";

const CATEGORY_SET = new Set(AUDIO_CATEGORIES);
const STABLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertRecord(value, label) {
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error(`${label} must be an object`);
}

function assertStableId(value, label) {
    if (typeof value !== "string" || !STABLE_ID.test(value)) {
        throw new Error(`${label} '${value}' must use lowercase kebab-case`);
    }
}

export function createAudioPackFromManifest(manifest) {
    assertRecord(manifest, "audio pack");
    const allowed = new Set(["$schema", "formatVersion", "id", "packages"]);
    for (const field of Object.keys(manifest)) {
        if (!allowed.has(field)) throw new Error(`audio pack has unknown field '${field}'`);
    }
    if (manifest.formatVersion !== 1) throw new Error(`unsupported audio pack version '${manifest.formatVersion}'`);
    if (manifest.$schema !== undefined && typeof manifest.$schema !== "string") {
        throw new Error("audio pack $schema must be a string");
    }
    assertStableId(manifest.id, "audio pack id");
    if (!Array.isArray(manifest.packages) || manifest.packages.length === 0) {
        throw new Error("audio pack packages must contain at least one package");
    }
    const categories = new Set();
    const packages = manifest.packages.map((entry, index) => {
        const label = `audio pack packages[${index}]`;
        assertRecord(entry, label);
        for (const field of Object.keys(entry)) {
            if (!new Set(["category", "assetId"]).has(field)) throw new Error(`${label} has unknown field '${field}'`);
        }
        if (!CATEGORY_SET.has(entry.category)) throw new Error(`${label}.category '${entry.category}' is unsupported`);
        assertStableId(entry.assetId, `${label}.assetId`);
        if (categories.has(entry.category)) throw new Error(`audio pack duplicates category '${entry.category}'`);
        categories.add(entry.category);
        return Object.freeze({ category: entry.category, assetId: entry.assetId });
    });
    return Object.freeze({ id: manifest.id, packages: Object.freeze(packages) });
}
