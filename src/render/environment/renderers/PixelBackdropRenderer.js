import { paintSpriteFrame } from "../../sprites/SpriteCanvasPainter.js";
import { AltitudeSunrise } from "../AltitudeZoneResolver.js";

export class PixelBackdropRenderer {
    constructor({ definition, assets }) {
        this.definition = definition;
        this.assets = assets;
        this.sunrise = new AltitudeSunrise({ definition });
        this.status = assets ? "ready" : "pending";
    }

    draw({ context, scene, viewport }) {
        const { cssWidth, cssHeight } = viewport;
        const camera = scene.camera;
        const playerAltitude = scene.player?.position?.y ?? 0;
        const zone = this.definition.zoneAt(-playerAltitude);
        const palette = zone.palette;

        const gradient = context.createLinearGradient(0, 0, 0, cssHeight);
        gradient.addColorStop(0, palette.skyTop);
        gradient.addColorStop(1, palette.skyBottom);
        context.fillStyle = gradient;
        context.fillRect(0, 0, cssWidth, cssHeight);
        const brightness = this.sunrise.brightness(-playerAltitude);
        context.fillStyle = `rgba(255, 244, 214, ${0.04 + brightness * 0.16})`;
        context.fillRect(0, 0, cssWidth, cssHeight);

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

        const haze = context.createLinearGradient(0, cssHeight * 0.35, 0, cssHeight);
        haze.addColorStop(0, "rgba(184, 196, 196, 0.06)");
        haze.addColorStop(1, "rgba(8, 11, 16, 0)");
        context.fillStyle = haze;
        context.fillRect(0, 0, cssWidth, cssHeight);
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
