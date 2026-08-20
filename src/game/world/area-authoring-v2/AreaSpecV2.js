import { defineArea, grappleTarget, worldObject } from "../areas/AreaDefinition.js";

export const AREA_SPEC_V2 = "area-spec-v2";
export const EDITOR_EDITABLE_DOMAINS = Object.freeze([
    "bounds",
    "entry",
    "surfaces",
    "anchors",
    "recoveryRoute",
    "enemySlots",
    "wind",
    "camera"
]);
export const EDITOR_READ_ONLY_DOMAINS = Object.freeze([
    "objectives",
    "progression",
    "story",
    "scanner",
    "behaviorRegistry"
]);

function stableValue(value) {
    if (Array.isArray(value)) return value.map((entry) => stableValue(entry));
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
        Object.keys(value)
            .sort((left, right) => left.localeCompare(right, "en"))
            .map((key) => [key, stableValue(value[key])])
    );
}

function insertAnchors(entries, anchors, indexKey, build) {
    const result = entries.map((entry) => structuredClone(entry));
    const indexedAnchors = anchors
        .map((anchor, ordinal) => ({ anchor, ordinal, index: anchor[indexKey] }))
        .filter(({ index }) => Number.isInteger(index) && index >= 0)
        .sort((left, right) => left.index - right.index || left.ordinal - right.ordinal);
    for (const { anchor, index } of indexedAnchors) result.splice(Math.min(index, result.length), 0, build(anchor));
    for (const anchor of anchors) {
        if (!Number.isInteger(anchor[indexKey]) || anchor[indexKey] < 0) result.push(build(anchor));
    }
    return result;
}

function anchorTarget(anchor) {
    const { id, x, y, properties = {} } = anchor.target;
    return grappleTarget(id, x, y, properties);
}

function anchorLandmark(anchor) {
    const { id, x, y, properties = {} } = anchor.landmark;
    return worldObject(id, "grapple-landmark", x, y, properties);
}

export function createAreaDefinitionFromV2(spec) {
    const definition = structuredClone(spec.definition);
    const anchors = spec.anchors ?? [];
    return defineArea({
        ...definition,
        surfaces: insertAnchors(definition.surfaces ?? [], anchors, "surfaceIndex", anchorTarget),
        objects: insertAnchors(definition.objects ?? [], anchors, "objectIndex", anchorLandmark)
    });
}

export function canonicalizeAreaSpecV2(spec) {
    return stableValue(structuredClone(spec));
}
