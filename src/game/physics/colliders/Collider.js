import { closestPointOnPolygon, pointInPolygon, polygonBounds } from "../../world/PolygonGeometry.js";
import { ENEMY_TYPE } from "../../EnemyType.js";
import { SURFACE_MOTION_TYPE } from "../SurfacePhysicsDefinition.js";

const COLLIDER_EPSILON = 1e-7;
const DYNAMIC_ACTOR_RESTITUTION = 0.25;
const PLAYER_REFERENCE_RADIUS = 15;
const STATIC_ENEMY_TYPE = Object.freeze({
    [ENEMY_TYPE.SENTRY]: true,
    [ENEMY_TYPE.SENTRY_T1]: true
});
const VALID_SURFACE_MOTION_TYPE = Object.freeze({
    [SURFACE_MOTION_TYPE.STATIC]: true,
    [SURFACE_MOTION_TYPE.KINEMATIC]: true,
    [SURFACE_MOTION_TYPE.DYNAMIC]: true
});

const REQUIRED_METHODS = Object.freeze([
    "snapshot",
    "resolveSurfaces",
    "resolveActor",
    "overlapsCircle",
    "overlapsCollider",
    "outsidePointToward"
]);

function finitePoint(point, label) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new Error(`${label} must contain finite x and y values`);
    }
    return Object.freeze({ x: point.x, y: point.y });
}

function polygonSignedArea(vertices) {
    let twiceArea = 0;
    for (let index = 0; index < vertices.length; index += 1) {
        const current = vertices[index];
        const next = vertices[(index + 1) % vertices.length];
        twiceArea += current.x * next.y - next.x * current.y;
    }
    return twiceArea * 0.5;
}

function cross(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function assertConvex(vertices) {
    let sign = 0;
    for (let index = 0; index < vertices.length; index += 1) {
        const value = cross(
            vertices[index],
            vertices[(index + 1) % vertices.length],
            vertices[(index + 2) % vertices.length]
        );
        if (Math.abs(value) <= COLLIDER_EPSILON) continue;
        const nextSign = Math.sign(value);
        if (sign !== 0 && sign !== nextSign) throw new Error("Polygon collider vertices must form a convex polygon");
        sign = nextSign;
    }
    if (sign === 0 || Math.abs(polygonSignedArea(vertices)) <= COLLIDER_EPSILON) {
        throw new Error("Polygon collider must have non-zero area");
    }
}

export function normalizePolygonColliderVertices(vertices) {
    if (!Array.isArray(vertices) || vertices.length < 3) {
        throw new Error("Polygon collider requires at least three vertices");
    }
    const normalized = vertices.map((vertex, index) => finitePoint(vertex, `polygon vertex ${index}`));
    assertConvex(normalized);
    return Object.freeze(normalized);
}

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
    if (snapshot.type === "circle") {
        if (!Number.isFinite(snapshot.radius) || snapshot.radius <= 0) {
            throw new Error("Circle collider snapshot requires a positive radius");
        }
        return snapshot;
    }
    if (snapshot.type === "polygon") {
        normalizePolygonColliderVertices(snapshot.vertices);
        return snapshot;
    }
    throw new Error(`Unsupported collider snapshot type '${snapshot.type}'`);
}

export function colliderSnapshotBoundingRadius(snapshot) {
    assertColliderSnapshot(snapshot);
    if (snapshot.type === "circle") return snapshot.radius;
    return Math.max(...snapshot.vertices.map(({ x, y }) => Math.hypot(x, y)));
}

export function colliderSnapshotWorldVertices(snapshot, center) {
    assertColliderSnapshot(snapshot);
    finitePoint(center, "collider center");
    if (snapshot.type !== "polygon") throw new Error("World vertices require a polygon collider snapshot");
    return snapshot.vertices.map(({ x, y }) => ({ x: center.x + x, y: center.y + y }));
}

export function colliderSnapshotBounds(snapshot, center) {
    assertColliderSnapshot(snapshot);
    if (snapshot.type === "circle") {
        return Object.freeze({
            x: center.x - snapshot.radius,
            y: center.y - snapshot.radius,
            width: snapshot.radius * 2,
            height: snapshot.radius * 2
        });
    }
    return Object.freeze(polygonBounds(colliderSnapshotWorldVertices(snapshot, center)));
}

function projection(vertices, axis) {
    let minimum = Number.POSITIVE_INFINITY;
    let maximum = Number.NEGATIVE_INFINITY;
    for (const vertex of vertices) {
        const value = vertex.x * axis.x + vertex.y * axis.y;
        minimum = Math.min(minimum, value);
        maximum = Math.max(maximum, value);
    }
    return { minimum, maximum };
}

function polygonAxes(vertices) {
    const axes = [];
    for (let index = 0; index < vertices.length; index += 1) {
        const start = vertices[index];
        const end = vertices[(index + 1) % vertices.length];
        const edgeX = end.x - start.x;
        const edgeY = end.y - start.y;
        const length = Math.hypot(edgeX, edgeY);
        if (length > COLLIDER_EPSILON) axes.push({ x: -edgeY / length, y: edgeX / length });
    }
    return axes;
}

function polygonPolygonContact(snapshotA, centerA, snapshotB, centerB) {
    const verticesA = colliderSnapshotWorldVertices(snapshotA, centerA);
    const verticesB = colliderSnapshotWorldVertices(snapshotB, centerB);
    let penetration = Number.POSITIVE_INFINITY;
    let normal = null;
    for (const axis of [...polygonAxes(verticesA), ...polygonAxes(verticesB)]) {
        const a = projection(verticesA, axis);
        const b = projection(verticesB, axis);
        const overlap = Math.min(a.maximum, b.maximum) - Math.max(a.minimum, b.minimum);
        if (overlap < -COLLIDER_EPSILON) return null;
        if (overlap < penetration) {
            penetration = Math.max(0, overlap);
            normal = axis;
        }
    }
    if (!normal) return null;
    const towardA = { x: centerA.x - centerB.x, y: centerA.y - centerB.y };
    if (normal.x * towardA.x + normal.y * towardA.y < 0) normal = { x: -normal.x, y: -normal.y };
    return Object.freeze({ normal: Object.freeze(normal), penetration });
}

function circlePolygonContact(circleSnapshot, circleCenter, polygonSnapshot, polygonCenter) {
    const vertices = colliderSnapshotWorldVertices(polygonSnapshot, polygonCenter);
    const closest = closestPointOnPolygon(circleCenter, vertices);
    const inside = pointInPolygon(circleCenter, vertices);
    const dx = circleCenter.x - closest.x;
    const dy = circleCenter.y - closest.y;
    const distance = Math.hypot(dx, dy);
    if (!inside && distance > circleSnapshot.radius + COLLIDER_EPSILON) return null;
    let normal;
    if (distance > COLLIDER_EPSILON) {
        const direction = inside ? -1 / distance : 1 / distance;
        normal = { x: dx * direction, y: dy * direction };
    } else {
        const fallbackX = circleCenter.x - polygonCenter.x;
        const fallbackY = circleCenter.y - polygonCenter.y;
        const fallbackLength = Math.hypot(fallbackX, fallbackY) || 1;
        normal = { x: fallbackX / fallbackLength, y: fallbackY / fallbackLength };
    }
    const penetration = inside ? circleSnapshot.radius + distance : Math.max(0, circleSnapshot.radius - distance);
    return Object.freeze({ normal: Object.freeze(normal), penetration });
}

export function resolveColliderSnapshotContact(snapshotA, centerA, snapshotB, centerB) {
    assertColliderSnapshot(snapshotA);
    assertColliderSnapshot(snapshotB);
    finitePoint(centerA, "collider A center");
    finitePoint(centerB, "collider B center");
    const broadPhaseDistance = Math.hypot(centerA.x - centerB.x, centerA.y - centerB.y);
    if (
        broadPhaseDistance >
        colliderSnapshotBoundingRadius(snapshotA) + colliderSnapshotBoundingRadius(snapshotB) + COLLIDER_EPSILON
    ) {
        return null;
    }
    if (snapshotA.type === "circle" && snapshotB.type === "circle") {
        const dx = centerA.x - centerB.x;
        const dy = centerA.y - centerB.y;
        const distance = Math.hypot(dx, dy);
        const minimumDistance = snapshotA.radius + snapshotB.radius;
        if (distance > minimumDistance + COLLIDER_EPSILON) return null;
        const normal = distance > COLLIDER_EPSILON ? { x: dx / distance, y: dy / distance } : { x: -1, y: 0 };
        return Object.freeze({ normal: Object.freeze(normal), penetration: Math.max(0, minimumDistance - distance) });
    }
    if (snapshotA.type === "circle") return circlePolygonContact(snapshotA, centerA, snapshotB, centerB);
    if (snapshotB.type === "circle") {
        const contact = circlePolygonContact(snapshotB, centerB, snapshotA, centerA);
        if (!contact) return null;
        return Object.freeze({
            normal: Object.freeze({ x: -contact.normal.x, y: -contact.normal.y }),
            penetration: contact.penetration
        });
    }
    return polygonPolygonContact(snapshotA, centerA, snapshotB, centerB);
}

export function colliderSnapshotOverlapsCircle(snapshot, center, circlePosition, circleRadius) {
    if (!Number.isFinite(circleRadius) || circleRadius <= 0) {
        throw new Error("Collider overlap requires a positive circleRadius");
    }
    return (
        resolveColliderSnapshotContact(snapshot, center, { type: "circle", radius: circleRadius }, circlePosition) !==
        null
    );
}

export function colliderSnapshotsOverlap(snapshotA, centerA, snapshotB, centerB) {
    return resolveColliderSnapshotContact(snapshotA, centerA, snapshotB, centerB) !== null;
}

export function colliderSnapshotsEqual(left, right) {
    assertColliderSnapshot(left);
    assertColliderSnapshot(right);
    if (left.type !== right.type) return false;
    if (left.type === "circle") return left.radius === right.radius;
    return (
        left.vertices.length === right.vertices.length &&
        left.vertices.every(
            (vertex, index) => vertex.x === right.vertices[index].x && vertex.y === right.vertices[index].y
        )
    );
}

function actorMotionType(actor, fallback = SURFACE_MOTION_TYPE.DYNAMIC) {
    if (VALID_SURFACE_MOTION_TYPE[actor?.motionType] === true) return actor.motionType;
    if (STATIC_ENEMY_TYPE[actor?.enemyType] === true) return SURFACE_MOTION_TYPE.STATIC;
    return fallback;
}

function actorMass(actor, snapshot) {
    if (Number.isFinite(actor?.mass) && actor.mass > 0) return actor.mass;
    return Math.max(0.25, (colliderSnapshotBoundingRadius(snapshot) / PLAYER_REFERENCE_RADIUS) ** 2);
}

function inverseMass(actor, snapshot, fallbackMotionType = SURFACE_MOTION_TYPE.DYNAMIC) {
    if (actorMotionType(actor, fallbackMotionType) !== SURFACE_MOTION_TYPE.DYNAMIC) return 0;
    return 1 / actorMass(actor, snapshot);
}

function actorRestitution(actor, inverseMassValue) {
    if (Number.isFinite(actor?.collisionRestitution)) {
        return Math.max(0, Math.min(1, actor.collisionRestitution));
    }
    return inverseMassValue === 0 ? 0 : DYNAMIC_ACTOR_RESTITUTION;
}

export function resolveActorCollider({
    selfCollider,
    actorId,
    position,
    velocity,
    mass,
    motionType,
    other,
    isGrounded
}) {
    const noCollision = () =>
        Object.freeze({ collided: false, isGrounded, velocityDelta: Object.freeze({ x: 0, y: 0 }) });
    if (!other?.position || other.id === actorId) return noCollision();
    const selfSnapshot = selfCollider.snapshot();
    const otherSnapshot =
        typeof other.collider?.snapshot === "function"
            ? other.collider.snapshot()
            : assertColliderSnapshot(other.collider);
    const contact = resolveColliderSnapshotContact(selfSnapshot, position, otherSnapshot, other.position);
    if (!contact) return noCollision();
    let normal = contact.normal;
    if (
        contact.penetration > 0 &&
        Math.hypot(position.x - other.position.x, position.y - other.position.y) <= COLLIDER_EPSILON
    ) {
        normal = actorId.localeCompare(other.id) <= 0 ? { x: -1, y: 0 } : { x: 1, y: 0 };
    }
    const selfBody = { mass, motionType };
    const selfInverseMass = inverseMass(selfBody, selfSnapshot, motionType);
    const otherInverseMass = inverseMass(other, otherSnapshot);
    const combinedInverseMass = selfInverseMass + otherInverseMass;
    if (combinedInverseMass > COLLIDER_EPSILON && selfInverseMass > 0 && contact.penetration > 0) {
        const positionShare = selfInverseMass / combinedInverseMass;
        position.x += normal.x * contact.penetration * positionShare;
        position.y += normal.y * contact.penetration * positionShare;
    }
    let velocityDeltaX = 0;
    let velocityDeltaY = 0;
    if (combinedInverseMass > COLLIDER_EPSILON && selfInverseMass > 0) {
        const otherVelocity = other.velocity ?? { x: 0, y: 0 };
        const relativeVelocityX = velocity.x - (otherVelocity.x ?? 0);
        const relativeVelocityY = velocity.y - (otherVelocity.y ?? 0);
        const approachSpeed = relativeVelocityX * normal.x + relativeVelocityY * normal.y;
        if (approachSpeed < 0) {
            const restitution = actorRestitution(other, otherInverseMass);
            const impulseMagnitude = (-(1 + restitution) * approachSpeed) / combinedInverseMass;
            velocityDeltaX = normal.x * impulseMagnitude * selfInverseMass;
            velocityDeltaY = normal.y * impulseMagnitude * selfInverseMass;
            velocity.x += velocityDeltaX;
            velocity.y += velocityDeltaY;
        }
    }
    return Object.freeze({
        collided: true,
        isGrounded: isGrounded || (other.canGroundActors !== false && normal.y < -0.55),
        velocityDelta: Object.freeze({ x: velocityDeltaX, y: velocityDeltaY })
    });
}
