import assert from "node:assert/strict";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";
import { PolygonSceneRenderer } from "../src/render/PolygonSceneRenderer.js";

export function run() {
    const textCalls = [];
    const borderCalls = [];
    const context = {
        save() {},
        restore() {},
        fillRect() {},
        translate() {},
        moveTo() {},
        lineTo() {},
        beginPath() {},
        arc() {},
        fill() {},
        stroke() {},
        fillText: (text) => textCalls.push(text),
        strokeRect: (...args) => borderCalls.push(args),
        measureText: (text) => ({ width: String(text).length * 6 })
    };
    const canvas = {
        getContext: () => context,
        getBoundingClientRect: () => ({ left: 10, top: 20 })
    };
    const renderer = new CanvasRenderer(canvas, new PolygonSceneRenderer());
    assert.deepEqual(
        renderer.screenToWorld({ x: 360, y: 180 }, { x: 100, y: 50, zoom: 0.5 }),
        { x: 800, y: 370 },
        "screen aiming must account for the wider zoomed-out mobile camera"
    );
    assert.deepEqual(renderer.screenToWorld({ x: 360, y: 180 }, { x: 100, y: 50 }), { x: 450, y: 210 });

    renderer.cssWidth = 844;
    renderer.cssHeight = 390;
    renderer.drawPlayerHealthHud({ playerHealth: 35, playerMaxHealth: 100 });
    assert.deepEqual(textCalls, ["HP", "35 / 100"]);
    textCalls.length = 0;
    renderer.drawPlayerHealthHud({ playerHealth: 0, playerMaxHealth: 100 });
    assert.deepEqual(textCalls, ["HP", "0 / 100"]);
    textCalls.length = 0;
    renderer.drawMetricsPanel({
        activeSeconds: 12.5,
        checkpointsReached: 1,
        enemyDefeats: 3,
        damageTaken: 20,
        ropeCuts: 2,
        defeats: 1,
        firstFoundationSeconds: 10,
        areaTiming: { currentAreaId: "sector-01-01", currentAreaSeconds: 42.75, clearSeconds: {} }
    });
    assert.deepEqual(textCalls, [
        "RUN METRICS",
        "활성 12.5초 · 체크 1",
        "처치 3 · 피해 20",
        "절단 2 · 사망 1",
        "첫 Foundation 10.0초",
        "구간 01-01 · 42.8초"
    ]);
    textCalls.length = 0;
    renderer.drawMetricsPanel(
        {
            activeSeconds: 12.5,
            checkpointsReached: 1,
            enemyDefeats: 3,
            damageTaken: 20,
            ropeCuts: 2,
            defeats: 1,
            firstFoundationSeconds: 10
        },
        {
            roundTripMs: 104.4,
            snapshotIntervalMs: 50.2,
            pendingCommands: 2,
            rejectionRate: 0.125,
            correctionP50: 4.4,
            correctionP95: 18.6,
            hardSnaps: 1,
            extrapolationMs: 12.2,
            maxExtrapolationMs: 46.8,
            predictionCancellations: 2
        }
    );
    assert.deepEqual(textCalls.slice(-5), [
        "NETWORK",
        "RTT 104ms · 스냅샷 50ms",
        "대기 2 · 거부 13%",
        "보정 p50 4 · p95 19",
        "스냅 1 · 외삽 12/47ms · 취소 2"
    ]);
    textCalls.length = 0;
    borderCalls.length = 0;
    renderer.drawEnvironmentMetrics({
        failedComponents: () => ["terrain", "decoration"],
        failedAtlasIds: () => ["terrain-edge", "decoration"]
    });
    assert.deepEqual(textCalls, [
        "ENV FALLBACK",
        "Components: terrain, decoration",
        "Atlases: terrain-edge, decoration"
    ]);
    textCalls.length = 0;
    renderer.drawEnvironmentMetrics({ failedComponents: () => [], failedAtlasIds: () => [] });
    assert.deepEqual(textCalls, []);
    renderer.drawStatusFeedback({ type: "checkpoint-respawn", reason: "fall", age: 0.4 });
    assert.deepEqual(textCalls, ["체크포인트 부활", "낙사 · 최대 체력으로 복귀"]);
    textCalls.length = 0;
    renderer.drawStatusFeedback({
        type: "augment-release-propulsion",
        age: 0.4
    });
    assert.deepEqual(textCalls, ["해제 추진", "속도 ×1.25"]);
    textCalls.length = 0;
    renderer.drawStatusFeedback({ type: "foundation-selected", foundationId: "impulse-coil", age: 0.4 });
    assert.deepEqual(textCalls, ["증강 획득", "해제 추진"]);
    textCalls.length = 0;
    renderer.drawStoryPresentation({
        title: "VERTICAL GRID",
        detail: "CASCADE FAILURE",
        age: 0.3,
        durationSeconds: 0.9
    });
    assert.deepEqual(textCalls, ["VERTICAL GRID", "CASCADE FAILURE"]);
    textCalls.length = 0;
    borderCalls.length = 0;
    renderer.drawRewardSelectionOverlay({
        rewardType: "foundation",
        selectionIndex: 0,
        selectedIndex: 1,
        choices: [
            {
                id: "impulse-coil",
                name: "IMPULSE COIL",
                family: "MOMENTUM",
                tagline: "POWER THE SWING",
                description: "스윙 타이밍으로 강한 해제 추진력을 얻습니다."
            },
            {
                id: "relay-link",
                name: "RELAY LINK",
                family: "CHAINING",
                tagline: "KEEP THE CHAIN ALIVE",
                description: "해제 직후 다음 로프 연결을 한 번 보조합니다."
            },
            {
                id: "shear-current",
                name: "SHEAR CURRENT",
                family: "OFFENSE",
                tagline: "TURN THE ROPE INTO A BLADE",
                description: "적을 가로지른 로프를 놓아 절단 피해를 줍니다."
            }
        ]
    });
    assert.ok(textCalls.includes("증강 선택 1 / 6"));
    assert.ok(textCalls.includes("IMPULSE COIL"));
    assert.ok(textCalls.includes("RELAY LINK"));
    assert.ok(textCalls.includes("SHEAR CURRENT"));
    assert.ok(textCalls.includes("개인 장비만 정지 · 다른 플레이어와 월드는 계속 진행"));
    textCalls.length = 0;
    borderCalls.length = 0;
    renderer.drawRopeCutFeedback({ type: "rope-cut", age: 0.2 }, 0.4);
    assert.deepEqual(textCalls, ["로프 절단!", "재연결까지 0.4초"]);
    assert.deepEqual(borderCalls, [[4, 4, 836, 382]]);
    textCalls.length = 0;
    renderer.drawMobileControls({
        visible: true,
        ropePointerDown: false,
        left: true,
        jump: false,
        right: false,
        action: false
    });
    assert.deepEqual(textCalls, ["←", "점프", "→", "액션"]);

    textCalls.length = 0;
    renderer.drawRunEndOverlay({ runState: "completed" });
    assert.deepEqual(textCalls, ["정상 도달", "전체 월드 등반 완료"]);
    textCalls.length = 0;
}
