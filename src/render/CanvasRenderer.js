import { getMobileControlLayout } from "../core/input/MobileControlLayout.js";
import {
    DEFAULT_CANVAS_PERFORMANCE_POLICY,
    RenderFrameStats,
    RenderPerformanceMetrics,
    resolveCanvasBackingStore
} from "./RenderPerformanceMetrics.js";
import { createRenderViewport, DEFAULT_RENDER_CULL_MARGIN } from "./RenderViewport.js";
import { assertSceneRenderer } from "./SceneRenderer.js";

const HUD_COLORS = Object.freeze({
    ropeAttached: "#fbbf24",
    attachmentCandidate: "#a7f3d0"
});

export class CanvasRenderer {
    constructor(
        canvas,
        sceneRenderer,
        {
            now = () => performance.now() / 1000,
            performanceNow = () => performance.now(),
            pixelRatio = () => globalThis.devicePixelRatio || 1,
            performancePolicy = DEFAULT_CANVAS_PERFORMANCE_POLICY,
            cullMargin = DEFAULT_RENDER_CULL_MARGIN
        } = {}
    ) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.sceneRenderer = assertSceneRenderer(sceneRenderer);
        this.now = now;
        this.performanceNow = performanceNow;
        this.pixelRatio = pixelRatio;
        this.performancePolicy = Object.freeze({ ...DEFAULT_CANVAS_PERFORMANCE_POLICY, ...performancePolicy });
        this.cullMargin = cullMargin;
        this.performanceMetrics = new RenderPerformanceMetrics({ sampleSize: this.performancePolicy.sampleSize });
        this.cssWidth = 1;
        this.cssHeight = 1;
        this.resolution = null;
        this.viewport = null;
        this.metricsPanelHeight = 118;
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.cssWidth = Math.max(1, rect.width);
        this.cssHeight = Math.max(1, rect.height);
        this.resolution = resolveCanvasBackingStore({
            cssWidth: this.cssWidth,
            cssHeight: this.cssHeight,
            devicePixelRatio: this.pixelRatio(),
            maxPixelRatio: this.performancePolicy.maxPixelRatio,
            maxBackingPixels: this.performancePolicy.maxBackingPixels
        });
        if (
            this.canvas.width !== this.resolution.backingWidth ||
            this.canvas.height !== this.resolution.backingHeight
        ) {
            this.canvas.width = this.resolution.backingWidth;
            this.canvas.height = this.resolution.backingHeight;
        }
        const ratio = this.resolution.effectivePixelRatio;
        this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.context.imageSmoothingEnabled = false;
        return this.resolution;
    }

    screenToWorld(pointer, camera) {
        const rect = this.canvas.getBoundingClientRect();
        const zoom = camera.zoom ?? 1;
        return { x: (pointer.x - rect.left) / zoom + camera.x, y: (pointer.y - rect.top) / zoom + camera.y };
    }

    draw(scene) {
        const metricsEnabled = scene.metricsVisible === true;
        const startedAtMs = metricsEnabled ? this.performanceNow() : null;
        const resolution = this.resize();
        this.viewport = createRenderViewport({
            camera: scene.camera,
            cssWidth: this.cssWidth,
            cssHeight: this.cssHeight,
            cullMargin: this.cullMargin
        });
        const renderStats = metricsEnabled ? new RenderFrameStats() : null;
        this.sceneRenderer.draw({
            context: this.context,
            scene,
            viewport: this.viewport,
            renderStats,
            presentationTimeSeconds: this.now()
        });
        if (scene.mobileView) this.drawPlayerHealthHud(scene);
        if (!scene.mobileView) {
            this.drawCombatHud(scene);
            this.drawArtifactHud(scene.artifacts, scene.ropeDamageBoostRemaining);
        }
        this.drawArtifactRewardOverlay(scene.artifactReward);
        this.drawMobileControls(scene.mobileControls);
        this.drawStoryPresentation(scene.storyPresentation);
        this.drawArtifactFeedback(scene.eventFlash);
        this.drawRopeCutFeedback(scene.eventFlash, scene.ropeDisabledRemaining);
        this.drawRunEndOverlay(scene);
        if (!metricsEnabled) return null;
        const renderMetrics = this.performanceMetrics.record({
            startedAtMs,
            endedAtMs: this.performanceNow(),
            resolution,
            droppedSteps: scene.stats?.droppedSteps ?? 0,
            drawCounts: renderStats.snapshot()
        });
        this.drawMetricsPanel(scene.metrics, scene.networkMetrics, renderMetrics);
        this.drawEnvironmentMetrics(this.sceneRenderer.environmentDiagnostics);
        return renderMetrics;
    }

    drawArtifactRewardOverlay(reward) {
        if (!reward) return;
        const ctx = this.context;
        const cardGap = 12;
        const margin = Math.max(16, this.cssWidth * 0.04);
        const availableWidth = Math.min(this.cssWidth - margin * 2, 840);
        const cardWidth = (availableWidth - cardGap * 2) / 3;
        const cardHeight = Math.min(180, this.cssHeight * 0.46);
        const startX = (this.cssWidth - availableWidth) * 0.5;
        const startY = (this.cssHeight - cardHeight) * 0.46;
        ctx.save();
        ctx.fillStyle = "rgba(8, 11, 16, 0.48)";
        ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
        ctx.fillStyle = "#f8fafc";
        ctx.textAlign = "center";
        ctx.font = "900 22px system-ui, sans-serif";
        ctx.fillText("아티팩트 선택", this.cssWidth * 0.5, Math.max(30, startY - 50));
        ctx.fillStyle = "#bfdbfe";
        ctx.font = "700 13px system-ui, sans-serif";
        ctx.fillText("좌우 이동으로 선택 · 점프로 획득", this.cssWidth * 0.5, Math.max(52, startY - 20));
        reward.choices.forEach((choice, index) => {
            const x = startX + index * (cardWidth + cardGap);
            const selected = index === reward.selectedIndex;
            ctx.fillStyle = selected ? "rgba(251, 191, 36, 0.2)" : "rgba(30, 41, 59, 0.94)";
            ctx.strokeStyle = selected ? "#fbbf24" : "#64748b";
            ctx.lineWidth = selected ? 5 : 2;
            ctx.fillRect(x, startY, cardWidth, cardHeight);
            ctx.strokeRect(x, startY, cardWidth, cardHeight);
            ctx.fillStyle = selected ? "#fde68a" : "#e2e8f0";
            ctx.font = "900 16px system-ui, sans-serif";
            ctx.fillText(choice.name, x + cardWidth * 0.5, startY + cardHeight * 0.4);
            ctx.fillStyle = "#cbd5e1";
            ctx.font = "700 12px system-ui, sans-serif";
            ctx.fillText(choice.description, x + cardWidth * 0.5, startY + cardHeight * 0.65);
        });
        ctx.fillStyle = "#fbbf24";
        ctx.font = "900 13px system-ui, sans-serif";
        ctx.fillText(
            "선택 중에도 전투 진행 · 빠르게 결정하세요",
            this.cssWidth * 0.5,
            Math.min(this.cssHeight - 18, startY + cardHeight + 28)
        );
        ctx.restore();
    }

    drawStoryPresentation(presentation) {
        if (!presentation) return;
        const ctx = this.context;
        const margin = 12;
        const width = Math.min(440, this.cssWidth - margin * 2);
        const height = 64;
        const x = (this.cssWidth - width) * 0.5;
        const y = 18;
        const fadeIn = Math.min(1, presentation.age / 0.12);
        const fadeOut = Math.min(1, (presentation.durationSeconds - presentation.age) / 0.16);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));
        ctx.fillStyle = "rgba(7, 17, 30, 0.9)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = "rgba(103, 232, 249, 0.72)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#d9f4ff";
        ctx.font = "900 13px ui-monospace, monospace";
        ctx.fillText(presentation.title, this.cssWidth * 0.5, y + 25);
        ctx.fillStyle = "#9fb7c7";
        ctx.font = "700 12px ui-monospace, monospace";
        ctx.fillText(presentation.detail, this.cssWidth * 0.5, y + 47);
        ctx.restore();
    }

    drawArtifactHud(artifacts = [], ropeDamageBoostRemaining = 0) {
        const ctx = this.context;
        const height = 46 + Math.max(1, artifacts.length) * 20;
        ctx.save();
        ctx.fillStyle = "rgba(7, 11, 20, 0.82)";
        ctx.fillRect(18, 132, 300, height);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.38)";
        ctx.strokeRect(18, 132, 300, height);
        ctx.fillStyle = "#fde68a";
        ctx.font = "900 12px system-ui, sans-serif";
        ctx.fillText("아티팩트", 32, 154);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "700 12px system-ui, sans-serif";
        if (artifacts.length === 0) {
            ctx.fillText("보유 없음", 32, 176);
        } else {
            artifacts.forEach((artifact, index) => ctx.fillText(`• ${artifact.name}`, 32, 176 + index * 20));
        }
        if (ropeDamageBoostRemaining > 0) {
            ctx.fillStyle = "#67e8f9";
            ctx.textAlign = "right";
            ctx.fillText(`공명 ${ropeDamageBoostRemaining.toFixed(1)}초`, 302, 154);
        }
        ctx.restore();
    }

    drawArtifactFeedback(eventFlash) {
        if (!eventFlash || eventFlash.age >= 2.2) return;
        let title;
        let detail;
        let color;
        if (eventFlash.type === "artifact" && eventFlash.artifact) {
            title = "아티팩트 획득";
            detail = eventFlash.artifact.name;
            color = "#fbbf24";
        } else if (eventFlash.type === "artifact-loss" && eventFlash.artifacts?.length) {
            title = "체크포인트 부활 · 아티팩트 손실";
            detail = eventFlash.artifacts.map((artifact) => artifact.name).join(", ");
            color = "#fb7185";
        } else if (eventFlash.type === "checkpoint-respawn") {
            title = "체크포인트 부활";
            detail = eventFlash.reason === "fall" ? "낙사 · 최대 체력으로 복귀" : "사망 · 최대 체력으로 복귀";
            color = "#67e8f9";
        } else {
            return;
        }
        const ctx = this.context;
        const alpha = Math.min(1, eventFlash.age / 0.15, (2.2 - eventFlash.age) / 0.35);
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = "rgba(7, 11, 20, 0.92)";
        ctx.fillRect(this.cssWidth * 0.5 - 180, 18, 360, 62);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.cssWidth * 0.5 - 180, 18, 360, 62);
        ctx.textAlign = "center";
        ctx.fillStyle = color;
        ctx.font = "900 13px system-ui, sans-serif";
        ctx.fillText(title, this.cssWidth * 0.5, 42);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "700 12px system-ui, sans-serif";
        ctx.fillText(detail, this.cssWidth * 0.5, 62);
        ctx.restore();
    }

    drawMetricsPanel(metrics, networkMetrics = null, renderMetrics = null) {
        if (!metrics) return;
        const ctx = this.context;
        const x = Math.max(8, this.cssWidth - 248);
        const firstReward = metrics.firstRewardSeconds === null ? "-" : `${metrics.firstRewardSeconds.toFixed(1)}초`;
        const areaOffset = metrics.areaTiming ? 19 : 0;
        ctx.save();
        ctx.fillStyle = "rgba(7, 11, 20, 0.9)";
        const height = 118 + areaOffset + (networkMetrics ? 94 : 0) + (renderMetrics ? 132 : 0);
        this.metricsPanelHeight = height;
        ctx.fillRect(x, 18, 230, height);
        ctx.strokeStyle = "rgba(103, 232, 249, 0.65)";
        ctx.strokeRect(x, 18, 230, height);
        ctx.fillStyle = "#67e8f9";
        ctx.font = "900 12px ui-monospace, monospace";
        ctx.fillText("RUN METRICS", x + 12, 39);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "700 11px ui-monospace, monospace";
        ctx.fillText(`활성 ${metrics.activeSeconds.toFixed(1)}초 · 체크 ${metrics.checkpointsReached}`, x + 12, 60);
        ctx.fillText(`처치 ${metrics.enemyDefeats} · 피해 ${metrics.damageTaken}`, x + 12, 79);
        ctx.fillText(`절단 ${metrics.ropeCuts} · 사망 ${metrics.defeats}`, x + 12, 98);
        ctx.fillText(`첫 보상 ${firstReward}`, x + 12, 117);
        if (metrics.areaTiming) {
            const areaLabel = metrics.areaTiming.currentAreaId?.replace("sector-", "") ?? "-";
            ctx.fillText(`구간 ${areaLabel} · ${metrics.areaTiming.currentAreaSeconds.toFixed(1)}초`, x + 12, 136);
        }
        if (networkMetrics) {
            const rtt = networkMetrics.roundTripMs === null ? "-" : `${Math.round(networkMetrics.roundTripMs)}ms`;
            const snapshots =
                networkMetrics.snapshotIntervalMs === null ? "-" : `${Math.round(networkMetrics.snapshotIntervalMs)}ms`;
            const rejected = `${Math.round(networkMetrics.rejectionRate * 100)}%`;
            ctx.fillStyle = "#fbbf24";
            ctx.fillText("NETWORK", x + 12, 140 + areaOffset);
            ctx.fillStyle = "#e2e8f0";
            ctx.fillText(`RTT ${rtt} · 스냅샷 ${snapshots}`, x + 12, 158 + areaOffset);
            ctx.fillText(`대기 ${networkMetrics.pendingCommands} · 거부 ${rejected}`, x + 12, 177 + areaOffset);
            ctx.fillText(
                `보정 p50 ${Math.round(networkMetrics.correctionP50)} · p95 ${Math.round(networkMetrics.correctionP95)}`,
                x + 12,
                196 + areaOffset
            );
            ctx.fillText(
                `스냅 ${networkMetrics.hardSnaps} · 외삽 ${Math.round(networkMetrics.extrapolationMs)}/${Math.round(networkMetrics.maxExtrapolationMs)}ms · 취소 ${networkMetrics.predictionCancellations}`,
                x + 12,
                215 + areaOffset
            );
        }
        if (renderMetrics) {
            const startY = (networkMetrics ? 238 : 140) + areaOffset;
            const number = (value) => (value === null ? "-" : String(Math.round(value)));
            const count = (category) => {
                const counts = renderMetrics.drawCounts[category];
                return counts ? `${counts.drawn}/${counts.total}` : "-";
            };
            ctx.fillStyle = "#86efac";
            ctx.fillText("RENDER", x + 12, startY);
            ctx.fillStyle = "#e2e8f0";
            ctx.fillText(
                `FPS ${number(renderMetrics.framesPerSecond)} | frame ${number(renderMetrics.frameIntervalP50Ms)}/${number(renderMetrics.frameIntervalP95Ms)}ms`,
                x + 12,
                startY + 19
            );
            ctx.fillText(
                `draw ${number(renderMetrics.renderDurationP50Ms)}/${number(renderMetrics.renderDurationP95Ms)}ms | max ${number(renderMetrics.maxRenderDurationMs)}ms`,
                x + 12,
                startY + 38
            );
            ctx.fillText(
                `drop +${renderMetrics.recentDroppedSteps} | total ${renderMetrics.droppedSteps}`,
                x + 12,
                startY + 57
            );
            ctx.fillText(
                `CSS ${Math.round(renderMetrics.cssWidth)}x${Math.round(renderMetrics.cssHeight)} | buffer ${renderMetrics.backingWidth}x${renderMetrics.backingHeight}`,
                x + 12,
                startY + 76
            );
            ctx.fillText(
                `DPR ${renderMetrics.devicePixelRatio}->${renderMetrics.effectivePixelRatio}`,
                x + 12,
                startY + 95
            );
            ctx.fillText(
                `S ${count("terrainSurfaces")} | D ${count("decorations")} | E ${count("enemies")}`,
                x + 12,
                startY + 114
            );
        }
        ctx.restore();
    }

    drawEnvironmentMetrics(environmentDiagnostics) {
        if (!environmentDiagnostics) return;
        const failedComponents = environmentDiagnostics.failedComponents
            ? environmentDiagnostics.failedComponents()
            : [];
        if (failedComponents.length === 0) return;

        const ctx = this.context;
        const x = Math.max(8, this.cssWidth - 248);
        const baseY = 18 + this.metricsPanelHeight + 8;
        const height = 60;
        ctx.save();
        ctx.fillStyle = "rgba(7, 11, 20, 0.92)";
        ctx.fillRect(x, baseY, 230, height);
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, baseY, 230, height);
        ctx.fillStyle = "#fb7185";
        ctx.font = "900 11px ui-monospace, monospace";
        ctx.fillText("ENV FALLBACK", x + 12, baseY + 18);
        ctx.fillStyle = "#fecdd3";
        ctx.font = "700 10px ui-monospace, monospace";
        ctx.fillText(`Components: ${failedComponents.join(", ")}`, x + 12, baseY + 34);
        const atlasIds = environmentDiagnostics.failedAtlasIds ? environmentDiagnostics.failedAtlasIds() : [];
        if (atlasIds.length) {
            ctx.fillText(`Atlases: ${atlasIds.join(", ")}`, x + 12, baseY + 50);
        }
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

    drawRunEndOverlay({ runState }) {
        if (runState !== "completed") return;
        const ctx = this.context;
        ctx.fillStyle = "rgba(3, 7, 18, 0.9)";
        ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fde68a";
        ctx.font = "700 38px system-ui, sans-serif";
        ctx.fillText("정상 도달", this.cssWidth * 0.5, this.cssHeight * 0.46);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "18px system-ui, sans-serif";
        ctx.fillText("전체 월드 등반 완료", this.cssWidth * 0.5, this.cssHeight * 0.53);
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

    drawPlayerHealthHud({ playerHealth, playerMaxHealth }) {
        const ctx = this.context;
        const health = Math.max(0, Math.round(playerHealth ?? 0));
        const maxHealth = Math.max(1, Math.round(playerMaxHealth ?? 1));
        const healthRatio = Math.max(0, Math.min(1, health / maxHealth));
        const width = Math.min(220, Math.max(168, this.cssWidth * 0.34));
        const x = 18;
        const y = 18;

        ctx.save();
        ctx.fillStyle = "rgba(7, 11, 20, 0.88)";
        ctx.fillRect(x, y, width, 50);
        ctx.strokeStyle = healthRatio <= 0.35 ? "rgba(251, 113, 133, 0.8)" : "rgba(148, 163, 184, 0.42)";
        ctx.strokeRect(x, y, width, 50);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "800 12px system-ui, sans-serif";
        ctx.fillText("HP", x + 14, y + 20);
        ctx.textAlign = "right";
        ctx.fillText(`${health} / ${maxHealth}`, x + width - 14, y + 20);
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(71, 85, 105, 0.9)";
        ctx.fillRect(x + 14, y + 29, width - 28, 9);
        ctx.fillStyle = healthRatio > 0.35 ? "#22c55e" : "#fb7185";
        ctx.fillRect(x + 14, y + 29, (width - 28) * healthRatio, 9);
        ctx.restore();
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
        ctx.fillStyle = rope.isAttached
            ? HUD_COLORS.ropeAttached
            : ropeDisabledRemaining > 0
              ? "#fb7185"
              : HUD_COLORS.attachmentCandidate;
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
        ctx.fillStyle = rope.isAttached ? HUD_COLORS.ropeAttached : HUD_COLORS.attachmentCandidate;
        ctx.fillRect(32, 79, Math.min(250, rope.isAttached ? rope.tension * 0.2 : 36), 7);
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(`fixed ${stats.totalSteps} · resets ${stats.resets}`, 32, 102);
    }
}
