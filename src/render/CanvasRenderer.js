import { getMobileControlLayout } from "../core/input/MobileControlLayout.js";

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
        const zoom = camera.zoom ?? 1;
        return { x: (pointer.x - rect.left) / zoom + camera.x, y: (pointer.y - rect.top) / zoom + camera.y };
    }

    draw(scene) {
        this.resize();
        this.drawBackground(scene.camera);
        this.context.save();
        const zoom = scene.camera.zoom ?? 1;
        const shake = this.getImpactOffset(scene.impact);
        this.context.translate(-scene.camera.x * zoom + shake.x, -scene.camera.y * zoom + shake.y);
        this.context.scale(zoom, zoom);
        this.drawWorld(scene.world);
        this.drawAttachmentRange(scene);
        this.drawRope(scene.rope, scene.player.position);
        this.drawSwingDrag(scene.player, scene.swingDrag);
        this.drawEnemies(scene.enemies ?? []);
        this.drawProjectiles(scene.projectiles ?? []);
        this.drawEnemyProjectiles(scene.enemyProjectiles ?? []);
        this.drawCombatEffects(scene.combatEffects ?? []);
        this.drawRopeCutMark(scene.eventFlash);
        this.drawCandidate(scene.attachmentCandidate);
        this.drawPlayer(scene.player, scene.eventFlash, scene.playerLifeState);
        this.context.restore();
        if (!scene.mobileView) this.drawCombatHud(scene);
        this.drawMobileControls(scene.mobileControls);
        this.drawRopeCutFeedback(scene.eventFlash, scene.ropeDisabledRemaining);
        this.drawDefeatOverlay(scene);
    }

    getImpactOffset(impact) {
        if (!impact || impact.age >= impact.lifetime) return { x: 0, y: 0 };
        const decay = 1 - impact.age / impact.lifetime;
        return {
            x: Math.sin(impact.age * 173) * impact.strength * decay,
            y: Math.cos(impact.age * 137) * impact.strength * decay * 0.65
        };
    }

    drawCombatEffects(effects) {
        const ctx = this.context;
        for (const effect of effects) {
            const progress = Math.min(1, effect.age / effect.lifetime);
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - progress);
            if (effect.type === "ring") {
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = 5 * (1 - progress) + 1;
                ctx.beginPath();
                ctx.arc(effect.position.x, effect.position.y, 8 + progress * 34 * effect.strength, 0, Math.PI * 2);
                ctx.stroke();
            } else if (effect.type === "particle") {
                ctx.fillStyle = effect.color;
                ctx.translate(effect.position.x, effect.position.y);
                ctx.rotate(Math.atan2(effect.velocity.y, effect.velocity.x));
                ctx.fillRect(-effect.size, -effect.size * 0.45, effect.size * 2, effect.size * 0.9);
            } else if (effect.type === "text") {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.strokeStyle = "rgba(8, 11, 16, 0.9)";
                ctx.lineWidth = 4;
                ctx.fillStyle = effect.color;
                ctx.font = `${effect.emphasis ? 900 : 800} ${effect.emphasis ? 22 : 17}px system-ui, sans-serif`;
                ctx.strokeText(effect.text, effect.position.x, effect.position.y);
                ctx.fillText(effect.text, effect.position.x, effect.position.y);
            }
            ctx.restore();
        }
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

    drawSwingDrag(player, swingDrag) {
        if (!swingDrag || swingDrag.used || !swingDrag.direction || swingDrag.progress <= 0) return;
        const ctx = this.context;
        const length = 28 + swingDrag.progress * 34;
        const endX = player.position.x + swingDrag.direction.x * length;
        const endY = player.position.y + swingDrag.direction.y * length;
        ctx.save();
        ctx.globalAlpha = 0.35 + swingDrag.progress * 0.65;
        ctx.strokeStyle = COLORS.ropeTense;
        ctx.fillStyle = COLORS.ropeTense;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.position.x, player.position.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.translate(endX, endY);
        ctx.rotate(Math.atan2(swingDrag.direction.y, swingDrag.direction.x));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-11, -6);
        ctx.lineTo(-11, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawPlayer(player, eventFlash, lifeState) {
        const ctx = this.context;
        if (eventFlash.age < 0.28) {
            const progress = eventFlash.age / 0.28;
            ctx.strokeStyle =
                eventFlash.type === "rope-cut"
                    ? "#fb7185"
                    : eventFlash.type === "release" || eventFlash.type === "swing"
                      ? "#fde68a"
                      : "#67e8f9";
            ctx.globalAlpha = 1 - progress;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.position.x, player.position.y, 20 + progress * 32, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = lifeState === "downed" ? "#64748b" : COLORS.player;
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

    drawRopeCutMark(eventFlash) {
        if (eventFlash?.type !== "rope-cut" || !eventFlash.position || eventFlash.age >= 0.6) return;
        const ctx = this.context;
        const progress = eventFlash.age / 0.6;
        const radius = 10 + progress * 28;
        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(eventFlash.position.x - radius, eventFlash.position.y - radius);
        ctx.lineTo(eventFlash.position.x + radius, eventFlash.position.y + radius);
        ctx.moveTo(eventFlash.position.x + radius, eventFlash.position.y - radius);
        ctx.lineTo(eventFlash.position.x - radius, eventFlash.position.y + radius);
        ctx.stroke();
        ctx.restore();
    }

    drawRopeCutFeedback(eventFlash, disabledRemaining) {
        if (eventFlash?.type !== "rope-cut" || eventFlash.age >= 0.8) return;
        const ctx = this.context;
        const alpha = Math.max(0, 1 - eventFlash.age / 0.8);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, this.cssWidth - 8, this.cssHeight - 8);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fecdd3";
        ctx.font = "800 24px system-ui, sans-serif";
        ctx.fillText("로프 절단!", this.cssWidth * 0.5, this.cssHeight * 0.22);
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillText(
            `재연결까지 ${Math.max(0, disabledRemaining).toFixed(1)}초`,
            this.cssWidth * 0.5,
            this.cssHeight * 0.22 + 26
        );
        ctx.restore();
    }

    drawDefeatOverlay({ runState, defeatReason, restartRemaining }) {
        if (runState !== "defeated") return;
        const ctx = this.context;
        ctx.fillStyle = "rgba(3, 7, 18, 0.72)";
        ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fda4af";
        ctx.font = "700 38px system-ui, sans-serif";
        ctx.fillText(defeatReason === "fall" ? "추락" : "전투 불능", this.cssWidth * 0.5, this.cssHeight * 0.46);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "18px system-ui, sans-serif";
        ctx.fillText(
            `${Math.max(0, restartRemaining).toFixed(1)}초 후 다시 시작`,
            this.cssWidth * 0.5,
            this.cssHeight * 0.53
        );
        ctx.textAlign = "start";
    }

    drawMobileControls(controls) {
        if (!controls?.visible) return;
        const ctx = this.context;
        if (controls.ropePointerDown) {
            ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
            ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
        }
        const layout = getMobileControlLayout(this.cssWidth, this.cssHeight);
        this.drawMobileButton(layout.left, "←", controls.left);
        this.drawMobileButton(layout.jump, "점프", controls.jump);
        this.drawMobileButton(layout.right, "→", controls.right);
    }

    drawMobileButton(bounds, label, active) {
        const ctx = this.context;
        ctx.save();
        ctx.fillStyle = active ? "rgba(251, 191, 36, 0.7)" : "rgba(15, 23, 42, 0.62)";
        ctx.strokeStyle = active ? "#fde68a" : "rgba(226, 232, 240, 0.7)";
        ctx.lineWidth = active ? 3 : 2;
        ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.fillStyle = active ? "#111827" : "#f8fafc";
        ctx.font = `800 ${label === "점프" ? 16 : 30}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5);
        ctx.restore();
    }

    drawEnemies(enemies) {
        const ctx = this.context;
        for (const enemy of enemies) {
            ctx.fillStyle = "#fb7185";
            ctx.beginPath();
            ctx.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1f2937";
            ctx.fillRect(enemy.position.x - 20, enemy.position.y - enemy.radius - 11, 40, 5);
            ctx.fillStyle = "#fda4af";
            ctx.fillRect(
                enemy.position.x - 20,
                enemy.position.y - enemy.radius - 11,
                40 * (enemy.health / enemy.maxHealth),
                5
            );
        }
    }

    drawProjectiles(projectiles) {
        const ctx = this.context;
        ctx.fillStyle = "#fef08a";
        for (const projectile of projectiles) {
            ctx.beginPath();
            ctx.arc(projectile.position.x, projectile.position.y, projectile.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawEnemyProjectiles(projectiles) {
        const ctx = this.context;
        ctx.fillStyle = "#f43f5e";
        for (const projectile of projectiles) {
            ctx.beginPath();
            ctx.arc(projectile.position.x, projectile.position.y, projectile.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawCombatHud({
        player,
        rope,
        world,
        attachmentCandidate,
        swingDrag,
        playerHealth,
        playerMaxHealth,
        ropeDisabledRemaining
    }) {
        const ctx = this.context;
        const healthRatio = Math.max(0, Math.min(1, (playerHealth ?? 0) / Math.max(1, playerMaxHealth ?? 1)));
        const climbed = Math.max(0, Math.round(560 - player.position.y));
        const totalHeight = Math.round(560 - world.topY);
        ctx.save();
        ctx.fillStyle = "rgba(7, 11, 20, 0.82)";
        ctx.fillRect(18, 18, 300, 104);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.38)";
        ctx.strokeRect(18, 18, 300, 104);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "800 12px system-ui, sans-serif";
        ctx.fillText("생명력", 32, 40);
        ctx.textAlign = "right";
        ctx.fillText(`${playerHealth ?? 0} / ${playerMaxHealth ?? 0}`, 302, 40);
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(71, 85, 105, 0.8)";
        ctx.fillRect(32, 48, 270, 10);
        ctx.fillStyle = healthRatio > 0.35 ? "#22c55e" : "#fb7185";
        ctx.fillRect(32, 48, 270 * healthRatio, 10);
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "700 12px system-ui, sans-serif";
        ctx.fillText(`고도 ${climbed} / ${totalHeight}m`, 32, 77);
        ctx.textAlign = "right";
        ctx.fillText(`속도 ${Math.round(player.velocity.length())}`, 302, 77);
        ctx.textAlign = "left";
        ctx.fillStyle = rope.isAttached ? COLORS.ropeTense : ropeDisabledRemaining > 0 ? "#fb7185" : COLORS.candidate;
        ctx.beginPath();
        ctx.arc(37, 101, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText(
            rope.isAttached
                ? swingDrag?.used
                    ? "스윙 완료 · 놓아서 이동"
                    : `스윙 충전 ${Math.round((swingDrag?.progress ?? 0) * 100)}%`
                : ropeDisabledRemaining > 0
                  ? `로프 재연결 ${ropeDisabledRemaining.toFixed(1)}초`
                  : attachmentCandidate
                    ? "부착 가능 · 누르고 드래그"
                    : "사거리 안쪽 암벽을 조준",
            50,
            105
        );
        ctx.restore();
    }

    drawHud({
        player,
        rope,
        world,
        stats,
        attachmentCandidate,
        swingDrag,
        playerHealth,
        playerMaxHealth,
        ropeDisabledRemaining
    }) {
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
        ctx.fillText(`HP ${playerHealth ?? 100}/${playerMaxHealth ?? 100}`, 205, 42);
        ctx.fillText(
            rope.isAttached
                ? swingDrag?.used
                    ? `SWING USED · release mouse`
                    : `DRAG TANGENT ${Math.round((swingDrag?.progress ?? 0) * 100)}%`
                : ropeDisabledRemaining > 0
                  ? `ROPE DISABLED ${ropeDisabledRemaining.toFixed(1)}s`
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
