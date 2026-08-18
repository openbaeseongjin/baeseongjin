// Validates docs/bsh/scenario/<sector>/<stage>/AREA-SPEC.json against the "area-spec-v1" schema.
//
// AREA-SPEC.json is the IMPLEMENTATION CONTRACT layer described in
// docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md:
//   README.md            = DESIGN INTENT
//   AREA-SPEC.json        = IMPLEMENTATION CONTRACT   (this validator)
//   src/game/**            = ACTUAL RUNTIME
//   PRODUCTION-ALIGNMENT.md = SPEC <-> RUNTIME match status
//
// This script only validates the JSON contract itself (schema/geometry/reference integrity).
// It does not compare AREA-SPEC.json against the live Runtime catalog — that comparison is a
// PRODUCTION-ALIGNMENT.md job, done by a human, per the project's "no automatic overwrite between
// layers" rule.
//
// IMPORTANT — current Runtime is not "Area 1-1 -> Area 1-2 -> ...". The default product Runtime
// (see src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js) compiles a legacy Area
// (`stage.sourceAreaId`, e.g. "sector-01-01") into a Sector landmark
// (`sector-01:landmark:01`, derived from `stage.sector`/`stage.stage` order — this validator does not
// require it to be duplicated in JSON). `stage.legacyStageAlias` (e.g. "1-1") is the
// planning/presentation identity carried through LegacyAreaSectorPreviewCatalog.js, not a Runtime
// progression authority. Progression itself is objective-gated-connector routeLocks between
// landmarks, not per-Area Gate portals — see `progression` below.

import { readFileSync, readdirSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(process.cwd());
const scenarioRoot = "docs/bsh/scenario";
const STAGE_SPEC_PATH_PATTERN = /^docs\/bsh\/scenario\/(\d+)\/(\d+)-(\d+)\/AREA-SPEC\.json$/;

// Runtime systems/presets this validator currently knows how to cross-check against
// src/game/world/areas/AreaDefinition.js, Sector0XAreaCatalog.js helpers, config.js, and the
// Seamless Sector Runtime (src/game/world/sectors/**). Keep this in sync with the actual Runtime —
// adding an entry here is a claim that a Runtime helper/contract for it already exists.
const KNOWN_SURFACE_PRESETS = new Map([
    ["safe-deck", "top-center"], // rectangle(..., { kind: "safe-deck" })
    ["recovery-deck", "top-center"], // rectangle(..., { kind: "recovery" })
    ["sealed-door", "bottom-center"], // groundedSurface(..., { kind: "sealed-door" })
    ["overhang", "top-center"], // rectangle(..., { kind: "overhang", oneWay: false })
    ["platform", "top-center"] // default rectangle() kind
]);

const KNOWN_OBJECTIVE_PRESETS = new Set([
    "exit-panel", // legacy exitBlock().panel + panelObjectiveId contract (source layer)
    "reach-deck" // objective type "reach" bounds pattern used by every *:final-deck-reached objective
]);

const KNOWN_ENEMY_PRESETS = new Set([
    "patrol-drone-t1", // enemyType "patrol-drone-t1", see src/game/config.js COMBAT_CONFIG + Sector03/04 patrolDrone()
    "pursuit-drone-t1" // enemyType "pursuit-drone-t1" + PursuitEnemyBehavior, see src/game/combat/EnemyArchetypeCatalog.js
]);

const KNOWN_SCANNER_PROFILES = new Set([
    "sector03-default" // SCANNER_CYCLE in Sector03AreaCatalog.js: available 1.5 / warning 0.6 / locked 1.1 / reset 0.3
]);

// Runtime model a Stage compiles into. Currently the only shipped default-product Runtime is the
// Seamless Sector Landmark compiler (LegacyAreaSeamlessSectorRuntime.js); the legacy standalone
// "current-authored-city-mock" per-Area chain (CurrentAuthoredAreaCatalog.js) still exists as a
// source-layer/import input but is not the default product Runtime authority.
const KNOWN_RUNTIME_MODELS = new Set(["seamless-sector-landmark-v1"]);

// Progression mechanism the Seamless Sector Runtime actually uses between landmarks: an authored
// legacy Gate's requiredObjectiveIds is carried over as a routeLock guarding a physical connector
// surface between landmarks (see routeLocks/connectors in LegacyAreaSeamlessSectorRuntime.js). It is
// not a per-Area Gate portal.
const KNOWN_PROGRESSION_MODES = new Set(["objective-gated-connector"]);

const ACCEPTANCE_TEST_TYPES = new Set([
    "schema",
    "geometry",
    "traversal",
    "runtime",
    "story",
    "camera",
    "multiplayer",
    "regression"
]);

const ACCEPTANCE_AUTOMATION_VALUES = new Set(["AUTOMATED", "MANUAL"]);
const OBJECTIVE_TYPES = new Set(["interact", "reach"]);
const RUNTIME_SYSTEM_STATUSES = new Set(["NOT_IMPLEMENTED"]);
const ANCHOR_FRACTIONS = Object.freeze({
    "top-left": { x: 0, y: 0 },
    "top-center": { x: 0.5, y: 0 },
    "top-right": { x: 1, y: 0 },
    "center-left": { x: 0, y: 0.5 },
    center: { x: 0.5, y: 0.5 },
    "center-right": { x: 1, y: 0.5 },
    "bottom-left": { x: 0, y: 1 },
    "bottom-center": { x: 0.5, y: 1 },
    "bottom-right": { x: 1, y: 1 }
});

function normalizePath(path) {
    return path.split(sep).join("/");
}

function collectAreaSpecFiles(root) {
    const files = [];
    function visit(directory) {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                visit(path);
            } else if (entry.isFile() && basename(entry.name) === "AREA-SPEC.json") {
                files.push(normalizePath(relative(projectRoot, path)));
            }
        }
    }
    visit(resolve(projectRoot, root));
    return files
        .filter((path) => path.match(STAGE_SPEC_PATH_PATTERN))
        .sort((left, right) => left.localeCompare(right, "en"));
}

function fail(issues, file, code, details = {}) {
    issues.push({ file, code, ...details });
}

function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function pointInsideBounds(bounds, point) {
    return (
        isFiniteNumber(point?.x) &&
        isFiniteNumber(point?.y) &&
        point.x >= -bounds.width / 2 &&
        point.x <= bounds.width / 2 &&
        point.y <= 0 &&
        point.y >= -bounds.height
    );
}

function rectInsideBounds(bounds, rect, { allowFloorOverlap = false } = {}) {
    if (
        !isFiniteNumber(rect?.x) ||
        !isFiniteNumber(rect?.y) ||
        !isFiniteNumber(rect?.width) ||
        !isFiniteNumber(rect?.height) ||
        rect.width <= 0 ||
        rect.height <= 0
    ) {
        return false;
    }
    const maxY = allowFloorOverlap ? 160 : 0;
    return (
        rect.x >= -bounds.width / 2 &&
        rect.x + rect.width <= bounds.width / 2 &&
        rect.y >= -bounds.height &&
        rect.y + rect.height <= maxY
    );
}

// Computes the actual left/right/top/bottom extent of a center-x anchored rectangle, matching
// src/game/world/AuthoredCoordinateAnchor.js's anchoredRectangleBounds() semantics for the anchor a
// given preset's Runtime helper actually uses (see KNOWN_SURFACE_PRESETS). A surface only inside
// `bounds` at its (x, y) center point can still extend outside the Area — this computes the real
// footprint so that case is caught (regression: see tests/areaSpecValidator.mjs).
function rectExtentFromAnchor(x, y, width, height, anchorKey) {
    const anchor = ANCHOR_FRACTIONS[anchorKey] ?? ANCHOR_FRACTIONS.center;
    return {
        left: x - width * anchor.x,
        right: x + width * (1 - anchor.x),
        top: y - height * anchor.y,
        bottom: y + height * (1 - anchor.y)
    };
}

function extentInsideAreaBounds(bounds, extent, { floorToleranceY = 160 } = {}) {
    return (
        extent.left >= -bounds.width / 2 &&
        extent.right <= bounds.width / 2 &&
        extent.top >= -bounds.height &&
        extent.bottom <= floorToleranceY
    );
}

function requireUniqueLocalIds(entries, label, file, issues, seenAcrossSpec) {
    const local = new Set();
    for (const entry of entries) {
        if (!isNonEmptyString(entry?.id)) {
            fail(issues, file, `${label}-id-missing`);
            continue;
        }
        if (local.has(entry.id)) fail(issues, file, `${label}-id-duplicate`, { id: entry.id });
        if (seenAcrossSpec.has(entry.id)) {
            fail(issues, file, "local-id-duplicate-across-collections", { id: entry.id });
        }
        local.add(entry.id);
        seenAcrossSpec.add(entry.id);
    }
}

function isKnownSystemName(name) {
    return (
        KNOWN_SURFACE_PRESETS.has(name) ||
        KNOWN_OBJECTIVE_PRESETS.has(name) ||
        KNOWN_ENEMY_PRESETS.has(name) ||
        KNOWN_SCANNER_PROFILES.has(name) ||
        KNOWN_RUNTIME_MODELS.has(name) ||
        KNOWN_PROGRESSION_MODES.has(name)
    );
}

function validatePresetOrSystem(spec, file, issues, name, kind, knownSet) {
    if (name === undefined || name === null) return;
    if (!isNonEmptyString(name)) {
        fail(issues, file, `${kind}-invalid`, { value: name });
        return;
    }
    if (knownSet.has(name)) return;
    const declared = (spec.runtimeDependencies?.newSystems ?? []).find((system) => system?.id === name);
    if (declared) {
        if (!RUNTIME_SYSTEM_STATUSES.has(declared.status)) {
            fail(issues, file, "runtime-dependency-status-unknown", { id: name, status: declared.status });
        }
        return;
    }
    fail(issues, file, `${kind}-unknown`, {
        value: name,
        hint: "declare it under runtimeDependencies.newSystems with status NOT_IMPLEMENTED, or use a known preset"
    });
}

function validateStageIdentity(spec, file, issues) {
    const match = file.match(STAGE_SPEC_PATH_PATTERN);
    if (!match) {
        fail(issues, file, "stage-path-format");
        return;
    }
    const [, folderSector, stageSector, stageNumber] = match;
    if (folderSector !== stageSector) {
        fail(issues, file, "stage-folder-sector-mismatch", { folder: folderSector, stage: stageSector });
    }
    const expectedSourceAreaId = `sector-${stageSector.padStart(2, "0")}-${stageNumber.padStart(2, "0")}`;
    const expectedLegacyStageAlias = `${Number(stageSector)}-${Number(stageNumber)}`;
    if (!isPlainObject(spec.stage)) {
        fail(issues, file, "stage-block-missing");
        return;
    }
    if (spec.stage.sourceAreaId !== expectedSourceAreaId) {
        fail(issues, file, "stage-source-area-id-mismatch", {
            expected: expectedSourceAreaId,
            actual: spec.stage.sourceAreaId
        });
    }
    if (spec.stage.legacyStageAlias !== expectedLegacyStageAlias) {
        fail(issues, file, "stage-legacy-alias-mismatch", {
            expected: expectedLegacyStageAlias,
            actual: spec.stage.legacyStageAlias
        });
    }
    if (String(spec.stage.sector) !== String(Number(stageSector))) {
        fail(issues, file, "stage-sector-mismatch", { expected: Number(stageSector), actual: spec.stage.sector });
    }
    if (String(spec.stage.stage) !== String(Number(stageNumber))) {
        fail(issues, file, "stage-number-mismatch", { expected: Number(stageNumber), actual: spec.stage.stage });
    }
    validatePresetOrSystem(spec, file, issues, spec.stage.runtimeModel, "stage-runtime-model", KNOWN_RUNTIME_MODELS);
    if (!isNonEmptyString(spec.stage.name)) fail(issues, file, "stage-name-missing");
}

// The base set of Local IDs an AREA-SPEC actually declares as real entities. route.mandatory,
// route.optional[].sequence, route.forbiddenBypasses[].from/to, and recovery[].failureZone/recoverTo
// must all resolve into this set — nothing here is exempted for being merely *mentioned* elsewhere.
function collectBaseReferencableIds(spec) {
    const ids = new Set(["exit"]);
    if (isNonEmptyString(spec.entry?.id)) ids.add(spec.entry.id);
    for (const surface of spec.surfaces ?? []) if (isNonEmptyString(surface?.id)) ids.add(surface.id);
    for (const target of spec.grappleTargets ?? []) if (isNonEmptyString(target?.id)) ids.add(target.id);
    for (const enemy of spec.enemies ?? []) if (isNonEmptyString(enemy?.id)) ids.add(enemy.id);
    return ids;
}

function validateBoundsAndEntry(spec, file, issues) {
    if (!isPlainObject(spec.bounds) || !isFiniteNumber(spec.bounds.width) || spec.bounds.width <= 0) {
        fail(issues, file, "bounds-width-invalid");
    }
    if (!isPlainObject(spec.bounds) || !isFiniteNumber(spec.bounds.height) || spec.bounds.height <= 0) {
        fail(issues, file, "bounds-height-invalid");
    }
    if (!isPlainObject(spec.bounds) || !isFiniteNumber(spec.bounds.width) || !isFiniteNumber(spec.bounds.height)) {
        return;
    }
    if (!isPlainObject(spec.entry) || !pointInsideBounds(spec.bounds, spec.entry)) {
        fail(issues, file, "entry-out-of-bounds");
    }
}

function validateSurfaces(spec, file, issues, seenIds) {
    requireUniqueLocalIds(spec.surfaces ?? [], "surface", file, issues, seenIds);
    for (const surface of spec.surfaces ?? []) {
        if (!isFiniteNumber(surface?.x) || !isFiniteNumber(surface?.y)) {
            fail(issues, file, "surface-geometry-invalid", { id: surface?.id });
            continue;
        }
        const width = surface.width ?? 32;
        const height = surface.height ?? 32;
        if (surface.width !== undefined && (!isFiniteNumber(surface.width) || surface.width <= 0)) {
            fail(issues, file, "surface-width-invalid", { id: surface.id });
        }
        if (surface.height !== undefined && (!isFiniteNumber(surface.height) || surface.height <= 0)) {
            fail(issues, file, "surface-height-invalid", { id: surface.id });
        }
        validatePresetOrSystem(spec, file, issues, surface.preset, "surface-preset", KNOWN_SURFACE_PRESETS);
        if (isPlainObject(spec.bounds) && isFiniteNumber(width) && isFiniteNumber(height) && width > 0 && height > 0) {
            const anchorKey = KNOWN_SURFACE_PRESETS.get(surface.preset) ?? "center";
            const extent = rectExtentFromAnchor(surface.x, surface.y, width, height, anchorKey);
            if (!extentInsideAreaBounds(spec.bounds, extent)) {
                fail(issues, file, "surface-out-of-bounds", { id: surface.id });
            }
        }
    }
}

function validateGrappleTargets(spec, file, issues, seenIds) {
    requireUniqueLocalIds(spec.grappleTargets ?? [], "grapple-target", file, issues, seenIds);
    for (const target of spec.grappleTargets ?? []) {
        if (!isFiniteNumber(target?.x) || !isFiniteNumber(target?.y)) {
            fail(issues, file, "grapple-target-geometry-invalid", { id: target?.id });
            continue;
        }
        // grappleTarget() is a fixed 24x24 center-anchored rectangle (AreaDefinition.js) — check the
        // real footprint, not just the center point, same as surfaces.
        const extent = rectExtentFromAnchor(target.x, target.y, 24, 24, "center");
        if (isPlainObject(spec.bounds) && !extentInsideAreaBounds(spec.bounds, extent)) {
            fail(issues, file, "grapple-target-out-of-bounds", { id: target.id });
        }
        if (!isNonEmptyString(target.label)) fail(issues, file, "grapple-target-label-missing", { id: target.id });
    }
}

function validateEnemies(spec, file, issues, seenIds) {
    requireUniqueLocalIds(spec.enemies ?? [], "enemy", file, issues, seenIds);
    for (const enemy of spec.enemies ?? []) {
        if (!isFiniteNumber(enemy?.x) || !isFiniteNumber(enemy?.y)) {
            fail(issues, file, "enemy-geometry-invalid", { id: enemy?.id });
        }
        validatePresetOrSystem(spec, file, issues, enemy.preset, "enemy-preset", KNOWN_ENEMY_PRESETS);
        if (enemy.patrol) {
            const { start, end } = enemy.patrol;
            if (
                !isFiniteNumber(start?.x) ||
                !isFiniteNumber(start?.y) ||
                !isFiniteNumber(end?.x) ||
                !isFiniteNumber(end?.y)
            ) {
                fail(issues, file, "enemy-patrol-endpoints-invalid", { id: enemy.id });
            }
        }
        if (enemy.activation) {
            if (isPlainObject(spec.bounds) && !rectInsideBounds(spec.bounds, enemy.activation)) {
                fail(issues, file, "enemy-activation-out-of-bounds", { id: enemy.id });
            }
        } else {
            fail(issues, file, "enemy-activation-missing", { id: enemy.id });
        }
    }
}

function validateScannerGroups(spec, file, issues, seenIds) {
    requireUniqueLocalIds(spec.scannerGroups ?? [], "scanner-group", file, issues, seenIds);
    const grappleTargetIds = new Set((spec.grappleTargets ?? []).map((target) => target?.id));
    const controlledElsewhere = new Set();
    for (const group of spec.scannerGroups ?? []) {
        validatePresetOrSystem(spec, file, issues, group.profile, "scanner-profile", KNOWN_SCANNER_PROFILES);
        if (!Array.isArray(group.controlledTargets) || group.controlledTargets.length === 0) {
            fail(issues, file, "scanner-group-controlled-targets-empty", { id: group.id });
        }
        for (const targetId of group.controlledTargets ?? []) {
            if (!grappleTargetIds.has(targetId)) {
                fail(issues, file, "scanner-group-controlled-target-unknown", { id: group.id, targetId });
                continue;
            }
            if (controlledElsewhere.has(targetId)) {
                fail(issues, file, "scanner-group-controlled-target-duplicate", { id: group.id, targetId });
            }
            controlledElsewhere.add(targetId);
        }
    }
}

function validateWindZones(spec, file, issues, seenIds) {
    requireUniqueLocalIds(spec.windZones ?? [], "wind-zone", file, issues, seenIds);
    for (const zone of spec.windZones ?? []) {
        if (isPlainObject(spec.bounds) && zone.x !== undefined && !rectInsideBounds(spec.bounds, zone)) {
            fail(issues, file, "wind-zone-out-of-bounds", { id: zone.id });
        }
    }
}

function validateObjectives(spec, file, issues, seenIds) {
    requireUniqueLocalIds(spec.objectives ?? [], "objective", file, issues, seenIds);
    const objectiveIds = new Set((spec.objectives ?? []).map((objective) => objective?.id));
    for (const objective of spec.objectives ?? []) {
        if (!OBJECTIVE_TYPES.has(objective.type)) {
            fail(issues, file, "objective-type-invalid", { id: objective.id, type: objective.type });
        }
        validatePresetOrSystem(spec, file, issues, objective.preset, "objective-preset", KNOWN_OBJECTIVE_PRESETS);
        for (const requiredId of objective.requiredObjectiveIds ?? []) {
            if (requiredId === objective.id) {
                fail(issues, file, "objective-requirement-self", { id: objective.id });
            } else if (!objectiveIds.has(requiredId)) {
                fail(issues, file, "objective-requirement-missing", { id: objective.id, requiredId });
            }
        }
        if (
            objective.completionDelaySeconds !== undefined &&
            (!isFiniteNumber(objective.completionDelaySeconds) || objective.completionDelaySeconds <= 0)
        ) {
            fail(issues, file, "objective-completion-delay-invalid", { id: objective.id });
        }
        if (objective.completionDelaySeconds !== undefined && objective.type !== "interact") {
            fail(issues, file, "objective-completion-delay-type", { id: objective.id });
        }
    }
}

function validateRoute(spec, file, issues, baseReferencableIds) {
    if (!isPlainObject(spec.route)) {
        fail(issues, file, "route-block-missing");
        return;
    }
    for (const key of ["runtimeLandmarks", "mandatory", "optional", "forbiddenBypasses"]) {
        if (!Array.isArray(spec.route[key])) {
            fail(issues, file, "route-collection-invalid", { key });
        }
    }

    // runtimeLandmarks is a curated *ordering* over real entities — it must not be able to introduce
    // an id that doesn't otherwise exist (that was the PR #630 bug: unknown ids here silently passed
    // downstream reference checks because they were added to the referencable set unconditionally).
    for (const id of spec.route.runtimeLandmarks ?? []) {
        if (!baseReferencableIds.has(id)) {
            fail(issues, file, "route-runtime-landmark-unknown", { id });
        }
    }

    for (const id of spec.route.mandatory ?? []) {
        if (!baseReferencableIds.has(id)) {
            fail(issues, file, "route-reference-unknown", { key: "mandatory", id });
        }
    }

    for (const [index, entry] of (spec.route.optional ?? []).entries()) {
        if (!isNonEmptyString(entry?.id)) {
            fail(issues, file, "route-optional-id-missing", { index });
        }
        if (!Array.isArray(entry?.sequence) || entry.sequence.length === 0) {
            fail(issues, file, "route-optional-sequence-empty", { id: entry?.id ?? null });
            continue;
        }
        for (const id of entry.sequence) {
            if (!baseReferencableIds.has(id)) {
                fail(issues, file, "route-reference-unknown", { key: "optional", id, sequenceId: entry.id ?? null });
            }
        }
    }
    const optionalIds = new Set();
    for (const entry of spec.route.optional ?? []) {
        if (!isNonEmptyString(entry?.id)) continue;
        if (optionalIds.has(entry.id)) fail(issues, file, "route-optional-id-duplicate", { id: entry.id });
        optionalIds.add(entry.id);
    }

    for (const [index, bypass] of (spec.route.forbiddenBypasses ?? []).entries()) {
        if (!isNonEmptyString(bypass?.from)) {
            fail(issues, file, "route-forbidden-bypass-from-missing", { index });
        } else if (!baseReferencableIds.has(bypass.from)) {
            fail(issues, file, "route-reference-unknown", { key: "forbiddenBypasses.from", id: bypass.from });
        }
        if (!Array.isArray(bypass?.to) || bypass.to.length === 0) {
            fail(issues, file, "route-forbidden-bypass-to-empty", { index });
        } else {
            for (const id of bypass.to) {
                if (!baseReferencableIds.has(id)) {
                    fail(issues, file, "route-reference-unknown", { key: "forbiddenBypasses.to", id });
                }
            }
        }
        if (!isNonEmptyString(bypass?.reason)) {
            fail(issues, file, "route-forbidden-bypass-reason-missing", { index });
        }
    }
}

function validateRecovery(spec, file, issues, seenIds, baseReferencableIds) {
    requireUniqueLocalIds(spec.recovery ?? [], "recovery", file, issues, seenIds);
    for (const recovery of spec.recovery ?? []) {
        if (isNonEmptyString(recovery.failureZone) && !baseReferencableIds.has(recovery.failureZone)) {
            fail(issues, file, "recovery-failure-zone-unknown", {
                id: recovery.id,
                failureZone: recovery.failureZone
            });
        }
        if (isNonEmptyString(recovery.recoverTo) && !baseReferencableIds.has(recovery.recoverTo)) {
            fail(issues, file, "recovery-recover-to-unknown", { id: recovery.id, recoverTo: recovery.recoverTo });
        }
        if (
            recovery.maxRetrySeconds !== undefined &&
            (!isFiniteNumber(recovery.maxRetrySeconds) || recovery.maxRetrySeconds <= 0)
        ) {
            fail(issues, file, "recovery-max-retry-invalid", { id: recovery.id });
        }
    }
}

// Legacy source-layer geometry only — the minimal input AreaDefinition.exitBlock() needs to build the
// authored Area (deck/door/panel/gate) that LegacyAreaSectorPreviewCatalog.js then imports. This is
// NOT the Seamless Sector Runtime's actual progression authority; see validateProgression().
function validateSourceExit(spec, file, issues) {
    if (!isPlainObject(spec.sourceExit)) {
        fail(issues, file, "source-exit-missing");
        return;
    }
    const block = spec.sourceExit;
    if (!isFiniteNumber(block.deckX) || !isFiniteNumber(block.deckTopY)) {
        fail(issues, file, "source-exit-deck-position-invalid");
    }
    if (block.deckWidth !== undefined && (!isFiniteNumber(block.deckWidth) || block.deckWidth <= 0)) {
        fail(issues, file, "source-exit-deck-width-invalid");
    }
    const objectiveIds = new Set((spec.objectives ?? []).map((objective) => objective?.id));
    if (!isNonEmptyString(block.panelObjectiveId) || !objectiveIds.has(block.panelObjectiveId)) {
        fail(issues, file, "source-exit-panel-objective-unknown", { panelObjectiveId: block.panelObjectiveId });
    }
}

// The Seamless Sector Runtime's actual progression authority: an objective-gated connector between
// this Stage's compiled landmark and the next. targetStageAlias is null only for a genuine content
// boundary (e.g. 3-8 / Post-Sector Boss boundary), matching `nextAreaId: null` in the legacy source.
function validateProgression(spec, file, issues) {
    if (!isPlainObject(spec.progression)) {
        fail(issues, file, "progression-missing");
        return;
    }
    const progression = spec.progression;
    if (progression.targetStageAlias !== null && !/^\d+-\d+$/.test(progression.targetStageAlias ?? "")) {
        fail(issues, file, "progression-target-stage-alias-format", {
            targetStageAlias: progression.targetStageAlias
        });
    }
    validatePresetOrSystem(spec, file, issues, progression.mode, "progression-mode", KNOWN_PROGRESSION_MODES);
    if (!Array.isArray(progression.requiredObjectiveIds)) {
        fail(issues, file, "progression-required-objective-ids-invalid");
    } else {
        const objectiveIds = new Set((spec.objectives ?? []).map((objective) => objective?.id));
        for (const id of progression.requiredObjectiveIds) {
            if (!objectiveIds.has(id)) {
                fail(issues, file, "progression-required-objective-unknown", { id });
            }
        }
    }
}

function validateCamera(spec, file, issues) {
    if (spec.camera === undefined) return;
    if (!isPlainObject(spec.camera) || !Array.isArray(spec.camera.zones)) {
        fail(issues, file, "camera-block-invalid");
        return;
    }
    for (const zone of spec.camera.zones) {
        if (
            !isNonEmptyString(zone.id) ||
            !isFiniteNumber(zone.minY) ||
            !isFiniteNumber(zone.maxY) ||
            zone.minY >= zone.maxY ||
            !isFiniteNumber(zone.desktopZoom) ||
            zone.desktopZoom <= 0 ||
            !isFiniteNumber(zone.mobileZoom) ||
            zone.mobileZoom <= 0
        ) {
            fail(issues, file, "camera-zone-invalid", { id: zone.id ?? null });
        }
    }
}

function validateStory(spec, file, issues) {
    if (spec.story === undefined) return;
    if (!isPlainObject(spec.story)) {
        fail(issues, file, "story-block-invalid");
        return;
    }
    if (spec.story.planningTriggers !== undefined) {
        if (!Array.isArray(spec.story.planningTriggers) || !spec.story.planningTriggers.every(isNonEmptyString)) {
            fail(issues, file, "story-planning-triggers-invalid");
        }
    }
    for (const presentation of spec.story.runtimePresentations ?? []) {
        if (!isNonEmptyString(presentation.cueId)) {
            fail(issues, file, "story-presentation-cue-id-missing");
            continue;
        }
        const entries = presentation.entries ?? [];
        if (!Array.isArray(entries) || entries.length === 0) {
            fail(issues, file, "story-presentation-entries-empty", { cueId: presentation.cueId });
            continue;
        }
        const entryIds = new Set();
        for (const entry of entries) {
            if (!isNonEmptyString(entry.id) || !isNonEmptyString(entry.title)) {
                fail(issues, file, "story-presentation-entry-invalid", { cueId: presentation.cueId });
            } else if (entryIds.has(entry.id)) {
                fail(issues, file, "story-presentation-entry-id-duplicate", {
                    cueId: presentation.cueId,
                    id: entry.id
                });
            } else {
                entryIds.add(entry.id);
            }
            if (
                entry.durationSeconds !== undefined &&
                (!isFiniteNumber(entry.durationSeconds) || entry.durationSeconds <= 0)
            ) {
                fail(issues, file, "story-presentation-entry-duration-invalid", {
                    cueId: presentation.cueId,
                    id: entry.id
                });
            }
        }
    }
}

function validateRuntimeDependencies(spec, file, issues) {
    if (spec.runtimeDependencies === undefined) return;
    if (!isPlainObject(spec.runtimeDependencies)) {
        fail(issues, file, "runtime-dependencies-invalid");
        return;
    }
    if (spec.runtimeDependencies.newSystems !== undefined && !Array.isArray(spec.runtimeDependencies.newSystems)) {
        fail(issues, file, "runtime-dependencies-invalid");
        return;
    }
    if (spec.runtimeDependencies.required !== undefined && !Array.isArray(spec.runtimeDependencies.required)) {
        fail(issues, file, "runtime-dependencies-required-invalid");
        return;
    }

    const newSystemIds = new Set();
    for (const system of spec.runtimeDependencies.newSystems ?? []) {
        if (!isNonEmptyString(system.id)) {
            fail(issues, file, "runtime-dependency-id-missing");
            continue;
        }
        if (newSystemIds.has(system.id)) fail(issues, file, "runtime-dependency-id-duplicate", { id: system.id });
        newSystemIds.add(system.id);
        if (!RUNTIME_SYSTEM_STATUSES.has(system.status)) {
            fail(issues, file, "runtime-dependency-status-invalid", { id: system.id, status: system.status });
        }
    }

    // "required" declares an already-existing Runtime system/profile this Stage depends on — it is
    // informational (nothing else cross-checks it), but the id itself must be real: a Stage cannot
    // "require" something this validator has never heard of.
    const requiredIds = new Set();
    for (const dependency of spec.runtimeDependencies.required ?? []) {
        if (!isNonEmptyString(dependency.id)) {
            fail(issues, file, "runtime-dependency-required-id-missing");
            continue;
        }
        if (requiredIds.has(dependency.id)) {
            fail(issues, file, "runtime-dependency-required-id-duplicate", { id: dependency.id });
        }
        requiredIds.add(dependency.id);
        if (!isKnownSystemName(dependency.id)) {
            fail(issues, file, "runtime-dependency-required-unknown", { id: dependency.id });
        }
    }
}

function validateForbidden(spec, file, issues) {
    if (spec.forbidden === undefined) return;
    if (!Array.isArray(spec.forbidden) || !spec.forbidden.every(isNonEmptyString)) {
        fail(issues, file, "forbidden-list-invalid");
        return;
    }
    const seen = new Set();
    for (const entry of spec.forbidden) {
        if (seen.has(entry)) fail(issues, file, "forbidden-entry-duplicate", { entry });
        seen.add(entry);
    }
}

function validateAcceptanceTests(spec, file, issues) {
    if (spec.acceptanceTests === undefined) return;
    if (!Array.isArray(spec.acceptanceTests)) {
        fail(issues, file, "acceptance-tests-invalid");
        return;
    }
    const ids = new Set();
    for (const test of spec.acceptanceTests) {
        if (!isNonEmptyString(test.id)) {
            fail(issues, file, "acceptance-test-id-missing");
        } else if (ids.has(test.id)) {
            fail(issues, file, "acceptance-test-id-duplicate", { id: test.id });
        } else {
            ids.add(test.id);
        }
        if (!ACCEPTANCE_TEST_TYPES.has(test.type)) {
            fail(issues, file, "acceptance-test-type-invalid", { id: test.id, type: test.type });
        }
        if (!isNonEmptyString(test.requirement)) {
            fail(issues, file, "acceptance-test-requirement-missing", { id: test.id });
        }
        if (test.automation !== undefined && !ACCEPTANCE_AUTOMATION_VALUES.has(test.automation)) {
            fail(issues, file, "acceptance-test-automation-invalid", { id: test.id, automation: test.automation });
        }
    }
}

export function validateAreaSpec(spec, file) {
    const issues = [];
    if (!isPlainObject(spec)) {
        fail(issues, file, "spec-not-object");
        return issues;
    }
    if (spec.schemaVersion !== "area-spec-v1") {
        fail(issues, file, "schema-version-invalid", { schemaVersion: spec.schemaVersion });
        return issues;
    }

    validateStageIdentity(spec, file, issues);
    validateBoundsAndEntry(spec, file, issues);

    const seenIds = new Set();
    validateSurfaces(spec, file, issues, seenIds);
    validateGrappleTargets(spec, file, issues, seenIds);
    validateEnemies(spec, file, issues, seenIds);
    validateScannerGroups(spec, file, issues, seenIds);
    validateWindZones(spec, file, issues, seenIds);
    validateObjectives(spec, file, issues, seenIds);

    const baseReferencableIds = collectBaseReferencableIds(spec);
    validateRoute(spec, file, issues, baseReferencableIds);
    validateRecovery(spec, file, issues, seenIds, baseReferencableIds);
    validateSourceExit(spec, file, issues);
    validateProgression(spec, file, issues);
    validateCamera(spec, file, issues);
    validateStory(spec, file, issues);
    validateRuntimeDependencies(spec, file, issues);
    validateForbidden(spec, file, issues);
    validateAcceptanceTests(spec, file, issues);

    return issues;
}

export function validateAreaSpecFile(path) {
    const raw = readFileSync(resolve(projectRoot, path), "utf8");
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        return [{ file: path, code: "invalid-json", message: error.message }];
    }
    return validateAreaSpec(parsed, path);
}

export function findAreaSpecFiles() {
    return collectAreaSpecFiles(scenarioRoot);
}

function printIssue(issue) {
    const { file, code, ...details } = issue;
    const detailText = Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : "";
    console.error(`- ${file}: ${code}${detailText}`);
}

function main() {
    const files = findAreaSpecFiles();
    let issueCount = 0;
    for (const file of files) {
        const issues = validateAreaSpecFile(file);
        for (const issue of issues) printIssue(issue);
        issueCount += issues.length;
    }
    if (issueCount > 0) {
        console.error(`AREA-SPEC validation failed: ${issueCount} issue(s) across ${files.length} file(s).`);
        process.exit(1);
    }
    console.log(`AREA-SPEC validation passed: ${files.length} file(s) checked.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    main();
}
