import assert from "node:assert/strict";
import { createAuthoredWorld, DEFAULT_AUTHORED_AREA_CATALOG } from "../src/game/world/AuthoredWorldFactory.js";
import { resolveObjectTriggerBounds } from "../src/game/world/areas/AreaDefinition.js";
import { SECTOR_02_AREA_CATALOG } from "../src/game/world/areas/sector02/Sector02AreaCatalog.js";
import {
    createLegacyAreaSeamlessSectorRuntimeWorld,
    SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT,
    SEAMLESS_SECTOR_RUNTIME_REVISION,
    SEAMLESS_SECTOR_RUNTIME_WIDTH
} from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

export function run() {
    assert.equal(
        createAuthoredWorld({ seed: 9182, floorY: 320 }).definitionId,
        DEFAULT_AUTHORED_AREA_CATALOG.id,
        "the new compiler must not switch the current default Runtime"
    );

    const world = createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 320 });
    assert.deepEqual(world, createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 320 }));
    assert.equal(world.definitionRevision, SEAMLESS_SECTOR_RUNTIME_REVISION);
    assert.equal(world.sectors.length, 3);
    assert.equal(world.landmarks.length, 24);
    assert.equal(world.landmarkAliases.length, 24);
    assert.equal(world.sectorEntries.length, 3);
    assert.equal(world.respawnAnchors.length, 3);
    assert.equal(world.connectors.length, 23);
    assert.equal(world.routeLocks.length, 23);
    assert.equal(world.gates.length, 0);
    assert.equal(world.checkpoints.length, 0);
    assert.equal(world.areas.length, 0);

    for (const sector of world.sectors) {
        assert.equal(sector.width, SEAMLESS_SECTOR_RUNTIME_WIDTH);
        assert.equal(sector.bounds.width, SEAMLESS_SECTOR_RUNTIME_WIDTH);
        assert.ok(sector.bounds.height <= SEAMLESS_SECTOR_RUNTIME_MAX_HEIGHT);
        assert.ok(sector.bounds.width > sector.bounds.height);
        assert.ok(world.respawnAnchors.some(({ id }) => id === sector.respawnAnchorId));
        const sectorLandmarks = sector.landmarkIds.map((id) => world.landmarks.find((landmark) => landmark.id === id));
        assert.equal(new Set(sectorLandmarks.map(({ origin }) => origin.x)).size, 4);
        for (let index = 1; index < sectorLandmarks.length; index += 2) {
            assert.equal(sectorLandmarks[index - 1].exit.y, sectorLandmarks[index].entry.y);
        }
        for (const landmarkId of sector.landmarkIds) {
            const landmark = world.landmarks.find(({ id }) => id === landmarkId);
            assert.ok(landmark.bounds.x >= sector.bounds.x);
            assert.ok(landmark.bounds.x + landmark.bounds.width <= sector.bounds.x + sector.bounds.width);
        }
    }
    assert.equal(
        world.surfaces.some(({ kind }) => kind === "inter-floor-divider" || kind === "area-boundary-wall"),
        false
    );
    assert.equal(
        world.enemySpawns.some((spawn) => "areaId" in spawn),
        false
    );

    for (const connector of world.connectors) {
        const source = world.landmarks.find(({ id }) => id === connector.sourceLandmarkId);
        const target = world.landmarks.find(({ id }) => id === connector.targetLandmarkId);
        assert.deepEqual(connector.start, source.exit);
        assert.deepEqual(connector.end, target.entry);
        const surface = world.surfaces.find(({ id }) => id === connector.surfaceId);
        assert.ok(surface);
        assert.equal(surface.oneWay, false);
        assert.ok(surface.height >= 32);
    }

    const transferLock = world.routeLocks.find(({ targetLandmarkId }) => targetLandmarkId === "sector-03:landmark:01");
    assert.deepEqual(transferLock.requiredObjectiveIds, ["sector-02:landmark:08:objective:transfer-control-read"]);

    const encounter = world.enemySpawns.find(({ slotId }) => slotId === "sector-02:landmark:02:slot:drone-1");
    const landmark = world.landmarks.find(({ id }) => id === "sector-02:landmark:02");
    const legacyDrone = SECTOR_02_AREA_CATALOG.areas[1].objects.find(({ id }) => id === "sector-02-02:drone-1");
    const legacyActivation = resolveObjectTriggerBounds(legacyDrone.position, legacyDrone.activationSpec);
    assert.ok(encounter);
    assert.equal(encounter.encounterId, "sector-02:landmark:02:encounter:drone-1");
    assert.deepEqual(encounter.enemySelection, { fixedEnemyType: "patrol-drone-t1" });
    assert.deepEqual(encounter.position, {
        x: landmark.origin.x + legacyDrone.position.x,
        y: landmark.origin.y + legacyDrone.position.y
    });
    assert.deepEqual(encounter.activation, {
        x: landmark.origin.x + legacyActivation.x,
        y: landmark.origin.y + legacyActivation.y,
        width: legacyActivation.width,
        height: legacyActivation.height
    });
}
