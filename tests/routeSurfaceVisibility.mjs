import assert from "node:assert/strict";
import { WorldGeometryRenderer } from "../src/render/layers/SharedSceneRenderers.js";
import { PixelTerrainRenderer } from "../src/render/environment/renderers/PixelTerrainRenderer.js";
import {
    collisionSurfacesForSectorProgress,
    isSurfaceEnabledForProgress
} from "../src/game/world/WorldGateGeometry.js";

function surface(id, requiredRouteId = null) {
    return {
        id,
        ...(requiredRouteId ? { requiredRouteId } : {}),
        x: 0,
        y: 0,
        width: 128,
        height: 32,
        vertices: [
            { x: 0, y: 0 },
            { x: 128, y: 0 },
            { x: 128, y: 32 },
            { x: 0, y: 32 }
        ]
    };
}

export function run() {
    const routeId = "sector-01:landmark:01:route:sector-01:landmark:02";
    const world = { surfaces: [surface("always"), surface("locked-connector", routeId)] };
    const lockedProgress = { unlockedRouteIds: [] };
    const unlockedProgress = { unlockedRouteIds: [routeId] };

    assert.equal(isSurfaceEnabledForProgress(world.surfaces[0], lockedProgress), true);
    assert.equal(isSurfaceEnabledForProgress(world.surfaces[1], lockedProgress), false);
    assert.equal(isSurfaceEnabledForProgress(world.surfaces[1], unlockedProgress), true);
    assert.deepEqual(
        collisionSurfacesForSectorProgress(world, { isRouteUnlocked: (id) => id === routeId }).map(({ id }) => id),
        ["always", "locked-connector"]
    );
    assert.deepEqual(
        collisionSurfacesForSectorProgress(world, { isRouteUnlocked: () => false }).map(({ id }) => id),
        ["always"]
    );

    const polygonRenderer = new WorldGeometryRenderer();
    assert.deepEqual(
        polygonRenderer.surfaceEntries(world, lockedProgress).map(({ surface }) => surface.id),
        ["always"],
        "polygon fallback must not draw a locked route connector as solid terrain"
    );
    assert.deepEqual(
        polygonRenderer.surfaceEntries(world, unlockedProgress).map(({ surface }) => surface.id),
        ["always", "locked-connector"],
        "polygon fallback must reveal the connector in the same state that enables collision"
    );

    const pixelRenderer = new PixelTerrainRenderer({ definition: null, assets: null });
    assert.deepEqual(
        pixelRenderer.surfaceEntries(world, lockedProgress).map(({ surface }) => surface.id),
        ["always"],
        "pixel terrain must not draw a locked route connector as a walkable deck"
    );
    assert.deepEqual(
        pixelRenderer.surfaceEntries(world, unlockedProgress).map(({ surface }) => surface.id),
        ["always", "locked-connector"],
        "pixel terrain must reveal the connector in the same state that enables collision"
    );
}
