import assert from "node:assert/strict";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";

export function run() {
    const textCalls = [];
    const borderCalls = [];
    const context = {
        save() {},
        restore() {},
        fillRect() {},
        beginPath() {},
        arc() {},
        fill() {},
        fillText: (text) => textCalls.push(text),
        strokeRect: (...args) => borderCalls.push(args)
    };
    const canvas = {
        getContext: () => context,
        getBoundingClientRect: () => ({ left: 10, top: 20 })
    };
    const renderer = new CanvasRenderer(canvas);
    assert.deepEqual(
        renderer.screenToWorld({ x: 360, y: 180 }, { x: 100, y: 50, zoom: 0.5 }),
        { x: 800, y: 370 },
        "screen aiming must account for the wider zoomed-out mobile camera"
    );
    assert.deepEqual(renderer.screenToWorld({ x: 360, y: 180 }, { x: 100, y: 50 }), { x: 450, y: 210 });

    renderer.cssWidth = 844;
    renderer.cssHeight = 390;
    renderer.drawRopeCutFeedback({ type: "rope-cut", age: 0.2 }, 0.4);
    assert.deepEqual(textCalls, ["로프 절단!", "재연결까지 0.4초"]);
    assert.deepEqual(borderCalls, [[4, 4, 836, 382]]);
    assert.deepEqual(renderer.getImpactOffset(null), { x: 0, y: 0 });
    const impactOffset = renderer.getImpactOffset({ age: 0.05, lifetime: 0.2, strength: 6 });
    assert.notEqual(impactOffset.x, 0, "active impacts must offset the world layer");

    textCalls.length = 0;
    renderer.drawMobileControls({ visible: true, ropePointerDown: false, left: true, jump: false, right: false });
    assert.deepEqual(textCalls, ["←", "점프", "→"]);

    textCalls.length = 0;
    renderer.drawRunEndOverlay({ runState: "completed", defeatReason: null, restartRemaining: 2.4 });
    assert.deepEqual(textCalls, ["정상 도달", "전체 월드 등반 완료"]);
}
