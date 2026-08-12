import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";

export class PixelDecorationRenderer {
    constructor({ definition, assets }) {
        this.definition = definition;
        this.assets = assets;
        this.status = assets ? "ready" : "pending";
    }

    draw({ context, scene }) {
        const playerAltitude = scene.player?.position?.y ?? 0;
        const zone = this.definition.zoneAt(-playerAltitude);
        const group = this.definition.decorationGroupFor(zone);

        if (!group || !this.assets) return;
        const surfaces = scene.world.surfaces ?? [];
        const surfaceBounds = surfaces.map((surface) => this.boundsFor(surface.vertices)).filter(Boolean);

        for (let i = 0; i < surfaces.length; i += 1) {
            const surface = surfaces[i];
            const seed = (scene.world.seed ?? 0) + i * 31 + (surface.level ?? 0) * 7;
            const bounds = this.boundsFor(surface.vertices);
            if (!bounds) continue;

            for (const item of group.items) {
                const image = this.assets.imageFor(item.frame.atlasId);
                const hash = this.hashFor(seed + item.frame.x + item.frame.y);
                if (hash > 0.55) continue;

                const position = this.safePosition(bounds, surfaceBounds, item, hash);
                if (!position) continue;

                const depthScale = this.depthScale(item.placement.depth);
                paintSpriteFrame({
                    context,
                    image,
                    frame: item.frame,
                    position,
                    size: { width: item.size.width * depthScale, height: item.size.height * depthScale },
                    anchor: { x: 0.5, y: 0.5 },
                    offset: { x: 0, y: 0 },
                    opacity: 0.35 + depthScale * 0.45,
                    pixelSnap: true,
                    flipX: hash > 0.75,
                    rotation: 0
                });
            }
        }
    }

    depthScale(depth) {
        return { far: 0.72, mid: 0.86, near: 1, foreground: 1.08 }[depth] ?? 1;
    }

    safePosition(bounds, surfaceBounds, item, hash) {
        const preferredSide = hash < 0.5 ? -1 : 1;
        const y = bounds.minY + (item.placement.surfaceLevelOffset ?? 0) * 12 - item.size.height * 0.5;
        for (const side of [preferredSide, -preferredSide]) {
            for (let attempt = 0; attempt < 3; attempt += 1) {
                const distance = 48 + hash * 96 + attempt * 72;
                const x = side < 0 ? bounds.minX - distance : bounds.maxX + distance;
                const candidate = {
                    minX: x - item.size.width * 0.5,
                    maxX: x + item.size.width * 0.5,
                    minY: y - item.size.height * 0.5,
                    maxY: y + item.size.height * 0.5
                };
                if (!surfaceBounds.some((surface) => this.overlaps(candidate, surface, 18))) return { x, y };
            }
        }
        return null;
    }

    overlaps(candidate, surface, margin) {
        return !(
            candidate.maxX < surface.minX - margin ||
            candidate.minX > surface.maxX + margin ||
            candidate.maxY < surface.minY - margin ||
            candidate.minY > surface.maxY + margin
        );
    }

    hashFor(value) {
        let h = (value >>> 0) * 2654435761;
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }

    boundsFor(vertices) {
        if (!Array.isArray(vertices) || vertices.length === 0) return null;
        return vertices.reduce(
            (bounds, vertex) => ({
                minX: Math.min(bounds.minX, vertex.x),
                maxX: Math.max(bounds.maxX, vertex.x),
                minY: Math.min(bounds.minY, vertex.y),
                maxY: Math.max(bounds.maxY, vertex.y)
            }),
            { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
        );
    }
}
