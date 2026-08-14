import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { boundsForVertices, boundsIntersect, circleBounds, intersectBounds, isVisible } from "../../RenderViewport.js";
import { currentAuthoredArea, sceneEnvironmentZone } from "../AltitudeZoneResolver.js";
import { drawCheckpointBeacon, drawExitBeacon } from "../../world/WorldMarkerPrimitives.js";

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
        const surfaces = this.surfaceEntries(scene.world);
        const visibleSurfaces = surfaces.filter(({ bounds }) => isVisible(viewport, bounds));

        for (const entry of visibleSurfaces) {
            this.drawSurface(context, entry, material, palette, viewport, authoredArea?.sectorId);
        }
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
        return this.cachedSurfaces;
    }

    drawSurface(context, entry, material, palette, viewport, sectorId = null) {
        const { surface, bounds } = entry;
        const vertices = surface.vertices;

        if (this.assets && this.assets.isReady(material.fill.atlasId)) {
            this.fillSurfaceWithTiles(context, vertices, bounds, material, viewport);
        } else {
            context.fillStyle = palette.terrainFill;
            this.traceSurfacePath(context, vertices);
            context.fill();
        }

        this.drawSurfaceEdgeTiles(context, entry, material, viewport);

        context.strokeStyle = palette.terrainEdge;
        context.lineWidth = 3;
        this.traceSurfacePath(context, vertices);
        context.stroke();

        if (surface.oneWay) {
            context.strokeStyle = material.oneWayColor ?? palette.oneWayEdge;
            context.lineWidth = 4;
            context.lineCap = "round";
            context.beginPath();
            context.moveTo(vertices[0].x, vertices[0].y);
            const edgeEnd = surface.oneWayEdgeEnd ?? 1;
            for (let i = 1; i <= edgeEnd && i < vertices.length; i += 1) {
                context.lineTo(vertices[i].x, vertices[i].y);
            }
            context.stroke();
            context.lineCap = "butt";
        }
        if (sectorId === "sector-01" || sectorId === "sector-02") {
            this.drawAuthoredStructure(context, vertices, bounds, sectorId, surface);
        }
    }

    drawAuthoredStructure(context, vertices, bounds, sectorId, surface) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        if (width <= 0 || height <= 0) return;
        context.save();
        this.traceSurfacePath(context, vertices);
        context.clip();
        context.fillStyle = sectorId === "sector-01" ? "rgba(8, 15, 26, 0.62)" : "rgba(34, 28, 22, 0.48)";
        context.fillRect(bounds.minX, bounds.minY + Math.min(4, height * 0.2), width, height);
        context.strokeStyle = sectorId === "sector-01" ? "rgba(103, 232, 249, 0.13)" : "rgba(253, 230, 138, 0.12)";
        context.lineWidth = 1;
        context.beginPath();
        const step = sectorId === "sector-01" ? 32 : 40;
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
        context.fillStyle = sectorId === "sector-01" ? "rgba(165, 243, 252, 0.28)" : "rgba(253, 230, 138, 0.24)";
        for (let x = bounds.minX + 12; x < bounds.maxX; x += 28) {
            context.fillRect(x, bounds.minY + 3, 2, 2);
        }
        context.restore();
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

    drawSurfaceEdgeTiles(context, entry, material, viewport) {
        const frame = material.edge;
        const image = this.assets.imageFor(frame.atlasId);
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
                    opacity: 1,
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
