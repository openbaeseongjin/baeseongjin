import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";

export class PixelTerrainRenderer {
    constructor({ definition, assets }) {
        this.definition = definition;
        this.assets = assets;
        this.status = assets ? "ready" : "pending";
    }

    draw({ context, scene }) {
        const playerAltitude = scene.player?.position?.y ?? 0;
        const zone = this.definition.zoneAt(-playerAltitude);
        const material = this.definition.materialFor(zone);
        const palette = zone.palette;

        for (const surface of scene.world.surfaces) {
            this.drawSurface(context, surface, material, palette);
        }
        this.drawCheckpoints(context, scene.world.checkpoints, scene.activeCheckpoint);
        this.drawSummit(context, scene.world.summit, scene.runState);
    }

    drawSurface(context, surface, material, palette) {
        const vertices = surface.vertices;
        const bounds = this.computeBounds(vertices);

        if (this.assets && this.assets.isReady(material.fill.atlasId)) {
            this.fillSurfaceWithTiles(context, vertices, bounds, material);
        } else {
            context.fillStyle = palette.terrainFill;
            context.beginPath();
            context.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i += 1) {
                context.lineTo(vertices[i].x, vertices[i].y);
            }
            context.closePath();
            context.fill();
        }

        this.drawSurfaceEdgeTiles(context, vertices, material);

        context.strokeStyle = palette.terrainEdge;
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i += 1) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }
        context.closePath();
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

    fillSurfaceWithTiles(context, vertices, bounds, material) {
        const tileW = material.fill.width;
        const tileH = material.fill.height;
        if (tileW <= 0 || tileH <= 0) return;

        const image = this.assets.imageFor(material.fill.atlasId);
        context.save();
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i += 1) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }
        context.closePath();
        context.clip();

        const startX = Math.floor(bounds.minX / tileW) * tileW;
        const startY = Math.floor(bounds.minY / tileH) * tileH;
        for (let tx = startX; tx <= bounds.maxX; tx += tileW) {
            for (let ty = startY; ty <= bounds.maxY; ty += tileH) {
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

    drawSurfaceEdgeTiles(context, vertices, material) {
        const frame = material.edge;
        const image = this.assets.imageFor(frame.atlasId);
        context.save();
        this.traceSurfacePath(context, vertices);
        context.clip();

        for (let index = 0; index < vertices.length; index += 1) {
            const start = vertices[index];
            const end = vertices[(index + 1) % vertices.length];
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.hypot(dx, dy);
            if (length <= 0) continue;
            const tileCount = Math.max(1, Math.ceil(length / frame.width));
            for (let tile = 0; tile < tileCount; tile += 1) {
                const distance = Math.min(length, tile * frame.width + frame.width * 0.5);
                const progress = distance / length;
                paintSpriteFrame({
                    context,
                    image,
                    frame,
                    position: { x: start.x + dx * progress, y: start.y + dy * progress },
                    size: { width: frame.width, height: Math.min(8, frame.height) },
                    anchor: { x: 0.5, y: 0.5 },
                    offset: { x: 0, y: 0 },
                    opacity: 1,
                    pixelSnap: true,
                    flipX: false,
                    rotation: Math.atan2(dy, dx)
                });
            }
        }
        context.restore();
    }

    traceSurfacePath(context, vertices) {
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let index = 1; index < vertices.length; index += 1) {
            context.lineTo(vertices[index].x, vertices[index].y);
        }
        context.closePath();
    }

    computeBounds(vertices) {
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        for (const v of vertices) {
            if (v.x < minX) minX = v.x;
            if (v.y < minY) minY = v.y;
            if (v.x > maxX) maxX = v.x;
            if (v.y > maxY) maxY = v.y;
        }
        return { minX, minY, maxX, maxY };
    }

    drawCheckpoints(context, checkpoints = [], activeCheckpoint) {
        for (const checkpoint of checkpoints) {
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
    }

    drawSummit(context, summit, runState) {
        if (!summit || runState === "completed") return;
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
