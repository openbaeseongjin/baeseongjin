import {
    EMPTY_AREA_BEHAVIOR_REGISTRY,
    AreaBehaviorReferenceError,
    validateBehaviorRefs
} from "./AreaBehaviorRegistry.js";
import { AREA_SPEC_V2, EDITOR_EDITABLE_DOMAINS, EDITOR_READ_ONLY_DOMAINS } from "./AreaSpecV2.js";

function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function issue(issues, file, code, details = {}) {
    issues.push({ file, code, ...details });
}

function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y);
}

function validateDomainList(issues, file, values, allowed, missingCode, invalidCode) {
    if (!Array.isArray(values)) {
        issue(issues, file, missingCode);
        return;
    }
    const seen = new Set();
    for (const value of values) {
        if (!allowed.includes(value)) issue(issues, file, invalidCode, { domain: value });
        if (seen.has(value)) issue(issues, file, `${invalidCode}-duplicate`, { domain: value });
        seen.add(value);
    }
    for (const value of allowed) {
        if (!seen.has(value)) issue(issues, file, `${missingCode}-domain`, { domain: value });
    }
}

function validateAnchor(issues, file, anchor, bounds, seenLandmarks, seenTargets) {
    if (!isPlainObject(anchor?.target) || !isPlainObject(anchor?.landmark)) {
        issue(issues, file, "anchor-block-invalid");
        return;
    }
    const { target, landmark } = anchor;
    if (typeof landmark.id !== "string" || landmark.id.length === 0) {
        issue(issues, file, "anchor-landmark-id");
    }
    const expectedTargetId = typeof landmark.id === "string" ? `${landmark.id}-surface` : null;
    if (target.id !== expectedTargetId) {
        issue(issues, file, "anchor-target-id", { expected: expectedTargetId, actual: target.id ?? null });
    }
    if (seenLandmarks.has(landmark.id)) issue(issues, file, "anchor-landmark-duplicate", { id: landmark.id });
    if (seenTargets.has(target.id)) issue(issues, file, "anchor-target-duplicate", { id: target.id });
    seenLandmarks.add(landmark.id);
    seenTargets.add(target.id);
    if (!finitePoint(target) || !finitePoint(landmark) || target.x !== landmark.x || target.y !== landmark.y) {
        issue(issues, file, "anchor-position-mismatch", { id: landmark.id ?? null });
    }
    if (
        finitePoint(target) &&
        (!bounds ||
            target.x < -bounds.width * 0.5 ||
            target.x > bounds.width * 0.5 ||
            target.y < -bounds.height ||
            target.y > 0)
    ) {
        issue(issues, file, "anchor-out-of-bounds", { id: landmark.id ?? null });
    }
    for (const [label, properties] of [
        ["target", target.properties ?? {}],
        ["landmark", landmark.properties ?? {}]
    ]) {
        if (!isPlainObject(properties))
            issue(issues, file, "anchor-properties-invalid", { id: landmark.id ?? null, label });
        if (
            isPlainObject(properties) &&
            ["id", "kind", "position", "vertices", "width", "height"].some((key) => key in properties)
        ) {
            issue(issues, file, "anchor-properties-reserved", { id: landmark.id ?? null, label });
        }
    }
    for (const key of ["surfaceIndex", "objectIndex"]) {
        if (anchor[key] !== undefined && (!Number.isInteger(anchor[key]) || anchor[key] < 0)) {
            issue(issues, file, "anchor-index-invalid", { id: landmark.id ?? null, key });
        }
    }
}

export function validateAreaSpecV2(spec, { file = "AREA-SPEC.v2.json", registry = EMPTY_AREA_BEHAVIOR_REGISTRY } = {}) {
    const issues = [];
    if (!isPlainObject(spec)) {
        issue(issues, file, "spec-not-object");
        return freezeValue({ valid: false, issues });
    }
    if (spec.schemaVersion !== AREA_SPEC_V2)
        issue(issues, file, "schema-version-invalid", { schemaVersion: spec.schemaVersion });

    const stage = spec.stage;
    const definition = spec.definition;
    if (!isPlainObject(stage)) {
        issue(issues, file, "stage-block-invalid");
    } else {
        const expectedAreaId = `sector-${String(stage.sector).padStart(2, "0")}-${String(stage.stage).padStart(2, "0")}`;
        if (!/^\d+-\d+$/.test(stage.legacyStageAlias ?? "")) issue(issues, file, "stage-alias-invalid");
        if (stage.sourceAreaId !== expectedAreaId)
            issue(issues, file, "stage-source-area-id", { expected: expectedAreaId });
    }
    if (!isPlainObject(definition)) {
        issue(issues, file, "definition-block-invalid");
    } else {
        if (definition.id !== stage?.sourceAreaId)
            issue(issues, file, "definition-area-id", { expected: stage?.sourceAreaId });
        if (!Number.isInteger(definition.order) || definition.order <= 0)
            issue(issues, file, "definition-order-invalid");
        if (!isPlainObject(definition.bounds) || definition.bounds.width <= 0 || definition.bounds.height <= 0) {
            issue(issues, file, "definition-bounds-invalid");
        }
        if (!finitePoint(definition.entry) || !finitePoint(definition.exit))
            issue(issues, file, "definition-entry-exit-invalid");
        for (const key of [
            "surfaces",
            "routePoints",
            "recoveryPoints",
            "checkpoints",
            "objects",
            "objectives",
            "windZones",
            "scannerGroups",
            "cameraZones"
        ]) {
            if (!Array.isArray(definition[key])) issue(issues, file, "definition-collection-invalid", { key });
        }
    }

    if (!isPlainObject(spec.editor)) {
        issue(issues, file, "editor-block-invalid");
    } else {
        validateDomainList(
            issues,
            file,
            spec.editor.editableDomains,
            EDITOR_EDITABLE_DOMAINS,
            "editor-editable-missing",
            "editor-domain-not-editable"
        );
        validateDomainList(
            issues,
            file,
            spec.editor.readOnlyDomains,
            EDITOR_READ_ONLY_DOMAINS,
            "editor-read-only-missing",
            "editor-domain-not-read-only"
        );
    }

    if (!Array.isArray(spec.anchors)) {
        issue(issues, file, "anchors-list-invalid");
    } else {
        const seenLandmarks = new Set();
        const seenTargets = new Set();
        for (const anchor of spec.anchors)
            validateAnchor(issues, file, anchor, definition?.bounds, seenLandmarks, seenTargets);
    }

    try {
        validateBehaviorRefs(spec.behaviorRefs, registry);
    } catch (error) {
        const code = error instanceof AreaBehaviorReferenceError ? error.code : "behavior-reference-invalid";
        issue(issues, file, code, error instanceof AreaBehaviorReferenceError ? error.details : {});
    }

    return freezeValue({ valid: issues.length === 0, issues });
}
