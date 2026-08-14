import assert from "node:assert/strict";
import {
    advanceAuthoredCamera,
    authoredAreaForPosition,
    resolveAuthoredCameraShot
} from "../src/game/camera/AuthoredCameraDirector.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

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
            zoneId,
            zoom: desktopZoom,
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

    const area02Player = playerAt(world.areas[1], -32, -320);
    assert.deepEqual(resolveAuthoredCameraShot({ world, player: area02Player, defaultZoom: 1 }), {
        areaId: "sector-01-02",
        zoneId: null,
        zoom: 1,
        localY: -32,
        horizontalPlayerRatio: 0.38,
        verticalPlayerRatio: 0.58
    });
}
