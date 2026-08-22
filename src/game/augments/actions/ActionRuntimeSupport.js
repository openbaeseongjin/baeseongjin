import { Vector2 } from "../../../game-kit/index.js";
import { ACTION_RUNTIME_CONFIG, ACTION_STATE_CONFIG } from "./ActionAugmentDefinition.js";

export function directionBetween(from, to, fallback = { x: ACTION_STATE_CONFIG.UNIT, y: ACTION_STATE_CONFIG.ZERO }) {
    const x = to.x - from.x;
    const y = to.y - from.y;
    const magnitude = Math.hypot(x, y);
    return magnitude > ACTION_STATE_CONFIG.DIRECTION_EPSILON
        ? Object.freeze({ x: x / magnitude, y: y / magnitude })
        : Object.freeze({ ...fallback });
}

export function targetsInRadius(enemies, center, radius) {
    return enemies.filter(
        (enemy) =>
            enemy.health > ACTION_STATE_CONFIG.ZERO &&
            Math.hypot(enemy.position.x - center.x, enemy.position.y - center.y) <= radius
    );
}

export function reflectVelocity(incomingVelocity, collisionNormal) {
    const velocity = new Vector2(incomingVelocity.x, incomingVelocity.y);
    const normal = new Vector2(collisionNormal.x, collisionNormal.y);
    if (!normal.isFinite() || normal.length() <= ACTION_STATE_CONFIG.DIRECTION_EPSILON) {
        throw new Error("collisionNormal must be non-zero");
    }
    normal.normalize();
    return velocity.subtract(normal.scale(ACTION_RUNTIME_CONFIG.VECTOR_REFLECTION_SCALE * velocity.dot(normal)));
}
