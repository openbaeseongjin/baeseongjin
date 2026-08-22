import { AreaPreviewGameApp } from "../../src/game/runtime/AreaPreviewGameApp.js";
import { createGameRenderer } from "../../src/render/GameRendererFactory.js";

const canvas = document.querySelector("#preview-canvas");
const label = document.querySelector("#preview-label");
const status = document.querySelector("#preview-status");
const reloadButton = document.querySelector("#reload-preview");
const stageId = new URLSearchParams(globalThis.location.search).get("stage");
let currentApp = null;

function setStatus(text, kind = "") {
    status.textContent = text;
    status.className = kind ? `is-${kind}` : "";
}

async function requestPreview() {
    if (!/^\d+-\d+$/.test(stageId ?? "")) {
        throw new Error("미리보기에는 생성된 Stage ID가 필요합니다.");
    }
    const response = await fetch(`/api/map-editor/stages/${encodeURIComponent(stageId)}/preview`);
    const payload = await response.json().catch(() => ({ message: "Preview 응답을 읽을 수 없습니다." }));
    if (!response.ok) throw new Error(`${payload.code ?? "preview-failed"}: ${payload.message}`);
    return payload;
}

async function createPreview() {
    reloadButton.disabled = true;
    currentApp?.stop();
    currentApp = null;
    try {
        const { areaId, moduleUrl, outputRevision, revision } = await requestPreview();
        const { GENERATED_AREA } = await import(`${moduleUrl}?revision=${encodeURIComponent(outputRevision)}`);
        const renderer = createGameRenderer({ canvas, profile: "polygon" });
        currentApp = new AreaPreviewGameApp({ canvas, renderer, generatedArea: GENERATED_AREA, revision });
        currentApp.start();
        label.textContent = `${stageId} · ${areaId} · 새 로컬 싱글플레이 실행`;
        setStatus(`미리보기 리비전 ${revision} 실행 중 · 일반 런타임과 멀티플레이에는 영향을 주지 않습니다.`);
    } catch (cause) {
        label.textContent = "미리보기를 시작할 수 없습니다.";
        setStatus(cause.message, "error");
    } finally {
        reloadButton.disabled = false;
    }
}

reloadButton.addEventListener("click", createPreview);
globalThis.addEventListener("beforeunload", () => currentApp?.stop());
await createPreview();
