export const TERRAIN_SECTOR_ID = Object.freeze({
    INDUSTRIAL_MAINTENANCE: "sector-01",
    RESIDENTIAL_COMMERCIAL: "sector-02"
});

export const TERRAIN_SURFACE_KIND = Object.freeze({
    PLATFORM: "platform",
    SAFE_DECK: "safe-deck",
    RECOVERY: "recovery",
    OVERHANG: "overhang",
    SEALED_DOOR: "sealed-door",
    COVER: "cover",
    SOLID: "solid"
});

export const TERRAIN_PRESENTATION_ID = Object.freeze({
    GROUND_FOUNDATION: "terrain:ground-foundation"
});

const ONE_WAY_STATE = Object.freeze({
    DISABLED: "false",
    ENABLED: "true"
});

const SECTOR_01_SURFACE_STYLE = Object.freeze({
    PLATFORM: Object.freeze({
        fill: "rgba(9, 19, 31, 0.92)",
        panelStep: 32,
        grateBottomInset: 4,
        panelStroke: "rgba(82, 111, 132, 0.58)"
    }),
    SAFE_DECK: Object.freeze({
        fill: "rgba(13, 28, 42, 0.94)",
        panelStep: 64,
        grateBottomInset: 7,
        panelStroke: "rgba(82, 111, 132, 0.58)"
    }),
    RECOVERY: Object.freeze({
        fill: "rgba(7, 15, 25, 0.94)",
        panelStep: 32,
        grateBottomInset: 7,
        panelStroke: "rgba(100, 116, 139, 0.5)"
    }),
    OVERHANG: Object.freeze({ fill: "rgba(10, 18, 28, 0.96)" }),
    SEALED_DOOR: Object.freeze({ fill: "rgba(6, 12, 20, 0.98)" }),
    SOLID_PANEL: Object.freeze({ fill: "rgba(9, 19, 31, 0.92)" })
});

const SECTOR_01_EDGE_STYLE_BY_ONE_WAY = Object.freeze({
    [ONE_WAY_STATE.DISABLED]: Object.freeze({ opacity: 1, stroke: null, lineWidth: 3 }),
    [ONE_WAY_STATE.ENABLED]: Object.freeze({ opacity: 0.56, stroke: "rgba(61, 84, 100, 0.72)", lineWidth: 2 })
});

class EmptySurfaceCapabilityRenderer {
    draw() {}
}

class OneWaySurfaceRenderer {
    constructor({ stroke = null, lineWidth = 4, lineCap = "round" } = {}) {
        this.stroke = stroke;
        this.lineWidth = lineWidth;
        this.lineCap = lineCap;
    }

    draw({ context, surface, material, palette }) {
        context.strokeStyle = this.stroke ?? material.oneWayColor ?? palette.oneWayEdge;
        context.lineWidth = this.lineWidth;
        context.lineCap = this.lineCap;
        this.preparePath(context);
        context.beginPath();
        context.moveTo(surface.vertices[0].x, surface.vertices[0].y);
        const edgeEnd = surface.oneWayEdgeEnd ?? 1;
        for (let index = 1; index <= edgeEnd && index < surface.vertices.length; index += 1) {
            context.lineTo(surface.vertices[index].x, surface.vertices[index].y);
        }
        context.stroke();
        context.setLineDash([]);
        context.lineCap = "butt";
    }

    preparePath() {}
}

class DashedOneWaySurfaceRenderer extends OneWaySurfaceRenderer {
    constructor({ dash, ...style }) {
        super(style);
        this.dash = dash;
    }

    preparePath(context) {
        context.setLineDash(this.dash);
    }
}

class Sector01PassThroughGrateRenderer {
    constructor({ bottomInset }) {
        this.bottomInset = bottomInset;
    }

    draw({ context, bounds }) {
        const height = bounds.maxY - bounds.minY;
        const apertureTop = bounds.minY + (height <= 16 ? 5 : 7);
        const apertureBottom = bounds.maxY - this.bottomInset;
        if (apertureBottom - apertureTop < 2) return;

        context.fillStyle = "rgba(1, 6, 11, 0.92)";
        context.strokeStyle = "rgba(110, 139, 151, 0.42)";
        context.lineWidth = 1;
        for (let x = bounds.minX; x < bounds.maxX; x += 32) {
            const left = x + 4;
            const right = Math.min(bounds.maxX - 4, x + 28);
            if (right <= left) continue;
            context.fillRect(left, apertureTop, right - left, apertureBottom - apertureTop);
            context.strokeRect(left, apertureTop, right - left, apertureBottom - apertureTop);

            const centerX = (left + right) * 0.5;
            context.beginPath();
            context.moveTo(centerX - 5, apertureBottom - 1);
            context.lineTo(centerX, apertureTop + 1);
            context.lineTo(centerX + 5, apertureBottom - 1);
            context.stroke();
        }
    }
}

const EMPTY_CAPABILITY_RENDERER = Object.freeze(new EmptySurfaceCapabilityRenderer());
const STANDARD_ONE_WAY_RENDERER = Object.freeze(new OneWaySurfaceRenderer());
const SECTOR_01_ONE_WAY_RENDERER = Object.freeze(
    new DashedOneWaySurfaceRenderer({
        stroke: "rgba(125, 166, 176, 0.62)",
        lineWidth: 2,
        lineCap: "butt",
        dash: Object.freeze([12, 6])
    })
);
const SECTOR_01_FOUNDATION_ONE_WAY_RENDERER = Object.freeze(
    new OneWaySurfaceRenderer({ stroke: "rgba(125, 166, 176, 0.62)", lineWidth: 2, lineCap: "butt" })
);
const STANDARD_ONE_WAY_BY_STATE = Object.freeze({
    [ONE_WAY_STATE.DISABLED]: EMPTY_CAPABILITY_RENDERER,
    [ONE_WAY_STATE.ENABLED]: STANDARD_ONE_WAY_RENDERER
});
const SECTOR_01_ONE_WAY_BY_STATE = Object.freeze({
    [ONE_WAY_STATE.DISABLED]: EMPTY_CAPABILITY_RENDERER,
    [ONE_WAY_STATE.ENABLED]: SECTOR_01_ONE_WAY_RENDERER
});
const SECTOR_01_FOUNDATION_ONE_WAY_BY_STATE = Object.freeze({
    [ONE_WAY_STATE.DISABLED]: EMPTY_CAPABILITY_RENDERER,
    [ONE_WAY_STATE.ENABLED]: SECTOR_01_FOUNDATION_ONE_WAY_RENDERER
});

function oneWayState(surface) {
    return String(surface.oneWay === true);
}

class TerrainSurfaceRenderer {
    constructor({ painter, oneWayByState = STANDARD_ONE_WAY_BY_STATE }) {
        this.painter = painter;
        this.oneWayByState = oneWayByState;
    }

    draw({ context, entry, material, palette, viewport }) {
        const { surface, bounds } = entry;
        this.drawBeforeFill({ context, surface, bounds });
        this.painter.drawFill(context, surface.vertices, bounds, material, palette, viewport);
        this.drawStructure({ context, surface, bounds });
        this.painter.drawEdgeTiles(context, entry, material, viewport, this.edgeOpacity(surface));
        this.drawOutline({ context, surface, palette });
        this.oneWayByState[oneWayState(surface)].draw({ context, surface, material, palette });
    }

    drawBeforeFill() {}

    drawStructure() {}

    edgeOpacity() {
        return 1;
    }

    drawOutline({ context, surface, palette }) {
        context.strokeStyle = palette.terrainEdge;
        context.lineWidth = 3;
        this.painter.tracePath(context, surface.vertices);
        context.stroke();
    }
}

class Sector01TerrainSurfaceRenderer extends TerrainSurfaceRenderer {
    constructor({ painter, style, oneWayByState = SECTOR_01_ONE_WAY_BY_STATE }) {
        super({ painter, oneWayByState });
        this.style = style;
    }

    edgeStyle(surface) {
        return SECTOR_01_EDGE_STYLE_BY_ONE_WAY[oneWayState(surface)];
    }

    edgeOpacity(surface) {
        return this.edgeStyle(surface).opacity;
    }

    drawOutline({ context, surface, palette }) {
        const edgeStyle = this.edgeStyle(surface);
        context.strokeStyle = edgeStyle.stroke ?? palette.terrainEdge;
        context.lineWidth = edgeStyle.lineWidth;
        this.painter.tracePath(context, surface.vertices);
        context.stroke();
    }

    drawStructure({ context, surface, bounds }) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        if (width <= 0 || height <= 0) return;

        const innerTop = bounds.minY + Math.min(4, Math.max(2, height * 0.2));
        const innerBottom = bounds.maxY - Math.min(3, Math.max(1, height * 0.15));

        context.save();
        this.painter.tracePath(context, surface.vertices);
        context.clip();
        context.fillStyle = this.style.fill;
        context.fillRect(bounds.minX, bounds.minY, width, height);
        context.fillStyle = "rgba(71, 94, 112, 0.38)";
        context.fillRect(bounds.minX, innerTop, width, Math.min(3, height));
        context.fillStyle = "rgba(2, 8, 15, 0.86)";
        context.fillRect(bounds.minX, innerBottom, width, Math.max(1, bounds.maxY - innerBottom));
        this.drawDetails({ context, surface, bounds, height });
        context.restore();
    }

    drawDetails() {}
}

class Sector01PanelTerrainSurfaceRenderer extends Sector01TerrainSurfaceRenderer {
    constructor({ painter, style, passThroughByState }) {
        super({ painter, style });
        this.passThroughByState = passThroughByState;
    }

    drawDetails({ context, surface, bounds, height }) {
        this.passThroughByState[oneWayState(surface)].draw({ context, bounds });
        this.drawDeckPanels(context, bounds, height <= 16);
    }

    drawDeckPanels(context, bounds, isThin) {
        const panelTop = bounds.minY + (isThin ? 5 : 7);
        const panelBottom = bounds.maxY - 3;

        context.strokeStyle = this.style.panelStroke;
        context.lineWidth = 1;
        for (let x = bounds.minX; x < bounds.maxX; x += this.style.panelStep) {
            const right = Math.min(bounds.maxX, x + this.style.panelStep);
            context.strokeRect(x + 2, panelTop, Math.max(0, right - x - 4), Math.max(1, panelBottom - panelTop));
            context.fillStyle = "rgba(148, 163, 184, 0.34)";
            context.fillRect(x + 5, panelTop + 2, 2, 2);
            context.fillRect(Math.max(x + 5, right - 7), panelTop + 2, 2, 2);
        }
        this.drawPanelAccents(context, bounds);
    }

    drawPanelAccents(context, bounds) {
        context.fillStyle = "rgba(103, 232, 249, 0.2)";
        for (let x = bounds.minX + 14; x < bounds.maxX; x += 32) {
            context.fillRect(x, bounds.minY + 6, 3, Math.max(2, bounds.maxY - bounds.minY - 10));
        }
    }
}

class Sector01SafeDeckTerrainSurfaceRenderer extends Sector01PanelTerrainSurfaceRenderer {
    drawPanelAccents(context, bounds) {
        context.fillStyle = "rgba(245, 158, 11, 0.62)";
        for (let x = bounds.minX + 8; x < bounds.maxX - 4; x += 32) {
            context.fillRect(x, bounds.maxY - 7, 16, 3);
        }
        context.fillStyle = "rgba(103, 232, 249, 0.26)";
        for (let x = bounds.minX + 28; x < bounds.maxX; x += 64) {
            context.fillRect(x, bounds.minY + 7, 4, Math.max(2, bounds.maxY - bounds.minY - 12));
        }
    }
}

class Sector01RecoveryTerrainSurfaceRenderer extends Sector01PanelTerrainSurfaceRenderer {
    drawPanelAccents(context, bounds) {
        context.fillStyle = "rgba(245, 158, 11, 0.52)";
        context.fillRect(bounds.minX + 4, bounds.maxY - 5, Math.min(12, Math.max(0, bounds.maxX - bounds.minX - 8)), 2);
        context.fillRect(Math.max(bounds.minX + 4, bounds.maxX - 16), bounds.maxY - 5, 12, 2);
    }
}

class Sector01GroundFoundationTerrainSurfaceRenderer extends Sector01PanelTerrainSurfaceRenderer {
    constructor({ painter, style, passThroughByState }) {
        super({ painter, style, passThroughByState });
        this.oneWayByState = SECTOR_01_FOUNDATION_ONE_WAY_BY_STATE;
    }

    drawBeforeFill({ context, bounds }) {
        const width = bounds.maxX - bounds.minX;
        const top = bounds.minY + 4;
        const depth = 640;
        if (width <= 0) return;

        context.save();
        context.fillStyle = "rgba(3, 9, 16, 0.99)";
        context.fillRect(bounds.minX, top, width, depth);
        context.fillStyle = "rgba(18, 31, 44, 0.98)";
        context.fillRect(bounds.minX + 8, top + 12, Math.max(0, width - 16), depth - 12);
        context.fillStyle = "rgba(5, 13, 22, 0.92)";
        for (let x = bounds.minX + 28; x < bounds.maxX - 12; x += 64) {
            context.fillRect(x, top + 12, 8, depth - 12);
        }
        for (let y = top + 64; y < top + depth; y += 64) {
            context.fillRect(bounds.minX + 8, y, Math.max(0, width - 16), 4);
        }
        context.fillStyle = "rgba(103, 232, 249, 0.12)";
        context.fillRect(bounds.minX + 12, top + 18, 4, depth - 34);
        context.fillRect(bounds.maxX - 16, top + 18, 4, depth - 34);
        context.fillStyle = "rgba(245, 158, 11, 0.46)";
        for (let x = bounds.minX + 18; x < bounds.maxX - 18; x += 48) {
            context.fillRect(x, top + 18, 18, 4);
        }
        context.restore();
    }
}

class Sector01OverhangTerrainSurfaceRenderer extends Sector01TerrainSurfaceRenderer {
    drawDetails({ context, bounds }) {
        context.strokeStyle = "rgba(100, 116, 139, 0.7)";
        context.lineWidth = 2;
        context.beginPath();
        for (let x = bounds.minX; x < bounds.maxX; x += 48) {
            const right = Math.min(bounds.maxX, x + 48);
            context.moveTo(x + 3, bounds.minY + 6);
            context.lineTo(right - 3, bounds.maxY - 5);
            context.moveTo(right - 3, bounds.minY + 6);
            context.lineTo(x + 3, bounds.maxY - 5);
        }
        context.stroke();
        context.fillStyle = "rgba(148, 163, 184, 0.5)";
        for (let x = bounds.minX + 5; x < bounds.maxX; x += 48) {
            context.fillRect(x, bounds.minY + 5, 3, 3);
        }
    }
}

class Sector01SealedDoorTerrainSurfaceRenderer extends Sector01TerrainSurfaceRenderer {
    drawDetails({ context, bounds }) {
        context.strokeStyle = "rgba(100, 116, 139, 0.52)";
        context.lineWidth = 2;
        context.beginPath();
        for (let y = bounds.minY + 14; y < bounds.maxY; y += 16) {
            context.moveTo(bounds.minX + 4, y);
            context.lineTo(bounds.maxX - 4, y);
        }
        context.stroke();
        context.fillStyle = "rgba(245, 158, 11, 0.7)";
        for (let x = bounds.minX + 8; x < bounds.maxX - 4; x += 24) {
            context.fillRect(x, bounds.minY + 6, 12, 4);
        }
        context.fillStyle = "rgba(103, 232, 249, 0.2)";
        context.fillRect(bounds.minX + 7, bounds.minY + 16, 3, Math.max(0, bounds.maxY - bounds.minY - 24));
        context.fillRect(bounds.maxX - 10, bounds.minY + 16, 3, Math.max(0, bounds.maxY - bounds.minY - 24));
    }
}

class Sector01SolidPanelTerrainSurfaceRenderer extends Sector01TerrainSurfaceRenderer {
    drawDetails({ context, bounds }) {
        context.strokeStyle = "rgba(82, 111, 132, 0.58)";
        context.lineWidth = 1;
        for (let y = bounds.minY + 8; y < bounds.maxY; y += 32) {
            for (let x = bounds.minX + 3; x < bounds.maxX; x += 32) {
                context.strokeRect(x, y, Math.min(26, bounds.maxX - x - 3), Math.min(24, bounds.maxY - y - 3));
            }
        }
        context.fillStyle = "rgba(148, 163, 184, 0.34)";
        for (let y = bounds.minY + 12; y < bounds.maxY; y += 32) {
            context.fillRect(bounds.minX + 6, y, 3, 3);
            context.fillRect(bounds.maxX - 9, y, 3, 3);
        }
    }
}

class Sector02TerrainSurfaceRenderer extends TerrainSurfaceRenderer {
    drawStructure({ context, surface, bounds }) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        if (width <= 0 || height <= 0) return;

        context.save();
        this.painter.tracePath(context, surface.vertices);
        context.clip();
        context.fillStyle = "rgba(34, 28, 22, 0.48)";
        context.fillRect(bounds.minX, bounds.minY + Math.min(4, height * 0.2), width, height);
        context.strokeStyle = "rgba(253, 230, 138, 0.12)";
        context.lineWidth = 1;
        context.beginPath();
        const panelStep = 40;
        for (let x = bounds.minX + panelStep; x < bounds.maxX; x += panelStep) {
            context.moveTo(x, bounds.minY);
            context.lineTo(x, bounds.maxY);
        }
        context.stroke();
        this.drawDetails({ context, bounds });
        context.fillStyle = "rgba(253, 230, 138, 0.24)";
        for (let x = bounds.minX + 12; x < bounds.maxX; x += 28) {
            context.fillRect(x, bounds.minY + 3, 2, 2);
        }
        context.restore();
    }

    drawDetails() {}
}

class Sector02SealedDoorTerrainSurfaceRenderer extends Sector02TerrainSurfaceRenderer {
    drawDetails({ context, bounds }) {
        context.strokeStyle = "rgba(148, 163, 184, 0.26)";
        context.beginPath();
        for (let y = bounds.minY + 14; y < bounds.maxY; y += 16) {
            context.moveTo(bounds.minX, y);
            context.lineTo(bounds.maxX, y);
        }
        context.stroke();
        context.fillStyle = "rgba(245, 158, 11, 0.5)";
        for (let x = bounds.minX + 8; x < bounds.maxX; x += 24) {
            context.fillRect(x, bounds.minY + 5, 12, 3);
        }
    }
}

class Sector02OverhangTerrainSurfaceRenderer extends Sector02TerrainSurfaceRenderer {
    drawDetails({ context, bounds }) {
        context.strokeStyle = "rgba(100, 116, 139, 0.38)";
        context.beginPath();
        for (let x = bounds.minX; x < bounds.maxX; x += 48) {
            context.moveTo(x, bounds.minY);
            context.lineTo(Math.min(bounds.maxX, x + 48), bounds.maxY);
            context.moveTo(Math.min(bounds.maxX, x + 48), bounds.minY);
            context.lineTo(x, bounds.maxY);
        }
        context.stroke();
    }
}

class TerrainSurfaceRendererCatalog {
    constructor({ bySector, fallback }) {
        this.bySector = bySector;
        this.fallback = fallback;
    }

    rendererFor(sectorId, surface) {
        const sectorCatalog = this.bySector[sectorId] ?? this.fallback;
        return sectorCatalog.rendererFor(surface);
    }
}

class DirectTerrainSurfaceRendererCatalog {
    constructor(renderer) {
        this.renderer = renderer;
    }

    rendererFor() {
        return this.renderer;
    }
}

class DefinedTerrainSurfaceRendererCatalog {
    constructor({ byPresentationId = Object.freeze({}), byKind, fallback }) {
        this.byPresentationId = byPresentationId;
        this.byKind = byKind;
        this.fallback = fallback;
    }

    rendererFor(surface) {
        return this.byPresentationId[surface.presentationId] ?? this.byKind[surface.kind] ?? this.fallback;
    }
}

function passThroughRenderers(bottomInset) {
    return Object.freeze({
        [ONE_WAY_STATE.DISABLED]: EMPTY_CAPABILITY_RENDERER,
        [ONE_WAY_STATE.ENABLED]: Object.freeze(new Sector01PassThroughGrateRenderer({ bottomInset }))
    });
}

export function createPixelTerrainSurfaceRendererCatalog({ painter }) {
    const platform = new Sector01PanelTerrainSurfaceRenderer({
        painter,
        style: SECTOR_01_SURFACE_STYLE.PLATFORM,
        passThroughByState: passThroughRenderers(SECTOR_01_SURFACE_STYLE.PLATFORM.grateBottomInset)
    });
    const safeDeck = new Sector01SafeDeckTerrainSurfaceRenderer({
        painter,
        style: SECTOR_01_SURFACE_STYLE.SAFE_DECK,
        passThroughByState: passThroughRenderers(SECTOR_01_SURFACE_STYLE.SAFE_DECK.grateBottomInset)
    });
    const recovery = new Sector01RecoveryTerrainSurfaceRenderer({
        painter,
        style: SECTOR_01_SURFACE_STYLE.RECOVERY,
        passThroughByState: passThroughRenderers(SECTOR_01_SURFACE_STYLE.RECOVERY.grateBottomInset)
    });
    const groundFoundation = new Sector01GroundFoundationTerrainSurfaceRenderer({
        painter,
        style: SECTOR_01_SURFACE_STYLE.PLATFORM,
        passThroughByState: Object.freeze({
            [ONE_WAY_STATE.DISABLED]: EMPTY_CAPABILITY_RENDERER,
            [ONE_WAY_STATE.ENABLED]: EMPTY_CAPABILITY_RENDERER
        })
    });
    const sector01ByKind = Object.freeze({
        [TERRAIN_SURFACE_KIND.PLATFORM]: platform,
        [TERRAIN_SURFACE_KIND.SAFE_DECK]: safeDeck,
        [TERRAIN_SURFACE_KIND.RECOVERY]: recovery,
        [TERRAIN_SURFACE_KIND.OVERHANG]: new Sector01OverhangTerrainSurfaceRenderer({
            painter,
            style: SECTOR_01_SURFACE_STYLE.OVERHANG
        }),
        [TERRAIN_SURFACE_KIND.SEALED_DOOR]: new Sector01SealedDoorTerrainSurfaceRenderer({
            painter,
            style: SECTOR_01_SURFACE_STYLE.SEALED_DOOR
        }),
        [TERRAIN_SURFACE_KIND.COVER]: new Sector01SolidPanelTerrainSurfaceRenderer({
            painter,
            style: SECTOR_01_SURFACE_STYLE.SOLID_PANEL
        }),
        [TERRAIN_SURFACE_KIND.SOLID]: new Sector01SolidPanelTerrainSurfaceRenderer({
            painter,
            style: SECTOR_01_SURFACE_STYLE.SOLID_PANEL
        })
    });
    const sector02Platform = new Sector02TerrainSurfaceRenderer({ painter });
    const sector02ByKind = Object.freeze({
        [TERRAIN_SURFACE_KIND.PLATFORM]: sector02Platform,
        [TERRAIN_SURFACE_KIND.OVERHANG]: new Sector02OverhangTerrainSurfaceRenderer({ painter }),
        [TERRAIN_SURFACE_KIND.SEALED_DOOR]: new Sector02SealedDoorTerrainSurfaceRenderer({ painter })
    });
    const genericCatalog = new DirectTerrainSurfaceRendererCatalog(new TerrainSurfaceRenderer({ painter }));

    return new TerrainSurfaceRendererCatalog({
        bySector: Object.freeze({
            [TERRAIN_SECTOR_ID.INDUSTRIAL_MAINTENANCE]: new DefinedTerrainSurfaceRendererCatalog({
                byPresentationId: Object.freeze({
                    [TERRAIN_PRESENTATION_ID.GROUND_FOUNDATION]: groundFoundation
                }),
                byKind: sector01ByKind,
                fallback: platform
            }),
            [TERRAIN_SECTOR_ID.RESIDENTIAL_COMMERCIAL]: new DefinedTerrainSurfaceRendererCatalog({
                byKind: sector02ByKind,
                fallback: sector02Platform
            })
        }),
        fallback: genericCatalog
    });
}
