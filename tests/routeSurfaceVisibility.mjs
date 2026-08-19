import assert from "node:assert/strict";
import { WorldGeometryRenderer } from "../src/render/layers/SharedSceneRenderers.js";
import { PixelTerrainRenderer } from "../src/render/environment/renderers/PixelTerrainRenderer.js";
import {
    collisionSurfacesForSectorProgress,
    isSurfaceEnabledForProgress
} from "../src/game/world/WorldGateGeometry.js";
import { SectorProgressState } from "../src/game/world/SectorProgressState.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

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

    const runtimeWorld = createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 320 });
    const runtimeProgress = new SectorProgressState(runtimeWorld);
    const firstLandmark = runtimeWorld.landmarks[0];
    const firstRoute = runtimeWorld.routeLocks.find(({ id }) => id === firstLandmark.outboundRouteId);
    const connector = runtimeWorld.surfaces.find(
        ({ id }) => id === firstRoute.connectorId.replace(":connector", ":surface")
    );
    const beforeUnlock = collisionSurfacesForSectorProgress(runtimeWorld, runtimeProgress).map(({ id }) => id);
    for (const objectiveId of firstLandmark.objectiveIds) runtimeProgress.completeObjective(objectiveId);
    const afterUnlock = collisionSurfacesForSectorProgress(runtimeWorld, runtimeProgress).map(({ id }) => id);
    const renderableAfterUnlock = afterUnlock.filter(
        (id) => runtimeWorld.surfaces.find((surface) => surface.id === id)?.renderable !== false
    );
    assert.deepEqual(
        afterUnlock.filter((id) => !beforeUnlock.includes(id)),
        [],
        "objective progress must not add any Stage floor or connector surface"
    );
    assert.equal(connector.kind, "sector-seam");
    assert.equal("requiredRouteId" in connector, false);
    assert.deepEqual(
        polygonRenderer.surfaceEntries(runtimeWorld, runtimeProgress.snapshot()).map(({ surface }) => surface.id),
        renderableAfterUnlock,
        "polygon rendering uses every unlocked collision surface that is authored as renderable"
    );
    assert.deepEqual(
        pixelRenderer.surfaceEntries(runtimeWorld, runtimeProgress.snapshot()).map(({ surface }) => surface.id),
        renderableAfterUnlock,
        "pixel rendering uses every unlocked collision surface that is authored as renderable"
    );
    assert.deepEqual(
        collisionSurfacesForSectorProgress(runtimeWorld, runtimeProgress).map(({ id }) => id),
        afterUnlock,
        "save and objective progress must preserve the static surface set"
    );
}
