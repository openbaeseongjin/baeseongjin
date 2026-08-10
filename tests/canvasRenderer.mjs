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
        stroke() {},
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
    renderer.drawArtifactHud([{ name: "로프 공명기" }], 1.5);
    assert.deepEqual(textCalls, ["아티팩트", "• 로프 공명기", "공명 1.5초"]);
    textCalls.length = 0;
    renderer.drawArtifactFeedback({ type: "artifact", age: 0.4, artifact: { name: "동력핵" } });
    assert.deepEqual(textCalls, ["아티팩트 획득", "동력핵"]);
    textCalls.length = 0;
    renderer.drawArtifactFeedback({ type: "artifact-loss", age: 0.4, artifacts: [{ name: "연사 톱니" }] });
    assert.deepEqual(textCalls, ["체크포인트 복귀 · 아티팩트 손실", "연사 톱니"]);
    textCalls.length = 0;
    borderCalls.length = 0;
    renderer.drawArtifactRewardOverlay({
        selectedIndex: 1,
        choices: [
            { name: "동력핵", description: "피해 증가" },
            { name: "연사 톱니", description: "연사 증가" },
            { name: "로프 공명기", description: "스윙 강화" }
        ]
    });
    assert.deepEqual(textCalls, [
        "아티팩트 선택",
        "좌우 이동으로 선택 · 점프로 획득",
        "동력핵",
        "피해 증가",
        "연사 톱니",
        "연사 증가",
        "로프 공명기",
        "스윙 강화"
    ]);
    textCalls.length = 0;
    borderCalls.length = 0;
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
    textCalls.length = 0;
    renderer.drawCheckpoints(
        [
            { id: "checkpoint-0", level: 0, x: 0, y: 0, radius: 38 },
            { id: "checkpoint-8", level: 8, x: 0, y: -100, radius: 38 }
        ],
        { id: "checkpoint-8", level: 8 }
    );
    assert.deepEqual(textCalls, ["체크", "활성"]);
}
