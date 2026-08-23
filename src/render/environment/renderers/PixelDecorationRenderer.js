import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { boundsForVertices, centeredBounds, isVisible } from "../../RenderViewport.js";
import { authoredAreaEnvironmentDefinitionFor } from "../AuthoredAreaEnvironmentCatalog.js";
import { authoredEnvironmentZone, currentAuthoredArea } from "../AltitudeZoneResolver.js";

function authoredSurfaceForArea(surface, area) {
    if (!area) return true;
    return (
        surface.landmarkId === area.id ||
        surface.areaId === area.id ||
        (area.areaId !== undefined && surface.areaId === area.areaId)
    );
}

function stableHash(value) {
    let hash = 2166136261;
    for (const character of value) {
        hash ^= character.codePointAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967296;
}

export class PixelDecorationRenderer {
    constructor({ definition, assets, authoredAreaEnvironmentDefinitions = Object.freeze({}) }) {
        this.definition = definition;
        this.assets = assets;
        this.authoredAreaEnvironmentDefinitions = authoredAreaEnvironmentDefinitions;
        this.status = assets ? "ready" : "pending";
        this.cachedWorld = null;
        this.cachedAreaId = null;
        this.cachedGroupId = null;
        this.cachedPlacements = Object.freeze([]);
    }

    draw({ context, scene, viewport, renderStats }) {
        const area = currentAuthoredArea(scene);
        const definition = authoredAreaEnvironmentDefinitionFor(
            this.authoredAreaEnvironmentDefinitions,
            area,
            this.definition
        );
        const altitude = -(scene.player?.position?.y ?? 0);
        const zone = authoredEnvironmentZone(definition, area, altitude);
        const groupId = zone.decorationGroup;
        const group = definition.decorationGroupFor(zone);
        if (!group || !this.assets) return;
        const placements = this.placementsFor(scene.world, area, groupId, group);
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

    placementsFor(world, area, groupId, group) {
        const areaId = area?.areaId ?? area?.id ?? null;
        if (this.cachedWorld === world && this.cachedAreaId === areaId && this.cachedGroupId === groupId) {
            return this.cachedPlacements;
        }
        this.cachedWorld = world;
        this.cachedAreaId = areaId;
        this.cachedGroupId = groupId;
        const surfaces = (world.surfaces ?? []).filter(
            (surface) => surface.renderable !== false && authoredSurfaceForArea(surface, area)
        );
        const surfaceBounds = surfaces.map((surface) => boundsForVertices(surface.vertices)).filter(Boolean);
        const placements = [];

        for (const [surfaceIndex, surface] of surfaces.entries()) {
            const bounds = surfaceBounds[surfaceIndex];
            if (!bounds) continue;
            for (const [itemIndex, item] of group.items.entries()) {
                const hash = stableHash(`${world.seed ?? 0}:${surface.id}:${groupId}:${itemIndex}`);
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
}
