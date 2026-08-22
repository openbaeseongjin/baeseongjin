import { EnemySpriteDefinition } from "./EnemySpriteDefinition.js";
import { assertSpriteAtlasImagePath, spriteAtlasSource } from "./SpriteManifestPath.js";

export const ENEMY_SPRITE_MANIFEST_VERSION = 4;

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
    const object = plainObject(generator, "enemy sprite manifest generator");
    knownKeys(object, ["tool", "exportVersion", "sourceExport"], "enemy sprite manifest generator");
    if (typeof object.tool !== "string" || !object.tool.trim()) {
        throw new Error("enemy sprite manifest generator.tool must be a non-empty string");
    }
    if (
        object.exportVersion !== undefined &&
        object.exportVersion !== null &&
        typeof object.exportVersion !== "string"
    ) {
        throw new Error("enemy sprite manifest generator.exportVersion must be a string or null");
    }
    if (object.sourceExport !== undefined && typeof object.sourceExport !== "string") {
        throw new Error("enemy sprite manifest generator.sourceExport must be a string");
    }
}

function normalizeFrame(spec, enemyType, state, index, atlases) {
    const label = `enemy sprite '${enemyType}' state '${state}' frame ${index}`;
    const frame = plainObject(spec, label);
    knownKeys(frame, ["atlas", "cell", "durationMs"], label);
    if (typeof frame.atlas !== "string" || !Object.hasOwn(atlases, frame.atlas)) {
        throw new Error(`enemy sprite '${enemyType}' state '${state}' references unknown atlas '${frame.atlas}'`);
    }
    const cell = plainObject(frame.cell, `${label} cell`);
    knownKeys(cell, ["column", "row"], `${label} cell`);
    if (!Number.isInteger(cell.column) || cell.column < 0 || !Number.isInteger(cell.row) || cell.row < 0) {
        throw new Error(`enemy sprite '${enemyType}' state '${state}' cell requires non-negative integers`);
    }
    if (!Number.isInteger(frame.durationMs) || frame.durationMs <= 0) {
        throw new Error(
            `enemy sprite '${enemyType}' state '${state}' frame ${index} durationMs must be a positive integer`
        );
    }
    const frameSize = atlases[frame.atlas].frameSize;
    return Object.freeze({
        atlasId: frame.atlas,
        x: cell.column * frameSize.width,
        y: cell.row * frameSize.height,
        width: frameSize.width,
        height: frameSize.height,
        durationSeconds: frame.durationMs / 1000
    });
}

function normalizeAimLayer(spec, enemyType, atlases) {
    if (spec === undefined) return undefined;
    const label = `enemy sprite '${enemyType}' aimLayer`;
    const layer = plainObject(spec, label);
    knownKeys(layer, ["orientation", "atlas", "cell"], label);
    if (layer.orientation !== "upright-aim") {
        throw new Error(`${label}.orientation must be 'upright-aim'`);
    }
    if (typeof layer.atlas !== "string" || !Object.hasOwn(atlases, layer.atlas)) {
        throw new Error(`${label} references unknown atlas '${layer.atlas}'`);
    }
    const cell = plainObject(layer.cell, `${label} cell`);
    knownKeys(cell, ["column", "row"], `${label} cell`);
    if (!Number.isInteger(cell.column) || cell.column < 0 || !Number.isInteger(cell.row) || cell.row < 0) {
        throw new Error(`${label} cell requires non-negative integers`);
    }
    const frameSize = atlases[layer.atlas].frameSize;
    return Object.freeze({
        orientation: layer.orientation,
        frame: Object.freeze({
            atlasId: layer.atlas,
            x: cell.column * frameSize.width,
            y: cell.row * frameSize.height,
            width: frameSize.width,
            height: frameSize.height
        })
    });
}

function normalizeGuardLayer(spec, enemyType, atlases) {
    if (spec === undefined) return undefined;
    const label = `enemy sprite '${enemyType}' guardLayer`;
    const layer = plainObject(spec, label);
    knownKeys(layer, ["orientation", "frames"], label);
    if (layer.orientation !== "guard-octants") {
        throw new Error(`${label}.orientation must be 'guard-octants'`);
    }
    if (!Array.isArray(layer.frames) || layer.frames.length !== 8) {
        throw new Error(`${label}.frames must contain exactly 8 direction frames`);
    }
    return Object.freeze({
        orientation: layer.orientation,
        frames: Object.freeze(
            layer.frames.map((spec, index) => {
                const frameLabel = `${label} frame ${index}`;
                const frame = plainObject(spec, frameLabel);
                knownKeys(frame, ["atlas", "cell"], frameLabel);
                if (typeof frame.atlas !== "string" || !Object.hasOwn(atlases, frame.atlas)) {
                    throw new Error(`${frameLabel} references unknown atlas '${frame.atlas}'`);
                }
                const cell = plainObject(frame.cell, `${frameLabel} cell`);
                knownKeys(cell, ["column", "row"], `${frameLabel} cell`);
                if (!Number.isInteger(cell.column) || cell.column < 0 || !Number.isInteger(cell.row) || cell.row < 0) {
                    throw new Error(`${frameLabel} cell requires non-negative integers`);
                }
                const frameSize = atlases[frame.atlas].frameSize;
                return Object.freeze({
                    atlasId: frame.atlas,
                    x: cell.column * frameSize.width,
                    y: cell.row * frameSize.height,
                    width: frameSize.width,
                    height: frameSize.height
                });
            })
        )
    });
}

function normalizeState(spec, enemyType, state, atlases) {
    const label = `enemy sprite '${enemyType}' state '${state}'`;
    const item = plainObject(spec, label);
    knownKeys(item, ["loop", "frames", "fallback"], label);
    if (item.frames !== undefined && item.fallback !== undefined) {
        throw new Error(`${label} cannot declare both frames and fallback`);
    }
    if (item.frames === undefined) return { fallback: item.fallback };
    if (!Array.isArray(item.frames) || !item.frames.length) {
        throw new Error(`${label} requires at least one frame`);
    }
    if (item.loop !== undefined && typeof item.loop !== "boolean") {
        throw new Error(`${label} loop must be a boolean`);
    }
    return {
        loop: item.loop,
        frames: item.frames.map((frame, index) => normalizeFrame(frame, enemyType, state, index, atlases))
    };
}

export function createEnemySpriteDefinitionFromManifest(manifest, { baseUrl } = {}) {
    const object = plainObject(manifest, "enemy sprite manifest");
    knownKeys(
        object,
        ["$schema", "formatVersion", "id", "generator", "atlases", "aliases", "enemies"],
        "enemy sprite manifest"
    );
    if (object.formatVersion !== ENEMY_SPRITE_MANIFEST_VERSION) {
        throw new Error(
            `Unsupported enemy sprite manifest formatVersion '${object.formatVersion}'; expected ${ENEMY_SPRITE_MANIFEST_VERSION}`
        );
    }
    if (object.$schema !== undefined && typeof object.$schema !== "string") {
        throw new Error("enemy sprite manifest $schema must be a string");
    }
    normalizeGenerator(object.generator);

    const atlasManifest = plainObject(object.atlases, "enemy sprite manifest atlases");
    if (!Object.keys(atlasManifest).length) throw new Error("enemy sprite manifest requires at least one atlas");
    const atlases = Object.fromEntries(
        Object.entries(atlasManifest).map(([atlasId, spec]) => {
            const atlas = plainObject(spec, `enemy sprite atlas '${atlasId}'`);
            knownKeys(atlas, ["image", "size", "frameSize"], `enemy sprite atlas '${atlasId}'`);
            assertSpriteAtlasImagePath(atlas.image);
            size(atlas.size, `enemy sprite atlas '${atlasId}' size`);
            size(atlas.frameSize, `enemy sprite atlas '${atlasId}' frameSize`);
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

    const aliases = object.aliases === undefined ? {} : plainObject(object.aliases, "enemy sprite manifest aliases");
    const enemyManifest = plainObject(object.enemies, "enemy sprite manifest enemies");
    const enemies = Object.fromEntries(
        Object.entries(enemyManifest).map(([enemyType, spec]) => {
            const enemy = plainObject(spec, `enemy sprite '${enemyType}'`);
            knownKeys(enemy, ["render", "states"], `enemy sprite '${enemyType}'`);
            const render = plainObject(enemy.render, `enemy sprite '${enemyType}' render`);
            knownKeys(
                render,
                ["facing", "size", "anchor", "offset", "pixelSnap", "aimLayer", "guardLayer"],
                `enemy sprite '${enemyType}' render`
            );
            size(render.size, `enemy sprite '${enemyType}' render.size`);
            point(render.anchor, `enemy sprite '${enemyType}' render.anchor`);
            point(render.offset, `enemy sprite '${enemyType}' render.offset`);
            const states = plainObject(enemy.states, `enemy sprite '${enemyType}' states`);
            return [
                enemyType,
                {
                    render: {
                        ...render,
                        aimLayer: normalizeAimLayer(render.aimLayer, enemyType, atlases),
                        guardLayer: normalizeGuardLayer(render.guardLayer, enemyType, atlases)
                    },
                    states: Object.fromEntries(
                        Object.entries(states).map(([state, stateSpec]) => [
                            state,
                            normalizeState(stateSpec, enemyType, state, atlases)
                        ])
                    )
                }
            ];
        })
    );
    return new EnemySpriteDefinition({ id: object.id, atlases, aliases, enemies });
}

export async function loadEnemySpriteManifest(manifestUrl, { fetchFn = globalThis.fetch } = {}) {
    if (typeof fetchFn !== "function") throw new Error("loadEnemySpriteManifest requires fetch");
    let resolvedUrl;
    try {
        resolvedUrl = new URL(manifestUrl, globalThis.location?.href).href;
    } catch (error) {
        throw new Error(`enemy sprite manifest URL is invalid: ${error.message}`);
    }
    let response;
    try {
        response = await fetchFn(resolvedUrl);
    } catch (error) {
        throw new Error(`Failed to load enemy sprite manifest '${resolvedUrl}': ${error.message}`);
    }
    if (!response?.ok) {
        throw new Error(
            `Failed to load enemy sprite manifest '${resolvedUrl}' (${response?.status ?? "unknown status"})`
        );
    }
    let manifest;
    try {
        manifest = await response.json();
    } catch (error) {
        throw new Error(`Failed to parse enemy sprite manifest '${resolvedUrl}': ${error.message}`);
    }
    return createEnemySpriteDefinitionFromManifest(manifest, { baseUrl: resolvedUrl });
}
