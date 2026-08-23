import { assembleAuthoredWorld } from "../AuthoredWorldAssembler.js";
import { defineAreaCatalog } from "../areas/AreaDefinition.js";
import { SECTOR_01_AREA_CATALOG } from "../areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../areas/sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "../areas/sector03/Sector03AreaCatalog.js";
import { SECTOR_04_AREA_CATALOG } from "../areas/sector04/Sector04AreaCatalog.js";
import { SECTOR_05_AREA_CATALOG } from "../areas/sector05/Sector05AreaCatalog.js";
import { SECTOR_06_AREA_CATALOG } from "../areas/sector06/Sector06AreaCatalog.js";
import { AUTHORED_SECTOR_CATALOG, buildAuthoredSectorCatalog } from "./AuthoredSectorCatalog.js";
import { STAGE_SAVE_POINT_CULL_RADIUS, stageSavePointBounds } from "../StageSavePointGeometry.js";
import { GRAPPLE_LINK_BUDGET, ROPE_CONFIG, ropeHookReach } from "../../config.js";
import { BOSS_STAGE_CATALOG } from "../../boss-authoring/BossStageCatalog.js";
import { BOSS_ANCHOR_ROLE } from "../../boss-authoring/BossStageSpec.js";
import { isAuthoredRuntimeContentBoundary } from "../area-authoring-v2/AreaRuntimePromotion.js";
import { ACCESS_MODULE_SOURCE_KIND } from "./SectorDefinition.js";

export const SEAMLESS_SECTOR_RUNTIME_REVISION = "seamless-sector-runtime-v12-multi-boss-stage";
export const SEAMLESS_SECTOR_RUNTIME_WIDTH = 4800;
export const SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT = 9600;

const DEFAULT_AUTHORED_AREA_CATALOGS = Object.freeze([
    SECTOR_01_AREA_CATALOG,
    SECTOR_02_AREA_CATALOG,
    SECTOR_03_AREA_CATALOG,
    SECTOR_04_AREA_CATALOG,
    SECTOR_05_AREA_CATALOG,
    SECTOR_06_AREA_CATALOG
]);
const BOSS_ARENA_ISOLATION_X = 7000;
export const SEAMLESS_SECTOR_RUNTIME_HEIGHT_BUDGET_BY_ID = Object.freeze({
    "sector-01": SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT,
    "sector-02": SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT,
    "sector-03": 12416,
    "sector-04": 18432,
    "sector-05": 22528,
    "sector-06": 16384
});
const SECTOR_HALF_WIDTH = SEAMLESS_SECTOR_RUNTIME_WIDTH * 0.5;
const CITY_WING_INSET = 96;
const CITY_WING_CORE_GAP = 64;
const CITY_WING_THICKNESS = 32;
export const CONTENT_BOUNDARY_ISOLATION_GAP =
    Math.max(...Object.values(SEAMLESS_SECTOR_RUNTIME_HEIGHT_BUDGET_BY_ID)) +
    ropeHookReach(ROPE_CONFIG) +
    GRAPPLE_LINK_BUDGET;
const TRANSIT_BARRIER_THICKNESS = 24;
const TRANSIT_BARRIER_LATERAL_MARGIN = GRAPPLE_LINK_BUDGET;
const AREA_BOUNDARY_KIND_LOOKUP = Object.freeze({
    "area-boundary-wall": true,
    "inter-floor-divider": true
});
const ENEMY_OBJECT_KIND_LOOKUP = Object.freeze({
    sentry: true,
    "patrol-drone": true
});
const STAGE_DOOR_KIND_LOOKUP = Object.freeze({
    gate: true,
    "gate-panel": true
});

function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

function shiftPoint(value, dx, dy) {
    return freezeValue({ ...value, x: value.x + dx, y: value.y + dy });
}

function shiftBounds(value, dx, dy) {
    return freezeValue({ ...value, x: value.x + dx, y: value.y + dy });
}

function shiftPatrol(patrol, dx, dy) {
    if (!patrol) return null;
    return freezeValue({
        ...patrol,
        ...(patrol.points ? { points: patrol.points.map((point) => shiftPoint(point, dx, dy)) } : {}),
        ...(patrol.route ? { route: patrol.route.map((point) => shiftPoint(point, dx, dy)) } : {}),
        ...(patrol.corridor
            ? {
                  corridor: {
                      start: shiftPoint(patrol.corridor.start, dx, dy),
                      end: shiftPoint(patrol.corridor.end, dx, dy)
                  }
              }
            : {})
    });
}

function withoutAreaAuthority(value, properties) {
    const { areaId: _areaId, ...rest } = value;
    return freezeValue({ ...rest, ...properties });
}

function shiftSurface(surface, dx, dy, landmark, sourceAreaId, objectiveIdBySourceId = {}) {
    return withoutAreaAuthority(surface, {
        id: surface.id.startsWith(`${sourceAreaId}:`) ? surface.id : `${sourceAreaId}:${surface.id}`,
        landmarkId: landmark.id,
        stageId: landmark.stageId,
        x: surface.x + dx,
        y: surface.y + dy,
        topY: surface.topY + dy,
        ...(surface.position ? { position: shiftPoint(surface.position, dx, dy) } : {}),
        ...(surface.blockedByObjectiveId
            ? {
                  blockedByObjectiveId:
                      objectiveIdBySourceId[surface.blockedByObjectiveId] ?? surface.blockedByObjectiveId
              }
            : {}),
        vertices: surface.vertices.map((vertex) => shiftPoint(vertex, dx, dy))
    });
}

function shiftObject(object, dx, dy, landmark, objectiveIdBySourceId, routeLockId) {
    const { areaId: _areaId, gateId: _gateId, ...rest } = object;
    return freezeValue({
        ...rest,
        landmarkId: landmark.id,
        stageId: landmark.stageId,
        position: shiftPoint(object.position, dx, dy),
        ...(object.bounds ? { bounds: shiftBounds(object.bounds, dx, dy) } : {}),
        ...(object.activation ? { activation: shiftBounds(object.activation, dx, dy) } : {}),
        ...(object.patrol ? { patrol: shiftPatrol(object.patrol, dx, dy) } : {}),
        ...(object.objectiveId ? { objectiveId: objectiveIdBySourceId[object.objectiveId] ?? object.objectiveId } : {}),
        ...(_gateId && routeLockId ? { routeLockId } : {})
    });
}

function walkingSurfaceAt(surfaces, point) {
    return surfaces
        .filter(
            (surface) => surface.topY === point.y + 32 && surface.x <= point.x && surface.x + surface.width >= point.x
        )
        .sort((left, right) => left.width - right.width)[0];
}

function horizontalConnectorVertices(start, end, surfaces, thickness) {
    if (start.y !== end.y) return undefined;
    const sourceSupport = walkingSurfaceAt(surfaces, start);
    const targetSupport = walkingSurfaceAt(surfaces, end);
    if (!sourceSupport || !targetSupport) return undefined;
    const leftSupport = sourceSupport.x < targetSupport.x ? sourceSupport : targetSupport;
    const rightSupport = leftSupport === sourceSupport ? targetSupport : sourceSupport;
    const left = leftSupport.x + leftSupport.width;
    const right = rightSupport.x;
    if (right <= left) return [];
    const top = start.y + 32;
    return [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: top + thickness },
        { x: left, y: top + thickness }
    ];
}

function connectorSurface(id, sourceLandmarkId, start, end, supportingSurfaces) {
    const thickness = 32;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const normalX = (-dy / length) * thickness * 0.5;
    const normalY = (dx / length) * thickness * 0.5;
    const horizontalVertices = horizontalConnectorVertices(start, end, supportingSurfaces, thickness);
    if (horizontalVertices?.length === 0) return null;
    const vertices = horizontalVertices ?? [
        { x: start.x + normalX, y: start.y + normalY },
        { x: end.x + normalX, y: end.y + normalY },
        { x: end.x - normalX, y: end.y - normalY },
        { x: start.x - normalX, y: start.y - normalY }
    ];
    const left = Math.min(...vertices.map(({ x }) => x));
    const right = Math.max(...vertices.map(({ x }) => x));
    const top = Math.min(...vertices.map(({ y }) => y));
    const bottom = Math.max(...vertices.map(({ y }) => y));
    return freezeValue({
        id,
        kind: "sector-seam",
        landmarkId: sourceLandmarkId,
        oneWay: false,
        grappleable: true,
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        topY: top,
        position: { x: (start.x + end.x) * 0.5, y: (start.y + end.y) * 0.5 },
        vertices
    });
}

function rectangleVertices(bounds) {
    return [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height }
    ];
}

function transitBarrierGeometry(lock, sourceLandmark, targetLandmark) {
    const boundaryY = sourceLandmark.bounds.y;
    const overlapBottom = Math.min(
        sourceLandmark.bounds.y + sourceLandmark.bounds.height,
        targetLandmark.bounds.y + targetLandmark.bounds.height
    );
    const pathX = (sourceLandmark.exit.x + targetLandmark.entry.x) * 0.5;
    const segments = [
        {
            x: sourceLandmark.bounds.x - TRANSIT_BARRIER_LATERAL_MARGIN,
            y: boundaryY,
            width: sourceLandmark.bounds.width + TRANSIT_BARRIER_LATERAL_MARGIN * 2,
            height: TRANSIT_BARRIER_THICKNESS
        },
        {
            x: pathX - TRANSIT_BARRIER_THICKNESS * 0.5,
            y: boundaryY,
            width: TRANSIT_BARRIER_THICKNESS,
            height: Math.max(TRANSIT_BARRIER_THICKNESS, overlapBottom - boundaryY)
        }
    ];
    const left = Math.min(...segments.map(({ x }) => x));
    const top = Math.min(...segments.map(({ y }) => y));
    const right = Math.max(...segments.map(({ x, width }) => x + width));
    const bottom = Math.max(...segments.map(({ y, height }) => y + height));
    const surfaces = segments.map((bounds, index) =>
        freezeValue({
            id: `${lock.id}:barrier:${index + 1}`,
            kind: "sector-transit-barrier",
            landmarkId: sourceLandmark.id,
            oneWay: false,
            grappleable: false,
            renderable: false,
            blockedByRouteId: lock.id,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            topY: bounds.y,
            position: { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 },
            vertices: rectangleVertices(bounds)
        })
    );
    return freezeValue({
        segments,
        surfaces,
        presentationBounds: { x: left, y: top, width: right - left, height: bottom - top }
    });
}

function horizontalSurface(id, landmark, x, topY, width, kind) {
    return freezeValue({
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
        vertices: [
            { x, y: topY },
            { x: x + width, y: topY },
            { x: x + width, y: topY + CITY_WING_THICKNESS },
            { x, y: topY + CITY_WING_THICKNESS }
        ]
    });
}

function wideLandmarkBounds(coreBounds) {
    return freezeValue({
        x: -SECTOR_HALF_WIDTH,
        y: coreBounds.y,
        width: SEAMLESS_SECTOR_RUNTIME_WIDTH,
        height: coreBounds.height
    });
}

function routeMouthBounds(exit) {
    return freezeValue({
        x: exit.x - 96,
        y: exit.y - 64,
        width: 192,
        height: 112
    });
}

function sameSurfaceBounds(left, right) {
    return left.x === right.x && left.y === right.y && left.width === right.width && left.height === right.height;
}

function cityWingSurfaces({ landmark, coreBounds, entry, exit, landmarkIndex, inheritedEntrySurfaces }) {
    const leftWingStart = -SECTOR_HALF_WIDTH + CITY_WING_INSET;
    const leftWingEnd = coreBounds.x - CITY_WING_CORE_GAP;
    const rightWingStart = coreBounds.x + coreBounds.width + CITY_WING_CORE_GAP;
    const rightWingEnd = SECTOR_HALF_WIDTH - CITY_WING_INSET;
    const leftWingWidth = leftWingEnd - leftWingStart;
    const rightWingWidth = rightWingEnd - rightWingStart;
    const middleY = Math.round((coreBounds.y + coreBounds.height * 0.52) / 32) * 32;
    const leftMid = landmarkIndex % 2 === 0;
    const surfaces = [];
    for (const [side, start, width] of [
        ["left", leftWingStart, leftWingWidth],
        ["right", rightWingStart, rightWingWidth]
    ]) {
        if (width <= 0) continue;
        const entrySurface = horizontalSurface(
            `${landmark.id}:city-wing:${side}:entry`,
            landmark,
            start,
            entry.y + 32,
            width,
            "safe-deck"
        );
        if (!inheritedEntrySurfaces.some((surface) => sameSurfaceBounds(surface, entrySurface))) {
            surfaces.push(entrySurface);
        }
        surfaces.push(
            horizontalSurface(`${landmark.id}:city-wing:${side}:exit`, landmark, start, exit.y + 32, width, "recovery")
        );
    }
    const midInset = leftMid ? 256 : 96;
    const midStart = (leftMid ? leftWingStart : rightWingStart) + midInset;
    const midWidth = (leftMid ? leftWingWidth : rightWingWidth) - midInset * 2;
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

function isStageDoorObjective(objective, sourceObjectById) {
    return STAGE_DOOR_KIND_LOOKUP[sourceObjectById[objective.sourceObjectId]?.kind] === true;
}

function runtimeObjectiveBounds({ stageDoorObjective, objective, exit, dx, dy }) {
    if (stageDoorObjective) return routeMouthBounds(exit);
    if (objective.bounds) return shiftBounds(objective.bounds, dx, dy);
    return undefined;
}

function isolatedAreaWorld(area, seed) {
    const isolatedArea = freezeValue({
        ...area,
        order: 1,
        nextAreaId: null,
        gate: { ...area.gate, nextAreaId: null, completionMode: "content-boundary" }
    });
    return assembleAuthoredWorld(
        defineAreaCatalog({
            id: `${area.id}:seamless-import`,
            revision: `${area.id}:seamless-import-v1`,
            areas: [isolatedArea]
        }),
        { seed, floorY: 0 }
    );
}

function routeId(sourceLandmarkId, targetLandmarkId) {
    return `${sourceLandmarkId}:route:${targetLandmarkId}`;
}

function sectorTransitionId(sourceSectorId, targetSectorId) {
    return `${sourceSectorId}:transition:${targetSectorId}`;
}

function interSectorRise(interSectorRiseById, sourceSectorId, targetSectorId) {
    const rise = interSectorRiseById?.[sectorTransitionId(sourceSectorId, targetSectorId)] ?? 0;
    if (!Number.isFinite(rise) || rise < 0) {
        throw new Error(`inter-Sector rise for '${sourceSectorId}' must be a non-negative number`);
    }
    return rise;
}

function authoredAreaCatalogsWithOverrides(areaCatalogs, areaOverrides) {
    const overrideIds = Object.keys(areaOverrides ?? {});
    if (overrideIds.length === 0) return areaCatalogs;
    const appliedIds = Object.create(null);
    const overriddenCatalogs = areaCatalogs.map((catalog) => {
        const areas = catalog.areas.map((area) => {
            const replacement = areaOverrides[area.id];
            if (!replacement) return area;
            if (replacement.id !== area.id) throw new Error(`authored-area-override-id-mismatch:${area.id}`);
            appliedIds[area.id] = true;
            return replacement;
        });
        return defineAreaCatalog({
            id: catalog.id,
            revision: catalog.revision,
            accessModuleRequirement: catalog.accessModuleRequirement,
            contentBoundaryStageId: catalog.contentBoundaryStageId,
            areas
        });
    });
    const unknownId = overrideIds.find((id) => appliedIds[id] !== true);
    if (unknownId) throw new Error(`authored-area-override-not-found:${unknownId}`);
    return Object.freeze(overriddenCatalogs);
}

function assertRuntimeContentBoundary(area) {
    if (!isAuthoredRuntimeContentBoundary(area.stageId)) return;
    if (
        area.nextAreaId !== null ||
        area.gate?.nextAreaId !== null ||
        area.gate?.completionMode !== "content-boundary"
    ) {
        throw new Error(`authored-runtime-content-boundary-invalid:${area.stageId}`);
    }
}

function accessSourcePosition(objective, objects) {
    const sourceObject = objects.find(({ id }) => id === objective.sourceObjectId);
    if (sourceObject?.position) return sourceObject.position;
    if (objective.bounds) {
        return freezeValue({
            x: objective.bounds.x + objective.bounds.width * 0.5,
            y: objective.bounds.y + objective.bounds.height * 0.5
        });
    }
    return null;
}

function registerAccessModuleSource(accessModuleById, { id, sectorId, landmarkId, position, source }) {
    if (!id) return;
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
        throw new Error(`authored-access-module-position-missing:${id}`);
    }
    const current = accessModuleById[id];
    if (current && current.sectorId !== sectorId) {
        throw new Error(`authored-access-module-sector-mismatch:${id}`);
    }
    let module = current;
    if (!module) {
        module = {
            id,
            sectorId,
            landmarkId,
            position,
            sources: []
        };
        accessModuleById[id] = module;
    }
    module.sources.push(source);
}

function bossStageSurface(surface, dx, dy, stageId) {
    const bounds = shiftBounds(surface.bounds, dx, dy);
    return freezeValue({
        id: surface.id,
        kind: surface.kind,
        bossStageId: stageId,
        oneWay: surface.oneWay === true,
        oneWayEdgeEnd: surface.oneWay === true ? 1 : undefined,
        grappleable: surface.grappleable !== false,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        topY: bounds.y,
        position: { x: bounds.x + bounds.width * 0.5, y: bounds.y },
        vertices: rectangleVertices(bounds)
    });
}

function bossStageAnchorSurface(anchor, dx, dy, stageId) {
    const point = shiftPoint(anchor, dx, dy);
    const halfSize = 12;
    const bounds = { x: point.x - halfSize, y: point.y - halfSize, width: halfSize * 2, height: halfSize * 2 };
    return freezeValue({
        id: `${anchor.id}:surface`,
        kind: "grapple-target",
        bossStageId: stageId,
        oneWay: false,
        collision: false,
        grappleable: true,
        renderable: false,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        topY: bounds.y,
        position: point,
        vertices: rectangleVertices(bounds)
    });
}

function createBossStageRuntimeDefinition(spec, sourceLandmark, targetLandmark, entryRouteId) {
    const dx = BOSS_ARENA_ISOLATION_X - spec.arena.entry.x;
    const dy = sourceLandmark.exit.y - spec.arena.entry.y;
    const bounds = shiftBounds(spec.arena.bounds, dx, dy);
    const entry = shiftPoint(spec.arena.entry, dx, dy);
    const exit = shiftPoint(spec.arena.exit, dx, dy);
    return freezeValue({
        id: spec.id,
        specRevision: spec.schemaVersion,
        sourceAreaId: spec.sourceAreaId,
        sourceLandmarkId: sourceLandmark.id,
        targetLandmarkId: targetLandmark.id,
        entryRouteId,
        bounds,
        sourceTrigger: routeMouthBounds(sourceLandmark.exit),
        entry,
        exit,
        exitTrigger: routeMouthBounds(exit),
        targetEntry: targetLandmark.entry,
        surfaces: [
            ...spec.arena.surfaces.map((surface) => bossStageSurface(surface, dx, dy, spec.id)),
            ...spec.arena.anchors
                .filter((anchor) => anchor.role === BOSS_ANCHOR_ROLE.SWING_ATTACK)
                .map((anchor) => bossStageAnchorSurface(anchor, dx, dy, spec.id))
        ],
        mechanics: spec.mechanics.map((mechanic) =>
            freezeValue({
                ...mechanic,
                position: shiftPoint(mechanic.position, dx, dy),
                ...(mechanic.bounds ? { bounds: shiftBounds(mechanic.bounds, dx, dy) } : {})
            })
        ),
        route: spec.arena.anchors.map((anchor) => shiftPoint(anchor, dx, dy)),
        recoveryPoints: spec.arena.recoveryPoints.map((point) => shiftPoint(point, dx, dy)),
        presentationOrigin: shiftPoint(spec.boss.position, dx, dy),
        localBossPosition: spec.boss.position,
        bossCollider: spec.boss.collider
    });
}

function bossAreaMatches(landmark, areaId) {
    const stageId = /^sector-0*(\d+)-0*(\d+)$/.exec(areaId)?.slice(1).join("-") ?? areaId;
    return landmark.stageId === stageId || landmark.id === areaId;
}

export function createAuthoredSeamlessSectorRuntimeWorld({
    seed,
    floorY = 320,
    summitRadius = 42,
    interSectorRiseById = {},
    areaOverrides = null,
    bossStageSpec = null,
    bossStageSpecs = null,
    areaCatalogs = DEFAULT_AUTHORED_AREA_CATALOGS,
    sectorHeightBudgetById = SEAMLESS_SECTOR_RUNTIME_HEIGHT_BUDGET_BY_ID
} = {}) {
    const authoredAreaCatalogs = authoredAreaCatalogsWithOverrides(areaCatalogs, areaOverrides);
    const authoredSectorCatalog =
        authoredAreaCatalogs === DEFAULT_AUTHORED_AREA_CATALOGS
            ? AUTHORED_SECTOR_CATALOG
            : buildAuthoredSectorCatalog({ areaCatalogs: authoredAreaCatalogs });
    const configuredBossStageSpecs = Object.freeze(
        bossStageSpec ? [bossStageSpec] : (bossStageSpecs ?? Object.values(BOSS_STAGE_CATALOG))
    );
    const surfaces = [];
    const route = [];
    const enemySpawns = [];
    const accessModuleById = Object.create(null);
    const objects = [];
    const objectives = [];
    const windZones = [];
    const scannerGroups = [];
    const jammerGroups = [];
    const landmarks = [];
    const sectors = [];
    const sectorEntries = [];
    const respawnAnchors = [];
    const connectors = [];
    const routeLocks = [];
    const sectorTransitions = [];
    const bossStages = [];
    let previousLandmark = null;
    let previousOutboundObjectiveIds = Object.freeze([]);
    let sectorWorldOriginY = floorY;

    for (const [sectorIndex, sourceCatalog] of authoredAreaCatalogs.entries()) {
        const sectorDefinition = authoredSectorCatalog.sectors[sectorIndex];
        const sectorLandmarks = [];
        let sectorLeftX = Number.POSITIVE_INFINITY;
        let sectorRightX = Number.NEGATIVE_INFINITY;
        let sectorLocalTopY = Number.POSITIVE_INFINITY;
        let sectorLocalBottomY = Number.NEGATIVE_INFINITY;
        let previousCityWingExitSurfaces = Object.freeze([]);

        for (const [landmarkIndex, area] of sourceCatalog.areas.entries()) {
            assertRuntimeContentBoundary(area);
            const landmarkDefinition = sectorDefinition.landmarks[landmarkIndex];
            const localWorld = isolatedAreaWorld(area, seed);
            const localArea = localWorld.areas[0];
            const dx = 0;
            const localTargetEntryY = sectorLandmarks.length ? sectorLandmarks.at(-1).localExit.y : 0;
            const localDy = localTargetEntryY - localArea.entry.y;
            const localEntry = shiftPoint(localArea.entry, dx, localDy);
            const localExit = shiftPoint(localArea.exit, dx, localDy);
            const localCoreBounds = shiftBounds(localArea.bounds, dx, localDy);
            const localBounds = wideLandmarkBounds(localCoreBounds);
            const dy = sectorWorldOriginY + localDy;
            const entry = shiftPoint(localArea.entry, dx, dy);
            const exit = shiftPoint(localArea.exit, dx, dy);
            const coreBounds = shiftBounds(localArea.bounds, dx, dy);
            const bounds = shiftBounds(localBounds, 0, sectorWorldOriginY);
            const nextLandmarkDefinition = isAuthoredRuntimeContentBoundary(area.stageId)
                ? null
                : (sectorDefinition.landmarks[landmarkIndex + 1] ??
                  authoredSectorCatalog.sectors[sectorIndex + 1]?.landmarks[0] ??
                  null);
            const outboundRouteId = nextLandmarkDefinition
                ? routeId(landmarkDefinition.id, nextLandmarkDefinition.id)
                : null;
            const objectiveIdBySourceId = Object.freeze(
                Object.fromEntries(
                    area.objectives.map((objective, index) => [objective.id, landmarkDefinition.objectives[index]?.id])
                )
            );
            const sourceObjectById = Object.freeze(
                Object.fromEntries(localWorld.objects.map((object) => [object.id, object]))
            );
            const landmarkObjectives = landmarkDefinition.objectives.map((objective) => {
                const sourceObjective = area.objectives.find(({ id }) => objectiveIdBySourceId[id] === objective.id);
                const stageDoorObjective = isStageDoorObjective(sourceObjective ?? objective, sourceObjectById);
                return freezeValue({
                    ...objective,
                    type: stageDoorObjective ? "reach" : objective.type,
                    landmarkId: landmarkDefinition.id,
                    bounds: runtimeObjectiveBounds({ stageDoorObjective, objective, exit, dx, dy }),
                    sourceObjectId: stageDoorObjective ? undefined : objective.sourceObjectId
                });
            });
            const sourceEnemySpawns = localWorld.enemySpawns;
            const landmarkEnemySpawns = landmarkDefinition.encounters.map((encounter, encounterIndex) => {
                const source = sourceEnemySpawns[encounterIndex] ?? {};
                return freezeValue({
                    encounterId: encounter.encounterId,
                    slotId: encounter.slotId,
                    objectId: encounter.encounterId,
                    landmarkId: landmarkDefinition.id,
                    sectorId: sectorDefinition.id,
                    stageId: landmarkDefinition.stageId,
                    position: shiftPoint(encounter.position, dx, dy),
                    x: encounter.position.x + dx,
                    y: encounter.position.y + dy,
                    activation: encounter.activation ? shiftBounds(encounter.activation, dx, dy) : null,
                    enemySelection: encounter.enemySelection,
                    accessModuleId: encounter.accessModuleId,
                    patrol: source.patrol ? shiftPatrol(source.patrol, dx, dy) : null,
                    rules: source.rules ?? Object.freeze([]),
                    jammer: source.jammer ?? null,
                    level: landmarks.length
                });
            });
            for (const encounter of landmarkEnemySpawns) {
                registerAccessModuleSource(accessModuleById, {
                    id: encounter.accessModuleId,
                    sectorId: sectorDefinition.id,
                    landmarkId: landmarkDefinition.id,
                    position: encounter.position,
                    source: freezeValue({
                        kind: ACCESS_MODULE_SOURCE_KIND.ENEMY_DEFEAT,
                        encounterId: encounter.encounterId
                    })
                });
            }
            const landmarkSurfaces = localWorld.surfaces
                .filter(({ kind }) => AREA_BOUNDARY_KIND_LOOKUP[kind] !== true)
                .map((surface) => shiftSurface(surface, dx, dy, landmarkDefinition, area.id, objectiveIdBySourceId));
            const landmarkWingSurfaces = cityWingSurfaces({
                landmark: landmarkDefinition,
                coreBounds,
                entry,
                exit,
                landmarkIndex,
                inheritedEntrySurfaces: previousCityWingExitSurfaces
            });
            previousCityWingExitSurfaces = Object.freeze(landmarkWingSurfaces.filter(({ id }) => id.endsWith(":exit")));
            const landmarkObjects = localWorld.objects
                .filter(({ kind }) => ENEMY_OBJECT_KIND_LOOKUP[kind] !== true && STAGE_DOOR_KIND_LOOKUP[kind] !== true)
                .map((object) =>
                    shiftObject(object, dx, dy, landmarkDefinition, objectiveIdBySourceId, outboundRouteId)
                );
            for (const objective of landmarkObjectives) {
                registerAccessModuleSource(accessModuleById, {
                    id: objective.accessModuleId,
                    sectorId: sectorDefinition.id,
                    landmarkId: landmarkDefinition.id,
                    position: accessSourcePosition(objective, landmarkObjects),
                    source: freezeValue({
                        kind: ACCESS_MODULE_SOURCE_KIND.OBJECTIVE_COMPLETION,
                        objectiveId: objective.id
                    })
                });
            }
            const landmarkRoute = localWorld.route.map((point) =>
                withoutAreaAuthority(shiftPoint(point, dx, dy), {
                    landmarkId: landmarkDefinition.id,
                    stageId: landmarkDefinition.stageId,
                    topY: point.topY + dy
                })
            );
            const landmarkWindZones = localWorld.windZones.map((zone) =>
                withoutAreaAuthority(zone, {
                    landmarkId: landmarkDefinition.id,
                    stageId: landmarkDefinition.stageId,
                    bounds: shiftBounds(zone.bounds, dx, dy)
                })
            );
            const landmarkScannerGroups = localWorld.scannerGroups.map((group) =>
                withoutAreaAuthority(group, {
                    landmarkId: landmarkDefinition.id,
                    stageId: landmarkDefinition.stageId
                })
            );
            const landmarkJammerGroups = (localWorld.jammerGroups ?? []).map((group) =>
                freezeValue({
                    ...group,
                    id: group.id.startsWith(`${area.id}:`) ? group.id : `${area.id}:${group.id}`,
                    sourceObjectId:
                        landmarkEnemySpawns[
                            sourceEnemySpawns.findIndex(({ objectId }) => objectId === group.sourceObjectId)
                        ]?.objectId ?? group.sourceObjectId,
                    eligibleSurfaceIds: group.eligibleSurfaceIds.map((surfaceId) =>
                        surfaceId.startsWith(`${area.id}:`) ? surfaceId : `${area.id}:${surfaceId}`
                    ),
                    landmarkId: landmarkDefinition.id,
                    stageId: landmarkDefinition.stageId
                })
            );
            const respawnAnchorId =
                landmarkIndex === 0 ? `${sectorDefinition.id}:entry` : `${landmarkDefinition.id}:checkpoint`;
            const landmarkRespawnAnchor = freezeValue({
                id: respawnAnchorId,
                sectorId: sectorDefinition.id,
                landmarkId: landmarkDefinition.id,
                stageId: landmarkDefinition.stageId,
                label: `STAGE ${landmarkDefinition.stageId} SAVE`,
                level: landmarks.length,
                radius: STAGE_SAVE_POINT_CULL_RADIUS,
                triggerBounds: stageSavePointBounds(entry),
                position: entry
            });
            const runtimeLandmark = freezeValue({
                id: landmarkDefinition.id,
                order: landmarks.length + 1,
                sectorId: sectorDefinition.id,
                sectorOrder: sectorDefinition.order,
                landmarkOrder: landmarkIndex + 1,
                areaId: area.id,
                stageId: landmarkDefinition.stageId,
                name: landmarkDefinition.name,
                subtitle: landmarkDefinition.subtitle,
                origin: { x: dx, y: dy },
                localOrigin: { x: dx, y: localDy },
                localBounds,
                localEntry,
                localExit,
                bounds,
                entry,
                exit,
                respawnAnchorId,
                surfaceIds: [...landmarkSurfaces, ...landmarkWingSurfaces].map(({ id }) => id),
                objectIds: landmarkObjects.map(({ id }) => id),
                objectiveIds: landmarkObjectives.map(({ id }) => id),
                encounterIds: landmarkEnemySpawns.map(({ encounterId }) => encounterId),
                routes: area.routes,
                cameraZones: area.cameraZones,
                cueIds: area.cueIds,
                contentBoundaryId: landmarkDefinition.contentBoundaryId,
                contentBoundaryRequiredObjectiveIds: landmarkDefinition.contentBoundaryRequiredObjectiveIds,
                outboundRouteId
            });

            if (previousLandmark && !isAuthoredRuntimeContentBoundary(previousLandmark.stageId)) {
                const lockId = routeId(previousLandmark.id, runtimeLandmark.id);
                const surfaceId = `${lockId}:surface`;
                const sectorTransition = previousLandmark.sectorId !== runtimeLandmark.sectorId;
                const sourceSectorDefinition = authoredSectorCatalog.sectors.find(
                    ({ id }) => id === previousLandmark.sectorId
                );
                const connectorBridge = connectorSurface(
                    surfaceId,
                    previousLandmark.id,
                    previousLandmark.exit,
                    runtimeLandmark.entry,
                    [...surfaces, ...landmarkSurfaces, ...landmarkWingSurfaces]
                );
                const connector = freezeValue({
                    id: `${lockId}:connector`,
                    routeLockId: lockId,
                    surfaceId: connectorBridge?.id ?? null,
                    sourceLandmarkId: previousLandmark.id,
                    targetLandmarkId: runtimeLandmark.id,
                    start: previousLandmark.exit,
                    end: runtimeLandmark.entry,
                    sectorTransition
                });
                connectors.push(connector);
                routeLocks.push(
                    freezeValue({
                        id: lockId,
                        sourceLandmarkId: previousLandmark.id,
                        targetLandmarkId: runtimeLandmark.id,
                        connectorId: connector.id,
                        requiredObjectiveIds: previousOutboundObjectiveIds,
                        ...(connector.sectorTransition
                            ? { requiredAccessModuleCount: sourceSectorDefinition.accessModuleRequirement }
                            : {}),
                        sectorTransition: connector.sectorTransition
                    })
                );
                if (connectorBridge) surfaces.push(connectorBridge);
            }

            surfaces.push(...landmarkSurfaces, ...landmarkWingSurfaces);
            route.push(...landmarkRoute);
            objects.push(...landmarkObjects);
            objectives.push(...landmarkObjectives);
            enemySpawns.push(...landmarkEnemySpawns);
            windZones.push(...landmarkWindZones);
            scannerGroups.push(...landmarkScannerGroups);
            jammerGroups.push(...landmarkJammerGroups);
            respawnAnchors.push(landmarkRespawnAnchor);
            landmarks.push(runtimeLandmark);
            sectorLandmarks.push(runtimeLandmark);
            previousLandmark = runtimeLandmark;
            previousOutboundObjectiveIds = area.gate.requiredObjectiveIds.map(
                (objectiveId) => objectiveIdBySourceId[objectiveId] ?? objectiveId
            );
            sectorLeftX = Math.min(sectorLeftX, bounds.x);
            sectorRightX = Math.max(sectorRightX, bounds.x + bounds.width);
            sectorLocalTopY = Math.min(sectorLocalTopY, localBounds.y);
            sectorLocalBottomY = Math.max(sectorLocalBottomY, localBounds.y + localBounds.height);
        }

        const firstLandmark = sectorLandmarks[0];
        const lastLandmark = sectorLandmarks.at(-1);
        const entryAnchor = respawnAnchors.find(({ id }) => id === firstLandmark.respawnAnchorId);
        sectorEntries.push(entryAnchor);
        const sectorHeight = sectorLocalBottomY - sectorLocalTopY;
        const sectorContentWidth = sectorRightX - sectorLeftX;
        if (sectorContentWidth > SEAMLESS_SECTOR_RUNTIME_WIDTH) {
            throw new Error(`${sectorDefinition.id} exceeds the seamless Sector width`);
        }
        const sectorHeightLimit = sectorHeightBudgetById[sectorDefinition.id];
        if (!Number.isFinite(sectorHeightLimit)) {
            throw new Error(`${sectorDefinition.id} has no seamless Sector height limit`);
        }
        if (sectorHeight > sectorHeightLimit) {
            throw new Error(`${sectorDefinition.id} exceeds the seamless Sector height`);
        }
        const sectorCenterX = (sectorLeftX + sectorRightX) * 0.5;
        const sectorBounds = {
            x: sectorCenterX - SEAMLESS_SECTOR_RUNTIME_WIDTH * 0.5,
            y: sectorWorldOriginY + sectorLocalTopY,
            width: SEAMLESS_SECTOR_RUNTIME_WIDTH,
            height: sectorHeight
        };
        sectors.push(
            freezeValue({
                id: sectorDefinition.id,
                order: sectorDefinition.order,
                width: SEAMLESS_SECTOR_RUNTIME_WIDTH,
                origin: { x: 0, y: sectorWorldOriginY },
                localBounds: {
                    x: sectorBounds.x,
                    y: sectorLocalTopY,
                    width: sectorBounds.width,
                    height: sectorHeight
                },
                bounds: sectorBounds,
                sectorEntryId: entryAnchor.id,
                respawnAnchorId: entryAnchor.id,
                landmarkIds: sectorLandmarks.map(({ id }) => id),
                entryLandmarkId: firstLandmark.id,
                exitLandmarkId: lastLandmark.id,
                accessModuleIds: Object.values(accessModuleById)
                    .filter(({ sectorId }) => sectorId === sectorDefinition.id)
                    .map(({ id }) => id),
                accessModuleRequirement: sectorDefinition.accessModuleRequirement,
                contentBoundaryStageId: sectorDefinition.contentBoundaryStageId
            })
        );
        const nextSectorDefinition = authoredSectorCatalog.sectors[sectorIndex + 1];
        if (nextSectorDefinition) {
            const rise = interSectorRise(interSectorRiseById, sectorDefinition.id, nextSectorDefinition.id);
            if (!isAuthoredRuntimeContentBoundary(lastLandmark.stageId)) {
                sectorTransitions.push(
                    freezeValue({
                        id: sectorTransitionId(sectorDefinition.id, nextSectorDefinition.id),
                        sourceSectorId: sectorDefinition.id,
                        targetSectorId: nextSectorDefinition.id,
                        sourceExit: lastLandmark.exit,
                        targetOrigin: { x: 0, y: lastLandmark.exit.y - rise },
                        rise
                    })
                );
            }
            sectorWorldOriginY =
                lastLandmark.exit.y - rise - (lastLandmark.contentBoundaryId ? CONTENT_BOUNDARY_ISOLATION_GAP : 0);
        }
    }

    for (const lock of routeLocks.filter(({ requiredAccessModuleCount }) => requiredAccessModuleCount > 0)) {
        const sourceLandmark = landmarks.find(({ id }) => id === lock.sourceLandmarkId);
        const targetLandmark = landmarks.find(({ id }) => id === lock.targetLandmarkId);
        const barrier = transitBarrierGeometry(lock, sourceLandmark, targetLandmark);
        const matchingBossStageSpec = configuredBossStageSpecs.find(
            (spec) =>
                bossAreaMatches(sourceLandmark, spec.sourceAreaId) && bossAreaMatches(targetLandmark, spec.nextAreaId)
        );
        surfaces.push(...barrier.surfaces);
        objects.push(
            freezeValue({
                id: `${lock.id}:transit-lock`,
                kind: "access-transit-lock",
                presentationId: "world-object:access-transit-lock",
                landmarkId: sourceLandmark.id,
                sectorId: sourceLandmark.sectorId,
                routeLockId: lock.id,
                position: sourceLandmark.exit,
                requiredAccessModuleCount: lock.requiredAccessModuleCount,
                requiredObjectiveIds: lock.requiredObjectiveIds,
                barrierSurfaceIds: barrier.surfaces.map(({ id }) => id),
                barrierSegments: barrier.segments,
                presentationBounds: barrier.presentationBounds,
                label: "SECTOR TRANSIT"
            })
        );
        if (matchingBossStageSpec) {
            const bossStage = createBossStageRuntimeDefinition(
                matchingBossStageSpec,
                sourceLandmark,
                targetLandmark,
                lock.id
            );
            bossStages.push(bossStage);
            surfaces.push(...bossStage.surfaces);
            route.push(...bossStage.route);
        }
    }

    for (const spec of configuredBossStageSpecs) {
        if (bossStages.some(({ id }) => id === spec.id)) continue;
        const sourceLandmark = landmarks.find((landmark) => bossAreaMatches(landmark, spec.sourceAreaId));
        const targetLandmark = landmarks.find((landmark) => bossAreaMatches(landmark, spec.nextAreaId));
        if (!sourceLandmark || !targetLandmark) continue;
        const bossStage = createBossStageRuntimeDefinition(spec, sourceLandmark, targetLandmark, null);
        bossStages.push(bossStage);
        surfaces.push(...bossStage.surfaces);
        route.push(...bossStage.route);
    }

    const accessModules = Object.freeze(Object.values(accessModuleById).map((module) => freezeValue(module)));
    const finalLandmark = landmarks.at(-1);
    return freezeValue({
        seed,
        definitionId: "authored-seamless-sector-runtime",
        definitionRevision: SEAMLESS_SECTOR_RUNTIME_REVISION,
        layout: "seamless-sectors",
        surfaces,
        route,
        enemySpawns,
        accessModules,
        checkpoints: [],
        summit: { x: finalLandmark.exit.x, y: finalLandmark.exit.y, radius: summitRadius },
        topY: Math.min(...landmarks.map(({ bounds }) => bounds.y)),
        areas: [],
        landmarks,
        stageIdentities: authoredSectorCatalog.stageIdentities.filter(({ runtimePreview }) => runtimePreview),
        sectors,
        sectorEntries,
        respawnAnchors,
        connectors,
        routeLocks,
        sectorTransitions,
        bossStages,
        objects,
        objectives,
        gates: [],
        windZones,
        scannerGroups,
        jammerGroups
    });
}
