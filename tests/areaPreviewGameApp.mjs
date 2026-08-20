import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { AreaPreviewGameApp } from "../src/game/runtime/AreaPreviewGameApp.js";
import { CURRENT_AUTHORED_AREA_CATALOG } from "../src/game/world/areas/CurrentAuthoredAreaCatalog.js";
import { GENERATED_AREA as generatedArea } from "../src/game/world/areas/generated/sector01/Sector01Stage01.generated.js";

function renderer() {
    return {
        profile: "test",
        cssWidth: 1280,
        cssHeight: 720,
        screenToWorld: () => ({ x: 0, y: 0 }),
        draw: () => ({})
    };
}

export function run() {
    const preview = new AreaPreviewGameApp({
        canvas: {},
        renderer: renderer(),
        generatedArea,
        revision: "editor-apply-9",
        worldSeed: 9
    });
    const snapshot = preview.authority.snapshot();
    assert.equal(snapshot.world.areas.length, 1);
    assert.equal(snapshot.world.areas[0].id, generatedArea.id);
    assert.equal(snapshot.worldProgress.currentAreaId, generatedArea.id);
    assert.equal(preview.authority.simulation.worldCatalog.id, "map-editor-preview");
    assert.notEqual(preview.authority.simulation.worldCatalog, CURRENT_AUTHORED_AREA_CATALOG);
    assert.notEqual(CURRENT_AUTHORED_AREA_CATALOG.areas.length, 1);
    assert.equal(preview.applyDebugSettings({ startAreaId: "sector-01-07" }), false);
    assert.equal(preview.applyDebugSettings({ startAreaId: generatedArea.id }), true);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    run();
    console.log("PASS areaPreviewGameApp");
}
