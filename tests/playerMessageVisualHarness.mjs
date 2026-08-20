import { PlayerMessagePresentation } from "../src/game/presentation/PlayerMessagePresentation.js";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";

const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const mobile = new URLSearchParams(globalThis.location.search).get("viewport") === "mobile";
const expected = Object.freeze({
    messageId: "sector-01-02:lift-reaction",
    channel: "player-bark",
    audience: "local-player",
    speakerId: "player-local",
    text: "…리프트도?",
    durationSeconds: 1.8,
    revealCharactersPerSecond: 18,
    priority: 20,
    causalId: "sector-01-02:lift-reaction",
    visibleText: "…리프",
    revealComplete: false,
    age: 0.2
});

const presentation = new PlayerMessagePresentation({ viewerId: "player-local" });
presentation.update(0, {
    currentAreaId: "sector-01-02",
    storyPresentation: { id: "sector-01-02:lift-offline" }
});
presentation.update(0, { currentAreaId: "sector-01-02" });
presentation.update(0.2, { currentAreaId: "sector-01-02" });
const actual = presentation.snapshot();

function drawBackdrop(offsetX, width) {
    context.save();
    context.translate(offsetX, 0);
    context.beginPath();
    context.rect(0, 0, width, canvas.height);
    context.clip();
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, width, canvas.height);
    context.strokeStyle = "rgba(148, 163, 184, 0.16)";
    for (let y = 70; y < canvas.height; y += 48) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
    }
    context.restore();
}

function drawPane(offsetX, width, label, message, mobileView) {
    drawBackdrop(offsetX, width);
    context.save();
    context.translate(offsetX, 0);
    const player = { id: "player-local", position: { x: width * 0.5, y: 280 }, collider: { radius: 18 } };
    context.strokeStyle = "#67e8f9";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(player.position.x, player.position.y, 18, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "#d9f4ff";
    context.fillRect(player.position.x - 13, player.position.y + 19, 26, 48);
    CanvasRenderer.prototype.drawPlayerMessagePresentation.call(
        { context, cssWidth: width, cssHeight: canvas.height },
        message,
        {
            player,
            otherPlayers: [],
            camera: { x: 0, y: 0, zoom: 1 },
            mobileView
        }
    );
    context.fillStyle = "#e2e8f0";
    context.font = "800 17px system-ui, sans-serif";
    context.fillText(label, 18, 32);
    context.restore();
}

if (mobile) {
    canvas.width = 390;
    canvas.height = 390;
    canvas.style.width = "390px";
    canvas.style.height = "390px";
    drawPane(0, 390, "MOBILE LOCAL BARK", actual, true);
} else {
    drawPane(0, 500, "EXPECTED LOCAL MESSAGE", expected, false);
    drawPane(500, 500, "RUNTIME BARK", actual, false);
    context.strokeStyle = "#fbbf24";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(500, 0);
    context.lineTo(500, canvas.height);
    context.stroke();
}

document.body.dataset.ready = "true";
document.body.dataset.actualText = actual?.text ?? "";
document.body.dataset.actualAudience = actual?.audience ?? "";
