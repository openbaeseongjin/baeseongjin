import { createAudioPackageDefinitionFromManifest } from "./AudioManifest.js";
import { createAudioPackFromManifest } from "./AudioPack.js";

const RUNTIME_AUDIO_ROOT = new URL("../../assets/runtime/audio/", import.meta.url);
const STABLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const AUDIO_CATEGORY_SET = new Set(["gameplay", "ui", "ambience", "bgm"]);

function assertStableId(value, label) {
    if (typeof value !== "string" || !STABLE_ID.test(value)) {
        throw new Error(`${label} '${value}' must use lowercase kebab-case`);
    }
}

async function fetchJson(url, fetcher, label) {
    const response = await fetcher(url);
    if (!response?.ok) throw new Error(`failed to load ${label} '${url}' (${response?.status ?? "network"})`);
    return Object.freeze({ value: await response.json(), url: response.url || String(url) });
}

export function audioPackUrl(packId, rootUrl = RUNTIME_AUDIO_ROOT) {
    assertStableId(packId, "audio pack id");
    return new URL(`packs/${packId}/audio-pack.json`, rootUrl).href;
}

export function audioPackageManifestUrl(category, assetId, rootUrl = RUNTIME_AUDIO_ROOT) {
    if (!AUDIO_CATEGORY_SET.has(category)) {
        throw new Error(`audio category '${category}' is unsupported`);
    }
    assertStableId(category, "audio category");
    assertStableId(assetId, "audio asset id");
    return new URL(`${category}/${assetId}/audio-manifest.json`, rootUrl).href;
}

export function createAudioPackDefinition(pack, packageDefinitions) {
    const clips = {};
    const cues = {};
    const packages = {};
    for (const reference of pack.packages) {
        const definition = packageDefinitions[reference.category];
        if (!definition || definition.id !== reference.assetId || definition.category !== reference.category) {
            throw new Error(`audio pack package '${reference.category}/${reference.assetId}' was not loaded`);
        }
        packages[reference.category] = definition;
        for (const [clipId, clip] of Object.entries(definition.clips)) {
            const clipKey = `${reference.category}/${reference.assetId}:${clipId}`;
            clips[clipKey] = Object.freeze({ ...clip, key: clipKey, packageId: reference.assetId });
        }
        for (const [cueId, cue] of Object.entries(definition.cues)) {
            if (cues[cueId]) throw new Error(`audio pack cue id '${cueId}' is duplicated`);
            cues[cueId] = Object.freeze({
                ...cue,
                packageId: reference.assetId,
                variations: Object.freeze(
                    cue.variations.map((variation) =>
                        Object.freeze({
                            ...variation,
                            clipKey: `${reference.category}/${reference.assetId}:${variation.clipId}`
                        })
                    )
                )
            });
        }
    }
    return Object.freeze({
        id: pack.id,
        packages: Object.freeze(packages),
        clips: Object.freeze(clips),
        cues: Object.freeze(cues)
    });
}

export async function loadAudioPackDefinition(
    packId,
    { fetcher = globalThis.fetch, rootUrl = RUNTIME_AUDIO_ROOT, packageOverrides = {} } = {}
) {
    if (typeof fetcher !== "function") throw new Error("audio pack loader requires fetch");
    if (!packageOverrides || Array.isArray(packageOverrides) || typeof packageOverrides !== "object") {
        throw new Error("audio package overrides must be an object");
    }
    const packResource = await fetchJson(audioPackUrl(packId, rootUrl), fetcher, "audio pack");
    const sourcePack = createAudioPackFromManifest(packResource.value);
    const referencedCategories = new Set(sourcePack.packages.map(({ category }) => category));
    for (const category of Object.keys(packageOverrides)) {
        if (!AUDIO_CATEGORY_SET.has(category)) throw new Error(`audio category '${category}' is unsupported`);
        if (!referencedCategories.has(category)) {
            throw new Error(`audio pack '${sourcePack.id}' does not reference category '${category}'`);
        }
    }
    const references = sourcePack.packages.map((reference) =>
        Object.freeze({ ...reference, assetId: packageOverrides[reference.category] ?? reference.assetId })
    );
    const pack = Object.freeze({ id: sourcePack.id, packages: Object.freeze(references) });
    const loaded = await Promise.all(
        references.map(async (reference) => {
            const url = audioPackageManifestUrl(reference.category, reference.assetId, rootUrl);
            const resource = await fetchJson(url, fetcher, "audio manifest");
            return [
                reference.category,
                createAudioPackageDefinitionFromManifest(resource.value, { baseUrl: resource.url })
            ];
        })
    );
    return createAudioPackDefinition(pack, Object.fromEntries(loaded));
}
