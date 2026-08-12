const REQUIRED_METHODS = Object.freeze([
    "snapshot",
    "resolveSurfaces",
    "resolveActor",
    "overlapsCircle",
    "outsidePointToward"
]);

export function assertCollider(collider) {
    if (!collider) throw new Error("Collider component is required");
    for (const method of REQUIRED_METHODS) {
        if (typeof collider[method] !== "function") throw new Error(`Collider requires ${method}()`);
    }
    return collider;
}

export function assertColliderSnapshot(snapshot) {
    if (!snapshot || typeof snapshot.type !== "string" || !snapshot.type.trim()) {
        throw new Error("Collider snapshot requires a non-empty type");
    }
    return snapshot;
}

export function colliderSnapshotOverlapsCircle(snapshot, center, circlePosition, circleRadius) {
    assertColliderSnapshot(snapshot);
    if (snapshot.type !== "circle") throw new Error(`Unsupported collider snapshot type '${snapshot.type}'`);
    if (!Number.isFinite(snapshot.radius) || snapshot.radius <= 0) {
        throw new Error("Circle collider snapshot requires a positive radius");
    }
    return Math.hypot(center.x - circlePosition.x, center.y - circlePosition.y) <= snapshot.radius + circleRadius;
}
