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
        throw new Error("Preview에는 generated Stage ID가 필요합니다.");
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
        label.textContent = `${stageId} · ${areaId} · fresh local single-player run`;
        setStatus(`Preview revision ${revision} 실행 중 · normal runtime / multiplayer에는 영향을 주지 않습니다.`);
    } catch (cause) {
        label.textContent = "Preview를 시작할 수 없습니다.";
        setStatus(cause.message, "error");
    } finally {
        reloadButton.disabled = false;
    }
}

reloadButton.addEventListener("click", createPreview);
globalThis.addEventListener("beforeunload", () => currentApp?.stop());
await createPreview();
