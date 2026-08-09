export function polygonBounds(vertices) {
    const xs = vertices.map((vertex) => vertex.x);
    const ys = vertices.map((vertex) => vertex.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return {
        x,
        y,
        width: Math.max(...xs) - x,
        height: Math.max(...ys) - y
    };
}

export function closestPointOnSegment(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) return { x: start.x, y: start.y };
    const amount = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
    return { x: start.x + dx * amount, y: start.y + dy * amount };
}

export function closestPointOnPolygon(point, vertices) {
    let closest = null;
    let closestDistanceSquared = Number.POSITIVE_INFINITY;
    for (let index = 0; index < vertices.length; index += 1) {
        const candidate = closestPointOnSegment(point, vertices[index], vertices[(index + 1) % vertices.length]);
        const dx = candidate.x - point.x;
        const dy = candidate.y - point.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < closestDistanceSquared) {
            closest = candidate;
            closestDistanceSquared = distanceSquared;
        }
    }
    return closest;
}

export function pointInPolygon(point, vertices) {
    let inside = false;
    for (let current = 0, previous = vertices.length - 1; current < vertices.length; previous = current++) {
        const a = vertices[current];
        const b = vertices[previous];
        if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
            inside = !inside;
        }
    }
    return inside;
}
