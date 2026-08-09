const COLORS = Object.freeze({
    backgroundTop: "#171d2a",
    backgroundBottom: "#080b10",
    mountainFar: "#222a32",
    mountainMid: "#30373d",
    mountainNear: "#3e4241",
    rock: "#4b4a45",
    rockShadow: "#292b2c",
    rockLight: "#777269",
    oneWayEdge: "#a8d8cf",
    player: "#67e8f9",
    playerEdge: "#cffafe",
    ropeLoose: "#7dd3fc",
    ropeTense: "#fbbf24",
    candidate: "#a7f3d0"
});

export class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.cssWidth = 1;
        this.cssHeight = 1;
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const ratio = Math.max(1, globalThis.devicePixelRatio || 1);
        this.cssWidth = Math.max(1, rect.width);
        this.cssHeight = Math.max(1, rect.height);
        const width = Math.round(this.cssWidth * ratio);
        const height = Math.round(this.cssHeight * ratio);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    screenToWorld(pointer, camera) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: pointer.x - rect.left + camera.x, y: pointer.y - rect.top + camera.y };
    }

    draw(scene) {
        this.resize();
        this.drawBackground(scene.camera);
        this.context.save();
        this.context.translate(-scene.camera.x, -scene.camera.y);
        this.drawWorld(scene.world);
        this.drawAttachmentRange(scene);
        this.drawRope(scene.rope, scene.player.position);
        this.drawCandidate(scene.attachmentCandidate);
        this.drawPlayer(scene.player, scene.eventFlash);
        this.context.restore();
        this.drawHud(scene);
    }

    drawBackground(camera) {
        const ctx = this.context;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.cssHeight);
        gradient.addColorStop(0, COLORS.backgroundTop);
        gradient.addColorStop(1, COLORS.backgroundBottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

        this.drawMountainLayer(camera, 0.08, this.cssHeight * 0.63, 150, COLORS.mountainFar, 740);
        this.drawMountainLayer(camera, 0.14, this.cssHeight * 0.74, 210, COLORS.mountainMid, 560);
        this.drawMountainLayer(camera, 0.21, this.cssHeight * 0.88, 250, COLORS.mountainNear, 430);

        const haze = ctx.createLinearGradient(0, this.cssHeight * 0.35, 0, this.cssHeight);
        haze.addColorStop(0, "rgba(184, 196, 196, 0.08)");
        haze.addColorStop(1, "rgba(8, 11, 16, 0)");
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
    }

    drawMountainLayer(camera, parallax, baseline, peakHeight, color, spacing) {
        const ctx = this.context;
        const offsetX = ((-camera.x * parallax) % spacing) - spacing;
        const offsetY = -camera.y * parallax * 0.22;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, this.cssHeight);
        ctx.lineTo(0, baseline + offsetY);
        for (let index = -1; index <= Math.ceil(this.cssWidth / spacing) + 1; index += 1) {
            const left = offsetX + index * spacing;
            const peak = left + spacing * (0.38 + (index % 2) * 0.08);
            ctx.lineTo(left, baseline + offsetY);
            ctx.lineTo(peak, baseline - peakHeight + offsetY - (index % 3) * 28);
            ctx.lineTo(left + spacing, baseline + offsetY);
        }
        ctx.lineTo(this.cssWidth, this.cssHeight);
        ctx.closePath();
        ctx.fill();
    }

    drawWorld(world) {
        for (const surface of world.surfaces) {
            this.drawRockSurface(surface);
        }
    }

    drawRockSurface(surface) {
        const ctx = this.context;
        const vertices = surface.vertices;

        ctx.fillStyle = COLORS.rock;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let index = 1; index < vertices.length; index += 1) ctx.lineTo(vertices[index].x, vertices[index].y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = COLORS.rockLight;
        ctx.lineWidth = 3;
        ctx.stroke();

        if (surface.oneWay) {
            ctx.strokeStyle = COLORS.oneWayEdge;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let index = 1; index <= surface.oneWayEdgeEnd; index += 1) {
                ctx.lineTo(vertices[index].x, vertices[index].y);
            }
            ctx.stroke();
            ctx.lineCap = "butt";
        }

        ctx.strokeStyle = "rgba(205, 198, 184, 0.2)";
        ctx.lineWidth = 2;
        const centerX = surface.x + surface.width * 0.5;
        const centerY = surface.y + surface.height * 0.5;
        ctx.beginPath();
        for (let index = 0; index < vertices.length; index += 2) {
            ctx.moveTo(vertices[index].x, vertices[index].y);
            ctx.lineTo(centerX, centerY);
        }
        ctx.stroke();
    }

    drawAttachmentRange({ player, maxAttachDistance, attachmentCandidate, rope }) {
        if (rope.isAttached || !attachmentCandidate) return;
        const ctx = this.context;
        ctx.save();
        ctx.setLineDash([7, 10]);
        ctx.strokeStyle = "rgba(167, 243, 208, 0.2)";
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, maxAttachDistance, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawRope(rope, playerPosition) {
        if (!rope.anchor) return;
        const ctx = this.context;
        const ratio = Math.min(1, rope.tension / 900);
        ctx.strokeStyle = ratio > 0.42 ? COLORS.ropeTense : COLORS.ropeLoose;
        ctx.lineWidth = 2.5 + ratio * 3;
        ctx.beginPath();
        ctx.moveTo(rope.anchor.x, rope.anchor.y);
        ctx.lineTo(playerPosition.x, playerPosition.y);
        ctx.stroke();
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(rope.anchor.x, rope.anchor.y, 6 + ratio * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCandidate(candidate) {
        if (!candidate) return;
        const ctx = this.context;
        ctx.strokeStyle = COLORS.candidate;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(candidate.x, candidate.y, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(candidate.x - 16, candidate.y);
        ctx.lineTo(candidate.x + 16, candidate.y);
        ctx.moveTo(candidate.x, candidate.y - 16);
        ctx.lineTo(candidate.x, candidate.y + 16);
        ctx.stroke();
    }

    drawPlayer(player, eventFlash) {
        const ctx = this.context;
        if (eventFlash.age < 0.28) {
            const progress = eventFlash.age / 0.28;
            ctx.strokeStyle = eventFlash.type === "release" ? "#fde68a" : "#67e8f9";
            ctx.globalAlpha = 1 - progress;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.position.x, player.position.y, 20 + progress * 32, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = COLORS.player;
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, player.config.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.playerEdge;
        ctx.lineWidth = 2;
        ctx.stroke();

        const speed = player.velocity.length();
        if (speed > 160) {
            ctx.strokeStyle = "rgba(103, 232, 249, 0.45)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(player.position.x, player.position.y);
            ctx.lineTo(player.position.x - player.velocity.x * 0.08, player.position.y - player.velocity.y * 0.08);
            ctx.stroke();
        }
    }

    drawHud({ player, rope, world, stats, attachmentCandidate }) {
        const ctx = this.context;
        ctx.fillStyle = "rgba(7, 11, 20, 0.76)";
        ctx.fillRect(18, 18, 290, 92);
        ctx.strokeStyle = "rgba(107, 134, 179, 0.55)";
        ctx.strokeRect(18, 18, 290, 92);
        ctx.fillStyle = "#dbeafe";
        ctx.font = "13px ui-monospace, monospace";
        const climbed = Math.max(0, Math.round(560 - player.position.y));
        const totalHeight = Math.round(560 - world.topY);
        ctx.fillText(`height ${climbed}/${totalHeight} · speed ${Math.round(player.velocity.length())}`, 32, 42);
        ctx.fillText(
            rope.isAttached
                ? `ROPE TENSION ${Math.round(rope.tension)} · release mouse`
                : attachmentCandidate
                  ? "TARGET LOCKED · hold mouse"
                  : "AIM AT ANY SURFACE",
            32,
            65
        );
        ctx.fillStyle = rope.isAttached ? COLORS.ropeTense : COLORS.candidate;
        ctx.fillRect(32, 79, Math.min(250, rope.isAttached ? rope.tension * 0.2 : 36), 7);
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(`fixed ${stats.totalSteps} · resets ${stats.resets}`, 32, 102);
    }
}
