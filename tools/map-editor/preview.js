import { AreaPreviewGameApp } from "../../src/game/runtime/AreaPreviewGameApp.js";
import { BossStagePreviewGameApp } from "../../src/game/boss-authoring/editor/BossStagePreviewGameApp.js";
import { createGameRenderer, DEFAULT_RENDERER_PROFILE } from "../../src/render/GameRendererFactory.js";
import { loadDefaultPlayerSpriteDefinition } from "../../src/render/sprites/PlayerSpriteCatalog.js";
import { loadDefaultEnemySpriteDefinition } from "../../src/render/sprites/EnemySpriteCatalog.js";
import { loadAuthoredAreaEnvironmentDefinitions } from "../../src/render/environment/AuthoredAreaEnvironmentCatalog.js";
import { loadDefaultDirectionDefinitions } from "../../src/game/direction/DirectionCatalog.js";

const canvas = document.querySelector("#preview-canvas");
const label = document.querySelector("#preview-label");
const status = document.querySelector("#preview-status");
const reloadButton = document.querySelector("#reload-preview");
const stageId = new URLSearchParams(globalThis.location.search).get("stage");
let currentApp = null;
let previewRenderer = null;
const generatedAreaModulePromises = new Map();
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
    loadDefaultEnemySpriteDefinition(),
    loadDefaultDirectionDefinitions().catch((cause) => {
        console.warn(`[map-editor-preview] 방향 연출을 불러오지 못했습니다: ${cause.message}`);
        return Object.freeze([]);
    })
]).then(([playerDefinition, enemyDefinition, directionDefinitions]) =>
    Object.freeze({ playerDefinition, enemyDefinition, directionDefinitions })
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

async function requestPreview() {
    if (!/^(?:\d+-\d+|boss-\d+)$/.test(stageId ?? "")) {
        throw new Error("미리보기에는 생성된 Stage ID가 필요합니다.");
    }
    const response = await fetch(`/api/map-editor/stages/${encodeURIComponent(stageId)}/preview`);
    const payload = await response.json().catch(() => ({ message: "Preview 응답을 읽을 수 없습니다." }));
    if (!response.ok) throw new Error(`${payload.code ?? "preview-failed"}: ${payload.message}`);
    return payload;
}

async function loadGeneratedArea(moduleUrl, outputRevision) {
    const key = `${moduleUrl}?revision=${encodeURIComponent(outputRevision)}`;
    if (!generatedAreaModulePromises.has(key)) {
        generatedAreaModulePromises.set(
            key,
            import(key).catch((cause) => {
                generatedAreaModulePromises.delete(key);
                throw cause;
            })
        );
    }
    return generatedAreaModulePromises.get(key);
}

function rendererForPreview(presentation) {
    if (previewRenderer) return previewRenderer;
    previewRenderer = createGameRenderer({
        canvas,
        profile: DEFAULT_RENDERER_PROFILE,
        canvasOptions: PREVIEW_CANVAS_OPTIONS,
        sceneRendererOptions: {
            playerDefinition: presentation.playerDefinition,
            enemyDefinition: presentation.enemyDefinition,
            authoredAreaEnvironmentDefinitions: presentation.authoredAreaEnvironmentDefinitions
        }
    });
    return previewRenderer;
}

async function createPreview() {
    reloadButton.disabled = true;
    document.body.classList.add("is-loading");
    currentApp?.stop();
    currentApp = null;
    try {
        setStatus("실제 게임 화면 리소스를 준비하는 중입니다.");
        const [preview, presentation] = await Promise.all([requestPreview(), runtimePresentationPromise]);
        const { areaId, moduleUrl, outputRevision, revision, previewArea } = preview;
        if (preview.specType === "boss-stage") {
            const generated = await loadGeneratedArea(moduleUrl, outputRevision);
            const authoredAreaEnvironmentDefinitions = await environmentDefinitionsForPreview(
                preview.spec.sourceAreaId
            );
            currentApp = new BossStagePreviewGameApp({
                canvas,
                renderer: rendererForPreview({ ...presentation, authoredAreaEnvironmentDefinitions }),
                bossStageSpec: generated.BOSS_01_STAGE_SPEC,
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
        const generatedArea = previewArea ?? (await loadGeneratedArea(moduleUrl, outputRevision)).GENERATED_AREA;
        currentApp = new AreaPreviewGameApp({
            canvas,
            renderer: rendererForPreview({ ...presentation, authoredAreaEnvironmentDefinitions }),
            generatedArea,
            revision,
            playerDefinition: presentation.playerDefinition,
            directionDefinitions: presentation.directionDefinitions
        });
        const previewScope = currentApp.previewScope();
        if (previewScope.areaId !== areaId || previewScope.areaCount !== 1) {
            throw new Error("선택한 Stage 하나만 미리보기로 실행할 수 있습니다.");
        }
        currentApp.start();
        label.textContent = `${stageId} · ${areaId} · 실제 게임 화면의 새 로컬 싱글플레이 실행`;
        setStatus(
            `미리보기 리비전 ${revision} 실행 중 · ${previewScope.areaId} 맵 하나(지형 ${previewScope.surfaceCount}개)만 로드하며 멀티플레이에는 영향을 주지 않습니다.`
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
globalThis.addEventListener("beforeunload", () => currentApp?.stop());
await createPreview();
