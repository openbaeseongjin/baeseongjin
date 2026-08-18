function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

export function createElectricArcPath(from, to, { time = 0, amplitude = null } = {}) {
    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance <= 0.001) return Object.freeze([{ ...from }, { ...to }]);
    const segmentCount = clamp(Math.ceil(distance / 28), 4, 14);
    const perpendicular = { x: -deltaY / distance, y: deltaX / distance };
    const resolvedAmplitude = Number.isFinite(amplitude) ? amplitude : clamp(distance * 0.085, 8, 26);
    const points = [{ x: from.x, y: from.y }];
    for (let index = 1; index < segmentCount; index += 1) {
        const progress = index / segmentCount;
        const rapidFlicker = Math.sin(time * 34 + index * 2.71);
        const slowDrift = Math.sin(time * 15 + index * 7.93);
        const offset = (rapidFlicker * 0.72 + slowDrift * 0.28) * resolvedAmplitude * Math.sin(progress * Math.PI);
        points.push({
            x: from.x + deltaX * progress + perpendicular.x * offset,
            y: from.y + deltaY * progress + perpendicular.y * offset
        });
    }
    points.push({ x: to.x, y: to.y });
    return Object.freeze(points.map((point) => Object.freeze(point)));
}

function strokePath(context, points, color, lineWidth) {
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
    context.stroke();
}

export function drawElectricArc(context, from, to, { time = 0, color = "#a8e6ff" } = {}) {
    const points = createElectricArcPath(from, to, { time });
    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = color;
    context.shadowBlur = 14;
    strokePath(context, points, "rgba(91, 216, 255, 0.28)", 11);
    context.shadowBlur = 5;
    strokePath(context, points, color, 3.2);
    context.shadowBlur = 0;
    strokePath(context, points, "#f4fdff", 1.1);
    context.restore();
    return points;
}
