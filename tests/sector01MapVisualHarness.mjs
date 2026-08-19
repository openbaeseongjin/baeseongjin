import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

const params = new URLSearchParams(globalThis.location.search);
const stageAlias = params.get("stage");
const stageSuffix = stageAlias
    ? stageAlias
          .split("-")
          .map((value) => value.padStart(2, "0"))
          .join("-")
    : null;
const selectedArea = stageAlias ? SECTOR_01_AREA_CATALOG.areas.find(({ id }) => id.endsWith(stageSuffix)) : null;
if (stageAlias && !selectedArea) throw new Error(`Unknown Sector 01 Stage '${stageAlias}'`);

const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const areas = selectedArea ? [selectedArea] : SECTOR_01_AREA_CATALOG.areas;
const columns = selectedArea ? 1 : 4;
const rows = Math.ceil(areas.length / columns);
const cellWidth = selectedArea ? Math.max(390, Number(params.get("width")) || 640) : 400;
const cellHeight = selectedArea ? Math.max(640, Number(params.get("height")) || 800) : 450;
canvas.width = cellWidth * columns;
canvas.height = cellHeight * rows;

function surfaceColor(kind) {
    if (kind === "recovery") return "#fbbf24";
    if (kind === "safe-deck") return "#60a5fa";
    if (kind === "cover" || kind === "solid" || kind === "overhang") return "#64748b";
    return "#cbd5e1";
}

function landmarkLabel(anchor) {
    if (anchor.label) return anchor.label;
    return anchor.id
        .split(":")
        .at(-1)
        .replace(/^(?:anchor|grip)-/, "")
        .replaceAll("-", " ")
        .toUpperCase();
}

function drawArea(area, index) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = column * cellWidth;
    const top = row * cellHeight;
    const paddingX = 24;
    const paddingTop = 42;
    const paddingBottom = 24;
    const scale = Math.min(
        (cellWidth - paddingX * 2) / area.bounds.width,
        (cellHeight - paddingTop - paddingBottom) / area.bounds.height
    );
    const centerX = left + cellWidth * 0.5;
    const mapTop = top + paddingTop;
    const mapX = (x) => centerX + x * scale;
    const mapY = (y) => mapTop + (y + area.bounds.height) * scale;

    context.fillStyle = "#0f172a";
    context.fillRect(left, top, cellWidth, cellHeight);
    context.strokeStyle = "#334155";
    context.strokeRect(left + 0.5, top + 0.5, cellWidth - 1, cellHeight - 1);
    context.fillStyle = "#e2e8f0";
    context.font = "800 16px ui-monospace, monospace";
    context.fillText(`${area.id.replace("sector-01-0", "1-")} · ${area.name}`, left + 14, top + 24);

    context.strokeStyle = "rgba(148, 163, 184, 0.32)";
    context.strokeRect(
        mapX(-area.bounds.width * 0.5),
        mapY(-area.bounds.height),
        area.bounds.width * scale,
        area.bounds.height * scale
    );

    for (const surface of area.surfaces) {
        if (surface.kind === "grapple-target" || surface.renderable === false) continue;
        context.beginPath();
        surface.vertices.forEach((vertex, vertexIndex) => {
            const x = mapX(vertex.x);
            const y = mapY(vertex.y);
            if (vertexIndex === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        });
        context.closePath();
        context.fillStyle = surfaceColor(surface.kind);
        context.globalAlpha = 0.72;
        context.fill();
        context.globalAlpha = 1;
    }

    context.beginPath();
    area.routePoints.forEach((point, pointIndex) => {
        if (pointIndex === 0) context.moveTo(mapX(point.x), mapY(point.y));
        else context.lineTo(mapX(point.x), mapY(point.y));
    });
    context.strokeStyle = "rgba(103, 232, 249, 0.52)";
    context.lineWidth = 2;
    context.stroke();

    const anchors = area.objects.filter(
        ({ id, kind }) => kind === "grapple-landmark" && !id.includes(":access-anchor-")
    );
    for (const anchor of anchors) {
        const x = mapX(anchor.position.x);
        const y = mapY(anchor.position.y);
        context.beginPath();
        context.arc(x, y, selectedArea ? 6 : 4, 0, Math.PI * 2);
        context.fillStyle = "#22d3ee";
        context.fill();
        context.fillStyle = "#cffafe";
        context.font = `${selectedArea ? 13 : 10}px ui-monospace, monospace`;
        context.fillText(landmarkLabel(anchor), x + 7, y - 5);
    }

    context.fillStyle = "#94a3b8";
    context.font = "700 11px ui-monospace, monospace";
    context.fillText(
        `${anchors.length} gameplay anchors · ${area.recoveryPoints.length} recovery points`,
        left + 14,
        top + cellHeight - 9
    );
}

areas.forEach(drawArea);
document.body.dataset.ready = "true";
document.body.dataset.stageCount = String(areas.length);
document.body.dataset.gameplayAnchorCount = String(
    areas.reduce(
        (total, area) =>
            total +
            area.objects.filter(({ id, kind }) => kind === "grapple-landmark" && !id.includes(":access-anchor-"))
                .length,
        0
    )
);
