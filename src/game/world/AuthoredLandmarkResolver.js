function authoredRegions(world) {
    return world?.landmarks?.length ? world.landmarks : (world?.areas ?? []);
}

function contains(bounds, position) {
    return (
        position.x >= bounds.x &&
        position.x <= bounds.x + bounds.width &&
        position.y >= bounds.y &&
        position.y <= bounds.y + bounds.height
    );
}

function anchorDistance(region, position) {
    const points = [region.entry, region.exit].filter(Boolean);
    if (points.length === 0) return Number.POSITIVE_INFINITY;
    return Math.min(...points.map((point) => Math.hypot(position.x - point.x, position.y - point.y)));
}

function verticalDistance(bounds, position) {
    if (position.y < bounds.y) return bounds.y - position.y;
    if (position.y > bounds.y + bounds.height) return position.y - (bounds.y + bounds.height);
    return 0;
}

export function authoredRegionForPosition(world, position) {
    const regions = authoredRegions(world);
    if (!Array.isArray(regions) || !position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
        return null;
    }
    const containing = regions.filter(({ bounds }) => bounds && contains(bounds, position));
    if (containing.length > 0) {
        return containing.reduce((best, region) => {
            const distance = anchorDistance(region, position);
            const bestDistance = anchorDistance(best, position);
            if (distance !== bestDistance) return distance < bestDistance ? region : best;
            return (region.order ?? 0) > (best.order ?? 0) ? region : best;
        });
    }
    return regions.reduce((best, region) => {
        if (!best) return region;
        const distance = verticalDistance(region.bounds, position);
        const bestDistance = verticalDistance(best.bounds, position);
        if (distance !== bestDistance) return distance < bestDistance ? region : best;
        return (region.order ?? 0) > (best.order ?? 0) ? region : best;
    }, null);
}
