import { assertCollider, assertColliderSnapshot } from "./Collider.js";
import { CircleCollider } from "./CircleCollider.js";
import { PolygonCollider } from "./PolygonCollider.js";

export function createCollider(value, { fallbackRadius = null } = {}) {
    if (value && typeof value.resolveActor === "function") return assertCollider(value);
    if (value) {
        const snapshot = assertColliderSnapshot(value);
        if (snapshot.type === "circle") return new CircleCollider({ radius: snapshot.radius });
        return new PolygonCollider({ vertices: snapshot.vertices });
    }
    if (Number.isFinite(fallbackRadius) && fallbackRadius > 0) return new CircleCollider({ radius: fallbackRadius });
    throw new Error("Collider factory requires a collider snapshot or positive fallbackRadius");
}
