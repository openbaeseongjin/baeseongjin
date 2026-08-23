import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { PLAYER_CONFIG, ROPE_CONFIG, ropeHookReach } from "../src/game/config.js";
import { ENEMY_TYPE } from "../src/game/EnemyType.js";
import { EMPTY_AREA_BEHAVIOR_REGISTRY } from "../src/game/world/area-authoring-v2/AreaBehaviorRegistry.js";
import { AUTHORED_RUNTIME_CONTENT_BOUNDARY_STAGE_IDS } from "../src/game/world/area-authoring-v2/AreaRuntimePromotion.js";
import { canonicalizeAreaSpecV2, createAreaDefinitionFromV2 } from "../src/game/world/area-authoring-v2/AreaSpecV2.js";
import { validateAreaSpecV2 } from "../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";
import { AreaEntryEditorComponent } from "../src/game/world/area-authoring-v2/editor/AreaEntryEditorComponent.js";
import { AreaExitEditorComponent } from "../src/game/world/area-authoring-v2/editor/AreaExitEditorComponent.js";
import { collectEditorEntities } from "../src/game/world/area-authoring-v2/editor/AreaEditorProjection.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../src/game/world/areas/sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "../src/game/world/areas/sector03/Sector03AreaCatalog.js";
import { SECTOR_04_AREA_CATALOG } from "../src/game/world/areas/sector04/Sector04AreaCatalog.js";
import { SECTOR_05_AREA_CATALOG } from "../src/game/world/areas/sector05/Sector05AreaCatalog.js";
import { SECTOR_06_AREA_CATALOG } from "../src/game/world/areas/sector06/Sector06AreaCatalog.js";
import { AUTHORED_SECTOR_CATALOG } from "../src/game/world/sectors/AuthoredSectorCatalog.js";
import { createAuthoredSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/AuthoredSeamlessSectorRuntime.js";
import { SectorProgressState } from "../src/game/world/SectorProgressState.js";
import { ACCESS_MODULE_SOURCE_KIND } from "../src/game/world/sectors/SectorDefinition.js";
import {
    collisionSurfacesForSectorProgress,
    isSurfaceEnabledForProgress
} from "../src/game/world/WorldGateGeometry.js";

const projectRoot = resolve(process.cwd());
const editorCatalogPath = "docs/bsh/scenario/AREA-EDITOR-CATALOG.json";
const runtimeCatalogs = Object.freeze([
    SECTOR_01_AREA_CATALOG,
    SECTOR_02_AREA_CATALOG,
    SECTOR_03_AREA_CATALOG,
    SECTOR_04_AREA_CATALOG,
    SECTOR_05_AREA_CATALOG,
    SECTOR_06_AREA_CATALOG
]);
const RUNTIME_STAGE_COUNT = 48;
const SCENARIO_STAGE_COUNT = 0;
const TOTAL_STAGE_COUNT = RUNTIME_STAGE_COUNT + SCENARIO_STAGE_COUNT;
const EXPECTED_BOSS_STAGE_IDS = Object.freeze(["boss-03", "boss-06"]);
const EXPECTED_SECTOR_END_FLOW = Object.freeze({
    "1-8": Object.freeze({ targetStageId: "2-1", bossStageId: null }),
    "2-8": Object.freeze({ targetStageId: "3-1", bossStageId: null }),
    "3-8": Object.freeze({ targetStageId: "4-1", bossStageId: "boss-03" }),
    "4-8": Object.freeze({ targetStageId: "5-1", bossStageId: null }),
    "5-8": Object.freeze({ targetStageId: "6-1", bossStageId: null }),
    "6-8": Object.freeze({ targetStageId: null, bossStageId: "boss-06" })
});
const PROMOTED_STAGE_ENTRY_SECTOR_RANGE = Object.freeze({ first: 4, last: 6 });
const BASE_ROPE_REACH = ropeHookReach(ROPE_CONFIG);
const FORBIDDEN_AUTHORITY_KEYS = Object.freeze({
    designSourcePath: true,
    legacyStageAlias: true,
    provenance: true,
    sourcePathHash: true,
    sourceSchemaVersion: true,
    sourceSnapshot: true
});
const RUNTIME_SOURCE_EXTENSIONS = Object.freeze({ ".js": true, ".mjs": true });
const REV_DESIGN_REFERENCE = /AREA-SPEC-REV[^"'\s]*-DESIGN\.json/i;
const ACCESS_MODULE_REQUIREMENT_BY_SECTOR_ID = Object.freeze(
    Object.fromEntries(runtimeCatalogs.map((catalog) => [catalog.areas[0].sectorId, catalog.accessModuleRequirement]))
);
const EXPECTED_ACCESS_MODULE_AUTHORITY = Object.freeze({
    "sector-01": Object.freeze({
        requirement: 3,
        moduleCount: 3,
        sourceKind: ACCESS_MODULE_SOURCE_KIND.ENEMY_DEFEAT
    }),
    "sector-02": Object.freeze({
        requirement: 3,
        moduleCount: 3,
        sourceKind: ACCESS_MODULE_SOURCE_KIND.ENEMY_DEFEAT
    }),
    "sector-03": Object.freeze({
        requirement: 3,
        moduleCount: 3,
        sourceKind: ACCESS_MODULE_SOURCE_KIND.ENEMY_DEFEAT
    }),
    "sector-04": Object.freeze({
        requirement: 2,
        moduleCount: 3,
        sourceKind: ACCESS_MODULE_SOURCE_KIND.OBJECTIVE_COMPLETION
    }),
    "sector-05": Object.freeze({ requirement: 0, moduleCount: 0, sourceKind: null }),
    "sector-06": Object.freeze({ requirement: 0, moduleCount: 0, sourceKind: null })
});
const EXPECTED_SECTOR_05_JAMMER_IDS = Object.freeze([
    "sector-05-03:jammer-a:field",
    "sector-05-03:jammer-b:field",
    "sector-05-05:jammer-a:field",
    "sector-05-06:jammer-a:field",
    "sector-05-08:jammer-a:field"
]);
const SECTOR_05_PROOF_OBJECT_ID = "sector-05-08:continuity-proof-synthesis:display";
const STAGE_BOUNDARY_EPSILON = 0.01;
const MIN_STAGE_BOUNDARY_PASSAGE_WIDTH = PLAYER_CONFIG.radius * 2 + 2;
const EXPECTED_SECTOR_06_RECALL = Object.freeze({
    windStageId: "6-2",
    standardStageId: "6-3",
    scannerStageId: "6-5",
    patrolStageId: "6-6",
    cutterStageId: "6-7"
});
const SURFACE_SEMANTIC_KEYS = Object.freeze([
    "areaId",
    "blockedByRouteId",
    "collision",
    "coordinateAnchor",
    "damage",
    "gameplayRelevant",
    "grappleable",
    "height",
    "id",
    "kind",
    "landmarkId",
    "losBlocker",
    "oneWay",
    "oneWayEdgeEnd",
    "position",
    "presentationId",
    "purpose",
    "renderable",
    "role",
    "scannerControlled",
    "sourceId",
    "stageId",
    "topY",
    "vertices",
    "width",
    "x",
    "y",
    "windOcclusion"
]);
const INTENTIONAL_COLLISION_FOOTPRINT_OVERLAPS = Object.freeze({});

function normalizePath(path) {
    return path.split(sep).join("/");
}

function readJson(path) {
    return JSON.parse(readFileSync(resolve(projectRoot, path), "utf8"));
}

function issue(issues, code, details = {}) {
    issues.push(Object.freeze({ code, ...details }));
}

function expectedStageIds(startSector, endSector) {
    const ids = [];
    for (let sector = startSector; sector <= endSector; sector += 1) {
        for (let stage = 1; stage <= 8; stage += 1) ids.push(`${sector}-${stage}`);
    }
    return ids;
}

function indexBy(values, key, issues, duplicateCode) {
    const index = Object.create(null);
    for (const value of values) {
        const id = value?.[key];
        if (typeof id !== "string" || !id) {
            issue(issues, `${duplicateCode}-id-invalid`, { id: id ?? null });
            continue;
        }
        if (Object.hasOwn(index, id)) issue(issues, duplicateCode, { id });
        index[id] = value;
    }
    return Object.freeze(index);
}

function collectForbiddenKeys(value, path, issues) {
    if (Array.isArray(value)) {
        value.forEach((entry, index) => collectForbiddenKeys(entry, `${path}[${index}]`, issues));
        return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, entry] of Object.entries(value)) {
        if (FORBIDDEN_AUTHORITY_KEYS[key]) issue(issues, "forbidden-map-authority-key", { path, key });
        collectForbiddenKeys(entry, `${path}.${key}`, issues);
    }
}

function collectSourceFiles(directory) {
    const files = [];
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) files.push(...collectSourceFiles(path));
        else if (entry.isFile() && RUNTIME_SOURCE_EXTENSIONS[extname(entry.name)]) files.push(path);
    }
    return files;
}

function validateRuntimeSourceImports(issues) {
    for (const root of [resolve(projectRoot, "src"), resolve(projectRoot, "scripts")]) {
        for (const path of collectSourceFiles(root)) {
            const source = readFileSync(path, "utf8");
            const match = REV_DESIGN_REFERENCE.exec(source);
            if (match) {
                issue(issues, "runtime-rev-design-reference-forbidden", {
                    file: normalizePath(relative(projectRoot, path)),
                    reference: match[0]
                });
            }
        }
    }
}

function polygonArea(vertices) {
    let twiceArea = 0;
    for (let index = 0; index < vertices.length; index += 1) {
        const current = vertices[index];
        const next = vertices[(index + 1) % vertices.length];
        twiceArea += current.x * next.y - next.x * current.y;
    }
    return Math.abs(twiceArea) * 0.5;
}

function validateSurfaceGeometry(surface, scope, issues) {
    if (!Array.isArray(surface.vertices) || surface.vertices.length < 3) {
        issue(issues, "surface-vertices-invalid", { scope, id: surface.id ?? null });
        return;
    }
    if (surface.vertices.some(({ x, y }) => !Number.isFinite(x) || !Number.isFinite(y))) {
        issue(issues, "surface-coordinate-invalid", { scope, id: surface.id });
    }
    if (
        !Number.isFinite(surface.width) ||
        surface.width <= 0 ||
        !Number.isFinite(surface.height) ||
        surface.height <= 0
    ) {
        issue(issues, "surface-bounds-invalid", { scope, id: surface.id });
    }
    if (polygonArea(surface.vertices) <= 0) issue(issues, "surface-area-invalid", { scope, id: surface.id });
    const bounds = surfaceBounds(surface);
    for (const key of ["x", "y", "width", "height"]) {
        if (surface[key] !== bounds[key]) {
            issue(issues, "surface-vertex-bounds-mismatch", {
                scope,
                id: surface.id,
                key,
                expected: bounds[key],
                actual: surface[key]
            });
        }
    }
    if (surface.topY !== bounds.y) {
        issue(issues, "surface-top-y-mismatch", {
            scope,
            id: surface.id,
            expected: bounds.y,
            actual: surface.topY
        });
    }
}

function semanticSurface(surface) {
    return canonicalizeAreaSpecV2(
        Object.fromEntries(SURFACE_SEMANTIC_KEYS.filter((key) => key in surface).map((key) => [key, surface[key]]))
    );
}

function shiftedSemanticSurface(surface, landmark) {
    const prefixedId = surface.id.startsWith(`${landmark.areaId}:`) ? surface.id : `${landmark.areaId}:${surface.id}`;
    const vertices = surface.vertices.map(({ x, y }) => ({
        x: x + landmark.origin.x,
        y: y + landmark.origin.y
    }));
    const xCoordinates = vertices.map(({ x }) => x);
    const yCoordinates = vertices.map(({ y }) => y);
    const left = Math.min(...xCoordinates);
    const top = Math.min(...yCoordinates);
    const bounds = {
        x: left,
        y: top,
        width: Math.max(...xCoordinates) - left,
        height: Math.max(...yCoordinates) - top
    };
    return semanticSurface({
        ...surface,
        id: prefixedId,
        landmarkId: landmark.id,
        stageId: landmark.stageId,
        ...bounds,
        topY: surface.topY === undefined ? bounds.y : surface.topY + landmark.origin.y,
        ...(surface.position
            ? {
                  position: {
                      x: surface.position.x + landmark.origin.x,
                      y: surface.position.y + landmark.origin.y
                  }
              }
            : {}),
        vertices,
        ...(surface.oneWay ? { oneWayEdgeEnd: surface.oneWayEdgeEnd ?? 1 } : {})
    });
}

function validateEditorCatalog(editorCatalog, issues) {
    if (editorCatalog?.schemaVersion !== "area-editor-catalog-v2" || !Array.isArray(editorCatalog.stages)) {
        issue(issues, "editor-catalog-invalid");
        return Object.freeze({ runtimeEntries: [], scenarioEntries: [] });
    }
    collectForbiddenKeys(editorCatalog, editorCatalogPath, issues);
    const bossStageEntries = editorCatalog.stages.filter(({ specType }) => specType === "boss-stage");
    const bossStageIds = bossStageEntries
        .map(({ stageId }) => stageId)
        .sort((left, right) => left.localeCompare(right));
    if (JSON.stringify(bossStageIds) !== JSON.stringify(EXPECTED_BOSS_STAGE_IDS)) {
        issue(issues, "editor-boss-stage-catalog-mismatch", {
            expected: EXPECTED_BOSS_STAGE_IDS,
            actual: bossStageIds
        });
    }
    const authoredStageEntries = editorCatalog.stages.filter(({ stageId }) => /^\d+-\d+$/.test(stageId));
    const stageIndex = indexBy(authoredStageEntries, "stageId", issues, "editor-stage-duplicate");
    const expectedIds = expectedStageIds(1, 6);
    if (authoredStageEntries.length !== TOTAL_STAGE_COUNT) {
        issue(issues, "editor-stage-count", { expected: TOTAL_STAGE_COUNT, actual: authoredStageEntries.length });
    }
    for (const stageId of expectedIds) {
        const entry = stageIndex[stageId];
        if (!entry) {
            issue(issues, "editor-stage-missing", { stageId });
            continue;
        }
        const [sector, stage] = stageId.split("-").map(Number);
        const expectedAreaId = `sector-${String(sector).padStart(2, "0")}-${String(stage).padStart(2, "0")}`;
        const expectedSourcePath = `docs/bsh/scenario/${sector}/${stageId}/AREA-SPEC.v2.json`;
        if (entry.areaId !== expectedAreaId) issue(issues, "editor-area-id-mismatch", { stageId, expectedAreaId });
        if (entry.sourcePath !== expectedSourcePath) {
            issue(issues, "editor-source-path-mismatch", { stageId, expectedSourcePath });
        }
        const expectedMode = sector <= 6 ? "runtime-generated" : "scenario-only";
        if (entry.authoringMode !== expectedMode) {
            issue(issues, "editor-authoring-mode-mismatch", { stageId, expectedMode, actual: entry.authoringMode });
        }
        if (expectedMode === "runtime-generated" && typeof entry.manifestPath !== "string") {
            issue(issues, "runtime-manifest-path-missing", { stageId });
        }
        if (expectedMode === "scenario-only" && entry.manifestPath !== undefined) {
            issue(issues, "scenario-runtime-manifest-forbidden", { stageId });
        }
    }
    const runtimeEntries = authoredStageEntries.filter(({ authoringMode }) => authoringMode === "runtime-generated");
    const scenarioEntries = authoredStageEntries.filter(({ authoringMode }) => authoringMode === "scenario-only");
    if (runtimeEntries.length !== RUNTIME_STAGE_COUNT) {
        issue(issues, "runtime-stage-count", { expected: RUNTIME_STAGE_COUNT, actual: runtimeEntries.length });
    }
    if (scenarioEntries.length !== SCENARIO_STAGE_COUNT) {
        issue(issues, "scenario-stage-count", { expected: SCENARIO_STAGE_COUNT, actual: scenarioEntries.length });
    }
    return Object.freeze({ runtimeEntries, scenarioEntries });
}

function validateBossStageFlow(world, issues) {
    const bossStageIds = world.bossStages.map(({ id }) => id).sort((left, right) => left.localeCompare(right));
    if (JSON.stringify(bossStageIds) !== JSON.stringify(EXPECTED_BOSS_STAGE_IDS)) {
        issue(issues, "runtime-boss-stage-catalog-mismatch", {
            expected: EXPECTED_BOSS_STAGE_IDS,
            actual: bossStageIds
        });
    }
    for (const [sourceStageId, expected] of Object.entries(EXPECTED_SECTOR_END_FLOW)) {
        const source = world.landmarks.find(({ stageId }) => stageId === sourceStageId);
        const transition = world.stageTransitions.find(({ sourceLandmarkId }) => sourceLandmarkId === source?.id);
        const target = world.landmarks.find(({ id }) => id === transition?.targetLandmarkId);
        const bossStage = world.bossStages.find(({ sourceLandmarkId }) => sourceLandmarkId === source?.id);
        const expectedEntryRouteId = expected.bossStageId ? (transition?.routeLockId ?? null) : null;
        if (
            !source ||
            (target?.stageId ?? null) !== expected.targetStageId ||
            (bossStage?.id ?? null) !== expected.bossStageId ||
            (bossStage?.entryRouteId ?? null) !== expectedEntryRouteId
        ) {
            issue(issues, "sector-end-boss-flow-mismatch", {
                sourceStageId,
                expected,
                targetStageId: target?.stageId ?? null,
                bossStageId: bossStage?.id ?? null,
                bossEntryRouteId: bossStage?.entryRouteId ?? null,
                transitionRouteId: transition?.routeLockId ?? null
            });
        }
    }
}

function validateScenarioExclusion({ scenarioEntries, world, issues }) {
    const runtimeIdentityIndex = indexBy(world.stageIdentities, "stageId", issues, "runtime-stage-identity-duplicate");
    const authoredIdentityIndex = indexBy(
        AUTHORED_SECTOR_CATALOG.stageIdentities,
        "stageId",
        issues,
        "authored-stage-identity-duplicate"
    );
    for (const entry of scenarioEntries) {
        if (runtimeIdentityIndex[entry.stageId]) issue(issues, "scenario-stage-in-runtime", { stageId: entry.stageId });
        const identity = authoredIdentityIndex[entry.stageId];
        if (!identity || identity.runtimePreview !== false) {
            issue(issues, "scenario-stage-identity-invalid", { stageId: entry.stageId });
        }
    }
}

function validateAccessModuleAuthority(world, issues) {
    const moduleIndex = indexBy(world.accessModules, "id", issues, "access-module-duplicate");
    const objectiveIndex = indexBy(world.objectives, "id", issues, "access-objective-duplicate");
    const encounterIndex = indexBy(world.enemySpawns, "encounterId", issues, "access-encounter-duplicate");
    const sourceOwnerIndex = Object.create(null);

    for (const sector of world.sectors) {
        const expected = EXPECTED_ACCESS_MODULE_AUTHORITY[sector.id];
        const sectorModules = world.accessModules.filter(({ sectorId }) => sectorId === sector.id);
        if (
            !expected ||
            sector.accessModuleRequirement !== expected.requirement ||
            sectorModules.length !== expected.moduleCount ||
            JSON.stringify(sector.accessModuleIds) !== JSON.stringify(sectorModules.map(({ id }) => id))
        ) {
            issue(issues, "access-module-sector-authority-mismatch", {
                sectorId: sector.id,
                requirement: sector.accessModuleRequirement,
                moduleIds: sector.accessModuleIds,
                compiledModuleIds: sectorModules.map(({ id }) => id)
            });
        }
        for (const module of sectorModules) {
            if (!moduleIndex[module.id] || !Array.isArray(module.sources) || module.sources.length === 0) {
                issue(issues, "access-module-source-missing", { sectorId: sector.id, moduleId: module.id });
                continue;
            }
            for (const source of module.sources) {
                const sourceId = source.encounterId ?? source.objectiveId ?? null;
                let sourceRecord = null;
                if (source.kind === ACCESS_MODULE_SOURCE_KIND.ENEMY_DEFEAT) {
                    sourceRecord = encounterIndex[sourceId];
                } else if (source.kind === ACCESS_MODULE_SOURCE_KIND.OBJECTIVE_COMPLETION) {
                    sourceRecord = objectiveIndex[sourceId];
                }
                if (
                    source.kind !== expected.sourceKind ||
                    !sourceRecord ||
                    sourceRecord.landmarkId !== module.landmarkId
                ) {
                    issue(issues, "access-module-source-authority-mismatch", {
                        sectorId: sector.id,
                        moduleId: module.id,
                        source
                    });
                }
                const sourceKey = `${source.kind}:${sourceId}`;
                if (sourceOwnerIndex[sourceKey] && sourceOwnerIndex[sourceKey] !== module.id) {
                    issue(issues, "access-module-source-owner-duplicate", {
                        sourceKey,
                        moduleIds: [sourceOwnerIndex[sourceKey], module.id]
                    });
                }
                sourceOwnerIndex[sourceKey] = module.id;
            }
        }
    }
}

function validateSectorRecallContracts(world, surfaceIndex, issues) {
    const jammerIndex = indexBy(world.jammerGroups, "id", issues, "jammer-group-duplicate");
    const encounterIndex = indexBy(world.enemySpawns, "encounterId", issues, "jammer-encounter-duplicate");
    if (JSON.stringify(Object.keys(jammerIndex).sort()) !== JSON.stringify([...EXPECTED_SECTOR_05_JAMMER_IDS].sort())) {
        issue(issues, "sector-05-jammer-contract-mismatch", { actual: Object.keys(jammerIndex).sort() });
    }
    for (const jammer of world.jammerGroups) {
        const source = encounterIndex[jammer.sourceObjectId];
        if (!source || source.stageId !== jammer.stageId || source.landmarkId !== jammer.landmarkId) {
            issue(issues, "jammer-source-authority-mismatch", {
                jammerId: jammer.id,
                sourceObjectId: jammer.sourceObjectId
            });
        }
        for (const surfaceId of jammer.eligibleSurfaceIds) {
            if (!surfaceIndex[surfaceId]) issue(issues, "jammer-surface-missing", { jammerId: jammer.id, surfaceId });
        }
    }
    const proof = world.objects.find(({ id }) => id === SECTOR_05_PROOF_OBJECT_ID);
    if (!proof || proof.stageId !== "5-8" || proof.kind !== "story-display") {
        issue(issues, "sector-05-proof-authority-mismatch", { objectId: SECTOR_05_PROOF_OBJECT_ID });
    }

    const sector06Wind = world.windZones.filter(({ stageId }) => stageId === EXPECTED_SECTOR_06_RECALL.windStageId);
    const sector06Scanner = world.scannerGroups.filter(
        ({ stageId }) => stageId === EXPECTED_SECTOR_06_RECALL.scannerStageId
    );
    const sector06EncounterByStage = Object.freeze(
        Object.fromEntries(
            world.enemySpawns.filter(({ sectorId }) => sectorId === "sector-06").map((entry) => [entry.stageId, entry])
        )
    );
    if (sector06Wind.length !== 1 || sector06Scanner.length !== 1) {
        issue(issues, "sector-06-recall-environment-mismatch", {
            windCount: sector06Wind.length,
            scannerCount: sector06Scanner.length
        });
    }
    const standard = sector06EncounterByStage[EXPECTED_SECTOR_06_RECALL.standardStageId];
    const patrol = sector06EncounterByStage[EXPECTED_SECTOR_06_RECALL.patrolStageId];
    const cutter = sector06EncounterByStage[EXPECTED_SECTOR_06_RECALL.cutterStageId];
    if (
        standard?.enemySelection?.fixedEnemyType !== ENEMY_TYPE.SENTRY_T1 ||
        patrol?.enemySelection?.fixedEnemyType !== ENEMY_TYPE.PATROL_DRONE_T1 ||
        !patrol?.patrol ||
        cutter?.enemySelection?.fixedEnemyType !== ENEMY_TYPE.SENTRY_T1 ||
        !cutter?.rules?.includes("cutter-fire")
    ) {
        issue(issues, "sector-06-recall-enemy-mismatch");
    }
}

function surfaceBounds(surface) {
    return {
        x: Math.min(...surface.vertices.map(({ x }) => x)),
        y: Math.min(...surface.vertices.map(({ y }) => y)),
        width: Math.max(...surface.vertices.map(({ x }) => x)) - Math.min(...surface.vertices.map(({ x }) => x)),
        height: Math.max(...surface.vertices.map(({ y }) => y)) - Math.min(...surface.vertices.map(({ y }) => y))
    };
}

function normalizedCollisionFootprint(vertices) {
    const points = vertices.map(({ x, y }) => `${x},${y}`);
    const rotations = [];
    for (const ordered of [points, [...points].reverse()]) {
        for (let index = 0; index < ordered.length; index += 1) {
            rotations.push([...ordered.slice(index), ...ordered.slice(0, index)].join("|"));
        }
    }
    return rotations.sort((left, right) => left.localeCompare(right, "en"))[0];
}

function horizontalInterval(surface, padding = 0) {
    const bounds = surfaceBounds(surface);
    return Object.freeze({ min: bounds.x + padding, max: bounds.x + bounds.width - padding });
}

function mergeIntervals(intervals) {
    const ordered = intervals
        .filter(({ min, max }) => max > min)
        .sort((left, right) => left.min - right.min || left.max - right.max);
    const merged = [];
    for (const interval of ordered) {
        const previous = merged.at(-1);
        if (!previous || interval.min > previous.max + STAGE_BOUNDARY_EPSILON) {
            merged.push({ ...interval });
            continue;
        }
        previous.max = Math.max(previous.max, interval.max);
    }
    return merged;
}

function openIntervals(domain, blockers) {
    const open = [];
    let cursor = domain.min;
    for (const blocker of mergeIntervals(blockers)) {
        const min = Math.max(domain.min, blocker.min);
        const max = Math.min(domain.max, blocker.max);
        if (max <= domain.min || min >= domain.max) continue;
        if (min > cursor) open.push(Object.freeze({ min: cursor, max: min }));
        cursor = Math.max(cursor, max);
    }
    if (cursor < domain.max) open.push(Object.freeze({ min: cursor, max: domain.max }));
    return open;
}

function intervalOverlapWidth(left, right) {
    return Math.max(0, Math.min(left.max, right.max) - Math.max(left.min, right.min));
}

function intervalDistance(left, right) {
    if (intervalOverlapWidth(left, right) > 0) return 0;
    return left.max <= right.min ? right.min - left.max : left.min - right.max;
}

function validateAuthoredStageBoundary(world, source, target, issues) {
    const seamY = source.bounds.y;
    const domain = Object.freeze({
        min: Math.max(source.bounds.x, target.bounds.x) + PLAYER_CONFIG.radius,
        max:
            Math.min(source.bounds.x + source.bounds.width, target.bounds.x + target.bounds.width) -
            PLAYER_CONFIG.radius
    });
    const seamSurfaces = world.surfaces.filter((surface) => {
        if (
            (surface.landmarkId !== source.id && surface.landmarkId !== target.id) ||
            surface.collision === false ||
            surface.renderable === false
        ) {
            return false;
        }
        const bounds = surfaceBounds(surface);
        return surface.oneWay === true
            ? Math.abs(surface.topY - seamY) <= STAGE_BOUNDARY_EPSILON
            : bounds.y <= seamY + STAGE_BOUNDARY_EPSILON && bounds.y + bounds.height >= seamY - STAGE_BOUNDARY_EPSILON;
    });
    const blockers = seamSurfaces.map((surface) => horizontalInterval(surface, -PLAYER_CONFIG.radius));
    const passages = openIntervals(domain, blockers).filter(
        ({ min, max }) => max - min >= MIN_STAGE_BOUNDARY_PASSAGE_WIDTH
    );
    if (passages.length === 0) {
        issue(issues, "full-width-seam-blocked", {
            sourceStageId: source.stageId,
            targetStageId: target.stageId,
            seamY,
            blockerIds: seamSurfaces.map(({ id }) => id)
        });
        return;
    }

    const lowerSurfaces = world.surfaces.filter(
        ({ landmarkId, collision, renderable }) =>
            landmarkId === source.id && collision !== false && renderable !== false
    );
    const landing = lowerSurfaces
        .filter(({ topY }) => topY >= seamY - STAGE_BOUNDARY_EPSILON)
        .sort((left, right) => left.topY - right.topY)
        .find((surface) => {
            const support = horizontalInterval(surface, PLAYER_CONFIG.radius);
            return passages.some(
                (passage) => intervalOverlapWidth(passage, support) >= MIN_STAGE_BOUNDARY_PASSAGE_WIDTH
            );
        });
    if (landing) return;
    const ropeRecovery = lowerSurfaces.find(
        (surface) =>
            surface.grappleable === true &&
            passages.some((passage) => intervalDistance(passage, horizontalInterval(surface)) <= BASE_ROPE_REACH)
    );
    if (!ropeRecovery) {
        issue(issues, "no-lower-recovery-surface", {
            sourceStageId: source.stageId,
            targetStageId: target.stageId,
            seamY
        });
    }
}

function validateCollisionFootprintDuplicates(surfaces, issues) {
    const footprintIndex = Object.create(null);
    for (const surface of surfaces) {
        const footprint = normalizedCollisionFootprint(surface.vertices);
        const existingId = footprintIndex[footprint];
        if (!existingId) {
            footprintIndex[footprint] = surface.id;
            continue;
        }
        const pairKey = [existingId, surface.id].sort((left, right) => left.localeCompare(right, "en")).join("|");
        if (!INTENTIONAL_COLLISION_FOOTPRINT_OVERLAPS[pairKey]) {
            issue(issues, "collision-footprint-duplicate", { ids: [existingId, surface.id], footprint });
        }
    }
}

function completeLandmarkObjectives(progress, landmark) {
    let changed = true;
    while (changed) {
        changed = false;
        for (const objectiveId of landmark.objectiveIds) {
            const result = progress.completeObjective(objectiveId);
            if (result.changed) changed = true;
        }
    }
}

function progressSurfaceIndex(world, progress) {
    return Object.freeze(
        Object.fromEntries(collisionSurfacesForSectorProgress(world, progress).map((surface) => [surface.id, surface]))
    );
}

function assertRouteState({ label, lock, progress, expectedUnlocked, issues }) {
    const actual = progress.isRouteUnlocked(lock.id);
    if (actual !== expectedUnlocked) {
        issue(issues, "stage-transition-route-state", {
            routeId: lock.id,
            label,
            expectedUnlocked,
            actual
        });
    }
}

function validateProgressGates(world, areaIndex, issues) {
    const reports = Object.create(null);
    for (const lock of world.routeLocks.filter(({ requiredAccessModuleCount }) => requiredAccessModuleCount > 0)) {
        const source = world.landmarks.find(({ id }) => id === lock.sourceLandmarkId);
        const sector = world.sectors.find(({ id }) => id === source.sectorId);
        const expectedAccessModuleRequirement = ACCESS_MODULE_REQUIREMENT_BY_SECTOR_ID[sector.id];
        const area = areaIndex[source.areaId];
        const objectiveIdBySourceId = Object.freeze(
            Object.fromEntries(area.objectives.map((objective, index) => [objective.id, source.objectiveIds[index]]))
        );
        const expectedRequiredObjectiveIds = area.gate.requiredObjectiveIds.map(
            (objectiveId) => objectiveIdBySourceId[objectiveId]
        );
        if (
            lock.requiredAccessModuleCount !== expectedAccessModuleRequirement ||
            sector.accessModuleRequirement !== expectedAccessModuleRequirement ||
            sector.accessModuleIds.length < expectedAccessModuleRequirement
        ) {
            issue(issues, "transit-access-requirement-mismatch", {
                routeId: lock.id,
                routeRequirement: lock.requiredAccessModuleCount,
                sectorRequirement: sector.accessModuleRequirement,
                moduleCount: sector.accessModuleIds.length
            });
        }
        if (JSON.stringify(lock.requiredObjectiveIds) !== JSON.stringify(expectedRequiredObjectiveIds)) {
            issue(issues, "transit-required-objectives-mismatch", {
                routeId: lock.id,
                expected: expectedRequiredObjectiveIds,
                actual: lock.requiredObjectiveIds
            });
        }

        const objectiveOnly = new SectorProgressState(world);
        completeLandmarkObjectives(objectiveOnly, source);
        const lockedSurfaceIndex = progressSurfaceIndex(world, objectiveOnly);
        assertRouteState({
            label: "objective-only",
            lock,
            progress: objectiveOnly,
            expectedUnlocked: false,
            issues
        });
        for (let count = 1; count < expectedAccessModuleRequirement; count += 1) {
            objectiveOnly.collectAccessModule(sector.accessModuleIds[count - 1]);
            assertRouteState({
                label: `objective+${count}/${expectedAccessModuleRequirement}`,
                lock,
                progress: objectiveOnly,
                expectedUnlocked: false,
                issues
            });
        }

        const modulesOnly = new SectorProgressState(world);
        for (const moduleId of sector.accessModuleIds) modulesOnly.collectAccessModule(moduleId);
        assertRouteState({
            label: `${expectedAccessModuleRequirement}/${expectedAccessModuleRequirement}-only`,
            lock,
            progress: modulesOnly,
            expectedUnlocked: lock.requiredObjectiveIds.length === 0,
            issues
        });

        objectiveOnly.collectAccessModule(sector.accessModuleIds[expectedAccessModuleRequirement - 1]);
        assertRouteState({
            label: `objective+${expectedAccessModuleRequirement}/${expectedAccessModuleRequirement}`,
            lock,
            progress: objectiveOnly,
            expectedUnlocked: true,
            issues
        });
        const unlockedSurfaceIndex = progressSurfaceIndex(world, objectiveOnly);
        if (JSON.stringify(lockedSurfaceIndex) !== JSON.stringify(unlockedSurfaceIndex)) {
            issue(issues, "stage-transition-unlock-surface-drift", { routeId: lock.id });
        }
        reports[source.stageId] = Object.freeze([]);
    }
    return Object.freeze(reports);
}

function validateStageTransitions(world, landmarkIndex, issues) {
    const transitionIndex = indexBy(world.stageTransitions, "id", issues, "stage-transition-duplicate");
    const routeLockIndex = indexBy(world.routeLocks, "id", issues, "route-lock-duplicate");
    const expectedTransitionCount = RUNTIME_STAGE_COUNT - 1;
    if (
        world.stageTransitions.length !== expectedTransitionCount ||
        world.routeLocks.length !== expectedTransitionCount
    ) {
        issue(issues, "stage-transition-count-mismatch", {
            expected: expectedTransitionCount,
            stageTransitions: world.stageTransitions.length,
            routeLocks: world.routeLocks.length
        });
    }
    for (const transition of Object.values(transitionIndex)) {
        const source = landmarkIndex[transition.sourceLandmarkId];
        const target = landmarkIndex[transition.targetLandmarkId];
        const lock = routeLockIndex[transition.routeLockId];
        if (!source || !target || !lock) {
            issue(issues, "stage-transition-owner-missing", { stageTransitionId: transition.id });
            continue;
        }
        if (target.order !== source.order + 1) {
            issue(issues, "stage-transition-order-mismatch", {
                stageTransitionId: transition.id,
                sourceOrder: source.order,
                targetOrder: target.order
            });
        }
        if (
            lock.sourceLandmarkId !== transition.sourceLandmarkId ||
            lock.targetLandmarkId !== transition.targetLandmarkId ||
            lock.stageTransitionId !== transition.id
        ) {
            issue(issues, "stage-transition-lock-owner-mismatch", { stageTransitionId: transition.id });
        }
        if (
            transition.gateId !== source.gateId ||
            transition.sourceAreaId !== source.areaId ||
            transition.targetAreaId !== target.areaId ||
            JSON.stringify(transition.trigger) !== JSON.stringify(source.gateTrigger) ||
            JSON.stringify(transition.targetEntry) !== JSON.stringify(target.entry)
        ) {
            issue(issues, "stage-transition-authored-endpoint-mismatch", { stageTransitionId: transition.id });
        }
        const verticalGap = source.bounds.y - (target.bounds.y + target.bounds.height);
        if (Math.abs(verticalGap) > STAGE_BOUNDARY_EPSILON) {
            issue(issues, "stage-map-seam-gap", {
                stageTransitionId: transition.id,
                expected: 0,
                actual: verticalGap
            });
        }
        validateAuthoredStageBoundary(world, source, target, issues);
    }
    const terminalBoundaryStageId = AUTHORED_RUNTIME_CONTENT_BOUNDARY_STAGE_IDS.at(-1);
    for (const stageId of AUTHORED_RUNTIME_CONTENT_BOUNDARY_STAGE_IDS) {
        const landmark = world.landmarks.find((entry) => entry.stageId === stageId);
        const expectsOutboundRoute = stageId !== terminalBoundaryStageId;
        if (
            !landmark ||
            (expectsOutboundRoute ? typeof landmark.outboundRouteId !== "string" : landmark.outboundRouteId != null)
        ) {
            issue(issues, "content-boundary-outbound-route", {
                stageId,
                expected: expectsOutboundRoute ? "route-id" : null,
                outboundRouteId: landmark?.outboundRouteId ?? null
            });
        }
    }
}

function validateContentBoundaryProgress(world, issues) {
    for (const contentBoundaryId of AUTHORED_RUNTIME_CONTENT_BOUNDARY_STAGE_IDS) {
        const landmark = world.landmarks.find(({ stageId }) => stageId === contentBoundaryId);
        const sector = world.sectors.find(({ id }) => id === landmark?.sectorId);
        if (
            !landmark ||
            landmark.contentBoundaryId !== contentBoundaryId ||
            sector?.contentBoundaryStageId !== contentBoundaryId ||
            landmark.contentBoundaryRequiredObjectiveIds.length === 0
        ) {
            issue(issues, "content-boundary-authority-mismatch", { contentBoundaryId });
            continue;
        }
        const progress = new SectorProgressState(world);
        completeLandmarkObjectives(progress, landmark);
        const snapshot = progress.snapshot();
        if (
            snapshot.contentBoundaryId !== contentBoundaryId ||
            !snapshot.reachedContentBoundaryIds.includes(contentBoundaryId)
        ) {
            issue(issues, "content-boundary-progress-mismatch", { contentBoundaryId, snapshot });
        }
    }
}

function validateSector04QuorumCollision(world, issues) {
    const barrier = world.surfaces.find(
        ({ stageId, blockedByObjectiveId }) => stageId === "4-8" && typeof blockedByObjectiveId === "string"
    );
    const sector = world.sectors.find(({ id }) => id === "sector-04");
    if (!barrier || sector?.accessModuleRequirement !== 2) {
        issue(issues, "sector-04-quorum-barrier-missing");
        return;
    }
    const progress = new SectorProgressState(world);
    for (let count = 0; count < sector.accessModuleRequirement; count += 1) {
        const liveEnabled = isSurfaceEnabledForProgress(barrier, progress);
        const snapshotEnabled = isSurfaceEnabledForProgress(barrier, progress.snapshot());
        if (!liveEnabled || !snapshotEnabled || !progressSurfaceIndex(world, progress)[barrier.id]) {
            issue(issues, "sector-04-quorum-premature-open", { count, barrierId: barrier.id });
        }
        progress.collectAccessModule(sector.accessModuleIds[count]);
    }
    const completion = progress.completeObjective(barrier.blockedByObjectiveId);
    if (
        !completion.changed ||
        isSurfaceEnabledForProgress(barrier, progress) ||
        isSurfaceEnabledForProgress(barrier, progress.snapshot()) ||
        progressSurfaceIndex(world, progress)[barrier.id]
    ) {
        issue(issues, "sector-04-quorum-open-mismatch", { barrierId: barrier.id });
    }
}

function validateEditorEntityCoverage(spec, issues) {
    const definition = spec.definition;
    const entities = collectEditorEntities(spec);
    const entityKeys = Object.freeze(Object.fromEntries(entities.map(({ domain, id }) => [`${domain}:${id}`, true])));
    const entry = AreaEntryEditorComponent.from(definition);
    const exit = AreaExitEditorComponent.from(definition);
    const expected = [
        ["bounds", `${definition.id}:bounds`],
        ...(entry ? [["entry", entry.id]] : []),
        ...(exit ? [["exit", exit.id]] : []),
        ...(definition.surfaces ?? []).map((surface) => [
            entry?.ownsSurface(surface.id) ? "entry" : exit?.ownsSurface(surface.id) ? "exit" : "surfaces",
            entry?.ownsSurface(surface.id) ? entry.id : exit?.ownsSurface(surface.id) ? exit.id : surface.id
        ]),
        ...(spec.anchors ?? []).map(({ landmark }) => ["anchors", landmark.id]),
        ...(definition.recoveryPoints ?? []).map(({ id }) => ["recoveryRoute", id]),
        ...(definition.routePoints ?? [])
            .filter(({ id }) => !exit?.ownsRoutePoint(id))
            .map(({ id }) => ["recoveryRoute", id]),
        ...(definition.objects ?? []).map((object) => [
            object.gateId === definition.gate?.id
                ? "exit"
                : object.enemyType || object.enemySelection || object.kind === "sentry"
                  ? "enemySlots"
                  : object.kind === "wind-source"
                    ? "wind"
                    : "worldObjects",
            object.gateId === definition.gate?.id ? exit?.id : object.id
        ]),
        ...(definition.windZones ?? []).map(({ id }) => ["wind", id]),
        ...(definition.cameraZones ?? []).map(({ id }) => ["camera", id])
    ];
    for (const [domain, id] of expected) {
        if (id && entityKeys[`${domain}:${id}`] !== true) {
            issue(issues, "map-editor-entity-coverage-missing", { stageId: spec.stage.id, domain, id });
        }
    }
}

function validateRuntimeStages({ runtimeEntries, world, issues }) {
    const reports = [];
    const landmarkIndex = indexBy(world.landmarks, "stageId", issues, "runtime-landmark-stage-duplicate");
    const surfaceIndex = indexBy(world.surfaces, "id", issues, "runtime-surface-duplicate");
    const areaIndex = indexBy(
        runtimeCatalogs.flatMap(({ areas }) => areas),
        "id",
        issues,
        "generated-area-duplicate"
    );
    for (const surface of world.surfaces) validateSurfaceGeometry(surface, "production-world", issues);
    validateCollisionFootprintDuplicates(world.surfaces, issues);
    validateAccessModuleAuthority(world, issues);
    validateSectorRecallContracts(world, surfaceIndex, issues);
    const progressGateReports = validateProgressGates(world, areaIndex, issues);

    for (const entry of runtimeEntries) {
        const spec = readJson(entry.sourcePath);
        collectForbiddenKeys(spec, entry.sourcePath, issues);
        const validation = validateAreaSpecV2(spec, { file: entry.sourcePath, registry: EMPTY_AREA_BEHAVIOR_REGISTRY });
        issues.push(...validation.issues);
        validateEditorEntityCoverage(spec, issues);
        const generatedArea = areaIndex[entry.areaId];
        const compiledArea = createAreaDefinitionFromV2(spec);
        const firstRoutePoint = compiledArea.routePoints[0];
        const entryRouteDistance = firstRoutePoint
            ? Math.hypot(compiledArea.entry.x - firstRoutePoint.x, compiledArea.entry.y - firstRoutePoint.y)
            : Number.POSITIVE_INFINITY;
        const sectorNumber = Number(entry.stageId.split("-")[0]);
        const validatesPromotedEntry =
            sectorNumber >= PROMOTED_STAGE_ENTRY_SECTOR_RANGE.first &&
            sectorNumber <= PROMOTED_STAGE_ENTRY_SECTOR_RANGE.last;
        if (validatesPromotedEntry && entryRouteDistance > BASE_ROPE_REACH) {
            issue(issues, "runtime-entry-route-out-of-reach", {
                stageId: entry.stageId,
                distance: entryRouteDistance,
                budget: BASE_ROPE_REACH
            });
        }
        const entryComponent = AreaEntryEditorComponent.from(compiledArea);
        if (validatesPromotedEntry && (!entryComponent || entryComponent.supportSurface.renderable === false)) {
            issue(issues, "runtime-entry-visible-support-missing", {
                stageId: entry.stageId,
                supportSurfaceId: entryComponent?.supportSurface.id ?? null
            });
        }
        if (
            !generatedArea ||
            JSON.stringify(canonicalizeAreaSpecV2(generatedArea)) !==
                JSON.stringify(canonicalizeAreaSpecV2(compiledArea))
        ) {
            issue(issues, "generated-stage-semantics-mismatch", { stageId: entry.stageId, areaId: entry.areaId });
        }
        const landmark = landmarkIndex[entry.stageId];
        if (!landmark || landmark.areaId !== entry.areaId) {
            issue(issues, "runtime-landmark-mismatch", { stageId: entry.stageId, areaId: entry.areaId });
            continue;
        }
        const expectedRuntimeObjectIds = generatedArea.objects
            .filter(({ enemyType, enemySelection, kind }) => !enemyType && !enemySelection && kind !== "sentry")
            .map(({ id }) => id);
        if (JSON.stringify(landmark.objectIds) !== JSON.stringify(expectedRuntimeObjectIds)) {
            issue(issues, "runtime-stage-object-mismatch", {
                stageId: entry.stageId,
                expected: expectedRuntimeObjectIds,
                actual: landmark.objectIds
            });
        }
        const authoredSurfaces = generatedArea?.surfaces ?? [];
        const expectedSurfaceIndex = Object.freeze(
            Object.fromEntries(
                authoredSurfaces.map((surface) => [shiftedSemanticSurface(surface, landmark).id, surface])
            )
        );
        const runtimeStageSurfaceIds = landmark.surfaceIds;
        const runtimeStageSurfaceIndex = Object.freeze(
            Object.fromEntries(runtimeStageSurfaceIds.map((surfaceId) => [surfaceId, surfaceIndex[surfaceId]]))
        );
        const missingIds = Object.keys(expectedSurfaceIndex).filter(
            (surfaceId) => !runtimeStageSurfaceIndex[surfaceId]
        );
        const derivedIds = runtimeStageSurfaceIds.filter((surfaceId) => !expectedSurfaceIndex[surfaceId]);
        const mismatchIds = [];
        for (const [surfaceId, surface] of Object.entries(expectedSurfaceIndex)) {
            const runtimeSurface = runtimeStageSurfaceIndex[surfaceId];
            if (
                runtimeSurface &&
                JSON.stringify(shiftedSemanticSurface(surface, landmark)) !==
                    JSON.stringify(semanticSurface(runtimeSurface))
            ) {
                mismatchIds.push(surfaceId);
            }
        }
        if (missingIds.length > 0 || mismatchIds.length > 0) {
            issue(issues, "runtime-stage-surface-mismatch", { stageId: entry.stageId, missingIds, mismatchIds });
        }
        if (derivedIds.length > 0) {
            issue(issues, "runtime-stage-derived-surface-mismatch", {
                stageId: entry.stageId,
                unexpectedIds: derivedIds
            });
        }
        const progressGatedIds = progressGateReports[entry.stageId] ?? Object.freeze([]);
        reports.push(
            Object.freeze({
                stageId: entry.stageId,
                authored: authoredSurfaces.length,
                derived: derivedIds.length,
                hidden: authoredSurfaces.filter(({ renderable }) => renderable === false).length,
                progressGated: progressGatedIds.length,
                progressGatedIds,
                entryRouteDistance,
                entrySupportSurfaceId: entryComponent?.supportSurface.id ?? null,
                missingIds: Object.freeze(missingIds),
                mismatchIds: Object.freeze(mismatchIds),
                unexpectedDerivedIds: Object.freeze(derivedIds)
            })
        );
    }
    validateStageTransitions(world, indexBy(world.landmarks, "id", issues, "runtime-landmark-id-duplicate"), issues);
    return Object.freeze(reports);
}

export function validateProductionMapParity() {
    const issues = [];
    const editorCatalog = readJson(editorCatalogPath);
    const catalogValidation = validateEditorCatalog(editorCatalog, issues);
    validateRuntimeSourceImports(issues);
    const world = createAuthoredSeamlessSectorRuntimeWorld({ seed: 1 });
    if (world.landmarks.length !== RUNTIME_STAGE_COUNT || world.stageIdentities.length !== RUNTIME_STAGE_COUNT) {
        issue(issues, "production-runtime-stage-count", {
            expected: RUNTIME_STAGE_COUNT,
            landmarks: world.landmarks.length,
            stageIdentities: world.stageIdentities.length
        });
    }
    validateScenarioExclusion({ scenarioEntries: catalogValidation.scenarioEntries, world, issues });
    validateBossStageFlow(world, issues);
    validateContentBoundaryProgress(world, issues);
    validateSector04QuorumCollision(world, issues);
    const reports = validateRuntimeStages({ runtimeEntries: catalogValidation.runtimeEntries, world, issues });
    return Object.freeze({ valid: issues.length === 0, reports, issues: Object.freeze(issues) });
}

export function main() {
    const result = validateProductionMapParity();
    for (const report of result.reports) {
        console.log(
            `${report.stageId}: authored=${report.authored} derived=${report.derived} hidden=${report.hidden} ` +
                `entry-route=${report.entryRouteDistance.toFixed(2)} support=${report.entrySupportSurfaceId} ` +
                `progress-gated=${report.progressGated}[${report.progressGatedIds.join(",")}] ` +
                `authored-missing=[${report.missingIds.join(",")}] authored-mismatch=[${report.mismatchIds.join(",")}] ` +
                `derived-unexpected=[${report.unexpectedDerivedIds.join(",")}]`
        );
    }
    if (!result.valid) {
        for (const entry of result.issues) console.error(`- ${entry.code}: ${JSON.stringify(entry)}`);
        process.exitCode = 1;
        return;
    }
    console.log("Production map parity passed: 48 Runtime generated Stage(s), 0 scenario-only Stage(s).");
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
