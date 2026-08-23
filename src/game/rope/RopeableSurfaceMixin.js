function requireCollider(collider) {
    if (!collider || typeof collider.snapshot !== "function") {
        throw new TypeError("ropeable collision surface requires a collider");
    }
    return collider;
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
    };

export function isRopeableCollisionSurface(surface) {
    return surface?.collision !== false && surface?.grappleable === true;
}
