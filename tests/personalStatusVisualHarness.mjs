import { ClientStatusFeedback } from "../src/game/combat/ClientStatusFeedback.js";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";

const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const event = Object.freeze({
    eventId: "visual:respawn:owner",
    eventType: "player-respawned",
    statusType: "sector-respawn",
    playerId: "owner",
    reason: "health",
    causeId: "visual-lethal-hit",
    deathPosition: Object.freeze({ x: 120, y: 240 }),
    position: Object.freeze({ x: 200, y: 200 })
});
const reference = Object.freeze({
    type: "sector-respawn",
    age: 0.35,
    playerId: "owner",
    reason: "health",
    causeId: "visual-lethal-hit",
    deathPosition: event.deathPosition,
    position: event.position
});
const ownerStatus = new ClientStatusFeedback({ viewerId: "owner" });
const teammateStatus = new ClientStatusFeedback({ viewerId: "teammate" });
ownerStatus.apply([event]);
teammateStatus.apply([event]);
ownerStatus.update(0.35);
teammateStatus.update(0.35);

function drawPane(offsetX, label, status) {
    context.save();
    context.translate(offsetX, 0);
    context.beginPath();
    context.rect(0, 0, 400, 360);
    context.clip();
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, 400, 360);
    context.strokeStyle = "rgba(148, 163, 184, 0.18)";
    for (let y = 90; y < 360; y += 45) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(400, y);
        context.stroke();
    }
    context.fillStyle = "#e2e8f0";
    context.font = "800 18px system-ui, sans-serif";
    context.fillText(label, 18, 330);
    CanvasRenderer.prototype.drawStatusFeedback.call({ context, cssWidth: 400 }, status);
    context.restore();
}

drawPane(0, "SINGLE · REFERENCE", reference);
drawPane(400, "MULTIPLAYER · OWNER", ownerStatus.snapshot());
drawPane(800, "MULTIPLAYER · TEAMMATE", teammateStatus.snapshot());
context.strokeStyle = "#67e8f9";
context.lineWidth = 2;
for (const x of [400, 800]) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 360);
    context.stroke();
}

document.body.dataset.ready = "true";
document.body.dataset.ownerStatus = String(Boolean(ownerStatus.snapshot()));
document.body.dataset.teammateStatus = String(Boolean(teammateStatus.snapshot()));
