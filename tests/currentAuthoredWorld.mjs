import assert from "node:assert/strict";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { WorldProgressState } from "../src/game/world/WorldProgressState.js";
import { CURRENT_AUTHORED_AREA_CATALOG } from "../src/game/world/areas/CurrentAuthoredAreaCatalog.js";
import { parseStartAreaId } from "../src/game/metrics/MetricsDebugMode.js";

export function run() {
    const catalog = CURRENT_AUTHORED_AREA_CATALOG;
    assert.deepEqual(validateAreaCatalog(catalog), { valid: true, issues: [] });
    assert.equal(catalog.areas.length, 24);
    assert.deepEqual(
        catalog.areas.map(({ order }) => order),
        Array.from({ length: 24 }, (_, index) => index + 1)
    );

    const sector01Finale = catalog.areas[7];
    assert.equal(sector01Finale.id, "sector-01-08");
    assert.equal(sector01Finale.nextAreaId, "sector-02-01");
    assert.equal(sector01Finale.gate.nextAreaId, "sector-02-01");
    assert.equal(catalog.areas[8].id, "sector-02-01");

    const sector02Finale = catalog.areas[15];
    assert.equal(sector02Finale.id, "sector-02-08");
    assert.equal(sector02Finale.nextAreaId, "sector-03-01", "2-8 must bridge to 3-1");
    assert.equal(catalog.areas[16].id, "sector-03-01");

    const finalArea = catalog.areas.at(-1);
    assert.equal(finalArea.id, "sector-03-08");
    assert.equal(finalArea.nextAreaId, null);
    assert.equal(finalArea.gate.completionMode, "content-boundary");

    const world = assembleAuthoredWorld(catalog, { seed: 9182, floorY: 320 });
    assert.equal(world.areas.length, 24);
    const localDrone = catalog.areas[9].objects.find(({ id }) => id === "sector-02-02:drone-1");
    const assembledDrone = world.objects.find(({ id }) => id === localDrone.id);
    const areaOriginY = world.areas[9].bounds.y + world.areas[9].bounds.height;
    assert.deepEqual(
        assembledDrone.patrol.points,
        localDrone.patrol.points.map(({ x, y }) => ({ x, y: y + areaOriginY })),
        "nested patrol route coordinates must be translated into the continuous world"
    );
    assert.equal(world.enemySpawns.filter(({ enemyType }) => enemyType === "patrol-drone-t1").length, 13);
    assert.equal(world.scannerGroups.length, 6);

    const simulation = createCurrentGameSimulation({ worldSeed: 9182 });
    assert.equal(simulation.world.definitionRevision, catalog.revision);
    assert.equal(simulation.world.areas.length, 24);

    const progress = new WorldProgressState(catalog);
    for (const area of catalog.areas) {
        for (const objective of area.objectives) progress.completeObjective(objective.id);
        assert.equal(progress.crossGate(area.gate.id).accepted, true);
    }
    assert.equal(progress.snapshot().contentBoundaryReached, true);
    assert.equal(progress.snapshot().completed, false);
    assert.equal(progress.snapshot().currentAreaId, "sector-03-08");
    assert.deepEqual(new WorldProgressState(catalog, progress.snapshot()).snapshot(), progress.snapshot());
    assert.throws(
        () => new WorldProgressState(catalog, { ...progress.snapshot(), completed: true }),
        /content-boundary/i
    );

    assert.equal(parseStartAreaId("?start=sector-03-02"), "sector-03-02");
    assert.equal(parseStartAreaId("?metrics=1&start=sector-01-03"), "sector-01-03");
    assert.equal(parseStartAreaId("?start="), null);

    const debugStart = createCurrentGameSimulation({ worldSeed: 9182, startAreaId: "sector-03-02" });
    assert.equal(debugStart.worldProgress.snapshot().currentAreaId, "sector-03-02");
    assert.equal(debugStart.activeCheckpoint.id, "checkpoint:sector-03-02");
    const sector03Entry = debugStart.world.areas.find(({ id }) => id === "sector-03-02").entry;
    assert.equal(debugStart.players[0].physics.position.x, sector03Entry.x);
    assert.equal(debugStart.players[0].physics.position.y, sector03Entry.y);

    const invalidStart = createCurrentGameSimulation({ worldSeed: 9182, startAreaId: "missing-area" });
    assert.equal(invalidStart.worldProgress.snapshot().currentAreaId, "sector-01-01");
    assert.equal(invalidStart.players[0].physics.position.y, invalidStart.world.areas[0].entry.y);
}
