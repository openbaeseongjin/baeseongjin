import { TERRAIN_BLOCK_POOL, TERRAIN_BLOCK_PRESET_ID } from "./TerrainBlockPool.js";

const ONE_WAY_STATE = Object.freeze({
    DISABLED: "false",
    ENABLED: "true"
});

const BLOCK_STYLE_BY_PRESET_ID = Object.freeze({
    [TERRAIN_BLOCK_PRESET_ID.PLATFORM]: Object.freeze({ accentOpacity: 0.18, panelStep: 48 }),
    [TERRAIN_BLOCK_PRESET_ID.SAFE_DECK]: Object.freeze({ accentOpacity: 0.46, panelStep: 64 }),
    [TERRAIN_BLOCK_PRESET_ID.RECOVERY]: Object.freeze({ accentOpacity: 0.34, panelStep: 40 }),
    [TERRAIN_BLOCK_PRESET_ID.OVERHANG]: Object.freeze({ accentOpacity: 0.2, panelStep: 48 }),
    [TERRAIN_BLOCK_PRESET_ID.SEALED_DOOR]: Object.freeze({ accentOpacity: 0.52, panelStep: 24 }),
    [TERRAIN_BLOCK_PRESET_ID.COVER]: Object.freeze({ accentOpacity: 0.28, panelStep: 32 }),
    [TERRAIN_BLOCK_PRESET_ID.SOLID]: Object.freeze({ accentOpacity: 0.22, panelStep: 40 })
});

const PANEL_STEP_BY_VARIANT_ID = Object.freeze({
    panel: 48,
    rib: 32,
    brace: 64,
    beacon: 40,
    stripe: 32,
    rail: 56,
    "cross-brace": 48,
    diagonal: 64,
    shutter: 16,
    warning: 24,
    recess: 32
});

class EmptySurfaceCapabilityRenderer {
    draw() {}
}

class OneWaySurfaceRenderer {
    draw({ context, surface, material, palette }) {
        context.strokeStyle = material.oneWayColor ?? palette.oneWayEdge;
        context.lineWidth = 3;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(surface.vertices[0].x, surface.vertices[0].y);
        const edgeEnd = surface.oneWayEdgeEnd ?? 1;
        for (let index = 1; index <= edgeEnd && index < surface.vertices.length; index += 1) {
            context.lineTo(surface.vertices[index].x, surface.vertices[index].y);
        }
        context.stroke();
        context.lineCap = "butt";
    }
}

const EMPTY_CAPABILITY_RENDERER = Object.freeze(new EmptySurfaceCapabilityRenderer());
const ONE_WAY_RENDERER = Object.freeze(new OneWaySurfaceRenderer());
const ONE_WAY_RENDERER_BY_STATE = Object.freeze({
    [ONE_WAY_STATE.DISABLED]: EMPTY_CAPABILITY_RENDERER,
    [ONE_WAY_STATE.ENABLED]: ONE_WAY_RENDERER
});

function oneWayState(surface) {
    return String(surface.oneWay === true);
}

function clippedSurface(context, painter, surface, draw) {
    context.save();
    painter.tracePath(context, surface.vertices);
    context.clip();
    draw();
    context.restore();
}

function drawDeckPanels(context, bounds, step, color) {
    const panelTop = bounds.minY + 4;
    const panelBottom = bounds.maxY - 3;
    context.strokeStyle = color;
    context.lineWidth = 1;
    for (let x = bounds.minX; x < bounds.maxX; x += step) {
        const right = Math.min(bounds.maxX, x + step);
        context.strokeRect(x + 2, panelTop, Math.max(0, right - x - 4), Math.max(1, panelBottom - panelTop));
    }
}

function drawDiagonalBraces(context, bounds, step, color) {
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    for (let x = bounds.minX; x < bounds.maxX; x += step) {
        const right = Math.min(bounds.maxX, x + step);
        context.moveTo(x + 3, bounds.minY + 4);
        context.lineTo(right - 3, bounds.maxY - 4);
        context.moveTo(right - 3, bounds.minY + 4);
        context.lineTo(x + 3, bounds.maxY - 4);
    }
    context.stroke();
}

class TerrainBlockRenderer {
    constructor({ painter, presetId }) {
        this.painter = painter;
        this.presetId = presetId;
        this.style = BLOCK_STYLE_BY_PRESET_ID[presetId];
    }

    draw({ context, entry, material, palette, viewport, presentation }) {
        const { surface, bounds } = entry;
        this.painter.drawFill(context, surface.vertices, bounds, material, palette, viewport);
        if (material.blockOverlay) this.drawStructure(context, surface, bounds, palette, presentation);
        this.painter.drawEdgeTiles(context, entry, material, viewport, 1);
        context.strokeStyle = palette.terrainEdge;
        context.lineWidth = 3;
        this.painter.tracePath(context, surface.vertices);
        context.stroke();
        ONE_WAY_RENDERER_BY_STATE[oneWayState(surface)].draw({ context, surface, material, palette });
    }

    drawStructure(context, surface, bounds, palette, presentation) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        if (width <= 0 || height <= 0) return;
        const step = PANEL_STEP_BY_VARIANT_ID[presentation.variantId] ?? this.style.panelStep;
        const accent = `${palette.accent}${Math.round(this.style.accentOpacity * 255)
            .toString(16)
            .padStart(2, "0")}`;

        clippedSurface(context, this.painter, surface, () => {
            switch (this.presetId) {
                case TERRAIN_BLOCK_PRESET_ID.OVERHANG:
                    drawDiagonalBraces(context, bounds, step, accent);
                    break;
                case TERRAIN_BLOCK_PRESET_ID.SEALED_DOOR:
                    this.drawSealedDoor(context, bounds, step, accent);
                    break;
                case TERRAIN_BLOCK_PRESET_ID.COVER:
                case TERRAIN_BLOCK_PRESET_ID.SOLID:
                    this.drawSolidPanels(context, bounds, step, accent);
                    break;
                default:
                    drawDeckPanels(context, bounds, step, accent);
                    this.drawDeckAccents(context, bounds, accent);
                    break;
            }
        });
    }

    drawDeckAccents(context, bounds, accent) {
        context.fillStyle = accent;
        context.fillRect(bounds.minX + 4, bounds.maxY - 5, Math.max(0, bounds.maxX - bounds.minX - 8), 2);
    }

    drawSealedDoor(context, bounds, step, accent) {
        context.strokeStyle = accent;
        context.lineWidth = 2;
        context.beginPath();
        for (let y = bounds.minY + step * 0.5; y < bounds.maxY; y += step) {
            context.moveTo(bounds.minX + 3, y);
            context.lineTo(bounds.maxX - 3, y);
        }
        context.stroke();
    }

    drawSolidPanels(context, bounds, step, accent) {
        drawDeckPanels(context, bounds, step, accent);
        context.fillStyle = accent;
        for (let y = bounds.minY + 8; y < bounds.maxY - 4; y += step) {
            context.fillRect(bounds.minX + 5, y, 3, 3);
            context.fillRect(bounds.maxX - 8, y, 3, 3);
        }
    }
}

class TerrainBlockRendererCatalog {
    constructor({ painter }) {
        this.rendererByPresetId = Object.freeze(
            Object.fromEntries(
                Object.keys(TERRAIN_BLOCK_POOL).map((presetId) => [
                    presetId,
                    Object.freeze(new TerrainBlockRenderer({ painter, presetId }))
                ])
            )
        );
    }

    rendererFor(presentation) {
        return (
            this.rendererByPresetId[presentation.presetId] ?? this.rendererByPresetId[TERRAIN_BLOCK_PRESET_ID.PLATFORM]
        );
    }
}

export function createPixelTerrainSurfaceRendererCatalog({ painter }) {
    return new TerrainBlockRendererCatalog({ painter });
}
