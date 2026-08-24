import { AreaPreviewGameApp } from "../../src/game/runtime/AreaPreviewGameApp.js";
import { BossStagePreviewGameApp } from "../../src/game/boss-authoring/editor/BossStagePreviewGameApp.js";
import { createGameRenderer, resolveRendererProfile } from "../../src/render/GameRendererFactory.js";
import { SpriteSceneResourceBundle } from "../../src/render/SpriteSceneRenderer.js";
import { loadDefaultPlayerSpriteDefinition } from "../../src/render/sprites/PlayerSpriteCatalog.js";
import { loadEnemySpriteDefinitions } from "../../src/render/sprites/EnemySpriteCatalog.js";
import { loadAuthoredAreaEnvironmentDefinitions } from "../../src/render/environment/AuthoredAreaEnvironmentCatalog.js";
import { loadDefaultDirectionDefinitions } from "../../src/game/direction/DirectionCatalog.js";

const canvas = document.querySelector("#preview-canvas");
const label = document.querySelector("#preview-label");
const status = document.querySelector("#preview-status");
const reloadButton = document.querySelector("#reload-preview");
const flightMode = document.querySelector("#preview-flight-mode");
const flightStatus = document.querySelector("#preview-flight-status");
const focusBossButton = document.querySelector("#preview-focus-boss");
const weakpointStrikeButton = document.querySelector("#preview-weakpoint-strike");
const stageId = new URLSearchParams(globalThis.location.search).get("stage");
let currentApp = null;
let previewRenderer = null;
let previewResources = null;
let flightEnabled = false;
const PREVIEW_CANVAS_OPTIONS = Object.freeze({
    performancePolicy: Object.freeze({
        minPixelRatio: 0.5,
        maxPixelRatio: 1,
        maxBackingPixels: 2 * 1024 * 1024,
        enforceBackingPixelLimit: true
    })
});
const runtimePresentationPromise = Promise.all([
    loadDefaultPlayerSpriteDefinition(),
    loadEnemySpriteDefinitions(),
    loadDefaultDirectionDefinitions().catch((cause) => {
        console.warn(`[map-editor-preview] 방향 연출을 불러오지 못했습니다: ${cause.message}`);
        return Object.freeze([]);
    })
]).then(([playerDefinition, enemyDefinitionsBySectorId, directionDefinitions]) =>
    Object.freeze({ playerDefinition, enemyDefinitionsBySectorId, directionDefinitions })
);
const environmentDefinitionsByAreaId = new Map();

function environmentDefinitionsForPreview(areaId) {
    if (!environmentDefinitionsByAreaId.has(areaId)) {
        environmentDefinitionsByAreaId.set(
            areaId,
            loadAuthoredAreaEnvironmentDefinitions({ areaIds: [areaId] }).catch((cause) => {
                environmentDefinitionsByAreaId.delete(areaId);
                throw cause;
            })
        );
    }
    return environmentDefinitionsByAreaId.get(areaId);
}

function setStatus(text, kind = "") {
    status.textContent = text;
    status.className = kind ? `is-${kind}` : "";
}

function syncFlightMode() {
    flightEnabled = flightMode.checked;
    currentApp?.setPreviewFlightEnabled?.(flightEnabled);
    flightStatus.textContent = flightEnabled ? "켜짐 · 로프 입력 비활성" : "꺼짐";
}

async function requestPreview() {
    if (!/^(?:\d+-\d+|boss-\d+)$/.test(stageId ?? "")) {
        throw new Error("미리보기에는 생성된 Stage ID가 필요합니다.");
    }
    const response = await fetch(`/api/map-editor/stages/${encodeURIComponent(stageId)}/preview`);
    const payload = await response.json().catch(() => ({ message: "Preview 응답을 읽을 수 없습니다." }));
    if (!response.ok) throw new Error(`${payload.code ?? "preview-failed"}: ${payload.message}`);
    return payload;
}

function rendererForPreview(presentation) {
    if (previewRenderer) return previewRenderer;
    const profile = resolveRendererProfile(globalThis.location.search);
    if (profile === "sprite") {
        previewResources = new SpriteSceneResourceBundle({
            playerDefinition: presentation.playerDefinition,
            enemyDefinitionsBySectorId: presentation.enemyDefinitionsBySectorId,
            authoredAreaEnvironmentDefinitions: presentation.authoredAreaEnvironmentDefinitions
        });
    }
    previewRenderer = createGameRenderer({
        canvas,
        profile,
        canvasOptions: PREVIEW_CANVAS_OPTIONS,
        sceneRendererOptions: previewResources ? { resources: previewResources } : {}
    });
    return previewRenderer;
}

function previewGraphicsIdentity(areaId) {
    const match = /^(sector-\d{2})-\d{2}$/.exec(areaId ?? "");
    if (!match) throw new Error(`미리보기 Area의 그래픽 package를 확인할 수 없습니다: ${areaId}`);
    return Object.freeze({ areaId, sectorId: match[1] });
}

async function preparePreviewGraphics(areaId) {
    if (!previewResources) return;
    const identity = previewGraphicsIdentity(areaId);
    await previewResources.prepareArea(identity);
    void previewResources.prepareRemaining(identity);
}

async function prepareBossPreviewGraphics(areaId) {
    if (!previewResources) return;
    const identity = previewGraphicsIdentity(areaId);
    await previewResources.prepareBossStage(identity);
    void previewResources.prepareRemaining(identity);
}

async function createPreview() {
    reloadButton.disabled = true;
    document.body.classList.add("is-loading");
    currentApp?.stop();
    currentApp = null;
    try {
        setStatus("실제 게임 화면 리소스를 준비하는 중입니다.");
        const [preview, presentation] = await Promise.all([requestPreview(), runtimePresentationPromise]);
        const { areaId, revision, previewArea } = preview;
        syncFlightMode();
        focusBossButton.hidden = preview.specType !== "boss-stage";
        weakpointStrikeButton.hidden = preview.specType !== "boss-stage";
        if (preview.specType === "boss-stage") {
            const authoredAreaEnvironmentDefinitions = await environmentDefinitionsForPreview(
                preview.spec.sourceAreaId
            );
            const renderer = rendererForPreview({ ...presentation, authoredAreaEnvironmentDefinitions });
            await prepareBossPreviewGraphics(preview.spec.sourceAreaId);
            currentApp = new BossStagePreviewGameApp({
                canvas,
                renderer,
                bossStageSpec: preview.spec,
                revision,
                playerDefinition: presentation.playerDefinition,
                directionDefinitions: presentation.directionDefinitions
            });
            const previewScope = currentApp.previewScope();
            if (previewScope.bossStageId !== preview.bossStageId || previewScope.status !== "active") {
                throw new Error("선택한 Boss Stage 하나를 활성 전투로 시작할 수 없습니다.");
            }
            currentApp.start();
            label.textContent = `${stageId} · ${preview.spec.name} · 실제 게임 화면의 Boss Stage 실행`;
            setStatus(
                `미리보기 리비전 ${revision} 실행 중 · Boss 전용 지형 ${previewScope.surfaceCount}개 · 이동·Rope·일반 공격·Boss HUD 입력을 실제 GameSimulation에서 처리합니다.`
            );
            return;
        }
        const authoredAreaEnvironmentDefinitions = await environmentDefinitionsForPreview(areaId);
        const renderer = rendererForPreview({ ...presentation, authoredAreaEnvironmentDefinitions });
        await preparePreviewGraphics(areaId);
        currentApp = new AreaPreviewGameApp({
            canvas,
            renderer,
            areaId,
            previewArea,
            playerDefinition: presentation.playerDefinition,
            directionDefinitions: presentation.directionDefinitions
        });
        currentApp.setPreviewFlightEnabled(flightEnabled);
        const previewScope = currentApp.previewScope();
        if (previewScope.layout !== "seamless-sectors" || previewScope.areaId !== areaId) {
            throw new Error("선택한 Stage를 production seamless world에서 찾을 수 없습니다.");
        }
        currentApp.start();
        label.textContent = `${stageId} · ${previewScope.landmarkId} · production Gameplay View`;
        setStatus(
            `리비전 ${revision} · authored Stage portal compiler / production renderer · Stage authored 지형 ${previewScope.surfaceCount}개(표시 ${previewScope.visibleSurfaceCount}개) · 전체 world 지형 ${previewScope.worldSurfaceCount}개`
        );
    } catch (cause) {
        label.textContent = "미리보기를 시작할 수 없습니다.";
        setStatus(cause.message, "error");
    } finally {
        document.body.classList.remove("is-loading");
        reloadButton.disabled = false;
    }
}

reloadButton.addEventListener("click", createPreview);
flightMode.addEventListener("change", syncFlightMode);
focusBossButton.addEventListener("click", () => {
    const outcome = currentApp?.debugMovePlayerNearBoss?.();
    if (!outcome?.accepted) {
        setStatus("현재 Boss 위치로 이동할 수 없습니다.", "error");
        return;
    }
    setStatus(`Boss 옆으로 이동 · x ${Math.round(outcome.position.x)} / y ${Math.round(outcome.position.y)}`);
});
weakpointStrikeButton.addEventListener("click", () => {
    const outcome = currentApp?.debugStrikeWeakpoint?.();
    if (!outcome?.accepted) {
        setStatus("현재 노출된 약점이 없어 디버그 타격을 적용하지 않았습니다.", "error");
        return;
    }
    setStatus(`약점 디버그 타격 적용 · 피해 ${outcome.appliedDamage ?? 0}`);
});
globalThis.addEventListener("beforeunload", () => currentApp?.stop());
syncFlightMode();
await createPreview();
