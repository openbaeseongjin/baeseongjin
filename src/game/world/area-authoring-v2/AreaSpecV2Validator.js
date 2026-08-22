import {
    EMPTY_AREA_BEHAVIOR_REGISTRY,
    AreaBehaviorReferenceError,
    validateBehaviorRefs
} from "./AreaBehaviorRegistry.js";
import { validateAreaCatalog } from "../AreaDefinitionValidator.js";
import { resolveEnemySlot } from "../EnemyEncounterSelection.js";
import { evaluateWindZone } from "../WorldForceField.js";
import { isKnownEnemyType } from "../../combat/EnemyArchetypeCatalog.js";
import { SWARM_MEMBER_COUNT } from "../../EnemyType.js";
import { resolveObjectTriggerBounds } from "../areas/AreaDefinition.js";
import {
    AREA_SPEC_V2,
    AREA_SPEC_V2_AUTHORING_MODES,
    EDITOR_EDITABLE_DOMAINS,
    EDITOR_READ_ONLY_DOMAINS,
    canonicalizeAreaSpecV2,
    createAreaDefinitionFromV2
} from "./AreaSpecV2.js";
import { AreaEntryEditorComponent } from "./editor/AreaEntryEditorComponent.js";

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

function boundsInsideArea(areaBounds, bounds) {
    return (
        Number.isFinite(bounds?.x) &&
        Number.isFinite(bounds?.y) &&
        Number.isFinite(bounds?.width) &&
        Number.isFinite(bounds?.height) &&
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.x >= -areaBounds.width * 0.5 &&
        bounds.x + bounds.width <= areaBounds.width * 0.5 &&
        bounds.y >= -areaBounds.height &&
        bounds.y + bounds.height <= 0
    );
}

function validateEditableEnemy(issues, file, object, areaBounds) {
    if (
        object.enemyType !== undefined &&
        (typeof object.enemyType !== "string" || !isKnownEnemyType(object.enemyType))
    ) {
        issue(issues, file, "enemy-type-invalid", { id: object.id ?? null, enemyType: object.enemyType ?? null });
    }
    if (object.enemyType === undefined && object.enemySelection === undefined) {
        issue(issues, file, "enemy-type-missing", { id: object.id ?? null });
    }
    if (object.enemySelection !== undefined) {
        try {
            const resolved = resolveEnemySlot(
                { id: object.id, ...object.enemySelection },
                { runSeed: 1, worldRevision: "area-spec-v2-validation" }
            );
            const candidates = resolved.allowedEnemyTypes ?? [resolved.enemyType];
            for (const enemyType of candidates) {
                if (!isKnownEnemyType(enemyType)) {
                    issue(issues, file, "enemy-selection-type-invalid", { id: object.id, enemyType });
                }
            }
        } catch (cause) {
            issue(issues, file, "enemy-selection-invalid", {
                id: object.id ?? null,
                message: cause instanceof Error ? cause.message : String(cause)
            });
        }
    }
    if (
        object.swarmMemberCount !== undefined &&
        (!Number.isSafeInteger(object.swarmMemberCount) ||
            object.swarmMemberCount < SWARM_MEMBER_COUNT.MINIMUM ||
            object.swarmMemberCount > SWARM_MEMBER_COUNT.MAXIMUM)
    ) {
        issue(issues, file, "enemy-swarm-member-count-invalid", {
            id: object.id ?? null,
            swarmMemberCount: object.swarmMemberCount
        });
    }
    if (object.activationSpec !== undefined) {
        try {
            const activation = resolveObjectTriggerBounds(object.position, object.activationSpec);
            if (!boundsInsideArea(areaBounds, activation)) {
                issue(issues, file, "object-activation-bounds", { id: object.id ?? null });
            }
        } catch (cause) {
            issue(issues, file, "object-activation-spec-invalid", {
                id: object.id ?? null,
                message: cause instanceof Error ? cause.message : String(cause)
            });
        }
    }
}

function validateEditableWind(issues, file, zone) {
    if (!finitePoint(zone.direction) || Math.hypot(zone.direction.x, zone.direction.y) <= 0) {
        issue(issues, file, "wind-direction-invalid", { id: zone.id ?? null });
    }
    if (!Number.isFinite(zone.strength) || zone.strength < 0) {
        issue(issues, file, "wind-strength-invalid", { id: zone.id ?? null, strength: zone.strength ?? null });
    }
    if (zone.falloff !== undefined && (!Number.isFinite(zone.falloff) || zone.falloff < 0)) {
        issue(issues, file, "wind-falloff-invalid", { id: zone.id ?? null, falloff: zone.falloff ?? null });
    }
    if (zone.mode === "pulsed") {
        const cycle = zone.cycle;
        if (
            !cycle ||
            !["lull", "warning", "active", "decay"].every((key) => Number.isFinite(cycle[key]) && cycle[key] >= 0) ||
            cycle.active <= 0 ||
            cycle.decay <= 0
        ) {
            issue(issues, file, "wind-cycle-invalid", { id: zone.id ?? null });
        }
    }
    try {
        evaluateWindZone(zone, 0);
    } catch (cause) {
        issue(issues, file, "wind-mode-invalid", {
            id: zone.id ?? null,
            mode: zone.mode ?? null,
            message: cause instanceof Error ? cause.message : String(cause)
        });
    }
}

function validateEditableRuntimeFields(issues, file, definition) {
    const bounds = definition?.bounds;
    if (!bounds || !Number.isFinite(bounds.width) || !Number.isFinite(bounds.height)) return;
    for (const object of definition.objects ?? []) {
        if (isEditableEnemyObject(object)) validateEditableEnemy(issues, file, object, bounds);
    }
    for (const zone of definition.windZones ?? []) validateEditableWind(issues, file, zone);
    const entry = AreaEntryEditorComponent.from(definition);
    if (!entry) {
        issue(issues, file, "entry-support-platform-missing", { id: definition.entry?.id ?? null });
    } else if (!entry.isGrounded()) {
        issue(issues, file, "entry-support-gap-invalid", {
            id: definition.entry.id,
            entryY: definition.entry.y,
            supportTopY: entry.supportTopY
        });
    }
}

function specDomainValue(spec, domain) {
    const definition = spec?.definition ?? {};
    switch (domain) {
        case "bounds":
            return definition.bounds;
        case "entry":
            return definition.entry;
        case "exit":
            return {
                exit: definition.exit,
                gateTrigger: definition.gate?.trigger,
                gateObjects: (definition.objects ?? []).filter(({ gateId }) => gateId === definition.gate?.id)
            };
        case "surfaces":
            return definition.surfaces;
        case "anchors":
            return spec?.anchors;
        case "recoveryRoute":
            return {
                routePoints: definition.routePoints,
                recoveryPoints: definition.recoveryPoints
            };
        case "enemySlots":
            return (definition.objects ?? []).filter(isEditableEnemyObject);
        case "wind":
            return {
                windZones: definition.windZones,
                sources: (definition.objects ?? []).filter((object) => object?.kind === "wind-source")
            };
        case "camera":
            return definition.cameraZones;
        case "objectives":
            return definition.objectives;
        case "progression":
            return {
                checkpoints: definition.checkpoints,
                nextAreaId: definition.nextAreaId,
                routes: definition.routes
            };
        case "story":
            return definition.storyTriggers;
        case "scanner":
            return definition.scannerGroups;
        case "behaviorRegistry":
            return spec?.behaviorRefs;
        case "identity":
            return {
                schemaVersion: spec?.schemaVersion,
                authoringMode: spec?.authoringMode ?? "runtime",
                stage: spec?.stage,
                editor: spec?.editor,
                definition: {
                    id: definition.id,
                    sectorId: definition.sectorId,
                    order: definition.order,
                    name: definition.name,
                    subtitle: definition.subtitle,
                    cueIds: definition.cueIds
                }
            };
        case "scenarioMetadata":
            return spec?.scenario ?? null;
        case "worldObjects":
            return (definition.objects ?? []).filter(
                (object) =>
                    !isEditableEnemyObject(object) &&
                    object?.kind !== "wind-source" &&
                    object.gateId !== definition.gate?.id
            );
        case "objectLayout":
            return (definition.objects ?? [])
                .filter(
                    (object) =>
                        !isEditableEnemyObject(object) &&
                        object?.kind !== "wind-source" &&
                        object.gateId !== definition.gate?.id
                )
                .map((object) => ({ id: object?.id ?? null, domain: "worldObjects" }));
        default:
            throw new TypeError(`area-spec-domain-unknown:${domain}`);
    }
}

function domainEquals(leftSpec, rightSpec, domain) {
    return (
        JSON.stringify(canonicalizeAreaSpecV2(specDomainValue(leftSpec, domain))) ===
        JSON.stringify(canonicalizeAreaSpecV2(specDomainValue(rightSpec, domain)))
    );
}

function exitProgressionContract(definition) {
    if (!definition?.exit || !definition?.gate) return null;
    const { x: _exitX, y: _exitY, ...exit } = definition.exit;
    const { trigger: _trigger, ...gate } = definition.gate;
    return canonicalizeAreaSpecV2({ exit, gate });
}

function isEditableEnemyObject(object) {
    return Boolean(object?.enemyType || object?.enemySelection || object?.kind === "sentry");
}

function placeholderArea(nextAreaId, bounds, order) {
    const width = Math.max(256, bounds?.width ?? 256);
    const height = Math.max(256, bounds?.height ?? 256);
    return {
        id: nextAreaId,
        order,
        bounds: { width, height },
        entry: { id: `${nextAreaId}:entry`, x: -64, y: -32 },
        exit: { id: `${nextAreaId}:exit`, x: 64, y: -32 },
        nextAreaId: null,
        surfaces: [
            {
                id: `${nextAreaId}:preview-floor`,
                kind: "platform",
                oneWay: true,
                grappleable: true,
                coordinateAnchor: "top-center",
                position: { x: 0, y: 0 },
                vertices: [
                    { x: -96, y: 0 },
                    { x: 96, y: 0 },
                    { x: 96, y: 32 },
                    { x: -96, y: 32 }
                ]
            }
        ],
        routePoints: [],
        recoveryPoints: [],
        checkpoints: [],
        objects: [],
        objectives: [],
        windZones: [],
        cameraZones: [],
        gate: {
            id: `${nextAreaId}:gate`,
            nextAreaId: null,
            requiredObjectiveIds: [],
            trigger: {
                x: -26,
                y: -64,
                width: 52,
                height: 64
            }
        }
    };
}

function validateRuntimeAreaSemantics(spec, issues, file) {
    try {
        const area = { ...createAreaDefinitionFromV2(spec), order: 1 };
        const catalog = {
            id: `preview:${area.id}`,
            revision: 0,
            areas: area.nextAreaId ? [area, placeholderArea(area.nextAreaId, area.bounds, 2)] : [area]
        };
        const runtime = validateAreaCatalog(catalog);
        for (const runtimeIssue of runtime.issues) {
            const { code, ...details } = runtimeIssue;
            issue(issues, file, code, details);
        }
    } catch (cause) {
        issue(issues, file, "runtime-area-build-invalid", {
            message: cause instanceof Error ? cause.message : String(cause)
        });
    }
}

export const AREA_SPEC_EDITOR_CONTRACT = Object.freeze({
    editableDomains: Object.freeze(EDITOR_EDITABLE_DOMAINS.map((domain) => Object.freeze({ domain, editable: true }))),
    lockedDomains: Object.freeze(
        [
            "identity",
            "scenarioMetadata",
            "objectLayout",
            "worldObjects",
            "objectives",
            "progression",
            "story",
            "scanner",
            "behaviorRegistry"
        ].map((domain) => Object.freeze({ domain, editable: false }))
    )
});

export function validateAreaSpecEditorMutation(
    baseline,
    candidate,
    { file = "AREA-SPEC.v2.json", contract = AREA_SPEC_EDITOR_CONTRACT } = {}
) {
    const issues = [];
    if (!isPlainObject(baseline) || !isPlainObject(candidate)) {
        issue(issues, file, "editor-contract-spec-invalid");
        return freezeValue({ valid: false, issues });
    }
    for (const { domain } of contract.lockedDomains) {
        if (!domainEquals(baseline, candidate, domain)) {
            issue(issues, file, "editor-read-only-changed", { domain });
        }
    }
    const baselineExit = exitProgressionContract(baseline.definition);
    const candidateExit = exitProgressionContract(candidate.definition);
    if (baselineExit && candidateExit && JSON.stringify(baselineExit) !== JSON.stringify(candidateExit)) {
        issue(issues, file, "editor-read-only-changed", { domain: "progression" });
    }
    return freezeValue({ valid: issues.length === 0, issues });
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
    const authoringMode = spec.authoringMode ?? "runtime";
    if (!AREA_SPEC_V2_AUTHORING_MODES.includes(authoringMode)) {
        issue(issues, file, "authoring-mode-invalid", { authoringMode });
    }
    if (authoringMode === "scenario" && (!isPlainObject(spec.scenario) || spec.scenario.status !== "scenario-only")) {
        issue(issues, file, "scenario-metadata-invalid");
    }
    if (
        isPlainObject(spec.scenario) &&
        ["sourcePath", "designSourcePath", "sourceSchemaVersion", "sourceSnapshot"].some((key) => key in spec.scenario)
    ) {
        issue(issues, file, "scenario-migration-provenance-forbidden");
    }
    if ("provenance" in spec) issue(issues, file, "migration-provenance-forbidden");

    const stage = spec.stage;
    const definition = spec.definition;
    if (!isPlainObject(stage)) {
        issue(issues, file, "stage-block-invalid");
    } else {
        const expectedAreaId = `sector-${String(stage.sector).padStart(2, "0")}-${String(stage.stage).padStart(2, "0")}`;
        const expectedStageId = `${stage.sector}-${stage.stage}`;
        const expectedSectorId = `sector-${String(stage.sector).padStart(2, "0")}`;
        if (stage.id !== expectedStageId) issue(issues, file, "stage-id-invalid", { expected: expectedStageId });
        if (stage.sourceAreaId !== expectedAreaId)
            issue(issues, file, "stage-source-area-id", { expected: expectedAreaId });
        if (definition?.sectorId !== expectedSectorId)
            issue(issues, file, "definition-sector-id", { expected: expectedSectorId });
        if (definition?.order !== stage.stage) issue(issues, file, "definition-stage-order", { expected: stage.stage });
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

    if (isPlainObject(definition) && authoringMode === "runtime") {
        validateEditableRuntimeFields(issues, file, definition);
    }
    if (issues.length === 0 && authoringMode === "runtime") validateRuntimeAreaSemantics(spec, issues, file);

    return freezeValue({ valid: issues.length === 0, issues });
}
