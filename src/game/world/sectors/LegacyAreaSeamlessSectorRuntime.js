import { assembleAuthoredWorld } from "../AuthoredWorldAssembler.js";
import { defineAreaCatalog } from "../areas/AreaDefinition.js";
import { SECTOR_01_AREA_CATALOG } from "../areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../areas/sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "../areas/sector03/Sector03AreaCatalog.js";
import { LEGACY_AREA_SECTOR_PREVIEW_CATALOG } from "./LegacyAreaSectorPreviewCatalog.js";
import { STAGE_SAVE_POINT_CULL_RADIUS, stageSavePointBounds } from "../StageSavePointGeometry.js";
import { GRAPPLE_LINK_BUDGET } from "../../config.js";

export const SEAMLESS_SECTOR_RUNTIME_REVISION = "seamless-sector-runtime-v9";
export const SEAMLESS_SECTOR_RUNTIME_WIDTH = 4800;
export const SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT = 9600;

const LEGACY_SECTOR_CATALOGS = Object.freeze([SECTOR_01_AREA_CATALOG, SECTOR_02_AREA_CATALOG, SECTOR_03_AREA_CATALOG]);
const SECTOR_HALF_WIDTH = SEAMLESS_SECTOR_RUNTIME_WIDTH * 0.5;
const CITY_WING_INSET = 96;
const CITY_WING_CORE_GAP = 64;
const CITY_WING_THICKNESS = 32;
const ACCESS_MODULES_PER_SECTOR = 3;
const TRANSIT_BARRIER_THICKNESS = 24;
const TRANSIT_BARRIER_LATERAL_MARGIN = GRAPPLE_LINK_BUDGET;
const LEGACY_BOUNDARY_KINDS = new Set(["area-boundary-wall", "inter-floor-divider"]);
const LEGACY_ENEMY_KINDS = new Set(["sentry", "patrol-drone"]);
const LEGACY_STAGE_DOOR_KINDS = new Set(["gate", "gate-panel"]);

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

function shiftSurface(surface, dx, dy, landmark) {
    return withoutAreaAuthority(surface, {
        landmarkId: landmark.id,
        legacyStageAlias: landmark.legacyStageAlias,
        x: surface.x + dx,
        y: surface.y + dy,
        topY: surface.topY + dy,
        ...(surface.position ? { position: shiftPoint(surface.position, dx, dy) } : {}),
        vertices: surface.vertices.map((vertex) => shiftPoint(vertex, dx, dy))
    });
}

function shiftObject(object, dx, dy, landmark, objectiveIdMap, routeLockId) {
    const { areaId: _areaId, gateId: _gateId, ...rest } = object;
    return freezeValue({
        ...rest,
        landmarkId: landmark.id,
        legacyStageAlias: landmark.legacyStageAlias,
        position: shiftPoint(object.position, dx, dy),
        ...(object.bounds ? { bounds: shiftBounds(object.bounds, dx, dy) } : {}),
        ...(object.activation ? { activation: shiftBounds(object.activation, dx, dy) } : {}),
        ...(object.patrol ? { patrol: shiftPatrol(object.patrol, dx, dy) } : {}),
        ...(object.objectiveId ? { objectiveId: objectiveIdMap.get(object.objectiveId) ?? object.objectiveId } : {}),
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
        legacyStageAlias: landmark.legacyStageAlias,
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

function cityWingSurfaces({ landmark, coreBounds, entry, exit, landmarkIndex }) {
    const leftWingStart = -SECTOR_HALF_WIDTH + CITY_WING_INSET;
    const leftWingEnd = coreBounds.x - CITY_WING_CORE_GAP;
    const rightWingStart = coreBounds.x + coreBounds.width + CITY_WING_CORE_GAP;
    const rightWingEnd = SECTOR_HALF_WIDTH - CITY_WING_INSET;
    const leftWingWidth = leftWingEnd - leftWingStart;
    const rightWingWidth = rightWingEnd - rightWingStart;
    const middleY = Math.round((coreBounds.y + coreBounds.height * 0.52) / 32) * 32;
    const leftMid = landmarkIndex % 2 === 0;
    const midStart = leftMid ? leftWingStart + 256 : rightWingStart + 96;
    const midWidth = leftMid ? Math.max(320, leftWingWidth - 512) : Math.max(320, rightWingWidth - 192);
    return Object.freeze([
        horizontalSurface(
            `${landmark.id}:city-wing:left:entry`,
            landmark,
            leftWingStart,
            entry.y + 32,
            leftWingWidth,
            "safe-deck"
        ),
        horizontalSurface(
            `${landmark.id}:city-wing:right:entry`,
            landmark,
            rightWingStart,
            entry.y + 32,
            rightWingWidth,
            "safe-deck"
        ),
        horizontalSurface(
            `${landmark.id}:city-wing:left:exit`,
            landmark,
            leftWingStart,
            exit.y + 32,
            leftWingWidth,
            "recovery"
        ),
        horizontalSurface(
            `${landmark.id}:city-wing:right:exit`,
            landmark,
            rightWingStart,
            exit.y + 32,
            rightWingWidth,
            "recovery"
        ),
        horizontalSurface(
            `${landmark.id}:city-wing:${leftMid ? "left" : "right"}:mid`,
            landmark,
            midStart,
            middleY,
            midWidth,
            "safe-deck"
        )
    ]);
}

function isLegacyStageDoorObjective(objective, sourceObjectsById) {
    return LEGACY_STAGE_DOOR_KINDS.has(sourceObjectsById.get(objective.sourceObjectId)?.kind);
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

export function createLegacyAreaSeamlessSectorRuntimeWorld({
    seed,
    floorY = 320,
    summitRadius = 42,
    interSectorRiseById = {}
} = {}) {
    const surfaces = [];
    const route = [];
    const enemySpawns = [];
    const accessModules = [];
    const objects = [];
    const objectives = [];
    const windZones = [];
    const scannerGroups = [];
    const landmarks = [];
    const sectors = [];
    const sectorEntries = [];
    const respawnAnchors = [];
    const connectors = [];
    const routeLocks = [];
    const sectorTransitions = [];
    let previousLandmark = null;
    let previousOutboundObjectiveIds = Object.freeze([]);
    let sectorWorldOriginY = floorY;

    for (const [sectorIndex, sourceCatalog] of LEGACY_SECTOR_CATALOGS.entries()) {
        const sectorDefinition = LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors[sectorIndex];
        const sectorLandmarks = [];
        let sectorLeftX = Number.POSITIVE_INFINITY;
        let sectorRightX = Number.NEGATIVE_INFINITY;
        let sectorLocalTopY = Number.POSITIVE_INFINITY;
        let sectorLocalBottomY = Number.NEGATIVE_INFINITY;

        for (const [landmarkIndex, area] of sourceCatalog.areas.entries()) {
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
            const nextLandmarkDefinition =
                sectorDefinition.landmarks[landmarkIndex + 1] ??
                LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors[sectorIndex + 1]?.landmarks[0] ??
                null;
            const outboundRouteId = nextLandmarkDefinition
                ? routeId(landmarkDefinition.id, nextLandmarkDefinition.id)
                : null;
            const objectiveIdMap = new Map(
                area.objectives.map((objective, index) => [objective.id, landmarkDefinition.objectives[index]?.id])
            );
            const sourceObjectsById = new Map(localWorld.objects.map((object) => [object.id, object]));
            const landmarkObjectives = landmarkDefinition.objectives.map((objective) => {
                const sourceObjective = area.objectives.find(({ id }) => objectiveIdMap.get(id) === objective.id);
                const stageDoorObjective = isLegacyStageDoorObjective(sourceObjective ?? objective, sourceObjectsById);
                return freezeValue({
                    ...objective,
                    type: stageDoorObjective ? "reach" : objective.type,
                    landmarkId: landmarkDefinition.id,
                    bounds: stageDoorObjective
                        ? routeMouthBounds(exit)
                        : objective.bounds
                          ? shiftBounds(objective.bounds, dx, dy)
                          : undefined,
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
                    legacyStageAlias: landmarkDefinition.legacyStageAlias,
                    position: shiftPoint(encounter.position, dx, dy),
                    x: encounter.position.x + dx,
                    y: encounter.position.y + dy,
                    activation: encounter.activation ? shiftBounds(encounter.activation, dx, dy) : null,
                    enemySelection: encounter.enemySelection,
                    accessModuleId: encounter.accessModuleId,
                    patrol: source.patrol ? shiftPatrol(source.patrol, dx, dy) : null,
                    rules: source.rules ?? Object.freeze([]),
                    level: landmarks.length
                });
            });
            for (const encounter of landmarkEnemySpawns) {
                if (!encounter.accessModuleId) continue;
                accessModules.push(
                    freezeValue({
                        id: encounter.accessModuleId,
                        sectorId: sectorDefinition.id,
                        landmarkId: landmarkDefinition.id,
                        encounterId: encounter.encounterId,
                        position: encounter.position
                    })
                );
            }
            const landmarkSurfaces = localWorld.surfaces
                .filter(({ kind }) => !LEGACY_BOUNDARY_KINDS.has(kind))
                .map((surface) => shiftSurface(surface, dx, dy, landmarkDefinition));
            const landmarkWingSurfaces = cityWingSurfaces({
                landmark: landmarkDefinition,
                coreBounds,
                entry,
                exit,
                landmarkIndex
            });
            const landmarkObjects = localWorld.objects
                .filter(({ kind }) => !LEGACY_ENEMY_KINDS.has(kind) && !LEGACY_STAGE_DOOR_KINDS.has(kind))
                .map((object) => shiftObject(object, dx, dy, landmarkDefinition, objectiveIdMap, outboundRouteId));
            const landmarkRoute = localWorld.route.map((point) =>
                withoutAreaAuthority(shiftPoint(point, dx, dy), {
                    landmarkId: landmarkDefinition.id,
                    legacyStageAlias: landmarkDefinition.legacyStageAlias,
                    topY: point.topY + dy
                })
            );
            const landmarkWindZones = localWorld.windZones.map((zone) =>
                withoutAreaAuthority(zone, {
                    landmarkId: landmarkDefinition.id,
                    legacyStageAlias: landmarkDefinition.legacyStageAlias,
                    bounds: shiftBounds(zone.bounds, dx, dy)
                })
            );
            const landmarkScannerGroups = localWorld.scannerGroups.map((group) =>
                withoutAreaAuthority(group, {
                    landmarkId: landmarkDefinition.id,
                    legacyStageAlias: landmarkDefinition.legacyStageAlias
                })
            );
            const respawnAnchorId =
                landmarkIndex === 0 ? `${sectorDefinition.id}:entry` : `${landmarkDefinition.id}:checkpoint`;
            const landmarkRespawnAnchor = freezeValue({
                id: respawnAnchorId,
                sectorId: sectorDefinition.id,
                landmarkId: landmarkDefinition.id,
                legacyStageAlias: landmarkDefinition.legacyStageAlias,
                label: `STAGE ${landmarkDefinition.legacyStageAlias} SAVE`,
                level: landmarks.length,
                radius: STAGE_SAVE_POINT_CULL_RADIUS,
                triggerBounds: stageSavePointBounds(entry),
                position: entry
            });
            const runtimeLandmark = freezeValue({
                id: landmarkDefinition.id,
                order: landmarks.length + 1,
                sectorId: sectorDefinition.id,
                sectorOrder: sectorIndex + 1,
                landmarkOrder: landmarkIndex + 1,
                legacyAreaId: area.id,
                legacyStageAlias: landmarkDefinition.legacyStageAlias,
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
                outboundRouteId
            });

            if (previousLandmark) {
                const lockId = routeId(previousLandmark.id, runtimeLandmark.id);
                const surfaceId = `${lockId}:surface`;
                const sectorTransition = previousLandmark.sectorId !== runtimeLandmark.sectorId;
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
                        ...(connector.sectorTransition ? { requiredAccessModuleCount: ACCESS_MODULES_PER_SECTOR } : {}),
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
            respawnAnchors.push(landmarkRespawnAnchor);
            landmarks.push(runtimeLandmark);
            sectorLandmarks.push(runtimeLandmark);
            previousLandmark = runtimeLandmark;
            previousOutboundObjectiveIds = area.gate.requiredObjectiveIds.map(
                (objectiveId) => objectiveIdMap.get(objectiveId) ?? objectiveId
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
        if (sectorHeight > SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT) {
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
                order: sectorIndex + 1,
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
                accessModuleIds: accessModules
                    .filter(({ sectorId }) => sectorId === sectorDefinition.id)
                    .map(({ id }) => id),
                accessModuleRequirement: ACCESS_MODULES_PER_SECTOR
            })
        );
        const nextSectorDefinition = LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors[sectorIndex + 1];
        if (nextSectorDefinition) {
            const rise = interSectorRise(interSectorRiseById, sectorDefinition.id, nextSectorDefinition.id);
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
            sectorWorldOriginY = lastLandmark.exit.y - rise;
        }
    }

    for (const lock of routeLocks.filter(({ requiredAccessModuleCount }) => requiredAccessModuleCount > 0)) {
        const sourceLandmark = landmarks.find(({ id }) => id === lock.sourceLandmarkId);
        const targetLandmark = landmarks.find(({ id }) => id === lock.targetLandmarkId);
        const barrier = transitBarrierGeometry(lock, sourceLandmark, targetLandmark);
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
    }

    const finalLandmark = landmarks.at(-1);
    return freezeValue({
        seed,
        definitionId: "legacy-area-seamless-sector-runtime",
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
        landmarkAliases: LEGACY_AREA_SECTOR_PREVIEW_CATALOG.stageAliases.filter(({ runtimePreview }) => runtimePreview),
        sectors,
        sectorEntries,
        respawnAnchors,
        connectors,
        routeLocks,
        sectorTransitions,
        objects,
        objectives,
        gates: [],
        windZones,
        scannerGroups
    });
}
