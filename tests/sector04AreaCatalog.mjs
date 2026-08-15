import assert from "node:assert/strict";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { SECTOR_04_AREA_CATALOG } from "../src/game/world/areas/sector04/Sector04AreaCatalog.js";

export function run() {
    assert.deepEqual(validateAreaCatalog(SECTOR_04_AREA_CATALOG), { valid: true, issues: [] });
    assert.equal(SECTOR_04_AREA_CATALOG.areas.length, 8);

    const area = SECTOR_04_AREA_CATALOG.areas[0];
    assert.equal(area.id, "sector-04-01");
    assert.equal(area.sectorId, "sector-04");
    assert.equal(area.name, "TRANSIT INTAKE");
    assert.deepEqual(area.bounds, { width: 1600, height: 1376 });
    assert.equal(area.nextAreaId, "sector-04-02");
    assert.equal(area.gate.nextAreaId, "sector-04-02");
    assert.equal(area.gate.completionMode, undefined);
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

    const cutterArea = SECTOR_04_AREA_CATALOG.areas[1];
    assert.equal(cutterArea.id, "sector-04-02");
    assert.equal(cutterArea.name, "CUTTER LINE");
    assert.deepEqual(cutterArea.bounds, { width: 1280, height: 1312 });
    assert.equal(cutterArea.nextAreaId, "sector-04-03");
    assert.equal(cutterArea.gate.nextAreaId, "sector-04-03");
    assert.equal(cutterArea.gate.completionMode, undefined);
    assert.deepEqual(cutterArea.windZones, []);
    assert.equal(cutterArea.surfaces.filter(({ kind }) => kind === "grapple-target").length, 5);

    const cutterSentry = cutterArea.objects.find(({ id }) => id.endsWith(":cutter-sentry-01"));
    assert.equal(cutterSentry.kind, "sentry");
    assert.equal(cutterSentry.enemyType, "sentry-t1");
    assert.deepEqual(cutterSentry.rules, ["cutter-fire", "target-lock-cycle", "activation-band-only"]);
    assert.ok(cutterSentry.rules.includes("cutter-fire"), "the Cutter Sentry must opt in to rope cutting");

    const freightArea = SECTOR_04_AREA_CATALOG.areas[2];
    assert.equal(freightArea.id, "sector-04-03");
    assert.equal(freightArea.name, "FREIGHT BYPASS");
    assert.deepEqual(freightArea.bounds, { width: 1472, height: 1472 });
    assert.equal(freightArea.nextAreaId, "sector-04-04");
    assert.equal(freightArea.gate.nextAreaId, "sector-04-04");
    assert.equal(freightArea.gate.completionMode, undefined);
    assert.equal(freightArea.surfaces.filter(({ kind }) => kind === "grapple-target").length, 7);

    const wakeZone = freightArea.windZones[0];
    assert.equal(wakeZone.id, "sector-04-03:freight-wake");
    assert.equal(wakeZone.mode, "pulsed");
    assert.equal(wakeZone.strength, 360);
    assert.deepEqual(wakeZone.cycle, { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 });
    assert.equal(wakeZone.falloff, undefined, "Sector 04 Transit Wake must rely on defaultFalloff 0");

    const freightSentry = freightArea.objects.find(({ id }) => id.endsWith(":cutter-sentry-01"));
    assert.ok(freightSentry.rules.includes("cutter-fire"));

    const restArea = SECTOR_04_AREA_CATALOG.areas[3];
    assert.equal(restArea.id, "sector-04-04");
    assert.equal(restArea.name, "INFRASTRUCTURE SERVICE NODE");
    assert.deepEqual(restArea.bounds, { width: 1152, height: 896 });
    assert.equal(restArea.nextAreaId, "sector-04-05");
    assert.equal(restArea.gate.nextAreaId, "sector-04-05");
    assert.equal(restArea.gate.completionMode, undefined, "4-4 REST is a mid-sector node once 4-5 is authored");
    assert.deepEqual(restArea.windZones, []);
    assert.equal(restArea.surfaces.filter(({ kind }) => kind === "grapple-target").length, 5);
    assert.equal(restArea.objects.filter(({ kind }) => kind === "sentry" || kind === "patrol-drone").length, 0);
    assert.ok(restArea.objects.find(({ id }) => id.endsWith(":routing-status-display")));

    const expressArea = SECTOR_04_AREA_CATALOG.areas[4];
    assert.equal(expressArea.id, "sector-04-05");
    assert.equal(expressArea.name, "EXPRESS SHAFT");
    assert.deepEqual(expressArea.bounds, { width: 1216, height: 1536 });
    assert.equal(expressArea.nextAreaId, "sector-04-06");
    assert.equal(expressArea.gate.nextAreaId, "sector-04-06");
    assert.equal(expressArea.surfaces.filter(({ kind }) => kind === "grapple-target").length, 6);
    assert.equal(expressArea.objects.filter(({ kind }) => kind === "sentry" || kind === "patrol-drone").length, 0);
    assert.equal(expressArea.windZones.length, 1);
    assert.equal(expressArea.windZones[0].id, "sector-04-05:express-wake");
    assert.deepEqual(expressArea.windZones[0].direction, { x: 0, y: -1 });
    assert.equal(expressArea.windZones[0].mode, "pulsed");
    assert.equal(expressArea.windZones[0].strength, 360);
    assert.deepEqual(expressArea.windZones[0].cycle, { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 });
    assert.equal(expressArea.windZones[0].falloff, undefined, "Sector 04 Wake must rely on defaultFalloff 0");

    const relayArea = SECTOR_04_AREA_CATALOG.areas[5];
    assert.equal(relayArea.id, "sector-04-06");
    assert.equal(relayArea.name, "POWER RELAY SPAN");
    assert.deepEqual(relayArea.bounds, { width: 1536, height: 1568 });
    assert.equal(relayArea.nextAreaId, "sector-04-07");
    assert.deepEqual(relayArea.windZones, []);
    assert.equal(relayArea.surfaces.filter(({ kind }) => kind === "grapple-target").length, 6);
    const relaySentry = relayArea.objects.find(({ id }) => id.endsWith(":cutter-sentry-01"));
    assert.equal(relaySentry.kind, "sentry");
    assert.ok(relaySentry.rules.includes("cutter-fire"));
    const relayDrone = relayArea.objects.find(({ id }) => id.endsWith(":patrol-drone-01"));
    assert.equal(relayDrone.kind, "patrol-drone");
    assert.equal(relayDrone.enemyType, "patrol-drone-t1");
    assert.ok(relayDrone.rules.includes("no-rope-cut"));

    const junctionArea = SECTOR_04_AREA_CATALOG.areas[6];
    assert.equal(junctionArea.id, "sector-04-07");
    assert.equal(junctionArea.name, "ISOLATION JUNCTION");
    assert.deepEqual(junctionArea.bounds, { width: 1472, height: 1536 });
    assert.equal(junctionArea.nextAreaId, "sector-04-08");
    assert.equal(junctionArea.surfaces.filter(({ kind }) => kind === "grapple-target").length, 7);
    assert.equal(junctionArea.windZones.length, 1);
    assert.equal(junctionArea.windZones[0].id, "sector-04-07:junction-wake");
    assert.deepEqual(junctionArea.windZones[0].direction, { x: 1, y: 0 });
    assert.ok(junctionArea.objects.find(({ id }) => id.endsWith(":feeder-status-display")));
    assert.ok(junctionArea.objects.find(({ id }) => id.endsWith(":cutter-sentry-01")));

    const trunkArea = SECTOR_04_AREA_CATALOG.areas[7];
    assert.equal(trunkArea.id, "sector-04-08");
    assert.equal(trunkArea.name, "TRANSIT CONTROL TRUNK");
    assert.deepEqual(trunkArea.bounds, { width: 1536, height: 1856 });
    assert.equal(
        trunkArea.nextAreaId,
        null,
        "4-8 must not wire Sector 05 until the Post-Sector 04 Boss/Transition is decided"
    );
    assert.equal(trunkArea.gate.nextAreaId, null);
    assert.equal(trunkArea.gate.completionMode, "content-boundary");
    assert.equal(trunkArea.surfaces.filter(({ kind }) => kind === "grapple-target").length, 9);
    assert.equal(trunkArea.windZones.length, 1);
    assert.equal(trunkArea.windZones[0].id, "sector-04-08:control-trunk-wake");
    assert.deepEqual(trunkArea.windZones[0].direction, { x: 0, y: -1 });
    assert.ok(trunkArea.objects.find(({ id }) => id.endsWith(":final-status-display")));
    assert.ok(trunkArea.objects.find(({ id }) => id.endsWith(":post-sector-access")));
    assert.ok(trunkArea.objects.find(({ id }) => id.endsWith(":patrol-drone-01")));
    assert.ok(trunkArea.objects.find(({ id }) => id.endsWith(":cutter-sentry-01")));

    const world = assembleAuthoredWorld(SECTOR_04_AREA_CATALOG, { seed: 1, floorY: 560 });
    assert.equal(world.areas.length, 8);
    assert.equal(world.gates.length, 8);
    assert.equal(world.windZones.length, 4);
    assert.equal(world.gates[0].nextAreaId, "sector-04-02");
    assert.equal(world.gates[1].nextAreaId, "sector-04-03");
    assert.equal(world.gates[2].nextAreaId, "sector-04-04");
    assert.equal(world.gates[3].nextAreaId, "sector-04-05");
    assert.equal(world.gates[3].completionMode, undefined);
    assert.equal(world.gates[4].nextAreaId, "sector-04-06");
    assert.equal(world.gates[5].nextAreaId, "sector-04-07");
    assert.equal(world.gates[6].nextAreaId, "sector-04-08");
    assert.equal(world.gates[7].nextAreaId, null);
    assert.equal(world.gates[7].completionMode, "content-boundary");
    assert.deepEqual(world.areas[0].entry, { id: "sector-04-01:entry", x: -640, y: 528 });
    assert.deepEqual(world.areas[0].exit, { id: "sector-04-01:exit", x: 672, y: -784 });
    assert.equal(
        world.enemySpawns.find(({ objectId }) => objectId === "sector-04-02:cutter-sentry-01").enemyType,
        "sentry-t1"
    );
    assert.deepEqual(world.enemySpawns.find(({ objectId }) => objectId === "sector-04-02:cutter-sentry-01").rules, [
        "cutter-fire",
        "target-lock-cycle",
        "activation-band-only"
    ]);
    assert.equal(world.enemySpawns.filter(({ areaId }) => areaId === "sector-04-03").length, 1);
    assert.equal(world.enemySpawns.filter(({ areaId }) => areaId === "sector-04-04").length, 0);
}
