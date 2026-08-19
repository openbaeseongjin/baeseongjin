function isRouteUnlocked(progress, routeId) {
    if (typeof progress.isRouteUnlocked === "function") {
        return progress.isRouteUnlocked(routeId);
    }
    return Array.isArray(progress.unlockedRouteIds) && progress.unlockedRouteIds.includes(routeId);
}

export function isSurfaceEnabledForProgress(surface, progress) {
    // Inverse of requiredRouteId: a barrier that is solid while its route is still locked and
    // disappears once unlocked. Used both for sector-transition locks (see
    // LegacyAreaSeamlessSectorRuntime.js's transitBarrierGeometry()) and for intra-sector
    // connectors whose two landmarks' walkable floors already touch/overlap in world-x, where a
    // normal "absent until unlocked" bridge would leave nothing blocking the shortcut (see
    // connectorSurface()'s overlap branch).
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
