const COLORS = Object.freeze({
    backgroundTop: "#171d2a",
    backgroundBottom: "#080b10",
    mountainFar: "#222a32",
    mountainMid: "#30373d",
    mountainNear: "#3e4241",
    rock: "#4b4a45",
    rockLight: "#777269",
    oneWayEdge: "#a8d8cf",
    player: "#67e8f9",
    playerEdge: "#cffafe",
    ropeLoose: "#7dd3fc",
    ropeTense: "#fbbf24",
    candidate: "#a7f3d0"
});

export class PolygonSceneRenderer {
    constructor() {
        this.profile = "polygon";
    }

    draw({ context: ctx, scene, viewport }) {
        const { cssWidth, cssHeight } = viewport;
        const camera = scene.camera;
        const gradient = ctx.createLinearGradient(0, 0, 0, cssHeight);
        gradient.addColorStop(0, COLORS.backgroundTop);
        gradient.addColorStop(1, COLORS.backgroundBottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
        for (const [parallax, baseline, peakHeight, color, spacing] of [
            [0.08, 0.63, 150, COLORS.mountainFar, 740],
            [0.14, 0.74, 210, COLORS.mountainMid, 560],
            [0.21, 0.88, 250, COLORS.mountainNear, 430]
        ]) {
            const offsetX = ((-camera.x * parallax) % spacing) - spacing,
                offsetY = -camera.y * parallax * 0.22;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, cssHeight);
            ctx.lineTo(0, cssHeight * baseline + offsetY);
            for (let i = -1; i <= Math.ceil(cssWidth / spacing) + 1; i += 1) {
                const left = offsetX + i * spacing,
                    peak = left + spacing * (0.38 + (i % 2) * 0.08);
                ctx.lineTo(left, cssHeight * baseline + offsetY);
                ctx.lineTo(peak, cssHeight * baseline - peakHeight + offsetY - (i % 3) * 28);
                ctx.lineTo(left + spacing, cssHeight * baseline + offsetY);
            }
            ctx.lineTo(cssWidth, cssHeight);
            ctx.closePath();
            ctx.fill();
        }
        const haze = ctx.createLinearGradient(0, cssHeight * 0.35, 0, cssHeight);
        haze.addColorStop(0, "rgba(184, 196, 196, 0.08)");
        haze.addColorStop(1, "rgba(8, 11, 16, 0)");
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
        ctx.save();
        const zoom = camera.zoom ?? 1,
            impact = scene.impact,
            decay = impact && impact.age < impact.lifetime ? 1 - impact.age / impact.lifetime : 0;
        ctx.translate(
            -camera.x * zoom + (impact ? Math.sin(impact.age * 173) * impact.strength * decay : 0),
            -camera.y * zoom + (impact ? Math.cos(impact.age * 137) * impact.strength * decay * 0.65 : 0)
        );
        ctx.scale(zoom, zoom);
        for (const surface of scene.world.surfaces) this.drawRock(ctx, surface);
        this.drawCheckpoints(ctx, scene.world.checkpoints, scene.activeCheckpoint);
        this.drawSummit(ctx, scene.world.summit, scene.runState);
        this.drawRange(ctx, scene);
        this.drawRope(ctx, scene.rope, scene.player.position);
        for (const player of scene.otherPlayers ?? []) {
            this.drawRope(ctx, player.rope, player.position);
            ctx.save();
            ctx.fillStyle = "#c084fc";
            ctx.strokeStyle = "#f3e8ff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.position.x, player.position.y, player.config.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        this.drawSwing(ctx, scene.player, scene.swingDrag);
        this.drawEnemies(ctx, scene.enemies ?? []);
        this.drawProjectiles(ctx, scene.projectiles ?? [], "#fef08a");
        this.drawProjectiles(ctx, scene.enemyProjectiles ?? [], "#f43f5e");
        this.drawEffects(ctx, scene.combatEffects ?? []);
        this.drawCut(ctx, scene.eventFlash);
        this.drawCandidate(ctx, scene.attachmentCandidate);
        this.drawPlayer(ctx, scene.player, scene.eventFlash);
        ctx.restore();
    }
    drawRock(ctx, s) {
        const v = s.vertices;
        ctx.fillStyle = COLORS.rock;
        ctx.beginPath();
        ctx.moveTo(v[0].x, v[0].y);
        for (let i = 1; i < v.length; i += 1) ctx.lineTo(v[i].x, v[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = COLORS.rockLight;
        ctx.lineWidth = 3;
        ctx.stroke();
        if (s.oneWay) {
            ctx.strokeStyle = COLORS.oneWayEdge;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(v[0].x, v[0].y);
            for (let i = 1; i <= s.oneWayEdgeEnd; i += 1) ctx.lineTo(v[i].x, v[i].y);
            ctx.stroke();
            ctx.lineCap = "butt";
        }
        ctx.strokeStyle = "rgba(205, 198, 184, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < v.length; i += 2) {
            ctx.moveTo(v[i].x, v[i].y);
            ctx.lineTo(s.x + s.width * 0.5, s.y + s.height * 0.5);
        }
        ctx.stroke();
    }
    drawCheckpoints(ctx, cs = [], a) {
        for (const c of cs) {
            const active = c.id === a?.id,
                reached = c.level < (a?.level ?? 0);
            ctx.save();
            ctx.globalAlpha = reached ? 0.35 : 0.9;
            ctx.strokeStyle = active ? "#fbbf24" : "#93c5fd";
            ctx.fillStyle = active ? "rgba(251, 191, 36, 0.18)" : "rgba(147, 197, 253, 0.1)";
            ctx.lineWidth = active ? 5 : 3;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = active ? "#fde68a" : "#dbeafe";
            ctx.font = "800 12px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(active ? "활성" : "체크", c.x, c.y);
            ctx.restore();
        }
    }
    drawSummit(ctx, s, r) {
        if (!s || r === "completed") return;
        ctx.save();
        ctx.globalAlpha = 0.78;
        ctx.strokeStyle = "#a7f3d0";
        ctx.fillStyle = "rgba(167, 243, 208, 0.12)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#d1fae5";
        ctx.font = "900 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("정상", s.x, s.y);
        ctx.restore();
    }
    drawRange(ctx, { player, maxAttachDistance, attachmentCandidate, rope }) {
        if (rope.isAttached || !attachmentCandidate) return;
        ctx.save();
        ctx.setLineDash([7, 10]);
        ctx.strokeStyle = "rgba(167, 243, 208, 0.2)";
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, maxAttachDistance, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    drawRope(ctx, r, p) {
        if (!r.anchor) return;
        const t = Math.min(1, r.tension / 900);
        ctx.strokeStyle = t > 0.42 ? COLORS.ropeTense : COLORS.ropeLoose;
        ctx.lineWidth = 2.5 + t * 3;
        ctx.beginPath();
        ctx.moveTo(r.anchor.x, r.anchor.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(r.anchor.x, r.anchor.y, 6 + t * 3, 0, Math.PI * 2);
        ctx.fill();
    }
    drawCandidate(ctx, c) {
        if (!c) return;
        ctx.strokeStyle = COLORS.candidate;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(c.x - 16, c.y);
        ctx.lineTo(c.x + 16, c.y);
        ctx.moveTo(c.x, c.y - 16);
        ctx.lineTo(c.x, c.y + 16);
        ctx.stroke();
    }
    drawSwing(ctx, p, s) {
        if (!s || s.used || !s.direction || s.progress <= 0) return;
        const l = 28 + s.progress * 34,
            x = p.position.x + s.direction.x * l,
            y = p.position.y + s.direction.y * l;
        ctx.save();
        ctx.globalAlpha = 0.35 + s.progress * 0.65;
        ctx.strokeStyle = COLORS.ropeTense;
        ctx.fillStyle = COLORS.ropeTense;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.position.x, p.position.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.translate(x, y);
        ctx.rotate(Math.atan2(s.direction.y, s.direction.x));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-11, -6);
        ctx.lineTo(-11, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    drawPlayer(ctx, p, e) {
        if (e?.age < 0.28) {
            const q = e.age / 0.28;
            ctx.strokeStyle =
                e.type === "rope-cut" ? "#fb7185" : e.type === "release" || e.type === "swing" ? "#fde68a" : "#67e8f9";
            ctx.globalAlpha = 1 - q;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.position.x, p.position.y, 20 + q * 32, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = COLORS.player;
        ctx.beginPath();
        ctx.arc(p.position.x, p.position.y, p.config.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.playerEdge;
        ctx.lineWidth = 2;
        ctx.stroke();
        const speed = p.velocity.length();
        if (speed > 160) {
            ctx.strokeStyle = "rgba(103, 232, 249, 0.45)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(p.position.x, p.position.y);
            ctx.lineTo(p.position.x - p.velocity.x * 0.08, p.position.y - p.velocity.y * 0.08);
            ctx.stroke();
        }
    }
    drawEnemies(ctx, es) {
        for (const e of es) {
            ctx.fillStyle = "#fb7185";
            ctx.beginPath();
            ctx.arc(e.position.x, e.position.y, e.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1f2937";
            ctx.fillRect(e.position.x - 20, e.position.y - e.radius - 11, 40, 5);
            ctx.fillStyle = "#fda4af";
            ctx.fillRect(e.position.x - 20, e.position.y - e.radius - 11, 40 * (e.health / e.maxHealth), 5);
        }
    }
    drawProjectiles(ctx, ps, color) {
        ctx.fillStyle = color;
        for (const p of ps) {
            ctx.beginPath();
            ctx.arc(p.position.x, p.position.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    drawEffects(ctx, es) {
        for (const e of es) {
            const p = Math.min(1, e.age / e.lifetime);
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - p);
            if (e.type === "ring") {
                ctx.strokeStyle = e.color;
                ctx.lineWidth = 5 * (1 - p) + 1;
                ctx.beginPath();
                ctx.arc(e.position.x, e.position.y, 8 + p * 34 * e.strength, 0, Math.PI * 2);
                ctx.stroke();
            } else if (e.type === "particle") {
                ctx.fillStyle = e.color;
                ctx.translate(e.position.x, e.position.y);
                ctx.rotate(Math.atan2(e.velocity.y, e.velocity.x));
                ctx.fillRect(-e.size, -e.size * 0.45, e.size * 2, e.size * 0.9);
            } else if (e.type === "text") {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.strokeStyle = "rgba(8, 11, 16, 0.9)";
                ctx.lineWidth = 4;
                ctx.fillStyle = e.color;
                ctx.font = `${e.emphasis ? 900 : 800} ${e.emphasis ? 22 : 17}px system-ui, sans-serif`;
                ctx.strokeText(e.text, e.position.x, e.position.y);
                ctx.fillText(e.text, e.position.x, e.position.y);
            }
            ctx.restore();
        }
    }
    drawCut(ctx, e) {
        if (e?.type !== "rope-cut" || !e.position || e.age >= 0.6) return;
        const p = e.age / 0.6,
            r = 10 + p * 28;
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(e.position.x - r, e.position.y - r);
        ctx.lineTo(e.position.x + r, e.position.y + r);
        ctx.moveTo(e.position.x + r, e.position.y - r);
        ctx.lineTo(e.position.x - r, e.position.y + r);
        ctx.stroke();
        ctx.restore();
    }
}
