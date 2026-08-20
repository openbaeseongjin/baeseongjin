import assert from "node:assert/strict";
import {
    advanceAuthoredCamera,
    authoredAreaForPosition,
    resolveAuthoredCameraShot
} from "../src/game/camera/AuthoredCameraDirector.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";
import { CAMERA_CONFIG, resolveMobileCameraZoom } from "../src/game/config.js";

function playerAt(area, localY, x = 0) {
    return { position: { x, y: area.bounds.y + area.bounds.height + localY } };
}

export function run() {
    const mobileViewport = Object.freeze({ cssWidth: 844, cssHeight: 390 });
    const mobileViewportFit = Math.min(844 / 1920, 390 / 1080);
    assert.equal(resolveMobileCameraZoom(0.72), 1, "the reference desktop viewport must remain the baseline");
    assert.ok(Math.abs(resolveMobileCameraZoom(0.72, mobileViewport) - mobileViewportFit) < 1e-9);
    assert.ok(Math.abs(resolveMobileCameraZoom(0.82, mobileViewport) - mobileViewportFit * (0.82 / 0.72)) < 1e-9);
    const world = assembleAuthoredWorld(SECTOR_01_AREA_CATALOG, { seed: 42, floorY: 560 });
    const area = world.areas[0];
    const cases = [
        [-32, "intro", 1.25, 0.82, 0.46],
        [-300, "first-hook", 1.16, 0.79, 0.58],
        [-500, "cross-back", 1.06, 0.75, 0.58],
        [-700, "open-swing", 0.96, 0.7, 0.58],
        [-950, "terminal", 1.12, 0.77, 0.58]
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
            resolveAuthoredCameraShot({ world, player, mobileView: true, defaultZoom: 1, ...mobileViewport }).zoom,
            resolveMobileCameraZoom(mobileZoom, mobileViewport)
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

    const mobileCamera = { x: 0, y: 0, zoom: 1, initialized: false };
    const mobileShot = advanceAuthoredCamera({
        camera: mobileCamera,
        world,
        player: introPlayer,
        mobileView: true,
        cssWidth: mobileViewport.cssWidth,
        cssHeight: mobileViewport.cssHeight,
        dt: 1 / 120,
        defaultZoom: 1
    });
    const expectedMobileZoom = resolveMobileCameraZoom(0.82, mobileViewport);
    assert.equal(mobileShot.zoom, expectedMobileZoom);
    assert.equal(mobileCamera.zoom, expectedMobileZoom);
    assert.ok(Math.abs(mobileViewport.cssHeight / mobileCamera.zoom - 1080 * (0.72 / 0.82)) < 1e-9);
    assert.ok(mobileViewport.cssWidth / mobileCamera.zoom >= 1920 * (0.72 / 0.82));

    const area02 = world.areas[1];
    // REV8.0 geometry (docs/bsh/scenario/1/1-2/AREA-SPEC.json camera.zones): bounds height dropped to
    // 960 (was 1088), zones renamed first-handoff->left-cross, direction-reversal->airborne-reattach,
    // flow-test->roof-wrap, and zoom values rescaled.
    const area02Cases = [
        [-32, "lift-failure", 1.15, 0.79, 0.75],
        [-300, "left-cross", 0.94, 0.7, 0.68],
        [-600, "airborne-reattach", 0.9, 0.68, 0.38],
        [-700, "roof-wrap", 0.96, 0.71, 0.38],
        [-880, "exit", 1.1, 0.76, 0.38]
    ];
    for (const [localY, zoneId, desktopZoom, mobileZoom, horizontalPlayerRatio] of area02Cases) {
        const player = playerAt(area02, localY, -320);
        assert.deepEqual(resolveAuthoredCameraShot({ world, player, defaultZoom: 1 }), {
            areaId: "sector-01-02",
            landmarkId: null,
            sectorId: "sector-01",
            zoneId,
            zoom: desktopZoom,
            localX: player.position.x,
            localY,
            horizontalPlayerRatio,
            verticalPlayerRatio: 0.58
        });
        assert.equal(
            resolveAuthoredCameraShot({ world, player, mobileView: true, defaultZoom: 1, ...mobileViewport }).zoom,
            resolveMobileCameraZoom(mobileZoom, mobileViewport)
        );
    }
    const anchorAPlayer = playerAt(area02, -192, 224);
    const anchorAShot = resolveAuthoredCameraShot({ world, player: anchorAPlayer, defaultZoom: 1 });
    const anchorAViewportLeft =
        anchorAPlayer.position.x - (1280 / anchorAShot.zoom) * anchorAShot.horizontalPlayerRatio;
    const anchorAViewportRight = anchorAViewportLeft + 1280 / anchorAShot.zoom;
    assert.ok(anchorAViewportLeft <= -592, "Anchor A framing must reveal the Counterweight and Service Slot");
    assert.ok(anchorAViewportLeft <= -320 && anchorAViewportRight >= -320, "Anchor C must be visible before release");

    const area03 = world.areas[2];
    const area03Cases = [
        [-32, "identification", 1.15, 0.78, 0.5],
        [-320, "warning", 1, 0.72, 0.6],
        [-480, "turret-reveal", 0.94, 0.7, 0.68],
        [-700, "annex-combat", 0.86, 0.66, 0.62],
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
            resolveAuthoredCameraShot({ world, player, mobileView: true, defaultZoom: 1, ...mobileViewport }).zoom,
            resolveMobileCameraZoom(mobileZoom, mobileViewport)
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
