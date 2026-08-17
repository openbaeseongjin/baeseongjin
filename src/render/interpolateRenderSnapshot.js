import { Vector2 } from "../game-kit/index.js";

const TELEPORT_DISTANCE = 96;
const TWO_PI = Math.PI * 2;

function lerp(start, end, alpha) {
    return start + (end - start) * alpha;
}

function lerpAngle(previous, current, alpha) {
    let delta = (current - previous) % TWO_PI;
    if (delta > Math.PI) delta -= TWO_PI;
    if (delta < -Math.PI) delta += TWO_PI;
    return previous + delta * alpha;
}

function lerpVector(previous, current, alpha) {
    return new Vector2(lerp(previous.x, current.x, alpha), lerp(previous.y, current.y, alpha));
}

function interpolatePositions(previousItems, currentItems, alpha) {
    if (!Array.isArray(previousItems) || previousItems.length === 0) return currentItems;
    const previousById = new Map();
    for (const item of previousItems) previousById.set(item.id, item);
    return currentItems.map((current) => {
        const previous = previousById.get(current.id);
        if (!previous) return current;
        return { ...current, position: lerpVector(previous.position, current.position, alpha) };
    });
}

export function interpolateRenderSnapshot(previous, current, alpha = 0) {
    if (!previous || !current || current.tick === previous.tick) return current;
    const clamped = Math.max(0, Math.min(1, alpha));
    if (current.resets !== previous.resets || current.runState !== previous.runState) return current;
    const travel = Math.hypot(
        current.player.position.x - previous.player.position.x,
        current.player.position.y - previous.player.position.y
    );
    if (travel > TELEPORT_DISTANCE) return current;
    return {
        ...current,
        player: {
            ...current.player,
            position: lerpVector(previous.player.position, current.player.position, clamped),
            angle: lerpAngle(previous.player.angle, current.player.angle, clamped)
        },
        enemies: interpolatePositions(previous.enemies, current.enemies, clamped),
        projectiles: interpolatePositions(previous.projectiles, current.projectiles, clamped),
        enemyProjectiles: interpolatePositions(previous.enemyProjectiles, current.enemyProjectiles, clamped)
    };
}
