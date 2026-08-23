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
import { BOSS_STAGE_CATALOG } from "../../boss-authoring/BossStageCatalog.js";
import { isAuthoredRuntimeContentBoundary } from "../area-authoring-v2/AreaRuntimePromotion.js";
import { ACCESS_MODULE_SOURCE_KIND } from "./SectorDefinition.js";

export const SEAMLESS_SECTOR_RUNTIME_REVISION = "authored-continuous-stage-runtime-v16-two-boss-stage";

const DEFAULT_AUTHORED_AREA_CATALOGS = Object.freeze([
    SECTOR_01_AREA_CATALOG,
    SECTOR_02_AREA_CATALOG,
    SECTOR_03_AREA_CATALOG,
    SECTOR_04_AREA_CATALOG,
    SECTOR_05_AREA_CATALOG,
    SECTOR_06_AREA_CATALOG
]);
const BOSS_ARENA_ISOLATION_X = 7000;
const ENEMY_OBJECT_KIND_LOOKUP = Object.freeze({
    sentry: true,
    "patrol-drone": true
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
    const { areaId: _areaId, ...rest } = object;
    return freezeValue({
        ...rest,
        landmarkId: landmark.id,
        stageId: landmark.stageId,
        position: shiftPoint(object.position, dx, dy),
        ...(object.bounds ? { bounds: shiftBounds(object.bounds, dx, dy) } : {}),
        ...(object.activation ? { activation: shiftBounds(object.activation, dx, dy) } : {}),
        ...(object.patrol ? { patrol: shiftPatrol(object.patrol, dx, dy) } : {}),
        ...(object.objectiveId ? { objectiveId: objectiveIdBySourceId[object.objectiveId] ?? object.objectiveId } : {}),
        ...(object.gateId && routeLockId ? { routeLockId } : {})
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

function routeMouthBounds(exit) {
    return freezeValue({
        x: exit.x - 96,
        y: exit.y - 64,
        width: 192,
        height: 112
    });
}

function runtimeObjectiveBounds({ objective, dx, dy }) {
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

function bossStageSurface(surface, dx, dy, stageId, grappleAccessGroup = null) {
    const bounds = shiftBounds(surface.bounds, dx, dy);
    return freezeValue({
        id: surface.id,
        kind: surface.kind,
        bossStageId: stageId,
        collision: surface.collision !== false,
        oneWay: surface.oneWay === true,
        oneWayEdgeEnd: surface.oneWay === true ? 1 : undefined,
        grappleable: surface.grappleable !== false,
        ...(surface.losOccluder === true ? { losOccluder: true } : {}),
        ...(grappleAccessGroup ? { grappleAccessGroup } : {}),
        ropeOccluder: surface.ropeOccluder !== false,
        projectileOccluder: surface.projectileOccluder !== false,
        renderable: surface.renderable !== false,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        topY: bounds.y,
        position: { x: bounds.x + bounds.width * 0.5, y: bounds.y },
        vertices: rectangleVertices(bounds)
    });
}

function createBossStageRuntimeDefinition(spec, sourceLandmark, targetLandmark, entryRouteId) {
    const dx = BOSS_ARENA_ISOLATION_X - spec.arena.entry.x;
    const dy = sourceLandmark.exit.y - spec.arena.entry.y;
    const bounds = shiftBounds(spec.arena.bounds, dx, dy);
    const entry = shiftPoint(spec.arena.entry, dx, dy);
    const exit = shiftPoint(spec.arena.exit, dx, dy);
    const scannerGroupBySurfaceId = Object.create(null);
    for (const group of spec.arena.scannerGroups ?? []) {
        for (const surfaceId of group.controlledSurfaceIds) scannerGroupBySurfaceId[surfaceId] = group.id;
    }
    return freezeValue({
        id: spec.id,
        specRevision: spec.schemaVersion,
        sourceAreaId: spec.sourceAreaId,
        sourceLandmarkId: sourceLandmark.id,
        targetLandmarkId: targetLandmark?.id ?? null,
        entryRouteId,
        terminalCompletion: spec.transition?.terminalCompletion ?? null,
        bounds,
        sourceTrigger: sourceLandmark.gateTrigger,
        entry,
        exit,
        exitTrigger: routeMouthBounds(exit),
        targetEntry: targetLandmark?.entry ?? null,
        surfaces: spec.arena.surfaces.map((surface) =>
            bossStageSurface(surface, dx, dy, spec.id, scannerGroupBySurfaceId[surface.id] ?? null)
        ),
        scannerGroups: (spec.arena.scannerGroups ?? []).map((group) =>
            freezeValue({ ...group, bossStageId: spec.id, areaId: spec.id })
        ),
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
    areaOverrides = null,
    bossStageSpec = null,
    bossStageSpecs = null,
    areaCatalogs = DEFAULT_AUTHORED_AREA_CATALOGS
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
    const stageTransitions = [];
    const routeLocks = [];
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

        for (const [landmarkIndex, area] of sourceCatalog.areas.entries()) {
            assertRuntimeContentBoundary(area);
            const landmarkDefinition = sectorDefinition.landmarks[landmarkIndex];
            const localWorld = isolatedAreaWorld(area, seed);
            const localArea = localWorld.areas[0];
            const dx = 0;
            const previousSectorLandmark = sectorLandmarks.at(-1);
            const localDy = previousSectorLandmark ? previousSectorLandmark.localBounds.y : -localArea.entry.y;
            const localEntry = shiftPoint(localArea.entry, dx, localDy);
            const localExit = shiftPoint(localArea.exit, dx, localDy);
            const localCoreBounds = shiftBounds(localArea.bounds, dx, localDy);
            const localBounds = localCoreBounds;
            const dy = sectorWorldOriginY + localDy;
            const entry = shiftPoint(localArea.entry, dx, dy);
            const exit = shiftPoint(localArea.exit, dx, dy);
            const coreBounds = shiftBounds(localArea.bounds, dx, dy);
            const bounds = coreBounds;
            const nextLandmarkDefinition =
                sectorDefinition.landmarks[landmarkIndex + 1] ??
                authoredSectorCatalog.sectors[sectorIndex + 1]?.landmarks[0] ??
                null;
            const outboundRouteId = nextLandmarkDefinition
                ? routeId(landmarkDefinition.id, nextLandmarkDefinition.id)
                : null;
            const objectiveIdBySourceId = Object.freeze(
                Object.fromEntries(
                    area.objectives.map((objective, index) => [objective.id, landmarkDefinition.objectives[index]?.id])
                )
            );
            const landmarkObjectives = landmarkDefinition.objectives.map((objective) =>
                freezeValue({
                    ...objective,
                    landmarkId: landmarkDefinition.id,
                    bounds: runtimeObjectiveBounds({ objective, dx, dy })
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
            const landmarkSurfaces = localWorld.surfaces.map((surface) =>
                shiftSurface(surface, dx, dy, landmarkDefinition, area.id, objectiveIdBySourceId)
            );
            const landmarkObjects = localWorld.objects
                .filter(({ kind }) => ENEMY_OBJECT_KIND_LOOKUP[kind] !== true)
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
                gateId: area.gate.id,
                gateTrigger: shiftBounds(area.gate.trigger, dx, dy),
                nextAreaId: area.gate.nextAreaId,
                respawnAnchorId,
                surfaceIds: landmarkSurfaces.map(({ id }) => id),
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

            if (previousLandmark) {
                const lockId = routeId(previousLandmark.id, runtimeLandmark.id);
                const sectorTransition = previousLandmark.sectorId !== runtimeLandmark.sectorId;
                const sourceSectorDefinition = authoredSectorCatalog.sectors.find(
                    ({ id }) => id === previousLandmark.sectorId
                );
                const stageTransition = freezeValue({
                    id: `${lockId}:stage-transition`,
                    routeLockId: lockId,
                    gateId: previousLandmark.gateId,
                    sourceLandmarkId: previousLandmark.id,
                    targetLandmarkId: runtimeLandmark.id,
                    sourceAreaId: previousLandmark.areaId,
                    targetAreaId: runtimeLandmark.areaId,
                    trigger: previousLandmark.gateTrigger,
                    targetEntry: runtimeLandmark.entry,
                    sectorTransition
                });
                stageTransitions.push(stageTransition);
                routeLocks.push(
                    freezeValue({
                        id: lockId,
                        sourceLandmarkId: previousLandmark.id,
                        targetLandmarkId: runtimeLandmark.id,
                        stageTransitionId: stageTransition.id,
                        requiredObjectiveIds: previousOutboundObjectiveIds,
                        ...(stageTransition.sectorTransition
                            ? { requiredAccessModuleCount: sourceSectorDefinition.accessModuleRequirement }
                            : {}),
                        sectorTransition: stageTransition.sectorTransition
                    })
                );
            }

            surfaces.push(...landmarkSurfaces);
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
        const sectorBounds = {
            x: sectorLeftX,
            y: sectorWorldOriginY + sectorLocalTopY,
            width: sectorContentWidth,
            height: sectorHeight
        };
        sectors.push(
            freezeValue({
                id: sectorDefinition.id,
                order: sectorDefinition.order,
                width: sectorContentWidth,
                origin: { x: 0, y: sectorWorldOriginY },
                localBounds: {
                    x: sectorLeftX,
                    y: sectorLocalTopY,
                    width: sectorContentWidth,
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
            const nextSectorFirstArea = authoredAreaCatalogs[sectorIndex + 1].areas[0];
            sectorWorldOriginY = sectorBounds.y + nextSectorFirstArea.entry.y;
        }
    }

    for (const spec of configuredBossStageSpecs) {
        const sourceLandmark = landmarks.find((landmark) => bossAreaMatches(landmark, spec.sourceAreaId));
        const targetLandmark = spec.nextAreaId
            ? landmarks.find((landmark) => bossAreaMatches(landmark, spec.nextAreaId))
            : null;
        if (!sourceLandmark || (spec.nextAreaId && !targetLandmark)) continue;
        const routeLock = targetLandmark
            ? routeLocks.find(
                  ({ sourceLandmarkId, targetLandmarkId }) =>
                      sourceLandmarkId === sourceLandmark.id && targetLandmarkId === targetLandmark.id
              )
            : null;
        const bossStage = createBossStageRuntimeDefinition(spec, sourceLandmark, targetLandmark, routeLock?.id ?? null);
        bossStages.push(bossStage);
        surfaces.push(...bossStage.surfaces);
        route.push(...bossStage.route);
        scannerGroups.push(...bossStage.scannerGroups);
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
        bottomY: Math.max(...landmarks.map(({ bounds }) => bounds.y + bounds.height)),
        areas: [],
        landmarks,
        stageIdentities: authoredSectorCatalog.stageIdentities.filter(({ runtimePreview }) => runtimePreview),
        sectors,
        sectorEntries,
        respawnAnchors,
        stageTransitions,
        routeLocks,
        bossStages,
        objects,
        objectives,
        gates: [],
        windZones,
        scannerGroups,
        jammerGroups
    });
}
