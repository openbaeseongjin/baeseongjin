import assert from "node:assert/strict";
import { RunMetrics } from "../src/game/metrics/RunMetrics.js";

export function run() {
    const metrics = new RunMetrics();
    metrics.recordActiveTime(12.5);
    metrics.recordCheckpoint();
    metrics.recordFirstReward();
    metrics.recordActiveTime(2.5);
    metrics.recordFirstReward();
    metrics.recordCombat(
        {
            hits: [
                { type: "enemy-hit", damage: 10 },
                { type: "enemy-defeated", damage: 10 }
            ]
        },
        { hits: [{ type: "player-hit", damage: 20 }], ropeCutAt: { x: 0, y: 0 } }
    );
    metrics.recordDefeat();
    assert.deepEqual(metrics.snapshot(), {
        activeSeconds: 15,
        checkpointsReached: 1,
        enemyDefeats: 1,
        damageTaken: 20,
        ropeCuts: 1,
        defeats: 1,
        firstRewardSeconds: 12.5
    });
}
