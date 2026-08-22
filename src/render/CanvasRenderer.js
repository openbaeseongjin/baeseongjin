import { getMobileControlLayout } from "../core/input/MobileControlLayout.js";
import { foundationAugmentById } from "../game/augments/FoundationAugmentCatalog.js";
import { authoredRegionForPosition } from "../game/world/AuthoredLandmarkResolver.js";
import {
    DEFAULT_CANVAS_PERFORMANCE_POLICY,
    RenderFrameStats,
    RenderPerformanceMetrics,
    resolveCanvasBackingStore
} from "./RenderPerformanceMetrics.js";
import { createRenderViewport, DEFAULT_RENDER_CULL_MARGIN } from "./RenderViewport.js";
import { assertSceneRenderer } from "./SceneRenderer.js";
import { ACTOR_STATUS_COLORS, resolveActionCooldownStatus, resolveHealthStatus } from "./ActorStatusPresentation.js";
import { layoutAccessEdgeGuides, projectWorldToScreen, resolveAccessModuleTargets } from "./ScreenEdgeGuide.js";
import { CLIENT_STATUS_FEEDBACK_SECONDS } from "../game/combat/ClientStatusFeedback.js";

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
            minPixelRatio: this.performancePolicy.minPixelRatio,
            maxPixelRatio: this.performancePolicy.maxPixelRatio,
            maxBackingPixels: this.performancePolicy.maxBackingPixels,
            enforceBackingPixelLimit: this.performancePolicy.enforceBackingPixelLimit
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
        this.drawDirectionLighting(scene.directionLightingPresentation, scene);
        this.drawDirectionCharacter(scene.directionCharacterPresentation, scene);
        if (scene.hudVisible !== false) {
            this.drawAccessGuide(scene);
            this.drawLocalStatusHud(scene);
            this.drawCalibrationHud(scene.calibrationPresentation?.hud, scene);
            this.drawAccessHud(scene);
        }
        this.drawRewardSelectionOverlay(scene.foundationReward);
        this.drawMobileControls(scene.mobileControls);
        this.drawStoryPresentation(scene.storyPresentation);
        this.drawCalibrationToast(scene.calibrationPresentation?.toast);
        this.drawPlayerMessagePresentation(scene.playerMessagePresentation, scene);
        this.drawStatusFeedback(scene.eventFlash);
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

    drawRewardSelectionOverlay(reward) {
        if (!reward) return;
        const ctx = this.context;
        const cardGap = 12;
        const margin = Math.max(16, this.cssWidth * 0.04);
        const availableWidth = Math.min(this.cssWidth - margin * 2, 840);
        const cardWidth = (availableWidth - cardGap * 2) / 3;
        const cardHeight = Math.min(226, this.cssHeight * 0.52);
        const startX = (this.cssWidth - availableWidth) * 0.5;
        const startY = (this.cssHeight - cardHeight) * 0.46;
        ctx.save();
        ctx.fillStyle = "rgba(8, 11, 16, 0.48)";
        ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
        ctx.fillStyle = "#f8fafc";
        ctx.textAlign = "center";
        ctx.font = `900 ${this.cssWidth < 620 ? 14 : 22}px system-ui, sans-serif`;
        ctx.fillText(
            `증강 선택 ${Math.min(6, (reward.selectionIndex ?? 0) + 1)} / 6`,
            this.cssWidth * 0.5,
            Math.max(30, startY - 50)
        );
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
            ctx.font = `900 ${cardWidth < 150 ? 11 : 16}px system-ui, sans-serif`;
            this.drawFoundationChoiceIcon(choice.id, x + cardWidth * 0.5, startY + 48, selected);
            ctx.fillText(choice.name, x + cardWidth * 0.5, startY + 92);
            ctx.fillStyle = selected ? "#67e8f9" : "#94a3b8";
            ctx.font = `900 ${cardWidth < 150 ? 8 : 11}px ui-monospace, monospace`;
            this.drawCenteredWrappedText(
                `${choice.family} · ${choice.tagline}`,
                x + cardWidth * 0.5,
                startY + 116,
                cardWidth - 16,
                12,
                2
            );
            ctx.fillStyle = "#cbd5e1";
            ctx.font = `700 ${cardWidth < 150 ? 9 : 12}px system-ui, sans-serif`;
            this.drawCenteredWrappedText(choice.description, x + cardWidth * 0.5, startY + 151, cardWidth - 18, 15, 2);
            ctx.fillStyle = "#64748b";
            ctx.font = "800 10px ui-monospace, monospace";
            ctx.fillText("AUGMENT", x + cardWidth * 0.5, startY + 190);
        });
        ctx.fillStyle = "#fbbf24";
        ctx.font = "900 13px system-ui, sans-serif";
        ctx.fillText(
            "개인 장비만 정지 · 다른 플레이어와 월드는 계속 진행",
            this.cssWidth * 0.5,
            Math.min(this.cssHeight - 18, startY + cardHeight + 28)
        );
        ctx.restore();
    }

    drawDirectionLighting(presentation, scene) {
        if (!presentation || presentation.presetId !== "maintenance-white-local-amber") return;
        const ctx = this.context;
        const fadeIn = Math.min(1, presentation.age / 0.4);
        ctx.save();
        ctx.globalAlpha = fadeIn;
        ctx.fillStyle = "rgba(226, 232, 240, 0.035)";
        ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
        if (scene.player?.position && scene.camera && typeof ctx.createRadialGradient === "function") {
            const screen = projectWorldToScreen(scene.player.position, scene.camera);
            const gradient = ctx.createRadialGradient(screen.x, screen.y, 12, screen.x, screen.y, 190);
            gradient.addColorStop(0, "rgba(251, 191, 36, 0.13)");
            gradient.addColorStop(1, "rgba(251, 191, 36, 0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(screen.x - 190, screen.y - 190, 380, 380);
        }
        ctx.restore();
    }

    drawDirectionCharacter(presentation, scene) {
        if (!presentation || presentation.kind !== "exhale" || !scene.camera) return;
        const speaker =
            [scene.player, ...(scene.otherPlayers ?? [])].find((player) => player?.id === presentation.speakerId) ??
            scene.player;
        if (!speaker?.position) return;
        const ctx = this.context;
        const screen = projectWorldToScreen(speaker.position, scene.camera);
        const progress = presentation.age / presentation.durationSeconds;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, 1 - progress));
        ctx.strokeStyle = "rgba(226, 232, 240, 0.72)";
        ctx.lineWidth = 2;
        for (const [index, delay] of [0, 0.16].entries()) {
            const localProgress = Math.max(0, Math.min(1, progress - delay));
            ctx.globalAlpha = Math.max(0, Math.min(1, 1 - localProgress)) * (index === 0 ? 1 : 0.58);
            ctx.beginPath();
            ctx.arc(
                screen.x + 18 + localProgress * 18,
                screen.y - 23 - index * 7 - localProgress * 10,
                6 + localProgress * 4,
                Math.PI * 0.88,
                Math.PI * 1.82
            );
            ctx.stroke();
        }
        ctx.restore();
    }

    drawCenteredWrappedText(text, x, y, maxWidth, lineHeight, maxLines) {
        const ctx = this.context;
        const words = [...String(text)];
        const lines = [];
        let line = "";
        for (const word of words) {
            if (ctx.measureText(line + word).width <= maxWidth || line.length === 0) {
                line += word;
                continue;
            }
            if (lines.length === maxLines - 1) {
                while (line.length > 1 && ctx.measureText(`${line}…`).width > maxWidth) line = line.slice(0, -1);
                lines.push(`${line.trim()}…`);
                line = "";
                break;
            }
            lines.push(line.trim());
            line = word;
        }
        if (line && lines.length < maxLines) lines.push(line.trim());
        lines.forEach((value, index) => ctx.fillText(value, x, y + index * lineHeight));
    }

    drawFoundationChoiceIcon(id, x, y, selected) {
        const ctx = this.context;
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = selected ? "#67e8f9" : "#94a3b8";
        ctx.fillStyle = selected ? "rgba(103, 232, 249, 0.22)" : "rgba(148, 163, 184, 0.14)";
        ctx.lineWidth = 3;
        const augment = foundationAugmentById(id);
        if (augment?.category === "action") {
            ctx.strokeRect(-18, -12, 22, 24);
            ctx.beginPath();
            ctx.moveTo(-13, -7);
            ctx.lineTo(-2, 0);
            ctx.lineTo(-13, 7);
            ctx.moveTo(7, 0);
            ctx.lineTo(21, 0);
            ctx.lineTo(15, -6);
            ctx.moveTo(21, 0);
            ctx.lineTo(15, 6);
            ctx.stroke();
        } else if (augment?.category === "rope") {
            ctx.strokeRect(-21, -9, 16, 18);
            ctx.strokeRect(5, -9, 16, 18);
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(5, 0);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.moveTo(-22, 16);
            ctx.lineTo(22, -16);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawLocalStatusHud({
        world,
        player,
        playerHealth,
        playerMaxHealth,
        actionState,
        selectedAugmentIds = [],
        mobileView = false
    }) {
        const ctx = this.context;
        const compactView = mobileView || (this.cssWidth <= 900 && this.cssHeight <= 500);
        const width = compactView ? Math.min(240, this.cssWidth - 36) : 360;
        const x = 18;
        const y = 54;
        const height = compactView ? 92 : 112;
        const innerWidth = width - 28;
        const stageY = y + (compactView ? 16 : 19);
        const healthLabelY = y + (compactView ? 31 : 38);
        const healthBarY = y + (compactView ? 35 : 43);
        const actionLabelY = y + (compactView ? 53 : 67);
        const actionBarY = y + (compactView ? 57 : 72);
        const augmentY = y + (compactView ? 83 : 101);
        const barHeight = compactView ? 7 : 9;
        const health = resolveHealthStatus(playerHealth, playerMaxHealth);
        const action = resolveActionCooldownStatus(actionState);
        const region = authoredRegionForPosition(world, player?.position);
        const stage = region?.legacyStageAlias ?? region?.legacyAreaId ?? region?.id ?? "-";
        const augmentNames = selectedAugmentIds
            .map((id) => foundationAugmentById(id)?.name)
            .filter(Boolean)
            .join(" · ");

        ctx.save();
        ctx.fillStyle = "rgba(7, 11, 20, 0.9)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = "#d9f4ff";
        ctx.font = `900 ${compactView ? 10 : 12}px ui-monospace, monospace`;
        ctx.textAlign = "left";
        ctx.fillText(`STAGE ${stage}`, x + 14, stageY);

        ctx.fillStyle = "#f8fafc";
        ctx.font = `800 ${compactView ? 9 : 10}px system-ui, sans-serif`;
        ctx.fillText("HP", x + 14, healthLabelY);
        ctx.textAlign = "right";
        ctx.fillText(`${Math.round(health.current)} / ${Math.round(health.maximum)}`, x + width - 14, healthLabelY);
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.fillRect(x + 14, healthBarY, innerWidth, barHeight);
        ctx.fillStyle = health.ratio > 0.35 ? ACTOR_STATUS_COLORS.healthSafe : ACTOR_STATUS_COLORS.healthDanger;
        ctx.fillRect(x + 14, healthBarY, innerWidth * health.ratio, barHeight);

        ctx.fillStyle = "#f8fafc";
        ctx.fillText("ACTION", x + 14, actionLabelY);
        ctx.textAlign = "right";
        ctx.fillText(`${action.charges}/${action.maximum}`, x + width - 14, actionLabelY);
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.fillRect(x + 14, actionBarY, innerWidth, barHeight);
        ctx.fillStyle = ACTOR_STATUS_COLORS.actionReady;
        ctx.fillRect(x + 14, actionBarY, innerWidth * action.ratio, barHeight);

        ctx.fillStyle = "#cbd5e1";
        ctx.font = `700 ${compactView ? 8 : 9}px system-ui, sans-serif`;
        const augmentText = augmentNames || "없음";
        ctx.fillText(`증강 ${augmentText}`, x + 14, augmentY, innerWidth);
        ctx.restore();
    }

    drawCalibrationHud(presentation, { mobileView = false } = {}) {
        if (!presentation) return;
        const ctx = this.context;
        const compactView = mobileView || (this.cssWidth <= 900 && this.cssHeight <= 500);
        const width = compactView ? Math.min(240, this.cssWidth - 36) : 360;
        const x = 18;
        const y = compactView ? 154 : 174;
        const height = compactView ? 44 : 50;
        const status = presentation.verified ? "검증 완료" : "대기 중";

        ctx.save();
        ctx.fillStyle = "rgba(8, 22, 32, 0.92)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = presentation.verified ? "rgba(52, 211, 153, 0.82)" : "rgba(103, 232, 249, 0.72)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.textAlign = "left";
        ctx.fillStyle = "#9fb7c7";
        ctx.font = `900 ${compactView ? 8 : 9}px ui-monospace, monospace`;
        ctx.fillText("CALIBRATION", x + 12, y + (compactView ? 14 : 16));
        ctx.fillStyle = "#e0f2fe";
        ctx.font = `800 ${compactView ? 10 : 11}px system-ui, sans-serif`;
        ctx.fillText(`${presentation.family} · ${presentation.name}`, x + 12, y + (compactView ? 31 : 35), width - 100);
        ctx.textAlign = "right";
        ctx.fillStyle = presentation.verified ? "#6ee7b7" : "#fde68a";
        ctx.fillText(status, x + width - 12, y + (compactView ? 31 : 35));
        ctx.restore();
    }

    drawCalibrationToast(toast) {
        if (!toast) return;
        const ctx = this.context;
        const margin = 12;
        const compactView = this.cssWidth <= 900 && this.cssHeight <= 500;
        const width = Math.min(compactView ? 320 : 440, this.cssWidth - margin * 2);
        const height = compactView ? 38 : 42;
        const x = (this.cssWidth - width) * 0.5;
        const y = 92;
        const fadeIn = Math.min(1, toast.age / 0.12);
        const fadeOut = Math.min(1, (toast.durationSeconds - toast.age) / 0.16);

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));
        ctx.fillStyle = "rgba(7, 17, 30, 0.9)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = "rgba(103, 232, 249, 0.72)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#d9f4ff";
        ctx.font = `900 ${compactView ? 10 : 12}px ui-monospace, monospace`;
        ctx.fillText(toast.text, this.cssWidth * 0.5, y + (compactView ? 24 : 26), width - 20);
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

    drawPlayerMessagePresentation(presentation, scene) {
        if (!presentation) return;
        const speaker =
            [scene.player, ...(scene.otherPlayers ?? [])].find((player) => player?.id === presentation.speakerId) ??
            (presentation.audience === "local-player" ? scene.player : null);
        if (!speaker?.position || !scene.camera) return;
        const ctx = this.context;
        const margin = 12;
        const compactView = scene.mobileView || (this.cssWidth <= 900 && this.cssHeight <= 500);
        const screen = projectWorldToScreen(speaker.position, scene.camera);
        const fontSize = compactView ? 12 : 13;
        const horizontalPadding = compactView ? 12 : 14;
        const height = compactView ? 34 : 38;
        ctx.save();
        ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
        const width = Math.min(
            compactView ? 230 : 280,
            Math.max(88, ctx.measureText(presentation.text).width + horizontalPadding * 2)
        );
        const radius = speaker.collider?.radius ?? 18;
        const overheadOffset = (radius + (compactView ? 44 : 50)) * (scene.camera.zoom ?? 1);
        const x = Math.max(margin, Math.min(this.cssWidth - margin - width, screen.x - width * 0.5));
        const y = Math.max(54, Math.min(this.cssHeight - margin - height - 10, screen.y - overheadOffset - height));
        const fadeIn = Math.min(1, presentation.age / 0.1);
        const fadeOut = Math.min(1, (presentation.durationSeconds - presentation.age) / 0.16);
        const partyMessage = presentation.channel === "party-chat";
        ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));
        ctx.fillStyle = "rgba(8, 13, 22, 0.88)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = partyMessage ? "rgba(192, 132, 252, 0.82)" : "rgba(251, 191, 36, 0.82)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        const tailX = Math.max(x + 10, Math.min(x + width - 10, screen.x));
        ctx.beginPath();
        ctx.moveTo(tailX - 7, y + height);
        ctx.lineTo(tailX, y + height + 9);
        ctx.lineTo(tailX + 7, y + height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8fafc";
        ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
        ctx.fillText(
            presentation.visibleText ?? presentation.text,
            x + width * 0.5,
            y + (compactView ? 22 : 25),
            width - horizontalPadding * 2
        );
        ctx.restore();
    }

    drawStatusFeedback(eventFlash) {
        if (!eventFlash || eventFlash.age >= CLIENT_STATUS_FEEDBACK_SECONDS) return;
        let title;
        let detail;
        let color;
        let foundationFeedback = false;
        if (eventFlash.type === "checkpoint-respawn" || eventFlash.type === "sector-respawn") {
            title = eventFlash.type === "sector-respawn" ? "Stage 세이브 포인트 부활" : "체크포인트 부활";
            detail = eventFlash.reason === "fall" ? "낙사 · 최대 체력으로 복귀" : "사망 · 최대 체력으로 복귀";
            color = "#67e8f9";
        } else if (eventFlash.type === "stage-saved") {
            title = "STAGE SAVE";
            detail = `${eventFlash.stageAlias ?? "새 Stage"} · 부활 지점 저장 완료`;
            color = "#d9f4ff";
        } else if (eventFlash.type === "foundation-selected") {
            const foundation = foundationAugmentById(eventFlash.foundationId);
            title = "증강 획득";
            detail = foundation?.name ?? eventFlash.foundationId;
            color = "#67e8f9";
            foundationFeedback = true;
        } else if (eventFlash.type === "augment-release-propulsion") {
            title = "해제 추진";
            detail = "속도 ×1.25";
            color = "#fbbf24";
            foundationFeedback = true;
        } else if (eventFlash.type === "augment-rope-link-ready") {
            title = "로프 연동";
            detail = "다음 액션 쿨다운 50%";
            color = "#67e8f9";
            foundationFeedback = true;
        } else {
            return;
        }
        const ctx = this.context;
        const alpha = Math.min(1, eventFlash.age / 0.15, (CLIENT_STATUS_FEEDBACK_SECONDS - eventFlash.age) / 0.35);
        const top = foundationFeedback ? 92 : 18;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = "rgba(7, 11, 20, 0.92)";
        ctx.fillRect(this.cssWidth * 0.5 - 180, top, 360, 62);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.cssWidth * 0.5 - 180, top, 360, 62);
        ctx.textAlign = "center";
        ctx.fillStyle = color;
        ctx.font = "900 13px system-ui, sans-serif";
        ctx.fillText(title, this.cssWidth * 0.5, top + 24);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "700 12px system-ui, sans-serif";
        ctx.fillText(detail, this.cssWidth * 0.5, top + 44);
        ctx.restore();
    }

    drawMetricsPanel(metrics, networkMetrics = null, renderMetrics = null) {
        if (!metrics) return;
        const ctx = this.context;
        const x = Math.max(8, this.cssWidth - 248);
        const firstAugment =
            metrics.firstFoundationSeconds === null ? "-" : `${metrics.firstFoundationSeconds.toFixed(1)}초`;
        const progressTiming = metrics.landmarkTiming ?? metrics.areaTiming;
        const areaOffset = progressTiming ? 19 : 0;
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
        ctx.fillText(`첫 증강 ${firstAugment}`, x + 12, 117);
        if (progressTiming) {
            const progressId = progressTiming.currentLandmarkId ?? progressTiming.currentAreaId ?? "-";
            const seconds = progressTiming.currentLandmarkSeconds ?? progressTiming.currentAreaSeconds ?? 0;
            const label = progressId.replace("sector-", "");
            ctx.fillText(`구간 ${label} · ${seconds.toFixed(1)}초`, x + 12, 136);
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
        } else if (controls.actionPointerDown) {
            ctx.fillStyle = "rgba(103, 232, 249, 0.12)";
            ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
        }
        const layout = getMobileControlLayout(this.cssWidth, this.cssHeight);
        this.drawMobileButton(layout.left, "←", controls.left);
        this.drawMobileButton(layout.jump, "점프", controls.jump);
        this.drawMobileButton(layout.right, "→", controls.right);
        this.drawMobileButton(
            layout.action,
            controls.aimMode === "action" ? "액션 조준" : "로프 조준",
            controls.aimMode === "action"
        );
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
        ctx.font = `800 ${label === "점프" ? 16 : label.includes("조준") ? 11 : 30}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5);
        ctx.restore();
    }

    drawAccessHud({ world, worldProgress, player, mobileView = false }) {
        if (!world?.accessModules?.length) return;
        const region = authoredRegionForPosition(world, player?.position);
        const sector = world.sectors?.find(({ id }) => id === region?.sectorId);
        const requiredCount = sector?.accessModuleRequirement ?? 0;
        if (requiredCount <= 0) return;
        const moduleIds = sector.accessModuleIds ?? [];
        const collected = new Set(worldProgress.collectedAccessModuleIds ?? []);
        const remaining = moduleIds.filter((id) => !collected.has(id));
        const collectedCount = moduleIds.length - remaining.length;
        const ready = collectedCount >= requiredCount;
        const compactView = mobileView || (this.cssWidth <= 900 && this.cssHeight <= 500);
        const x = 18;
        const y = compactView ? 156 : 178;
        const width = compactView ? Math.min(240, this.cssWidth - 36) : 300;
        const height = 34;
        const ctx = this.context;
        ctx.save();
        ctx.fillStyle = "rgba(7, 11, 20, 0.86)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = ready ? "rgba(34, 211, 238, 0.72)" : "rgba(251, 191, 36, 0.72)";
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = ready ? "#67e8f9" : "#fde68a";
        ctx.font = "900 12px ui-monospace, monospace";
        ctx.fillText(
            ready
                ? "ACCESS READY"
                : `ACCESS ${collectedCount}/${requiredCount} · NEED ${requiredCount - collectedCount}`,
            x + 14,
            y + 21
        );
        ctx.restore();
    }

    drawAccessGuide({ world, worldProgress, player, camera, mobileView = false }) {
        if (!world?.accessModules?.length || !camera || !player?.position) return;
        const targets = resolveAccessModuleTargets({ world, worldProgress, playerPosition: player.position });
        const compactView = mobileView || (this.cssWidth <= 900 && this.cssHeight <= 500);
        const ctx = this.context;
        const guides = layoutAccessEdgeGuides({
            targets,
            camera,
            viewportWidth: this.cssWidth,
            viewportHeight: this.cssHeight,
            insets: { left: 30, right: 30, top: 54, bottom: mobileView ? 116 : 30 },
            compactView
        });
        for (const guide of guides) {
            const pulse = 0.9 + Math.sin(this.now() * 7) * 0.1;
            ctx.save();
            ctx.translate(guide.x, guide.y);
            ctx.rotate(guide.angle);
            ctx.scale(guide.scale, guide.scale);
            ctx.globalAlpha = pulse;
            ctx.fillStyle = "#fbbf24";
            ctx.strokeStyle = "#fff7d6";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(16, 0);
            ctx.lineTo(-10, -12);
            ctx.lineTo(-3, 0);
            ctx.lineTo(-10, 12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }
}
