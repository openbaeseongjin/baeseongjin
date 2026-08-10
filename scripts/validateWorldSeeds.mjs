import { ROPE_CONFIG, WORLD_CONFIG } from "../src/game/config.js";
import { WorldGenerator } from "../src/game/world/WorldGenerator.js";
import { validateWorldTraversal } from "../src/game/world/WorldTraversalValidator.js";

const seedCount = 1000;
const failures = [];
for (let offset = 0; offset < seedCount; offset += 1) {
    const seed = WORLD_CONFIG.seed + offset;
    const world = new WorldGenerator({ ...WORLD_CONFIG, seed }).generate();
    const result = validateWorldTraversal(world, {
        maxAttachDistance: ROPE_CONFIG.maxAttachDistance,
        minimumVerticalGain: WORLD_CONFIG.minimumVerticalGain
    });
    if (!result.valid) failures.push({ seed, issues: result.issues });
}

if (failures.length > 0) {
    console.error(`World traversal validation failed for ${failures.length}/${seedCount} seeds.`);
    for (const failure of failures.slice(0, 10)) console.error(JSON.stringify(failure));
    process.exitCode = 1;
} else {
    console.log(`World traversal validation passed: ${seedCount} seeds.`);
}
