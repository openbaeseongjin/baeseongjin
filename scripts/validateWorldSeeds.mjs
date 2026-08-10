import { ROPE_CONFIG, WORLD_CONFIG } from "../src/game/config.js";
import { WorldGenerator } from "../src/game/world/WorldGenerator.js";
import { validateWorldTraversal } from "../src/game/world/WorldTraversalValidator.js";
import { WORLD_REGRESSION_SEEDS } from "./worldRegressionSeeds.mjs";

const seedCount = 1000;
const failures = [];
const sweepSeeds = Array.from({ length: seedCount }, (_, offset) => WORLD_CONFIG.seed + offset);
const cases = [
    ...WORLD_REGRESSION_SEEDS.map(({ seed, reason }) => ({ seed, source: "regression", reason })),
    ...sweepSeeds.map((seed) => ({ seed, source: "sweep" }))
];
for (const testCase of cases) {
    const { seed } = testCase;
    const world = new WorldGenerator({ ...WORLD_CONFIG, seed }).generate();
    const result = validateWorldTraversal(world, {
        maxAttachDistance: ROPE_CONFIG.maxAttachDistance,
        minimumVerticalGain: WORLD_CONFIG.minimumVerticalGain
    });
    if (!result.valid) failures.push({ ...testCase, issues: result.issues });
}

if (failures.length > 0) {
    console.error(`World traversal validation failed for ${failures.length}/${cases.length} cases.`);
    for (const failure of failures.slice(0, 10)) console.error(JSON.stringify(failure));
    process.exitCode = 1;
} else {
    console.log(
        `World traversal validation passed: ${WORLD_REGRESSION_SEEDS.length} regression seeds + ${seedCount} sweep seeds.`
    );
}
