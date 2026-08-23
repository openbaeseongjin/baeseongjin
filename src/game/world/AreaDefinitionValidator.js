import { assertAuthoredCoordinateAnchor } from "./AuthoredCoordinateAnchor.js";
import { resolveObjectTriggerBounds } from "./areas/AreaDefinition.js";
import { GRAPPLE_LINK_BUDGET, ropeHookReach } from "../config.js";

function issue(code, areaId, details = {}) {
    return Object.freeze({ code, areaId, ...details });
}

function pointInside(bounds, point) {
    return (
        Number.isFinite(point?.x) &&
        Number.isFinite(point?.y) &&
        point.x >= -bounds.width * 0.5 &&
        point.x <= bounds.width * 0.5 &&
        point.y >= -bounds.height &&
        point.y <= 0
    );
}

function surfacePointInside(bounds, point) {
    return (
        Number.isFinite(point?.x) &&
        Number.isFinite(point?.y) &&
        point.x >= -bounds.width * 0.5 &&
        point.x <= bounds.width * 0.5 &&
        point.y >= -bounds.height &&
        point.y <= 160
    );
}

function boundsInside(areaBounds, bounds, { allowFloorOverlap = false, allowConnectorOverlap = false } = {}) {
    if (
        !Number.isFinite(bounds?.x) ||
        !Number.isFinite(bounds?.y) ||
        !Number.isFinite(bounds?.width) ||
        !Number.isFinite(bounds?.height) ||
        bounds.width <= 0 ||
        bounds.height <= 0
    ) {
        return false;
    }
    const maximumY = allowFloorOverlap ? 160 : 0;
    const minimumY = allowConnectorOverlap ? -areaBounds.height - 160 : -areaBounds.height;
    return (
        bounds.x >= -areaBounds.width * 0.5 &&
        bounds.x + bounds.width <= areaBounds.width * 0.5 &&
        bounds.y >= minimumY &&
        bounds.y + bounds.height <= maximumY
    );
}

function pointInsideBounds(bounds, point) {
    return (
        Number.isFinite(point?.x) &&
        Number.isFinite(point?.y) &&
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height
    );
}

function patrolPoints(patrol) {
    if (Array.isArray(patrol?.points)) return patrol.points;
    if (Array.isArray(patrol?.route)) return patrol.route;
    if (patrol?.corridor) return [patrol.corridor.start, patrol.corridor.end];
    return [];
}

function surfaceCenter(surface) {
    if (surface.coordinateAnchor === "center" && Number.isFinite(surface.position?.x)) {
        return { x: surface.position.x, y: surface.position.y };
    }
    const vertices = surface.vertices ?? [];
    if (vertices.length === 0) return surface.position ?? { x: 0, y: 0 };
    const total = vertices.reduce((acc, vertex) => ({ x: acc.x + vertex.x, y: acc.y + vertex.y }), { x: 0, y: 0 });
    return { x: total.x / vertices.length, y: total.y / vertices.length };
}

function surfaceSize(surface) {
    const vertices = surface.vertices ?? [];
    if (vertices.length === 0) return { width: 0, height: 0 };
    const xs = vertices.map(({ x }) => x);
    const ys = vertices.map(({ y }) => y);
    return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

function disconnectedGrappleSurfaces(area, maxAttachDistance) {
    const grappleSurfaces = area.surfaces.filter((surface) => surface.grappleable !== false);
    const centers = grappleSurfaces.map((surface) => ({ surface, center: surfaceCenter(surface) }));
    const visited = new Set();
    const pending = centers.length > 0 ? [0] : [];

    while (pending.length > 0) {
        const currentIndex = pending.pop();
        if (visited.has(currentIndex)) continue;
        visited.add(currentIndex);
        const current = centers[currentIndex];
        for (const [neighborIndex, neighbor] of centers.entries()) {
            if (visited.has(neighborIndex)) continue;
            if (
                Math.hypot(current.center.x - neighbor.center.x, current.center.y - neighbor.center.y) <=
                maxAttachDistance
            ) {
                pending.push(neighborIndex);
            }
        }
    }

    return centers.filter((_, index) => !visited.has(index)).map(({ surface }) => surface);
}

const PRESENTATION_FILE_PATTERN = /(?:^|[\\/])assets[\\/]|\.(?:png|jpe?g|webp|gif|wav|mp3|ogg|m4a|aac)(?:$|[?#])/i;

function validateNoEmbeddedPresentationPaths(area, issues) {
    const stack = [{ value: area, path: area.id }];
    while (stack.length > 0) {
        const { value, path } = stack.pop();
        if (typeof value === "string") {
            if (PRESENTATION_FILE_PATTERN.test(value)) {
                issues.push(issue("presentation-path-embedded", area.id, { path, value }));
            }
            continue;
        }
        if (!value || typeof value !== "object") continue;
        for (const [key, entry] of Object.entries(value)) {
            stack.push({ value: entry, path: `${path}.${key}` });
        }
    }
}

function validateUniqueIds(area, collection, label, issues, globalIds) {
    const localIds = new Set();
    for (const entry of collection) {
        if (typeof entry?.id !== "string" || entry.id.length === 0) {
            issues.push(issue(`${label}-id-missing`, area.id));
            continue;
        }
        if (localIds.has(entry.id)) issues.push(issue(`${label}-id-duplicate`, area.id, { id: entry.id }));
        if (globalIds.has(entry.id)) issues.push(issue("catalog-id-duplicate", area.id, { id: entry.id }));
        localIds.add(entry.id);
        globalIds.add(entry.id);
    }
}

function validateGrappleLandmarks(area, issues) {
    const grappleTargets = area.surfaces.filter(({ kind }) => kind === "ropeable-surface");
    const grappleLandmarks = area.objects.filter(({ kind }) => kind === "grapple-landmark");

    for (const surface of grappleTargets) {
        const landmarkId = surface.id.endsWith("-surface") ? surface.id.slice(0, -"-surface".length) : null;
        if (!landmarkId) {
            issues.push(issue("grapple-target-id", area.id, { id: surface.id }));
            continue;
        }
        const landmark = grappleLandmarks.find(({ id }) => id === landmarkId);
        if (!landmark) {
            issues.push(issue("grapple-landmark-missing", area.id, { id: surface.id, landmarkId }));
            continue;
        }
        if (landmark.position.x !== surface.position.x || landmark.position.y !== surface.position.y) {
            issues.push(issue("grapple-landmark-position", area.id, { id: landmark.id, surfaceId: surface.id }));
        }
        if (landmark.coordinateAnchor !== surface.coordinateAnchor) {
            issues.push(
                issue("grapple-landmark-coordinate-anchor", area.id, {
                    id: landmark.id,
                    surfaceId: surface.id
                })
            );
        }
    }

    for (const landmark of grappleLandmarks) {
        const surfaceId = `${landmark.id}-surface`;
        if (!grappleTargets.some(({ id }) => id === surfaceId)) {
            issues.push(issue("grapple-target-missing", area.id, { id: landmark.id, surfaceId }));
        }
    }
}

export function validateAreaCatalog(catalog, { maxAttachDistance = GRAPPLE_LINK_BUDGET } = {}) {
    const issues = [];
    const areaIds = new Set(catalog.areas.map(({ id }) => id));
    const globalIds = new Set();

    for (const [index, area] of catalog.areas.entries()) {
        validateNoEmbeddedPresentationPaths(area, issues);
        if (area.order !== index + 1) issues.push(issue("area-order", area.id, { expected: index + 1 }));
        if (!Number.isFinite(area.bounds?.width) || area.bounds.width <= 0) {
            issues.push(issue("area-bounds-width", area.id));
        }
        if (!Number.isFinite(area.bounds?.height) || area.bounds.height <= 0) {
            issues.push(issue("area-bounds-height", area.id));
        }
        if (!pointInside(area.bounds, area.entry)) issues.push(issue("area-entry-bounds", area.id));
        if (!pointInside(area.bounds, area.exit)) issues.push(issue("area-exit-bounds", area.id));
        if (area.nextAreaId !== null && !areaIds.has(area.nextAreaId)) {
            issues.push(issue("area-next-missing", area.id, { nextAreaId: area.nextAreaId }));
        }
        if (index < catalog.areas.length - 1 && area.nextAreaId !== catalog.areas[index + 1].id) {
            issues.push(issue("area-next-order", area.id, { nextAreaId: area.nextAreaId }));
        }
        if (index === catalog.areas.length - 1 && area.nextAreaId !== null) {
            issues.push(issue("area-final-next", area.id, { nextAreaId: area.nextAreaId }));
        }

        validateUniqueIds(area, area.surfaces, "surface", issues, globalIds);
        validateUniqueIds(area, area.routePoints, "route", issues, globalIds);
        validateUniqueIds(area, area.recoveryPoints, "recovery", issues, globalIds);
        validateUniqueIds(area, area.checkpoints, "checkpoint", issues, globalIds);
        validateUniqueIds(area, area.objects, "object", issues, globalIds);
        validateUniqueIds(area, area.objectives, "objective", issues, globalIds);
        validateUniqueIds(area, area.windZones, "wind", issues, globalIds);
        validateGrappleLandmarks(area, issues);
        if (globalIds.has(area.gate.id)) issues.push(issue("catalog-id-duplicate", area.id, { id: area.gate.id }));
        globalIds.add(area.gate.id);

        for (const surface of area.surfaces) {
            const size = surfaceSize(surface);
            if (
                surface.collision !== false &&
                surface.renderable !== false &&
                surface.oneWay === false &&
                surface.grappleable === false &&
                size.width > size.height
            ) {
                issues.push(issue("solid-horizontal-not-grappleable", area.id, { id: surface.id }));
            }
            try {
                assertAuthoredCoordinateAnchor(surface.coordinateAnchor, `${surface.id}.coordinateAnchor`);
            } catch {
                issues.push(
                    issue("surface-coordinate-anchor", area.id, {
                        id: surface.id,
                        coordinateAnchor: surface.coordinateAnchor
                    })
                );
            }
            for (const vertex of surface.vertices) {
                if (!surfacePointInside(area.bounds, vertex)) {
                    issues.push(issue("surface-bounds", area.id, { id: surface.id }));
                    break;
                }
            }
        }
        for (const [routeIndex, routePoint] of area.routePoints.entries()) {
            if (!pointInside(area.bounds, routePoint))
                issues.push(issue("route-bounds", area.id, { id: routePoint.id }));
            if (routeIndex === 0) continue;
        }
        for (const surface of disconnectedGrappleSurfaces(area, maxAttachDistance)) {
            issues.push(
                issue("grapple-surface-isolated", area.id, {
                    id: surface.id,
                    limit: maxAttachDistance
                })
            );
        }
        for (const object of area.objects) {
            if (!pointInside(area.bounds, object.position))
                issues.push(issue("object-bounds", area.id, { id: object.id }));
            try {
                assertAuthoredCoordinateAnchor(object.coordinateAnchor, `${object.id}.coordinateAnchor`);
            } catch {
                issues.push(
                    issue("object-coordinate-anchor", area.id, {
                        id: object.id,
                        coordinateAnchor: object.coordinateAnchor
                    })
                );
            }
            if (object.bounds && !boundsInside(area.bounds, object.bounds)) {
                issues.push(issue("object-trigger-bounds", area.id, { id: object.id }));
            }
            if (object.activation && !boundsInside(area.bounds, object.activation)) {
                issues.push(issue("object-activation-bounds", area.id, { id: object.id }));
            }
            if (object.activationSpec && object.activation) {
                issues.push(issue("object-activation-spec-conflict", area.id, { id: object.id }));
            }
            if (object.trigger && object.bounds) {
                issues.push(issue("object-trigger-spec-conflict", area.id, { id: object.id }));
            }
            if (object.patrol) {
                const points = patrolPoints(object.patrol);
                if (!object.activation && !object.activationSpec) {
                    issues.push(issue("patrol-activation-missing", area.id, { id: object.id }));
                }
                if (!Number.isFinite(object.patrol.speed) || object.patrol.speed <= 0) {
                    issues.push(issue("patrol-speed", area.id, { id: object.id }));
                }
                if (points.length < 2) issues.push(issue("patrol-route", area.id, { id: object.id }));
                for (const [pointIndex, patrolPoint] of points.entries()) {
                    if (!pointInside(area.bounds, patrolPoint)) {
                        issues.push(issue("patrol-point-bounds", area.id, { id: object.id, pointIndex }));
                    }
                    if (object.activation && !pointInsideBounds(object.activation, patrolPoint)) {
                        issues.push(issue("patrol-point-activation", area.id, { id: object.id, pointIndex }));
                    }
                }
            }
        }
        for (const recovery of area.recoveryPoints) {
            if (!pointInside(area.bounds, recovery)) {
                issues.push(issue("recovery-bounds", area.id, { id: recovery.id }));
            }
        }
        for (const checkpoint of area.checkpoints) {
            if (!pointInside(area.bounds, checkpoint)) {
                issues.push(issue("checkpoint-bounds", area.id, { id: checkpoint.id }));
            }
            if (checkpoint.sourceObjectId && !area.objects.some(({ id }) => id === checkpoint.sourceObjectId)) {
                issues.push(
                    issue("checkpoint-source-missing", area.id, {
                        checkpointId: checkpoint.id,
                        sourceObjectId: checkpoint.sourceObjectId
                    })
                );
            }
        }
        for (const objective of area.objectives) {
            if (objective.sourceObjectId && !area.objects.some(({ id }) => id === objective.sourceObjectId)) {
                issues.push(
                    issue("objective-source-missing", area.id, {
                        objectiveId: objective.id,
                        sourceObjectId: objective.sourceObjectId
                    })
                );
            }
            if (objective.bounds && !boundsInside(area.bounds, objective.bounds, { allowFloorOverlap: true })) {
                issues.push(issue("objective-bounds", area.id, { objectiveId: objective.id }));
            }
            for (const requiredObjectiveId of objective.requiredObjectiveIds ?? []) {
                if (!area.objectives.some(({ id }) => id === requiredObjectiveId)) {
                    issues.push(
                        issue("objective-requirement-missing", area.id, {
                            objectiveId: objective.id,
                            requiredObjectiveId
                        })
                    );
                }
                if (requiredObjectiveId === objective.id) {
                    issues.push(issue("objective-requirement-self", area.id, { objectiveId: objective.id }));
                }
            }
            if (
                objective.completionDelaySeconds !== undefined &&
                (!Number.isFinite(objective.completionDelaySeconds) || objective.completionDelaySeconds <= 0)
            ) {
                issues.push(
                    issue("objective-completion-delay", area.id, {
                        objectiveId: objective.id,
                        completionDelaySeconds: objective.completionDelaySeconds
                    })
                );
            }
            if (objective.completionDelaySeconds !== undefined && objective.type !== "interact") {
                issues.push(issue("objective-completion-delay-type", area.id, { objectiveId: objective.id }));
            }
            if (objective.type === "state-check") {
                const sources = objective.sources;
                if (
                    !Array.isArray(sources) ||
                    sources.length === 0 ||
                    sources.some((id) => typeof id !== "string" || id.length === 0) ||
                    new Set(sources).size !== sources.length
                ) {
                    issues.push(issue("objective-state-check-sources", area.id, { objectiveId: objective.id }));
                }
                if (
                    !Number.isSafeInteger(objective.requiredCount) ||
                    objective.requiredCount <= 0 ||
                    objective.requiredCount > (sources?.length ?? 0) ||
                    !objective.bounds
                ) {
                    issues.push(issue("objective-state-check-requirement", area.id, { objectiveId: objective.id }));
                }
            }
        }
        const authoredCameraZones = area.cameraZones.filter((zone) => zone && typeof zone === "object");
        for (const zone of authoredCameraZones) {
            if (
                typeof zone.id !== "string" ||
                !Number.isFinite(zone.minY) ||
                !Number.isFinite(zone.maxY) ||
                zone.minY >= zone.maxY ||
                zone.minY < -area.bounds.height ||
                zone.maxY > 0 ||
                !Number.isFinite(zone.desktopZoom) ||
                zone.desktopZoom <= 0 ||
                !Number.isFinite(zone.mobileZoom) ||
                zone.mobileZoom <= 0 ||
                (zone.horizontalPlayerRatio !== undefined &&
                    (!Number.isFinite(zone.horizontalPlayerRatio) ||
                        zone.horizontalPlayerRatio <= 0 ||
                        zone.horizontalPlayerRatio >= 1)) ||
                (zone.verticalPlayerRatio !== undefined &&
                    (!Number.isFinite(zone.verticalPlayerRatio) ||
                        zone.verticalPlayerRatio <= 0 ||
                        zone.verticalPlayerRatio >= 1))
            ) {
                issues.push(issue("camera-zone", area.id, { cameraZoneId: zone.id ?? null }));
            }
        }
        const windSourceIds = new Set(
            area.objects.filter(({ kind, zone }) => kind === "wind-source" && zone).map(({ windZoneId }) => windZoneId)
        );
        const windSourcesByZoneId = new Map(
            area.objects
                .filter(({ kind, zone }) => kind === "wind-source" && zone)
                .map((object) => [object.windZoneId, object])
        );
        for (const windZone of area.windZones) {
            if (windSourceIds.has(windZone.id)) {
                if (windZone.bounds) {
                    issues.push(issue("wind-bounds-derived", area.id, { id: windZone.id }));
                }
                const source = windSourcesByZoneId.get(windZone.id);
                if (source && !boundsInside(area.bounds, resolveObjectTriggerBounds(source.position, source.zone))) {
                    issues.push(issue("wind-bounds", area.id, { id: windZone.id }));
                }
                continue;
            }
            if (!boundsInside(area.bounds, windZone.bounds)) {
                issues.push(issue("wind-bounds", area.id, { id: windZone.id }));
            }
        }
        if (
            !boundsInside(area.bounds, area.gate.trigger, {
                allowFloorOverlap: true,
                allowConnectorOverlap: true
            })
        ) {
            issues.push(issue("gate-trigger-bounds", area.id, { gateId: area.gate.id }));
        }
        for (const objectiveId of area.gate.requiredObjectiveIds) {
            if (!area.objectives.some(({ id }) => id === objectiveId)) {
                issues.push(issue("gate-objective-missing", area.id, { gateId: area.gate.id, objectiveId }));
            }
        }
        if (area.gate.nextAreaId !== area.nextAreaId) {
            issues.push(issue("gate-next-mismatch", area.id, { gateId: area.gate.id }));
        }
    }

    return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) });
}
