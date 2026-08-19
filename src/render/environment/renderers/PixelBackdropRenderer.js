import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { drawAuthoredSectorBackdrop } from "../AuthoredSectorBackdrop.js";
import { AltitudeSunrise, currentAuthoredArea, sceneEnvironmentZone } from "../AltitudeZoneResolver.js";

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
        const zone = sceneEnvironmentZone(this.definition, scene);
        const palette = zone.palette;

        const gradient = context.createLinearGradient(0, 0, 0, cssHeight);
        gradient.addColorStop(0, palette.skyTop);
        gradient.addColorStop(1, palette.skyBottom);
        context.fillStyle = gradient;
        context.fillRect(0, 0, cssWidth, cssHeight);
        const brightness = this.sunrise.brightness(-playerAltitude);
        context.fillStyle = `rgba(255, 244, 214, ${0.04 + brightness * 0.16})`;
        context.fillRect(0, 0, cssWidth, cssHeight);

        const area = currentAuthoredArea(scene);
        const authoredAreaBackdropDrawn = this.drawAuthoredAreaBackdrop(context, { area, viewport, scene });
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

    drawAuthoredAreaBackdrop(context, { area, viewport, scene }) {
        const definition =
            this.authoredAreaEnvironmentDefinitions[area?.legacyAreaId] ??
            this.authoredAreaEnvironmentDefinitions[area?.id];
        if (!definition) return false;
        const layers = [...definition.backdrop.layers].sort((a, b) => a.depth - b.depth);
        if (!layers.some(({ frames }) => frames.length > 0)) return false;
        const climbProgress = sectorClimbProgress(scene, area);
        const areaCenterX = area.bounds.x + area.bounds.width * 0.5;
        const cameraX = scene.camera?.x ?? scene.player?.position?.x ?? areaCenterX;
        const horizontalOverscan = viewport.cssWidth * 0.03;
        context.save();
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
            const destinationX = (viewport.cssWidth - destinationWidth) * 0.5 + horizontalDrift;
            const destinationY = clamp(-verticalOverflow * (1 - climbProgress) + verticalDrift, -verticalOverflow, 0);
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
                opacity: layer.id === "far" ? 0.48 : layer.id === "mid" ? 0.62 : 0.74,
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

function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}
