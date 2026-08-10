function routeAnchor(surface) {
    return { x: surface.x + surface.width * 0.5, y: surface.topY };
}

export function validateWorldTraversal(world, { maxAttachDistance, minimumVerticalGain }) {
    const issues = [];
    for (let index = 1; index < world.route.length; index += 1) {
        const previous = routeAnchor(world.route[index - 1]);
        const current = routeAnchor(world.route[index]);
        const distance = Math.hypot(current.x - previous.x, current.y - previous.y);
        const verticalGain = previous.y - current.y;
        if (distance > maxAttachDistance) {
            issues.push(
                Object.freeze({
                    type: "rope-range",
                    level: index,
                    distance,
                    limit: maxAttachDistance
                })
            );
        }
        if (verticalGain < minimumVerticalGain) {
            issues.push(
                Object.freeze({
                    type: "vertical-progress",
                    level: index,
                    verticalGain,
                    minimum: minimumVerticalGain
                })
            );
        }
    }
    return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) });
}
