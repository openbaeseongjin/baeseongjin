import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { boundsForVertices, boundsIntersect, circleBounds, intersectBounds, isVisible } from "../../RenderViewport.js";

export class PixelTerrainRenderer {
    constructor({ definition, assets }) {
        this.definition = definition;
        this.assets = assets;
        this.status = assets ? "ready" : "pending";
        this.cachedWorld = null;
        this.cachedSurfaces = Object.freeze([]);
    }

    draw({ context, scene, viewport, renderStats }) {
        const playerAltitude = scene.player?.position?.y ?? 0;
        const zone = this.definition.zoneAt(-playerAltitude);
        const material = this.definition.materialFor(zone);
        const palette = zone.palette;
        const surfaces = this.surfaceEntries(scene.world);
        const visibleSurfaces = surfaces.filter(({ bounds }) => isVisible(viewport, bounds));

        for (const entry of visibleSurfaces) {
            this.drawSurface(context, entry, material, palette, viewport);
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

    drawSurface(context, entry, material, palette, viewport) {
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
            context.save();
            context.globalAlpha = reached ? 0.35 : 0.9;
            context.strokeStyle = active ? "#fbbf24" : "#93c5fd";
            context.fillStyle = active ? "rgba(251, 191, 36, 0.18)" : "rgba(147, 197, 253, 0.1)";
            context.lineWidth = active ? 5 : 3;
            context.beginPath();
            context.arc(checkpoint.x, checkpoint.y, checkpoint.radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.fillStyle = active ? "#fde68a" : "#dbeafe";
            context.font = "800 12px system-ui, sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(active ? "활성" : "체크", checkpoint.x, checkpoint.y);
            context.restore();
        }
        renderStats?.recordCollection("checkpoints", checkpoints.length, drawn);
    }

    drawSummit(context, summit, runState, viewport) {
        if (!summit || runState === "completed" || !isVisible(viewport, circleBounds(summit, summit.radius))) return;
        context.save();
        context.globalAlpha = 0.78;
        context.strokeStyle = "#a7f3d0";
        context.fillStyle = "rgba(167, 243, 208, 0.12)";
        context.lineWidth = 4;
        context.beginPath();
        context.arc(summit.x, summit.y, summit.radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.fillStyle = "#d1fae5";
        context.font = "900 13px system-ui, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("정상", summit.x, summit.y);
        context.restore();
    }
}
