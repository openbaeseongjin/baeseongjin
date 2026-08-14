import assert from "node:assert/strict";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { SECTOR_02_AREA_CATALOG } from "../src/game/world/areas/sector02/Sector02AreaCatalog.js";

function patrolDrones(area) {
    return area.objects.filter(({ kind }) => kind === "patrol-drone");
}

function verticalBandsOverlap(left, right) {
    return Math.max(left.y, right.y) < Math.min(left.y + left.height, right.y + right.height);
}

export function run() {
    assert.deepEqual(validateAreaCatalog(SECTOR_02_AREA_CATALOG), { valid: true, issues: [] });
    assert.equal(SECTOR_02_AREA_CATALOG.areas.length, 8);
    assert.deepEqual(
        SECTOR_02_AREA_CATALOG.areas.map((area) => area.order),
        [1, 2, 3, 4, 5, 6, 7, 8]
    );
    assert.deepEqual(
        SECTOR_02_AREA_CATALOG.areas.map((area) => patrolDrones(area).length),
        [0, 1, 0, 1, 1, 0, 2, 2]
    );
    assert.ok(SECTOR_02_AREA_CATALOG.areas.every(({ windZones }) => windZones.length === 0));
    assert.ok(
        SECTOR_02_AREA_CATALOG.areas.every((area) =>
            area.objects.some(({ kind, gateId }) => kind === "gate-panel" && gateId === area.gate.id)
        ),
        "every Sector 02 floor must use the same visible Gate-side control panel"
    );

    for (const area of SECTOR_02_AREA_CATALOG.areas) {
        for (const drone of patrolDrones(area)) {
            assert.equal(drone.enemyType, "patrol-drone-t1");
            assert.ok(drone.patrol.points.length >= 2);
            assert.ok(drone.rules.includes("no-rope-cut"));
            assert.ok(drone.rules.includes("target-lock-cycle"));
            assert.ok(drone.rules.includes("activation-band-only"));
        }
    }

    for (const areaId of ["sector-02-07", "sector-02-08"]) {
        const bands = patrolDrones(SECTOR_02_AREA_CATALOG.areas.find(({ id }) => id === areaId)).map(
            ({ activation }) => activation
        );
        assert.equal(verticalBandsOverlap(bands[0], bands[1]), false, `${areaId} patrol bands must not crossfire`);
    }

    const specializationArea = SECTOR_02_AREA_CATALOG.areas[2];
    const specializationNode = specializationArea.objects.find(({ id }) => id.endsWith(":specialization-node"));
    assert.equal(specializationArea.objectives[0].type, "interact-choice");
    assert.equal(specializationNode.selectionPool, "TBD");
    assert.equal(specializationNode.requiresFoundation, true);

    const evacuationWalkway = SECTOR_02_AREA_CATALOG.areas[4];
    const narrativeGate = evacuationWalkway.objects.find(({ id }) => id.endsWith(":upper-transit-gate"));
    const maintenanceFrame = evacuationWalkway.objects.find(({ id }) => id.endsWith(":maintenance-frame"));
    assert.equal(narrativeGate.narrativeLock, true);
    assert.equal(narrativeGate.gateId, undefined);
    assert.equal(maintenanceFrame.gateId, evacuationWalkway.gate.id);

    const finale = SECTOR_02_AREA_CATALOG.areas.at(-1);
    assert.equal(finale.gate.completionMode, "content-boundary");
    assert.equal(finale.nextAreaId, null);
    assert.equal(finale.checkpoints[0].reward, false, "Sector 02 finale must not invent an Augment reward");
}
