import {
    assertColliderSnapshot,
    colliderSnapshotBoundingRadius,
    colliderSnapshotOverlapsCircle,
    colliderSnapshotOverlapsSweptCircle
} from "../physics/colliders/Collider.js";

export function combatTargetColliderSnapshot(target) {
    const collider = target?.collider;
    if (typeof collider?.snapshot === "function") return collider.snapshot();
    if (collider?.type) return assertColliderSnapshot(collider);
    const radius = target?.radius;
    if (!Number.isFinite(radius) || radius <= 0) {
        throw new Error(`Combat target ${target?.id ?? "unknown"} requires a collider or positive radius`);
    }
    return Object.freeze({ type: "circle", radius });
}

export function combatTargetBoundingRadius(target) {
    return colliderSnapshotBoundingRadius(combatTargetColliderSnapshot(target));
}

export function combatTargetBlocksImpactFrom(target, sourcePosition) {
    if (typeof target?.blocksImpactFrom === "function") return target.blocksImpactFrom(sourcePosition);
    if (target?.blocksFrontImpact !== true || !Number.isFinite(sourcePosition?.x)) return false;
    const direction = target.direction < 0 ? -1 : 1;
    return (sourcePosition.x - target.position.x) * direction >= 0;
}

export function combatTargetOverlapsCircle(target, position, radius) {
    return colliderSnapshotOverlapsCircle(combatTargetColliderSnapshot(target), target.position, position, radius);
}

export function combatTargetOverlapsSweptCircle(target, start, end, radius) {
    return colliderSnapshotOverlapsSweptCircle(
        combatTargetColliderSnapshot(target),
        target.position,
        start,
        end,
        radius
    );
}

function pointAlongSegment(start, end, ratio) {
    return Object.freeze({
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio
    });
}

export function combatTargetSweptCircleContact(target, start, end, radius) {
    if (!combatTargetOverlapsSweptCircle(target, start, end, radius)) return null;
    if (combatTargetOverlapsCircle(target, start, radius)) {
        return Object.freeze({ ratio: 0, position: Object.freeze({ ...start }) });
    }
    const travel = Math.hypot(end.x - start.x, end.y - start.y);
    const sampleCount = Math.min(128, Math.max(1, Math.ceil(travel / Math.max(1, radius))));
    let previousRatio = 0;
    for (let sample = 1; sample <= sampleCount; sample += 1) {
        const ratio = sample / sampleCount;
        if (!combatTargetOverlapsCircle(target, pointAlongSegment(start, end, ratio), radius)) {
            previousRatio = ratio;
            continue;
        }
        let low = previousRatio;
        let high = ratio;
        for (let iteration = 0; iteration < 10; iteration += 1) {
            const middle = (low + high) * 0.5;
            if (combatTargetOverlapsCircle(target, pointAlongSegment(start, end, middle), radius)) high = middle;
            else low = middle;
        }
        return Object.freeze({ ratio: high, position: pointAlongSegment(start, end, high) });
    }
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const lengthSquared = deltaX * deltaX + deltaY * deltaY;
    const fallbackRatio =
        lengthSquared > 0
            ? Math.max(
                  0,
                  Math.min(
                      1,
                      ((target.position.x - start.x) * deltaX + (target.position.y - start.y) * deltaY) / lengthSquared
                  )
              )
            : 0;
    return Object.freeze({ ratio: fallbackRatio, position: pointAlongSegment(start, end, fallbackRatio) });
}
