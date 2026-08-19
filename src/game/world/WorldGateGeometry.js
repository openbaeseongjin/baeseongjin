function isRouteUnlocked(progress, routeId) {
    if (typeof progress.isRouteUnlocked === "function") {
        return progress.isRouteUnlocked(routeId);
    }
    return Array.isArray(progress.unlockedRouteIds) && progress.unlockedRouteIds.includes(routeId);
}

export function isSurfaceEnabledForProgress(surface, progress) {
    if (surface.blockedByRouteId) return !progress || !isRouteUnlocked(progress, surface.blockedByRouteId);
    if (!surface.requiredRouteId || !progress) return true;
    return isRouteUnlocked(progress, surface.requiredRouteId);
}

export function collisionSurfacesForProgress(world, progress) {
    return world.surfaces;
}

export function collisionSurfacesForSectorProgress(world, progress) {
    if (!progress) return world.surfaces;
    return Object.freeze(world.surfaces.filter((surface) => isSurfaceEnabledForProgress(surface, progress)));
}
