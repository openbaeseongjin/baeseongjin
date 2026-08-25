import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { drawAuthoredSectorBackdrop } from "../AuthoredSectorBackdrop.js";
import {
    AltitudeSunrise,
    activeBossEnvironmentArea,
    authoredEnvironmentZone,
    currentAuthoredArea,
    sceneEnvironmentZone
} from "../AltitudeZoneResolver.js";

const AUTHORED_SECTOR_CROSSFADE_WORLD_SPAN = 1024;
const AUTHORED_SECTOR_CLIMB_PROGRESS_OFFSET = Object.freeze({
    "sector-06": 0.05
});
const AUTHORED_SECTOR_TRANSITIONS = Object.freeze([
    Object.freeze({ fromSectorId: "sector-01", toSectorId: "sector-02", outgoingBlurCssPixels: 0 }),
    Object.freeze({ fromSectorId: "sector-02", toSectorId: "sector-03", outgoingBlurCssPixels: 0 }),
    Object.freeze({ fromSectorId: "sector-03", toSectorId: "sector-04", outgoingBlurCssPixels: 0 }),
    Object.freeze({ fromSectorId: "sector-04", toSectorId: "sector-05", outgoingBlurCssPixels: 0 }),
    Object.freeze({ fromSectorId: "sector-05", toSectorId: "sector-06", outgoingBlurCssPixels: 12 })
]);

export class PixelBackdropRenderer {
    constructor({ definition, assets, authoredAreaEnvironmentDefinitions = Object.freeze({}) }) {
        this.definition = definition;
        this.assets = assets;
        this.authoredAreaEnvironmentDefinitions = authoredAreaEnvironmentDefinitions;
        this.sunrise = new AltitudeSunrise({ definition });
        this.status = assets ? "ready" : "pending";
    }

    draw({ context, scene, viewport }) {
        const { cssWidth, cssHeight } = viewport;
        const camera = scene.camera;
        const playerAltitude = scene.player?.position?.y ?? 0;
        const bossEnvironmentArea = activeBossEnvironmentArea(scene);
        const area = bossEnvironmentArea ?? currentAuthoredArea(scene);
        const authoredTransition = bossEnvironmentArea ? null : authoredSectorBackdropTransition(scene);
        const zone = sceneEnvironmentZone(this.definition, scene);
        const palette = authoredTransition
            ? blendedTransitionPalette(this.definition, authoredTransition, -playerAltitude)
            : zone.palette;

        const gradient = context.createLinearGradient(0, 0, 0, cssHeight);
        gradient.addColorStop(0, palette.skyTop);
        gradient.addColorStop(1, palette.skyBottom);
        context.fillStyle = gradient;
        context.fillRect(0, 0, cssWidth, cssHeight);
        const brightness = this.sunrise.brightness(-playerAltitude);
        context.fillStyle = `rgba(255, 244, 214, ${0.04 + brightness * 0.16})`;
        context.fillRect(0, 0, cssWidth, cssHeight);

        const authoredAreaBackdropDrawn = this.drawAuthoredAreaBackdrop(context, {
            area,
            viewport,
            scene,
            transition: authoredTransition
        });
        const authoredBackdropDrawn =
            authoredAreaBackdropDrawn || drawAuthoredSectorBackdrop(context, { scene, viewport, palette, area });
        if (!authoredBackdropDrawn) {
            const layers = this.definition.backdrop.layers;
            for (const layer of layers) {
                const offsetX = ((-camera.x * layer.parallaxX) % layer.tileWidth) - layer.tileWidth;
                const verticalSpan = cssHeight * 0.22;
                const verticalTravel = -camera.y * layer.parallaxY;
                const offsetY = (((verticalTravel % verticalSpan) + verticalSpan) % verticalSpan) - verticalSpan * 0.5;
                const peakHeight = layer.peakHeight;
                const baseline = cssHeight * layer.baselineRatio + offsetY;
                this.drawLayerSprites(context, layer, zone, offsetX, cssWidth, baseline, peakHeight);
            }
        }

        const haze = context.createLinearGradient(0, cssHeight * 0.35, 0, cssHeight);
        haze.addColorStop(0, "rgba(184, 196, 196, 0.06)");
        haze.addColorStop(1, "rgba(8, 11, 16, 0)");
        context.fillStyle = haze;
        context.fillRect(0, 0, cssWidth, cssHeight);
    }

    drawAuthoredAreaBackdrop(context, { area, viewport, scene, transition = null }) {
        if (transition) {
            const fromDefinition = authoredDefinitionForArea(
                this.authoredAreaEnvironmentDefinitions,
                transition.fromArea
            );
            const toDefinition = authoredDefinitionForArea(this.authoredAreaEnvironmentDefinitions, transition.toArea);
            if (fromDefinition && toDefinition) {
                let drawn = false;
                if (transition.progress < 1) {
                    drawn =
                        this.drawAuthoredBackdropDefinition(context, {
                            definition: fromDefinition,
                            area: transition.fromArea,
                            viewport,
                            scene,
                            opacity: 1 - transition.progress,
                            blurCssPixels: transition.outgoingBlurCssPixels * transition.progress
                        }) || drawn;
                }
                if (transition.progress > 0) {
                    drawn =
                        this.drawAuthoredBackdropDefinition(context, {
                            definition: toDefinition,
                            area: transition.toArea,
                            viewport,
                            scene,
                            opacity: transition.progress
                        }) || drawn;
                }
                if (drawn) return true;
            }
        }
        return this.drawAuthoredBackdropDefinition(context, {
            definition: authoredDefinitionForArea(this.authoredAreaEnvironmentDefinitions, area),
            area,
            viewport,
            scene,
            opacity: 1
        });
    }

    drawAuthoredBackdropDefinition(context, { definition, area, viewport, scene, opacity, blurCssPixels = 0 }) {
        if (!definition) return false;
        const layers = [...definition.backdrop.layers].sort((a, b) => a.depth - b.depth);
        if (!layers.some(({ frames }) => frames.length > 0)) return false;
        const climbProgress = clamp(
            sectorClimbProgress(scene, area) + (AUTHORED_SECTOR_CLIMB_PROGRESS_OFFSET[area.sectorId] ?? 0),
            0,
            1
        );
        const areaCenterX = area.bounds.x + area.bounds.width * 0.5;
        const cameraX = scene.camera?.x ?? scene.player?.position?.x ?? areaCenterX;
        const horizontalOverscan = viewport.cssWidth * 0.03;
        context.save();
        const previousAlpha = Number.isFinite(context.globalAlpha) ? context.globalAlpha : 1;
        context.globalAlpha = previousAlpha * clamp(opacity, 0, 1);
        context.filter = blurCssPixels > 0 ? `blur(${blurCssPixels.toFixed(2)}px)` : "none";
        context.imageSmoothingEnabled = false;
        for (const layer of layers) {
            const frame = layer.frames[0];
            if (!frame) continue;
            const image = this.assets.imageFor(frame.atlasId);
            const scale = Math.max(
                (viewport.cssWidth + horizontalOverscan * 2) / frame.width,
                viewport.cssHeight / frame.height
            );
            const destinationWidth = frame.width * scale;
            const destinationHeight = frame.height * scale;
            const verticalOverflow = Math.max(0, destinationHeight - viewport.cssHeight);
            const parallaxX = Math.min(Math.max(layer.parallaxX ?? 0, 0), 0.3);
            const parallaxY = Math.min(Math.max(layer.parallaxY ?? 0, 0), 0.3);
            const horizontalDrift = clamp(
                -(cameraX - areaCenterX) * parallaxX * 0.35,
                -horizontalOverscan,
                horizontalOverscan
            );
            const verticalDrift = (climbProgress - 0.5) * viewport.cssHeight * parallaxY * 0.2;
            const destinationX = Math.round((viewport.cssWidth - destinationWidth) * 0.5 + horizontalDrift);
            const destinationY = Math.round(
                clamp(-verticalOverflow * (1 - climbProgress) + verticalDrift, -verticalOverflow, 0)
            );
            context.drawImage(
                image,
                frame.x,
                frame.y,
                frame.width,
                frame.height,
                destinationX,
                destinationY,
                destinationWidth,
                destinationHeight
            );
        }
        context.restore();
        return true;
    }

    drawLayerSprites(context, layer, zone, offsetX, cssWidth, baseline, peakHeight) {
        const tileCount = Math.ceil(cssWidth / layer.tileWidth) + 2;
        const variantOffset = [...zone.backdropVariant].reduce((sum, char) => sum + char.codePointAt(0), 0);
        for (let i = -1; i <= tileCount; i += 1) {
            const left = offsetX + i * layer.tileWidth;
            const frame = layer.frames[(Math.abs(i) + variantOffset) % layer.frames.length];
            const image = this.assets.imageFor(frame.atlasId);
            const destWidth = layer.tileWidth;
            const destHeight = peakHeight;
            paintSpriteFrame({
                context,
                image,
                frame,
                position: { x: left, y: baseline },
                size: { width: destWidth, height: destHeight },
                anchor: { x: 0, y: 1 },
                offset: { x: 0, y: 0 },
                opacity: layer.id.startsWith("far") ? 0.48 : layer.id.startsWith("mid") ? 0.62 : 0.74,
                pixelSnap: true,
                flipX: false,
                rotation: 0
            });
        }
    }
}

function sectorClimbProgress(scene, area) {
    const playerY = scene.player?.position?.y;
    const sectorId = area?.sectorId;
    const sectorBounds = [...(scene.world?.areas ?? []), ...(scene.world?.landmarks ?? [])]
        .filter((candidate) => candidate.sectorId === sectorId && candidate.bounds)
        .map(({ bounds }) => bounds);
    if (!Number.isFinite(playerY) || sectorBounds.length === 0) return 0;
    const top = Math.min(...sectorBounds.map(({ y }) => y));
    const bottom = Math.max(...sectorBounds.map(({ y, height }) => y + height));
    if (![top, bottom].every(Number.isFinite) || bottom <= top) return 0;
    return clamp((bottom - playerY) / (bottom - top), 0, 1);
}

function authoredDefinitionForArea(definitions, area) {
    return definitions[area?.areaId] ?? definitions[area?.id];
}

export function authoredBackdropEnvironmentAreas(scene) {
    const bossEnvironmentArea = activeBossEnvironmentArea(scene);
    if (bossEnvironmentArea) return Object.freeze([bossEnvironmentArea]);
    const transition = authoredSectorBackdropTransition(scene);
    if (transition) return Object.freeze([transition.fromArea, transition.toArea]);
    const area = currentAuthoredArea(scene);
    return Object.freeze(area ? [area] : []);
}

function authoredSectorBackdropTransition(scene) {
    if (!scene?.world?.landmarks?.length) return null;
    const playerY = scene.player?.position?.y;
    if (!Number.isFinite(playerY)) return null;
    const regions = authoredRegions(scene.world);
    for (const transition of AUTHORED_SECTOR_TRANSITIONS) {
        const { fromSectorId, toSectorId } = transition;
        const fromArea = endpointRegion(regions, fromSectorId, "last");
        const toArea = endpointRegion(regions, toSectorId, "first");
        if (!fromArea || !toArea) continue;
        const fromBoundaryY = Number.isFinite(fromArea.exit?.y) ? fromArea.exit.y : fromArea.bounds?.y;
        const toBoundaryY = Number.isFinite(toArea.entry?.y)
            ? toArea.entry.y
            : toArea.bounds?.y + toArea.bounds?.height;
        if (!Number.isFinite(fromBoundaryY) || !Number.isFinite(toBoundaryY)) continue;
        const boundaryY = (fromBoundaryY + toBoundaryY) * 0.5;
        const halfSpan = AUTHORED_SECTOR_CROSSFADE_WORLD_SPAN * 0.5;
        if (playerY > boundaryY + halfSpan || playerY < boundaryY - halfSpan) continue;
        const linearProgress = clamp((boundaryY + halfSpan - playerY) / (halfSpan * 2), 0, 1);
        return {
            ...transition,
            fromArea,
            toArea,
            progress: smoothstep(linearProgress)
        };
    }
    return null;
}

function authoredRegions(world) {
    return world?.landmarks?.length ? world.landmarks : (world?.areas ?? []);
}

function endpointRegion(regions, sectorId, endpoint) {
    const candidates = regions.filter((region) => region.sectorId === sectorId && region.bounds);
    if (candidates.length === 0) return null;
    return candidates.reduce((selected, candidate) => {
        const selectedOrder = selected.order ?? 0;
        const candidateOrder = candidate.order ?? 0;
        return endpoint === "last"
            ? candidateOrder > selectedOrder
                ? candidate
                : selected
            : candidateOrder < selectedOrder
              ? candidate
              : selected;
    });
}

function blendedTransitionPalette(definition, transition, fallbackAltitude) {
    const fromPalette = authoredEnvironmentZone(definition, transition.fromArea, fallbackAltitude).palette;
    const toPalette = authoredEnvironmentZone(definition, transition.toArea, fallbackAltitude).palette;
    return Object.fromEntries(
        Object.keys(fromPalette).map((key) => [
            key,
            interpolateHexColor(fromPalette[key], toPalette[key], transition.progress)
        ])
    );
}

function interpolateHexColor(from, to, progress) {
    const fromRgb = parseHexColor(from);
    const toRgb = parseHexColor(to);
    if (!fromRgb || !toRgb) return progress < 0.5 ? from : to;
    const channels = fromRgb.map((channel, index) => Math.round(channel + (toRgb[index] - channel) * progress));
    return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function parseHexColor(value) {
    const match = /^#([0-9a-f]{6})$/i.exec(value ?? "");
    if (!match) return null;
    return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16));
}

function smoothstep(value) {
    return value * value * (3 - 2 * value);
}

function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}
