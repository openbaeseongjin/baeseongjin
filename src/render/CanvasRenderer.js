import { getMobileControlLayout } from "../core/input/MobileControlLayout.js";
import { MOBILE_GAMEPLAY_ACTION_ID } from "../core/input/MobileGameplayInputAdapter.js";
import { augmentById } from "../game/augments/AugmentCatalog.js";
import { authoredRegionForPosition } from "../game/world/AuthoredLandmarkResolver.js";
import {
    DEFAULT_CANVAS_PERFORMANCE_POLICY,
    RenderFrameStats,
    RenderPerformanceMetrics,
    resolveCanvasBackingStore
} from "./RenderPerformanceMetrics.js";
import { createRenderViewport, DEFAULT_RENDER_CULL_MARGIN } from "./RenderViewport.js";
import { assertSceneRenderer } from "./SceneRenderer.js";
import { ACTOR_STATUS_COLORS, resolveHealthStatus } from "./ActorStatusPresentation.js";
import { spellDefinition } from "../game/spells/SpellCatalog.js";
import { SPELL_SLOT_LABEL, SPELL_SLOT_ORDER } from "../game/spells/SpellDefinition.js";
import { SPELL_SLOT_KEY_LABEL } from "../core/input/SpellSlotCommandInput.js";
import { graphemes } from "../core/text/GraphemeText.js";
import { layoutScreenEdgePresentations, projectWorldToScreen, resolveAccessModuleTargets } from "./ScreenEdgeGuide.js";
import { CLIENT_STATUS_FEEDBACK_SECONDS } from "../game/combat/ClientStatusFeedback.js";
import { CLIENT_STATUS_TYPE } from "../game/combat/ClientStatusFeedbackDefinition.js";
import { ROPE_IMPACT_EVENT_TYPE, ROPE_IMPACT_REJECTION_REASON } from "../game/combat/RopeImpactAttack.js";
import { AugmentIconAssetCatalog } from "./assets/AugmentIconAssetCatalog.js";

const BOSS_HUD_BLOCKING_STATUS = Object.freeze({
    "checkpoint-respawn": true,
    "sector-respawn": true,
    "stage-saved": true,
    "augment-selected": true,
    [CLIENT_STATUS_TYPE.PORTAL_ACCESS_BLOCKED]: true
});

const AUGMENT_ICON_RENDERING = Object.freeze({
    smoothingEnabled: true,
    smoothingQuality: "high"
});

const ROPE_IMPACT_REJECTION_STATUS = Object.freeze({
    [ROPE_IMPACT_REJECTION_REASON.SWING_REQUIRED]: Object.freeze({
        title: "스윙 필요",
        detail: "로프 부착 후 접선 드래그로 가속",
        color: "#67e8f9"
    }),
    [ROPE_IMPACT_REJECTION_REASON.RELEASE_EXPIRED]: Object.freeze({
        title: "공격 창 종료",
        detail: "해제 직후에만 로프 추진 타격 가능",
        color: "#cbd5e1"
    }),
    [ROPE_IMPACT_REJECTION_REASON.SPEED_BELOW_MINIMUM]: Object.freeze({
        title: "속도 부족",
        detail: "스윙을 더 크게 가속하세요",
        color: "#fbbf24"
    }),
    [ROPE_IMPACT_REJECTION_REASON.SHIELD_BLOCKED]: Object.freeze({
        title: "방패 차단",
        detail: "측면 또는 후방에서 충돌하세요",
        color: "#fb7185"
    })
});

function bossHudBlocked(scene) {
    const statusVisible =
        BOSS_HUD_BLOCKING_STATUS[scene.eventFlash?.type] === true &&
        (scene.eventFlash?.age ?? CLIENT_STATUS_FEEDBACK_SECONDS) < CLIENT_STATUS_FEEDBACK_SECONDS;
    return Boolean(scene.augmentReward || scene.storyPresentation || scene.runState === "completed" || statusVisible);
}

export class CanvasRenderer {
    constructor(
        canvas,
        sceneRenderer,
        {
            now = () => performance.now() / 1000,
            performanceNow = () => performance.now(),
            pixelRatio = () => globalThis.devicePixelRatio || 1,
            performancePolicy = DEFAULT_CANVAS_PERFORMANCE_POLICY,
            cullMargin = DEFAULT_RENDER_CULL_MARGIN,
            augmentIconAssets = new AugmentIconAssetCatalog()
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
        this.augmentIconAssets = augmentIconAssets;
        void this.augmentIconAssets.prepare();
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

    messageSpeaker(presentation, scene) {
        if (!presentation) return null;
        return (
            [scene.player, ...(scene.otherPlayers ?? [])].find((player) => player?.id === presentation.speakerId) ??
            (presentation.audience === "local-player" ? scene.player : null)
        );
    }

    wrapTextLines(text, maxWidth) {
        const lines = [];
        let line = "";
        for (const character of graphemes(text)) {
            if (line.length === 0 || this.context.measureText(line + character).width <= maxWidth) {
                line += character;
                continue;
            }
            lines.push(line);
            line = character;
        }
        if (line || lines.length === 0) lines.push(line);
        return Object.freeze(lines);
    }

    playerMessageBubbleLayout(presentation, scene) {
        if (!presentation) return null;
        const compactView = scene.mobileView || (this.cssWidth <= 900 && this.cssHeight <= 500);
        const fontSize = compactView ? 12 : 13;
        const horizontalPadding = compactView ? 12 : 14;
        const verticalPadding = compactView ? 9 : 10;
        const lineHeight = compactView ? 16 : 18;
        const maximumWidth = Math.max(40, Math.min(compactView ? 250 : 320, this.cssWidth - 24));
        this.context.font = `700 ${fontSize}px system-ui, sans-serif`;
        const lines = this.wrapTextLines(presentation.text, maximumWidth - horizontalPadding * 2);
        const measuredWidth = Math.max(...lines.map((line) => this.context.measureText(line).width));
        return Object.freeze({
            compactView,
            fontSize,
            horizontalPadding,
            verticalPadding,
            lineHeight,
            lines,
            width: Math.min(maximumWidth, Math.max(88, measuredWidth + horizontalPadding * 2)),
            height: lines.length * lineHeight + verticalPadding * 2
        });
    }

    screenEdgeAvoidanceBounds(scene) {
        if (scene.hudVisible === false) return Object.freeze([]);
        const compactView = scene.mobileView || (this.cssWidth <= 900 && this.cssHeight <= 500);
        const statusWidth = compactView ? Math.min(240, this.cssWidth - 36) : 360;
        const statusY = compactView && scene.bossStagePresentation?.hud ? 94 : 54;
        const statusHeight = compactView ? 66 : 82;
        const bounds = [
            Object.freeze({ minX: 18, minY: statusY, maxX: 18 + statusWidth, maxY: statusY + statusHeight })
        ];
        const accessTargets = resolveAccessModuleTargets({
            world: scene.world,
            worldProgress: scene.worldProgress,
            playerPosition: scene.player?.position
        });
        if (accessTargets.length > 0) {
            const accessWidth = compactView ? Math.min(240, this.cssWidth - 36) : 300;
            const accessY = compactView ? 156 : 178;
            bounds.push(Object.freeze({ minX: 18, minY: accessY, maxX: 18 + accessWidth, maxY: accessY + 34 }));
        }
        return Object.freeze(bounds);
    }

    createScreenEdgeLayout(scene) {
        const presentation = scene.playerMessagePresentation;
        const speaker = this.messageSpeaker(presentation, scene);
        const playerMessageBubble = this.playerMessageBubbleLayout(presentation, scene);
        const accessTarget =
            scene.hudVisible === false
                ? null
                : resolveAccessModuleTargets({
                      world: scene.world,
                      worldProgress: scene.worldProgress,
                      playerPosition: scene.player?.position
                  })[0];
        const candidates = [];
        if (speaker?.position && playerMessageBubble) {
            candidates.push(
                Object.freeze({
                    id: presentation.messageId,
                    target: speaker.position,
                    priority: 100,
                    size: Object.freeze({
                        width: playerMessageBubble.width,
                        height: playerMessageBubble.height + 12
                    })
                })
            );
        }
        if (accessTarget) {
            candidates.push(
                Object.freeze({
                    id: accessTarget.module.id,
                    target: accessTarget.module.position,
                    priority: 10,
                    size: Object.freeze({ width: 36, height: 30 })
                })
            );
        }
        const placements = layoutScreenEdgePresentations({
            presentations: candidates,
            camera: scene.camera,
            viewportWidth: this.cssWidth,
            viewportHeight: this.cssHeight,
            insets: { left: 12, right: 12, top: 54, bottom: scene.mobileView ? 116 : 92 },
            avoidanceBounds: this.screenEdgeAvoidanceBounds(scene)
        });
        return Object.freeze({
            playerMessage: placements.find(({ id }) => id === presentation?.messageId) ?? null,
            playerMessageBubble,
            accessGuide: placements.find(({ id }) => id === accessTarget?.module.id) ?? null
        });
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
        const mobileControlLayout = scene.mobileControls?.visible
            ? getMobileControlLayout(this.cssWidth, this.cssHeight)
            : null;
        const screenEdgeLayout = this.createScreenEdgeLayout(scene);
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
            if (!bossHudBlocked(scene)) this.drawBossHud(scene.bossStagePresentation?.hud, scene);
            this.drawAccessGuide(screenEdgeLayout.accessGuide);
            this.drawLocalStatusHud(scene);
            if (!mobileControlLayout) this.drawSpellHotbar(scene);
            this.drawAccessHud(scene);
        }
        if (mobileControlLayout) this.drawSpellHotbar(scene, mobileControlLayout);
        this.drawRewardSelectionOverlay(scene.augmentReward);
        this.drawMobileControls(scene.mobileControls, mobileControlLayout);
        this.drawStoryPresentation(scene.storyPresentation);
        this.drawPlayerMessagePresentation(
            scene.playerMessagePresentation,
            scene,
            screenEdgeLayout.playerMessage,
            screenEdgeLayout.playerMessageBubble
        );
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

    drawBossHud(hud, { mobileView = false } = {}) {
        if (!hud) return;
        const ctx = this.context;
        const compact = mobileView || this.cssWidth < 680;
        const reservedLeft = compact ? 12 : 396;
        const availableWidth = Math.max(1, this.cssWidth - reservedLeft - 12);
        const width = Math.min(compact ? this.cssWidth - 24 : 720, availableWidth);
        const height = compact ? 72 : 82;
        const x = compact ? 12 : reservedLeft + (availableWidth - width) * 0.5;
        const y = 12;
        const padding = compact ? 10 : 14;
        const gap = hud.showPhaseBreaks ? 3 : 0;
        const barY = y + (compact ? 31 : 35);
        const barHeight = compact ? 10 : 13;
        const phaseHealths =
            hud.phaseHealths?.length === hud.phaseCount
                ? hud.phaseHealths
                : Array.from({ length: hud.phaseCount }, () => hud.maxHealth / hud.phaseCount);
        const phaseFloors =
            hud.phaseFloors?.length === hud.phaseCount
                ? hud.phaseFloors
                : phaseHealths.map((_, index) =>
                      phaseHealths.slice(index + 1).reduce((total, value) => total + value, 0)
                  );
        const barWidth = width - padding * 2 - gap * (hud.phaseCount - 1);
        const currentPhaseOnly = hud.healthBarStyle === "current-phase-progress";

        ctx.save();
        ctx.fillStyle = "rgba(5, 10, 16, 0.92)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = hud.weakpointExposed ? "#facc15" : "rgba(148, 163, 184, 0.65)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.textAlign = "left";
        ctx.fillStyle = "#f8fafc";
        ctx.font = `900 ${compact ? 10 : 13}px ui-monospace, monospace`;
        ctx.fillText(hud.name, x + padding, y + (compact ? 17 : 20), width * 0.64);
        ctx.textAlign = "right";
        ctx.fillStyle = "#a9bed0";
        ctx.fillText(hud.phaseLabel, x + width - padding, y + (compact ? 17 : 20));

        const currentPhaseIndex = Math.max(0, Math.min(hud.phaseCount - 1, hud.phase - 1));
        if (currentPhaseOnly) {
            const phaseHealth = phaseHealths[currentPhaseIndex];
            const phaseHealthRemaining = Math.max(0, hud.health - phaseFloors[currentPhaseIndex]);
            const fillRatio = Math.max(0, Math.min(1, phaseHealthRemaining / phaseHealth));
            ctx.fillStyle = "rgba(30, 41, 59, 0.96)";
            ctx.fillRect(x + padding, barY, width - padding * 2, barHeight);
            ctx.fillStyle = hud.weakpointExposed ? "#facc15" : "#f59e0b";
            ctx.fillRect(x + padding, barY, (width - padding * 2) * fillRatio, barHeight);
            const markerCount = Math.max(1, hud.phaseMarkerCount ?? hud.phaseCount);
            const markerWidth = compact ? 12 : 18;
            const markerHeight = 3;
            const markerGap = markerWidth + 4;
            const markerStartX = x + padding;
            for (let index = 0; index < markerCount; index += 1) {
                ctx.fillStyle =
                    index < currentPhaseIndex ? "#475569" : index === currentPhaseIndex ? "#f59e0b" : "#ef4444";
                ctx.fillRect(markerStartX + index * markerGap, barY - markerHeight - 4, markerWidth, markerHeight);
            }
        } else {
            let segmentX = x + padding;
            for (let index = 0; index < hud.phaseCount; index += 1) {
                const phaseHealth = phaseHealths[index];
                const fillRatio = Math.max(0, Math.min(1, (hud.health - phaseFloors[index]) / phaseHealth));
                const segmentWidth = barWidth * (phaseHealth / hud.maxHealth);
                ctx.fillStyle = "rgba(30, 41, 59, 0.96)";
                ctx.fillRect(segmentX, barY, segmentWidth, barHeight);
                ctx.fillStyle = index === currentPhaseIndex ? "#f59e0b" : "#ef4444";
                ctx.fillRect(segmentX, barY, segmentWidth * fillRatio, barHeight);
                segmentX += segmentWidth + gap;
            }
        }
        if (hud.showNumbers) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#f8fafc";
            ctx.font = `900 ${compact ? 8 : 10}px ui-monospace, monospace`;
            ctx.fillText(
                currentPhaseOnly
                    ? `${Math.ceil(Math.max(0, hud.health - phaseFloors[currentPhaseIndex]))} / ${Math.ceil(phaseHealths[currentPhaseIndex])}`
                    : `${Math.ceil(hud.health)} / ${Math.ceil(hud.maxHealth)}`,
                x + width * 0.5,
                barY + barHeight - 2
            );
        }
        const warningLabel = typeof hud.warningLabel === "string" ? hud.warningLabel : "";
        ctx.font = `900 ${compact ? 9 : 11}px ui-monospace, monospace`;
        if (warningLabel) {
            ctx.textAlign = "center";
            ctx.fillStyle = "#fb7185";
            ctx.fillText(warningLabel, x + width * 0.5, y + height - (compact ? 9 : 11), width - padding * 2);
        } else {
            ctx.textAlign = "left";
            ctx.fillStyle = "#cbd5e1";
            ctx.font = `800 ${compact ? 8 : 10}px system-ui, sans-serif`;
            ctx.fillText(hud.objective, x + padding, y + height - (compact ? 10 : 12), width * 0.58);
        }
        ctx.textAlign = "right";
        ctx.fillStyle = hud.weakpointExposed ? "#fde047" : "#94a3b8";
        if (hud.showVulnerabilityCountdown && hud.weakpointExposed && hud.vulnerabilityDurationSeconds > 0) {
            const countdownRatio = Math.max(
                0,
                Math.min(1, hud.vulnerabilityRemainingSeconds / hud.vulnerabilityDurationSeconds)
            );
            const ringX = x + width - padding - (compact ? 6 : 8);
            const ringY = barY + barHeight * 0.5;
            ctx.beginPath();
            ctx.strokeStyle = "rgba(250, 204, 21, 0.25)";
            ctx.lineWidth = 2;
            ctx.arc(ringX, ringY, compact ? 4 : 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = "#fde047";
            ctx.arc(ringX, ringY, compact ? 4 : 5, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * countdownRatio);
            ctx.stroke();
        }
        const timer =
            !currentPhaseOnly &&
            hud.showVulnerabilityCountdown &&
            hud.weakpointExposed &&
            hud.vulnerabilityRemainingSeconds > 0
                ? ` · ${hud.vulnerabilityRemainingSeconds.toFixed(1)}s`
                : "";
        ctx.fillText(`${hud.vulnerabilityLabel}${timer}`, x + width - padding, y + height - (compact ? 10 : 12));
        ctx.restore();
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
            this.drawAugmentIcon(choice.id, x + cardWidth * 0.5, startY + 48, 32, selected);
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

    drawAugmentIcon(id, x, y, size, selected = false) {
        const ctx = this.context;
        const image = this.augmentIconAssets.imageFor(id);
        if (image) {
            ctx.save();
            ctx.imageSmoothingEnabled = AUGMENT_ICON_RENDERING.smoothingEnabled;
            ctx.imageSmoothingQuality = AUGMENT_ICON_RENDERING.smoothingQuality;
            ctx.drawImage(image, Math.round(x - size * 0.5), Math.round(y - size * 0.5), size, size);
            ctx.restore();
            return true;
        }
        this.drawAugmentIconFallback(id, x, y, selected, size / 32);
        return false;
    }

    drawAugmentIconFallback(id, x, y, selected, scale = 1) {
        const ctx = this.context;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.strokeStyle = selected ? "#67e8f9" : "#94a3b8";
        ctx.fillStyle = selected ? "rgba(103, 232, 249, 0.22)" : "rgba(148, 163, 184, 0.14)";
        ctx.lineWidth = 3;
        const augment = augmentById(id);
        if (augment?.category === "spell" || spellDefinition(id)) {
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
        selectedAugmentIds = [],
        mobileView = false,
        bossStagePresentation = null
    }) {
        const ctx = this.context;
        const compactView = mobileView || (this.cssWidth <= 900 && this.cssHeight <= 500);
        const width = compactView ? Math.min(240, this.cssWidth - 36) : 360;
        const x = 18;
        const y = compactView && bossStagePresentation?.hud ? 94 : 54;
        const height = compactView ? 66 : 82;
        const innerWidth = width - 28;
        const stageY = y + (compactView ? 16 : 19);
        const healthLabelY = y + (compactView ? 31 : 38);
        const healthBarY = y + (compactView ? 35 : 43);
        const augmentY = y + (compactView ? 57 : 71);
        const barHeight = compactView ? 7 : 9;
        const health = resolveHealthStatus(playerHealth, playerMaxHealth);
        const region = authoredRegionForPosition(world, player?.position);
        const stage = bossStagePresentation?.stageId ?? region?.stageId ?? region?.areaId ?? region?.id ?? "-";
        const passiveAugmentIds = selectedAugmentIds.filter((id) => augmentById(id)?.category !== "spell");

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

        ctx.fillStyle = "#cbd5e1";
        ctx.font = `700 ${compactView ? 8 : 9}px system-ui, sans-serif`;
        ctx.fillText("증강", x + 14, augmentY);
        if (passiveAugmentIds.length === 0) {
            ctx.fillText("없음", x + 44, augmentY);
        } else {
            const iconSize = 16;
            const iconGap = 4;
            passiveAugmentIds.forEach((id, index) => {
                this.drawAugmentIcon(id, x + 52 + index * (iconSize + iconGap), augmentY - 5, iconSize);
            });
        }
        ctx.restore();
    }

    drawSpellHotbar(scene, mobileControlLayout = null) {
        const spellState =
            scene.augmentRuntimeState?.combat?.spellState ?? scene.player?.augmentRuntimeState?.combat?.spellState;
        if (!spellState) return;
        const experience =
            scene.experience ??
            scene.augmentRuntimeState?.experience ??
            scene.player?.augmentRuntimeState?.experience ??
            null;
        const ctx = this.context;
        const cellSize = mobileControlLayout?.actionSize ?? 58;
        const gap = mobileControlLayout
            ? mobileControlLayout.spellSlots[SPELL_SLOT_ORDER[1]].x -
              mobileControlLayout.spellSlots[SPELL_SLOT_ORDER[0]].x -
              cellSize
            : 8;
        const totalWidth = cellSize * SPELL_SLOT_ORDER.length + gap * (SPELL_SLOT_ORDER.length - 1);
        const startX = mobileControlLayout
            ? mobileControlLayout.spellSlots[SPELL_SLOT_ORDER[0]].x
            : (this.cssWidth - totalWidth) * 0.5;
        const y = mobileControlLayout
            ? mobileControlLayout.spellSlots[SPELL_SLOT_ORDER[0]].y
            : this.cssHeight - cellSize - 26;
        ctx.save();
        for (const [index, slotId] of SPELL_SLOT_ORDER.entries()) {
            const x = startX + index * (cellSize + gap);
            const spellId = spellState.slots?.[slotId] ?? null;
            const definition = spellDefinition(spellId);
            const remaining = Math.max(0, spellState.cooldowns?.[slotId] ?? 0);
            const charges = spellId ? spellState.charges?.[spellId] : null;
            const duration = definition?.spec.cooldownSeconds ?? 0;
            const cooldownRatio = duration > 0 ? Math.min(1, remaining / duration) : 0;
            const selected = mobileControlLayout && scene.mobileControls?.selectedActionId === slotId;
            ctx.fillStyle = selected
                ? "rgba(120, 83, 20, 0.94)"
                : definition
                  ? "rgba(7, 18, 30, 0.94)"
                  : "rgba(12, 16, 24, 0.82)";
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = selected
                ? "#fde68a"
                : definition
                  ? "rgba(103, 232, 249, 0.82)"
                  : "rgba(100, 116, 139, 0.55)";
            ctx.lineWidth = selected ? 3 : 2;
            ctx.strokeRect(x, y, cellSize, cellSize);
            if (cooldownRatio > 0) {
                ctx.fillStyle = "rgba(2, 6, 23, 0.72)";
                ctx.fillRect(x, y, cellSize, cellSize * cooldownRatio);
            }
            ctx.textAlign = "center";
            if (definition) {
                this.drawAugmentIcon(spellId, x + cellSize * 0.5, y + cellSize * 0.43, 32, selected);
            } else {
                ctx.fillStyle = "#64748b";
                ctx.font = "800 10px system-ui, sans-serif";
                ctx.fillText("잠김", x + cellSize * 0.5, y + 24, cellSize - 8);
            }
            ctx.fillStyle = "#94a3b8";
            ctx.font = "800 9px ui-monospace, monospace";
            ctx.fillText(
                mobileControlLayout ? SPELL_SLOT_LABEL[slotId] : SPELL_SLOT_KEY_LABEL[slotId],
                x + cellSize * 0.5,
                y + cellSize - 8
            );
            if (Number.isSafeInteger(charges)) ctx.fillText(`×${charges}`, x + cellSize - 12, y + 18);
            if (remaining > 0) {
                ctx.fillStyle = "#f8fafc";
                ctx.font = "900 15px ui-monospace, monospace";
                ctx.fillText(remaining.toFixed(1), x + cellSize * 0.5, y + 42);
            }
        }
        const experienceWidth = totalWidth;
        const experienceY = mobileControlLayout ? y - 8 : y + cellSize + 8;
        const nextRequirement = Math.max(0, experience?.nextLevelRequirement ?? 0);
        const experienceRatio =
            nextRequirement > 0 ? Math.min(1, (experience?.experienceIntoLevel ?? 0) / nextRequirement) : 1;
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(startX, experienceY, experienceWidth, 7);
        ctx.fillStyle = "#a78bfa";
        ctx.fillRect(startX, experienceY, experienceWidth * experienceRatio, 7);
        ctx.strokeStyle = "rgba(226, 232, 240, 0.55)";
        ctx.strokeRect(startX, experienceY, experienceWidth, 7);
        ctx.textAlign = "left";
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "800 9px ui-monospace, monospace";
        ctx.fillText(`LV ${experience?.level ?? 0}`, startX, experienceY - 3);
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

    drawPlayerMessagePresentation(presentation, scene, edgePlacement = null, bubbleLayout = null) {
        if (!presentation) return;
        const speaker = this.messageSpeaker(presentation, scene);
        if (!speaker?.position || !scene.camera) return;
        const ctx = this.context;
        const margin = 12;
        const screen = projectWorldToScreen(speaker.position, scene.camera);
        const layout = bubbleLayout ?? this.playerMessageBubbleLayout(presentation, scene);
        if (!layout) return;
        const { compactView, fontSize, horizontalPadding, verticalPadding, lineHeight, width, height } = layout;
        ctx.save();
        ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
        const radius = speaker.collider?.radius ?? 18;
        const overheadOffset = (radius + (compactView ? 44 : 50)) * (scene.camera.zoom ?? 1);
        const x = edgePlacement
            ? edgePlacement.x - width * 0.5
            : Math.max(margin, Math.min(this.cssWidth - margin - width, screen.x - width * 0.5));
        const y = edgePlacement
            ? edgePlacement.y - height * 0.5
            : Math.max(54, Math.min(this.cssHeight - margin - height - 10, screen.y - overheadOffset - height));
        const fadeIn = Math.min(1, presentation.age / 0.1);
        const fadeOut = Math.min(1, (presentation.durationSeconds - presentation.age) / 0.16);
        const partyMessage = presentation.channel === "party-chat";
        ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));
        ctx.fillStyle = "rgba(8, 13, 22, 0.88)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = partyMessage ? "rgba(192, 132, 252, 0.82)" : "rgba(251, 191, 36, 0.82)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        if (edgePlacement) {
            this.drawPlayerMessageDirectionTail({
                centerX: x + width * 0.5,
                centerY: y + height * 0.5,
                width,
                height,
                angle: edgePlacement.angle
            });
        } else {
            const tailX = Math.max(x + 10, Math.min(x + width - 10, screen.x));
            ctx.beginPath();
            ctx.moveTo(tailX - 7, y + height);
            ctx.lineTo(tailX, y + height + 9);
            ctx.lineTo(tailX + 7, y + height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#f8fafc";
        ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
        const visibleLines = this.wrapTextLines(
            presentation.visibleText ?? presentation.text,
            width - horizontalPadding * 2
        );
        visibleLines.forEach((line, index) =>
            ctx.fillText(line, x + width * 0.5, y + verticalPadding + lineHeight * (index + 0.5))
        );
        ctx.restore();
    }

    drawPlayerMessageDirectionTail({ centerX, centerY, width, height, angle }) {
        const ctx = this.context;
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);
        const horizontalScale =
            Math.abs(directionX) < 1e-9 ? Number.POSITIVE_INFINITY : (width * 0.5) / Math.abs(directionX);
        const verticalScale =
            Math.abs(directionY) < 1e-9 ? Number.POSITIVE_INFINITY : (height * 0.5) / Math.abs(directionY);
        const edgeScale = Math.min(horizontalScale, verticalScale);
        const edgeX = centerX + directionX * edgeScale;
        const edgeY = centerY + directionY * edgeScale;
        const perpendicularX = -directionY;
        const perpendicularY = directionX;
        ctx.beginPath();
        ctx.moveTo(edgeX + perpendicularX * 7, edgeY + perpendicularY * 7);
        ctx.lineTo(edgeX + directionX * 10, edgeY + directionY * 10);
        ctx.lineTo(edgeX - perpendicularX * 7, edgeY - perpendicularY * 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawStatusFeedback(eventFlash) {
        if (!eventFlash || eventFlash.age >= CLIENT_STATUS_FEEDBACK_SECONDS) return;
        let title;
        let detail;
        let color;
        let augmentFeedback = false;
        if (eventFlash.type === "checkpoint-respawn" || eventFlash.type === "sector-respawn") {
            title = eventFlash.type === "sector-respawn" ? "Stage 세이브 포인트 부활" : "체크포인트 부활";
            detail = eventFlash.reason === "fall" ? "낙사 · 최대 체력으로 복귀" : "사망 · 최대 체력으로 복귀";
            color = "#67e8f9";
        } else if (eventFlash.type === "stage-saved") {
            title = "STAGE SAVE";
            detail = `${eventFlash.stageId ?? "새 Stage"} · 부활 지점 저장 완료`;
            color = "#d9f4ff";
        } else if (eventFlash.type === "augment-selected") {
            const augment = augmentById(eventFlash.augmentId);
            title = "증강 획득";
            detail = augment?.name ?? eventFlash.augmentId;
            color = "#67e8f9";
            augmentFeedback = true;
        } else if (eventFlash.type === "augment-release-propulsion") {
            title = "해제 추진";
            detail = "속도 ×1.25";
            color = "#fbbf24";
            augmentFeedback = true;
        } else if (eventFlash.type === CLIENT_STATUS_TYPE.PORTAL_ACCESS_BLOCKED) {
            title = "접근 키 부족";
            detail = `수집 ${eventFlash.collectedCount ?? 0} / 필요 ${eventFlash.requiredCount ?? 0}`;
            color = "#fbbf24";
        } else if (eventFlash.type === ROPE_IMPACT_EVENT_TYPE.REJECTED) {
            const rejection = ROPE_IMPACT_REJECTION_STATUS[eventFlash.reason];
            if (!rejection) return;
            title = rejection.title;
            detail = rejection.detail;
            color = rejection.color;
        } else {
            return;
        }
        const ctx = this.context;
        const alpha = Math.min(1, eventFlash.age / 0.15, (CLIENT_STATUS_FEEDBACK_SECONDS - eventFlash.age) / 0.35);
        const top = augmentFeedback ? 92 : 18;
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
        const firstAugment = metrics.firstAugmentSeconds === null ? "-" : `${metrics.firstAugmentSeconds.toFixed(1)}초`;
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

    drawMobileControls(controls, layout = null) {
        if (!controls?.visible) return;
        const ctx = this.context;
        if (controls.ropePointerDown) {
            ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
            ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
        }
        layout ??= getMobileControlLayout(this.cssWidth, this.cssHeight);
        this.drawMobileButton(
            layout.rope,
            "로프",
            controls.selectedActionId === MOBILE_GAMEPLAY_ACTION_ID.ROPE && !controls.ropePointerDown
        );
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
        ctx.font = `800 ${label === "점프" ? 16 : label === "로프" ? 12 : 30}px system-ui, sans-serif`;
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

    drawAccessGuide(guide) {
        if (!guide) return;
        const ctx = this.context;
        const pulse = 0.9 + Math.sin(this.now() * 7) * 0.1;
        ctx.save();
        ctx.translate(guide.x, guide.y);
        ctx.rotate(guide.angle);
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
