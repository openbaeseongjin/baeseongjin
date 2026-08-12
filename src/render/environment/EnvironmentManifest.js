import { EnvironmentDefinition } from "./EnvironmentDefinition.js";

export const ENVIRONMENT_MANIFEST_VERSION = 1;

function plainObject(value, label) {
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error(`${label} must be an object`);
    return value;
}

function knownKeys(value, allowed, label) {
    const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
    if (unknown.length) throw new Error(`${label} contains unknown fields: ${unknown.join(", ")}`);
}

export function assertEnvironmentAtlasImagePath(image) {
    if (typeof image !== "string" || !image) throw new Error("environment atlas image must be a non-empty string");
    if (!image.toLowerCase().endsWith(".png")) {
        throw new Error(`environment atlas image '${image}' must be a PNG file`);
    }
    if (/^[a-z][a-z\d+.-]*:/i.test(image) || image.startsWith("/") || image.includes("\\")) {
        throw new Error(`environment atlas image '${image}' must be a relative path`);
    }
    const segments = image.split("/");
    if (segments.includes("..")) {
        throw new Error(`environment atlas image '${image}' cannot leave the asset directory`);
    }
    return image;
}

function sourceFor(image, baseUrl) {
    if (baseUrl === undefined || baseUrl === null) return image;
    try {
        return new URL(image, baseUrl).href;
    } catch (error) {
        throw new Error(`environment manifest base URL is invalid: ${error.message}`);
    }
}

function normalizeAtlasEntries(raw, baseUrl) {
    const obj = plainObject(raw, "environment manifest atlases");
    if (!Object.keys(obj).length) throw new Error("environment manifest requires at least one atlas");
    return Object.fromEntries(
        Object.entries(obj).map(([atlasId, spec]) => {
            const item = plainObject(spec, `environment atlas '${atlasId}'`);
            knownKeys(item, ["image", "size", "frameSize"], `environment atlas '${atlasId}'`);
            assertEnvironmentAtlasImagePath(item.image);
            const size = plainObject(item.size, `environment atlas '${atlasId}' size`);
            const frameSize = plainObject(item.frameSize, `environment atlas '${atlasId}' frameSize`);
            return [
                atlasId,
                {
                    id: atlasId,
                    source: sourceFor(item.image, baseUrl),
                    size: { width: size.width, height: size.height },
                    frameSize: { width: frameSize.width, height: frameSize.height }
                }
            ];
        })
    );
}

function normalizeZone(raw) {
    return {
        id: raw.id,
        label: raw.label,
        minAltitude: raw.minAltitude,
        palette: raw.palette,
        backdropVariant: raw.backdropVariant,
        terrainMaterial: raw.terrainMaterial,
        decorationGroup: raw.decorationGroup
    };
}

function normalizeBackdrop(raw) {
    return {
        layers: (raw.layers ?? []).map((layer) => ({
            id: layer.id,
            depth: layer.depth,
            parallaxX: layer.parallaxX,
            parallaxY: layer.parallaxY,
            frames: (layer.frames ?? []).map((f) => ({
                atlas: f.atlas,
                cell: { column: f.cell.column, row: f.cell.row }
            })),
            tileWidth: layer.tileWidth,
            baselineRatio: layer.baselineRatio,
            peakHeight: layer.peakHeight
        }))
    };
}

function normalizeTerrain(raw) {
    return {
        materials: Object.fromEntries(
            Object.entries(raw.materials ?? {}).map(([matId, spec]) => [
                matId,
                {
                    fill: { atlas: spec.fill.atlas, cell: { column: spec.fill.cell.column, row: spec.fill.cell.row } },
                    edge: { atlas: spec.edge.atlas, cell: { column: spec.edge.cell.column, row: spec.edge.cell.row } },
                    oneWayColor: spec.oneWayColor
                }
            ])
        )
    };
}

function normalizeDecoration(raw) {
    return {
        groups: Object.fromEntries(
            Object.entries(raw.groups ?? {}).map(([groupId, spec]) => [
                groupId,
                {
                    items: (spec.items ?? []).map((di) => ({
                        frame: {
                            atlas: di.frame.atlas,
                            cell: { column: di.frame.cell.column, row: di.frame.cell.row }
                        },
                        placement: {
                            depth: di.placement.depth,
                            surfaceLevelOffset: di.placement.surfaceLevelOffset,
                            avoidPlayPath: di.placement.avoidPlayPath
                        },
                        size: di.size
                    }))
                }
            ])
        )
    };
}

export function createEnvironmentDefinitionFromManifest(manifest, { baseUrl = null } = {}) {
    if (manifest === undefined || manifest === null || Array.isArray(manifest) || typeof manifest !== "object") {
        throw new Error("environment manifest must be an object");
    }
    knownKeys(
        manifest,
        ["$schema", "formatVersion", "id", "generator", "atlases", "zones", "backdrop", "terrain", "decoration"],
        "environment manifest"
    );
    if (manifest.formatVersion !== ENVIRONMENT_MANIFEST_VERSION) {
        throw new Error(
            `environment manifest formatVersion ${manifest.formatVersion} is not supported; expected ${ENVIRONMENT_MANIFEST_VERSION}`
        );
    }
    if (typeof manifest.id !== "string" || !manifest.id.trim()) {
        throw new Error("environment manifest requires a non-empty id");
    }
    if (manifest.generator !== undefined) validateGenerator(manifest.generator);
    const atlases = normalizeAtlasEntries(manifest.atlases ?? {}, baseUrl);
    return new EnvironmentDefinition({
        id: manifest.id,
        atlases,
        zones: (manifest.zones ?? []).map(normalizeZone),
        backdrop: normalizeBackdrop(manifest.backdrop ?? {}),
        terrain: normalizeTerrain(manifest.terrain ?? {}),
        decoration: normalizeDecoration(manifest.decoration ?? {})
    });
}

function validateGenerator(generator) {
    const item = plainObject(generator, "environment manifest generator");
    knownKeys(item, ["tool", "exportVersion", "sourceExport"], "environment manifest generator");
    if (typeof item.tool !== "string" || !item.tool.trim()) {
        throw new Error("environment manifest generator requires a non-empty tool");
    }
    if (item.exportVersion !== undefined && item.exportVersion !== null && typeof item.exportVersion !== "string") {
        throw new Error("environment manifest generator exportVersion must be a string or null");
    }
    if (item.sourceExport !== undefined && typeof item.sourceExport !== "string") {
        throw new Error("environment manifest generator sourceExport must be a string");
    }
}
