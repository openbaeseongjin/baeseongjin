import assert from "node:assert/strict";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { WorldProgressState } from "../src/game/world/WorldProgressState.js";
import { CURRENT_AUTHORED_AREA_CATALOG } from "../src/game/world/areas/CurrentAuthoredAreaCatalog.js";

export function run() {
    const catalog = CURRENT_AUTHORED_AREA_CATALOG;
    assert.deepEqual(validateAreaCatalog(catalog), { valid: true, issues: [] });
    assert.equal(catalog.areas.length, 16);
    assert.deepEqual(
        catalog.areas.map(({ order }) => order),
        Array.from({ length: 16 }, (_, index) => index + 1)
    );

    const sector01Finale = catalog.areas[7];
    assert.equal(sector01Finale.id, "sector-01-08");
    assert.equal(sector01Finale.nextAreaId, "sector-02-01");
    assert.equal(sector01Finale.gate.nextAreaId, "sector-02-01");
    assert.equal(catalog.areas[8].id, "sector-02-01");

    const finalArea = catalog.areas.at(-1);
    assert.equal(finalArea.id, "sector-02-08");
    assert.equal(finalArea.nextAreaId, null);
    assert.equal(finalArea.gate.completionMode, "content-boundary");

    const world = assembleAuthoredWorld(catalog, { seed: 9182, floorY: 320 });
    assert.equal(world.areas.length, 16);
    const localDrone = catalog.areas[9].objects.find(({ id }) => id === "sector-02-02:drone-1");
    const assembledDrone = world.objects.find(({ id }) => id === localDrone.id);
    const areaOriginY = world.areas[9].bounds.y + world.areas[9].bounds.height;
    assert.deepEqual(
        assembledDrone.patrol.points,
        localDrone.patrol.points.map(({ x, y }) => ({ x, y: y + areaOriginY })),
        "nested patrol route coordinates must be translated into the continuous world"
    );
    assert.equal(world.enemySpawns.filter(({ enemyType }) => enemyType === "patrol-drone-t1").length, 7);

    const simulation = createCurrentGameSimulation({ worldSeed: 9182 });
    assert.equal(simulation.world.definitionRevision, catalog.revision);
    assert.equal(simulation.world.areas.length, 16);

    const progress = new WorldProgressState(catalog);
    for (const area of catalog.areas) {
        for (const objective of area.objectives) progress.completeObjective(objective.id);
        assert.equal(progress.crossGate(area.gate.id).accepted, true);
    }
    assert.equal(progress.snapshot().contentBoundaryReached, true);
    assert.equal(progress.snapshot().completed, false);
    assert.equal(progress.snapshot().currentAreaId, "sector-02-08");
    assert.deepEqual(new WorldProgressState(catalog, progress.snapshot()).snapshot(), progress.snapshot());
    assert.throws(
        () => new WorldProgressState(catalog, { ...progress.snapshot(), completed: true }),
        /content-boundary/i
    );
}
