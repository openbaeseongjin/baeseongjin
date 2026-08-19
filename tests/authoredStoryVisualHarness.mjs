import { AuthoredStoryPresentation } from "../src/game/presentation/AuthoredStoryPresentation.js";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";

const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const mobile = new URLSearchParams(globalThis.location.search).get("viewport") === "mobile";
const expected = Object.freeze({
    id: "sector-01-07:security-response-active",
    title: "VERTICAL TRANSIT VIOLATION",
    detail: "SECURITY RESPONSE ACTIVE",
    durationSeconds: 1.2,
    age: 0.2
});

const presentation = new AuthoredStoryPresentation();
presentation.update(0, { currentAreaId: "sector-01-07", currentAreaLocalY: -32 });
presentation.update(1.4, { currentAreaId: "sector-01-07", currentAreaLocalY: -32 });
presentation.update(0, { currentAreaId: "sector-01-07", currentAreaLocalY: -700 });
presentation.update(1.1, { currentAreaId: "sector-01-07", currentAreaLocalY: -700 });
presentation.update(0, { currentAreaId: "sector-01-07", currentAreaLocalY: -800 });
presentation.update(0.2, { currentAreaId: "sector-01-07", currentAreaLocalY: -800 });
const actual = presentation.snapshot();

function drawPane(offsetX, width, label, story) {
    context.save();
    context.translate(offsetX, 0);
    context.beginPath();
    context.rect(0, 0, width, 360);
    context.clip();
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, width, 360);
    context.strokeStyle = "rgba(148, 163, 184, 0.18)";
    for (let y = 90; y < 360; y += 45) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
    }
    CanvasRenderer.prototype.drawStoryPresentation.call({ context, cssWidth: width }, story);
    context.fillStyle = "#e2e8f0";
    context.font = "800 18px system-ui, sans-serif";
    context.fillText(label, 18, 330);
    context.restore();
}

if (mobile) {
    canvas.width = 390;
    canvas.style.width = "390px";
    drawPane(0, 390, "MOBILE RUNTIME PRESENTATION", actual);
} else {
    drawPane(0, 500, "EXPECTED CONTRACT", expected);
    drawPane(500, 500, "RUNTIME POSITION PRESENTATION", actual);
    context.strokeStyle = "#67e8f9";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(500, 0);
    context.lineTo(500, 360);
    context.stroke();
}

document.body.dataset.ready = "true";
document.body.dataset.actualTitle = actual?.title ?? "";
document.body.dataset.actualDetail = actual?.detail ?? "";
document.body.dataset.retiredCopyPresent = String(
    actual?.title === "CONTAINMENT VIOLATION" || actual?.detail === "ACTIVE"
);
