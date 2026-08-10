import assert from "node:assert/strict";
import { ARTIFACT_CATALOG, getArtifactEffects } from "../src/game/artifacts/ArtifactCatalog.js";

export function run() {
    assert.equal(ARTIFACT_CATALOG.length, 3);
    const power = getArtifactEffects([ARTIFACT_CATALOG[0]]);
    const rapid = getArtifactEffects([ARTIFACT_CATALOG[1]]);
    const ropeIdle = getArtifactEffects([ARTIFACT_CATALOG[2]], 0);
    const ropeActive = getArtifactEffects([ARTIFACT_CATALOG[2]], 1);
    assert.equal(power.damageMultiplier, 1.4);
    assert.equal(rapid.fireIntervalMultiplier, 0.75);
    assert.equal(ropeIdle.damageMultiplier, 1);
    assert.equal(ropeActive.damageMultiplier, 1.6);
    assert.equal(ropeActive.swingDamageDuration, 3);
}
