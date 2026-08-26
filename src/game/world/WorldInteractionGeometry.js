import { PolygonCollider } from "../physics/colliders/PolygonCollider.js";
import { resolveObjectTriggerBounds } from "./areas/AreaDefinition.js";

const INTERACTION_GEOMETRY_BY_OBJECT = new WeakMap();

function polygonInteractionGeometry(object) {
    const cached = INTERACTION_GEOMETRY_BY_OBJECT.get(object);
    if (cached) return cached;
    const bounds = resolveObjectTriggerBounds(object.position, object.interactionSpec);
    const geometry = Object.freeze({
        center: Object.freeze({
            x: bounds.x + bounds.width * 0.5,
            y: bounds.y + bounds.height * 0.5
        }),
        collider: PolygonCollider.box(bounds)
    });
    INTERACTION_GEOMETRY_BY_OBJECT.set(object, geometry);
    return geometry;
}

export function playerOverlapsWorldObjectInteraction(player, object) {
    if (!player?.physics?.collider || !player.physics.position || !object?.position) return false;
    if (object.interactionSpec) {
        const geometry = polygonInteractionGeometry(object);
        return geometry.collider.overlapsCollider(geometry.center, player.physics.position, player.physics.collider);
    }
    return (
        Number.isFinite(object.interactionRadius) &&
        player.physics.position.distanceTo(object.position) <= object.interactionRadius
    );
}
