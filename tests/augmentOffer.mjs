import assert from "node:assert/strict";
import { createLogicalAugmentEntitlement, deterministicAugmentOffer } from "../src/game/augments/AugmentOffer.js";

export function run() {
    const input = { runSeed: 20260818, playerId: "player-a", selectionIndex: 0, selectedAugmentIds: [] };
    const first = deterministicAugmentOffer(input);
    assert.deepEqual(deterministicAugmentOffer(input), first);
    assert.equal(first.length, 3);
    assert.equal(new Set(first).size, 3);
    assert.notDeepEqual(deterministicAugmentOffer({ ...input, playerId: "player-b" }), first);

    const actionSelected = ["direction-dash"];
    const compatible = deterministicAugmentOffer({ ...input, selectionIndex: 1, selectedAugmentIds: actionSelected });
    assert.equal(
        compatible.some((id) => id === "dash-strike"),
        false,
        "other base Actions must leave the pool"
    );
    assert.equal(
        compatible.some((id) => id.endsWith("shot") && id !== "straight-shot"),
        false,
        "incompatible signatures must stay out"
    );
    const entitlement = createLogicalAugmentEntitlement({
        ...input,
        sourceId: "sector-01-04:maintenance-node"
    });
    assert.equal(entitlement.triggerToken, "augment-entitlement:player-a:0");
    assert.equal(Object.hasOwn(entitlement, "legacyStageAlias"), false);
}
