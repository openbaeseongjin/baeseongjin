import { defineArea, grappleTarget, worldObject } from "../areas/AreaDefinition.js";
import { deriveHardpointJammerGroups } from "../HardpointJammerDefinition.js";

export const AREA_SPEC_V2 = "area-spec-v2";
export const AREA_SPEC_V2_AUTHORING_MODES = Object.freeze(["runtime", "scenario"]);
export const EDITOR_EDITABLE_DOMAINS = Object.freeze([
    "bounds",
    "entry",
    "exit",
    "surfaces",
    "anchors",
    "recoveryRoute",
    "enemySlots",
    "worldObjects",
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
    if (spec?.authoringMode === "scenario") {
        throw new TypeError("scenario-area-spec-cannot-create-runtime-area");
    }
    const definition = structuredClone(spec.definition);
    const anchors = spec.anchors ?? [];
    const objects = insertAnchors(definition.objects ?? [], anchors, "objectIndex", anchorLandmark);
    return defineArea({
        ...definition,
        stageId: spec.stage.id,
        surfaces: insertAnchors(definition.surfaces ?? [], anchors, "surfaceIndex", anchorTarget),
        objects,
        jammerGroups: deriveHardpointJammerGroups(objects, definition.jammerGroups)
    });
}

export function createScenarioPreviewAreaDefinitionFromV2(spec) {
    if (spec?.authoringMode !== "scenario") {
        throw new TypeError("scenario-preview-requires-scenario-area-spec");
    }
    const definition = structuredClone(spec.definition);
    const anchors = spec.anchors ?? [];
    const objects = insertAnchors(definition.objects ?? [], anchors, "objectIndex", anchorLandmark);
    const exit = definition.exit;
    if (typeof definition.id !== "string" || !exit || !Number.isFinite(exit.x) || !Number.isFinite(exit.y)) {
        throw new TypeError("scenario-preview-area-definition-invalid");
    }
    return defineArea({
        ...definition,
        order: 1,
        nextAreaId: null,
        gate: {
            id: `${definition.id}:preview-boundary`,
            nextAreaId: null,
            requiredObjectiveIds: [],
            trigger: { x: exit.x - 48, y: exit.y - 96, width: 96, height: 160 }
        },
        surfaces: insertAnchors(definition.surfaces ?? [], anchors, "surfaceIndex", anchorTarget),
        objects,
        jammerGroups: deriveHardpointJammerGroups(objects, definition.jammerGroups)
    });
}

export function areaSpecV2AuthoringMode(spec) {
    const mode = spec?.authoringMode ?? "runtime";
    if (!AREA_SPEC_V2_AUTHORING_MODES.includes(mode)) {
        throw new TypeError("area-spec-v2-authoring-mode-invalid");
    }
    return mode;
}

export function canonicalizeAreaSpecV2(spec) {
    return stableValue(structuredClone(spec));
}
