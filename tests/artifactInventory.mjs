import assert from "node:assert/strict";
import { ArtifactInventory } from "../src/game/artifacts/ArtifactInventory.js";

export function run() {
    const inventory = new ArtifactInventory({ checkpointLossFraction: 1 / 3, minimumOwnedForLoss: 2 });
    inventory.add({ id: "first" });
    assert.deepEqual(inventory.applyCheckpointLoss(), [], "one artifact must be retained");

    for (const id of ["second", "third", "fourth", "fifth", "sixth"]) inventory.add({ id });
    assert.deepEqual(
        inventory.applyCheckpointLoss().map((artifact) => artifact.id),
        ["fifth", "sixth"],
        "checkpoint loss must deterministically remove the newest third"
    );
    assert.deepEqual(
        inventory.snapshot().map((artifact) => artifact.id),
        ["first", "second", "third", "fourth"]
    );

    const authoritative = [{ id: "remote", modifiers: { damageMultiplier: 1.4 } }];
    inventory.replace(authoritative);
    authoritative[0].id = "mutated";
    assert.deepEqual(
        inventory.snapshot().map((artifact) => artifact.id),
        ["remote"],
        "restoring authority must replace local items without retaining caller objects"
    );
    assert.throws(() => inventory.replace(null), /artifacts must be an array/);
}
