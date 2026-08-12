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

function drawPlayerBody(context, player, fill, stroke) {
    context.save();
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(player.position.x, player.position.y, colliderRadius(player), 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
}

export class PolygonRemotePlayerRenderer {
    draw({ context, scene }) {
        for (const player of scene.otherPlayers ?? []) {
            drawPlayerBody(context, player, PLAYER_COLORS.remote, PLAYER_COLORS.remoteEdge);
        }
    }
}

export class PolygonEnemyRenderer {
    draw({ context, scene }) {
        for (const enemy of scene.enemies ?? []) {
            context.fillStyle = "#fb7185";
            context.beginPath();
            context.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2);
            context.fill();
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
    }
}

export class PolygonProjectileRenderer {
    constructor({ selectProjectiles, color }) {
        if (typeof selectProjectiles !== "function" || typeof color !== "string") {
            throw new Error("PolygonProjectileRenderer requires selectProjectiles and color");
        }
        this.selectProjectiles = selectProjectiles;
        this.color = color;
    }

    draw({ context, scene }) {
        context.fillStyle = this.color;
        for (const projectile of this.selectProjectiles(scene)) {
            context.beginPath();
            context.arc(projectile.position.x, projectile.position.y, projectile.radius, 0, Math.PI * 2);
            context.fill();
        }
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
        drawPlayerBody(context, player, PLAYER_COLORS.local, PLAYER_COLORS.localEdge);
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
