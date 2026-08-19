import { Vector2 } from "../src/game-kit/index.js";
import { EnemyObject } from "../src/game/combat/EnemyObject.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { enemyAimLine } from "../src/render/EnemyTelegraphPresentation.js";
import { createRenderViewport } from "../src/render/RenderViewport.js";
import { interpolateRenderSnapshot } from "../src/render/interpolateRenderSnapshot.js";
import { PolygonEnemyRenderer } from "../src/render/polygon/PolygonActorRenderers.js";

const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const renderer = new PolygonEnemyRenderer();
const simulation = new GameSimulation({ worldSeed: 1 });
const liveEnemy = new EnemyObject({
    id: "telegraph:sentry",
    position: new Vector2(90, 250),
    level: 1,
    radius: 18,
    health: 100,
    maxHealth: 100,
    fireCooldown: 0,
    attackState: "lock",
    attackStateRemaining: 0.2,
    aimDirection: { x: 1, y: 0 }
});
simulation.enemies = [liveEnemy];
const previous = simulation.snapshot();
liveEnemy.position.set(110, 250);
simulation.tick += 1;
const current = simulation.snapshot();
const singleEnemy = interpolateRenderSnapshot(previous, current, 0.5).enemies[0];
const multiplayerEnemy = simulation.enemyStates()[0];
multiplayerEnemy.position = { ...singleEnemy.position };

function drawPane(offsetX, label, enemy) {
    context.save();
    context.translate(offsetX, 0);
    context.beginPath();
    context.rect(0, 0, 500, 500);
    context.clip();
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, 500, 500);
    context.strokeStyle = "rgba(148, 163, 184, 0.16)";
    context.lineWidth = 1;
    for (let x = 0; x <= 500; x += 50) {
        context.beginPath();
        context.moveTo(x, 80);
        context.lineTo(x, 500);
        context.stroke();
    }
    for (let y = 100; y <= 500; y += 50) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(500, y);
        context.stroke();
    }
    context.fillStyle = "#e2e8f0";
    context.font = "800 20px system-ui, sans-serif";
    context.fillText(label, 24, 34);
    context.fillStyle = "#94a3b8";
    context.font = "700 13px ui-monospace, monospace";
    context.fillText(`${enemy.attackState} · aimDirection ${enemy.aimDirection ? "READY" : "MISSING"}`, 24, 58);
    context.fillStyle = "#67e8f9";
    context.beginPath();
    context.arc(400, 250, 16, 0, Math.PI * 2);
    context.fill();
    renderer.draw({
        context,
        scene: { enemies: [enemy] },
        viewport: createRenderViewport({ camera: { x: 0, y: 0, zoom: 1 }, cssWidth: 500, cssHeight: 500 })
    });
    context.restore();
}

drawPane(0, "SINGLE · INTERPOLATED", singleEnemy);
drawPane(500, "MULTIPLAYER · SNAPSHOT", multiplayerEnemy);
context.strokeStyle = "#67e8f9";
context.lineWidth = 2;
context.beginPath();
context.moveTo(500, 0);
context.lineTo(500, 500);
context.stroke();

document.body.dataset.ready = "true";
document.body.dataset.singleAimLine = String(Boolean(enemyAimLine(singleEnemy)));
document.body.dataset.multiplayerAimLine = String(Boolean(enemyAimLine(multiplayerEnemy)));
