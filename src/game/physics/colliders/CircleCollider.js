import { closestPointOnPolygon, pointInPolygon } from "../../world/PolygonGeometry.js";
import { assertColliderSnapshot, colliderSnapshotOverlapsCircle } from "./Collider.js";

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

    resolveSurfaces({ position, velocity, surfaces, previousPosition }) {
        let isGrounded = false;
        const collisionNormals = [];
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
        const otherCollider = assertColliderSnapshot(other.collider);
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
