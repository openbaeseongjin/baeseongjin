import { ropeAttachmentPoint, ropeLaunchHandPoint } from "../../game/rope/RopeAttachment.js";
import { ROPE_CONFIG, ropeHookReach } from "../../game/config.js";
import { HARDPOINT_JAMMER_PHASE } from "../../game/world/HardpointJammerField.js";
import { windBladePhase } from "../../game/world/WorldForceField.js";
import { isSurfaceEnabledForProgress } from "../../game/world/WorldGateGeometry.js";
import { authoredRegionForPosition } from "../../game/world/AuthoredLandmarkResolver.js";
import { resolveAccessModuleTargets } from "../ScreenEdgeGuide.js";
import { boundsForVertices, circleBounds, isVisible } from "../RenderViewport.js";
import {
    DEFAULT_WORLD_OBJECT_MOCK_CATALOG,
    WORLD_OBJECT_SPRITE_STATE,
    worldObjectLocalBounds,
    worldObjectPresentation,
    worldObjectWorldBounds
} from "../assets/WorldObjectPresentationCatalog.js";
import { WorldObjectSpriteAssetCatalog } from "../assets/WorldObjectSpriteAssetCatalog.js";
import { worldObjectRenderer } from "../world-object/WorldObjectRendererDefinition.js";
import { drawCheckpointBeacon, drawExitBeacon } from "../world/WorldMarkerPrimitives.js";
import { drawElectricArc } from "../effects/ElectricArc.js";
import { SPELL_ID } from "../../game/spells/SpellDefinition.js";

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

const ATTACH_RANGE_STYLE = Object.freeze({
    stroke: "rgba(167, 243, 208, 0.2)",
    lineWidth: 2,
    lineDash: Object.freeze([])
});

const SPRITE_STATE_BY_OPENED = Object.freeze({
    false: WORLD_OBJECT_SPRITE_STATE.CLOSED,
    true: WORLD_OBJECT_SPRITE_STATE.OPENED
});

function drawRope(context, rope, player, { electrified = false, time = 0 } = {}) {
    if (!rope?.anchor) return;
    const attachment = ropeAttachmentPoint(player, rope);
    const tension = Math.min(1, rope.tension / 900);
    context.strokeStyle = tension > 0.42 ? COLORS.ropeTense : COLORS.ropeLoose;
    context.lineWidth = 2.5 + tension * 3;
    context.beginPath();
    context.moveTo(rope.anchor.x, rope.anchor.y);
    context.lineTo(attachment.x, attachment.y);
    context.stroke();
    if (electrified) drawElectricArc(context, rope.anchor, attachment, { time });
    context.fillStyle = "#f8fafc";
    context.beginPath();
    context.arc(rope.anchor.x, rope.anchor.y, 6 + tension * 3, 0, Math.PI * 2);
    context.fill();
}

function drawAreaBoundaryRing(
    context,
    { position, radius, color, fillColor = null, alpha = 1, lineWidth = 3, shadowBlur = 0 }
) {
    context.save();
    context.globalAlpha = alpha;
    context.globalCompositeOperation = "lighter";
    context.strokeStyle = color;
    context.fillStyle = fillColor ?? color;
    context.lineWidth = lineWidth;
    context.shadowColor = color;
    context.shadowBlur = shadowBlur;
    context.beginPath();
    context.arc(position.x, position.y, radius, 0, Math.PI * 2);
    if (fillColor) context.fill();
    context.stroke();
    context.restore();
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
        const surfaces = this.surfaceEntries(scene.world, scene.worldProgress);
        const visibleSurfaces = surfaces.filter(({ bounds }) => isVisible(viewport, bounds));
        for (const { surface } of visibleSurfaces) this.drawRock(context, surface);
        renderStats?.recordCollection("terrainSurfaces", surfaces.length, visibleSurfaces.length);
        const savepoints = scene.world.checkpoints?.length
            ? scene.world.checkpoints
            : (scene.world.respawnAnchors ?? []).map((anchor, level) => ({
                  id: anchor.id,
                  x: anchor.position.x,
                  y: anchor.position.y,
                  level: anchor.level ?? level,
                  radius: anchor.radius ?? 64,
                  label: anchor.label ?? "STAGE SAVE"
              }));
        const activeSavepoint =
            scene.activeCheckpoint ??
            (scene.activeRespawnAnchor
                ? {
                      id: scene.activeRespawnAnchor.id,
                      level:
                          scene.activeRespawnAnchor.level ??
                          scene.world.respawnAnchors?.findIndex(({ id }) => id === scene.activeRespawnAnchor.id) ??
                          0
                  }
                : null);
        this.drawCheckpoints(context, savepoints, activeSavepoint, viewport, renderStats);
        this.drawSummit(
            context,
            scene.world.summit,
            scene.runState,
            viewport,
            Boolean(scene.world.areas?.length || scene.world.landmarks?.length)
        );
    }

    surfaceEntries(world, progress) {
        if (this.cachedWorld !== world) {
            this.cachedWorld = world;
            this.cachedSurfaces = Object.freeze(
                (world.surfaces ?? [])
                    .filter(({ renderable }) => renderable !== false)
                    .map((surface) => Object.freeze({ surface, bounds: boundsForVertices(surface.vertices) }))
            );
        }
        return this.cachedSurfaces.filter(({ surface }) => isSurfaceEnabledForProgress(surface, progress));
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

    drawSummit(context, summit, runState, viewport, authoredWorld = false) {
        if (!summit || runState === "completed" || authoredWorld) return;
        if (!isVisible(viewport, circleBounds(summit, summit.radius))) return;
        drawExitBeacon(context, summit);
    }
}

const FAN_BLADE_SPEED = Math.PI * 2 * 3;

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

const ACCESS_SCAN_STYLE = Object.freeze({
    AVAILABLE: Object.freeze({ color: "#67e8f9", lineWidth: 3 }),
    WARNING: Object.freeze({ color: "#fbbf24", lineWidth: 5 }),
    LOCKED: Object.freeze({ color: "#fb5b45", lineWidth: 6 }),
    RESET: Object.freeze({ color: "#94a3b8", lineWidth: 3 })
});

function surfaceMidpoint(surface) {
    const vertices = surface.vertices;
    const total = vertices.reduce((sum, vertex) => ({ x: sum.x + vertex.x, y: sum.y + vertex.y }), { x: 0, y: 0 });
    return { x: total.x / vertices.length, y: total.y / vertices.length };
}

function drawAccessScanMarker(context, surface, state) {
    const style = ACCESS_SCAN_STYLE[state.phase] ?? ACCESS_SCAN_STYLE.RESET;
    const vertices = surface.vertices;
    const midpoint = surfaceMidpoint(surface);
    context.save();
    context.strokeStyle = style.color;
    context.fillStyle = style.color;
    context.lineWidth = style.lineWidth;
    context.setLineDash?.(state.phase === "WARNING" ? [12, 7] : state.phase === "RESET" ? [4, 8] : []);
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    for (let index = 1; index < vertices.length; index += 1) {
        context.lineTo(vertices[index].x, vertices[index].y);
    }
    if (vertices.length > 2) context.closePath();
    context.stroke();
    context.setLineDash?.([]);

    if (state.phase === "AVAILABLE") {
        context.beginPath();
        context.arc(midpoint.x, midpoint.y, 5, 0, Math.PI * 2);
        context.fill();
    } else if (state.phase === "WARNING") {
        context.beginPath();
        context.moveTo(midpoint.x - 10, midpoint.y - 8);
        context.lineTo(midpoint.x, midpoint.y + 2);
        context.lineTo(midpoint.x + 10, midpoint.y - 8);
        context.stroke();
    } else if (state.phase === "LOCKED") {
        context.beginPath();
        context.moveTo(midpoint.x - 9, midpoint.y - 9);
        context.lineTo(midpoint.x + 9, midpoint.y + 9);
        context.moveTo(midpoint.x + 9, midpoint.y - 9);
        context.lineTo(midpoint.x - 9, midpoint.y + 9);
        context.stroke();
    } else {
        context.strokeRect?.(midpoint.x - 8, midpoint.y - 8, 16, 16);
    }
    context.restore();
}

export class AccessScanSurfaceRenderer {
    draw({ context, scene, viewport, renderStats }) {
        const stateById = Object.freeze(
            Object.fromEntries((scene.accessScanStates ?? []).map((state) => [state.id, state]))
        );
        const surfaces = (scene.world.surfaces ?? []).filter(({ grappleAccessGroup }) => grappleAccessGroup);
        const visible = surfaces.filter(
            (surface) =>
                stateById[surface.grappleAccessGroup] && isVisible(viewport, boundsForVertices(surface.vertices))
        );
        for (const surface of visible) {
            drawAccessScanMarker(context, surface, stateById[surface.grappleAccessGroup]);
        }
        renderStats?.recordCollection("accessScanSurfaces", surfaces.length, visible.length);
    }
}

const JAMMER_SURFACE_STYLE = Object.freeze({
    [HARDPOINT_JAMMER_PHASE.WARNING]: Object.freeze({ color: "#fbbf24", lineWidth: 5, dash: [10, 6] }),
    [HARDPOINT_JAMMER_PHASE.ACTIVE]: Object.freeze({ color: "#d946ef", lineWidth: 7, dash: [] }),
    [HARDPOINT_JAMMER_PHASE.CLEAR]: Object.freeze({ color: "#67e8f9", lineWidth: 3, dash: [4, 8] })
});

export class HardpointJammerSurfaceRenderer {
    draw({ context, scene, viewport, renderStats }) {
        const surfaceById = Object.freeze(
            Object.fromEntries((scene.world.surfaces ?? []).map((surface) => [surface.id, surface]))
        );
        let drawn = 0;
        for (const state of scene.hardpointJammerStates ?? []) {
            const style = JAMMER_SURFACE_STYLE[state.phase];
            const surface = surfaceById[state.targetSurfaceId];
            if (!style || !surface || !isVisible(viewport, boundsForVertices(surface.vertices))) continue;
            drawn += 1;
            context.save();
            context.strokeStyle = style.color;
            context.lineWidth = style.lineWidth;
            context.setLineDash?.(style.dash);
            context.beginPath();
            context.moveTo(surface.vertices[0].x, surface.vertices[0].y);
            for (let index = 1; index < surface.vertices.length; index += 1) {
                context.lineTo(surface.vertices[index].x, surface.vertices[index].y);
            }
            context.closePath();
            context.stroke();
            context.restore();
        }
        renderStats?.recordCollection("hardpointJammerSurfaces", scene.hardpointJammerStates?.length ?? 0, drawn);
    }
}

export class AccessModuleSignalRenderer {
    draw({ context, scene, viewport, renderStats, presentationTimeSeconds = 0 }) {
        if (scene.hudVisible === false) return;
        const targets = resolveAccessModuleTargets({
            world: scene.world,
            worldProgress: scene.worldProgress,
            playerPosition: scene.player?.position
        });
        const visible = targets.filter(({ module }) => {
            const bounds = viewport.visibleWorldBounds;
            return (
                module.position.x >= bounds.minX &&
                module.position.x <= bounds.maxX &&
                module.position.y >= bounds.minY &&
                module.position.y <= bounds.maxY
            );
        });
        for (const { module, scale } of visible) {
            const pulse = 0.5 + Math.sin(presentationTimeSeconds * 7) * 0.15;
            context.save();
            context.translate(module.position.x, module.position.y - 56);
            context.scale(scale, scale);
            context.strokeStyle = `rgba(251, 191, 36, ${pulse + 0.25})`;
            context.fillStyle = "rgba(251, 191, 36, 0.18)";
            context.lineWidth = 3;
            context.beginPath();
            context.arc(0, 0, 18 + pulse * 5, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.fillStyle = "#fde68a";
            context.beginPath();
            context.moveTo(0, -12);
            context.lineTo(12, 0);
            context.lineTo(0, 12);
            context.lineTo(-12, 0);
            context.closePath();
            context.fill();
            context.stroke();
            context.restore();
        }
        renderStats?.recordCollection("accessModuleSignals", targets.length, visible.length);
    }
}

export class AuthoredWorldObjectRenderer {
    constructor({ presentationCatalog = DEFAULT_WORLD_OBJECT_MOCK_CATALOG, spriteAssets = null } = {}) {
        this.presentationCatalog = presentationCatalog;
        this.spriteAssets = spriteAssets ?? new WorldObjectSpriteAssetCatalog({ presentations: presentationCatalog });
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
            windZoneById: Object.freeze(Object.fromEntries(windZones.map((zone) => [zone.id, zone]))),
            windStateById: Object.freeze(Object.fromEntries(windStates.map((state) => [state.id, state])))
        };
        for (const object of visible) this.drawObject(context, object, scene, renderArgs);
        const recoveryPoints = (scene.world.areas ?? []).flatMap(({ recoveryPoints }) => recoveryPoints ?? []);
        renderStats?.recordCollection("worldObjects", objects.length, visible.length);
        renderStats?.recordCollection("recoveryPoints", recoveryPoints.length, 0);
    }

    presentationFor(object) {
        return worldObjectPresentation(this.presentationCatalog, object.presentationId);
    }

    sectorIdFor(object, scene) {
        if (object.landmarkId) {
            return (scene.world.landmarks ?? []).find(({ id }) => id === object.landmarkId)?.sectorId ?? null;
        }
        return (scene.world.areas ?? []).find(({ id }) => id === object.areaId)?.sectorId ?? null;
    }

    drawObject(context, object, scene, renderArgs = {}) {
        const style = this.presentationFor(object);
        const sectorId = this.sectorIdFor(object, scene);
        const progress = scene.worldProgress;
        const objectiveComplete = object.objectiveId
            ? progress?.completedObjectiveIds?.includes(object.objectiveId)
            : false;
        const gateUnlocked = object.routeLockId
            ? progress?.unlockedRouteIds?.includes(object.routeLockId)
            : object.gateId
              ? progress?.unlockedGateIds?.includes(object.gateId)
              : false;
        const requirementsComplete = (object.requiredObjectiveIds ?? []).every((objectiveId) =>
            progress?.completedObjectiveIds?.includes(objectiveId)
        );
        const bounds = worldObjectLocalBounds(object, style);
        context.save();
        context.translate(object.position.x, object.position.y);
        context.strokeStyle = style.color;
        context.fillStyle = `${style.color}${objectiveComplete || gateUnlocked ? "66" : "22"}`;
        context.lineWidth = objectiveComplete || gateUnlocked ? 5 : 3;

        const renderer = worldObjectRenderer(object.kind);
        renderer.draw({
            painter: this,
            context,
            object,
            scene,
            style,
            bounds,
            sectorId,
            objectiveComplete,
            gateUnlocked,
            requirementsComplete,
            renderArgs
        });
        if (renderer.drawsLabel && object.label) {
            context.fillStyle = "#ecfeff";
            context.font = "900 11px ui-monospace, monospace";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(object.label, 0, -style.radius - 10);
        }
        context.restore();
    }

    drawAccessTransitLock(context, object, scene, unlocked, presentationTimeSeconds) {
        const sector = (scene.world.sectors ?? []).find(({ id }) => id === object.sectorId);
        const moduleIds = sector?.accessModuleIds ?? [];
        const collected = Object.freeze(
            Object.fromEntries((scene.worldProgress?.collectedAccessModuleIds ?? []).map((id) => [id, true]))
        );
        const collectedCount = moduleIds.filter((id) => collected[id]).length;
        const requiredCount = object.requiredAccessModuleCount ?? sector?.accessModuleRequirement ?? 0;
        const remainingCount = Math.max(0, requiredCount - collectedCount);
        const routeObjectivesComplete = (object.requiredObjectiveIds ?? []).every((objectiveId) =>
            scene.worldProgress?.completedObjectiveIds?.includes(objectiveId)
        );
        const pulse = 0.62 + Math.sin(presentationTimeSeconds * 8) * 0.18;

        if (!unlocked) {
            for (const segment of object.barrierSegments ?? []) {
                const x = segment.x - object.position.x;
                const y = segment.y - object.position.y;
                context.fillStyle = `rgba(251, 191, 36, ${0.08 + pulse * 0.08})`;
                context.fillRect(x, y, segment.width, segment.height);
                context.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
                context.lineWidth = 3;
                context.setLineDash?.([18, 12]);
                context.strokeRect(x, y, segment.width, segment.height);
                context.setLineDash?.([]);
            }
        }

        context.fillStyle = unlocked ? "rgba(6, 78, 89, 0.88)" : "rgba(69, 26, 3, 0.92)";
        context.strokeStyle = unlocked ? "#67e8f9" : "#fbbf24";
        context.lineWidth = 4;
        context.fillRect(-54, -96, 108, 72);
        context.strokeRect(-54, -96, 108, 72);
        context.fillStyle = unlocked ? "#67e8f9" : "#fde68a";
        context.fillRect(-38, -78, 76, 8);
        context.fillRect(-38, -58, unlocked ? 76 : Math.max(8, (76 * collectedCount) / Math.max(1, requiredCount)), 8);
        context.font = "900 11px ui-monospace, monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(unlocked ? "ACCESS READY" : `ACCESS ${collectedCount}/${requiredCount}`, 0, -112);
        if (!unlocked) {
            context.font = "800 9px ui-monospace, monospace";
            context.fillText(
                remainingCount > 0
                    ? `NEED ${remainingCount} MODULE`
                    : routeObjectivesComplete
                      ? "SECTOR TRANSIT LOCKED"
                      : "ROUTE OBJECTIVE INCOMPLETE",
                0,
                -12
            );
        }
    }

    drawGate(context, style, bounds, unlocked, { sectorId = null } = {}) {
        if (this.drawWorldObjectSprite(context, style, bounds, SPRITE_STATE_BY_OPENED[unlocked])) return;
        if (sectorId === "sector-01") {
            this.drawSector01Gate(context, bounds, unlocked);
            return;
        }

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

    drawSector01Gate(context, bounds, unlocked) {
        const { x: left, y: top, width, height } = bounds;
        const right = left + width;
        const centerX = left + width * 0.5;
        const frame = "#0a121c";
        const frameEdge = "#344453";
        const recess = "#101c28";
        const seam = "#050b12";
        const amber = "#d97736";
        const cyan = "#67e8f9";

        context.fillStyle = frame;
        if (unlocked) {
            context.fillRect(left, top, 8, height);
            context.fillRect(right - 8, top, 8, height);
            context.fillRect(left, top, width, 9);
        } else {
            context.fillRect(left, top, width, height);
        }
        context.strokeStyle = unlocked ? "rgba(103, 232, 249, 0.64)" : frameEdge;
        context.lineWidth = 3;
        context.strokeRect(left, top, width, height);

        context.fillStyle = "#1d2b38";
        context.fillRect(left + 4, top + 4, 4, height - 8);
        context.fillRect(right - 8, top + 4, 4, height - 8);
        context.fillRect(left + 8, top + 4, width - 16, 5);

        context.fillStyle = amber;
        context.fillRect(left + 3, top + 4, 2, 2);
        context.fillRect(right - 5, top + 4, 2, 2);
        context.fillRect(left + 3, top + height - 6, 2, 2);
        context.fillRect(right - 5, top + height - 6, 2, 2);

        if (unlocked) {
            context.fillStyle = "rgba(103, 232, 249, 0.18)";
            context.fillRect(left + 9, top + 10, 3, height - 16);
            context.fillRect(right - 12, top + 10, 3, height - 16);
            context.fillStyle = cyan;
            context.fillRect(left + 4, top + 13, 2, 10);
            context.fillRect(right - 6, top + 13, 2, 10);
            context.fillRect(centerX - 5, top + 5, 10, 2);
            return;
        }

        context.fillStyle = recess;
        context.fillRect(left + 9, top + 10, width - 18, height - 14);
        context.fillStyle = seam;
        context.fillRect(centerX - 1, top + 11, 2, height - 16);
        context.fillStyle = "#263746";
        for (let panelY = top + 14; panelY < top + height - 8; panelY += 9) {
            context.fillRect(left + 11, panelY, width - 22, 3);
        }

        const lockTop = top + Math.floor(height * 0.5) - 5;
        context.fillStyle = "#070d14";
        context.fillRect(left + 7, lockTop, width - 14, 10);
        context.fillStyle = "#324655";
        context.fillRect(left + 10, lockTop + 3, width - 20, 4);
        context.fillStyle = "#111c27";
        context.fillRect(centerX - 5, lockTop - 2, 10, 14);
        context.strokeStyle = amber;
        context.lineWidth = 2;
        context.strokeRect(centerX - 5, lockTop - 2, 10, 14);
        context.fillStyle = amber;
        context.fillRect(centerX - 1, lockTop + 2, 2, 6);
        context.fillRect(right - 7, top + 12, 3, 5);
    }

    drawGatePanel(context, style, bounds, { blocked, ready, opened, sectorId = null }) {
        if (this.drawWorldObjectSprite(context, style, bounds, SPRITE_STATE_BY_OPENED[opened])) return;
        if (sectorId === "sector-01") {
            this.drawSector01GatePanel(context, bounds, { blocked, ready, opened });
            return;
        }

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

    drawSector01GatePanel(context, bounds, { blocked, ready, opened }) {
        const bodyWidth = 30;
        const bodyHeight = 27;
        const left = bounds.x + (bounds.width - bodyWidth) * 0.5;
        const top = bounds.y;
        const bottom = top + bodyHeight;
        const centerX = left + bodyWidth * 0.5;
        const statusColor = opened ? "#67e8f9" : ready ? "#f59e0b" : "#c65f43";

        context.strokeStyle = "#273746";
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(left + bodyWidth, top + 8);
        context.lineTo(bounds.x + bounds.width, top + 8);
        context.lineTo(bounds.x + bounds.width, top + 3);
        context.stroke();

        context.fillStyle = "#253542";
        context.fillRect(centerX - 3, bottom, 6, 15);
        context.fillStyle = "#111b24";
        context.fillRect(centerX - 8, bottom + 15, 16, 3);

        context.fillStyle = "#09121b";
        context.fillRect(left, top, bodyWidth, bodyHeight);
        context.fillStyle = "#1b2a36";
        context.fillRect(left + 3, top + 3, bodyWidth - 6, 5);
        context.fillRect(left + 3, top + bodyHeight - 5, bodyWidth - 6, 2);
        context.strokeStyle = statusColor;
        context.lineWidth = opened ? 3 : 2;
        context.strokeRect(left, top, bodyWidth, bodyHeight);

        context.fillStyle = "#314451";
        context.fillRect(left - 3, top + 5, 3, bodyHeight - 10);
        context.fillRect(left + bodyWidth, top + 5, 3, bodyHeight - 10);
        context.fillStyle = statusColor;
        context.fillRect(left + bodyWidth - 6, top + 4, 3, 3);

        if (opened) {
            context.fillStyle = "rgba(103, 232, 249, 0.18)";
            context.fillRect(left + 6, top + 10, bodyWidth - 12, 11);
            context.fillStyle = statusColor;
            context.fillRect(left + 7, top + 11, 4, 9);
            context.fillRect(left + bodyWidth - 11, top + 11, 4, 9);
            context.fillRect(centerX - 3, top + 9, 6, 2);
            return;
        }

        if (ready) {
            context.fillStyle = "#101a23";
            context.fillRect(left + 6, top + 10, bodyWidth - 12, 12);
            context.fillStyle = statusColor;
            context.fillRect(centerX - 2, top + 11, 4, 9);
            context.fillRect(centerX - 6, top + 13, 12, 3);
            context.fillRect(left + 6, top + 20, bodyWidth - 12, 2);
            return;
        }

        context.fillStyle = "#182631";
        context.fillRect(left + 5, top + 10, bodyWidth - 10, 12);
        context.fillStyle = "#30424e";
        context.fillRect(left + 7, top + 12, bodyWidth - 14, 2);
        context.fillRect(left + 7, top + 16, bodyWidth - 14, 2);
        context.fillRect(left + 7, top + 20, bodyWidth - 14, 2);
        context.fillStyle = statusColor;
        context.fillRect(centerX - 2, top + 13, 4, 7);
    }

    drawGrappleLandmark(context, style, { sectorId = null } = {}) {
        if (sectorId === "sector-01") {
            this.drawSector01GrappleLandmark(context, style);
            return;
        }

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

    drawSector01GrappleLandmark(context, style) {
        const radius = style.radius;

        context.fillStyle = "#172738";
        context.strokeStyle = "#526f84";
        context.lineWidth = 2;
        context.fillRect(-8, -radius - 3, 16, 5);
        context.strokeRect(-8, -radius - 3, 16, 5);
        context.fillStyle = "#263b4b";
        context.fillRect(-3, -radius + 1, 6, 5);

        context.fillStyle = "rgba(5, 12, 20, 0.98)";
        context.strokeStyle = "#58768b";
        context.lineWidth = 2.5;
        context.beginPath();
        context.moveTo(-radius * 0.68, -radius * 0.8);
        context.lineTo(radius * 0.68, -radius * 0.8);
        context.lineTo(radius * 0.94, -radius * 0.46);
        context.lineTo(radius * 0.94, radius * 0.46);
        context.lineTo(radius * 0.68, radius * 0.8);
        context.lineTo(-radius * 0.68, radius * 0.8);
        context.lineTo(-radius * 0.94, radius * 0.46);
        context.lineTo(-radius * 0.94, -radius * 0.46);
        context.closePath();
        context.fill();
        context.stroke();

        context.fillStyle = "#22384a";
        context.strokeStyle = "rgba(103, 232, 249, 0.42)";
        context.lineWidth = 1.5;
        context.fillRect(-radius - 1, -7, 5, 14);
        context.strokeRect(-radius - 1, -7, 5, 14);
        context.fillRect(radius - 4, -7, 5, 14);
        context.strokeRect(radius - 4, -7, 5, 14);

        context.strokeStyle = "rgba(100, 116, 139, 0.72)";
        context.lineWidth = 1;
        context.strokeRect(-8, -8, 16, 16);
        context.fillStyle = "#07111d";
        context.strokeStyle = "rgba(103, 232, 249, 0.78)";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(0, 0, 6.5, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.fillStyle = "#67e8f9";
        context.fillRect(-2, -2, 4, 4);
        context.fillStyle = "rgba(245, 158, 11, 0.78)";
        context.fillRect(-2, radius * 0.58, 4, 2);
    }

    drawWindSource(context, style, { zone = null, state = null, elapsedSeconds = 0 } = {}) {
        const radius = style.radius;
        const intensity = windVisualIntensity(zone, state);
        const bladeAngle = windBladePhase(zone, elapsedSeconds) * FAN_BLADE_SPEED;
        const innerRadius = radius * 0.67;
        const mountDirection = zone?.direction
            ? {
                  x: -Math.sign(zone.direction.x),
                  y: -Math.sign(zone.direction.y)
              }
            : { x: 0, y: 0 };

        // The shared wind source uses Sector 01's maintenance-machine language:
        // an armored octagonal housing, a recessed fan well, service fasteners,
        // and only a restrained cyan pressure readout. The wind simulation still
        // owns position, direction, timing, and blade phase.
        context.fillStyle = "#101c28";
        if (mountDirection.x !== 0) {
            const mountLeft = mountDirection.x > 0 ? radius * 0.72 : -radius;
            context.fillRect(mountLeft, -radius * 0.34, radius * 0.28, radius * 0.68);
            context.fillStyle = "#263b4b";
            context.fillRect(mountLeft, -radius * 0.26, radius * 0.28, radius * 0.12);
            context.fillRect(mountLeft, radius * 0.14, radius * 0.28, radius * 0.12);
        } else if (mountDirection.y !== 0) {
            const mountTop = mountDirection.y > 0 ? radius * 0.72 : -radius;
            context.fillRect(-radius * 0.34, mountTop, radius * 0.68, radius * 0.28);
            context.fillStyle = "#263b4b";
            context.fillRect(-radius * 0.26, mountTop, radius * 0.12, radius * 0.28);
            context.fillRect(radius * 0.14, mountTop, radius * 0.12, radius * 0.28);
        }

        context.fillStyle = "rgba(5, 12, 20, 0.98)";
        context.strokeStyle = "#526f84";
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(-radius * 0.72, -radius);
        context.lineTo(radius * 0.72, -radius);
        context.lineTo(radius, -radius * 0.72);
        context.lineTo(radius, radius * 0.72);
        context.lineTo(radius * 0.72, radius);
        context.lineTo(-radius * 0.72, radius);
        context.lineTo(-radius, radius * 0.72);
        context.lineTo(-radius, -radius * 0.72);
        context.closePath();
        context.fill();
        context.stroke();

        context.fillStyle = "#172738";
        context.fillRect(-radius * 0.72, -radius * 0.88, radius * 1.44, radius * 0.12);
        context.fillRect(-radius * 0.72, radius * 0.76, radius * 1.44, radius * 0.12);
        context.fillRect(-radius * 0.88, -radius * 0.56, radius * 0.12, radius * 1.12);
        context.fillRect(radius * 0.76, -radius * 0.56, radius * 0.12, radius * 1.12);

        context.fillStyle = "rgba(245, 158, 11, 0.72)";
        for (const [x, y] of [
            [-radius * 0.72, -radius * 0.72],
            [radius * 0.72, -radius * 0.72],
            [-radius * 0.72, radius * 0.72],
            [radius * 0.72, radius * 0.72]
        ]) {
            context.fillRect(x - 2, y - 2, 4, 4);
        }

        context.fillStyle = "#07111d";
        context.strokeStyle = "#3d5668";
        context.lineWidth = 5;
        context.beginPath();
        context.arc(0, 0, innerRadius, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.save();
        context.rotate(bladeAngle);
        context.fillStyle = `rgba(111, 132, 148, ${0.58 + intensity * 0.34})`;
        for (let index = 0; index < 4; index += 1) {
            context.rotate(Math.PI / 2);
            context.beginPath();
            context.moveTo(0, -innerRadius * 0.16);
            context.lineTo(innerRadius * 0.88, -innerRadius * 0.34);
            context.lineTo(innerRadius * 0.74, innerRadius * 0.08);
            context.lineTo(0, innerRadius * 0.16);
            context.closePath();
            context.fill();
        }
        context.restore();

        context.strokeStyle = "rgba(82, 111, 132, 0.72)";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(-innerRadius, 0);
        context.lineTo(innerRadius, 0);
        context.moveTo(0, -innerRadius);
        context.lineTo(0, innerRadius);
        context.stroke();

        context.fillStyle = "#111c27";
        context.strokeStyle = "#526f84";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.fillStyle = intensity > 0 ? "rgba(103, 232, 249, 0.9)" : "#4b5c69";
        context.beginPath();
        context.arc(0, 0, radius * 0.07, 0, Math.PI * 2);
        context.fill();

        const meterLeft = -radius * 0.27;
        const meterTop = radius * 0.82;
        for (let index = 0; index < 3; index += 1) {
            const lit = intensity >= (index + 1) / 3;
            context.fillStyle = lit ? "rgba(103, 232, 249, 0.72)" : "#263746";
            context.fillRect(meterLeft + index * radius * 0.2, meterTop, radius * 0.12, 3);
        }
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

    drawStoryDisplay(context, style, bounds) {
        if (this.drawWorldObjectSprite(context, style, bounds)) return;
        const width = bounds.width * 0.5;
        const height = bounds.height * 0.5;
        context.save();
        context.translate(bounds.x + width, bounds.y + height);
        context.fillStyle = "#111827";
        context.fillRect(-width, -height, width * 2, height * 2);
        context.strokeRect(-width, -height, width * 2, height * 2);
        context.fillStyle = style.color;
        context.fillRect(-width + 7, -height + 7, width * 1.15, 4);
        context.fillRect(-width + 7, -height + 16, width * 0.75, 3);
        context.restore();
    }

    drawWorldObjectSprite(context, style, bounds, state) {
        const image = this.spriteAssets.imageFor(style.id, state);
        if (!image) return false;
        context.imageSmoothingEnabled = false;
        context.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height);
        return true;
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
        context.setLineDash(ATTACH_RANGE_STYLE.lineDash);
        context.strokeStyle = ATTACH_RANGE_STYLE.stroke;
        context.lineWidth = ATTACH_RANGE_STYLE.lineWidth;
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

    draw({ context, scene, presentationTimeSeconds = 0 }) {
        for (const { rope, player, electrified = false } of this.selectRopes(scene)) {
            drawRope(context, rope, player, { electrified, time: presentationTimeSeconds });
        }
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
                const fadeStart = Math.max(0, Math.min(0.95, effect.fadeStart ?? 0));
                const fadeProgress = Math.max(0, (progress - fadeStart) / (1 - fadeStart));
                context.globalAlpha = Math.max(0, 1 - fadeProgress) * (effect.material?.opacity ?? 1);
                context.fillStyle = effect.material?.color ?? effect.color;
                context.globalCompositeOperation = effect.material?.blend === "additive" ? "lighter" : "source-over";
                if (effect.material?.glow) {
                    context.shadowColor = effect.material.color;
                    context.shadowBlur = effect.material.glow * 12;
                }
                context.translate(effect.position.x, effect.position.y);
                context.rotate(Math.atan2(effect.velocity.y, effect.velocity.x));
                if (effect.shape === "dot") {
                    context.beginPath();
                    context.arc(0, 0, effect.size, 0, Math.PI * 2);
                    context.fill();
                } else if (effect.shape === "streak") {
                    context.fillRect(-effect.size * 2.4, -effect.size * 0.35, effect.size * 4.8, effect.size * 0.7);
                } else {
                    context.beginPath();
                    context.moveTo(effect.size * 1.4, 0);
                    context.lineTo(-effect.size * 0.8, -effect.size * 0.7);
                    context.lineTo(-effect.size * 0.8, effect.size * 0.7);
                    context.closePath();
                    context.fill();
                }
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

export class SpellEffectRenderer {
    draw({ context, scene }) {
        for (const projectile of scene.augmentProjectiles ?? []) {
            if (projectile.spellId === SPELL_ID.METEOR) this.drawMeteor(context, projectile);
            if (projectile.spellId === SPELL_ID.ELECTRIC_ORB) this.drawElectricOrb(context, projectile);
        }
        for (const area of scene.augmentAreas ?? []) this.drawArea(context, area);
    }

    drawMeteor(context, projectile) {
        const radius = projectile.radius ?? 20;
        const tail = radius * 4;
        context.save();
        context.globalCompositeOperation = "lighter";
        context.strokeStyle = "#ff6b1a";
        context.shadowColor = "#ff3d00";
        context.shadowBlur = radius;
        context.lineWidth = radius * 1.2;
        context.beginPath();
        context.moveTo(projectile.position.x, projectile.position.y);
        context.lineTo(
            projectile.position.x - projectile.direction.x * tail,
            projectile.position.y - projectile.direction.y * tail
        );
        context.stroke();
        context.globalCompositeOperation = "source-over";
        context.fillStyle = "#3f2b24";
        context.strokeStyle = "#ffb347";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(projectile.position.x, projectile.position.y, radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.restore();
    }

    drawElectricOrb(context, projectile) {
        const radius = projectile.auraRadius ?? 175;
        drawAreaBoundaryRing(context, {
            position: projectile.position,
            radius,
            color: "rgba(96, 165, 250, 0.72)",
            fillColor: "rgba(34, 211, 238, 0.09)",
            lineWidth: 3
        });
        context.save();
        context.globalCompositeOperation = "lighter";
        context.fillStyle = "#e0f2fe";
        context.beginPath();
        context.arc(projectile.position.x, projectile.position.y, projectile.radius ?? 20, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }

    drawArea(context, area) {
        context.save();
        context.globalCompositeOperation = "lighter";
        if (area.spellId === SPELL_ID.THERMAL_LASER) {
            context.strokeStyle = "rgba(255, 92, 40, 0.7)";
            context.shadowColor = "#ff3d00";
            context.shadowBlur = 18;
            context.lineWidth = area.radius * 2;
            context.beginPath();
            context.moveTo(area.position.x, area.position.y);
            context.lineTo(
                area.position.x + area.direction.x * area.range,
                area.position.y + area.direction.y * area.range
            );
            context.stroke();
        } else if (area.spellId === SPELL_ID.FROST_BURST) {
            context.fillStyle = "rgba(111, 159, 255, 0.2)";
            context.beginPath();
            context.arc(area.position.x, area.position.y, area.radius, 0, Math.PI * 2);
            context.fill();
        } else if (area.spellId === SPELL_ID.ARCANE_SLASH) {
            const angle = Math.atan2(area.direction.y, area.direction.x);
            const half = (area.halfAngleDegrees * Math.PI) / 180;
            context.fillStyle = "rgba(226, 232, 240, 0.3)";
            context.beginPath();
            context.moveTo(area.position.x, area.position.y);
            context.arc(area.position.x, area.position.y, area.range, angle - half, angle + half);
            context.closePath();
            context.fill();
        }
        context.restore();
    }
}

const LARGE_AUGMENT_EFFECTS = Object.freeze({
    "collision-explosion-direct": true,
    "collision-explosion-splash": true,
    "meteor-splash": true,
    "shatter-splash": true,
    "gathering-splash": true,
    "electric-orb-aura": true
});

export class EventEffectRenderer {
    draw({ context, scene }) {
        for (const effect of scene.augmentEffects ?? []) this.drawAugmentEffect(context, effect);
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

    drawAugmentEffect(context, effect) {
        if (!effect.position) return;
        const progress = Math.min(1, effect.age / effect.lifetime);
        const alpha = Math.max(0, 1 - progress);
        if (effect.rangeRing && Number.isFinite(effect.radius) && effect.radius > 0) {
            drawAreaBoundaryRing(context, {
                position: effect.position,
                radius: effect.radius,
                color: effect.color,
                alpha: alpha * 0.7,
                lineWidth: Math.max(1, 6 * (1 - progress)),
                shadowBlur: 14 * (1 - progress)
            });
            return;
        }
        context.save();
        context.globalAlpha = alpha;
        context.globalCompositeOperation = "lighter";
        const large = Boolean(LARGE_AUGMENT_EFFECTS[effect.type]);
        const radius = (large ? 18 : 6) + progress * (large ? 92 : 24);
        context.strokeStyle = effect.type === "electrified-rope" ? "#a8e6ff" : "#fbbf24";
        context.shadowColor = context.strokeStyle;
        context.shadowBlur = large ? 12 : 7;
        context.lineWidth = Math.max(1, 5 * (1 - progress));
        context.beginPath();
        context.arc(effect.position.x, effect.position.y, radius, 0, Math.PI * 2);
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
        const handOffset = scene.ropeConfig?.handOffset ?? ROPE_CONFIG.handOffset;
        for (const entry of this.selectShots(scene)) this.drawShot(context, entry.shot, entry.player, handOffset);
    }

    drawShot(context, shot, player = null, handOffset = ROPE_CONFIG.handOffset) {
        const distance = Math.min(shot.traveled, ropeHookReach());
        const tip = shot.tip ?? {
            x: shot.origin.x + shot.direction.x * distance,
            y: shot.origin.y + shot.direction.y * distance
        };
        const angle = Math.atan2(shot.direction.y, shot.direction.x);
        const body = player?.position
            ? ropeLaunchHandPoint(player, handOffset, {
                  x: player.position.x + shot.direction.x,
                  y: player.position.y + shot.direction.y
              })
            : shot.origin;
        context.save();
        drawRopeShotLine(context, body, tip);
        drawRopeShotTrail(context, tip, shot.direction, distance);
        drawGrapplingHook(context, tip, angle, distance);
        drawRopeShotSparks(context, tip, distance);
        context.restore();
    }
}

export const localRopes = (scene) => [
    {
        rope: scene.rope,
        player: scene.player,
        electrified: (scene.selectedAugmentIds ?? []).includes("electrified-rope")
    }
];
export const remoteRopes = (scene) =>
    (scene.otherPlayers ?? []).map((player) => ({
        rope: player.rope,
        player,
        electrified: (player.selectedAugmentIds ?? []).includes("electrified-rope")
    }));
export const localShots = (scene) =>
    scene.ropeShot?.shot ? [{ shot: scene.ropeShot.shot, player: scene.player }] : [];
export const remoteShots = (scene) =>
    (scene.otherPlayers ?? [])
        .map((player) => ({ shot: player.launcher?.shot, player }))
        .filter(({ shot }) => shot !== null && shot !== undefined);
