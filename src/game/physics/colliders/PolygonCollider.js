import {
    assertColliderSnapshot,
    colliderSnapshotBoundingRadius,
    colliderSnapshotBounds,
    colliderSnapshotOverlapsCircle,
    colliderSnapshotsOverlap,
    isGravitySupportingContactNormal,
    normalizePolygonColliderVertices,
    resolveActorCollider,
    resolveColliderSnapshotContact
} from "./Collider.js";

const SWEEP_EPSILON = 1e-7;
const SWEEP_SAFETY_RATIO = 1e-5;
const SURFACE_SHAPE_CACHE = new WeakMap();
function surfaceShape(surface) {
    const cached = SURFACE_SHAPE_CACHE.get(surface);
    if (cached) return cached;
    const bounds = surfaceBounds(surface);
    const center = { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 };
    const shape = Object.freeze({
        center,
        snapshot: {
            type: "polygon",
            vertices: surface.vertices.map(({ x, y }) => ({ x: x - center.x, y: y - center.y }))
        }
    });
    SURFACE_SHAPE_CACHE.set(surface, shape);
    return shape;
}

function boundsOverlap(left, right) {
    return !(
        left.x + left.width < right.x ||
        left.x > right.x + right.width ||
        left.y + left.height < right.y ||
        left.y > right.y + right.height
    );
}

function surfaceBounds(surface) {
    if (![surface.x, surface.y, surface.width, surface.height].every(Number.isFinite)) {
        const xs = surface.vertices.map(({ x }) => x);
        const ys = surface.vertices.map(({ y }) => y);
        const x = Math.min(...xs);
        const y = Math.min(...ys);
        return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
    }
    return {
        x: surface.x,
        y: surface.y,
        width: surface.width,
        height: surface.height
    };
}

function pointAlong(start, delta, amount) {
    return { x: start.x + delta.x * amount, y: start.y + delta.y * amount };
}

export class PolygonCollider {
    constructor({ vertices }) {
        this.vertices = normalizePolygonColliderVertices(vertices);
        this.colliderSnapshot = Object.freeze({ type: "polygon", vertices: this.vertices });
        this.boundingRadius = colliderSnapshotBoundingRadius(this.colliderSnapshot);
    }

    static box({ width, height }) {
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
            throw new Error("PolygonCollider.box requires positive width and height");
        }
        const halfWidth = width * 0.5;
        const halfHeight = height * 0.5;
        return new PolygonCollider({
            vertices: [
                { x: -halfWidth, y: -halfHeight },
                { x: halfWidth, y: -halfHeight },
                { x: halfWidth, y: halfHeight },
                { x: -halfWidth, y: halfHeight }
            ]
        });
    }

    snapshot() {
        return this.colliderSnapshot;
    }

    overlapsCircle(center, circlePosition, circleRadius) {
        return colliderSnapshotOverlapsCircle(this.snapshot(), center, circlePosition, circleRadius);
    }

    overlapsCollider(center, otherCenter, otherCollider) {
        const otherSnapshot =
            typeof otherCollider?.snapshot === "function"
                ? otherCollider.snapshot()
                : assertColliderSnapshot(otherCollider);
        return colliderSnapshotsOverlap(this.snapshot(), center, otherSnapshot, otherCenter);
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
        const length = Math.hypot(deltaX, deltaY);
        const direction = length > SWEEP_EPSILON ? { x: deltaX / length, y: deltaY / length } : { x: 1, y: 0 };
        const support = Math.max(...this.vertices.map(({ x, y }) => x * direction.x + y * direction.y));
        return {
            x: center.x + direction.x * (support + clearance),
            y: center.y + direction.y * (support + clearance)
        };
    }

    firstSolidContactAlong(start, delta, surfaces) {
        const distance = Math.hypot(delta.x, delta.y);
        if (distance <= SWEEP_EPSILON) return null;
        const stepDistance = Math.max(4, this.boundingRadius * 0.25);
        const stepCount = Math.min(128, Math.max(1, Math.ceil(distance / stepDistance)));
        let previousAmount = 0;
        for (let step = 1; step <= stepCount; step += 1) {
            const amount = step / stepCount;
            const center = pointAlong(start, delta, amount);
            let firstAtStep = null;
            for (const surface of surfaces) {
                if (surface.collision === false || surface.oneWay) continue;
                const shape = surfaceShape(surface);
                const contact = resolveColliderSnapshotContact(this.snapshot(), center, shape.snapshot, shape.center);
                if (!contact) continue;
                let low = previousAmount;
                let high = amount;
                for (let iteration = 0; iteration < 12; iteration += 1) {
                    const middle = (low + high) * 0.5;
                    const middleCenter = pointAlong(start, delta, middle);
                    if (resolveColliderSnapshotContact(this.snapshot(), middleCenter, shape.snapshot, shape.center)) {
                        high = middle;
                    } else {
                        low = middle;
                    }
                }
                const hitCenter = pointAlong(start, delta, high);
                const candidate = {
                    amount: high,
                    surface,
                    contact:
                        resolveColliderSnapshotContact(this.snapshot(), hitCenter, shape.snapshot, shape.center) ??
                        contact
                };
                if (!firstAtStep || candidate.amount < firstAtStep.amount) firstAtStep = candidate;
            }
            if (firstAtStep) return firstAtStep;
            previousAmount = amount;
        }
        return null;
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
        const delta = {
            x: (direction.x / magnitude) * distance,
            y: (direction.y / magnitude) * distance
        };
        const hit = this.firstSolidContactAlong(start, delta, surfaces);
        if (!hit) {
            return Object.freeze({
                position: Object.freeze(pointAlong(start, delta, 1)),
                distance,
                blocked: false,
                surfaceId: null
            });
        }
        const safeAmount = Math.max(0, hit.amount - SWEEP_SAFETY_RATIO);
        return Object.freeze({
            position: Object.freeze(pointAlong(start, delta, safeAmount)),
            distance: distance * safeAmount,
            blocked: true,
            surfaceId: hit.surface.id ?? null
        });
    }

    resolveSurfaces({ position, velocity, surfaces, previousPosition }) {
        let isGrounded = false;
        const collisionNormals = [];
        let delta = { x: position.x - previousPosition.x, y: position.y - previousPosition.y };
        if (delta.y > SWEEP_EPSILON) {
            const previousBounds = colliderSnapshotBounds(this.snapshot(), previousPosition);
            const destinationBounds = colliderSnapshotBounds(this.snapshot(), position);
            const previousBottom = previousBounds.y + previousBounds.height;
            const destinationBottom = destinationBounds.y + destinationBounds.height;
            let firstOneWayHit = null;
            for (const surface of surfaces) {
                if (surface.collision === false || !surface.oneWay) continue;
                const topY = Number.isFinite(surface.topY) ? surface.topY : surfaceBounds(surface).y;
                if (previousBottom > topY + 10 || destinationBottom < topY) continue;
                const amount = (topY - previousBottom) / Math.max(SWEEP_EPSILON, destinationBottom - previousBottom);
                if (amount < 0 || amount > 1) continue;
                const crossingCenter = pointAlong(previousPosition, delta, amount);
                const crossingBounds = colliderSnapshotBounds(this.snapshot(), crossingCenter);
                const targetBounds = surfaceBounds(surface);
                if (
                    crossingBounds.x + crossingBounds.width < targetBounds.x ||
                    crossingBounds.x > targetBounds.x + targetBounds.width
                ) {
                    continue;
                }
                if (!firstOneWayHit || amount < firstOneWayHit.amount) {
                    firstOneWayHit = { amount, topY };
                }
            }
            if (firstOneWayHit) {
                const bottomOffset = destinationBottom - position.y;
                position.y = firstOneWayHit.topY - bottomOffset;
                velocity.y = 0;
                const normal = Object.freeze({ x: 0, y: -1 });
                collisionNormals.push(normal);
                isGrounded = true;
                delta = { x: position.x - previousPosition.x, y: position.y - previousPosition.y };
            }
        }
        const hit = this.firstSolidContactAlong(previousPosition, delta, surfaces);
        if (hit) {
            const safeAmount = Math.max(0, hit.amount - SWEEP_SAFETY_RATIO);
            const remaining = { x: delta.x * (1 - hit.amount), y: delta.y * (1 - hit.amount) };
            const inwardRemaining = remaining.x * hit.contact.normal.x + remaining.y * hit.contact.normal.y;
            if (inwardRemaining < 0) {
                remaining.x -= hit.contact.normal.x * inwardRemaining;
                remaining.y -= hit.contact.normal.y * inwardRemaining;
            }
            position.x = previousPosition.x + delta.x * safeAmount + remaining.x;
            position.y = previousPosition.y + delta.y * safeAmount + remaining.y;
            const inwardSpeed = velocity.x * hit.contact.normal.x + velocity.y * hit.contact.normal.y;
            if (inwardSpeed < 0) {
                velocity.x -= hit.contact.normal.x * inwardSpeed;
                velocity.y -= hit.contact.normal.y * inwardSpeed;
            }
            if (isGravitySupportingContactNormal(hit.contact.normal)) isGrounded = true;
            collisionNormals.push(hit.contact.normal);
        }

        for (let pass = 0; pass < 3; pass += 1) {
            let resolved = false;
            for (const surface of surfaces) {
                if (surface.collision === false) continue;
                const bounds = colliderSnapshotBounds(this.snapshot(), position);
                if (!boundsOverlap(bounds, surfaceBounds(surface))) continue;
                if (surface.oneWay) {
                    const previousBounds = colliderSnapshotBounds(this.snapshot(), previousPosition);
                    const topY = Number.isFinite(surface.topY) ? surface.topY : surface.y;
                    const bottom = bounds.y + bounds.height;
                    const previousBottom = previousBounds.y + previousBounds.height;
                    if (velocity.y < 0 || previousBottom > topY + 10 || bottom < topY) continue;
                    const penetration = bottom - topY;
                    if (penetration > SWEEP_EPSILON) position.y -= penetration;
                    if (velocity.y > 0) velocity.y = 0;
                    const normal = Object.freeze({ x: 0, y: -1 });
                    if (!isGrounded) collisionNormals.push(normal);
                    isGrounded = true;
                    resolved ||= penetration > SWEEP_EPSILON;
                    continue;
                }
                const shape = surfaceShape(surface);
                const contact = resolveColliderSnapshotContact(this.snapshot(), position, shape.snapshot, shape.center);
                if (!contact || contact.penetration <= 0) continue;
                position.x += contact.normal.x * contact.penetration;
                position.y += contact.normal.y * contact.penetration;
                const inwardSpeed = velocity.x * contact.normal.x + velocity.y * contact.normal.y;
                if (inwardSpeed < 0) {
                    velocity.x -= contact.normal.x * inwardSpeed;
                    velocity.y -= contact.normal.y * inwardSpeed;
                }
                if (isGravitySupportingContactNormal(contact.normal)) isGrounded = true;
                collisionNormals.push(contact.normal);
                resolved = true;
            }
            if (!resolved) break;
        }
        return Object.freeze({ isGrounded, collisionNormals: Object.freeze(collisionNormals) });
    }

    resolveActor({ actorId, position, velocity, mass, motionType, other, isGrounded }) {
        return resolveActorCollider({
            selfCollider: this,
            actorId,
            position,
            velocity,
            mass,
            motionType,
            other,
            isGrounded
        });
    }
}
