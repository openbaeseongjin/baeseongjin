export const AUDIO_CATEGORIES = Object.freeze(["gameplay", "ui", "ambience", "bgm"]);
export const AUDIO_GROUPS = Object.freeze(["gameplay", "ui", "ambience", "bgm"]);
export const AUDIO_SOURCE_MIME_TYPES = Object.freeze(["audio/wav", "audio/ogg", "audio/mpeg", "audio/webm"]);

const CATEGORY_SET = new Set(AUDIO_CATEGORIES);
const MIME_TYPE_SET = new Set(AUDIO_SOURCE_MIME_TYPES);
const STABLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertRecord(value, label) {
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error(`${label} must be an object`);
}

function assertKnownFields(value, allowed, label) {
    for (const field of Object.keys(value)) {
        if (!allowed.has(field)) throw new Error(`${label} has unknown field '${field}'`);
    }
}

function assertStableId(value, label) {
    if (typeof value !== "string" || !STABLE_ID.test(value)) {
        throw new Error(`${label} '${value}' must use lowercase kebab-case`);
    }
}

function assertFiniteRange(value, minimum, maximum, label) {
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
        throw new Error(`${label} must be between ${minimum} and ${maximum}`);
    }
}

function optionalNumber(value, fallback, minimum, maximum, label) {
    if (value === undefined) return fallback;
    assertFiniteRange(value, minimum, maximum, label);
    return value;
}

function optionalInteger(value, fallback, minimum, maximum, label) {
    const resolved = optionalNumber(value, fallback, minimum, maximum, label);
    if (!Number.isInteger(resolved)) throw new Error(`${label} must be an integer`);
    return resolved;
}

function assertRelativePath(path, label) {
    if (
        typeof path !== "string" ||
        !path ||
        path.startsWith("/") ||
        path.includes("\\") ||
        path.includes("?") ||
        path.includes("#") ||
        /^[a-z][a-z\d+.-]*:/i.test(path)
    ) {
        throw new Error(`${label} '${path}' must be a package-relative path`);
    }
    let segments;
    try {
        segments = path.split("/").map((segment) => decodeURIComponent(segment));
    } catch {
        throw new Error(`${label} '${path}' contains invalid URL encoding`);
    }
    if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
        throw new Error(`${label} '${path}' cannot leave its package`);
    }
}

function freezeRecord(entries) {
    return Object.freeze(Object.fromEntries(entries));
}

function defaultTransitionMs(group) {
    if (group === "bgm") return 1500;
    if (group === "ambience") return 1000;
    return 250;
}

function parseSource(source, label, baseUrl) {
    assertRecord(source, label);
    assertKnownFields(source, new Set(["path", "mimeType"]), label);
    assertRelativePath(source.path, `${label}.path`);
    if (!MIME_TYPE_SET.has(source.mimeType)) {
        throw new Error(`${label}.mimeType '${source.mimeType}' is unsupported`);
    }
    return Object.freeze({
        path: source.path,
        mimeType: source.mimeType,
        url: baseUrl ? new URL(source.path, baseUrl).href : source.path
    });
}

function parseLoop(loop, label) {
    if (loop === undefined) return null;
    assertRecord(loop, label);
    assertKnownFields(loop, new Set(["startSeconds", "endSeconds"]), label);
    assertFiniteRange(loop.startSeconds, 0, 60 * 60, `${label}.startSeconds`);
    assertFiniteRange(loop.endSeconds, 0.001, 60 * 60, `${label}.endSeconds`);
    if (loop.endSeconds <= loop.startSeconds) throw new Error(`${label}.endSeconds must exceed startSeconds`);
    return Object.freeze({ startSeconds: loop.startSeconds, endSeconds: loop.endSeconds });
}

function parseClip(clipId, clip, label, baseUrl) {
    assertStableId(clipId, `${label} id`);
    assertRecord(clip, label);
    assertKnownFields(clip, new Set(["playback", "channels", "durationSeconds", "required", "sources", "loop"]), label);
    if (!new Set(["buffer", "stream"]).has(clip.playback)) {
        throw new Error(`${label}.playback must be 'buffer' or 'stream'`);
    }
    if (!new Set(["mono", "stereo"]).has(clip.channels)) {
        throw new Error(`${label}.channels must be 'mono' or 'stereo'`);
    }
    assertFiniteRange(clip.durationSeconds, 0.001, 60 * 60, `${label}.durationSeconds`);
    if (clip.required !== undefined && typeof clip.required !== "boolean") {
        throw new Error(`${label}.required must be boolean`);
    }
    if (!Array.isArray(clip.sources) || clip.sources.length === 0) {
        throw new Error(`${label}.sources must contain at least one source`);
    }
    return Object.freeze({
        id: clipId,
        playback: clip.playback,
        channels: clip.channels,
        durationSeconds: clip.durationSeconds,
        required: clip.required !== false,
        sources: Object.freeze(
            clip.sources.map((source, index) => parseSource(source, `${label}.sources[${index}]`, baseUrl))
        ),
        loop: parseLoop(clip.loop, `${label}.loop`)
    });
}

function parseVariation(variation, label, clips) {
    assertRecord(variation, label);
    assertKnownFields(variation, new Set(["clip", "weight"]), label);
    assertStableId(variation.clip, `${label}.clip`);
    if (!clips[variation.clip]) throw new Error(`${label}.clip references unknown clip '${variation.clip}'`);
    const weight = optionalNumber(variation.weight, 1, 0.001, 1000, `${label}.weight`);
    return Object.freeze({ clipId: variation.clip, weight });
}

function parseDucking(entry, label) {
    assertRecord(entry, label);
    assertKnownFields(entry, new Set(["group", "gainDb", "attackMs", "releaseMs"]), label);
    if (!AUDIO_GROUPS.includes(entry.group)) throw new Error(`${label}.group '${entry.group}' is unsupported`);
    assertFiniteRange(entry.gainDb, -60, 0, `${label}.gainDb`);
    const attackMs = optionalNumber(entry.attackMs, 50, 0, 5000, `${label}.attackMs`);
    const releaseMs = optionalNumber(entry.releaseMs, 400, 0, 10000, `${label}.releaseMs`);
    return Object.freeze({ group: entry.group, gainDb: entry.gainDb, attackMs, releaseMs });
}

function parseCue(cueId, cue, label, clips, category) {
    assertStableId(cueId, `${label} id`);
    assertRecord(cue, label);
    assertKnownFields(
        cue,
        new Set([
            "group",
            "kind",
            "required",
            "clips",
            "spatial",
            "gainDb",
            "maxVoices",
            "retriggerCooldownMs",
            "priority",
            "pitchRandomizationPercent",
            "gainRandomizationDb",
            "minGainDb",
            "transitionMs",
            "ducking"
        ]),
        label
    );
    if (cue.group !== category) throw new Error(`${label}.group must match package category '${category}'`);
    if (!new Set(["one-shot", "loop"]).has(cue.kind)) {
        throw new Error(`${label}.kind must be 'one-shot' or 'loop'`);
    }
    if (cue.required !== undefined && typeof cue.required !== "boolean") {
        throw new Error(`${label}.required must be boolean`);
    }
    if (!Array.isArray(cue.clips) || cue.clips.length === 0) {
        throw new Error(`${label}.clips must contain at least one variation`);
    }
    const variations = Object.freeze(
        cue.clips.map((variation, index) => parseVariation(variation, `${label}.clips[${index}]`, clips))
    );
    if (cue.kind === "one-shot" && variations.some(({ clipId }) => clips[clipId].playback !== "buffer")) {
        throw new Error(`${label}.clips for one-shot cues must reference buffer clips`);
    }
    const spatial = cue.spatial ?? "none";
    if (!new Set(["none", "world"]).has(spatial)) throw new Error(`${label}.spatial is unsupported`);
    if ((category === "bgm" || category === "ui") && spatial !== "none") {
        throw new Error(`${label}.spatial must be 'none' for ${category}`);
    }
    const minGainDb = cue.minGainDb === undefined ? null : cue.minGainDb;
    if (minGainDb !== null) {
        if (spatial !== "world") throw new Error(`${label}.minGainDb requires spatial 'world'`);
        assertFiniteRange(minGainDb, -60, 0, `${label}.minGainDb`);
    }
    const ducking = cue.ducking ?? [];
    if (!Array.isArray(ducking)) throw new Error(`${label}.ducking must be an array`);
    return Object.freeze({
        id: cueId,
        group: cue.group,
        kind: cue.kind,
        required: cue.required !== false,
        variations,
        spatial,
        gainDb: optionalNumber(cue.gainDb, 0, -60, 6, `${label}.gainDb`),
        maxVoices: optionalInteger(cue.maxVoices, 4, 1, 32, `${label}.maxVoices`),
        retriggerCooldownMs: optionalNumber(cue.retriggerCooldownMs, 40, 0, 5000, `${label}.retriggerCooldownMs`),
        priority: optionalInteger(cue.priority, 50, 0, 100, `${label}.priority`),
        pitchRandomizationPercent: optionalNumber(
            cue.pitchRandomizationPercent,
            0,
            0,
            5,
            `${label}.pitchRandomizationPercent`
        ),
        gainRandomizationDb: optionalNumber(cue.gainRandomizationDb, 0, 0, 3, `${label}.gainRandomizationDb`),
        minGainDb,
        transitionMs: optionalNumber(cue.transitionMs, defaultTransitionMs(category), 0, 5000, `${label}.transitionMs`),
        ducking: Object.freeze(ducking.map((entry, index) => parseDucking(entry, `${label}.ducking[${index}]`)))
    });
}

export function createAudioPackageDefinitionFromManifest(manifest, { baseUrl = null } = {}) {
    assertRecord(manifest, "audio manifest");
    assertKnownFields(
        manifest,
        new Set(["$schema", "formatVersion", "id", "category", "generator", "clips", "cues"]),
        "audio manifest"
    );
    if (manifest.formatVersion !== 1) throw new Error(`unsupported audio manifest version '${manifest.formatVersion}'`);
    if (manifest.$schema !== undefined && typeof manifest.$schema !== "string") {
        throw new Error("audio manifest $schema must be a string");
    }
    if (manifest.generator !== undefined) assertRecord(manifest.generator, "audio manifest generator");
    assertStableId(manifest.id, "audio manifest id");
    if (!CATEGORY_SET.has(manifest.category)) {
        throw new Error(`audio manifest category '${manifest.category}' is unsupported`);
    }
    assertRecord(manifest.clips, "audio manifest clips");
    assertRecord(manifest.cues, "audio manifest cues");
    const clipEntries = Object.entries(manifest.clips);
    const cueEntries = Object.entries(manifest.cues);
    if (clipEntries.length === 0) throw new Error("audio manifest must contain at least one clip");
    if (cueEntries.length === 0) throw new Error("audio manifest must contain at least one cue");
    const clips = freezeRecord(
        clipEntries.map(([clipId, clip]) => [
            clipId,
            parseClip(clipId, clip, `audio manifest clips.${clipId}`, baseUrl)
        ])
    );
    const cues = freezeRecord(
        cueEntries.map(([cueId, cue]) => [
            cueId,
            parseCue(cueId, cue, `audio manifest cues.${cueId}`, clips, manifest.category)
        ])
    );
    return Object.freeze({ id: manifest.id, category: manifest.category, clips, cues, baseUrl });
}

export async function loadAudioPackageDefinition(manifestUrl, { fetcher = globalThis.fetch } = {}) {
    if (typeof fetcher !== "function") throw new Error("audio manifest loader requires fetch");
    const response = await fetcher(manifestUrl);
    if (!response?.ok)
        throw new Error(`failed to load audio manifest '${manifestUrl}' (${response?.status ?? "network"})`);
    return createAudioPackageDefinitionFromManifest(await response.json(), {
        baseUrl: response.url || String(manifestUrl)
    });
}
