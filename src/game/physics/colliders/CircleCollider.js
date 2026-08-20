import { closestPointOnPolygon, pointInPolygon } from "../../world/PolygonGeometry.js";
import { assertColliderSnapshot, colliderSnapshotOverlapsCircle } from "./Collider.js";

const SWEEP_EPSILON = 1e-7;
const SWEEP_SAFETY_MARGIN = 1e-4;

function circlePenetratesPolygon(position, radius, vertices) {
    if (pointInPolygon(position, vertices)) return true;
    const closest = closestPointOnPolygon(position, vertices);
    if (!closest) return false;
    return Math.hypot(position.x - closest.x, position.y - closest.y) < radius - SWEEP_EPSILON;
}

function pointAlong(start, direction, distance) {
    return { x: start.x + direction.x * distance, y: start.y + direction.y * distance };
}

function entersPolygonAfter(start, direction, distance, candidate, radius, vertices) {
    const probeDistance = Math.min(distance, candidate + SWEEP_SAFETY_MARGIN);
    if (probeDistance <= candidate && candidate >= distance - SWEEP_EPSILON) return false;
    return circlePenetratesPolygon(pointAlong(start, direction, probeDistance), radius, vertices);
}

function firstVertexHitDistance(start, direction, distance, vertex, radius, vertices) {
    const offsetX = start.x - vertex.x;
    const offsetY = start.y - vertex.y;
    const projection = offsetX * direction.x + offsetY * direction.y;
    const squaredDistance = offsetX * offsetX + offsetY * offsetY;
    const discriminant = projection * projection - (squaredDistance - radius * radius);
    if (discriminant < -SWEEP_EPSILON) return null;
    const root = Math.sqrt(Math.max(0, discriminant));
    const candidates = [-projection - root, -projection + root];
    for (const candidate of candidates) {
        if (candidate < -SWEEP_EPSILON || candidate > distance + SWEEP_EPSILON) continue;
        const clamped = Math.max(0, Math.min(distance, candidate));
        if (entersPolygonAfter(start, direction, distance, clamped, radius, vertices)) return clamped;
    }
    return null;
}

function firstEdgeHitDistance(start, direction, distance, edgeStart, edgeEnd, radius, vertices) {
    const edgeX = edgeEnd.x - edgeStart.x;
    const edgeY = edgeEnd.y - edgeStart.y;
    const edgeLength = Math.hypot(edgeX, edgeY);
    if (edgeLength <= SWEEP_EPSILON)
        return firstVertexHitDistance(start, direction, distance, edgeStart, radius, vertices);
    const tangentX = edgeX / edgeLength;
    const tangentY = edgeY / edgeLength;
    const normalX = -tangentY;
    const normalY = tangentX;
    const normalVelocity = direction.x * normalX + direction.y * normalY;
    if (Math.abs(normalVelocity) <= SWEEP_EPSILON) return null;
    const startOffset = (start.x - edgeStart.x) * normalX + (start.y - edgeStart.y) * normalY;
    let first = null;
    for (const signedRadius of [-radius, radius]) {
        const candidate = (signedRadius - startOffset) / normalVelocity;
        if (candidate < -SWEEP_EPSILON || candidate > distance + SWEEP_EPSILON) continue;
        const clamped = Math.max(0, Math.min(distance, candidate));
        const center = pointAlong(start, direction, clamped);
        const projection = (center.x - edgeStart.x) * tangentX + (center.y - edgeStart.y) * tangentY;
        if (projection < -SWEEP_EPSILON || projection > edgeLength + SWEEP_EPSILON) continue;
        if (!entersPolygonAfter(start, direction, distance, clamped, radius, vertices)) continue;
        if (first === null || clamped < first) first = clamped;
    }
    return first;
}

function firstSolidHitDistance(start, direction, distance, radius, surface) {
    const vertices = surface.vertices ?? [];
    if (vertices.length < 3) return null;
    if (circlePenetratesPolygon(start, radius, vertices)) return 0;
    let first = null;
    for (let index = 0; index < vertices.length; index += 1) {
        const edgeHit = firstEdgeHitDistance(
            start,
            direction,
            distance,
            vertices[index],
            vertices[(index + 1) % vertices.length],
            radius,
            vertices
        );
        const vertexHit = firstVertexHitDistance(start, direction, distance, vertices[index], radius, vertices);
        for (const candidate of [edgeHit, vertexHit]) {
            if (candidate !== null && (first === null || candidate < first)) first = candidate;
        }
    }
    return first;
}

function firstOneWayHitDistance(start, direction, distance, radius, surface) {
    if (direction.y <= SWEEP_EPSILON) return null;
    const topY = Number.isFinite(surface.topY) ? surface.topY : Math.min(...(surface.vertices ?? []).map(({ y }) => y));
    if (!Number.isFinite(topY) || start.y + radius > topY + 10) return null;
    const candidate = (topY - radius - start.y) / direction.y;
    if (candidate < -SWEEP_EPSILON || candidate > distance + SWEEP_EPSILON) return null;
    const centerX = start.x + direction.x * Math.max(0, candidate);
    const vertices = surface.vertices ?? [];
    const minX = Number.isFinite(surface.x) ? surface.x : Math.min(...vertices.map(({ x }) => x));
    const maxX = Number.isFinite(surface.width) ? minX + surface.width : Math.max(...vertices.map(({ x }) => x));
    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;
    if (centerX + radius < minX - SWEEP_EPSILON || centerX - radius > maxX + SWEEP_EPSILON) return null;
    return Math.max(0, Math.min(distance, candidate));
}

function collisionNormal(actorId, otherId, dx, dy, distance) {
    if (distance > 0.0001) return { x: dx / distance, y: dy / distance };
    return actorId.localeCompare(otherId) <= 0 ? { x: -1, y: 0 } : { x: 1, y: 0 };
}

export class CircleCollider {
    constructor({ radius }) {
        if (!Number.isFinite(radius) || radius <= 0) throw new Error("CircleCollider requires a positive radius");
        this.radius = radius;
    }

    snapshot() {
        return Object.freeze({ type: "circle", radius: this.radius });
    }

    overlapsCircle(center, circlePosition, circleRadius) {
        if (!Number.isFinite(circleRadius) || circleRadius <= 0) {
            throw new Error("overlapsCircle requires a positive circleRadius");
        }
        return Math.hypot(center.x - circlePosition.x, center.y - circlePosition.y) <= this.radius + circleRadius;
    }

    outsidePointToward(center, target, clearance = 0) {
        for (const [label, value] of Object.entries({
            "center.x": center?.x,
            "center.y": center?.y,
            "target.x": target?.x,
            "target.y": target?.y,
            clearance
        })) {
            if (!Number.isFinite(value)) throw new Error(`outsidePointToward requires finite ${label}`);
        }
        if (clearance < 0) throw new Error("outsidePointToward clearance must be non-negative");
        const deltaX = target.x - center.x;
        const deltaY = target.y - center.y;
        const distance = Math.hypot(deltaX, deltaY);
        const directionX = distance > 0.000001 ? deltaX / distance : 1;
        const directionY = distance > 0.000001 ? deltaY / distance : 0;
        const offset = this.radius + clearance;
        return { x: center.x + directionX * offset, y: center.y + directionY * offset };
    }

    farthestSafePositionAlong({ start, direction, distance, surfaces = [] }) {
        for (const [label, value] of Object.entries({
            "start.x": start?.x,
            "start.y": start?.y,
            "direction.x": direction?.x,
            "direction.y": direction?.y,
            distance
        })) {
            if (!Number.isFinite(value)) throw new Error(`farthestSafePositionAlong requires finite ${label}`);
        }
        if (distance < 0) throw new Error("farthestSafePositionAlong distance must be non-negative");
        const magnitude = Math.hypot(direction.x, direction.y);
        if (magnitude <= SWEEP_EPSILON) throw new Error("farthestSafePositionAlong direction must be non-zero");
        const normalizedDirection = { x: direction.x / magnitude, y: direction.y / magnitude };
        let firstHit = null;
        let surfaceId = null;
        for (const surface of surfaces) {
            if (surface?.collision === false) continue;
            const hit = surface.oneWay
                ? firstOneWayHitDistance(start, normalizedDirection, distance, this.radius, surface)
                : firstSolidHitDistance(start, normalizedDirection, distance, this.radius, surface);
            if (hit !== null && (firstHit === null || hit < firstHit)) {
                firstHit = hit;
                surfaceId = surface.id ?? null;
            }
        }
        const safeDistance = firstHit === null ? distance : Math.max(0, firstHit - SWEEP_SAFETY_MARGIN);
        return Object.freeze({
            position: Object.freeze(pointAlong(start, normalizedDirection, safeDistance)),
            distance: safeDistance,
            blocked: firstHit !== null,
            surfaceId
        });
    }

    resolveSurfaces({ position, velocity, surfaces, previousPosition }) {
        let isGrounded = false;
        const collisionNormals = [];
        const movementX = position.x - previousPosition.x;
        const movementY = position.y - previousPosition.y;
        const movementDistance = Math.hypot(movementX, movementY);
        if (movementDistance > SWEEP_EPSILON) {
            const direction = { x: movementX / movementDistance, y: movementY / movementDistance };
            let firstHit = null;
            let hitSurface = null;
            for (const surface of surfaces) {
                if (surface.collision === false) continue;
                const hit = surface.oneWay
                    ? firstOneWayHitDistance(previousPosition, direction, movementDistance, this.radius, surface)
                    : firstSolidHitDistance(previousPosition, direction, movementDistance, this.radius, surface);
                if (hit !== null && (firstHit === null || hit < firstHit)) {
                    firstHit = hit;
                    hitSurface = surface;
                }
            }
            if (firstHit !== null && hitSurface) {
                const safeDistance = Math.max(0, firstHit - SWEEP_SAFETY_MARGIN);
                position.set(
                    previousPosition.x + direction.x * safeDistance,
                    previousPosition.y + direction.y * safeDistance
                );
                const closest = hitSurface.oneWay ? null : closestPointOnPolygon(position, hitSurface.vertices);
                let normalX = hitSurface.oneWay ? 0 : position.x - closest.x;
                let normalY = hitSurface.oneWay ? -1 : position.y - closest.y;
                const normalLength = Math.hypot(normalX, normalY);
                if (normalLength > SWEEP_EPSILON) {
                    normalX /= normalLength;
                    normalY /= normalLength;
                } else {
                    normalX = -direction.x;
                    normalY = -direction.y;
                }
                const remainingDistance = Math.max(0, movementDistance - firstHit);
                let remainingX = direction.x * remainingDistance;
                let remainingY = direction.y * remainingDistance;
                const inwardRemaining = remainingX * normalX + remainingY * normalY;
                if (inwardRemaining < 0) {
                    remainingX -= normalX * inwardRemaining;
                    remainingY -= normalY * inwardRemaining;
                }
                position.x += remainingX;
                position.y += remainingY;
                const inwardSpeed = velocity.x * normalX + velocity.y * normalY;
                if (inwardSpeed < 0) {
                    velocity.x -= normalX * inwardSpeed;
                    velocity.y -= normalY * inwardSpeed;
                }
                if (normalY < -0.55) isGrounded = true;
                collisionNormals.push(Object.freeze({ x: normalX, y: normalY }));
            }
        }
        for (let pass = 0; pass < 3; pass += 1) {
            let resolved = false;
            for (const surface of surfaces) {
                if (surface.collision === false) continue;
                if (
                    position.x + this.radius < surface.x ||
                    position.x - this.radius > surface.x + surface.width ||
                    position.y + this.radius < surface.y ||
                    position.y - this.radius > surface.y + surface.height
                ) {
                    continue;
                }
                if (surface.oneWay && (velocity.y < 0 || previousPosition.y + this.radius > surface.topY + 10)) {
                    continue;
                }

                const closest = closestPointOnPolygon(position, surface.vertices);
                const inside = pointInPolygon(position, surface.vertices);
                let normalX = position.x - closest.x;
                let normalY = position.y - closest.y;
                const distance = Math.hypot(normalX, normalY);
                if (!inside && distance >= this.radius) continue;

                if (distance > 0.0001) {
                    const direction = inside ? -1 / distance : 1 / distance;
                    normalX *= direction;
                    normalY *= direction;
                } else {
                    normalX = 0;
                    normalY = -1;
                }
                const penetration = inside ? this.radius + distance : this.radius - distance;
                position.x += normalX * penetration;
                position.y += normalY * penetration;
                const inwardSpeed = velocity.x * normalX + velocity.y * normalY;
                if (inwardSpeed < 0) {
                    velocity.x -= normalX * inwardSpeed;
                    velocity.y -= normalY * inwardSpeed;
                }
                if (normalY < -0.55) isGrounded = true;
                collisionNormals.push(Object.freeze({ x: normalX, y: normalY }));
                resolved = true;
            }
            if (!resolved) break;
        }
        return Object.freeze({ isGrounded, collisionNormals: Object.freeze(collisionNormals) });
    }

    resolveActor({ actorId, position, velocity, other, isGrounded }) {
        if (!other?.position || other.id === actorId) return Object.freeze({ collided: false, isGrounded });
        const otherCollider = assertColliderSnapshot(
            typeof other.collider?.snapshot === "function" ? other.collider.snapshot() : other.collider
        );
        if (otherCollider.type !== "circle") {
            throw new Error(`CircleCollider cannot resolve actor collider '${otherCollider.type}'`);
        }
        const dx = position.x - other.position.x;
        const dy = position.y - other.position.y;
        const distance = Math.hypot(dx, dy);
        const minimumDistance = this.radius + otherCollider.radius;
        if (distance >= minimumDistance) return Object.freeze({ collided: false, isGrounded });
        const normal = collisionNormal(actorId, other.id, dx, dy, distance);
        const penetration = (minimumDistance - distance) * (other.lifeState === "active" ? 0.5 : 1);
        position.x += normal.x * penetration;
        position.y += normal.y * penetration;
        const inwardSpeed = velocity.x * normal.x + velocity.y * normal.y;
        if (inwardSpeed < 0) {
            velocity.x -= normal.x * inwardSpeed;
            velocity.y -= normal.y * inwardSpeed;
        }
        return Object.freeze({ collided: true, isGrounded: isGrounded || normal.y < -0.55 });
    }

    static snapshotOverlapsCircle(snapshot, center, circlePosition, circleRadius) {
        return colliderSnapshotOverlapsCircle(snapshot, center, circlePosition, circleRadius);
    }
}
