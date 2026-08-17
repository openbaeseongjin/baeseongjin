import { polygonBounds } from "./PolygonGeometry.js";
import { authoredAreaBoundarySurfaces } from "./AuthoredAreaBoundary.js";
import { resolveObjectTriggerBounds } from "./areas/AreaDefinition.js";

function translatePoint(value, offsetY) {
    return Object.freeze({ ...value, x: value.x, y: value.y + offsetY });
}

function translateBounds(value, offsetY) {
    return Object.freeze({ ...value, x: value.x, y: value.y + offsetY });
}

function translateSurface(areaId, surface, offsetY) {
    const vertices = Object.freeze(surface.vertices.map((vertex) => translatePoint(vertex, offsetY)));
    const bounds = polygonBounds(vertices);
    return Object.freeze({
        ...surface,
        ...bounds,
        areaId,
        ...(surface.position ? { position: translatePoint(surface.position, offsetY) } : {}),
        vertices,
        topY: surface.topY === undefined ? bounds.y : surface.topY + offsetY,
        ...(surface.oneWay ? { oneWayEdgeEnd: surface.oneWayEdgeEnd ?? 1 } : {})
    });
}

function translateObject(areaId, object, offsetY) {
    const position = translatePoint(object.position, offsetY);
    const bounds = object.trigger
        ? resolveObjectTriggerBounds(position, object.trigger)
        : object.bounds
          ? translateBounds(object.bounds, offsetY)
          : null;
    const activation = object.activationSpec
        ? resolveObjectTriggerBounds(position, object.activationSpec)
        : object.activation
          ? translateBounds(object.activation, offsetY)
          : null;
    return Object.freeze({
        ...object,
        areaId,
        position,
        ...(bounds ? { bounds } : {}),
        ...(activation ? { activation } : {}),
        ...(object.patrol
            ? {
                  patrol: Object.freeze({
                      ...object.patrol,
                      ...(object.patrol.points
                          ? {
                                points: Object.freeze(
                                    object.patrol.points.map((point) => translatePoint(point, offsetY))
                                )
                            }
                          : {}),
                      ...(object.patrol.route
                          ? { route: Object.freeze(object.patrol.route.map((point) => translatePoint(point, offsetY))) }
                          : {}),
                      ...(object.patrol.corridor
                          ? {
                                corridor: Object.freeze({
                                    start: translatePoint(object.patrol.corridor.start, offsetY),
                                    end: translatePoint(object.patrol.corridor.end, offsetY)
                                })
                            }
                          : {})
                  })
              }
            : {})
    });
}

function translateWindZone(areaId, windZone, offsetY) {
    return Object.freeze({ ...windZone, areaId, bounds: translateBounds(windZone.bounds, offsetY) });
}

function translateObjective(areaId, objective, offsetY) {
    return Object.freeze({
        ...objective,
        areaId,
        ...(objective.bounds ? { bounds: translateBounds(objective.bounds, offsetY) } : {})
    });
}

function translateGate(areaId, gate, offsetY) {
    return Object.freeze({
        ...gate,
        areaId,
        trigger: translateBounds(gate.trigger, offsetY)
    });
}

const SCANNER_CYCLE_KEYS = ["available", "warning", "locked", "reset"];

function validateScannerGroup(definition, group, surfacesById, groupBySurfaceId) {
    const groupId = group?.id;
    if (typeof groupId !== "string" || !groupId.trim()) {
        throw new Error(`scanner group in '${definition.id}' requires a non-empty id`);
    }
    if (!groupId.startsWith(`${definition.id}:`)) {
        throw new Error(`scanner group '${groupId}' must use the '${definition.id}' area prefix`);
    }
    const cycle = group.cycle ?? {};
    for (const key of SCANNER_CYCLE_KEYS) {
        if (!Number.isFinite(cycle[key]) || cycle[key] <= 0) {
            throw new Error(`scanner group '${groupId}' cycle.${key} must be finite and positive`);
        }
    }
    if (!Number.isFinite(group.phaseOffsetSeconds ?? 0)) {
        throw new Error(`scanner group '${groupId}' phaseOffsetSeconds must be finite`);
    }
    for (const surfaceId of group.controlledSurfaceIds ?? []) {
        if (groupBySurfaceId.has(surfaceId)) {
            throw new Error(`surface '${surfaceId}' is controlled by multiple scanner groups`);
        }
        const surface = surfacesById.get(surfaceId);
        if (!surface) {
            throw new Error(`scanner group '${groupId}' controls unknown surface '${surfaceId}'`);
        }
        if (surface.grappleable === false) {
            throw new Error(`scanner group '${groupId}' cannot control non-grappleable surface '${surfaceId}'`);
        }
        groupBySurfaceId.set(surfaceId, groupId);
    }
}

export function assembleAuthoredWorld(catalog, { seed, floorY, checkpointRadius = 38, summitRadius = 42 } = {}) {
    const surfaces = [];
    const route = [];
    const enemySpawns = [];
    const checkpoints = [];
    const areas = [];
    const objects = [];
    const gates = [];
    const windZones = [];
    const objectives = [];
    const scannerGroups = [];
    const scannerGroupIds = new Set();
    let originY = floorY;

    for (const [index, definition] of catalog.areas.entries()) {
        const areaBounds = Object.freeze({
            x: -definition.bounds.width * 0.5,
            y: originY - definition.bounds.height,
            width: definition.bounds.width,
            height: definition.bounds.height
        });
        const entry = translatePoint(definition.entry, originY);
        const exit = translatePoint(definition.exit, originY);
        const gate = translateGate(definition.id, definition.gate, originY);
        const areaBoundary = Object.freeze({ id: definition.id, bounds: areaBounds, exit });
        const surfacesById = new Map(definition.surfaces.map((surface) => [surface.id, surface]));
        const groupBySurfaceId = new Map();
        const areaScannerGroups = [];
        for (const group of definition.scannerGroups ?? []) {
            if (scannerGroupIds.has(group.id)) throw new Error(`duplicate scanner group '${group.id}'`);
            validateScannerGroup(definition, group, surfacesById, groupBySurfaceId);
            scannerGroupIds.add(group.id);
            const translated = Object.freeze({ ...group, areaId: definition.id });
            areaScannerGroups.push(translated);
            scannerGroups.push(translated);
        }
        const areaSurfaces = definition.surfaces.map((surface) => {
            const translated = translateSurface(definition.id, surface, originY);
            const groupId = groupBySurfaceId.get(surface.id);
            return groupId ? Object.freeze({ ...translated, grappleAccessGroup: groupId }) : translated;
        });
        const boundarySurfaces = authoredAreaBoundarySurfaces(areaBoundary, gate);
        const areaRoute = definition.routePoints.map((routePoint) => {
            const translated = translatePoint(routePoint, originY);
            return Object.freeze({
                ...translated,
                areaId: definition.id,
                level: route.length,
                x: translated.x - 16,
                y: translated.y,
                topY: translated.y,
                width: 32,
                height: 32
            });
        });
        const areaObjects = definition.objects.map((object) => translateObject(definition.id, object, originY));
        const areaObjectives = definition.objectives.map((objective) =>
            translateObjective(definition.id, objective, originY)
        );
        surfaces.push(...areaSurfaces, ...boundarySurfaces);
        route.push(...areaRoute);
        objects.push(...areaObjects);
        objectives.push(...areaObjectives);
        gates.push(gate);
        const windSourcesByZoneId = new Map(
            areaObjects
                .filter(({ kind, zone }) => kind === "wind-source" && zone)
                .map((object) => [object.windZoneId, object])
        );
        windZones.push(
            ...definition.windZones.map((zone) => {
                const source = windSourcesByZoneId.get(zone.id);
                const bounds = source ? resolveObjectTriggerBounds(source.position, source.zone) : zone.bounds;
                return Object.freeze({
                    ...translateWindZone(definition.id, { ...zone, bounds }, originY),
                    ...(source ? { sourceObjectId: source.id } : {})
                });
            })
        );
        enemySpawns.push(
            ...areaObjects
                .filter(({ kind }) => kind === "sentry" || kind === "patrol-drone")
                .map((object) =>
                    Object.freeze({
                        x: object.position.x,
                        y: object.position.y,
                        level: index,
                        areaId: definition.id,
                        objectId: object.id,
                        enemyType: object.enemyType ?? object.kind,
                        activation: object.activation ?? null,
                        patrol: object.patrol ?? null,
                        rules: object.rules ?? Object.freeze([])
                    })
                )
        );
        checkpoints.push(
            Object.freeze({
                id: `checkpoint:${definition.id}`,
                areaId: definition.id,
                level: index,
                x: entry.x,
                y: entry.y,
                radius: checkpointRadius
            })
        );
        checkpoints.push(
            ...definition.checkpoints.map((checkpoint, checkpointIndex) => {
                const translated = translatePoint(checkpoint, originY);
                return Object.freeze({
                    ...translated,
                    areaId: definition.id,
                    level: index + (checkpointIndex + 1) / (definition.checkpoints.length + 1),
                    radius: checkpoint.radius ?? checkpointRadius
                });
            })
        );
        areas.push(
            Object.freeze({
                id: definition.id,
                sectorId: definition.sectorId,
                order: definition.order,
                name: definition.name,
                subtitle: definition.subtitle,
                bounds: areaBounds,
                entry,
                exit,
                nextAreaId: definition.nextAreaId,
                surfaceIds: Object.freeze([...areaSurfaces, ...boundarySurfaces].map(({ id }) => id)),
                objectIds: Object.freeze(areaObjects.map(({ id }) => id)),
                objectiveIds: Object.freeze(areaObjectives.map(({ id }) => id)),
                gateId: gate.id,
                recoveryPoints: Object.freeze(
                    definition.recoveryPoints.map((recovery) => translatePoint(recovery, originY))
                ),
                checkpointIds: Object.freeze([
                    `checkpoint:${definition.id}`,
                    ...definition.checkpoints.map(({ id }) => id)
                ]),
                storyTriggers: definition.storyTriggers,
                scannerGroupIds: Object.freeze(areaScannerGroups.map(({ id }) => id)),
                routes: definition.routes,
                cameraZones: definition.cameraZones,
                cueIds: definition.cueIds
            })
        );
        originY -= definition.bounds.height;
    }

    const finalArea = areas.at(-1);
    const summit = Object.freeze({
        x: finalArea.exit.x,
        y: finalArea.exit.y,
        radius: summitRadius
    });

    return Object.freeze({
        seed,
        definitionId: catalog.id,
        definitionRevision: catalog.revision,
        surfaces: Object.freeze(surfaces),
        route: Object.freeze(route),
        enemySpawns: Object.freeze(enemySpawns),
        checkpoints: Object.freeze(checkpoints),
        summit,
        topY: finalArea.bounds.y,
        areas: Object.freeze(areas),
        objects: Object.freeze(objects),
        objectives: Object.freeze(objectives),
        gates: Object.freeze(gates),
        windZones: Object.freeze(windZones),
        scannerGroups: Object.freeze(scannerGroups)
    });
}
