function isRouteUnlocked(progress, routeId) {
    if (typeof progress.isRouteUnlocked === "function") {
        return progress.isRouteUnlocked(routeId);
    }
    return Array.isArray(progress.unlockedRouteIds) && progress.unlockedRouteIds.includes(routeId);
}

function isObjectiveComplete(progress, objectiveId) {
    if (typeof progress.isObjectiveComplete === "function") {
        return progress.isObjectiveComplete(objectiveId);
    }
    return Array.isArray(progress.completedObjectiveIds) && progress.completedObjectiveIds.includes(objectiveId);
}

export function isSurfaceEnabledForProgress(surface, progress) {
    if (!progress) return true;
    if (surface.blockedByObjectiveId) return !isObjectiveComplete(progress, surface.blockedByObjectiveId);
    if (surface.kind !== "sector-transit-barrier" || !surface.blockedByRouteId) return true;
    return !isRouteUnlocked(progress, surface.blockedByRouteId);
}

export function collisionSurfacesForProgress(world, progress) {
    return world.surfaces;
}

export function collisionSurfacesForSectorProgress(world, progress) {
    if (!progress) return world.surfaces;
    return Object.freeze(world.surfaces.filter((surface) => isSurfaceEnabledForProgress(surface, progress)));
}
