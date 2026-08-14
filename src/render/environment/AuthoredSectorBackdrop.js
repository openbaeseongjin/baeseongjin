function drawPanelGrid(context, { x, y, width, height, color, step = 48 }) {
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.beginPath();
    for (let lineX = x + step; lineX < x + width; lineX += step) {
        context.moveTo(lineX, y);
        context.lineTo(lineX, y + height);
    }
    for (let lineY = y + step; lineY < y + height; lineY += step) {
        context.moveTo(x, lineY);
        context.lineTo(x + width, lineY);
    }
    context.stroke();
}

function drawFanHousing(context, x, y, size) {
    context.fillStyle = "rgba(8, 15, 26, 0.78)";
    context.fillRect(x - size * 0.5, y - size * 0.5, size, size);
    context.strokeStyle = "rgba(77, 101, 122, 0.75)";
    context.lineWidth = 3;
    context.strokeRect(x - size * 0.5, y - size * 0.5, size, size);
    context.save();
    context.translate(x, y);
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI * 0.5) {
        context.save();
        context.rotate(angle);
        context.fillStyle = "rgba(48, 67, 84, 0.72)";
        context.fillRect(5, -5, size * 0.3, 10);
        context.restore();
    }
    context.fillStyle = "rgba(91, 119, 140, 0.9)";
    context.fillRect(-5, -5, 10, 10);
    context.restore();
}

function drawIndustrialShaft(context, { cssWidth, cssHeight, palette, camera, area }) {
    const driftX = Math.round((camera.x * 0.04) % 48);
    const driftY = Math.round((camera.y * 0.025) % 64);
    const wallWidth = Math.max(150, Math.round(cssWidth * 0.2));

    context.save();
    context.globalAlpha = 0.92;
    context.fillStyle = "rgba(8, 15, 26, 0.86)";
    context.fillRect(-driftX, 0, wallWidth, cssHeight);
    context.fillRect(cssWidth - wallWidth - driftX, 0, wallWidth + driftX, cssHeight);
    drawPanelGrid(context, {
        x: -driftX,
        y: 0,
        width: wallWidth,
        height: cssHeight,
        color: "rgba(103, 232, 249, 0.07)"
    });

    context.globalAlpha = 0.7;
    context.fillStyle = palette.silhouetteFar;
    context.fillRect(wallWidth + 34, 0, 86, cssHeight);
    context.fillRect(cssWidth - wallWidth - 120, 0, 86, cssHeight);
    drawPanelGrid(context, {
        x: wallWidth + 34,
        y: 0,
        width: 86,
        height: cssHeight,
        color: "rgba(103, 232, 249, 0.045)",
        step: 64
    });
    drawPanelGrid(context, {
        x: cssWidth - wallWidth - 120,
        y: 0,
        width: 86,
        height: cssHeight,
        color: "rgba(103, 232, 249, 0.045)",
        step: 64
    });
    context.globalAlpha = 0.9;
    drawPanelGrid(context, {
        x: cssWidth - wallWidth - driftX,
        y: 0,
        width: wallWidth + driftX,
        height: cssHeight,
        color: "rgba(103, 232, 249, 0.07)"
    });

    context.fillStyle = palette.silhouetteMid;
    for (let y = -80 + driftY; y < cssHeight + 120; y += 176) {
        context.fillRect(wallWidth - 18, y, cssWidth - wallWidth * 2 + 36, 12);
        context.fillRect(wallWidth - 8, y - 8, 8, 28);
        context.fillRect(cssWidth - wallWidth, y - 8, 8, 28);
    }

    context.strokeStyle = "rgba(54, 76, 94, 0.72)";
    context.lineWidth = 5;
    for (const x of [wallWidth - 34, cssWidth - wallWidth + 34]) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, cssHeight);
        for (let y = -40 + driftY; y < cssHeight + 80; y += 96) {
            context.moveTo(x - 20, y);
            context.lineTo(x + 20, y + 48);
            context.moveTo(x + 20, y);
            context.lineTo(x - 20, y + 48);
        }
        context.stroke();
    }

    context.strokeStyle = "rgba(88, 112, 132, 0.7)";
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(36 - driftX, -20);
    context.lineTo(36 - driftX, cssHeight + 20);
    context.moveTo(72 - driftX, -20);
    context.lineTo(72 - driftX, cssHeight + 20);
    context.moveTo(cssWidth - 54 - driftX, -20);
    context.lineTo(cssWidth - 54 - driftX, cssHeight + 20);
    context.stroke();

    context.strokeStyle = "rgba(29, 49, 67, 0.85)";
    context.lineWidth = 11;
    context.beginPath();
    context.moveTo(106 - driftX, -24);
    context.lineTo(106 - driftX, cssHeight + 24);
    context.lineTo(142 - driftX, cssHeight + 24);
    context.moveTo(cssWidth - 104 - driftX, -24);
    context.lineTo(cssWidth - 104 - driftX, cssHeight + 24);
    context.stroke();

    context.strokeStyle = "rgba(44, 70, 89, 0.6)";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(wallWidth - 4, -20);
    context.bezierCurveTo(wallWidth + 90, 100, wallWidth + 20, 200, wallWidth + 112, 310);
    context.moveTo(cssWidth - wallWidth + 4, 40);
    context.bezierCurveTo(
        cssWidth - wallWidth - 80,
        160,
        cssWidth - wallWidth - 30,
        250,
        cssWidth - wallWidth - 110,
        390
    );
    context.stroke();

    drawFanHousing(context, 104 - driftX, Math.round(cssHeight * 0.34), 86);
    drawFanHousing(context, cssWidth - 98 - driftX, Math.round(cssHeight * 0.7), 72);

    for (let y = 72 + driftY; y < cssHeight; y += 144) {
        context.fillStyle = "rgba(251, 146, 60, 0.72)";
        context.fillRect(wallWidth - 32, y, 5, 9);
        context.fillRect(cssWidth - wallWidth + 27, y + 46, 5, 9);
    }
    context.fillStyle = "rgba(103, 232, 249, 0.18)";
    context.fillRect(Math.round(cssWidth * 0.44), Math.round(cssHeight * 0.26), Math.round(cssWidth * 0.12), 34);
    context.fillStyle = "rgba(125, 211, 252, 0.26)";
    context.font = "700 11px ui-monospace, monospace";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(area?.name ?? "SERVICE SHAFT", cssWidth - wallWidth + 22, 28);
    context.fillStyle = "rgba(251, 146, 60, 0.46)";
    context.fillText("VERTICAL GRID / LOCKDOWN", cssWidth - wallWidth + 22, 44);
    context.restore();
}

function drawResidentialStack(context, { cssWidth, cssHeight, palette, camera, area }) {
    const driftX = Math.round((camera.x * 0.035) % 56);
    const driftY = Math.round((camera.y * 0.02) % 72);
    const blockWidth = Math.max(190, Math.round(cssWidth * 0.27));

    context.save();
    context.globalAlpha = 0.84;
    for (const side of [0, 1]) {
        const x = side === 0 ? -driftX : cssWidth - blockWidth - driftX;
        context.fillStyle = palette.silhouetteNear;
        context.fillRect(x, 0, blockWidth + (side === 1 ? driftX : 0), cssHeight);
        drawPanelGrid(context, {
            x,
            y: 0,
            width: blockWidth,
            height: cssHeight,
            color: "rgba(226, 190, 120, 0.08)",
            step: 40
        });
        for (let row = 34 + driftY; row < cssHeight; row += 86) {
            for (let column = x + 24; column < x + blockWidth - 16; column += 46) {
                context.fillStyle = (row + column) % 3 === 0 ? "rgba(250, 204, 120, 0.2)" : "rgba(18, 24, 30, 0.7)";
                context.fillRect(column, row, 13, 20);
            }
        }
    }

    context.fillStyle = palette.silhouetteMid;
    for (let y = 118 + driftY; y < cssHeight + 80; y += 188) {
        const bridgeX = blockWidth - 18;
        const bridgeWidth = cssWidth - blockWidth * 2 + 36;
        context.fillRect(bridgeX, y, bridgeWidth, 12);
        context.fillRect(bridgeX, y - 12, 3, 24);
        context.fillRect(bridgeX + bridgeWidth - 3, y - 12, 3, 24);
        context.strokeStyle = "rgba(190, 166, 112, 0.28)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(bridgeX, y - 9);
        context.lineTo(bridgeX + bridgeWidth, y - 9);
        context.stroke();
    }

    context.fillStyle = "rgba(173, 148, 94, 0.18)";
    context.fillRect(blockWidth + 36, Math.round(cssHeight * 0.22), 124, 38);
    context.fillStyle = "rgba(245, 158, 11, 0.48)";
    context.fillRect(blockWidth + 46, Math.round(cssHeight * 0.22) + 9, 54, 4);
    context.fillStyle = "rgba(253, 230, 138, 0.34)";
    context.font = "700 11px ui-monospace, monospace";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(area?.name ?? "RESIDENTIAL DISTRICT", 26, 26);
    context.fillStyle = "rgba(245, 158, 11, 0.42)";
    context.fillText("SECTOR 02 / EVACUATION ROUTE", 26, 42);
    context.restore();
}

export function drawAuthoredSectorBackdrop(context, { scene, viewport, palette, area }) {
    const args = {
        cssWidth: viewport.cssWidth,
        cssHeight: viewport.cssHeight,
        palette,
        camera: scene.camera,
        area
    };
    if (area?.sectorId === "sector-01") {
        drawIndustrialShaft(context, args);
        return true;
    }
    if (area?.sectorId === "sector-02") {
        drawResidentialStack(context, args);
        return true;
    }
    return false;
}
