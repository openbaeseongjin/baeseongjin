import assert from "node:assert/strict";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import {
    DEFAULT_WORLD_OBJECT_MOCK_CATALOG,
    worldObjectPresentation
} from "../src/render/assets/WorldObjectPresentationCatalog.js";

export function run() {
    const before = JSON.stringify(SECTOR_01_AREA_CATALOG);
    const first = assembleAuthoredWorld(SECTOR_01_AREA_CATALOG, { seed: 9182, floorY: 320 });
    const second = assembleAuthoredWorld(SECTOR_01_AREA_CATALOG, { seed: 9182, floorY: 320 });

    assert.deepEqual(first, second, "the same catalog and composition options must produce the same world");
    assert.equal(JSON.stringify(SECTOR_01_AREA_CATALOG), before, "assembly must not mutate authored definitions");
    assert.equal(first.definitionId, "sector-01-authored-mock");
    assert.equal(first.areas.length, 8);
    assert.equal(first.gates.length, 8);
    assert.equal(first.checkpoints.length, 9);
    assert.equal(first.checkpoints.filter(({ reward }) => reward).length, 1);
    assert.ok(first.surfaces.length > first.route.length);
    assert.ok(first.surfaces.every((surface) => Object.isFrozen(surface)));
    assert.ok(first.objects.every((object) => first.areas.some(({ id }) => id === object.areaId)));
    assert.ok(
        first.objects
            .filter(({ presentationId }) => presentationId)
            .every((object) => worldObjectPresentation(DEFAULT_WORLD_OBJECT_MOCK_CATALOG, object.presentationId)),
        "each rendered authored object must resolve through the replaceable mock presentation catalog"
    );

    for (let index = 1; index < first.areas.length; index += 1) {
        const previous = first.areas[index - 1];
        const current = first.areas[index];
        assert.equal(current.bounds.y, previous.bounds.y - current.bounds.height);
        assert.ok(current.entry.y < previous.entry.y, "authored areas must remain in one upward world");
    }

    assert.equal(first.summit.x, first.areas.at(-1).exit.x);
    assert.equal(first.summit.y, first.areas.at(-1).exit.y);
}
