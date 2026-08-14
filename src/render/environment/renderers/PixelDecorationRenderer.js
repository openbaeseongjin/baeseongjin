import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { boundsForVertices, centeredBounds, isVisible } from "../../RenderViewport.js";
import { currentAuthoredArea, sceneEnvironmentZone } from "../AltitudeZoneResolver.js";

export class PixelDecorationRenderer {
    constructor({ definition, assets }) {
        this.definition = definition;
        this.assets = assets;
        this.status = assets ? "ready" : "pending";
        this.cachedWorld = null;
        this.cachedGroup = null;
        this.cachedPlacements = Object.freeze([]);
    }

    draw({ context, scene, viewport, renderStats }) {
        if (currentAuthoredArea(scene)) {
            renderStats?.recordCollection("decorations", 0, 0);
            return;
        }

        const zone = sceneEnvironmentZone(this.definition, scene);
        const group = this.definition.decorationGroupFor(zone);

        if (!group || !this.assets) return;
        const placements = this.placementsFor(scene.world, group);
        let drawn = 0;
        for (const placement of placements) {
            if (!isVisible(viewport, placement.bounds)) continue;
            drawn += 1;
            paintSpriteFrame({
                context,
                image: this.assets.imageFor(placement.item.frame.atlasId),
                frame: placement.item.frame,
                position: placement.position,
                size: placement.size,
                anchor: { x: 0.5, y: 0.5 },
                offset: { x: 0, y: 0 },
                opacity: placement.opacity,
                pixelSnap: true,
                flipX: placement.flipX,
                rotation: 0
            });
        }
        renderStats?.recordCollection("decorations", placements.length, drawn);
    }

    placementsFor(world, group) {
        if (this.cachedWorld === world && this.cachedGroup === group) return this.cachedPlacements;
        this.cachedWorld = world;
        this.cachedGroup = group;
        const surfaces = (world.surfaces ?? []).filter(({ renderable }) => renderable !== false);
        const surfaceBounds = surfaces.map((surface) => boundsForVertices(surface.vertices)).filter(Boolean);
        const placements = [];

        for (let i = 0; i < surfaces.length; i += 1) {
            const surface = surfaces[i];
            const seed = (world.seed ?? 0) + i * 31 + (surface.level ?? 0) * 7;
            const bounds = surfaceBounds[i];
            if (!bounds) continue;

            for (const item of group.items) {
                const hash = this.hashFor(seed + item.frame.x + item.frame.y);
                if (hash > 0.55) continue;
                const position = this.safePosition(bounds, surfaceBounds, item, hash);
                if (!position) continue;
                const depthScale = this.depthScale(item.placement.depth);
                const size = Object.freeze({
                    width: item.size.width * depthScale,
                    height: item.size.height * depthScale
                });
                placements.push(
                    Object.freeze({
                        item,
                        position: Object.freeze(position),
                        size,
                        bounds: centeredBounds(position, size),
                        opacity: 0.35 + depthScale * 0.45,
                        flipX: hash > 0.75
                    })
                );
            }
        }
        this.cachedPlacements = Object.freeze(placements);
        return this.cachedPlacements;
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
}
