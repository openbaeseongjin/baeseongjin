export function isSurfaceEnabledForProgress(surface, progress) {
    if (!surface.requiredRouteId || !progress) return true;
    if (typeof progress.isRouteUnlocked === "function") {
        return progress.isRouteUnlocked(surface.requiredRouteId);
    }
    return Array.isArray(progress.unlockedRouteIds) && progress.unlockedRouteIds.includes(surface.requiredRouteId);
}

export function collisionSurfacesForProgress(world, progress) {
    return world.surfaces;
}

export function collisionSurfacesForSectorProgress(world, progress) {
    if (!progress) return world.surfaces;
    return Object.freeze(world.surfaces.filter((surface) => isSurfaceEnabledForProgress(surface, progress)));
}
