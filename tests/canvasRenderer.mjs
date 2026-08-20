import assert from "node:assert/strict";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";
import { PolygonSceneRenderer } from "../src/render/PolygonSceneRenderer.js";
import { ActorStatusRenderer, resolveActionCooldownStatus } from "../src/render/ActorStatusPresentation.js";

export function run() {
    const textCalls = [];
    const borderCalls = [];
    const fillCalls = [];
    const context = {
        save() {},
        restore() {},
        fillRect: (...args) => fillCalls.push(args),
        translate() {},
        moveTo() {},
        lineTo() {},
        closePath() {},
        beginPath() {},
        rotate() {},
        arc() {},
        fill() {},
        stroke() {},
        setTransform() {},
        fillText: (text) => textCalls.push(text),
        strokeRect: (...args) => borderCalls.push(args),
        measureText: (text) => ({ width: String(text).length * 6 })
    };
    const canvas = {
        getContext: () => context,
        getBoundingClientRect: () => ({ left: 10, top: 20, width: 844, height: 390 })
    };
    const renderer = new CanvasRenderer(canvas, new PolygonSceneRenderer());
    assert.deepEqual(
        resolveActionCooldownStatus({
            loadout: { modifierIds: ["extra-charge"] },
            chargesRemaining: 1,
            rechargeRemaining: 2,
            rechargeDuration: 4
        }),
        { charges: 1, maximum: 2, remaining: 2, duration: 4, ratio: 0.5 }
    );
    assert.deepEqual(
        resolveActionCooldownStatus({
            loadout: { baseActionId: "default-punch", modifierIds: [] },
            chargesRemaining: 0,
            rechargeRemaining: 0.25,
            rechargeDuration: 0.5
        }),
        { charges: 0, maximum: 1, remaining: 0.25, duration: 0.5, ratio: 0.5 },
        "the built-in punch must use the same visible Action cooldown resolver"
    );
    assert.deepEqual(
        renderer.screenToWorld({ x: 360, y: 180 }, { x: 100, y: 50, zoom: 0.5 }),
        { x: 800, y: 370 },
        "screen aiming must account for the wider zoomed-out mobile camera"
    );
    assert.deepEqual(renderer.screenToWorld({ x: 360, y: 180 }, { x: 100, y: 50 }), { x: 450, y: 210 });

    renderer.cssWidth = 844;
    renderer.cssHeight = 390;
    renderer.drawLocalStatusHud({
        world: {
            landmarks: [
                {
                    id: "sector-01:landmark:02",
                    legacyStageAlias: "1-2",
                    order: 2,
                    bounds: { x: -480, y: -960, width: 960, height: 960 },
                    entry: { x: 0, y: 0 },
                    exit: { x: 0, y: -960 }
                }
            ]
        },
        player: { position: { x: 0, y: -100 } },
        playerHealth: 35,
        playerMaxHealth: 100,
        actionState: {
            loadout: { modifierIds: ["extra-charge"] },
            chargesRemaining: 1,
            rechargeRemaining: 2,
            rechargeDuration: 4
        },
        selectedAugmentIds: ["long-rope"],
        mobileView: false
    });
    assert.ok(textCalls.includes("STAGE 1-2"));
    assert.ok(textCalls.includes("HP"));
    assert.ok(textCalls.includes("ACTION"));
    assert.ok(textCalls.includes("1/2"));
    assert.ok(textCalls.some((text) => String(text).startsWith("증강 ")));
    textCalls.length = 0;
    borderCalls.length = 0;
    renderer.drawLocalStatusHud({
        world: { landmarks: [] },
        player: { position: { x: 0, y: 0 } },
        playerHealth: 100,
        playerMaxHealth: 100,
        actionState: { loadout: { modifierIds: [] }, chargesRemaining: 1 },
        selectedAugmentIds: [],
        mobileView: false
    });
    assert.deepEqual(
        borderCalls[0],
        [18, 54, 240, 92],
        "mobile-sized landscape viewports must use the compact HUD even without coarse pointer emulation"
    );

    const accessWorld = {
        landmarks: [
            {
                id: "sector-01:landmark:01",
                sectorId: "sector-01",
                bounds: { x: -480, y: -960, width: 960, height: 960 },
                entry: { x: 0, y: 0 },
                exit: { x: 0, y: -960 }
            }
        ],
        sectors: [
            {
                id: "sector-01",
                accessModuleIds: ["module:a", "module:b", "module:c"],
                accessModuleRequirement: 3
            }
        ],
        accessModules: [
            { id: "module:a", position: { x: -2000, y: -100 } },
            { id: "module:b", position: { x: 2000, y: -100 } },
            { id: "module:c", position: { x: 0, y: -2000 } }
        ]
    };
    textCalls.length = 0;
    renderer.drawAccessHud({
        world: accessWorld,
        worldProgress: { collectedAccessModuleIds: ["module:a", "module:b"] },
        player: { position: { x: 0, y: -100 } },
        mobileView: true
    });
    assert.ok(textCalls.includes("ACCESS 2/3 · NEED 1"));
    assert.equal(
        textCalls.some((text) => /LOWER|MIDDLE|UPPER/.test(String(text))),
        false
    );
    textCalls.length = 0;
    renderer.drawAccessHud({
        world: accessWorld,
        worldProgress: { collectedAccessModuleIds: ["module:a", "module:b", "module:c"] },
        player: { position: { x: 0, y: -100 } },
        mobileView: true
    });
    assert.deepEqual(textCalls, ["ACCESS READY"]);

    let sceneDraws = 0;
    let localHudDraws = 0;
    let accessHudDraws = 0;
    let accessGuideDraws = 0;
    const visibilityRenderer = new CanvasRenderer(canvas, { profile: "test", draw: () => sceneDraws++ });
    visibilityRenderer.drawLocalStatusHud = () => localHudDraws++;
    visibilityRenderer.drawAccessHud = () => accessHudDraws++;
    visibilityRenderer.drawAccessGuide = () => accessGuideDraws++;
    visibilityRenderer.drawRewardSelectionOverlay = () => {};
    visibilityRenderer.drawMobileControls = () => {};
    visibilityRenderer.drawStoryPresentation = () => {};
    visibilityRenderer.drawStatusFeedback = () => {};
    visibilityRenderer.drawRopeCutFeedback = () => {};
    visibilityRenderer.drawRunEndOverlay = () => {};
    visibilityRenderer.draw({ camera: { x: 0, y: 0, zoom: 1 }, hudVisible: false });
    assert.equal(sceneDraws, 1, "hiding the fixed HUD must not hide the world or overhead actor bars");
    assert.equal(localHudDraws, 0);
    assert.equal(accessHudDraws, 0);
    assert.equal(accessGuideDraws, 0);
    visibilityRenderer.draw({ camera: { x: 0, y: 0, zoom: 1 }, hudVisible: true });
    assert.equal(localHudDraws, 1);
    assert.equal(accessHudDraws, 1);
    assert.equal(accessGuideDraws, 1);

    textCalls.length = 0;
    fillCalls.length = 0;
    new ActorStatusRenderer().draw({
        context,
        scene: {
            player: { position: { x: 0, y: 0 }, collider: { type: "circle", radius: 18 } },
            playerHealth: 80,
            playerMaxHealth: 100,
            actionState: { loadout: { modifierIds: [] }, chargesRemaining: 1 },
            otherPlayers: [
                {
                    position: { x: 40, y: 0 },
                    collider: { type: "circle", radius: 18 },
                    health: 60,
                    maxHealth: 100,
                    actionState: { loadout: { modifierIds: ["extra-charge"] }, chargesRemaining: 1 }
                }
            ],
            enemies: [{ position: { x: 80, y: 0 }, radius: 20, health: 50, maxHealth: 100 }]
        }
    });
    assert.ok(fillCalls.length >= 10, "local, remote and Enemy overhead bars must always render");
    assert.ok(textCalls.includes("1/1"));
    assert.ok(textCalls.includes("1/2"));
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
        "첫 증강 10.0초",
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
    renderer.drawStatusFeedback({ type: "sector-respawn", reason: "health", age: 0.4 });
    assert.deepEqual(textCalls, ["Stage 세이브 포인트 부활", "사망 · 최대 체력으로 복귀"]);
    textCalls.length = 0;
    renderer.drawStatusFeedback({
        type: "stage-saved",
        landmarkId: "sector-01:landmark:02",
        stageAlias: "1-2",
        age: 0.4
    });
    assert.deepEqual(textCalls, ["STAGE SAVE", "1-2 · 부활 지점 저장 완료"]);
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
    const directionFillCount = fillCalls.length;
    renderer.drawDirectionLighting(
        { presetId: "maintenance-white-local-amber", age: 0.4 },
        {
            player: { id: "player-local", position: { x: 422, y: 260 }, collider: { radius: 18 } },
            camera: { x: 0, y: 0, zoom: 1 }
        }
    );
    assert.ok(fillCalls.length > directionFillCount);
    renderer.drawDirectionCharacter(
        { kind: "exhale", speakerId: "player-local", age: 0.2, durationSeconds: 0.8 },
        {
            player: { id: "player-local", position: { x: 422, y: 260 }, collider: { radius: 18 } },
            otherPlayers: [],
            camera: { x: 0, y: 0, zoom: 1 }
        }
    );
    textCalls.length = 0;
    renderer.drawPlayerMessagePresentation(
        {
            messageId: "sector-01-02:lift-reaction",
            channel: "player-bark",
            audience: "local-player",
            speakerId: "player-local",
            text: "…리프트도?",
            visibleText: "…리프",
            age: 0.3,
            durationSeconds: 1.8
        },
        {
            player: { id: "player-local", position: { x: 422, y: 260 }, collider: { radius: 18 } },
            otherPlayers: [],
            camera: { x: 0, y: 0, zoom: 1 },
            mobileView: false
        }
    );
    assert.deepEqual(textCalls, ["…리프"]);
    textCalls.length = 0;
    renderer.drawPlayerMessagePresentation(
        {
            messageId: "party-message-1",
            channel: "party-chat",
            audience: "party",
            speakerId: "player-2",
            text: "여기로 와",
            visibleText: "여기로",
            age: 0.3,
            durationSeconds: 1.8
        },
        {
            player: { id: "player-local", position: { x: 422, y: 260 }, collider: { radius: 18 } },
            otherPlayers: [{ id: "player-2", position: { x: 520, y: 240 }, collider: { radius: 18 } }],
            camera: { x: 0, y: 0, zoom: 1 },
            mobileView: true
        }
    );
    assert.deepEqual(textCalls, ["여기로"]);
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
        actionPointerDown: false,
        aimMode: "rope",
        left: true,
        jump: false,
        right: false,
        action: false
    });
    assert.deepEqual(textCalls, ["←", "점프", "→", "로프 조준"]);
    textCalls.length = 0;
    renderer.drawMobileControls({
        visible: true,
        ropePointerDown: false,
        actionPointerDown: true,
        aimMode: "action",
        left: false,
        jump: false,
        right: false,
        action: true
    });
    assert.deepEqual(textCalls, ["←", "점프", "→", "액션 조준"]);

    textCalls.length = 0;
    renderer.drawRunEndOverlay({ runState: "completed" });
    assert.deepEqual(textCalls, ["정상 도달", "전체 월드 등반 완료"]);
    textCalls.length = 0;
}
