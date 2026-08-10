import assert from "node:assert/strict";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";

export function run() {
    const canvas = {
        getContext: () => ({}),
        getBoundingClientRect: () => ({ left: 10, top: 20 })
    };
    const renderer = new CanvasRenderer(canvas);
    assert.deepEqual(
        renderer.screenToWorld({ x: 360, y: 180 }, { x: 100, y: 50, zoom: 0.5 }),
        { x: 800, y: 370 },
        "screen aiming must account for the wider zoomed-out mobile camera"
    );
    assert.deepEqual(renderer.screenToWorld({ x: 360, y: 180 }, { x: 100, y: 50 }), { x: 450, y: 210 });
}
