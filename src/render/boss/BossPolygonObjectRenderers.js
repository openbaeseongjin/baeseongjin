const COLOR = Object.freeze({
    BODY: "#273442",
    DARK: "#111827",
    EDGE: "#a9bed0",
    HAZARD: "#fb7185",
    WARNING: "#fbbf24",
    WEAKPOINT: "#67e8f9",
    EXPOSED: "#fef08a"
});

const KIND = Object.freeze({
    CARRIAGE: "carriage",
    BEAM: "beam",
    RAM: "ram",
    WEAKPOINT: "weakpoint"
});

const WEAKPOINT = Object.freeze({
    REAR_DRIVE: "rear-drive",
    SIDE_GEARBOX: "side-gearbox",
    CENTRAL_CORE: "central-lock-core"
});

function size(object, fallbackWidth, fallbackHeight) {
    return {
        width: Math.max(1, object.size?.width ?? fallbackWidth),
        height: Math.max(1, object.size?.height ?? fallbackHeight)
    };
}

function direction(object) {
    return object.direction === "left" ? -1 : 1;
}

function chevron(context, x, y, sign, scale, color) {
    context.strokeStyle = color;
    context.lineWidth = Math.max(2, scale * 0.15);
    context.beginPath();
    context.moveTo(x - sign * scale * 0.4, y - scale * 0.5);
    context.lineTo(x + sign * scale * 0.4, y);
    context.lineTo(x - sign * scale * 0.4, y + scale * 0.5);
    context.stroke();
}

class BossPolygonObjectRenderer {
    draw(context, object) {
        context.save();
        context.translate(object.position.x, object.position.y);
        this.drawShape(context, object);
        context.restore();
    }
}

class CarriageRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 980, 430);
        context.globalAlpha = object.state === "stopped" || object.state === "disabled" ? 0.55 : 1;
        context.fillStyle = COLOR.BODY;
        context.strokeStyle = COLOR.EDGE;
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(-width * 0.45, -height * 0.25);
        context.lineTo(-width * 0.33, -height * 0.42);
        context.lineTo(width * 0.33, -height * 0.42);
        context.lineTo(width * 0.45, -height * 0.25);
        context.lineTo(width * 0.4, height * 0.25);
        context.lineTo(-width * 0.4, height * 0.25);
        context.closePath();
        context.fill();
        context.stroke();
        for (const x of [-width * 0.28, width * 0.28]) {
            context.fillStyle = COLOR.DARK;
            context.beginPath();
            context.arc(x, height * 0.34, height * 0.13, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        }
        context.fillStyle = COLOR.DARK;
        context.strokeStyle = object.state === "beam-failure-telegraph" ? COLOR.WARNING : COLOR.EDGE;
        context.fillRect(-width * 0.1, -height * 0.2, width * 0.2, height * 0.35);
        context.strokeRect(-width * 0.1, -height * 0.2, width * 0.2, height * 0.35);
        chevron(context, 0, 0, direction(object), height * 0.14, COLOR.WARNING);
    }
}

class BeamRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 1200, 120);
        const sign = direction(object);
        const directional = object.variant === "directional" || object.state === "directional";
        const x = directional && sign < 0 ? -width : directional ? 0 : -width * 0.5;
        const telegraph = String(object.actionState ?? "").includes("telegraph");
        context.globalAlpha = telegraph ? 0.45 : 0.82;
        context.fillStyle = COLOR.HAZARD;
        context.strokeStyle = telegraph ? COLOR.WARNING : "#fecdd3";
        context.lineWidth = 3;
        context.fillRect(x, -height * 0.4, width, height * 0.8);
        context.strokeRect(x, -height * 0.4, width, height * 0.8);
        context.strokeStyle = COLOR.DARK;
        for (let offset = height; offset < width; offset += Math.max(height * 1.5, 180)) {
            const braceX = x + offset;
            context.beginPath();
            context.moveTo(braceX - height * 0.2, -height * 0.35);
            context.lineTo(braceX + height * 0.2, height * 0.35);
            context.stroke();
        }
        context.globalAlpha = 1;
        if (directional) chevron(context, sign * width * 0.72, 0, sign, height * 0.35, "#fff1f2");
    }
}

class RamRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 2300, 330);
        const sign = direction(object);
        const telegraph = object.state === "ram-telegraph" || object.state === "telegraph";
        const attacking = object.state === "ram";
        context.globalAlpha = telegraph || attacking ? 0.85 : 0.2;
        context.strokeStyle = telegraph ? COLOR.WARNING : attacking ? COLOR.HAZARD : COLOR.EDGE;
        context.lineWidth = 4;
        context.setLineDash(telegraph ? [28, 18] : []);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.setLineDash([]);
        for (const y of [-height * 0.25, 0, height * 0.25]) {
            context.beginPath();
            context.moveTo(-sign * width * 0.35, y);
            context.lineTo(sign * width * 0.28, y);
            context.stroke();
        }
        context.globalAlpha = 1;
        chevron(context, sign * width * 0.36, 0, sign, height * 0.25, telegraph ? COLOR.WARNING : COLOR.HAZARD);
    }
}

class WeakpointRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 96, 96);
        const radius = Math.min(width, height) * 0.42;
        const exposed = object.state === "exposed";
        context.globalAlpha = exposed ? 1 : 0.55;
        context.fillStyle = exposed ? COLOR.EXPOSED : COLOR.WEAKPOINT;
        context.strokeStyle = exposed ? "#fff7b2" : "#cffafe";
        context.lineWidth = exposed ? 4 : 2;
        context.beginPath();
        if (object.variant === WEAKPOINT.SIDE_GEARBOX) {
            context.rect(-radius, -radius * 0.75, radius * 2, radius * 1.5);
        } else if (object.variant === WEAKPOINT.CENTRAL_CORE) {
            context.moveTo(0, -radius);
            context.lineTo(radius, 0);
            context.lineTo(0, radius);
            context.lineTo(-radius, 0);
            context.closePath();
        } else {
            context.arc(0, 0, radius, 0, Math.PI * 2);
        }
        context.fill();
        context.stroke();
        if (object.variant === WEAKPOINT.REAR_DRIVE) {
            context.fillStyle = COLOR.DARK;
            context.beginPath();
            context.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
    }
}

class GenericRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 56, 32);
        context.fillStyle = COLOR.BODY;
        context.strokeStyle = COLOR.EDGE;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
    }
}

const GENERIC_RENDERER = new GenericRenderer();
const RENDERER_BY_KIND = Object.freeze({
    [KIND.CARRIAGE]: new CarriageRenderer(),
    [KIND.BEAM]: new BeamRenderer(),
    [KIND.RAM]: new RamRenderer(),
    [KIND.WEAKPOINT]: new WeakpointRenderer()
});

export function bossPolygonObjectRenderer(kind) {
    return RENDERER_BY_KIND[kind] ?? GENERIC_RENDERER;
}
