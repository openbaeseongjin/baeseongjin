import assert from "node:assert/strict";
import { WORLD_CONFIG, ropeHookReach } from "../src/game/config.js";
import { closestPointOnPolygon } from "../src/game/world/PolygonGeometry.js";
import { generateWorld } from "../src/game/world/WorldGenerator.js";

export function run() {
    const first = generateWorld(WORLD_CONFIG);
    const second = generateWorld(WORLD_CONFIG);
    const different = generateWorld({ ...WORLD_CONFIG, seed: WORLD_CONFIG.seed + 1 });

    assert.deepEqual(first, second, "the same seed must generate the same world");
    assert.notDeepEqual(first, different, "different seeds must vary the world");
    assert.equal(first.route.length, WORLD_CONFIG.levelCount + 1);
    assert.equal(first.surfaces.length, WORLD_CONFIG.levelCount + 1);
    assert.equal(first.enemySpawns.length, Math.floor(WORLD_CONFIG.levelCount / WORLD_CONFIG.enemySpawnInterval));
    assert.ok(!first.surfaces.some((surface) => surface.kind === "ceiling-rock"), "the upward route must stay clear");
    assert.ok(
        !first.surfaces.some((surface) => surface.kind === "swing-wall"),
        "vertical walls must not block traversal"
    );
    assert.ok(first.surfaces.every((surface) => surface.vertices.length >= 7));
    assert.ok(
        first.surfaces.filter((surface) => surface.oneWay).every((surface) => surface.oneWayEdgeEnd === 4),
        "one-way rocks must expose the exact highlighted top-edge chain"
    );
    assert.ok(first.topY < WORLD_CONFIG.floorY - WORLD_CONFIG.verticalStep * (WORLD_CONFIG.levelCount - 1));
    const summitPlatform = first.route.at(-1);
    assert.deepEqual(first.summit, {
        x: summitPlatform.x + summitPlatform.width * 0.5,
        y: summitPlatform.topY - WORLD_CONFIG.summitRadius,
        radius: WORLD_CONFIG.summitRadius
    });
    assert.deepEqual(first.summit, second.summit, "the same seed must produce the same summit target");
    assert.equal(first.checkpoints.length, WORLD_CONFIG.levelCount / WORLD_CONFIG.checkpointInterval);
    assert.deepEqual(first.checkpoints, second.checkpoints, "the same seed must produce the same checkpoints");
    assert.deepEqual(
        first.checkpoints.map((checkpoint) => checkpoint.level),
        [0, 8, 16, 24, 32, 40]
    );

    for (let index = 1; index < first.route.length; index += 1) {
        const previous = first.route[index - 1];
        const current = first.route[index];
        const previousCenter = { x: previous.x + previous.width * 0.5, y: previous.y };
        const currentCenter = { x: current.x + current.width * 0.5, y: current.y };
        const distance = Math.hypot(currentCenter.x - previousCenter.x, currentCenter.y - previousCenter.y);
        assert.ok(current.y < previous.y - 150, `level ${index} must progress upward`);
        assert.ok(distance < ropeHookReach(), `level ${index} must stay within rope reach`);
    }
    for (const spawn of first.enemySpawns) {
        const platform = first.route[spawn.level];
        assert.ok(spawn.x >= platform.x && spawn.x <= platform.x + platform.width);
        assert.ok(spawn.y < platform.topY, `enemy at level ${spawn.level} must spawn above its route rock`);
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
