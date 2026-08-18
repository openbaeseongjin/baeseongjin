export function collisionSurfacesForProgress(world, progress) {
    return world.surfaces;
}

export function collisionSurfacesForSectorProgress(world, progress) {
    if (!progress) return world.surfaces;
    return Object.freeze(
        world.surfaces.filter(
            (surface) => !surface.requiredRouteId || progress.isRouteUnlocked(surface.requiredRouteId)
        )
    );
}
