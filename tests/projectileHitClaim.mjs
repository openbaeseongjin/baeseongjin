import assert from "node:assert/strict";
import {
    createProjectileHitClaim,
    createProjectileHitReceipt,
    deserializeProjectileHitClaim,
    serializeProjectileHitClaim
} from "../src/game/network/ProjectileHitClaim.js";

export function run() {
    const claim = createProjectileHitClaim({
        predictionId: "player-1:42",
        targetId: "enemy-1",
        clientTick: 42,
        position: { x: 120, y: 320 }
    });
    assert.deepEqual(deserializeProjectileHitClaim(serializeProjectileHitClaim(claim)), claim);
    assert.deepEqual(
        createProjectileHitReceipt({
            predictionId: claim.predictionId,
            accepted: true,
            resolution: "enemy-hit",
            damage: 10
        }),
        { predictionId: claim.predictionId, accepted: true, resolution: "enemy-hit", damage: 10 }
    );
    assert.throws(() => createProjectileHitReceipt({ predictionId: claim.predictionId, accepted: false }), /reason/);
}
