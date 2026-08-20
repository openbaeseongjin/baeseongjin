import { loadDefaultDirectionDefinitions } from "../src/game/direction/DirectionCatalog.js";
import { createLocalDirectionRuntime } from "../src/game/direction/DirectionProductionAdapters.js";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";

const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const audioCalls = [];
const direction = createLocalDirectionRuntime({
    viewerId: "player-local",
    definitions: await loadDefaultDirectionDefinitions(),
    audioBindings: {
        playDirectionCue: (cueId) => {
            audioCalls.push(cueId);
            return true;
        }
    }
});

function paneScene(offsetX) {
    return {
        player: { id: "player-local", position: { x: offsetX + 250, y: 282 }, collider: { radius: 18 } },
        otherPlayers: [],
        camera: { x: offsetX, y: 0, zoom: 1 },
        mobileView: false
    };
}

function drawBackdrop(offsetX, label) {
    context.save();
    context.translate(offsetX, 0);
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, 500, canvas.height);
    context.strokeStyle = "rgba(148, 163, 184, 0.16)";
    for (let y = 70; y < canvas.height; y += 48) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(500, y);
        context.stroke();
    }
    context.fillStyle = "#e2e8f0";
    context.font = "800 17px system-ui, sans-serif";
    context.fillText(label, 18, canvas.height - 18);
    context.restore();
}

function drawPlayer(scene) {
    const screenX = scene.player.position.x - scene.camera.x;
    const screenY = scene.player.position.y;
    context.strokeStyle = "#67e8f9";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(screenX, screenY, 18, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "#d9f4ff";
    context.fillRect(screenX - 13, screenY + 19, 26, 48);
}

const entryScene = paneScene(0);
drawBackdrop(0, "1-1 ENTRY · COMPILED TRACKS");
drawPlayer(entryScene);
direction.runtime.update(0, {
    areaId: "sector-01-01",
    cameraZoneId: "intro",
    localX: -416,
    localY: -32,
    events: [],
    audioContext: { listener: entryScene.player.position }
});
direction.lightingPresentation.update(0.4, { areaId: "sector-01-01" });
direction.storyPresentation.update(0.2, { currentAreaId: "sector-01-01" });
CanvasRenderer.prototype.drawDirectionLighting.call(
    { context, cssWidth: 500, cssHeight: canvas.height },
    direction.lightingPresentation.snapshot(),
    entryScene
);
CanvasRenderer.prototype.drawStoryPresentation.call(
    { context, cssWidth: 500, cssHeight: canvas.height },
    direction.storyPresentation.snapshot()
);

const swingScene = paneScene(500);
drawBackdrop(500, "1-1 OPEN SWING · NONVERBAL");
context.save();
context.translate(500, 0);
drawPlayer({
    ...swingScene,
    player: { ...swingScene.player, position: { x: 250, y: 282 } },
    camera: { x: 0, y: 0, zoom: 1 }
});
direction.runtime.update(0, {
    areaId: "sector-01-01",
    cameraZoneId: "open-swing",
    localX: 256,
    localY: -720,
    events: [],
    audioContext: { listener: swingScene.player.position }
});
CanvasRenderer.prototype.drawDirectionCharacter.call(
    { context, cssWidth: 500, cssHeight: canvas.height },
    direction.characterPresentation.snapshot(),
    { ...swingScene, player: { ...swingScene.player, position: { x: 250, y: 282 } }, camera: { x: 0, y: 0, zoom: 1 } }
);
context.restore();

context.strokeStyle = "#fbbf24";
context.lineWidth = 2;
context.beginPath();
context.moveTo(500, 0);
context.lineTo(500, canvas.height);
context.stroke();

document.body.dataset.ready = "true";
document.body.dataset.coverageReady = String(direction.coverage.releaseReady);
document.body.dataset.audioCues = audioCalls.join(",");
