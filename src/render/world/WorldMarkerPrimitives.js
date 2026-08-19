export function drawCheckpointBeacon(context, checkpoint, { active = false, reached = false } = {}) {
    context.save();
    context.translate(checkpoint.x, checkpoint.y);
    context.globalAlpha = reached ? 0.48 : 0.98;

    // Stage save points share one neutral industrial silhouette across sectors.
    // The player-scale arch and explicit header communicate function, while the
    // closed/open shutters communicate state without relying on color alone.
    context.fillStyle = "#090e13";
    context.fillRect(-38, -10, 76, 14);
    context.fillStyle = "#252d35";
    context.fillRect(-34, -14, 68, 5);
    context.fillStyle = "#3a444d";
    context.fillRect(-29, -8, 58, 3);
    context.fillRect(-36, 0, 10, 4);
    context.fillRect(26, 0, 10, 4);

    context.fillStyle = "#111820";
    context.beginPath();
    context.moveTo(-28, -13);
    context.lineTo(-28, -50);
    context.lineTo(-20, -62);
    context.lineTo(20, -62);
    context.lineTo(28, -50);
    context.lineTo(28, -13);
    context.closePath();
    context.fill();
    context.strokeStyle = "#4a5660";
    context.lineWidth = 3;
    context.stroke();

    context.fillStyle = "#202a33";
    context.fillRect(-19, -50, 38, 36);
    context.fillStyle = "#3f4a54";
    context.fillRect(-28, -49, 7, 34);
    context.fillRect(21, -49, 7, 34);

    context.fillStyle = "#0b1118";
    context.fillRect(-27, -78, 54, 14);
    context.strokeStyle = "#56636d";
    context.lineWidth = 2;
    context.strokeRect(-27, -78, 54, 14);
    context.fillStyle = active ? "#d9f4ff" : reached ? "#65717a" : "#b6c0c7";
    context.font = "900 9px ui-monospace, monospace";
    context.textAlign = "center";
    context.fillText("STAGE SAVE", 0, -68);

    if (active) {
        context.fillStyle = "#4f5b65";
        context.beginPath();
        context.moveTo(-18, -50);
        context.lineTo(-31, -58);
        context.lineTo(-28, -64);
        context.lineTo(-13, -55);
        context.lineTo(-9, -49);
        context.closePath();
        context.fill();
        context.beginPath();
        context.moveTo(18, -50);
        context.lineTo(31, -58);
        context.lineTo(28, -64);
        context.lineTo(13, -55);
        context.lineTo(9, -49);
        context.closePath();
        context.fill();

        context.fillStyle = "rgba(207, 232, 235, 0.18)";
        context.fillRect(-10, -52, 20, 40);
        context.fillStyle = "#cfe8eb";
        context.fillRect(-5, -48, 10, 36);
        context.fillStyle = "#f2f6f5";
        context.fillRect(-2, -45, 4, 29);
    } else {
        context.fillStyle = reached ? "#3f4850" : "#69757f";
        context.fillRect(-13, -45, 26, 30);
        context.fillStyle = "#151d24";
        context.fillRect(-2, -45, 4, 30);
        context.fillStyle = reached ? "#59636c" : "#9ba5ad";
        context.fillRect(-15, -53, 30, 4);
        context.fillRect(-7, -39, 14, 4);
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
