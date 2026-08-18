import assert from "node:assert/strict";
import {
    advanceAuthoredCamera,
    authoredAreaForPosition,
    resolveAuthoredCameraShot
} from "../src/game/camera/AuthoredCameraDirector.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

function playerAt(area, localY, x = 0) {
    return { position: { x, y: area.bounds.y + area.bounds.height + localY } };
}

export function run() {
    const world = assembleAuthoredWorld(SECTOR_01_AREA_CATALOG, { seed: 42, floorY: 560 });
    const area = world.areas[0];
    const cases = [
        [-32, "intro", 1.25, 0.82, 0.46],
        [-224, "first-hook", 1.2, 0.8, 0.58],
        [-480, "release-corridor", 1.1, 0.76, 0.58],
        [-704, "open-swing", 1, 0.72, 0.58],
        [-896, "terminal", 1.15, 0.78, 0.58]
    ];

    for (const [localY, zoneId, desktopZoom, mobileZoom, verticalPlayerRatio] of cases) {
        const player = playerAt(area, localY);
        assert.equal(authoredAreaForPosition(world, player.position)?.id, area.id);
        assert.deepEqual(resolveAuthoredCameraShot({ world, player, defaultZoom: 1 }), {
            areaId: area.id,
            landmarkId: null,
            sectorId: "sector-01",
            zoneId,
            zoom: desktopZoom,
            localX: player.position.x,
            localY,
            horizontalPlayerRatio: 0.38,
            verticalPlayerRatio
        });
        assert.equal(
            resolveAuthoredCameraShot({ world, player, mobileView: true, defaultZoom: 0.72 }).zoom,
            mobileZoom
        );
    }

    const camera = { x: 0, y: 0, zoom: 1, initialized: false };
    const introPlayer = playerAt(area, -32, -320);
    const shot = advanceAuthoredCamera({
        camera,
        world,
        player: introPlayer,
        cssWidth: 1280,
        cssHeight: 720,
        dt: 1 / 120,
        defaultZoom: 1
    });
    assert.equal(shot.zoneId, "intro");
    assert.ok(Math.abs(camera.zoom - 1.25) < 1e-9);
    assert.ok(Math.abs(camera.x - (-320 - (1280 / 1.25) * 0.38)) < 1e-9);
    assert.ok(Math.abs(camera.y - (introPlayer.position.y - (720 / 1.25) * 0.46)) < 1e-9);
    assert.equal(camera.initialized, true);

    const area02 = world.areas[1];
    const area02Cases = [
        [-32, "lift-failure", 1.2, 0.8],
        [-300, "first-handoff", 1, 0.72],
        [-600, "direction-reversal", 0.95, 0.7],
        [-800, "flow-test", 1, 0.72],
        [-1000, "exit", 1.15, 0.78]
    ];
    for (const [localY, zoneId, desktopZoom, mobileZoom] of area02Cases) {
        const player = playerAt(area02, localY, -320);
        assert.deepEqual(resolveAuthoredCameraShot({ world, player, defaultZoom: 1 }), {
            areaId: "sector-01-02",
            landmarkId: null,
            sectorId: "sector-01",
            zoneId,
            zoom: desktopZoom,
            localX: player.position.x,
            localY,
            horizontalPlayerRatio: 0.38,
            verticalPlayerRatio: 0.58
        });
        assert.equal(
            resolveAuthoredCameraShot({ world, player, mobileView: true, defaultZoom: 0.72 }).zoom,
            mobileZoom
        );
    }

    const area03 = world.areas[2];
    const area03Cases = [
        [-32, "identification", 1.15, 0.78, 0.5],
        [-320, "warning", 1, 0.72, 0.6],
        [-480, "turret-reveal", 0.95, 0.7, 0.68],
        [-700, "route-choice", 0.88, 0.66, 0.62],
        [-880, "relief", 1, 0.72, 0.6],
        [-1000, "exit", 1.15, 0.78, 0.68]
    ];
    for (const [localY, zoneId, desktopZoom, mobileZoom, verticalPlayerRatio] of area03Cases) {
        const player = playerAt(area03, localY, -192);
        assert.deepEqual(resolveAuthoredCameraShot({ world, player, defaultZoom: 1 }), {
            areaId: "sector-01-03",
            landmarkId: null,
            sectorId: "sector-01",
            zoneId,
            zoom: desktopZoom,
            localX: player.position.x,
            localY,
            horizontalPlayerRatio: 0.38,
            verticalPlayerRatio
        });
        assert.equal(
            resolveAuthoredCameraShot({ world, player, mobileView: true, defaultZoom: 0.72 }).zoom,
            mobileZoom
        );
    }

    const seamlessWorld = createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 42, floorY: 560 });
    const landmark = seamlessWorld.landmarks[0];
    const seamlessShot = resolveAuthoredCameraShot({
        world: seamlessWorld,
        player: playerAt(landmark, -32, landmark.entry.x),
        defaultZoom: 1
    });
    assert.equal(seamlessShot.areaId, landmark.legacyAreaId);
    assert.equal(seamlessShot.landmarkId, landmark.id);
    assert.equal(seamlessShot.sectorId, "sector-01");

    const sector02Landmark = seamlessWorld.landmarks.find(({ id }) => id === "sector-02:landmark:01");
    assert.equal(
        authoredAreaForPosition(seamlessWorld, sector02Landmark.entry)?.id,
        sector02Landmark.id,
        "overlapping vertical landmark bounds resolve to the nearest entry or exit anchor"
    );
}
