import { ropeAttachmentPoint } from "../../game/rope/RopeAttachment.js";
import { ropeHookReach } from "../../game/config.js";
import { windBladePhase } from "../../game/world/WorldForceField.js";
import { boundsForVertices, circleBounds, isVisible } from "../RenderViewport.js";
import {
    DEFAULT_WORLD_OBJECT_MOCK_CATALOG,
    worldObjectLocalBounds,
    worldObjectPresentation,
    worldObjectWorldBounds
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
    candidate: "#a7f3d0",
    hookEye: "#e2e8f0",
    hookShank: "#94a3b8",
    hookClaw: "#cbd5e1",
    hookTip: "#f8fafc"
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

const FAN_BLADE_SPEED = Math.PI * 2 * 3;
const WIND_PARTICLE_SPEED_FACTOR = 0.2;
const WIND_PARTICLE_BASE_SPEED = 30;

function windVisualIntensity(zone, state) {
    if (!zone) return 0;
    if (zone.mode === "continuous") return state ? 1 : 0;
    if (!state) return 0;
    const cycle = zone.cycle;
    switch (state.phase) {
        case "lull":
            return 0;
        case "warning":
            return 0.3 + 0.2 * Math.min(1, state.phaseTime / Math.max(cycle.warning, 0.001));
        case "active":
            return 1;
        case "decay":
            return Math.max(0, 1 - state.phaseTime / Math.max(cycle.decay, 0.001));
        default:
            return 0;
    }
}

function drawWindStreaks(context, zone, intensity, timeSeconds) {
    if (!zone || intensity <= 0) return;
    const { bounds, direction } = zone;
    const horizontal = Math.abs(direction.x) >= Math.abs(direction.y);
    const sign = horizontal ? Math.sign(direction.x) || 1 : Math.sign(direction.y) || 1;
    const span = horizontal ? bounds.width : bounds.height;
    const crossSpan = horizontal ? bounds.height : bounds.width;
    const alongEdge = horizontal ? bounds.x : bounds.y;
    const crossEdge = horizontal ? bounds.y : bounds.x;
    if (span <= 0) return;
    const speed = WIND_PARTICLE_BASE_SPEED + zone.strength * intensity * WIND_PARTICLE_SPEED_FACTOR;
    const count = Math.round(3 + intensity * 6);
    const length = 10 + intensity * 14 + Math.min(1, zone.strength / 800) * 6;
    context.save();
    context.lineCap = "round";
    for (let index = 0; index < count; index += 1) {
        const seed = (((index * 0.37 + 0.13) % 1) + 1) % 1;
        const progress = (((seed + (timeSeconds * speed) / span) % 1) + 1) % 1;
        const alongPos = alongEdge + (sign > 0 ? progress * span : (1 - progress) * span);
        const crossPos = crossEdge + ((index * 0.61 + 0.29) % 1) * crossSpan;
        const alpha = (0.1 + 0.26 * intensity) * (0.5 + 0.5 * ((index % 3) / 3));
        const x = horizontal ? alongPos : crossPos;
        const y = horizontal ? crossPos : alongPos;
        const dx = horizontal ? sign * length : 0;
        const dy = horizontal ? 0 : sign * length;
        context.strokeStyle = `rgba(226, 232, 240, ${alpha})`;
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + dx, y + dy);
        context.stroke();
    }
    context.restore();
}

export class WindParticleRenderer {
    draw({ context, scene, presentationTimeSeconds = 0 }) {
        const windZones = scene.world.windZones ?? [];
        const windStates = scene.windStates ?? [];
        const stateById = new Map(windStates.map((state) => [state.id, state]));
        for (const zone of windZones) {
            const intensity = windVisualIntensity(zone, stateById.get(zone.id) ?? null);
            drawWindStreaks(context, zone, intensity, presentationTimeSeconds);
        }
    }
}

export class AuthoredWorldObjectRenderer {
    constructor({ presentationCatalog = DEFAULT_WORLD_OBJECT_MOCK_CATALOG } = {}) {
        this.presentationCatalog = presentationCatalog;
    }

    draw({ context, scene, viewport, renderStats, presentationTimeSeconds = 0 }) {
        const objects = (scene.world.objects ?? []).filter(
            (object) => this.presentationFor(object)?.renderMode === "mock-shape"
        );
        const visible = objects.filter((object) => {
            const style = this.presentationFor(object);
            return isVisible(viewport, worldObjectWorldBounds(object, style));
        });
        const elapsedSeconds = Number.isFinite(scene.tick) ? scene.tick / 120 : presentationTimeSeconds;
        const windZones = scene.world.windZones ?? [];
        const windStates = scene.windStates ?? [];
        const renderArgs = {
            presentationTimeSeconds,
            elapsedSeconds,
            windZoneById: new Map(windZones.map((zone) => [zone.id, zone])),
            windStateById: new Map(windStates.map((state) => [state.id, state]))
        };
        for (const object of visible) this.drawObject(context, object, scene, renderArgs);
        const recoveryPoints = (scene.world.areas ?? []).flatMap(({ recoveryPoints }) => recoveryPoints ?? []);
        renderStats?.recordCollection("worldObjects", objects.length, visible.length);
        renderStats?.recordCollection("recoveryPoints", recoveryPoints.length, 0);
    }

    presentationFor(object) {
        return worldObjectPresentation(this.presentationCatalog, object.presentationId);
    }

    drawObject(context, object, scene, renderArgs = {}) {
        const style = this.presentationFor(object);
        const progress = scene.worldProgress;
        const objectiveComplete = object.objectiveId
            ? progress?.completedObjectiveIds?.includes(object.objectiveId)
            : false;
        const gateUnlocked = object.gateId ? progress?.unlockedGateIds?.includes(object.gateId) : false;
        const requirementsComplete = (object.requiredObjectiveIds ?? []).every((objectiveId) =>
            progress?.completedObjectiveIds?.includes(objectiveId)
        );
        const bounds = worldObjectLocalBounds(object, style);
        context.save();
        context.translate(object.position.x, object.position.y);
        context.strokeStyle = style.color;
        context.fillStyle = `${style.color}${objectiveComplete || gateUnlocked ? "66" : "22"}`;
        context.lineWidth = objectiveComplete || gateUnlocked ? 5 : 3;

        if (object.kind === "gate-panel") {
            this.drawGatePanel(context, style, bounds, {
                blocked: !requirementsComplete,
                ready: requirementsComplete && !objectiveComplete,
                opened: gateUnlocked || objectiveComplete
            });
        } else if (object.kind === "gate") {
            this.drawGate(context, style, bounds, gateUnlocked);
        } else {
            context.translate(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5);
            if (object.kind === "augment-node") {
                this.drawAugmentNode(context, style, bounds, objectiveComplete);
            } else if (object.kind === "terminal") {
                const width = style.radius * 1.7;
                const height = style.radius * 1.25;
                context.fillRect(-width, -height, width * 2, height * 2);
                context.strokeRect(-width, -height, width * 2, height * 2);
                context.fillStyle = objectiveComplete ? style.color : `${style.color}99`;
                context.fillRect(-width + 7, -height + 7, width * 2 - 14, 5);
                context.fillRect(-width + 7, -height + 17, width - 3, 4);
            } else if (object.kind === "grapple-landmark") {
                this.drawGrappleLandmark(context, style);
            } else if (object.kind === "wind-source") {
                this.drawWindSource(context, style, {
                    zone: renderArgs.windZoneById?.get(object.windZoneId) ?? null,
                    state: renderArgs.windStateById?.get(object.windZoneId) ?? null,
                    elapsedSeconds: renderArgs.elapsedSeconds ?? 0
                });
            } else if (object.kind === "test-target") {
                this.drawTestTarget(context, style, {
                    contactRegistered:
                        scene.eventFlash?.type === "foundation-shear-hit" && scene.eventFlash.targetId === object.id,
                    age: scene.eventFlash?.age ?? 0
                });
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
        }
        context.restore();
    }

    drawGate(context, style, bounds, unlocked) {
        const { x: left, y: top, width, height } = bounds;
        const railWidth = 6;

        context.fillStyle = "#0b1220";
        if (unlocked) {
            context.fillRect(left, top, 5, height);
            context.fillRect(left + width - 5, top, 5, height);
            context.fillRect(left, top, width, 5);
            context.fillRect(left, top + height - 5, width, 5);
        } else {
            context.fillRect(left, top, width, height);
        }
        context.strokeStyle = unlocked ? "#67e8f9" : style.color;
        context.lineWidth = unlocked ? 4 : 3;
        context.strokeRect(left, top, width, height);

        context.fillStyle = unlocked ? "rgba(103, 232, 249, 0.24)" : `${style.color}44`;
        context.fillRect(left + 5, top + 5, railWidth, height - 10);
        context.fillRect(left + width - railWidth - 5, top + 5, railWidth, height - 10);
        context.fillRect(left + 5, top + 5, width - 10, 7);

        if (!unlocked) {
            context.fillStyle = "rgba(15, 23, 42, 0.96)";
            context.fillRect(left + railWidth + 5, top + 12, width - railWidth * 2 - 10, height - 17);
            context.fillStyle = `${style.color}55`;
            context.fillRect(-2, top + 15, 4, height - 22);
            for (let panelY = top + 24; panelY < top + height - 8; panelY += 15) {
                context.fillRect(left + railWidth + 8, panelY, width - railWidth * 2 - 16, 3);
            }
        }

        context.fillStyle = unlocked ? "#67e8f9" : style.color;
        context.fillRect(left + width - 10, top + 8, 5, 7);
    }

    drawGatePanel(context, style, bounds, { blocked, ready, opened }) {
        const bodyWidth = 28;
        const bodyHeight = 26;
        const left = bounds.x + (bounds.width - bodyWidth) * 0.5;
        const top = bounds.y;
        const bottom = top + bodyHeight;
        const statusColor = opened ? "#67e8f9" : ready ? style.color : "#fb7185";

        context.strokeStyle = "#475569";
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(bodyWidth * 0.5, top + 8);
        context.lineTo(bounds.x + bounds.width, top + 8);
        context.lineTo(bounds.x + bounds.width, top + 2);
        context.stroke();
        context.fillStyle = "#334155";
        context.fillRect(-2.5, bottom, 5, 16);
        context.fillRect(-8, bottom + 16, 16, 3);

        context.fillStyle = "#0b1220";
        context.fillRect(left, top, bodyWidth, bodyHeight);
        context.strokeStyle = statusColor;
        context.lineWidth = opened ? 4 : 3;
        context.strokeRect(left, top, bodyWidth, bodyHeight);

        context.fillStyle = statusColor;
        context.fillRect(left + 5, top + 5, bodyWidth - 10, 4);
        context.fillRect(left + 5, top + 12, blocked ? 10 : 16, 3);
        context.fillRect(left + 5, top + 18, opened ? 16 : 12, 2);
        context.fillRect(left + bodyWidth - 7, top + bodyHeight - 7, 3, 3);
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

    drawWindSource(context, style, { zone = null, state = null, elapsedSeconds = 0 } = {}) {
        const radius = style.radius;
        const intensity = windVisualIntensity(zone, state);
        const bladeAngle = windBladePhase(zone, elapsedSeconds) * FAN_BLADE_SPEED;

        context.fillStyle = "#0f172a";
        context.strokeStyle = "#334155";
        context.lineWidth = 6;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.strokeStyle = "rgba(251, 146, 60, 0.55)";
        context.lineWidth = 3;
        for (let index = 0; index < 8; index += 1) {
            const angle = (index * Math.PI * 2) / 8;
            context.beginPath();
            context.moveTo(Math.cos(angle) * (radius - 3), Math.sin(angle) * (radius - 3));
            context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            context.stroke();
        }

        context.save();
        context.rotate(bladeAngle);
        context.fillStyle = `rgba(148, 163, 184, ${0.55 + intensity * 0.4})`;
        for (let index = 0; index < 4; index += 1) {
            context.rotate(Math.PI / 2);
            context.beginPath();
            context.moveTo(0, -radius * 0.12);
            context.lineTo(radius * 0.8, -radius * 0.05);
            context.lineTo(radius * 0.8, radius * 0.05);
            context.lineTo(0, radius * 0.12);
            context.closePath();
            context.fill();
        }
        context.restore();

        if (intensity > 0) {
            context.strokeStyle = `rgba(125, 211, 252, ${0.16 + intensity * 0.3})`;
            context.lineWidth = 2;
            context.beginPath();
            context.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
            context.stroke();
        }

        context.fillStyle = "#1f2937";
        context.strokeStyle = "#475569";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.fillStyle = intensity > 0 ? "#67e8f9" : "#64748b";
        context.beginPath();
        context.arc(0, 0, radius * 0.08, 0, Math.PI * 2);
        context.fill();
    }

    drawAugmentNode(context, style, bounds, objectiveComplete) {
        const width = bounds.width;
        const height = bounds.height;
        const left = -width * 0.5;
        const top = -height * 0.5;

        context.fillStyle = "#111827";
        context.strokeStyle = objectiveComplete ? "#67e8f9" : style.color;
        context.lineWidth = objectiveComplete ? 5 : 3;
        context.fillRect(left, top, width, height);
        context.strokeRect(left, top, width, height);

        context.fillStyle = "#0b1220";
        context.fillRect(left + 14, top + 13, width - 28, 39);
        context.strokeStyle = "rgba(103, 232, 249, 0.72)";
        context.lineWidth = 2;
        context.strokeRect(left + 14, top + 13, width - 28, 39);
        context.fillStyle = objectiveComplete ? "#67e8f9" : "#e9d5ff";
        context.font = "900 10px ui-monospace, monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(objectiveComplete ? "PROFILE COMMITTED" : "EMERGENCY PROFILES", 0, top + 27);
        context.fillStyle = "#94a3b8";
        context.font = "800 8px ui-monospace, monospace";
        context.fillText("GRAPPLE TELEMETRY LINK", 0, top + 42);

        const slots = [
            { label: "IMPULSE", color: "#fbbf24" },
            { label: "RELAY", color: "#67e8f9" },
            { label: "SHEAR", color: "#a3e635" }
        ];
        for (const [index, slot] of slots.entries()) {
            const slotWidth = 42;
            const x = -slotWidth * 1.5 - 5 + index * (slotWidth + 5);
            context.fillStyle = `${slot.color}22`;
            context.fillRect(x, top + 62, slotWidth, 30);
            context.strokeStyle = slot.color;
            context.lineWidth = 2;
            context.strokeRect(x, top + 62, slotWidth, 30);
            context.fillStyle = slot.color;
            context.font = "900 7px ui-monospace, monospace";
            context.fillText(slot.label, x + slotWidth * 0.5, top + 78);
        }

        context.strokeStyle = "#475569";
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(left + 18, height * 0.5);
        context.lineTo(left + 8, height * 0.72);
        context.moveTo(-left - 18, height * 0.5);
        context.lineTo(-left - 8, height * 0.72);
        context.stroke();
        context.fillStyle = objectiveComplete ? "#67e8f9" : "#fbbf24";
        context.fillRect(-5, top + 101, 10, 7);
    }

    drawTestTarget(context, style, { contactRegistered = false, age = 0 } = {}) {
        const radius = style.radius;
        context.fillStyle = contactRegistered ? "rgba(163, 230, 53, 0.42)" : "#111827";
        context.strokeStyle = contactRegistered ? "#f8fafc" : style.color;
        context.lineWidth = contactRegistered ? 5 : 3;
        context.beginPath();
        context.arc(0, -radius * 0.65, radius * 0.28, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.fillRect(-radius * 0.48, -radius * 0.3, radius * 0.96, radius * 1.2);
        context.strokeRect(-radius * 0.48, -radius * 0.3, radius * 0.96, radius * 1.2);
        context.beginPath();
        context.moveTo(-radius * 0.95, 0);
        context.lineTo(-radius * 0.48, radius * 0.15);
        context.moveTo(radius * 0.95, 0);
        context.lineTo(radius * 0.48, radius * 0.15);
        context.moveTo(-radius * 0.3, radius * 0.9);
        context.lineTo(-radius * 0.42, radius * 1.35);
        context.moveTo(radius * 0.3, radius * 0.9);
        context.lineTo(radius * 0.42, radius * 1.35);
        context.stroke();
        context.fillStyle = style.color;
        context.font = "900 7px ui-monospace, monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("CAL", 0, radius * 0.27);

        if (!contactRegistered) return;
        const sparkRadius = radius * (1.15 + Math.min(0.6, age * 2));
        context.strokeStyle = "#fef08a";
        context.lineWidth = 3;
        for (let index = 0; index < 8; index += 1) {
            const angle = (Math.PI * 2 * index) / 8;
            context.beginPath();
            context.moveTo(Math.cos(angle) * sparkRadius * 0.62, Math.sin(angle) * sparkRadius * 0.62);
            context.lineTo(Math.cos(angle) * sparkRadius, Math.sin(angle) * sparkRadius);
            context.stroke();
        }
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
        if (scene.ropeShot?.shot) return;
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
        if (!candidate || scene.ropeShot?.shot) return;
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

const ROPE_SHOT_LINE_WIDTH = 2;
const ROPE_SHOT_TRAIL_WIDTH = 4;
const HOOK_LENGTH = 15;
const HOOK_SPIN_PER_PIXEL = 0.02;

function drawRopeShotLine(context, start, tip) {
    const gradient = context.createLinearGradient(start.x, start.y, tip.x, tip.y);
    gradient.addColorStop(0, "rgba(125, 211, 252, 0.6)");
    gradient.addColorStop(0.5, "rgba(125, 211, 252, 0.85)");
    gradient.addColorStop(1, "#bae6fd");
    context.strokeStyle = gradient;
    context.lineWidth = ROPE_SHOT_LINE_WIDTH;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(tip.x, tip.y);
    context.stroke();
    context.lineCap = "butt";
}

function drawRopeShotTrail(context, tip, direction, distance) {
    const progress = Math.min(1, distance / ropeHookReach());
    const trailLength = 14 + progress * 14;
    const tail = {
        x: tip.x - direction.x * trailLength,
        y: tip.y - direction.y * trailLength
    };
    const gradient = context.createLinearGradient(tail.x, tail.y, tip.x, tip.y);
    gradient.addColorStop(0, "rgba(125, 211, 252, 0)");
    gradient.addColorStop(1, "rgba(224, 242, 254, 0.32)");
    context.strokeStyle = gradient;
    context.lineWidth = ROPE_SHOT_TRAIL_WIDTH;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(tail.x, tail.y);
    context.lineTo(tip.x, tip.y);
    context.stroke();
    context.lineCap = "butt";
}

function drawGrapplingHook(context, tip, angle, distance) {
    context.translate(tip.x, tip.y);
    context.rotate(angle + distance * HOOK_SPIN_PER_PIXEL);

    context.strokeStyle = COLORS.hookEye;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(-HOOK_LENGTH * 0.5, 0, 3.4, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = COLORS.hookShank;
    context.beginPath();
    context.moveTo(HOOK_LENGTH, -2);
    context.lineTo(-HOOK_LENGTH * 0.18, -2.4);
    context.lineTo(-HOOK_LENGTH * 0.18, 2.4);
    context.lineTo(HOOK_LENGTH, 2);
    context.closePath();
    context.fill();

    context.strokeStyle = COLORS.hookClaw;
    context.lineWidth = 2.4;
    context.lineCap = "round";
    for (const spread of [-1, 1]) {
        context.beginPath();
        context.moveTo(HOOK_LENGTH * 0.42, spread * 1.6);
        context.quadraticCurveTo(
            -HOOK_LENGTH * 0.5,
            spread * HOOK_LENGTH * 0.6,
            -HOOK_LENGTH * 0.12,
            spread * HOOK_LENGTH * 0.42
        );
        context.stroke();
    }
    context.lineCap = "butt";

    context.fillStyle = COLORS.hookTip;
    context.beginPath();
    context.arc(HOOK_LENGTH, 0, 1.8, 0, Math.PI * 2);
    context.fill();
}

function drawRopeShotSparks(context, tip, distance) {
    const flicker = 0.5 + 0.5 * Math.sin(distance * 0.11);
    context.fillStyle = `rgba(224, 242, 254, ${0.32 + flicker * 0.38})`;
    for (let index = 0; index < 3; index += 1) {
        const sparkAngle = distance * 0.09 + (index * Math.PI * 2) / 3;
        const radius = 6 + (index % 2) * 2.5;
        context.beginPath();
        context.arc(tip.x + Math.cos(sparkAngle) * radius, tip.y + Math.sin(sparkAngle) * radius, 1.2, 0, Math.PI * 2);
        context.fill();
    }
}

export class RopeShotRenderer {
    constructor(selectShots) {
        if (typeof selectShots !== "function") throw new Error("RopeShotRenderer requires selectShots");
        this.selectShots = selectShots;
    }

    draw({ context, scene }) {
        for (const entry of this.selectShots(scene)) this.drawShot(context, entry.shot, entry.player);
    }

    drawShot(context, shot, player = null) {
        const distance = Math.min(shot.traveled, ropeHookReach());
        const tip = {
            x: shot.origin.x + shot.direction.x * distance,
            y: shot.origin.y + shot.direction.y * distance
        };
        const angle = Math.atan2(shot.direction.y, shot.direction.x);
        const body = player?.position ?? shot.origin;
        context.save();
        drawRopeShotLine(context, body, tip);
        drawRopeShotTrail(context, tip, shot.direction, distance);
        drawGrapplingHook(context, tip, angle, distance);
        drawRopeShotSparks(context, tip, distance);
        context.restore();
    }
}

export const localRopes = (scene) => [{ rope: scene.rope, player: scene.player }];
export const remoteRopes = (scene) => (scene.otherPlayers ?? []).map((player) => ({ rope: player.rope, player }));
export const localShots = (scene) =>
    scene.ropeShot?.shot ? [{ shot: scene.ropeShot.shot, player: scene.player }] : [];
export const remoteShots = (scene) =>
    (scene.otherPlayers ?? [])
        .map((player) => ({ shot: player.launcher?.shot, player }))
        .filter(({ shot }) => shot !== null && shot !== undefined);
