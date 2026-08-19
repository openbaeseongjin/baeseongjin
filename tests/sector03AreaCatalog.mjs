import assert from "node:assert/strict";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { SECTOR_03_AREA_CATALOG } from "../src/game/world/areas/sector03/Sector03AreaCatalog.js";

export function run() {
    assert.deepEqual(validateAreaCatalog(SECTOR_03_AREA_CATALOG), { valid: true, issues: [] });
    assert.equal(SECTOR_03_AREA_CATALOG.areas.length, 8);
    assert.deepEqual(
        SECTOR_03_AREA_CATALOG.areas
            .flatMap(({ objects }) => objects)
            .filter(({ accessModuleId }) => accessModuleId)
            .map(({ accessModuleId }) => accessModuleId),
        ["sector-03:access-module:a", "sector-03:access-module:b", "sector-03:access-module:c"]
    );

    const scannerGallery = SECTOR_03_AREA_CATALOG.areas[1];
    assert.equal(scannerGallery.id, "sector-03-02");
    assert.equal(scannerGallery.name, "SCANNER GALLERY");
    assert.equal(scannerGallery.scannerGroups.length, 1);
    assert.deepEqual(scannerGallery.scannerGroups[0].controlledSurfaceIds, [
        "sector-03-02:c1-surface",
        "sector-03-02:c2-surface",
        "sector-03-02:c3-surface"
    ]);
    assert.deepEqual(scannerGallery.scannerGroups[0].cycle, { available: 1.5, warning: 0.6, locked: 1.1, reset: 0.3 });
    assert.equal(scannerGallery.objects.filter(({ kind }) => kind === "patrol-drone").length, 0);

    const retail = SECTOR_03_AREA_CATALOG.areas[2];
    assert.equal(retail.id, "sector-03-03");
    assert.equal(retail.scannerGroups[0].id, "sector-03-03:scanner-retail-A");
    assert.equal(retail.objects.filter(({ kind }) => kind === "patrol-drone").length, 1);
    assert.equal(retail.objects.find(({ kind }) => kind === "patrol-drone").rules.includes("no-rope-cut"), true);

    const serviceNodeArea = SECTOR_03_AREA_CATALOG.areas[4];
    const serviceNode = serviceNodeArea.objects.find(({ id }) => id === "sector-03-05:service-calibration-frame");
    const augmentObjective = serviceNodeArea.objectives.find(({ id }) => id === "sector-03-05:augment-selected");
    const exitObjective = serviceNodeArea.objectives.find(({ id }) => id === "sector-03-05:exit-panel-engaged");
    assert.equal(serviceNodeArea.subtitle, "REST / AUGMENT SERVICE");
    assert.equal(serviceNode.kind, "augment-node");
    assert.equal(serviceNode.objectiveId, augmentObjective.id);
    assert.equal(augmentObjective.type, "interact-choice");
    assert.deepEqual(exitObjective.requiredObjectiveIds, [
        "sector-03-05:final-deck-reached",
        "sector-03-05:augment-selected"
    ]);

    const finale = SECTOR_03_AREA_CATALOG.areas[7];
    assert.equal(finale.id, "sector-03-08");
    assert.equal(finale.nextAreaId, null);
    assert.equal(finale.gate.completionMode, "content-boundary");
    assert.equal(finale.scannerGroups[0].controlledSurfaceIds.length, 4);
    assert.equal(finale.objects.filter(({ kind }) => kind === "patrol-drone").length, 2);

    const world = assembleAuthoredWorld(SECTOR_03_AREA_CATALOG, { seed: 1, floorY: 560 });
    assert.equal(world.areas.length, 8);
    assert.equal(world.scannerGroups.length, 6);
    assert.equal(world.enemySpawns.filter(({ enemyType }) => enemyType === "patrol-drone-t1").length, 6);
    const stamped = world.surfaces.find(({ id }) => id === "sector-03-02:c1-surface");
    assert.equal(stamped.grappleAccessGroup, "sector-03-02:scanner-A");
    assert.equal(world.surfaces.find(({ id }) => id === "sector-03-02:p2").grappleAccessGroup, undefined);
}
