import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { boundsForVertices, boundsIntersect, circleBounds, intersectBounds, isVisible } from "../../RenderViewport.js";
import { currentAuthoredArea, sceneEnvironmentZone } from "../AltitudeZoneResolver.js";
import { drawCheckpointBeacon, drawExitBeacon } from "../../world/WorldMarkerPrimitives.js";
import { isSurfaceEnabledForProgress } from "../../../game/world/WorldGateGeometry.js";

export class PixelTerrainRenderer {
    constructor({ definition, assets }) {
        this.definition = definition;
        this.assets = assets;
        this.status = assets ? "ready" : "pending";
        this.cachedWorld = null;
        this.cachedSurfaces = Object.freeze([]);
    }

    draw({ context, scene, viewport, renderStats }) {
        const zone = sceneEnvironmentZone(this.definition, scene);
        const material = this.definition.materialFor(zone);
        const palette = zone.palette;
        const authoredArea = currentAuthoredArea(scene);
        const surfaces = this.surfaceEntries(scene.world, scene.worldProgress);
        const visibleSurfaces = surfaces.filter(({ bounds }) => isVisible(viewport, bounds));

        for (const entry of visibleSurfaces) {
            this.drawSurface(context, entry, material, palette, viewport, authoredArea?.sectorId);
        }
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
        this.drawSummit(context, scene.world.summit, scene.runState, viewport);
    }

    surfaceEntries(world, progress) {
        if (this.cachedWorld !== world) {
            this.cachedWorld = world;
            this.cachedSurfaces = Object.freeze(
                (world.surfaces ?? [])
                    .filter(({ renderable }) => renderable !== false)
                    .map((surface) =>
                        Object.freeze({
                            surface,
                            bounds: boundsForVertices(surface.vertices),
                            edges: Object.freeze(
                                surface.vertices.map((start, index) => {
                                    const end = surface.vertices[(index + 1) % surface.vertices.length];
                                    const dx = end.x - start.x;
                                    const dy = end.y - start.y;
                                    return Object.freeze({
                                        start,
                                        end,
                                        dx,
                                        dy,
                                        length: Math.hypot(dx, dy),
                                        bounds: boundsForVertices([start, end])
                                    });
                                })
                            )
                        })
                    )
            );
        }
        return this.cachedSurfaces.filter(({ surface }) => isSurfaceEnabledForProgress(surface, progress));
    }

    drawSurface(context, entry, material, palette, viewport, sectorId = null) {
        const { surface, bounds } = entry;
        const vertices = surface.vertices;

        if (sectorId === "sector-01" && surface.presentationId === "terrain:ground-foundation") {
            this.drawGroundFoundation(context, bounds);
        }

        if (this.assets && this.assets.isReady(material.fill.atlasId)) {
            this.fillSurfaceWithTiles(context, vertices, bounds, material, viewport);
        } else {
            context.fillStyle = palette.terrainFill;
            this.traceSurfacePath(context, vertices);
            context.fill();
        }

        if (sectorId === "sector-01" || sectorId === "sector-02") {
            this.drawAuthoredStructure(context, vertices, bounds, sectorId, surface);
        }
        this.drawSurfaceEdgeTiles(context, entry, material, viewport, sectorId);

        const subtleSector01OneWay = sectorId === "sector-01" && surface.oneWay;
        context.strokeStyle = subtleSector01OneWay ? "rgba(61, 84, 100, 0.72)" : palette.terrainEdge;
        context.lineWidth = subtleSector01OneWay ? 2 : 3;
        this.traceSurfacePath(context, vertices);
        context.stroke();

        if (surface.oneWay) {
            context.strokeStyle = subtleSector01OneWay
                ? "rgba(125, 166, 176, 0.62)"
                : (material.oneWayColor ?? palette.oneWayEdge);
            context.lineWidth = subtleSector01OneWay ? 2 : 4;
            context.lineCap = subtleSector01OneWay ? "butt" : "round";
            if (subtleSector01OneWay && surface.presentationId !== "terrain:ground-foundation") {
                context.setLineDash([12, 6]);
            }
            context.beginPath();
            context.moveTo(vertices[0].x, vertices[0].y);
            const edgeEnd = surface.oneWayEdgeEnd ?? 1;
            for (let i = 1; i <= edgeEnd && i < vertices.length; i += 1) {
                context.lineTo(vertices[i].x, vertices[i].y);
            }
            context.stroke();
            context.setLineDash([]);
            context.lineCap = "butt";
        }
    }

    drawGroundFoundation(context, bounds) {
        const width = bounds.maxX - bounds.minX;
        const top = bounds.minY + 4;
        const depth = 640;
        if (width <= 0) return;

        context.save();
        context.fillStyle = "rgba(3, 9, 16, 0.99)";
        context.fillRect(bounds.minX, top, width, depth);
        context.fillStyle = "rgba(18, 31, 44, 0.98)";
        context.fillRect(bounds.minX + 8, top + 12, Math.max(0, width - 16), depth - 12);

        context.fillStyle = "rgba(5, 13, 22, 0.92)";
        for (let x = bounds.minX + 28; x < bounds.maxX - 12; x += 64) {
            context.fillRect(x, top + 12, 8, depth - 12);
        }
        for (let y = top + 64; y < top + depth; y += 64) {
            context.fillRect(bounds.minX + 8, y, Math.max(0, width - 16), 4);
        }

        context.fillStyle = "rgba(103, 232, 249, 0.12)";
        context.fillRect(bounds.minX + 12, top + 18, 4, depth - 34);
        context.fillRect(bounds.maxX - 16, top + 18, 4, depth - 34);
        context.fillStyle = "rgba(245, 158, 11, 0.46)";
        for (let x = bounds.minX + 18; x < bounds.maxX - 18; x += 48) {
            context.fillRect(x, top + 18, 18, 4);
        }
        context.restore();
    }

    drawAuthoredStructure(context, vertices, bounds, sectorId, surface) {
        if (sectorId === "sector-01") {
            this.drawSector01Structure(context, vertices, bounds, surface);
            return;
        }

        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        if (width <= 0 || height <= 0) return;
        context.save();
        this.traceSurfacePath(context, vertices);
        context.clip();
        context.fillStyle = "rgba(34, 28, 22, 0.48)";
        context.fillRect(bounds.minX, bounds.minY + Math.min(4, height * 0.2), width, height);
        context.strokeStyle = "rgba(253, 230, 138, 0.12)";
        context.lineWidth = 1;
        context.beginPath();
        const step = 40;
        for (let x = bounds.minX + step; x < bounds.maxX; x += step) {
            context.moveTo(x, bounds.minY);
            context.lineTo(x, bounds.maxY);
        }
        context.stroke();
        if (surface.kind === "sealed-door") {
            context.strokeStyle = "rgba(148, 163, 184, 0.26)";
            context.beginPath();
            for (let y = bounds.minY + 14; y < bounds.maxY; y += 16) {
                context.moveTo(bounds.minX, y);
                context.lineTo(bounds.maxX, y);
            }
            context.stroke();
            context.fillStyle = "rgba(245, 158, 11, 0.5)";
            for (let x = bounds.minX + 8; x < bounds.maxX; x += 24) {
                context.fillRect(x, bounds.minY + 5, 12, 3);
            }
        } else if (surface.kind === "overhang") {
            context.strokeStyle = "rgba(100, 116, 139, 0.38)";
            context.beginPath();
            for (let x = bounds.minX; x < bounds.maxX; x += 48) {
                context.moveTo(x, bounds.minY);
                context.lineTo(Math.min(bounds.maxX, x + 48), bounds.maxY);
                context.moveTo(Math.min(bounds.maxX, x + 48), bounds.minY);
                context.lineTo(x, bounds.maxY);
            }
            context.stroke();
        }
        context.fillStyle = "rgba(253, 230, 138, 0.24)";
        for (let x = bounds.minX + 12; x < bounds.maxX; x += 28) {
            context.fillRect(x, bounds.minY + 3, 2, 2);
        }
        context.restore();
    }

    drawSector01Structure(context, vertices, bounds, surface) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        if (width <= 0 || height <= 0) return;

        const kind = surface.kind ?? "platform";
        const isThin = height <= 16;
        const panelStep = kind === "safe-deck" ? 64 : 32;
        const innerTop = bounds.minY + Math.min(4, Math.max(2, height * 0.2));
        const innerBottom = bounds.maxY - Math.min(3, Math.max(1, height * 0.15));

        context.save();
        this.traceSurfacePath(context, vertices);
        context.clip();

        context.fillStyle =
            kind === "safe-deck"
                ? "rgba(13, 28, 42, 0.94)"
                : kind === "recovery"
                  ? "rgba(7, 15, 25, 0.94)"
                  : kind === "overhang"
                    ? "rgba(10, 18, 28, 0.96)"
                    : kind === "sealed-door"
                      ? "rgba(6, 12, 20, 0.98)"
                      : "rgba(9, 19, 31, 0.92)";
        context.fillRect(bounds.minX, bounds.minY, width, height);

        context.fillStyle = "rgba(71, 94, 112, 0.38)";
        context.fillRect(bounds.minX, innerTop, width, Math.min(3, height));
        context.fillStyle = "rgba(2, 8, 15, 0.86)";
        context.fillRect(bounds.minX, innerBottom, width, Math.max(1, bounds.maxY - innerBottom));

        if (kind === "overhang") {
            this.drawSector01Overhang(context, bounds);
        } else if (kind === "sealed-door") {
            this.drawSector01SealedDoor(context, bounds);
        } else if (kind === "cover" || kind === "solid") {
            this.drawSector01SolidPanel(context, bounds);
        } else {
            if (surface.oneWay && surface.presentationId !== "terrain:ground-foundation") {
                this.drawSector01PassThroughGrate(context, bounds, kind);
            }
            this.drawSector01DeckPanels(context, bounds, panelStep, { isThin, kind });
        }

        context.restore();
    }

    drawSector01PassThroughGrate(context, bounds, kind) {
        const height = bounds.maxY - bounds.minY;
        const apertureTop = bounds.minY + (height <= 16 ? 5 : 7);
        const apertureBottom = bounds.maxY - (kind === "safe-deck" || kind === "recovery" ? 7 : 4);
        if (apertureBottom - apertureTop < 2) return;

        context.fillStyle = "rgba(1, 6, 11, 0.92)";
        context.strokeStyle = "rgba(110, 139, 151, 0.42)";
        context.lineWidth = 1;
        for (let x = bounds.minX; x < bounds.maxX; x += 32) {
            const left = x + 4;
            const right = Math.min(bounds.maxX - 4, x + 28);
            if (right <= left) continue;
            context.fillRect(left, apertureTop, right - left, apertureBottom - apertureTop);
            context.strokeRect(left, apertureTop, right - left, apertureBottom - apertureTop);

            const centerX = (left + right) * 0.5;
            context.beginPath();
            context.moveTo(centerX - 5, apertureBottom - 1);
            context.lineTo(centerX, apertureTop + 1);
            context.lineTo(centerX + 5, apertureBottom - 1);
            context.stroke();
        }
    }

    drawSector01DeckPanels(context, bounds, panelStep, { isThin, kind }) {
        const panelTop = bounds.minY + (isThin ? 5 : 7);
        const panelBottom = bounds.maxY - 3;

        context.strokeStyle = kind === "recovery" ? "rgba(100, 116, 139, 0.5)" : "rgba(82, 111, 132, 0.58)";
        context.lineWidth = 1;
        for (let x = bounds.minX; x < bounds.maxX; x += panelStep) {
            const right = Math.min(bounds.maxX, x + panelStep);
            context.strokeRect(x + 2, panelTop, Math.max(0, right - x - 4), Math.max(1, panelBottom - panelTop));
            context.fillStyle = "rgba(148, 163, 184, 0.34)";
            context.fillRect(x + 5, panelTop + 2, 2, 2);
            context.fillRect(Math.max(x + 5, right - 7), panelTop + 2, 2, 2);
        }

        if (kind === "safe-deck") {
            context.fillStyle = "rgba(245, 158, 11, 0.62)";
            for (let x = bounds.minX + 8; x < bounds.maxX - 4; x += 32) {
                context.fillRect(x, bounds.maxY - 7, 16, 3);
            }
            context.fillStyle = "rgba(103, 232, 249, 0.26)";
            for (let x = bounds.minX + 28; x < bounds.maxX; x += 64) {
                context.fillRect(x, bounds.minY + 7, 4, Math.max(2, bounds.maxY - bounds.minY - 12));
            }
        } else if (kind === "recovery") {
            context.fillStyle = "rgba(245, 158, 11, 0.52)";
            context.fillRect(
                bounds.minX + 4,
                bounds.maxY - 5,
                Math.min(12, Math.max(0, bounds.maxX - bounds.minX - 8)),
                2
            );
            context.fillRect(Math.max(bounds.minX + 4, bounds.maxX - 16), bounds.maxY - 5, 12, 2);
        } else {
            context.fillStyle = "rgba(103, 232, 249, 0.2)";
            for (let x = bounds.minX + 14; x < bounds.maxX; x += 32) {
                context.fillRect(x, bounds.minY + 6, 3, Math.max(2, bounds.maxY - bounds.minY - 10));
            }
        }
    }

    drawSector01Overhang(context, bounds) {
        context.strokeStyle = "rgba(100, 116, 139, 0.7)";
        context.lineWidth = 2;
        context.beginPath();
        for (let x = bounds.minX; x < bounds.maxX; x += 48) {
            const right = Math.min(bounds.maxX, x + 48);
            context.moveTo(x + 3, bounds.minY + 6);
            context.lineTo(right - 3, bounds.maxY - 5);
            context.moveTo(right - 3, bounds.minY + 6);
            context.lineTo(x + 3, bounds.maxY - 5);
        }
        context.stroke();
        context.fillStyle = "rgba(148, 163, 184, 0.5)";
        for (let x = bounds.minX + 5; x < bounds.maxX; x += 48) {
            context.fillRect(x, bounds.minY + 5, 3, 3);
        }
    }

    drawSector01SealedDoor(context, bounds) {
        context.strokeStyle = "rgba(100, 116, 139, 0.52)";
        context.lineWidth = 2;
        context.beginPath();
        for (let y = bounds.minY + 14; y < bounds.maxY; y += 16) {
            context.moveTo(bounds.minX + 4, y);
            context.lineTo(bounds.maxX - 4, y);
        }
        context.stroke();
        context.fillStyle = "rgba(245, 158, 11, 0.7)";
        for (let x = bounds.minX + 8; x < bounds.maxX - 4; x += 24) {
            context.fillRect(x, bounds.minY + 6, 12, 4);
        }
        context.fillStyle = "rgba(103, 232, 249, 0.2)";
        context.fillRect(bounds.minX + 7, bounds.minY + 16, 3, Math.max(0, bounds.maxY - bounds.minY - 24));
        context.fillRect(bounds.maxX - 10, bounds.minY + 16, 3, Math.max(0, bounds.maxY - bounds.minY - 24));
    }

    drawSector01SolidPanel(context, bounds) {
        context.strokeStyle = "rgba(82, 111, 132, 0.58)";
        context.lineWidth = 1;
        for (let y = bounds.minY + 8; y < bounds.maxY; y += 32) {
            for (let x = bounds.minX + 3; x < bounds.maxX; x += 32) {
                context.strokeRect(x, y, Math.min(26, bounds.maxX - x - 3), Math.min(24, bounds.maxY - y - 3));
            }
        }
        context.fillStyle = "rgba(148, 163, 184, 0.34)";
        for (let y = bounds.minY + 12; y < bounds.maxY; y += 32) {
            context.fillRect(bounds.minX + 6, y, 3, 3);
            context.fillRect(bounds.maxX - 9, y, 3, 3);
        }
    }

    fillSurfaceWithTiles(context, vertices, bounds, material, viewport) {
        const tileW = material.fill.width;
        const tileH = material.fill.height;
        if (tileW <= 0 || tileH <= 0) return;
        const paintBounds = viewport?.worldBounds ? intersectBounds(bounds, viewport.worldBounds) : bounds;
        if (!paintBounds) return;

        const image = this.assets.imageFor(material.fill.atlasId);
        context.save();
        this.traceSurfacePath(context, vertices);
        context.clip();

        const startX = Math.floor(paintBounds.minX / tileW) * tileW;
        const startY = Math.floor(paintBounds.minY / tileH) * tileH;
        for (let tx = startX; tx <= paintBounds.maxX; tx += tileW) {
            for (let ty = startY; ty <= paintBounds.maxY; ty += tileH) {
                paintSpriteFrame({
                    context,
                    image,
                    frame: material.fill,
                    position: { x: tx + tileW * 0.5, y: ty + tileH * 0.5 },
                    size: { width: tileW, height: tileH },
                    anchor: { x: 0.5, y: 0.5 },
                    offset: { x: 0, y: 0 },
                    opacity: 1,
                    pixelSnap: true,
                    flipX: false,
                    rotation: 0
                });
            }
        }
        context.restore();
    }

    drawSurfaceEdgeTiles(context, entry, material, viewport, sectorId = null) {
        const frame = material.edge;
        const image = this.assets.imageFor(frame.atlasId);
        const opacity = sectorId === "sector-01" && entry.surface.oneWay ? 0.56 : 1;
        context.save();
        this.traceSurfacePath(context, entry.surface.vertices);
        context.clip();

        for (const edge of entry.edges) {
            if (edge.length <= 0 || !this.edgeIsVisible(viewport, edge.bounds, frame.width)) continue;
            const tileCount = Math.max(1, Math.ceil(edge.length / frame.width));
            for (let tile = 0; tile < tileCount; tile += 1) {
                const distance = Math.min(edge.length, tile * frame.width + frame.width * 0.5);
                const progress = distance / edge.length;
                paintSpriteFrame({
                    context,
                    image,
                    frame,
                    position: {
                        x: edge.start.x + edge.dx * progress,
                        y: edge.start.y + edge.dy * progress
                    },
                    size: { width: frame.width, height: Math.min(8, frame.height) },
                    anchor: { x: 0.5, y: 0.5 },
                    offset: { x: 0, y: 0 },
                    opacity,
                    pixelSnap: true,
                    flipX: false,
                    rotation: Math.atan2(edge.dy, edge.dx)
                });
            }
        }
        context.restore();
    }

    edgeIsVisible(viewport, bounds, margin) {
        const worldBounds = viewport?.worldBounds;
        if (!worldBounds) return true;
        return boundsIntersect(
            {
                minX: bounds.minX - margin,
                minY: bounds.minY - margin,
                maxX: bounds.maxX + margin,
                maxY: bounds.maxY + margin
            },
            worldBounds
        );
    }

    traceSurfacePath(context, vertices) {
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let index = 1; index < vertices.length; index += 1) {
            context.lineTo(vertices[index].x, vertices[index].y);
        }
        context.closePath();
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
