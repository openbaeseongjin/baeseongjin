function requireCollider(collider) {
    if (!collider || typeof collider.snapshot !== "function") {
        throw new TypeError("ropeable collision surface requires a collider");
    }
    return collider;
}

function translatedPolygon(vertices, position, worldOffset) {
    return Object.freeze(
        vertices.map(({ x, y }) =>
            Object.freeze({ x: position.x + x + worldOffset.x, y: position.y + y + worldOffset.y })
        )
    );
}

function circlePolygon(radius, segments = 12) {
    return Object.freeze(
        Array.from({ length: segments }, (_, index) => {
            const angle = (Math.PI * 2 * index) / segments;
            return Object.freeze({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        })
    );
}

export const withRopeableSurface = (Base) =>
    class extends Base {
        initializeRopeableSurface({ ropeable = false, collider } = {}) {
            this.ropeable = ropeable === true;
            if (this.ropeable) requireCollider(collider);
            return this.ropeable;
        }

        isRopeableSurface() {
            return this.ropeable === true;
        }

        ropeableSurfaceSnapshot(worldOffset = { x: 0, y: 0 }) {
            if (!this.isRopeableSurface()) return null;
            const collider = requireCollider(this.collider).snapshot();
            const localVertices = collider.type === "polygon" ? collider.vertices : circlePolygon(collider.radius);
            const vertices = translatedPolygon(localVertices, this.position, worldOffset);
            const xs = vertices.map(({ x }) => x);
            const ys = vertices.map(({ y }) => y);
            return Object.freeze({
                id: this.id,
                collision: true,
                grappleable: true,
                ropeOccluder: true,
                vertices,
                x: Math.min(...xs),
                y: Math.min(...ys),
                width: Math.max(...xs) - Math.min(...xs),
                height: Math.max(...ys) - Math.min(...ys)
            });
        }
    };

export function isRopeableCollisionSurface(surface) {
    return surface?.collision !== false && surface?.grappleable === true;
}
