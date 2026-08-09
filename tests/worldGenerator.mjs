import assert from "node:assert/strict";
import { ROPE_CONFIG, WORLD_CONFIG } from "../src/game/config.js";
import { closestPointOnPolygon } from "../src/game/world/PolygonGeometry.js";
import { WorldGenerator } from "../src/game/world/WorldGenerator.js";

export function run() {
    const first = new WorldGenerator(WORLD_CONFIG).generate();
    const second = new WorldGenerator(WORLD_CONFIG).generate();
    const different = new WorldGenerator({ ...WORLD_CONFIG, seed: WORLD_CONFIG.seed + 1 }).generate();

    assert.deepEqual(first, second, "the same seed must generate the same world");
    assert.notDeepEqual(first, different, "different seeds must vary the world");
    assert.equal(first.route.length, WORLD_CONFIG.levelCount + 1);
    assert.ok(first.surfaces.length > WORLD_CONFIG.levelCount * 2);
    assert.ok(first.surfaces.every((surface) => surface.vertices.length >= 7));
    assert.ok(
        first.surfaces.filter((surface) => surface.oneWay).every((surface) => surface.oneWayEdgeEnd === 4),
        "one-way rocks must expose the exact highlighted top-edge chain"
    );
    assert.ok(first.topY < WORLD_CONFIG.floorY - WORLD_CONFIG.verticalStep * (WORLD_CONFIG.levelCount - 1));

    for (let index = 1; index < first.route.length; index += 1) {
        const previous = first.route[index - 1];
        const current = first.route[index];
        const previousCenter = { x: previous.x + previous.width * 0.5, y: previous.y };
        const currentCenter = { x: current.x + current.width * 0.5, y: current.y };
        const distance = Math.hypot(currentCenter.x - previousCenter.x, currentCenter.y - previousCenter.y);
        assert.ok(current.y < previous.y - 150, `level ${index} must progress upward`);
        assert.ok(distance < ROPE_CONFIG.maxAttachDistance, `level ${index} must stay within rope reach`);
    }
    assert.deepEqual(
        closestPointOnPolygon({ x: -5, y: 5 }, [
            { x: 0, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 0, y: 10 }
        ]),
        { x: 0, y: 5 }
    );
}
