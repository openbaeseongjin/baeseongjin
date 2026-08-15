import assert from "node:assert/strict";
import {
    createFoundationSelectionClaim,
    deserializeFoundationSelectionClaim,
    serializeFoundationSelectionClaim
} from "../src/game/network/FoundationSelectionClaim.js";
import {
    createFoundationShearClaim,
    createFoundationShearReceipt,
    deserializeFoundationShearClaim,
    serializeFoundationShearClaim
} from "../src/game/network/FoundationShearClaim.js";

export function run() {
    const claim = createFoundationSelectionClaim({
        sourceId: "sector-01-04:maintenance-node",
        foundationId: "relay-link",
        clientTick: 120
    });
    assert.deepEqual(deserializeFoundationSelectionClaim(serializeFoundationSelectionClaim(claim)), claim);
    assert.throws(() => createFoundationSelectionClaim({ ...claim, sourceId: "" }), /sourceId/);
    assert.throws(() => createFoundationSelectionClaim({ ...claim, foundationId: "" }), /foundationId/);
    assert.throws(() => createFoundationSelectionClaim({ ...claim, clientTick: -1 }), /clientTick/);

    const shearClaim = createFoundationShearClaim({
        predictionId: "player:foundation-shear:121:0",
        targetId: "enemy:1",
        targetKind: "enemy",
        clientTick: 121,
        anchor: { x: 100, y: 300 },
        playerPosition: { x: 200, y: 300 }
    });
    assert.deepEqual(deserializeFoundationShearClaim(serializeFoundationShearClaim(shearClaim)), shearClaim);
    assert.equal(
        createFoundationShearReceipt({ predictionId: shearClaim.predictionId, accepted: true, damage: 20 }).damage,
        20
    );
    assert.throws(() => createFoundationShearClaim({ ...shearClaim, targetKind: "wall" }), /targetKind/);
}
