import { ropeAttachmentPoint } from "../../game/rope/RopeAttachment.js";
import { circleBounds, isVisible } from "../RenderViewport.js";
import { enemyAimLine, enemySensorColor } from "../EnemyTelegraphPresentation.js";

const PLAYER_COLORS = Object.freeze({
    local: "#67e8f9",
    localEdge: "#cffafe",
    remote: "#c084fc",
    remoteEdge: "#f3e8ff"
});

function colliderRadius(player) {
    const snapshot = typeof player.collider?.snapshot === "function" ? player.collider.snapshot() : player.collider;
    if (snapshot?.type !== "circle") throw new Error("Polygon player renderer requires a circle collider snapshot");
    return snapshot.radius;
}

function drawPlayerBody(context, player, rope, fill, stroke) {
    const radius = colliderRadius(player);
    context.save();
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(player.position.x, player.position.y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.translate(player.position.x, player.position.y);
    context.rotate(player.angle ?? 0);
    context.strokeStyle = "rgba(8, 11, 16, 0.75)";
    context.lineWidth = 3;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(0, radius * 0.65);
    context.lineTo(0, -radius * 0.65);
    context.stroke();
    context.lineCap = "butt";
    context.restore();
    if (rope?.isAttached) {
        const hand = ropeAttachmentPoint(player, rope);
        context.strokeStyle = stroke;
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(player.position.x, player.position.y);
        context.lineTo(hand.x, hand.y);
        context.stroke();
    }
}

export class PolygonRemotePlayerRenderer {
    draw({ context, scene }) {
        for (const player of scene.otherPlayers ?? []) {
            drawPlayerBody(context, player, player.rope, PLAYER_COLORS.remote, PLAYER_COLORS.remoteEdge);
        }
    }
}

export class PolygonEnemyRenderer {
    draw({ context, scene, viewport, renderStats }) {
        const enemies = scene.enemies ?? [];
        let drawn = 0;
        for (const enemy of enemies) {
            if (!isVisible(viewport, circleBounds(enemy.position, (enemy.radius ?? 0) + 14))) continue;
            drawn += 1;
            const aimLine = enemyAimLine(enemy);
            if (aimLine) {
                context.save();
                context.strokeStyle = aimLine.color;
                context.lineWidth = aimLine.width;
                context.beginPath();
                context.moveTo(enemy.position.x, enemy.position.y);
                context.lineTo(aimLine.end.x, aimLine.end.y);
                context.stroke();
                context.restore();
            }
            context.fillStyle = "#fb7185";
            context.fillRect(enemy.position.x - 24, enemy.position.y - 12, 30, 24);
            context.fillStyle = "#881337";
            context.fillRect(enemy.position.x + 6, enemy.position.y - 16, 8, 32);
            context.fillStyle = enemySensorColor(enemy);
            context.fillRect(enemy.position.x - 18, enemy.position.y - 3, 6, 6);
            context.fillStyle = "#1f2937";
            context.fillRect(enemy.position.x - 20, enemy.position.y - enemy.radius - 11, 40, 5);
            context.fillStyle = "#fda4af";
            context.fillRect(
                enemy.position.x - 20,
                enemy.position.y - enemy.radius - 11,
                40 * (enemy.health / enemy.maxHealth),
                5
            );
        }
        renderStats?.recordCollection("enemies", enemies.length, drawn);
    }
}

export class PolygonProjectileRenderer {
    constructor({ selectProjectiles, color, category = "projectiles" }) {
        if (typeof selectProjectiles !== "function" || typeof color !== "string") {
            throw new Error("PolygonProjectileRenderer requires selectProjectiles and color");
        }
        this.selectProjectiles = selectProjectiles;
        this.color = color;
        this.category = category;
    }

    draw({ context, scene, viewport, renderStats }) {
        context.fillStyle = this.color;
        const projectiles = this.selectProjectiles(scene);
        let drawn = 0;
        for (const projectile of projectiles) {
            if (!isVisible(viewport, circleBounds(projectile.position, projectile.radius))) continue;
            drawn += 1;
            context.beginPath();
            context.arc(projectile.position.x, projectile.position.y, projectile.radius, 0, Math.PI * 2);
            context.fill();
        }
        renderStats?.recordCollection(this.category, projectiles.length, drawn);
    }
}

export class PolygonLocalPlayerRenderer {
    draw({ context, scene }) {
        const player = scene.player;
        const event = scene.eventFlash;
        if (event?.age < 0.28) {
            const progress = event.age / 0.28;
            context.strokeStyle =
                event.type === "rope-cut"
                    ? "#fb7185"
                    : event.type === "release" || event.type === "swing"
                      ? "#fde68a"
                      : "#67e8f9";
            context.globalAlpha = 1 - progress;
            context.lineWidth = 3;
            context.beginPath();
            context.arc(player.position.x, player.position.y, 20 + progress * 32, 0, Math.PI * 2);
            context.stroke();
            context.globalAlpha = 1;
        }
        drawPlayerBody(context, player, scene.rope, PLAYER_COLORS.local, PLAYER_COLORS.localEdge);
        const speed = player.velocity.length();
        if (speed <= 160) return;
        context.strokeStyle = "rgba(103, 232, 249, 0.45)";
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(player.position.x, player.position.y);
        context.lineTo(player.position.x - player.velocity.x * 0.08, player.position.y - player.velocity.y * 0.08);
        context.stroke();
    }
}
