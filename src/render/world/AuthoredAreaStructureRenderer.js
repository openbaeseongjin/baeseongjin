import { isVisible } from "../RenderViewport.js";

const SECTOR_STYLES = Object.freeze({
    "sector-01": Object.freeze({
        wall: "rgba(10, 20, 32, 0.94)",
        wallInset: "rgba(31, 49, 65, 0.92)",
        edge: "rgba(82, 111, 132, 0.82)",
        accent: "rgba(103, 232, 249, 0.28)",
        sign: "rgba(186, 230, 253, 0.72)",
        wallWidth: 44,
        bulkheadHeight: 58
    }),
    "sector-02": Object.freeze({
        wall: "rgba(17, 23, 32, 0.92)",
        wallInset: "rgba(48, 55, 65, 0.9)",
        edge: "rgba(116, 108, 94, 0.76)",
        accent: "rgba(251, 191, 36, 0.42)",
        sign: "rgba(254, 240, 188, 0.68)",
        wallWidth: 36,
        bulkheadHeight: 48
    })
});

const DEFAULT_STYLE = SECTOR_STYLES["sector-01"];

function renderBounds(area) {
    const { x, y, width, height } = area.bounds;
    return Object.freeze({ minX: x, minY: y, maxX: x + width, maxY: y + height });
}

export class AuthoredAreaStructureRenderer {
    draw({ context, scene, viewport, renderStats }) {
        if (scene.world.landmarks?.length) {
            renderStats?.recordCollection("areaStructures", 0, 0);
            return;
        }
        const areas = (scene.world.areas ?? []).filter(({ bounds }) => bounds);
        if (areas.length === 0) {
            renderStats?.recordCollection("areaStructures", 0, 0);
            return;
        }

        const gates = new Map((scene.world.gates ?? []).map((gate) => [gate.id, gate]));
        const visible = areas.filter((area) => isVisible(viewport, renderBounds(area)));
        for (const area of visible) this.drawArea(context, area, gates.get(area.gateId));
        renderStats?.recordCollection("areaStructures", areas.length, visible.length);
    }

    drawArea(context, area, gate) {
        const style = SECTOR_STYLES[area.sectorId] ?? DEFAULT_STYLE;
        const { x, y, width, height } = area.bounds;
        const right = x + width;
        const wallWidth = style.wallWidth;
        const bulkheadHeight = style.bulkheadHeight;

        context.save();
        context.fillStyle = style.wall;
        context.fillRect(x, y, wallWidth, height);
        context.fillRect(right - wallWidth, y, wallWidth, height);

        context.fillStyle = style.wallInset;
        context.fillRect(x + wallWidth - 10, y, 10, height);
        context.fillRect(right - wallWidth, y, 10, height);

        context.fillStyle = style.wall;
        context.fillRect(x, y - bulkheadHeight * 0.5, width, bulkheadHeight);

        context.fillStyle = style.wallInset;
        context.fillRect(x, y + bulkheadHeight * 0.5 - 10, width, 10);

        context.strokeStyle = style.edge;
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(x + wallWidth, y);
        context.lineTo(x + wallWidth, y + height);
        context.moveTo(right - wallWidth, y);
        context.lineTo(right - wallWidth, y + height);
        context.moveTo(x, y + bulkheadHeight * 0.5);
        context.lineTo(right, y + bulkheadHeight * 0.5);
        context.stroke();

        if (area.sectorId === "sector-01") {
            this.drawSector01BoundarySkin(context, area, style);
        } else {
            context.fillStyle = style.accent;
            for (let ribY = y + 96; ribY < y + height - 48; ribY += 192) {
                context.fillRect(x + wallWidth, ribY, 22, 6);
                context.fillRect(right - wallWidth - 22, ribY + 64, 22, 6);
            }
        }

        context.fillStyle = style.wall;
        context.fillRect(x + wallWidth + 18, y + 58, Math.min(250, width * 0.34), 46);
        context.fillStyle = style.sign;
        context.font = "800 13px ui-monospace, monospace";
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillText(`${String(area.order).padStart(2, "0")} · ${area.name}`, x + wallWidth + 30, y + 68);
        context.globalAlpha = 0.72;
        context.font = "700 10px ui-monospace, monospace";
        context.fillText(area.subtitle ?? "", x + wallWidth + 30, y + 86);
        context.restore();
    }

    drawSector01BoundarySkin(context, area, style) {
        const { x, y, width, height } = area.bounds;
        const right = x + width;
        const wallWidth = style.wallWidth;
        const bulkheadHeight = style.bulkheadHeight;
        const leftPanelX = x + 6;
        const rightPanelX = right - wallWidth + 10;
        const panelWidth = wallWidth - 16;

        context.fillStyle = "rgba(4, 11, 19, 0.94)";
        context.fillRect(x + 9, y, 7, height);
        context.fillRect(right - 16, y, 7, height);
        context.fillStyle = "rgba(54, 76, 93, 0.68)";
        context.fillRect(x + wallWidth - 9, y, 4, height);
        context.fillRect(right - wallWidth + 5, y, 4, height);
        context.fillStyle = "rgba(103, 232, 249, 0.1)";
        context.fillRect(x + wallWidth - 8, y, 1, height);
        context.fillRect(right - wallWidth + 7, y, 1, height);

        for (let panelY = y + 10; panelY < y + height - 8; panelY += 64) {
            const panelHeight = Math.min(54, y + height - panelY - 4);
            if (panelHeight <= 4) continue;

            context.fillStyle = "rgba(6, 15, 25, 0.96)";
            context.fillRect(leftPanelX, panelY, panelWidth, panelHeight);
            context.fillRect(rightPanelX, panelY, panelWidth, panelHeight);
            context.strokeStyle = "rgba(64, 88, 106, 0.72)";
            context.lineWidth = 1;
            context.strokeRect(leftPanelX, panelY, panelWidth, panelHeight);
            context.strokeRect(rightPanelX, panelY, panelWidth, panelHeight);

            context.fillStyle = "rgba(100, 116, 139, 0.46)";
            for (const boltY of [panelY + 5, panelY + panelHeight - 7]) {
                context.fillRect(leftPanelX + 4, boltY, 2, 2);
                context.fillRect(leftPanelX + panelWidth - 6, boltY, 2, 2);
                context.fillRect(rightPanelX + 4, boltY, 2, 2);
                context.fillRect(rightPanelX + panelWidth - 6, boltY, 2, 2);
            }

            context.fillStyle = "rgba(29, 48, 63, 0.88)";
            context.fillRect(leftPanelX + 7, panelY + 10, panelWidth - 14, Math.max(3, panelHeight - 20));
            context.fillRect(rightPanelX + 7, panelY + 10, panelWidth - 14, Math.max(3, panelHeight - 20));
        }

        for (let serviceY = y + 48; serviceY < y + height - 32; serviceY += 192) {
            context.fillStyle = "rgba(103, 232, 249, 0.32)";
            context.fillRect(x + wallWidth - 8, serviceY, 3, 14);
            context.fillRect(right - wallWidth + 5, serviceY + 64, 3, 14);
            context.fillStyle = "rgba(245, 158, 11, 0.62)";
            context.fillRect(x + 19, serviceY + 22, 3, 3);
            context.fillRect(right - 22, serviceY + 86, 3, 3);
        }

        context.fillStyle = "rgba(54, 76, 93, 0.78)";
        for (let braceY = y + 96; braceY < y + height - 48; braceY += 192) {
            context.fillRect(x + wallWidth - 4, braceY, 16, 4);
            context.fillRect(right - wallWidth - 12, braceY + 64, 16, 4);
        }

        const bulkheadTop = y - bulkheadHeight * 0.5;
        this.drawSector01ReinforcedBulkhead(context, x, right, bulkheadTop, bulkheadHeight);
    }

    drawSector01ReinforcedBulkhead(context, startX, endX, top, height) {
        const insetStart = startX + 4;
        const insetEnd = endX - 4;
        const span = insetEnd - insetStart;
        if (span <= 8) return;

        context.fillStyle = "rgba(4, 10, 17, 0.98)";
        context.fillRect(insetStart, top + 2, span, height - 4);

        context.fillStyle = "rgba(22, 39, 53, 0.98)";
        context.fillRect(insetStart, top + 3, span, 9);
        context.fillRect(insetStart, top + height - 12, span, 9);
        context.fillStyle = "rgba(92, 112, 128, 0.72)";
        context.fillRect(insetStart, top + 3, span, 2);
        context.fillRect(insetStart, top + height - 5, span, 2);

        for (let bayX = insetStart + 8; bayX < insetEnd - 8; bayX += 64) {
            const bayWidth = Math.min(52, insetEnd - bayX - 4);
            if (bayWidth <= 12) continue;

            context.fillStyle = "rgba(8, 18, 29, 0.98)";
            context.fillRect(bayX, top + 14, bayWidth, height - 28);
            context.strokeStyle = "rgba(76, 99, 117, 0.72)";
            context.lineWidth = 1;
            context.strokeRect(bayX, top + 14, bayWidth, height - 28);

            context.strokeStyle = "rgba(70, 91, 108, 0.86)";
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(bayX + 4, top + 17);
            context.lineTo(bayX + bayWidth - 4, top + height - 17);
            context.moveTo(bayX + bayWidth - 4, top + 17);
            context.lineTo(bayX + 4, top + height - 17);
            context.stroke();

            const gussetX = bayX + bayWidth * 0.5 - 6;
            const gussetY = top + height * 0.5 - 5;
            context.fillStyle = "rgba(34, 54, 70, 0.98)";
            context.fillRect(gussetX, gussetY, 12, 10);
            context.strokeStyle = "rgba(103, 126, 143, 0.72)";
            context.lineWidth = 1;
            context.strokeRect(gussetX, gussetY, 12, 10);
            context.fillStyle = "rgba(148, 163, 184, 0.58)";
            context.fillRect(gussetX + 2, gussetY + 2, 2, 2);
            context.fillRect(gussetX + 8, gussetY + 6, 2, 2);
        }

        context.fillStyle = "rgba(28, 48, 64, 0.99)";
        context.fillRect(insetStart, top + 6, 10, height - 12);
        context.fillRect(insetEnd - 10, top + 6, 10, height - 12);
        context.fillStyle = "rgba(105, 125, 141, 0.72)";
        context.fillRect(insetStart + 2, top + 8, 2, height - 16);
        context.fillRect(insetEnd - 4, top + 8, 2, height - 16);
        context.fillStyle = "rgba(245, 158, 11, 0.62)";
        context.fillRect(insetStart + 3, top + height * 0.5 - 3, 4, 6);
        context.fillRect(insetEnd - 7, top + height * 0.5 - 3, 4, 6);
    }
}
