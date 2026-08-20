import { PlayerSpriteDefinition } from "./PlayerSpriteDefinition.js";
import { assertSpriteAtlasImagePath, spriteAtlasSource } from "./SpriteManifestPath.js";

export { assertSpriteAtlasImagePath } from "./SpriteManifestPath.js";

export const PLAYER_SPRITE_MANIFEST_VERSION = 2;

function plainObject(value, label) {
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error(`${label} must be an object`);
    return value;
}

function knownKeys(value, allowed, label) {
    const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
    if (unknown.length) throw new Error(`${label} contains unknown fields: ${unknown.join(", ")}`);
}

function point(value, label) {
    const object = plainObject(value, label);
    knownKeys(object, ["x", "y"], label);
    return object;
}

function size(value, label) {
    const object = plainObject(value, label);
    knownKeys(object, ["width", "height"], label);
    return object;
}

function normalizeGenerator(generator) {
    if (generator === undefined) return;
    const object = plainObject(generator, "sprite manifest generator");
    knownKeys(object, ["tool", "exportVersion", "sourceExport"], "sprite manifest generator");
    if (typeof object.tool !== "string" || !object.tool.trim()) {
        throw new Error("sprite manifest generator.tool must be a non-empty string");
    }
    if (
        object.exportVersion !== undefined &&
        object.exportVersion !== null &&
        typeof object.exportVersion !== "string"
    ) {
        throw new Error("sprite manifest generator.exportVersion must be a string or null");
    }
    if (object.sourceExport !== undefined && typeof object.sourceExport !== "string") {
        throw new Error("sprite manifest generator.sourceExport must be a string");
    }
}

function normalizeCue(cue, state) {
    if (cue === undefined) return undefined;
    const object = plainObject(cue, `sprite animation '${state}' cue`);
    knownKeys(object, ["scale", "offset", "opacity", "pixelSnap"], `sprite animation '${state}' cue`);
    if (object.scale !== undefined) point(object.scale, `sprite animation '${state}' cue.scale`);
    if (object.offset !== undefined) point(object.offset, `sprite animation '${state}' cue.offset`);
    return object;
}

function normalizeAnimation(spec, state, atlases) {
    const object = plainObject(spec, `sprite animation '${state}'`);
    knownKeys(object, ["loop", "frames", "fallback", "cue"], `sprite animation '${state}'`);
    const cue = normalizeCue(object.cue, state);
    if (object.frames !== undefined && object.fallback !== undefined) {
        throw new Error(`sprite animation '${state}' cannot declare both frames and fallback`);
    }
    if (object.frames === undefined) return { fallback: object.fallback, cue };
    if (!Array.isArray(object.frames) || !object.frames.length) {
        throw new Error(`sprite animation '${state}' requires at least one frame`);
    }
    const frames = object.frames.map((frame, index) => {
        const item = plainObject(frame, `sprite animation '${state}' frame ${index}`);
        knownKeys(item, ["atlas", "cell", "durationMs"], `sprite animation '${state}' frame ${index}`);
        if (typeof item.atlas !== "string" || !Object.hasOwn(atlases, item.atlas)) {
            throw new Error(`sprite animation '${state}' frame ${index} references unknown atlas '${item.atlas}'`);
        }
        const cell = plainObject(item.cell, `sprite animation '${state}' frame ${index} cell`);
        knownKeys(cell, ["column", "row"], `sprite animation '${state}' frame ${index} cell`);
        if (!Number.isInteger(cell.column) || cell.column < 0 || !Number.isInteger(cell.row) || cell.row < 0) {
            throw new Error(`sprite animation '${state}' frame ${index} cell requires non-negative integers`);
        }
        if (!Number.isInteger(item.durationMs) || item.durationMs <= 0) {
            throw new Error(`sprite animation '${state}' frame ${index} durationMs must be a positive integer`);
        }
        const frameSize = atlases[item.atlas].frameSize;
        return {
            atlasId: item.atlas,
            x: cell.column * frameSize.width,
            y: cell.row * frameSize.height,
            width: frameSize.width,
            height: frameSize.height,
            durationSeconds: item.durationMs / 1000
        };
    });
    return { loop: object.loop, frames, cue };
}

export function createPlayerSpriteDefinitionFromManifest(manifest, { baseUrl } = {}) {
    const object = plainObject(manifest, "sprite manifest");
    knownKeys(
        object,
        ["$schema", "formatVersion", "id", "generator", "render", "atlases", "animations"],
        "sprite manifest"
    );
    if (object.formatVersion !== PLAYER_SPRITE_MANIFEST_VERSION) {
        throw new Error(
            `Unsupported sprite manifest formatVersion '${object.formatVersion}'; expected ${PLAYER_SPRITE_MANIFEST_VERSION}`
        );
    }
    if (object.$schema !== undefined && typeof object.$schema !== "string") {
        throw new Error("sprite manifest $schema must be a string");
    }
    normalizeGenerator(object.generator);

    const render = plainObject(object.render, "sprite manifest render");
    knownKeys(render, ["facing", "size", "anchor", "offset", "pixelSnap"], "sprite manifest render");
    if (render.facing !== "right") throw new Error("sprite manifest render.facing must be 'right'");
    size(render.size, "sprite manifest render.size");
    point(render.anchor, "sprite manifest render.anchor");
    point(render.offset, "sprite manifest render.offset");

    const atlasManifest = plainObject(object.atlases, "sprite manifest atlases");
    if (!Object.keys(atlasManifest).length) throw new Error("sprite manifest requires at least one atlas");
    const atlases = Object.fromEntries(
        Object.entries(atlasManifest).map(([atlasId, spec]) => {
            const atlas = plainObject(spec, `sprite atlas '${atlasId}'`);
            knownKeys(atlas, ["image", "size", "frameSize"], `sprite atlas '${atlasId}'`);
            assertSpriteAtlasImagePath(atlas.image);
            size(atlas.size, `sprite atlas '${atlasId}' size`);
            size(atlas.frameSize, `sprite atlas '${atlasId}' frameSize`);
            return [
                atlasId,
                {
                    source: spriteAtlasSource(atlas.image, baseUrl),
                    size: atlas.size,
                    frameSize: atlas.frameSize
                }
            ];
        })
    );

    const animations = plainObject(object.animations, "sprite manifest animations");
    const states = Object.fromEntries(
        Object.entries(animations).map(([state, spec]) => [state, normalizeAnimation(spec, state, atlases)])
    );
    return new PlayerSpriteDefinition({
        id: object.id,
        atlases,
        destinationSize: render.size,
        anchor: render.anchor,
        offset: render.offset,
        pixelSnap: render.pixelSnap,
        states
    });
}

export async function loadPlayerSpriteManifest(manifestUrl, { fetchFn = globalThis.fetch } = {}) {
    if (typeof fetchFn !== "function") throw new Error("loadPlayerSpriteManifest requires fetch");
    let resolvedUrl;
    try {
        resolvedUrl = new URL(manifestUrl, globalThis.location?.href).href;
    } catch (error) {
        throw new Error(`sprite manifest URL is invalid: ${error.message}`);
    }
    let response;
    try {
        response = await fetchFn(resolvedUrl);
    } catch (error) {
        throw new Error(`Failed to load sprite manifest '${resolvedUrl}': ${error.message}`);
    }
    if (!response?.ok) {
        throw new Error(`Failed to load sprite manifest '${resolvedUrl}' (${response?.status ?? "unknown status"})`);
    }
    let manifest;
    try {
        manifest = await response.json();
    } catch (error) {
        throw new Error(`Failed to parse sprite manifest '${resolvedUrl}': ${error.message}`);
    }
    return createPlayerSpriteDefinitionFromManifest(manifest, { baseUrl: resolvedUrl });
}
