import { assembleAuthoredWorld } from "../AuthoredWorldAssembler.js";
import { defineAreaCatalog } from "../areas/AreaDefinition.js";
import { SECTOR_01_AREA_CATALOG } from "../areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../areas/sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "../areas/sector03/Sector03AreaCatalog.js";
import { LEGACY_AREA_SECTOR_PREVIEW_CATALOG } from "./LegacyAreaSectorPreviewCatalog.js";

export const SEAMLESS_SECTOR_RUNTIME_REVISION = "seamless-sector-runtime-v1";
export const SEAMLESS_SECTOR_RUNTIME_WIDTH = 4800;
export const SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT = 3600;

const LEGACY_SECTOR_CATALOGS = Object.freeze([SECTOR_01_AREA_CATALOG, SECTOR_02_AREA_CATALOG, SECTOR_03_AREA_CATALOG]);
const LANDMARK_COLUMN_X = Object.freeze([-1600, -533, 533, 1600]);
const LANDMARKS_PER_COLUMN = 2;
const LEGACY_BOUNDARY_KINDS = new Set(["area-boundary-wall", "inter-floor-divider"]);
const LEGACY_ENEMY_KINDS = new Set(["sentry", "patrol-drone"]);

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

function connectorSurface(id, routeLockId, sourceLandmarkId, start, end) {
    const thickness = 32;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const normalX = (-dy / length) * thickness * 0.5;
    const normalY = (dx / length) * thickness * 0.5;
    const vertices = [
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
        kind: "sector-connector",
        landmarkId: sourceLandmarkId,
        requiredRouteId: routeLockId,
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

export function createLegacyAreaSeamlessSectorRuntimeWorld({ seed, floorY = 320, summitRadius = 42 } = {}) {
    const surfaces = [];
    const route = [];
    const enemySpawns = [];
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
    let previousLandmark = null;
    let previousOutboundObjectiveIds = Object.freeze([]);
    let sectorBaseY = floorY;

    for (const [sectorIndex, sourceCatalog] of LEGACY_SECTOR_CATALOGS.entries()) {
        const sectorDefinition = LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors[sectorIndex];
        const sectorLandmarks = [];
        let sectorLeftX = Number.POSITIVE_INFINITY;
        let sectorRightX = Number.NEGATIVE_INFINITY;
        let sectorTopY = Number.POSITIVE_INFINITY;
        let sectorBottomY = Number.NEGATIVE_INFINITY;

        for (const [landmarkIndex, area] of sourceCatalog.areas.entries()) {
            const landmarkDefinition = sectorDefinition.landmarks[landmarkIndex];
            const localWorld = isolatedAreaWorld(area, seed);
            const localArea = localWorld.areas[0];
            const columnIndex = Math.floor(landmarkIndex / LANDMARKS_PER_COLUMN);
            const startsColumn = landmarkIndex % LANDMARKS_PER_COLUMN === 0;
            const dx = LANDMARK_COLUMN_X[columnIndex];
            const targetEntryY = startsColumn ? sectorBaseY : sectorLandmarks.at(-1).exit.y;
            const dy = targetEntryY - localArea.entry.y;
            const entry = shiftPoint(localArea.entry, dx, dy);
            const exit = shiftPoint(localArea.exit, dx, dy);
            const bounds = shiftBounds(localArea.bounds, dx, dy);
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
            const landmarkObjectives = landmarkDefinition.objectives.map((objective) =>
                freezeValue({
                    ...objective,
                    landmarkId: landmarkDefinition.id,
                    bounds: objective.bounds ? shiftBounds(objective.bounds, dx, dy) : undefined
                })
            );
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
                    patrol: source.patrol ? shiftPatrol(source.patrol, dx, dy) : null,
                    rules: source.rules ?? Object.freeze([]),
                    level: landmarks.length
                });
            });
            const landmarkSurfaces = localWorld.surfaces
                .filter(({ kind }) => !LEGACY_BOUNDARY_KINDS.has(kind))
                .map((surface) => shiftSurface(surface, dx, dy, landmarkDefinition));
            const landmarkObjects = localWorld.objects
                .filter(({ kind }) => !LEGACY_ENEMY_KINDS.has(kind))
                .map((object) => shiftObject(object, dx, dy, landmarkDefinition, objectiveIdMap, outboundRouteId));
            const landmarkRoute = localWorld.route.map((point) =>
                withoutAreaAuthority(shiftPoint(point, dx, dy), {
                    landmarkId: landmarkDefinition.id,
                    legacyStageAlias: landmarkDefinition.legacyStageAlias
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
                bounds,
                entry,
                exit,
                surfaceIds: landmarkSurfaces.map(({ id }) => id),
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
                const connector = freezeValue({
                    id: `${lockId}:connector`,
                    routeLockId: lockId,
                    surfaceId,
                    sourceLandmarkId: previousLandmark.id,
                    targetLandmarkId: runtimeLandmark.id,
                    start: previousLandmark.exit,
                    end: runtimeLandmark.entry,
                    sectorTransition: previousLandmark.sectorId !== runtimeLandmark.sectorId
                });
                connectors.push(connector);
                routeLocks.push(
                    freezeValue({
                        id: lockId,
                        sourceLandmarkId: previousLandmark.id,
                        targetLandmarkId: runtimeLandmark.id,
                        connectorId: connector.id,
                        requiredObjectiveIds: previousOutboundObjectiveIds,
                        sectorTransition: connector.sectorTransition
                    })
                );
                surfaces.push(connectorSurface(surfaceId, lockId, previousLandmark.id, connector.start, connector.end));
            }

            surfaces.push(...landmarkSurfaces);
            route.push(...landmarkRoute);
            objects.push(...landmarkObjects);
            objectives.push(...landmarkObjectives);
            enemySpawns.push(...landmarkEnemySpawns);
            windZones.push(...landmarkWindZones);
            scannerGroups.push(...landmarkScannerGroups);
            landmarks.push(runtimeLandmark);
            sectorLandmarks.push(runtimeLandmark);
            previousLandmark = runtimeLandmark;
            previousOutboundObjectiveIds = area.gate.requiredObjectiveIds.map(
                (objectiveId) => objectiveIdMap.get(objectiveId) ?? objectiveId
            );
            sectorLeftX = Math.min(sectorLeftX, bounds.x);
            sectorRightX = Math.max(sectorRightX, bounds.x + bounds.width);
            sectorTopY = Math.min(sectorTopY, bounds.y);
            sectorBottomY = Math.max(sectorBottomY, bounds.y + bounds.height);
        }

        const firstLandmark = sectorLandmarks[0];
        const lastLandmark = sectorLandmarks.at(-1);
        const entryAnchor = freezeValue({
            id: `${sectorDefinition.id}:entry`,
            sectorId: sectorDefinition.id,
            landmarkId: firstLandmark.id,
            position: firstLandmark.entry
        });
        sectorEntries.push(entryAnchor);
        respawnAnchors.push(entryAnchor);
        const sectorHeight = sectorBottomY - sectorTopY;
        const sectorContentWidth = sectorRightX - sectorLeftX;
        if (sectorContentWidth > SEAMLESS_SECTOR_RUNTIME_WIDTH) {
            throw new Error(`${sectorDefinition.id} exceeds the seamless Sector width`);
        }
        if (sectorHeight > SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT) {
            throw new Error(`${sectorDefinition.id} exceeds the seamless Sector height`);
        }
        const sectorCenterX = (sectorLeftX + sectorRightX) * 0.5;
        sectors.push(
            freezeValue({
                id: sectorDefinition.id,
                order: sectorIndex + 1,
                width: SEAMLESS_SECTOR_RUNTIME_WIDTH,
                bounds: {
                    x: sectorCenterX - SEAMLESS_SECTOR_RUNTIME_WIDTH * 0.5,
                    y: sectorTopY,
                    width: SEAMLESS_SECTOR_RUNTIME_WIDTH,
                    height: sectorHeight
                },
                sectorEntryId: entryAnchor.id,
                respawnAnchorId: entryAnchor.id,
                landmarkIds: sectorLandmarks.map(({ id }) => id),
                entryLandmarkId: firstLandmark.id,
                exitLandmarkId: lastLandmark.id
            })
        );
        sectorBaseY = lastLandmark.exit.y;
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
        objects,
        objectives,
        gates: [],
        windZones,
        scannerGroups
    });
}
