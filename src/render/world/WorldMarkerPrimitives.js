export function drawCheckpointBeacon(context, checkpoint, { active = false, reached = false } = {}) {
    context.save();
    context.translate(checkpoint.x, checkpoint.y);
    context.globalAlpha = reached ? 0.35 : 0.95;
    context.fillStyle = "#111827";
    context.fillRect(-24, -7, 48, 12);
    context.fillStyle = active ? "#f59e0b" : "#64748b";
    context.fillRect(-20, -10, 40, 4);
    context.fillRect(-18, -34, 4, 24);
    context.fillRect(14, -34, 4, 24);
    context.fillStyle = active ? "#fde68a" : "#bfdbfe";
    context.fillRect(-20, -39, 8, 6);
    context.fillRect(12, -39, 8, 6);
    context.strokeStyle = active ? "rgba(251, 191, 36, 0.8)" : "rgba(147, 197, 253, 0.45)";
    context.lineWidth = active ? 3 : 2;
    context.beginPath();
    context.moveTo(-9, -21);
    context.lineTo(0, -14);
    context.lineTo(9, -21);
    context.stroke();
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
