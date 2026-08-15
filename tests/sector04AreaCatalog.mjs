import assert from "node:assert/strict";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { SECTOR_04_AREA_CATALOG } from "../src/game/world/areas/sector04/Sector04AreaCatalog.js";

export function run() {
    assert.deepEqual(validateAreaCatalog(SECTOR_04_AREA_CATALOG), { valid: true, issues: [] });

    const area = SECTOR_04_AREA_CATALOG.areas[0];
    assert.equal(area.id, "sector-04-01");
    assert.equal(area.sectorId, "sector-04");
    assert.equal(area.name, "TRANSIT INTAKE");
    assert.deepEqual(area.bounds, { width: 1600, height: 1376 });
    assert.equal(area.nextAreaId, null, "4-1 must stay a content boundary until Post-Sector 03 transition is decided");
    assert.equal(area.gate.nextAreaId, null);
    assert.equal(area.gate.completionMode, "content-boundary");
    assert.deepEqual(area.windZones, []);
    assert.equal(area.surfaces.filter(({ kind }) => kind === "grapple-target").length, 6);

    const anchorPositions = area.objects
        .filter(({ kind }) => kind === "grapple-landmark")
        .map(({ id, position }) => [id, position.x, position.y]);
    assert.deepEqual(anchorPositions, [
        ["sector-04-01:anchor-a1", -352, -192],
        ["sector-04-01:anchor-a2", 0, -352],
        ["sector-04-01:anchor-a3", 288, -592],
        ["sector-04-01:anchor-a4", -64, -800],
        ["sector-04-01:anchor-a5", 192, -1056],
        ["sector-04-01:anchor-a6", 448, -1248]
    ]);

    const world = assembleAuthoredWorld(SECTOR_04_AREA_CATALOG, { seed: 1, floorY: 560 });
    assert.equal(world.areas.length, 1);
    assert.equal(world.gates.length, 1);
    assert.equal(world.windZones.length, 0);
    assert.equal(world.gates[0].nextAreaId, null);
    assert.equal(world.gates[0].completionMode, "content-boundary");
    assert.deepEqual(world.areas[0].entry, { id: "sector-04-01:entry", x: -640, y: 528 });
    assert.deepEqual(world.areas[0].exit, { id: "sector-04-01:exit", x: 672, y: -784 });
}
