import assert from "node:assert/strict";
import {
    createRopeImpactClaim,
    createRopeImpactReceipt,
    deserializeRopeImpactClaim,
    serializeRopeImpactClaim
} from "../src/game/network/RopeImpactClaim.js";

export function run() {
    const claim = createRopeImpactClaim({
        predictionId: "player-1:rope-impact:42:enemy-1",
        targetId: "enemy-1",
        clientTick: 42,
        position: { x: 12, y: -8 },
        velocity: { x: 620, y: 0 }
    });
    assert.deepEqual(deserializeRopeImpactClaim(serializeRopeImpactClaim(claim)), claim);
    assert.ok(Object.isFrozen(claim));
    assert.throws(() => createRopeImpactClaim({ ...claim, velocity: { x: Number.NaN, y: 0 } }), /velocity/);
    assert.deepEqual(
        createRopeImpactReceipt({
            predictionId: claim.predictionId,
            accepted: true,
            resolution: "enemy-hit",
            damage: 25
        }),
        {
            predictionId: claim.predictionId,
            accepted: true,
            resolution: "enemy-hit",
            damage: 25
        }
    );
}
