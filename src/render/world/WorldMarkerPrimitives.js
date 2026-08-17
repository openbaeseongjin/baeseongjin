export function drawCheckpointBeacon(context, checkpoint, { active = false, reached = false } = {}) {
    context.save();
    context.translate(checkpoint.x, checkpoint.y);
    context.globalAlpha = reached ? 0.42 : 0.96;

    // Keep the shared checkpoint readable in every sector without borrowing a
    // sector-specific accent. Its state is carried by the shutter silhouette:
    // closed while dormant, split open around a vertical core while active.
    context.fillStyle = "#090e13";
    context.fillRect(-24, -7, 48, 12);
    context.fillStyle = "#252d35";
    context.fillRect(-20, -10, 40, 4);
    context.fillStyle = "#3a444d";
    context.fillRect(-16, -6, 32, 2);
    context.fillRect(-21, 0, 6, 3);
    context.fillRect(15, 0, 6, 3);

    context.fillStyle = "#111820";
    context.beginPath();
    context.moveTo(-16, -10);
    context.lineTo(-16, -27);
    context.lineTo(-11, -35);
    context.lineTo(11, -35);
    context.lineTo(16, -27);
    context.lineTo(16, -10);
    context.closePath();
    context.fill();
    context.strokeStyle = "#4a5660";
    context.lineWidth = 2;
    context.stroke();

    context.fillStyle = "#202a33";
    context.fillRect(-11, -30, 22, 18);
    context.fillStyle = "#3f4a54";
    context.fillRect(-16, -27, 4, 16);
    context.fillRect(12, -27, 4, 16);

    if (active) {
        context.fillStyle = "#4f5b65";
        context.beginPath();
        context.moveTo(-10, -30);
        context.lineTo(-18, -37);
        context.lineTo(-15, -41);
        context.lineTo(-7, -34);
        context.lineTo(-5, -30);
        context.closePath();
        context.fill();
        context.beginPath();
        context.moveTo(10, -30);
        context.lineTo(18, -37);
        context.lineTo(15, -41);
        context.lineTo(7, -34);
        context.lineTo(5, -30);
        context.closePath();
        context.fill();

        context.fillStyle = "rgba(207, 232, 235, 0.18)";
        context.fillRect(-6, -33, 12, 24);
        context.fillStyle = "#cfe8eb";
        context.fillRect(-3, -30, 6, 18);
        context.fillStyle = "#f2f6f5";
        context.fillRect(-1, -28, 2, 14);
    } else {
        context.fillStyle = reached ? "#3f4850" : "#69757f";
        context.fillRect(-8, -28, 16, 16);
        context.fillStyle = "#151d24";
        context.fillRect(-1, -28, 2, 16);
        context.fillStyle = reached ? "#59636c" : "#9ba5ad";
        context.fillRect(-9, -34, 18, 3);
        context.fillRect(-4, -25, 8, 3);
    }

    context.restore();
}

export function drawExitBeacon(context, summit) {
    context.save();
    context.translate(summit.x, summit.y);
    context.globalAlpha = 0.82;
    context.fillStyle = "#111827";
    context.fillRect(-30, -44, 60, 48);
    context.strokeStyle = "#a7f3d0";
    context.lineWidth = 3;
    context.strokeRect(-28, -42, 56, 44);
    context.fillStyle = "#6ee7b7";
    context.fillRect(-18, -30, 36, 5);
    context.beginPath();
    context.moveTo(-10, -13);
    context.lineTo(0, -5);
    context.lineTo(10, -13);
    context.stroke();
    context.restore();
}
