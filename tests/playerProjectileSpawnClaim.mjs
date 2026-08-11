import assert from "node:assert/strict";
import {
    createPlayerProjectileSpawnClaim,
    createPlayerProjectileSpawnReceipt,
    deserializePlayerProjectileSpawnClaim,
    serializePlayerProjectileSpawnClaim
} from "../src/game/network/PlayerProjectileSpawnClaim.js";

export function run() {
    const claim = createPlayerProjectileSpawnClaim({
        predictionId: "player-1:42",
        clientTick: 42,
        targetId: "enemy-1",
        position: { x: 100, y: 200 }
    });
    assert.deepEqual(deserializePlayerProjectileSpawnClaim(serializePlayerProjectileSpawnClaim(claim)), claim);
    assert.deepEqual(
        createPlayerProjectileSpawnReceipt({
            predictionId: claim.predictionId,
            accepted: true,
            projectileId: "projectile-1"
        }),
        { predictionId: claim.predictionId, accepted: true, projectileId: "projectile-1" }
    );
    assert.deepEqual(
        createPlayerProjectileSpawnReceipt({
            predictionId: claim.predictionId,
            accepted: false,
            reason: "weapon-cooldown"
        }),
        { predictionId: claim.predictionId, accepted: false, reason: "weapon-cooldown" }
    );
    assert.throws(() => createPlayerProjectileSpawnClaim({ ...claim, clientTick: -1 }), /clientTick/);
    assert.throws(() => createPlayerProjectileSpawnClaim({ ...claim, position: { x: NaN, y: 0 } }), /position/);
    assert.throws(
        () => deserializePlayerProjectileSpawnClaim('{"protocolVersion":2}'),
        /unsupported player projectile spawn claim/
    );
}
