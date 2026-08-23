import { boundsForVertices, circleBounds, isVisible } from "../../RenderViewport.js";
import { authoredAreaEnvironmentDefinitionFor } from "../AuthoredAreaEnvironmentCatalog.js";
import { authoredEnvironmentZone } from "../AltitudeZoneResolver.js";
import { drawCheckpointBeacon, drawExitBeacon } from "../../world/WorldMarkerPrimitives.js";
import { isSurfaceEnabledForProgress } from "../../../game/world/WorldGateGeometry.js";
import { PixelTerrainSurfacePainter } from "../terrain/PixelTerrainSurfacePainter.js";
import { createPixelTerrainSurfaceRendererCatalog } from "../terrain/PixelTerrainSurfaceRenderers.js";
import { resolveTerrainBlockPresentation } from "../terrain/TerrainBlockPool.js";

const PIXEL_TERRAIN_RENDERER_DEFINITION = Object.freeze({
    STATUS: Object.freeze({ READY: "ready", PENDING: "pending" }),
    COLLECTION_ID: "terrainSurfaces",
    DEFAULT_SAVEPOINT_LABEL: "STAGE SAVE",
    COMPLETED_RUN_STATE: "completed"
});

function authoredRegions(world) {
    return world.landmarks?.length ? world.landmarks : (world.areas ?? []);
}

function regionIndex(world) {
    return Object.freeze(
        Object.fromEntries(
            authoredRegions(world).flatMap((area) => [[area.id, area], ...(area.areaId ? [[area.areaId, area]] : [])])
        )
    );
}

export class PixelTerrainRenderer {
    constructor({ definition, assets, authoredAreaEnvironmentDefinitions = Object.freeze({}) }) {
        this.definition = definition;
        this.assets = assets;
        this.authoredAreaEnvironmentDefinitions = authoredAreaEnvironmentDefinitions;
        this.status = assets
            ? PIXEL_TERRAIN_RENDERER_DEFINITION.STATUS.READY
            : PIXEL_TERRAIN_RENDERER_DEFINITION.STATUS.PENDING;
        this.cachedWorld = null;
        this.cachedSurfaces = Object.freeze([]);
        this.surfaceRenderers = createPixelTerrainSurfaceRendererCatalog({
            painter: new PixelTerrainSurfacePainter({ assets })
        });
    }

    draw({ context, scene, viewport, renderStats }) {
        const playerAltitude = -(scene.player?.position?.y ?? 0);
        const surfaces = this.surfaceEntries(scene.world, scene.worldProgress);
        const visibleSurfaces = surfaces.filter(({ bounds }) => isVisible(viewport, bounds));

        for (const entry of visibleSurfaces) {
            const zone = authoredEnvironmentZone(entry.definition, entry.area, playerAltitude);
            this.drawSurface(context, entry, entry.definition.materialFor(zone), zone.palette, viewport);
        }
        renderStats?.recordCollection(
            PIXEL_TERRAIN_RENDERER_DEFINITION.COLLECTION_ID,
            surfaces.length,
            visibleSurfaces.length
        );
        const savepoints = scene.world.checkpoints?.length
            ? scene.world.checkpoints
            : (scene.world.respawnAnchors ?? []).map((anchor, level) => ({
                  id: anchor.id,
                  x: anchor.position.x,
                  y: anchor.position.y,
                  level: anchor.level ?? level,
                  radius: anchor.radius ?? 64,
                  label: anchor.label ?? PIXEL_TERRAIN_RENDERER_DEFINITION.DEFAULT_SAVEPOINT_LABEL
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
            const areasById = regionIndex(world);
            this.cachedSurfaces = Object.freeze(
                (world.surfaces ?? [])
                    .filter(({ renderable }) => renderable !== false)
                    .map((surface) => {
                        const area = areasById[surface.landmarkId] ?? areasById[surface.areaId] ?? null;
                        const definition = authoredAreaEnvironmentDefinitionFor(
                            this.authoredAreaEnvironmentDefinitions,
                            area,
                            this.definition
                        );
                        return Object.freeze({
                            surface,
                            area,
                            definition,
                            presentation: resolveTerrainBlockPresentation({
                                definition,
                                sectorId: area?.sectorId ?? null,
                                surface
                            }),
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
                        });
                    })
            );
        }
        return this.cachedSurfaces.filter(({ surface }) => isSurfaceEnabledForProgress(surface, progress));
    }

    drawSurface(context, entry, material, palette, viewport) {
        this.surfaceRenderers.rendererFor(entry.presentation).draw({
            context,
            entry,
            material,
            palette,
            viewport,
            presentation: entry.presentation
        });
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
        if (
            !summit ||
            runState === PIXEL_TERRAIN_RENDERER_DEFINITION.COMPLETED_RUN_STATE ||
            !isVisible(viewport, circleBounds(summit, summit.radius))
        )
            return;
        drawExitBeacon(context, summit);
    }
}
