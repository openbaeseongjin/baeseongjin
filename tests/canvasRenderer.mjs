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
        firstRewardSeconds: 10,
        areaTiming: { currentAreaId: "sector-01-01", currentAreaSeconds: 42.75, clearSeconds: {} }
    });
    assert.deepEqual(textCalls, [
        "RUN METRICS",
        "활성 12.5초 · 체크 1",
        "처치 3 · 피해 20",
        "절단 2 · 사망 1",
        "첫 보상 10.0초",
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
            firstRewardSeconds: 10
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
    renderer.drawArtifactHud([{ name: "로프 공명기" }], 1.5);
    assert.deepEqual(textCalls, ["아티팩트", "• 로프 공명기", "공명 1.5초"]);
    textCalls.length = 0;
    renderer.drawArtifactFeedback({ type: "artifact", age: 0.4, artifact: { name: "동력핵" } });
    assert.deepEqual(textCalls, ["아티팩트 획득", "동력핵"]);
    textCalls.length = 0;
    renderer.drawArtifactFeedback({ type: "artifact-loss", age: 0.4, artifacts: [{ name: "연사 톱니" }] });
    assert.deepEqual(textCalls, ["체크포인트 부활 · 아티팩트 손실", "연사 톱니"]);
    textCalls.length = 0;
    renderer.drawArtifactFeedback({ type: "checkpoint-respawn", reason: "fall", age: 0.4 });
    assert.deepEqual(textCalls, ["체크포인트 부활", "낙사 · 최대 체력으로 복귀"]);
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
        "스윙 강화",
        "선택 중에도 전투 진행 · 빠르게 결정하세요"
    ]);
    textCalls.length = 0;
    borderCalls.length = 0;
    renderer.drawRopeCutFeedback({ type: "rope-cut", age: 0.2 }, 0.4);
    assert.deepEqual(textCalls, ["로프 절단!", "재연결까지 0.4초"]);
    assert.deepEqual(borderCalls, [[4, 4, 836, 382]]);
    textCalls.length = 0;
    renderer.drawMobileControls({ visible: true, ropePointerDown: false, left: true, jump: false, right: false });
    assert.deepEqual(textCalls, ["←", "점프", "→"]);

    textCalls.length = 0;
    renderer.drawRunEndOverlay({ runState: "completed" });
    assert.deepEqual(textCalls, ["정상 도달", "전체 월드 등반 완료"]);
    textCalls.length = 0;
}
