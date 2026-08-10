import assert from "node:assert/strict";
import { ARTIFACT_CATALOG } from "../src/game/artifacts/ArtifactCatalog.js";
import {
    advanceArtifactRewardSelection,
    createArtifactRewardSelection
} from "../src/game/rewards/ArtifactRewardSelection.js";

function command(horizontal = 0, vertical = 0) {
    return { horizontal, vertical };
}

export function run() {
    let selection = createArtifactRewardSelection({
        checkpointId: "checkpoint-8",
        choices: ARTIFACT_CATALOG,
        selectedIndex: 0
    });

    let result = advanceArtifactRewardSelection(selection, command(1));
    assert.equal(result.selection.selectedIndex, 0, "held traversal input must not choose on overlay open");
    assert.equal(result.confirmedArtifactId, null);

    result = advanceArtifactRewardSelection(result.selection, command());
    assert.equal(result.selection.inputReady, true);

    result = advanceArtifactRewardSelection(result.selection, command(1));
    assert.equal(result.selection.selectedIndex, 1, "a fresh direction edge must update the local card immediately");

    result = advanceArtifactRewardSelection(result.selection, command());
    result = advanceArtifactRewardSelection(result.selection, command(0, -1));
    assert.equal(result.confirmedArtifactId, "rapid-gear", "confirmation must return the locally selected artifact");
}
