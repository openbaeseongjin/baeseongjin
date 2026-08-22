import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { GRAPPLE_LINK_BUDGET } from "../src/game/config.js";
import { EMPTY_AREA_BEHAVIOR_REGISTRY } from "../src/game/world/area-authoring-v2/AreaBehaviorRegistry.js";
import { canonicalizeAreaSpecV2, createAreaDefinitionFromV2 } from "../src/game/world/area-authoring-v2/AreaSpecV2.js";
import { validateAreaSpecV2 } from "../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../src/game/world/areas/sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "../src/game/world/areas/sector03/Sector03AreaCatalog.js";
import { AUTHORED_SECTOR_CATALOG } from "../src/game/world/sectors/AuthoredSectorCatalog.js";
import { createAuthoredSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/AuthoredSeamlessSectorRuntime.js";
import { SectorProgressState } from "../src/game/world/SectorProgressState.js";
import {
    collisionSurfacesForSectorProgress,
    isSurfaceEnabledForProgress
} from "../src/game/world/WorldGateGeometry.js";

const projectRoot = resolve(process.cwd());
const editorCatalogPath = "docs/bsh/scenario/AREA-EDITOR-CATALOG.json";
const runtimeCatalogs = Object.freeze([SECTOR_01_AREA_CATALOG, SECTOR_02_AREA_CATALOG, SECTOR_03_AREA_CATALOG]);
const RUNTIME_STAGE_COUNT = 24;
const SCENARIO_STAGE_COUNT = 24;
const TOTAL_STAGE_COUNT = RUNTIME_STAGE_COUNT + SCENARIO_STAGE_COUNT;
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
const ACCESS_MODULE_REQUIREMENT = 3;
const SEAMLESS_WIDTH = 4800;
const CITY_WING_INSET = 96;
const CITY_WING_CORE_GAP = 64;
const CITY_WING_THICKNESS = 32;
const TRANSIT_BARRIER_THICKNESS = 24;
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

function rectangleVertices({ x, y, width, height }) {
    return [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
    ];
}

function horizontalSurface(id, landmark, x, topY, width, kind) {
    return {
        id,
        kind,
        landmarkId: landmark.id,
        stageId: landmark.stageId,
        oneWay: true,
        oneWayEdgeEnd: 1,
        grappleable: true,
        x,
        y: topY,
        width,
        height: CITY_WING_THICKNESS,
        topY,
        position: { x: x + width * 0.5, y: topY },
        vertices: rectangleVertices({ x, y: topY, width, height: CITY_WING_THICKNESS })
    };
}

function sameSurfaceBounds(left, right) {
    const leftVertices = left.vertices;
    const rightVertices = right.vertices;
    return JSON.stringify(leftVertices) === JSON.stringify(rightVertices);
}

function expectedCityWingSurfaces({ area, landmark, landmarkIndex, inheritedEntrySurfaces }) {
    const halfWidth = SEAMLESS_WIDTH * 0.5;
    const coreLeft = -area.bounds.width * 0.5;
    const coreRight = coreLeft + area.bounds.width;
    const coreTop = landmark.origin.y - area.bounds.height;
    const leftStart = -halfWidth + CITY_WING_INSET;
    const rightStart = coreRight + CITY_WING_CORE_GAP;
    const leftWidth = coreLeft - CITY_WING_CORE_GAP - leftStart;
    const rightWidth = halfWidth - CITY_WING_INSET - rightStart;
    const middleY = Math.round((coreTop + area.bounds.height * 0.52) / 32) * 32;
    const leftMid = landmarkIndex % 2 === 0;
    const surfaces = [];
    for (const [side, start, width] of [
        ["left", leftStart, leftWidth],
        ["right", rightStart, rightWidth]
    ]) {
        if (width <= 0) continue;
        const entry = horizontalSurface(
            `${landmark.id}:city-wing:${side}:entry`,
            landmark,
            start,
            landmark.entry.y + 32,
            width,
            "safe-deck"
        );
        if (!inheritedEntrySurfaces.some((surface) => sameSurfaceBounds(surface, entry))) surfaces.push(entry);
        surfaces.push(
            horizontalSurface(
                `${landmark.id}:city-wing:${side}:exit`,
                landmark,
                start,
                landmark.exit.y + 32,
                width,
                "recovery"
            )
        );
    }
    const midInset = leftMid ? 256 : 96;
    const midStart = (leftMid ? leftStart : rightStart) + midInset;
    const midWidth = (leftMid ? leftWidth : rightWidth) - midInset * 2;
    if (midWidth > 0) {
        surfaces.push(
            horizontalSurface(
                `${landmark.id}:city-wing:${leftMid ? "left" : "right"}:mid`,
                landmark,
                midStart,
                middleY,
                midWidth,
                "safe-deck"
            )
        );
    }
    return Object.freeze(surfaces);
}

function validateEditorCatalog(editorCatalog, issues) {
    if (editorCatalog?.schemaVersion !== "area-editor-catalog-v2" || !Array.isArray(editorCatalog.stages)) {
        issue(issues, "editor-catalog-invalid");
        return Object.freeze({ runtimeEntries: [], scenarioEntries: [] });
    }
    collectForbiddenKeys(editorCatalog, editorCatalogPath, issues);
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
        const expectedMode = sector <= 3 ? "runtime-generated" : "scenario-only";
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

function walkingSurfaceAt(surfaces, point) {
    return surfaces
        .filter((surface) => {
            const bounds = surfaceBounds(surface);
            return surface.topY === point.y + 32 && bounds.x <= point.x && bounds.x + bounds.width >= point.x;
        })
        .sort((left, right) => surfaceBounds(left).width - surfaceBounds(right).width)[0];
}

function expectedConnectorSurface(connector, supportingSurfaces) {
    const thickness = 32;
    const sourceSupport = walkingSurfaceAt(supportingSurfaces, connector.start);
    const targetSupport = walkingSurfaceAt(supportingSurfaces, connector.end);
    let vertices;
    if (connector.start.y === connector.end.y && sourceSupport && targetSupport) {
        const sourceBounds = surfaceBounds(sourceSupport);
        const targetBounds = surfaceBounds(targetSupport);
        const leftSupport = sourceBounds.x < targetBounds.x ? sourceBounds : targetBounds;
        const rightSupport = leftSupport === sourceBounds ? targetBounds : sourceBounds;
        const left = leftSupport.x + leftSupport.width;
        const right = rightSupport.x;
        if (right <= left) return null;
        const top = connector.start.y + 32;
        vertices = rectangleVertices({ x: left, y: top, width: right - left, height: thickness });
    } else {
        const dx = connector.end.x - connector.start.x;
        const dy = connector.end.y - connector.start.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const normalX = (-dy / length) * thickness * 0.5;
        const normalY = (dx / length) * thickness * 0.5;
        vertices = [
            { x: connector.start.x + normalX, y: connector.start.y + normalY },
            { x: connector.end.x + normalX, y: connector.end.y + normalY },
            { x: connector.end.x - normalX, y: connector.end.y - normalY },
            { x: connector.start.x - normalX, y: connector.start.y - normalY }
        ];
    }
    const bounds = {
        x: Math.min(...vertices.map(({ x }) => x)),
        y: Math.min(...vertices.map(({ y }) => y)),
        width: Math.max(...vertices.map(({ x }) => x)) - Math.min(...vertices.map(({ x }) => x)),
        height: Math.max(...vertices.map(({ y }) => y)) - Math.min(...vertices.map(({ y }) => y))
    };
    return {
        id: connector.surfaceId,
        kind: "sector-seam",
        landmarkId: connector.sourceLandmarkId,
        oneWay: false,
        grappleable: true,
        ...bounds,
        topY: bounds.y,
        position: {
            x: (connector.start.x + connector.end.x) * 0.5,
            y: (connector.start.y + connector.end.y) * 0.5
        },
        vertices
    };
}

function expectedTransitBarrierSurfaces(lock, source, target) {
    const boundaryY = source.bounds.y;
    const overlapBottom = Math.min(source.bounds.y + source.bounds.height, target.bounds.y + target.bounds.height);
    const pathX = (source.exit.x + target.entry.x) * 0.5;
    const segments = [
        {
            x: source.bounds.x - GRAPPLE_LINK_BUDGET,
            y: boundaryY,
            width: source.bounds.width + GRAPPLE_LINK_BUDGET * 2,
            height: TRANSIT_BARRIER_THICKNESS
        },
        {
            x: pathX - TRANSIT_BARRIER_THICKNESS * 0.5,
            y: boundaryY,
            width: TRANSIT_BARRIER_THICKNESS,
            height: Math.max(TRANSIT_BARRIER_THICKNESS, overlapBottom - boundaryY)
        }
    ];
    return segments.map((bounds, index) => ({
        id: `${lock.id}:barrier:${index + 1}`,
        kind: "sector-transit-barrier",
        landmarkId: source.id,
        oneWay: false,
        grappleable: false,
        renderable: false,
        blockedByRouteId: lock.id,
        ...bounds,
        topY: bounds.y,
        position: { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 },
        vertices: rectangleVertices(bounds)
    }));
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

function assertTransitMatrixState({ label, lock, barriers, progress, world, expectedEnabled, issues }) {
    const activeIndex = progressSurfaceIndex(world, progress);
    if (progress.isRouteUnlocked(lock.id) === expectedEnabled) {
        issue(issues, "transit-matrix-route-state", { routeId: lock.id, label, expectedEnabled });
    }
    for (const barrier of barriers) {
        const active = Boolean(activeIndex[barrier.id]);
        const enabled = isSurfaceEnabledForProgress(barrier, progress);
        if (active !== expectedEnabled || enabled !== expectedEnabled) {
            issue(issues, "transit-matrix-barrier-state", {
                routeId: lock.id,
                surfaceId: barrier.id,
                label,
                expectedEnabled,
                active,
                enabled
            });
        }
    }
    return activeIndex;
}

function validateProgressGates(world, surfaceIndex, areaIndex, issues) {
    const reports = Object.create(null);
    for (const lock of world.routeLocks.filter(({ requiredAccessModuleCount }) => requiredAccessModuleCount > 0)) {
        const source = world.landmarks.find(({ id }) => id === lock.sourceLandmarkId);
        const target = world.landmarks.find(({ id }) => id === lock.targetLandmarkId);
        const sector = world.sectors.find(({ id }) => id === source.sectorId);
        const area = areaIndex[source.areaId];
        const objectiveIdBySourceId = Object.freeze(
            Object.fromEntries(area.objectives.map((objective, index) => [objective.id, source.objectiveIds[index]]))
        );
        const expectedRequiredObjectiveIds = area.gate.requiredObjectiveIds.map(
            (objectiveId) => objectiveIdBySourceId[objectiveId]
        );
        if (
            lock.requiredAccessModuleCount !== ACCESS_MODULE_REQUIREMENT ||
            sector.accessModuleRequirement !== ACCESS_MODULE_REQUIREMENT ||
            sector.accessModuleIds.length !== ACCESS_MODULE_REQUIREMENT
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
        const expectedBarriers = expectedTransitBarrierSurfaces(lock, source, target);
        for (const expected of expectedBarriers) {
            const actual = surfaceIndex[expected.id];
            if (!actual || JSON.stringify(semanticSurface(expected)) !== JSON.stringify(semanticSurface(actual))) {
                issue(issues, "transit-barrier-semantics-mismatch", { routeId: lock.id, surfaceId: expected.id });
            }
        }

        const objectiveOnly = new SectorProgressState(world);
        completeLandmarkObjectives(objectiveOnly, source);
        const objectiveOnlyIndex = assertTransitMatrixState({
            label: "objective-only",
            lock,
            barriers: expectedBarriers,
            progress: objectiveOnly,
            world,
            expectedEnabled: true,
            issues
        });
        for (let count = 1; count <= 2; count += 1) {
            objectiveOnly.collectAccessModule(sector.accessModuleIds[count - 1]);
            assertTransitMatrixState({
                label: `objective+${count}/3`,
                lock,
                barriers: expectedBarriers,
                progress: objectiveOnly,
                world,
                expectedEnabled: true,
                issues
            });
        }

        const modulesOnly = new SectorProgressState(world);
        for (const moduleId of sector.accessModuleIds) modulesOnly.collectAccessModule(moduleId);
        assertTransitMatrixState({
            label: "3/3-only",
            lock,
            barriers: expectedBarriers,
            progress: modulesOnly,
            world,
            expectedEnabled: true,
            issues
        });

        objectiveOnly.collectAccessModule(sector.accessModuleIds[2]);
        const unlockedIndex = assertTransitMatrixState({
            label: "objective+3/3",
            lock,
            barriers: expectedBarriers,
            progress: objectiveOnly,
            world,
            expectedEnabled: false,
            issues
        });
        for (const [surfaceId, surface] of Object.entries(objectiveOnlyIndex)) {
            if (expectedBarriers.some(({ id }) => id === surfaceId)) continue;
            const unlockedSurface = unlockedIndex[surfaceId];
            if (
                !unlockedSurface ||
                JSON.stringify(semanticSurface(surface)) !== JSON.stringify(semanticSurface(unlockedSurface))
            ) {
                issue(issues, "progress-unrelated-surface-drift", { routeId: lock.id, surfaceId });
            }
        }
        const removedIds = Object.keys(objectiveOnlyIndex).filter((surfaceId) => !unlockedIndex[surfaceId]);
        const expectedRemovedIds = expectedBarriers.map(({ id }) => id);
        if (JSON.stringify(removedIds) !== JSON.stringify(expectedRemovedIds)) {
            issue(issues, "transit-unlock-removal-mismatch", {
                routeId: lock.id,
                expected: expectedRemovedIds,
                actual: removedIds
            });
        }
        reports[source.stageId] = Object.freeze(expectedBarriers.map(({ id }) => id));
    }
    return Object.freeze(reports);
}

function validateSeams(world, landmarkIndex, surfaceIndex, issues) {
    const connectorIndex = indexBy(world.connectors, "id", issues, "connector-duplicate");
    const routeLockIndex = indexBy(world.routeLocks, "id", issues, "route-lock-duplicate");
    if (world.connectors.length !== RUNTIME_STAGE_COUNT - 1 || world.routeLocks.length !== RUNTIME_STAGE_COUNT - 1) {
        issue(issues, "seam-count-mismatch", {
            expected: RUNTIME_STAGE_COUNT - 1,
            connectors: world.connectors.length,
            routeLocks: world.routeLocks.length
        });
    }
    const supportingSurfaces = world.surfaces.filter(
        ({ kind }) => kind !== "sector-seam" && kind !== "sector-transit-barrier"
    );
    for (const connector of Object.values(connectorIndex)) {
        const source = landmarkIndex[connector.sourceLandmarkId];
        const target = landmarkIndex[connector.targetLandmarkId];
        const lock = routeLockIndex[connector.routeLockId];
        if (!source || !target || !lock) issue(issues, "seam-owner-missing", { connectorId: connector.id });
        if (
            lock?.sourceLandmarkId !== connector.sourceLandmarkId ||
            lock?.targetLandmarkId !== connector.targetLandmarkId ||
            lock?.connectorId !== connector.id
        ) {
            issue(issues, "seam-lock-owner-mismatch", { connectorId: connector.id });
        }
        if (connector.surfaceId) {
            const surface = surfaceIndex[connector.surfaceId];
            if (!surface || surface.kind !== "sector-seam" || surface.landmarkId !== connector.sourceLandmarkId) {
                issue(issues, "seam-surface-owner-mismatch", {
                    connectorId: connector.id,
                    surfaceId: connector.surfaceId
                });
            }
        }
        const expectedSurface = expectedConnectorSurface(connector, supportingSurfaces);
        if (Boolean(expectedSurface) !== Boolean(connector.surfaceId)) {
            issue(issues, "seam-surface-presence-mismatch", { connectorId: connector.id });
        } else if (
            expectedSurface &&
            JSON.stringify(semanticSurface(expectedSurface)) !==
                JSON.stringify(semanticSurface(surfaceIndex[connector.surfaceId]))
        ) {
            issue(issues, "seam-surface-semantics-mismatch", {
                connectorId: connector.id,
                surfaceId: connector.surfaceId
            });
        }
        if (
            source &&
            target &&
            (connector.start.x !== source.exit.x ||
                connector.start.y !== source.exit.y ||
                connector.end.x !== target.entry.x ||
                connector.end.y !== target.entry.y)
        ) {
            issue(issues, "seam-endpoint-mismatch", { connectorId: connector.id });
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
    const progressGateReports = validateProgressGates(world, surfaceIndex, areaIndex, issues);
    let inheritedEntrySurfaces = Object.freeze([]);
    let previousSectorId = null;

    for (const entry of runtimeEntries) {
        const spec = readJson(entry.sourcePath);
        collectForbiddenKeys(spec, entry.sourcePath, issues);
        const validation = validateAreaSpecV2(spec, { file: entry.sourcePath, registry: EMPTY_AREA_BEHAVIOR_REGISTRY });
        issues.push(...validation.issues);
        const generatedArea = areaIndex[entry.areaId];
        const compiledArea = createAreaDefinitionFromV2(spec);
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
        if (landmark.sectorId !== previousSectorId) inheritedEntrySurfaces = Object.freeze([]);
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
        const expectedDerivedSurfaces = expectedCityWingSurfaces({
            area: generatedArea,
            landmark,
            landmarkIndex: landmark.landmarkOrder - 1,
            inheritedEntrySurfaces
        });
        inheritedEntrySurfaces = Object.freeze(expectedDerivedSurfaces.filter(({ id }) => id.endsWith(":exit")));
        previousSectorId = landmark.sectorId;
        const expectedDerivedIndex = Object.freeze(
            Object.fromEntries(expectedDerivedSurfaces.map((surface) => [surface.id, surface]))
        );
        const derivedMissingIds = Object.keys(expectedDerivedIndex).filter(
            (surfaceId) => !runtimeStageSurfaceIndex[surfaceId]
        );
        const unexpectedDerivedIds = derivedIds.filter((surfaceId) => !expectedDerivedIndex[surfaceId]);
        const derivedMismatchIds = Object.entries(expectedDerivedIndex)
            .filter(([surfaceId, expected]) => {
                const actual = runtimeStageSurfaceIndex[surfaceId];
                return actual && JSON.stringify(semanticSurface(expected)) !== JSON.stringify(semanticSurface(actual));
            })
            .map(([surfaceId]) => surfaceId);
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
        if (derivedMissingIds.length > 0 || unexpectedDerivedIds.length > 0 || derivedMismatchIds.length > 0) {
            issue(issues, "runtime-stage-derived-surface-mismatch", {
                stageId: entry.stageId,
                missingIds: derivedMissingIds,
                unexpectedIds: unexpectedDerivedIds,
                mismatchIds: derivedMismatchIds
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
                missingIds: Object.freeze(missingIds),
                mismatchIds: Object.freeze(mismatchIds),
                derivedMissingIds: Object.freeze(derivedMissingIds),
                unexpectedDerivedIds: Object.freeze(unexpectedDerivedIds),
                derivedMismatchIds: Object.freeze(derivedMismatchIds)
            })
        );
    }
    validateSeams(world, indexBy(world.landmarks, "id", issues, "runtime-landmark-id-duplicate"), surfaceIndex, issues);
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
    const reports = validateRuntimeStages({ runtimeEntries: catalogValidation.runtimeEntries, world, issues });
    return Object.freeze({ valid: issues.length === 0, reports, issues: Object.freeze(issues) });
}

export function main() {
    const result = validateProductionMapParity();
    for (const report of result.reports) {
        console.log(
            `${report.stageId}: authored=${report.authored} derived=${report.derived} hidden=${report.hidden} ` +
                `progress-gated=${report.progressGated}[${report.progressGatedIds.join(",")}] ` +
                `authored-missing=[${report.missingIds.join(",")}] authored-mismatch=[${report.mismatchIds.join(",")}] ` +
                `derived-missing=[${report.derivedMissingIds.join(",")}] ` +
                `derived-unexpected=[${report.unexpectedDerivedIds.join(",")}] ` +
                `derived-mismatch=[${report.derivedMismatchIds.join(",")}]`
        );
    }
    if (!result.valid) {
        for (const entry of result.issues) console.error(`- ${entry.code}: ${JSON.stringify(entry)}`);
        process.exitCode = 1;
        return;
    }
    console.log("Production map parity passed: 24 Runtime generated Stage(s), 24 scenario-only Stage(s), 23 seam(s).");
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
