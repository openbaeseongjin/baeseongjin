import { ENVIRONMENT_MAX_ALTITUDE } from "./EnvironmentAltitude.js";

function positiveInteger(value, label) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${label} must be a positive integer, got ${value}`);
    }
    return value;
}

function nonNegativeInteger(value, label) {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${label} must be a non-negative integer, got ${value}`);
    }
    return value;
}

function positiveSize(value, label) {
    if (!value || !Number.isFinite(value.width) || !Number.isFinite(value.height)) {
        throw new Error(`${label} requires finite width and height`);
    }
    if (value.width <= 0 || value.height <= 0) {
        throw new Error(`${label} requires positive width and height`);
    }
    return Object.freeze({ width: value.width, height: value.height });
}

function plainObject(value, label) {
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error(`${label} must be an object`);
    return value;
}

function knownKeys(value, allowed, label) {
    const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
    if (unknown.length) throw new Error(`${label} contains unknown fields: ${unknown.join(", ")}`);
}

function finiteNumber(value, label, { min = -Infinity, max = Infinity } = {}) {
    if (!Number.isFinite(value) || value < min || value > max) {
        throw new Error(`${label} must be a finite number between ${min} and ${max}`);
    }
    return value;
}

const VALID_ZONE_IDS = Object.freeze([
    "waste",
    "industrial-maintenance",
    "residential-commercial",
    "corporate-security",
    "landing-pad"
]);

const VALID_DEPTHS = Object.freeze(["far", "mid", "near", "foreground"]);

export class EnvironmentDefinition {
    constructor({ id, atlases, zones, backdrop, terrain, decoration } = {}) {
        if (typeof id !== "string" || !id.trim()) throw new Error("EnvironmentDefinition requires a non-empty id");
        this.id = id;
        this.atlases = normalizeAtlases(atlases);
        this.zones = normalizeZones(zones);
        this.backdrop = normalizeBackdrop(backdrop, this.atlases);
        this.terrain = normalizeTerrain(terrain, this.atlases);
        this.decoration = normalizeDecoration(decoration, this.atlases);
        validateZoneReferences(this.zones, this.terrain, this.decoration);
        Object.freeze(this);
    }

    zoneAt(altitude) {
        for (let i = this.zones.length - 1; i >= 0; i -= 1) {
            if (altitude >= this.zones[i].minAltitude) return this.zones[i];
        }
        return this.zones[0];
    }

    materialFor(zone) {
        const material = this.terrain.materials[zone.terrainMaterial];
        if (!material) throw new Error(`Unknown terrain material '${zone.terrainMaterial}'`);
        return material;
    }

    decorationGroupFor(zone) {
        const group = this.decoration.groups[zone.decorationGroup];
        if (!group) throw new Error(`Unknown decoration group '${zone.decorationGroup}'`);
        return group;
    }
}

function normalizeAtlases(atlases) {
    if (!atlases || Array.isArray(atlases) || typeof atlases !== "object" || !Object.keys(atlases).length) {
        throw new Error("EnvironmentDefinition requires atlas definitions");
    }
    return Object.freeze(
        Object.fromEntries(
            Object.entries(atlases).map(([atlasId, spec]) => {
                if (!atlasId.trim()) throw new Error("environment atlas id must be non-empty");
                const obj = plainObject(spec, `environment atlas '${atlasId}'`);
                knownKeys(obj, ["id", "image", "source", "size", "frameSize"], `environment atlas '${atlasId}'`);
                if (obj.id !== undefined && obj.id !== atlasId) {
                    throw new Error(`environment atlas '${atlasId}' id must match its key`);
                }
                const source = obj.image ?? obj.source;
                if (typeof source !== "string" || !source) {
                    throw new Error(`environment atlas '${atlasId}' requires an image path`);
                }
                const size = positiveSize(obj.size, `environment atlas '${atlasId}' size`, true);
                const frameSize = positiveSize(obj.frameSize, `environment atlas '${atlasId}' frameSize`, true);
                if (!Number.isInteger(size.width) || !Number.isInteger(size.height)) {
                    throw new Error(`environment atlas '${atlasId}' size must be integer`);
                }
                if (!Number.isInteger(frameSize.width) || !Number.isInteger(frameSize.height)) {
                    throw new Error(`environment atlas '${atlasId}' frameSize must be integer`);
                }
                if (size.width % frameSize.width || size.height % frameSize.height) {
                    throw new Error(`environment atlas '${atlasId}' size must be divisible by frameSize`);
                }
                return [atlasId, Object.freeze({ id: atlasId, source, size, frameSize })];
            })
        )
    );
}

function normalizeZones(zones) {
    if (!Array.isArray(zones) || zones.length !== VALID_ZONE_IDS.length) {
        throw new Error(`EnvironmentDefinition requires exactly ${VALID_ZONE_IDS.length} zones`);
    }
    const normalized = zones
        .map((zone, index) => {
            const obj = plainObject(zone, `zone ${index}`);
            knownKeys(
                obj,
                ["id", "label", "minAltitude", "palette", "backdropVariant", "terrainMaterial", "decorationGroup"],
                `zone ${index}`
            );
            if (!VALID_ZONE_IDS.includes(obj.id)) {
                throw new Error(`zone ${index} has invalid id '${obj.id}'`);
            }
            if (typeof obj.minAltitude !== "number" || !Number.isFinite(obj.minAltitude)) {
                throw new Error(`zone ${index} requires finite minAltitude`);
            }
            if (obj.minAltitude < 0 || obj.minAltitude > ENVIRONMENT_MAX_ALTITUDE) {
                throw new Error(`zone ${index} minAltitude must stay within the reachable world altitude`);
            }
            if (obj.label !== undefined && (typeof obj.label !== "string" || !obj.label.trim())) {
                throw new Error(`zone ${index} label must be a non-empty string`);
            }
            if (typeof obj.backdropVariant !== "string" || !obj.backdropVariant) {
                throw new Error(`zone ${index} requires non-empty backdropVariant`);
            }
            if (typeof obj.terrainMaterial !== "string" || !obj.terrainMaterial) {
                throw new Error(`zone ${index} requires non-empty terrainMaterial`);
            }
            if (typeof obj.decorationGroup !== "string" || !obj.decorationGroup) {
                throw new Error(`zone ${index} requires non-empty decorationGroup`);
            }
            const palette = normalizePalette(obj.palette, `zone '${obj.id}'`);
            return Object.freeze({
                id: obj.id,
                label: obj.label ?? obj.id,
                minAltitude: obj.minAltitude,
                palette,
                backdropVariant: obj.backdropVariant,
                terrainMaterial: obj.terrainMaterial,
                decorationGroup: obj.decorationGroup
            });
        })
        .sort((a, b) => a.minAltitude - b.minAltitude);
    const zoneIds = new Set(normalized.map(({ id }) => id));
    if (zoneIds.size !== VALID_ZONE_IDS.length || VALID_ZONE_IDS.some((id) => !zoneIds.has(id))) {
        throw new Error(`environment zones must contain each stable id exactly once: ${VALID_ZONE_IDS.join(", ")}`);
    }
    for (let index = 1; index < normalized.length; index += 1) {
        if (normalized[index].minAltitude <= normalized[index - 1].minAltitude) {
            throw new Error("environment zone minAltitude values must increase strictly");
        }
    }
    if (normalized[0].minAltitude !== 0) throw new Error("the first environment zone must start at altitude 0");
    return Object.freeze(normalized);
}

function validateZoneReferences(zones, terrain, decoration) {
    for (const zone of zones) {
        if (!Object.hasOwn(terrain.materials, zone.terrainMaterial)) {
            throw new Error(`zone '${zone.id}' references unknown terrain material '${zone.terrainMaterial}'`);
        }
        if (!Object.hasOwn(decoration.groups, zone.decorationGroup)) {
            throw new Error(`zone '${zone.id}' references unknown decoration group '${zone.decorationGroup}'`);
        }
    }
}

function normalizePalette(palette, label) {
    const obj = plainObject(palette, `${label} palette`);
    knownKeys(
        obj,
        [
            "skyTop",
            "skyBottom",
            "silhouetteFar",
            "silhouetteMid",
            "silhouetteNear",
            "terrainFill",
            "terrainEdge",
            "oneWayEdge",
            "accent"
        ],
        `${label} palette`
    );
    for (const required of ["skyTop", "skyBottom", "silhouetteFar", "silhouetteMid", "silhouetteNear"]) {
        if (!Object.hasOwn(obj, required)) throw new Error(`${label} palette requires '${required}'`);
    }
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value !== "string" || !value.trim()) {
            throw new Error(`${label} palette '${key}' must be a non-empty string`);
        }
    }
    return Object.freeze({
        skyTop: obj.skyTop ?? "#171d2a",
        skyBottom: obj.skyBottom ?? "#080b10",
        silhouetteFar: obj.silhouetteFar ?? "#222a32",
        silhouetteMid: obj.silhouetteMid ?? "#30373d",
        silhouetteNear: obj.silhouetteNear ?? "#3e4241",
        terrainFill: obj.terrainFill ?? "#4b4a45",
        terrainEdge: obj.terrainEdge ?? "#777269",
        oneWayEdge: obj.oneWayEdge ?? "#a8d8cf",
        accent: obj.accent ?? "#f59e0b"
    });
}

function normalizeFrame(frame, label, atlases) {
    const obj = plainObject(frame, label);
    knownKeys(obj, ["atlas", "cell", "atlasId", "x", "y", "width", "height"], label);
    const atlasId = obj.atlas ?? obj.atlasId;
    if (typeof atlasId !== "string" || !Object.hasOwn(atlases, atlasId)) {
        throw new Error(`${label} references unknown atlas '${atlasId}'`);
    }
    if (obj.atlasId !== undefined) {
        if (obj.atlas !== undefined || obj.cell !== undefined) {
            throw new Error(`${label} cannot mix cell and rectangle frame forms`);
        }
        if (![obj.x, obj.y, obj.width, obj.height].every(Number.isInteger))
            throw new Error(`${label} requires integer bounds`);
        const atlas = atlases[atlasId];
        if (obj.x < 0 || obj.y < 0 || obj.width <= 0 || obj.height <= 0) {
            throw new Error(`${label} requires positive bounds inside its atlas`);
        }
        if (obj.x + obj.width > atlas.size.width || obj.y + obj.height > atlas.size.height) {
            throw new Error(`${label} bounds exceed atlas '${atlasId}'`);
        }
        return Object.freeze({ atlasId, x: obj.x, y: obj.y, width: obj.width, height: obj.height });
    }
    if (obj.atlas === undefined || obj.cell === undefined) throw new Error(`${label} requires atlas and cell`);
    const cell = plainObject(obj.cell, `${label} cell`);
    knownKeys(cell, ["column", "row"], `${label} cell`);
    const atlas = atlases[atlasId];
    const col = nonNegativeInteger(cell.column, `${label} cell.column`);
    const row = nonNegativeInteger(cell.row, `${label} cell.row`);
    if (col * atlas.frameSize.width >= atlas.size.width) {
        throw new Error(`${label} cell.column ${col} exceeds atlas '${atlasId}' grid`);
    }
    if (row * atlas.frameSize.height >= atlas.size.height) {
        throw new Error(`${label} cell.row ${row} exceeds atlas '${atlasId}' grid`);
    }
    return Object.freeze({
        atlasId,
        x: col * atlas.frameSize.width,
        y: row * atlas.frameSize.height,
        width: atlas.frameSize.width,
        height: atlas.frameSize.height
    });
}

function normalizeBackdrop(backdrop, atlases) {
    const obj = plainObject(backdrop, "backdrop");
    knownKeys(obj, ["layers"], "backdrop");
    if (!Array.isArray(obj.layers) || obj.layers.length === 0) {
        throw new Error("backdrop requires at least one layer");
    }
    const layers = obj.layers.map((layer, index) => {
        const item = plainObject(layer, `backdrop layer ${index}`);
        knownKeys(
            item,
            ["id", "depth", "parallaxX", "parallaxY", "frames", "tileWidth", "baselineRatio", "peakHeight"],
            `backdrop layer ${index}`
        );
        if (!["far", "mid", "near"].includes(item.id)) {
            throw new Error(`backdrop layer ${index} has invalid id '${item.id}'`);
        }
        if (!Array.isArray(item.frames) || item.frames.length === 0) {
            throw new Error(`backdrop layer ${index} requires at least one frame`);
        }
        const frames = item.frames.map((frame, fi) =>
            normalizeFrame(frame, `backdrop layer ${index} frame ${fi}`, atlases)
        );
        return Object.freeze({
            id: item.id,
            depth: finiteNumber(item.depth, `backdrop layer ${index} depth`),
            parallaxX: finiteNumber(item.parallaxX, `backdrop layer ${index} parallaxX`),
            parallaxY: finiteNumber(item.parallaxY, `backdrop layer ${index} parallaxY`),
            frames,
            tileWidth: positiveInteger(item.tileWidth ?? 400, `backdrop layer ${index} tileWidth`),
            baselineRatio: finiteNumber(item.baselineRatio ?? 0.7, `backdrop layer ${index} baselineRatio`, {
                min: 0,
                max: 1
            }),
            peakHeight: finiteNumber(item.peakHeight ?? 200, `backdrop layer ${index} peakHeight`, { min: 0 })
        });
    });
    return Object.freeze({ layers: Object.freeze(layers) });
}

function normalizeTerrain(terrain, atlases) {
    const obj = plainObject(terrain, "terrain");
    knownKeys(obj, ["materials"], "terrain");
    if (!obj.materials || Array.isArray(obj.materials) || typeof obj.materials !== "object") {
        throw new Error("terrain requires materials object");
    }
    if (Object.keys(obj.materials).length === 0) throw new Error("terrain requires at least one material");
    const materials = Object.fromEntries(
        Object.entries(obj.materials).map(([matId, spec]) => {
            const item = plainObject(spec, `terrain material '${matId}'`);
            knownKeys(item, ["id", "fill", "edge", "oneWayColor"], `terrain material '${matId}'`);
            const fill = normalizeFrame(item.fill, `terrain material '${matId}' fill`, atlases);
            const edge = normalizeFrame(item.edge, `terrain material '${matId}' edge`, atlases);
            if (item.oneWayColor !== undefined && (typeof item.oneWayColor !== "string" || !item.oneWayColor.trim())) {
                throw new Error(`terrain material '${matId}' oneWayColor must be a non-empty string`);
            }
            return [
                matId,
                Object.freeze({
                    id: matId,
                    fill,
                    edge,
                    oneWayColor: item.oneWayColor ?? "#a8d8cf"
                })
            ];
        })
    );
    return Object.freeze({ materials: Object.freeze(materials) });
}

function normalizeDecoration(decoration, atlases) {
    const obj = plainObject(decoration, "decoration");
    knownKeys(obj, ["groups"], "decoration");
    if (!obj.groups || Array.isArray(obj.groups) || typeof obj.groups !== "object") {
        throw new Error("decoration requires groups object");
    }
    if (Object.keys(obj.groups).length === 0) throw new Error("decoration requires at least one group");
    const groups = Object.fromEntries(
        Object.entries(obj.groups).map(([groupId, spec]) => {
            const item = plainObject(spec, `decoration group '${groupId}'`);
            knownKeys(item, ["items"], `decoration group '${groupId}'`);
            if (!Array.isArray(item.items) || item.items.length === 0) {
                throw new Error(`decoration group '${groupId}' requires at least one item`);
            }
            const items = item.items.map((decorationItem, di) => {
                const diObj = plainObject(decorationItem, `decoration group '${groupId}' item ${di}`);
                knownKeys(diObj, ["frame", "placement", "size"], `decoration group '${groupId}' item ${di}`);
                const frame = normalizeFrame(diObj.frame, `decoration group '${groupId}' item ${di} frame`, atlases);
                const placement = plainObject(diObj.placement, `decoration group '${groupId}' item ${di} placement`);
                knownKeys(
                    placement,
                    ["depth", "surfaceLevelOffset", "avoidPlayPath"],
                    `decoration group '${groupId}' item ${di} placement`
                );
                if (!VALID_DEPTHS.includes(placement.depth)) {
                    throw new Error(`decoration item placement depth '${placement.depth}' is invalid`);
                }
                if (placement.avoidPlayPath === false) {
                    throw new Error(`decoration group '${groupId}' item ${di} must avoid the play path`);
                }
                if (placement.avoidPlayPath !== undefined && typeof placement.avoidPlayPath !== "boolean") {
                    throw new Error(`decoration group '${groupId}' item ${di} avoidPlayPath must be boolean`);
                }
                const surfaceLevelOffset = finiteNumber(
                    placement.surfaceLevelOffset ?? 0,
                    `decoration group '${groupId}' item ${di} surfaceLevelOffset`
                );
                const size = diObj.size
                    ? positiveSize(diObj.size, `decoration group '${groupId}' item ${di} size`)
                    : { width: frame.width, height: frame.height };
                if (!Number.isInteger(size.width) || !Number.isInteger(size.height)) {
                    throw new Error(`decoration group '${groupId}' item ${di} size must be integer`);
                }
                return Object.freeze({
                    frame,
                    placement: Object.freeze({
                        depth: placement.depth,
                        surfaceLevelOffset,
                        avoidPlayPath: placement.avoidPlayPath ?? true
                    }),
                    size: Object.freeze(size)
                });
            });
            return [groupId, Object.freeze({ id: groupId, items: Object.freeze(items) })];
        })
    );
    return Object.freeze({ groups: Object.freeze(groups) });
}
