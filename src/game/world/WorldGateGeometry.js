function routeUnlocked(routeId, progress) {
    if (typeof progress.isRouteUnlocked === "function") return progress.isRouteUnlocked(routeId);
    return Array.isArray(progress.unlockedRouteIds) && progress.unlockedRouteIds.includes(routeId);
}

export function isSurfaceEnabledForProgress(surface, progress) {
    if (surface.requiredRouteId && progress && !routeUnlocked(surface.requiredRouteId, progress)) {
        return false;
    }
    // Inverse of requiredRouteId: a barrier that is solid while its route is still locked and
    // disappears once unlocked. Used where a connector's usual "absent until unlocked" bridge
    // semantics can't block passage - e.g. two landmarks whose walkable floors already touch/overlap
    // in world-x, so removing a surface leaves nothing blocking the shortcut (see
    // LegacyAreaSeamlessSectorRuntime.js's connectorSurface() overlap branch).
    if (surface.blockedByRouteId && progress && routeUnlocked(surface.blockedByRouteId, progress)) {
        return false;
    }
    return true;
}

export function collisionSurfacesForProgress(world, progress) {
    return world.surfaces;
}

export function collisionSurfacesForSectorProgress(world, progress) {
    if (!progress) return world.surfaces;
    return Object.freeze(world.surfaces.filter((surface) => isSurfaceEnabledForProgress(surface, progress)));
}
