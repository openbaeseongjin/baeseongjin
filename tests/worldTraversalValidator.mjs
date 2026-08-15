import assert from "node:assert/strict";
import { WORLD_CONFIG, ropeHookReach } from "../src/game/config.js";
import { generateWorld } from "../src/game/world/WorldGenerator.js";
import { validateWorldTraversal } from "../src/game/world/WorldTraversalValidator.js";
import { WORLD_REGRESSION_SEEDS } from "../scripts/worldRegressionSeeds.mjs";

export function run() {
    assert.ok(WORLD_REGRESSION_SEEDS.some(({ seed }) => seed === WORLD_CONFIG.seed));
    assert.equal(new Set(WORLD_REGRESSION_SEEDS.map(({ seed }) => seed)).size, WORLD_REGRESSION_SEEDS.length);
    assert.deepEqual(
        WORLD_REGRESSION_SEEDS.map(({ reason }) => reason),
        [
            "최소 양의 시드 경계",
            "소규모 재현 기준 시드",
            "일반 분포 기준 시드",
            "현재 프로토타입 기본 시드",
            "32비트 부호 없는 최대 시드 경계"
        ]
    );
    const world = generateWorld(WORLD_CONFIG);
    assert.deepEqual(
        validateWorldTraversal(world, {
            maxAttachDistance: ropeHookReach(),
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
    const result = validateWorldTraversal(invalid, { maxAttachDistance: ropeHookReach(), minimumVerticalGain: 150 });
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
