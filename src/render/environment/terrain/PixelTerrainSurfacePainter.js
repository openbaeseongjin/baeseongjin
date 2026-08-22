import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { boundsIntersect, intersectBounds } from "../../RenderViewport.js";

export class PixelTerrainSurfacePainter {
    constructor({ assets }) {
        this.assets = assets;
    }

    drawFill(context, vertices, bounds, material, palette, viewport) {
        if (this.assets && this.assets.isReady(material.fill.atlasId)) {
            this.fillWithTiles(context, vertices, bounds, material, viewport);
            return;
        }
        context.fillStyle = palette.terrainFill;
        this.tracePath(context, vertices);
        context.fill();
    }

    fillWithTiles(context, vertices, bounds, material, viewport) {
        const tileW = material.fill.width;
        const tileH = material.fill.height;
        if (tileW <= 0 || tileH <= 0) return;
        const paintBounds = viewport?.worldBounds ? intersectBounds(bounds, viewport.worldBounds) : bounds;
        if (!paintBounds) return;

        const image = this.assets.imageFor(material.fill.atlasId);
        context.save();
        this.tracePath(context, vertices);
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

    drawEdgeTiles(context, entry, material, viewport, opacity = 1) {
        const frame = material.edge;
        const image = this.assets.imageFor(frame.atlasId);
        context.save();
        this.tracePath(context, entry.surface.vertices);
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

    tracePath(context, vertices) {
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let index = 1; index < vertices.length; index += 1) {
            context.lineTo(vertices[index].x, vertices[index].y);
        }
        context.closePath();
    }
}
