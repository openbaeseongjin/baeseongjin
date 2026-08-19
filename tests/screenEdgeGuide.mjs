import assert from "node:assert/strict";
import { projectWorldToScreen, resolveScreenEdgeGuide } from "../src/render/ScreenEdgeGuide.js";

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
}
