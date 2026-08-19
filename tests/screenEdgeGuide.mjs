import assert from "node:assert/strict";
import {
    layoutAccessEdgeGuides,
    projectWorldToScreen,
    resolveAccessModuleTargets,
    resolveScreenEdgeGuide
} from "../src/render/ScreenEdgeGuide.js";

export function run() {
    const camera = { x: 0, y: 0, zoom: 1 };
    assert.deepEqual(projectWorldToScreen({ x: 40, y: 25 }, camera), { x: 40, y: 25 });
    assert.equal(
        resolveScreenEdgeGuide({
            target: { x: 100, y: 50 },
            camera,
            viewportWidth: 200,
            viewportHeight: 100
        }),
        null,
        "an on-screen Carrier must use its world icon instead of an edge arrow"
    );
    const right = resolveScreenEdgeGuide({
        target: { x: 300, y: 50 },
        camera,
        viewportWidth: 200,
        viewportHeight: 100,
        insets: { left: 20, right: 20, top: 10, bottom: 10 }
    });
    assert.deepEqual({ x: right.x, y: right.y, edge: right.edge }, { x: 180, y: 50, edge: "right" });
    assert.equal(right.angle, 0);

    const top = resolveScreenEdgeGuide({
        target: { x: 100, y: -100 },
        camera,
        viewportWidth: 200,
        viewportHeight: 100,
        insets: { left: 20, right: 20, top: 10, bottom: 10 }
    });
    assert.deepEqual({ x: top.x, y: top.y, edge: top.edge }, { x: 100, y: 10, edge: "top" });
    assert.equal(top.angle, -Math.PI / 2);

    const accessWorld = {
        landmarks: [
            {
                id: "sector-01:landmark:01",
                sectorId: "sector-01",
                bounds: { x: -100, y: -100, width: 200, height: 200 }
            }
        ],
        sectors: [
            {
                id: "sector-01",
                accessModuleIds: ["module:far", "module:near", "module:middle"],
                accessModuleRequirement: 3
            }
        ],
        accessModules: [
            { id: "module:far", position: { x: 1200, y: 40 } },
            { id: "module:near", position: { x: 40, y: 40 } },
            { id: "module:middle", position: { x: 1000, y: 50 } }
        ]
    };
    const remaining = (collectedAccessModuleIds = []) =>
        resolveAccessModuleTargets({
            world: accessWorld,
            worldProgress: { collectedAccessModuleIds },
            playerPosition: { x: 0, y: 0 }
        });
    assert.deepEqual(
        remaining().map(({ module }) => module.id),
        ["module:near", "module:middle", "module:far"],
        "Access targets must use deterministic distance order before authored order"
    );
    assert.ok(remaining()[0].scale > remaining()[1].scale && remaining()[1].scale > remaining()[2].scale);
    assert.equal(remaining()[2].scale, 0.62, "the far guide scale must remain readable");
    assert.deepEqual(
        remaining(["module:near"]).map(({ module }) => module.id),
        ["module:middle", "module:far"]
    );
    assert.equal(remaining(["module:near", "module:middle"]).length, 1);
    assert.equal(remaining(["module:near", "module:middle", "module:far"]).length, 0);

    const edgeGuides = layoutAccessEdgeGuides({
        targets: remaining(),
        camera,
        viewportWidth: 200,
        viewportHeight: 300,
        insets: { left: 20, right: 20, top: 10, bottom: 40 },
        compactView: true
    });
    assert.equal(edgeGuides.length, 2, "the on-screen diamond plus off-screen arrows must equal three targets");
    assert.deepEqual(
        edgeGuides.map(({ edge }) => edge),
        ["right", "right"]
    );
    assert.ok(edgeGuides[0].y !== edgeGuides[1].y, "same-edge guides must not overlap");
    assert.ok(
        edgeGuides.every(({ y }) => y >= 10 && y <= 260),
        "guides must stay inside mobile safe insets"
    );
}
