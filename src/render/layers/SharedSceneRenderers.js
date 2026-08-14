import { ropeAttachmentPoint } from "../../game/rope/RopeAttachment.js";
import { boundsForVertices, centeredBounds, circleBounds, isVisible } from "../RenderViewport.js";
import {
    DEFAULT_WORLD_OBJECT_MOCK_CATALOG,
    worldObjectPresentation
} from "../assets/WorldObjectPresentationCatalog.js";
import { drawCheckpointBeacon, drawExitBeacon } from "../world/WorldMarkerPrimitives.js";

const COLORS = Object.freeze({
    backgroundTop: "#171d2a",
    backgroundBottom: "#080b10",
    mountainFar: "#222a32",
    mountainMid: "#30373d",
    mountainNear: "#3e4241",
    rock: "#4b4a45",
    rockLight: "#777269",
    oneWayEdge: "#a8d8cf",
    ropeLoose: "#7dd3fc",
    ropeTense: "#fbbf24",
    candidate: "#a7f3d0"
});

function drawRope(context, rope, player) {
    if (!rope?.anchor) return;
    const attachment = ropeAttachmentPoint(player, rope);
    const tension = Math.min(1, rope.tension / 900);
    context.strokeStyle = tension > 0.42 ? COLORS.ropeTense : COLORS.ropeLoose;
    context.lineWidth = 2.5 + tension * 3;
    context.beginPath();
    context.moveTo(rope.anchor.x, rope.anchor.y);
    context.lineTo(attachment.x, attachment.y);
    context.stroke();
    context.fillStyle = "#f8fafc";
    context.beginPath();
    context.arc(rope.anchor.x, rope.anchor.y, 6 + tension * 3, 0, Math.PI * 2);
    context.fill();
}

export class BackdropRenderer {
    draw({ context, scene, viewport }) {
        const { cssWidth, cssHeight } = viewport;
        const camera = scene.camera;
        const gradient = context.createLinearGradient(0, 0, 0, cssHeight);
        gradient.addColorStop(0, COLORS.backgroundTop);
        gradient.addColorStop(1, COLORS.backgroundBottom);
        context.fillStyle = gradient;
        context.fillRect(0, 0, cssWidth, cssHeight);
        for (const [parallax, baseline, peakHeight, color, spacing] of [
            [0.08, 0.63, 150, COLORS.mountainFar, 740],
            [0.14, 0.74, 210, COLORS.mountainMid, 560],
            [0.21, 0.88, 250, COLORS.mountainNear, 430]
        ]) {
            const offsetX = ((-camera.x * parallax) % spacing) - spacing;
            const offsetY = -camera.y * parallax * 0.22;
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(0, cssHeight);
            context.lineTo(0, cssHeight * baseline + offsetY);
            for (let index = -1; index <= Math.ceil(cssWidth / spacing) + 1; index += 1) {
                const left = offsetX + index * spacing;
                const peak = left + spacing * (0.38 + (index % 2) * 0.08);
                context.lineTo(left, cssHeight * baseline + offsetY);
                context.lineTo(peak, cssHeight * baseline - peakHeight + offsetY - (index % 3) * 28);
                context.lineTo(left + spacing, cssHeight * baseline + offsetY);
            }
            context.lineTo(cssWidth, cssHeight);
            context.closePath();
            context.fill();
        }
        const haze = context.createLinearGradient(0, cssHeight * 0.35, 0, cssHeight);
        haze.addColorStop(0, "rgba(184, 196, 196, 0.08)");
        haze.addColorStop(1, "rgba(8, 11, 16, 0)");
        context.fillStyle = haze;
        context.fillRect(0, 0, cssWidth, cssHeight);
    }
}

export class WorldGeometryRenderer {
    constructor() {
        this.cachedWorld = null;
        this.cachedSurfaces = Object.freeze([]);
    }

    draw({ context, scene, viewport, renderStats }) {
        const surfaces = this.surfaceEntries(scene.world);
        const visibleSurfaces = surfaces.filter(({ bounds }) => isVisible(viewport, bounds));
        for (const { surface } of visibleSurfaces) this.drawRock(context, surface);
        renderStats?.recordCollection("terrainSurfaces", surfaces.length, visibleSurfaces.length);
        this.drawCheckpoints(context, scene.world.checkpoints, scene.activeCheckpoint, viewport, renderStats);
        this.drawSummit(context, scene.world.summit, scene.runState, viewport);
    }

    surfaceEntries(world) {
        if (this.cachedWorld === world) return this.cachedSurfaces;
        this.cachedWorld = world;
        this.cachedSurfaces = Object.freeze(
            (world.surfaces ?? [])
                .filter(({ renderable }) => renderable !== false)
                .map((surface) => Object.freeze({ surface, bounds: boundsForVertices(surface.vertices) }))
        );
        return this.cachedSurfaces;
    }

    drawRock(context, surface) {
        const vertices = surface.vertices;
        context.fillStyle = COLORS.rock;
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let index = 1; index < vertices.length; index += 1) {
            context.lineTo(vertices[index].x, vertices[index].y);
        }
        context.closePath();
        context.fill();
        context.strokeStyle = COLORS.rockLight;
        context.lineWidth = 3;
        context.stroke();
        if (surface.oneWay) {
            context.strokeStyle = COLORS.oneWayEdge;
            context.lineWidth = 4;
            context.lineCap = "round";
            context.beginPath();
            context.moveTo(vertices[0].x, vertices[0].y);
            for (let index = 1; index <= surface.oneWayEdgeEnd; index += 1) {
                context.lineTo(vertices[index].x, vertices[index].y);
            }
            context.stroke();
            context.lineCap = "butt";
        }
        context.strokeStyle = "rgba(205, 198, 184, 0.2)";
        context.lineWidth = 2;
        context.beginPath();
        for (let index = 0; index < vertices.length; index += 2) {
            context.moveTo(vertices[index].x, vertices[index].y);
            context.lineTo(surface.x + surface.width * 0.5, surface.y + surface.height * 0.5);
        }
        context.stroke();
    }

    drawCheckpoints(context, checkpoints = [], activeCheckpoint, viewport, renderStats) {
        let drawn = 0;
        for (const checkpoint of checkpoints) {
            if (!isVisible(viewport, circleBounds(checkpoint, checkpoint.radius))) continue;
            drawn += 1;
            const active = checkpoint.id === activeCheckpoint?.id;
            const reached = checkpoint.level < (activeCheckpoint?.level ?? 0);
            drawCheckpointBeacon(context, checkpoint, { active, reached });
        }
        renderStats?.recordCollection("checkpoints", checkpoints.length, drawn);
    }

    drawSummit(context, summit, runState, viewport) {
        if (!summit || runState === "completed" || !isVisible(viewport, circleBounds(summit, summit.radius))) return;
        drawExitBeacon(context, summit);
    }
}

export class AuthoredWorldObjectRenderer {
    constructor({ presentationCatalog = DEFAULT_WORLD_OBJECT_MOCK_CATALOG } = {}) {
        this.presentationCatalog = presentationCatalog;
    }

    draw({ context, scene, viewport, renderStats }) {
        const objects = (scene.world.objects ?? []).filter(
            (object) => this.presentationFor(object)?.renderMode === "mock-shape"
        );
        const visible = objects.filter((object) => {
            const style = this.presentationFor(object);
            return isVisible(
                viewport,
                centeredBounds(object.position, { width: style.radius * 2, height: style.radius * 2 })
            );
        });
        for (const object of visible) this.drawObject(context, object, scene.worldProgress);
        const recoveryPoints = (scene.world.areas ?? []).flatMap(({ recoveryPoints }) => recoveryPoints ?? []);
        renderStats?.recordCollection("worldObjects", objects.length, visible.length);
        renderStats?.recordCollection("recoveryPoints", recoveryPoints.length, 0);
    }

    presentationFor(object) {
        return worldObjectPresentation(this.presentationCatalog, object.presentationId);
    }

    drawObject(context, object, progress = null) {
        const style = this.presentationFor(object);
        const objectiveComplete = object.objectiveId
            ? progress?.completedObjectiveIds?.includes(object.objectiveId)
            : false;
        const gateUnlocked = object.gateId ? progress?.unlockedGateIds?.includes(object.gateId) : false;
        context.save();
        context.translate(object.position.x, object.position.y);
        context.strokeStyle = style.color;
        context.fillStyle = `${style.color}${objectiveComplete || gateUnlocked ? "66" : "22"}`;
        context.lineWidth = objectiveComplete || gateUnlocked ? 5 : 3;

        if (object.kind === "terminal" || object.kind === "augment-node") {
            const width = style.radius * 1.7;
            const height = style.radius * 1.25;
            context.fillRect(-width, -height, width * 2, height * 2);
            context.strokeRect(-width, -height, width * 2, height * 2);
            context.fillStyle = objectiveComplete ? style.color : `${style.color}99`;
            context.fillRect(-width + 7, -height + 7, width * 2 - 14, 5);
            context.fillRect(-width + 7, -height + 17, width - 3, 4);
        } else if (object.kind === "gate") {
            context.setLineDash(gateUnlocked ? [10, 9] : []);
            context.strokeRect(-style.radius, -style.radius * 2.2, style.radius * 2, style.radius * 4.4);
            context.beginPath();
            context.moveTo(-style.radius, -style.radius * 2.2);
            context.lineTo(style.radius, style.radius * 2.2);
            context.moveTo(style.radius, -style.radius * 2.2);
            context.lineTo(-style.radius, style.radius * 2.2);
            context.stroke();
        } else if (object.kind === "grapple-landmark") {
            this.drawGrappleLandmark(context, style);
        } else if (object.kind === "wind-source") {
            this.drawWindSource(context, style);
        } else if (object.kind === "test-target") {
            this.drawTestTarget(context, style);
        } else if (object.kind === "story-display") {
            this.drawStoryDisplay(context, style);
        } else if (object.kind === "maintenance-frame") {
            this.drawMaintenanceFrame(context, style);
        } else {
            context.beginPath();
            context.moveTo(0, -style.radius);
            context.lineTo(style.radius, 0);
            context.lineTo(0, style.radius);
            context.lineTo(-style.radius, 0);
            context.closePath();
            context.fill();
            context.stroke();
        }

        if (object.label) {
            context.fillStyle = "#ecfeff";
            context.font = "900 11px ui-monospace, monospace";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(object.label, 0, -style.radius - 10);
        }
        context.restore();
    }

    drawGrappleLandmark(context, style) {
        const radius = style.radius;
        context.strokeStyle = "rgba(71, 85, 105, 0.85)";
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(0, -radius * 2.6);
        context.lineTo(0, -radius * 0.7);
        context.stroke();
        context.fillStyle = "#334155";
        context.fillRect(-7, -radius * 2.75, 14, 7);
        context.strokeStyle = "rgba(34, 211, 238, 0.72)";
        context.fillStyle = "#0f172a";
        context.fillRect(-radius * 0.52, -radius * 0.52, radius * 1.04, radius * 1.04);
        context.strokeRect(-radius * 0.52, -radius * 0.52, radius * 1.04, radius * 1.04);
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(-radius, -radius * 0.72);
        context.lineTo(-radius, radius * 0.72);
        context.lineTo(-radius * 0.46, radius * 0.72);
        context.moveTo(radius, -radius * 0.72);
        context.lineTo(radius, radius * 0.72);
        context.lineTo(radius * 0.46, radius * 0.72);
        context.stroke();
        context.fillStyle = "#67e8f9";
        context.fillRect(-4, -4, 8, 8);
    }

    drawWindSource(context, style) {
        const radius = style.radius;
        context.fillStyle = "#111827";
        context.fillRect(-radius, -radius, radius * 2, radius * 2);
        context.strokeRect(-radius, -radius, radius * 2, radius * 2);
        for (const [x, y, width, height] of [
            [-3, -radius + 5, 6, radius - 7],
            [3, 2, radius - 7, 6],
            [-3, 3, 6, radius - 7],
            [-radius + 5, -3, radius - 7, 6]
        ]) {
            context.fillStyle = style.color;
            context.fillRect(x, y, width, height);
        }
        context.fillStyle = "#e0f2fe";
        context.fillRect(-4, -4, 8, 8);
    }

    drawTestTarget(context, style) {
        const radius = style.radius;
        context.fillRect(-radius * 0.7, -radius, radius * 1.4, radius * 1.75);
        context.strokeRect(-radius * 0.7, -radius, radius * 1.4, radius * 1.75);
        context.beginPath();
        context.moveTo(-radius * 0.55, -radius * 0.45);
        context.lineTo(radius * 0.55, radius * 0.45);
        context.moveTo(radius * 0.55, -radius * 0.45);
        context.lineTo(-radius * 0.55, radius * 0.45);
        context.stroke();
    }

    drawStoryDisplay(context, style) {
        const width = style.radius * 1.8;
        const height = style.radius * 1.15;
        context.fillStyle = "#111827";
        context.fillRect(-width, -height, width * 2, height * 2);
        context.strokeRect(-width, -height, width * 2, height * 2);
        context.fillStyle = style.color;
        context.fillRect(-width + 7, -height + 7, width * 1.15, 4);
        context.fillRect(-width + 7, -height + 16, width * 0.75, 3);
    }

    drawMaintenanceFrame(context, style) {
        const radius = style.radius;
        context.fillStyle = "#111827";
        context.fillRect(-radius, -radius * 1.35, radius * 0.35, radius * 2.7);
        context.fillRect(radius * 0.65, -radius * 1.35, radius * 0.35, radius * 2.7);
        context.fillRect(-radius, -radius * 1.35, radius * 2, radius * 0.35);
        context.strokeRect(-radius, -radius * 1.35, radius * 2, radius * 2.7);
    }
}

export class AttachRangeRenderer {
    draw({ context, scene }) {
        const { player, maxAttachDistance, attachmentCandidate, rope } = scene;
        if (rope.isAttached || !attachmentCandidate) return;
        context.save();
        context.setLineDash([7, 10]);
        context.strokeStyle = "rgba(167, 243, 208, 0.2)";
        context.beginPath();
        context.arc(player.position.x, player.position.y, maxAttachDistance, 0, Math.PI * 2);
        context.stroke();
        context.restore();
    }
}

export class RopeRenderer {
    constructor(selectRopes) {
        if (typeof selectRopes !== "function") throw new Error("RopeRenderer requires selectRopes");
        this.selectRopes = selectRopes;
    }

    draw({ context, scene }) {
        for (const { rope, player } of this.selectRopes(scene)) drawRope(context, rope, player);
    }
}

export class SwingRenderer {
    draw({ context, scene }) {
        const swing = scene.swingDrag;
        const player = scene.player;
        if (!swing || swing.used || !swing.direction || swing.progress <= 0) return;
        const length = 28 + swing.progress * 34;
        const x = player.position.x + swing.direction.x * length;
        const y = player.position.y + swing.direction.y * length;
        context.save();
        context.globalAlpha = 0.35 + swing.progress * 0.65;
        context.strokeStyle = COLORS.ropeTense;
        context.fillStyle = COLORS.ropeTense;
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(player.position.x, player.position.y);
        context.lineTo(x, y);
        context.stroke();
        context.translate(x, y);
        context.rotate(Math.atan2(swing.direction.y, swing.direction.x));
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(-11, -6);
        context.lineTo(-11, 6);
        context.closePath();
        context.fill();
        context.restore();
    }
}

export class CombatEffectRenderer {
    draw({ context, scene }) {
        for (const effect of scene.combatEffects ?? []) {
            const progress = Math.min(1, effect.age / effect.lifetime);
            context.save();
            context.globalAlpha = Math.max(0, 1 - progress);
            if (effect.type === "ring") {
                context.strokeStyle = effect.color;
                context.lineWidth = 5 * (1 - progress) + 1;
                context.beginPath();
                context.arc(effect.position.x, effect.position.y, 8 + progress * 34 * effect.strength, 0, Math.PI * 2);
                context.stroke();
            } else if (effect.type === "particle") {
                context.fillStyle = effect.color;
                context.translate(effect.position.x, effect.position.y);
                context.rotate(Math.atan2(effect.velocity.y, effect.velocity.x));
                context.fillRect(-effect.size, -effect.size * 0.45, effect.size * 2, effect.size * 0.9);
            } else if (effect.type === "text") {
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.strokeStyle = "rgba(8, 11, 16, 0.9)";
                context.lineWidth = 4;
                context.fillStyle = effect.color;
                context.font = `${effect.emphasis ? 900 : 800} ${effect.emphasis ? 22 : 17}px system-ui, sans-serif`;
                context.strokeText(effect.text, effect.position.x, effect.position.y);
                context.fillText(effect.text, effect.position.x, effect.position.y);
            }
            context.restore();
        }
    }
}

export class EventEffectRenderer {
    draw({ context, scene }) {
        const event = scene.eventFlash;
        if (event?.type !== "rope-cut" || !event.position || event.age >= 0.6) return;
        const progress = event.age / 0.6;
        const radius = 10 + progress * 28;
        context.save();
        context.globalAlpha = 1 - progress;
        context.strokeStyle = "#fb7185";
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(event.position.x - radius, event.position.y - radius);
        context.lineTo(event.position.x + radius, event.position.y + radius);
        context.moveTo(event.position.x + radius, event.position.y - radius);
        context.lineTo(event.position.x - radius, event.position.y + radius);
        context.stroke();
        context.restore();
    }
}

export class AttachmentCandidateRenderer {
    draw({ context, scene }) {
        const candidate = scene.attachmentCandidate;
        if (!candidate) return;
        context.strokeStyle = COLORS.candidate;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(candidate.x, candidate.y, 11, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.moveTo(candidate.x - 16, candidate.y);
        context.lineTo(candidate.x + 16, candidate.y);
        context.moveTo(candidate.x, candidate.y - 16);
        context.lineTo(candidate.x, candidate.y + 16);
        context.stroke();
    }
}

export const localRopes = (scene) => [{ rope: scene.rope, player: scene.player }];
export const remoteRopes = (scene) => (scene.otherPlayers ?? []).map((player) => ({ rope: player.rope, player }));
