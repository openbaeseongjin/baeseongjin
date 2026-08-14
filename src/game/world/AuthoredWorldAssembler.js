import { polygonBounds } from "./PolygonGeometry.js";

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
        vertices,
        topY: surface.topY === undefined ? bounds.y : surface.topY + offsetY,
        ...(surface.oneWay ? { oneWayEdgeEnd: surface.oneWayEdgeEnd ?? 1 } : {})
    });
}

function translateObject(areaId, object, offsetY) {
    return Object.freeze({
        ...object,
        areaId,
        position: translatePoint(object.position, offsetY),
        ...(object.bounds ? { bounds: translateBounds(object.bounds, offsetY) } : {}),
        ...(object.activation ? { activation: translateBounds(object.activation, offsetY) } : {}),
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
        trigger: translateBounds(gate.trigger, offsetY),
        ...(gate.barrier ? { barrier: translateBounds(gate.barrier, offsetY) } : {})
    });
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
    let originY = floorY;

    for (const [index, definition] of catalog.areas.entries()) {
        const areaSurfaces = definition.surfaces.map((surface) => translateSurface(definition.id, surface, originY));
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
        const entry = translatePoint(definition.entry, originY);
        const exit = translatePoint(definition.exit, originY);
        const gate = translateGate(definition.id, definition.gate, originY);
        const areaBounds = Object.freeze({
            x: -definition.bounds.width * 0.5,
            y: originY - definition.bounds.height,
            width: definition.bounds.width,
            height: definition.bounds.height
        });

        surfaces.push(...areaSurfaces);
        route.push(...areaRoute);
        objects.push(...areaObjects);
        objectives.push(...areaObjectives);
        gates.push(gate);
        windZones.push(...definition.windZones.map((zone) => translateWindZone(definition.id, zone, originY)));
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
                radius: checkpointRadius,
                reward: false
            })
        );
        checkpoints.push(
            ...definition.checkpoints.map((checkpoint, checkpointIndex) => {
                const translated = translatePoint(checkpoint, originY);
                return Object.freeze({
                    ...translated,
                    areaId: definition.id,
                    level: index + (checkpointIndex + 1) / (definition.checkpoints.length + 1),
                    radius: checkpoint.radius ?? checkpointRadius,
                    reward: Boolean(checkpoint.reward)
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
                surfaceIds: Object.freeze(areaSurfaces.map(({ id }) => id)),
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
        windZones: Object.freeze(windZones)
    });
}
