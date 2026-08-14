import assert from "node:assert/strict";
import { WorldProgressState } from "../src/game/world/WorldProgressState.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

export function run() {
    const progress = new WorldProgressState(SECTOR_01_AREA_CATALOG);
    assert.equal(progress.snapshot().currentAreaId, "sector-01-01");
    assert.equal(progress.isGateUnlocked("sector-01-01:gate"), false);

    assert.deepEqual(progress.crossGate("sector-01-01:gate"), {
        accepted: false,
        changed: false,
        reason: "gate-locked"
    });
    const completed = progress.completeObjective("sector-01-01:terminal-read");
    assert.equal(completed.accepted, true);
    assert.equal(completed.gateUnlocked, true);
    assert.equal(progress.isGateUnlocked("sector-01-01:gate"), true);
    assert.deepEqual(progress.completeObjective("sector-01-01:terminal-read"), {
        accepted: true,
        changed: false,
        reason: "objective-already-complete"
    });

    const crossed = progress.crossGate("sector-01-01:gate");
    assert.equal(crossed.currentAreaId, "sector-01-02");
    assert.equal(progress.snapshot().currentAreaId, "sector-01-02");
    assert.deepEqual(progress.crossGate("sector-01-01:gate"), {
        accepted: true,
        changed: false,
        reason: "gate-already-crossed"
    });
    assert.deepEqual(progress.completeObjective("sector-01-03:maintenance-override"), {
        accepted: false,
        changed: false,
        reason: "objective-not-current"
    });

    const restored = new WorldProgressState(SECTOR_01_AREA_CATALOG, progress.snapshot());
    assert.deepEqual(restored.snapshot(), progress.snapshot());
    assert.throws(
        () =>
            new WorldProgressState(SECTOR_01_AREA_CATALOG, {
                ...progress.snapshot(),
                unlockedGateIds: []
            }),
        /unlocked|unlock state/
    );

    const completeRun = new WorldProgressState(SECTOR_01_AREA_CATALOG);
    for (const area of SECTOR_01_AREA_CATALOG.areas) {
        for (const objective of area.objectives) completeRun.completeObjective(objective.id);
        const result = completeRun.crossGate(area.gate.id);
        assert.equal(result.accepted, true);
    }
    assert.equal(completeRun.snapshot().completed, true);
    assert.equal(completeRun.snapshot().currentAreaId, "sector-01-08");
}
