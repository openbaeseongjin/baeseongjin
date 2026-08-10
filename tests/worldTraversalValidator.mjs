import assert from "node:assert/strict";
import { ROPE_CONFIG, WORLD_CONFIG } from "../src/game/config.js";
import { WorldGenerator } from "../src/game/world/WorldGenerator.js";
import { validateWorldTraversal } from "../src/game/world/WorldTraversalValidator.js";
import { WORLD_REGRESSION_SEEDS } from "../scripts/worldRegressionSeeds.mjs";

export function run() {
    assert.ok(WORLD_REGRESSION_SEEDS.some(({ seed }) => seed === WORLD_CONFIG.seed));
    assert.equal(new Set(WORLD_REGRESSION_SEEDS.map(({ seed }) => seed)).size, WORLD_REGRESSION_SEEDS.length);
    const world = new WorldGenerator(WORLD_CONFIG).generate();
    assert.deepEqual(
        validateWorldTraversal(world, {
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance,
            minimumVerticalGain: WORLD_CONFIG.minimumVerticalGain
        }),
        { valid: true, issues: [] }
    );

    const invalid = {
        route: [
            { x: 0, width: 100, topY: 500 },
            { x: 500, width: 100, topY: 420 },
            { x: 500, width: 100, topY: 450 }
        ]
    };
    const result = validateWorldTraversal(invalid, { maxAttachDistance: 440, minimumVerticalGain: 150 });
    assert.equal(result.valid, false);
    assert.deepEqual(
        result.issues.map((issue) => [issue.type, issue.level]),
        [
            ["rope-range", 1],
            ["vertical-progress", 1],
            ["vertical-progress", 2]
        ]
    );
}
