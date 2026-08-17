import { isVisible } from "../RenderViewport.js";

const SECTOR_STYLES = Object.freeze({
    "sector-01": Object.freeze({
        wall: "rgba(10, 20, 32, 0.94)",
        wallInset: "rgba(31, 49, 65, 0.92)",
        edge: "rgba(82, 111, 132, 0.82)",
        accent: "rgba(103, 232, 249, 0.52)",
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

        context.fillStyle = style.accent;
        for (let ribY = y + 96; ribY < y + height - 48; ribY += 192) {
            context.fillRect(x + wallWidth, ribY, 22, 6);
            context.fillRect(right - wallWidth - 22, ribY + 64, 22, 6);
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
}
