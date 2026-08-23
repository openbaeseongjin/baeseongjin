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
    WEAKPOINT: "weakpoint",
    GRAPPLE_ANCHOR: "grapple-anchor",
    RESIDENTIAL_PURSUER: "residential-pursuer",
    CHARGE_LINE: "charge-line",
    SLAM_ZONE: "slam-zone",
    DIVE_LINE: "dive-line",
    ARCHITECTURE_IMPACT: "architecture-impact",
    GUARD_A: "boss-guard-a",
    GUARD_B: "boss-guard-b",
    SECURITY_HUB: "boss-security-hub",
    LANDING_WARNING: "boss-landing-warning",
    HUB_BEAM: "boss-hub-beam",
    PROTECTION_LINK: "boss-protection-link",
    PROTECTED_GATE: "boss-protected-gate",
    CONTINUITY_CORE: "boss-continuity-core",
    ACTUATOR: "boss-actuator",
    PARTITION_WALL: "boss-partition-wall",
    SLOT_SHUTTER: "boss-slot-shutter",
    CONTROL_PULSE: "boss-control-pulse",
    EXIT_HARDPOINT: "boss-exit-hardpoint",
    EXCHANGE_MAINTENANCE_BODY: "boss-exchange-maintenance-body",
    EXCHANGE_RAIL: "boss-exchange-rail",
    EXCHANGE_ARCHITECTURE: "boss-exchange-architecture",
    EXCHANGE_ARM: "boss-exchange-arm",
    EXCHANGE_END_STOP: "boss-exchange-end-stop",
    EXCHANGE_MODULE: "boss-exchange-module",
    CONTINUITY_WARDEN: "boss-continuity-warden",
    SECURITY_EMITTER: "boss-security-emitter",
    WARDEN_HAZARD: "boss-warden-hazard",
    SECURITY_BEAM: "boss-security-beam",
    DEPARTURE_GATE: "boss-departure-gate",
    THRESHOLD_BRIDGE: "boss-threshold-bridge",
    MAINTENANCE_SHUTTLE: "boss-maintenance-shuttle",
    VICTORY_CAMERA: "boss-victory-camera",
    PAD_SURFACE: "boss-pad-surface"
});

const WEAKPOINT = Object.freeze({
    REAR_DRIVE: "rear-drive",
    SIDE_GEARBOX: "side-gearbox",
    CENTRAL_CORE: "central-lock-core",
    REAR_THRUSTER: "rear-thruster",
    LOWER_STABILIZER: "lower-stabilizer",
    CENTRAL_SENSOR: "central-sensor"
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

function polygon(context, vertices) {
    context.beginPath();
    vertices.forEach(({ x, y }, index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
    context.closePath();
}

class BossPolygonObjectRenderer {
    draw(context, object) {
        context.save();
        context.translate(object.position.x, object.position.y);
        context.rotate(object.rotation ?? 0);
        this.drawShape(context, object);
        if (object.ropeAttachable === true) {
            context.strokeStyle = COLOR.WEAKPOINT;
            context.fillStyle = "rgba(103, 232, 249, 0.22)";
            context.lineWidth = 3;
            context.beginPath();
            context.arc(0, 0, 12, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        }
        context.restore();
    }
}

class ResidentialPursuerRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 420, 180);
        const telegraphing = object.state === "telegraph" || object.state === "track" || object.state === "confirm";
        const exposed = object.state === "exposed";
        const recovering = object.state === "recovery" || object.state === "reposition";
        context.globalAlpha = object.state === "stopped" ? 0.45 : recovering ? 0.72 : 1;
        context.fillStyle = COLOR.BODY;
        context.strokeStyle = telegraphing ? COLOR.WARNING : exposed ? COLOR.EXPOSED : COLOR.EDGE;
        context.lineWidth = telegraphing || exposed ? 5 : 3;
        polygon(context, bossBodyPolygonVertices("residential-security-pursuer", { width, height }));
        context.fill();
        context.stroke();

        context.fillStyle = COLOR.DARK;
        context.strokeStyle = COLOR.EDGE;
        for (const x of [-width * 0.28, width * 0.08]) {
            context.beginPath();
            context.moveTo(x - width * 0.1, -height * 0.35);
            context.lineTo(x + width * 0.1, -height * 0.35);
            context.lineTo(x + width * 0.14, height * 0.32);
            context.lineTo(x - width * 0.14, height * 0.32);
            context.closePath();
            context.fill();
            context.stroke();
        }
        context.fillStyle = telegraphing ? COLOR.WARNING : COLOR.WEAKPOINT;
        context.beginPath();
        context.moveTo(width * 0.32, -height * 0.18);
        context.lineTo(width * 0.44, 0);
        context.lineTo(width * 0.32, height * 0.18);
        context.lineTo(width * 0.2, 0);
        context.closePath();
        context.fill();

        context.strokeStyle = object.state === "attack" ? COLOR.HAZARD : COLOR.WARNING;
        context.lineWidth = 4;
        for (const y of [-height * 0.24, height * 0.24]) {
            context.beginPath();
            context.moveTo(-width * 0.48, y);
            context.lineTo(-width * 0.62, y * 1.2);
            context.stroke();
        }
        if (object.variant === "ground-slam") {
            context.strokeStyle = COLOR.WARNING;
            context.beginPath();
            context.arc(0, 0, height * 0.38, 0, Math.PI * 1.5);
            context.stroke();
        }
        context.globalAlpha = 1;
    }
}

class AttackLineRenderer extends BossPolygonObjectRenderer {
    constructor({ dive = false } = {}) {
        super();
        this.dive = dive;
    }

    drawShape(context, object) {
        const { width, height } = size(object, 1200, 180);
        const active = object.state === "attack";
        const tracking = object.state === "track";
        context.globalAlpha = active ? 0.62 : tracking ? 0.28 : 0.42;
        context.fillStyle = active ? COLOR.HAZARD : COLOR.WARNING;
        context.strokeStyle = active ? "#fecdd3" : COLOR.WARNING;
        context.lineWidth = active ? 5 : 3;
        context.setLineDash(active ? [] : [28, 18]);
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.setLineDash([]);
        context.globalAlpha = 1;
        const sign = direction(object);
        for (let x = -width * 0.35; x <= width * 0.35; x += Math.max(120, height)) {
            chevron(context, x, 0, sign, height * 0.28, this.dive ? "#cffafe" : "#fff7ed");
        }
    }
}

class SlamZoneRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 560, 560);
        const radius = Math.min(width, height) * 0.5;
        const active = object.state === "attack";
        context.globalAlpha = active ? 0.7 : 0.38;
        context.fillStyle = active ? "rgba(251, 113, 133, 0.28)" : "rgba(251, 191, 36, 0.18)";
        context.strokeStyle = active ? COLOR.HAZARD : COLOR.WARNING;
        context.lineWidth = active ? 6 : 4;
        context.setLineDash(active ? [] : [22, 14]);
        context.beginPath();
        for (let index = 0; index < 8; index += 1) {
            const angle = (Math.PI * 2 * index) / 8;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (index === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
        context.stroke();
        context.setLineDash([]);
        context.beginPath();
        context.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
        context.stroke();
        for (let index = 0; index < 4; index += 1) {
            const angle = index * (Math.PI * 0.5) + object.movementProgress * Math.PI * 2;
            context.beginPath();
            context.moveTo(Math.cos(angle) * radius * 0.22, Math.sin(angle) * radius * 0.22);
            context.lineTo(Math.cos(angle) * radius * 0.8, Math.sin(angle) * radius * 0.8);
            context.stroke();
        }
        context.globalAlpha = 1;
    }
}

class ArchitectureImpactRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 180, 180);
        const valid = object.state === "valid";
        context.strokeStyle = valid ? COLOR.EXPOSED : COLOR.WARNING;
        context.fillStyle = valid ? "rgba(254, 240, 138, 0.18)" : "rgba(251, 191, 36, 0.12)";
        context.lineWidth = valid ? 5 : 3;
        for (let index = 0; index < 8; index += 1) {
            const angle = (Math.PI * 2 * index) / 8;
            const inner = Math.min(width, height) * 0.12;
            const outer = Math.min(width, height) * (index % 2 === 0 ? 0.48 : 0.34);
            context.beginPath();
            context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            context.stroke();
        }
        context.beginPath();
        context.arc(0, 0, Math.min(width, height) * 0.2, 0, Math.PI * 2);
        context.fill();
        context.stroke();
    }
}

class CarriageRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 980, 430);
        const suspensionHeight = Math.max(0, object.suspensionHeight ?? 0);
        context.globalAlpha = object.state === "stopped" || object.state === "disabled" ? 0.55 : 1;
        if (suspensionHeight > 0) {
            const railY = -suspensionHeight;
            context.strokeStyle = COLOR.EDGE;
            context.lineWidth = 5;
            context.beginPath();
            context.moveTo(-width * 0.6, railY);
            context.lineTo(width * 0.6, railY);
            context.stroke();
            for (const x of [-width * 0.28, width * 0.28]) {
                context.beginPath();
                context.moveTo(x, railY);
                context.lineTo(x, -height * 0.42);
                context.stroke();
                context.fillStyle = COLOR.DARK;
                context.fillRect(x - width * 0.07, railY - 10, width * 0.14, 20);
            }
        }
        context.fillStyle = COLOR.BODY;
        context.strokeStyle = COLOR.EDGE;
        context.lineWidth = 4;
        polygon(context, bossBodyPolygonVertices("gate-locking-carriage", { width, height }));
        context.fill();
        context.stroke();
        if (object.state === "ram") {
            context.fillStyle = "rgba(251, 113, 133, 0.18)";
            context.strokeStyle = COLOR.HAZARD;
            context.lineWidth = 4;
            context.fillRect(-width * 0.5, -height * 0.5, width, height);
            context.strokeRect(-width * 0.5, -height * 0.5, width, height);
            for (const y of [-height * 0.25, 0, height * 0.25]) {
                context.beginPath();
                context.moveTo(-direction(object) * width * 0.48, y);
                context.lineTo(direction(object) * width * 0.32, y);
                context.stroke();
            }
        }
        for (const x of [-width * 0.28, width * 0.28]) {
            context.fillStyle = COLOR.DARK;
            context.beginPath();
            context.arc(x, suspensionHeight > 0 ? -suspensionHeight : height * 0.34, height * 0.13, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        }
        context.fillStyle = COLOR.DARK;
        context.strokeStyle = object.state === "beam-failure-telegraph" ? COLOR.WARNING : COLOR.EDGE;
        context.fillRect(-width * 0.1, -height * 0.2, width * 0.2, height * 0.35);
        context.strokeRect(-width * 0.1, -height * 0.2, width * 0.2, height * 0.35);
        if (object.state === "beam-failure") {
            context.strokeStyle = COLOR.WARNING;
            context.lineWidth = 3;
            for (const offset of [-0.12, 0, 0.12]) {
                context.beginPath();
                context.moveTo(width * offset - 18, -height * 0.18);
                context.lineTo(width * offset + 8, -height * 0.02);
                context.lineTo(width * offset - 4, height * 0.14);
                context.stroke();
            }
        }
        chevron(context, 0, 0, direction(object), height * 0.14, COLOR.WARNING);
    }
}

class BeamRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 1200, 120);
        const sign = direction(object);
        const directional = object.variant === "directional" || object.state === "directional";
        const x = -width * 0.5;
        const telegraph = String(object.actionState ?? "").includes("telegraph");
        context.globalAlpha = telegraph ? 0.45 : 0.82;
        context.fillStyle = COLOR.HAZARD;
        context.strokeStyle = telegraph ? COLOR.WARNING : "#fecdd3";
        context.lineWidth = 3;
        context.fillRect(x, -height * 0.5, width, height);
        context.strokeRect(x, -height * 0.5, width, height);
        if (telegraph && object.path) {
            const start = object.path.startX - object.position.x;
            const target = object.path.targetX - object.position.x;
            context.save();
            context.globalAlpha = 0.45;
            context.setLineDash([24, 16]);
            context.strokeStyle = COLOR.WARNING;
            context.strokeRect(
                Math.min(start, target) - width * 0.5,
                -height * 0.62,
                Math.abs(target - start) + width,
                height * 1.24
            );
            context.restore();
        }
        context.strokeStyle = COLOR.DARK;
        for (let offset = height; offset < width; offset += Math.max(height * 1.5, 180)) {
            const braceX = x + offset;
            context.beginPath();
            context.moveTo(braceX - height * 0.2, -height * 0.35);
            context.lineTo(braceX + height * 0.2, height * 0.35);
            context.stroke();
        }
        context.globalAlpha = 1;
        if (directional) chevron(context, sign * width * 0.35, 0, sign, height * 0.35, "#fff1f2");
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
        if (object.variant === WEAKPOINT.SIDE_GEARBOX || object.variant === WEAKPOINT.LOWER_STABILIZER) {
            context.rect(-radius, -radius * 0.75, radius * 2, radius * 1.5);
        } else if (object.variant === WEAKPOINT.CENTRAL_CORE || object.variant === WEAKPOINT.CENTRAL_SENSOR) {
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
        if (object.variant === WEAKPOINT.REAR_DRIVE || object.variant === WEAKPOINT.REAR_THRUSTER) {
            context.fillStyle = COLOR.DARK;
            context.beginPath();
            context.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
    }
}

class GrappleAnchorRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 32, 32);
        const radius = Math.min(width, height) * 0.42;
        context.strokeStyle = COLOR.WEAKPOINT;
        context.fillStyle = "rgba(103, 232, 249, 0.18)";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.beginPath();
        context.moveTo(0, -radius * 0.55);
        context.lineTo(0, radius * 0.55);
        context.moveTo(-radius * 0.55, 0);
        context.lineTo(radius * 0.55, 0);
        context.stroke();
    }
}

class ExchangeMaintenanceBodyRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 360, 150);
        const disabled = object.state === "disabled";
        const telegraph = object.state === "telegraph";
        context.globalAlpha = disabled ? 0.48 : 1;
        context.fillStyle = "#7e304c";
        context.strokeStyle = telegraph ? COLOR.WARNING : disabled ? "#64748b" : "#ff8caf";
        context.lineWidth = telegraph ? 6 : 4;
        polygon(context, bossBodyPolygonVertices("central-exchange-maintenance-system", { width, height }));
        context.fill();
        context.stroke();
        context.fillStyle = disabled ? "#475569" : "#63e7ff";
        context.beginPath();
        context.arc(0, height * 0.18, height * 0.18, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.strokeStyle = "#ff9b67";
        context.lineWidth = 5;
        for (const sign of [-1, 1]) {
            context.beginPath();
            context.moveTo(sign * width * 0.34, height * 0.08);
            context.lineTo(sign * width * 0.52, height * 0.32);
            context.stroke();
        }
        context.globalAlpha = 1;
    }
}

class ExchangeRailRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 1800, 24);
        context.globalAlpha = object.state === "disabled" ? 0.45 : 1;
        context.fillStyle = "#5d2942";
        context.strokeStyle = object.state === "disabled" ? "#64748b" : "#ff8caf";
        context.lineWidth = 4;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        for (let x = -width * 0.42; x <= width * 0.42; x += 180) {
            context.beginPath();
            context.moveTo(x, -height * 0.5);
            context.lineTo(x + 60, height * 0.5);
            context.stroke();
        }
        context.globalAlpha = 1;
    }
}

const EXCHANGE_ARCHITECTURE_STYLE = Object.freeze({
    "entry-deck": Object.freeze({ fill: "#31464e", stroke: "#90a5ad" }),
    gallery: Object.freeze({ fill: "#31464e", stroke: "#90a5ad" }),
    "media-frame": Object.freeze({ fill: "#233841", stroke: "#5f94a1" }),
    "safe-landing": Object.freeze({ fill: "#315a47", stroke: "#73d49a" })
});

class ExchangeArchitectureRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 240, 42);
        const style = EXCHANGE_ARCHITECTURE_STYLE[object.variant] ?? EXCHANGE_ARCHITECTURE_STYLE.gallery;
        context.fillStyle = style.fill;
        context.strokeStyle = style.stroke;
        context.lineWidth = object.variant === "safe-landing" ? 5 : 3;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        if (object.variant === "media-frame") {
            context.strokeStyle = "rgba(99, 231, 255, 0.45)";
            for (let x = -width * 0.35; x < width * 0.4; x += 54) {
                context.beginPath();
                context.moveTo(x, -height * 0.42);
                context.lineTo(x + 24, height * 0.42);
                context.stroke();
            }
        }
    }
}

class ExchangeArmRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 3000, 250);
        const telegraph = object.state === "telegraph";
        const sweep = object.state === "sweep";
        context.globalAlpha = sweep ? 0.52 : telegraph ? 0.3 : 0.12;
        context.fillStyle = sweep ? "rgba(255, 109, 96, 0.42)" : "rgba(255, 155, 103, 0.22)";
        context.strokeStyle = sweep ? "#ff6d60" : "#ff9b67";
        context.lineWidth = sweep ? 7 : 4;
        context.setLineDash(telegraph ? [28, 18] : []);
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.setLineDash([]);
        const progress = Math.max(0, Math.min(1, object.movementProgress ?? 0));
        const armX = -width * 0.42 + width * 0.84 * progress;
        context.globalAlpha = sweep ? 0.95 : 0.45;
        context.strokeStyle = "#ffc08a";
        context.lineWidth = 18;
        context.beginPath();
        context.moveTo(armX - width * 0.22, -height * 0.22);
        context.lineTo(armX + width * 0.22, height * 0.22);
        context.stroke();
        context.globalAlpha = 1;
    }
}

class ExchangeEndStopRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 120, 90);
        context.fillStyle = object.state === "damaged" ? "#4b342d" : "#8d5134";
        context.strokeStyle = object.state === "damaged" ? COLOR.HAZARD : "#ffc08a";
        context.lineWidth = 4;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeStyle = "#fcd34d";
        for (const sign of [-1, 1]) {
            context.beginPath();
            context.moveTo(sign * width * 0.16, -height * 0.42);
            context.lineTo(sign * width * 0.32, height * 0.42);
            context.stroke();
        }
    }
}

class ExchangeModuleRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 96, 96);
        const radius = Math.min(width, height) * 0.42;
        const exposed = object.state === "exposed";
        const broken = object.state === "broken";
        context.globalAlpha = broken ? 0.38 : 1;
        context.fillStyle = exposed ? "#ffe36c" : broken ? "#4b5563" : "#ff5360";
        context.strokeStyle = exposed ? "#fff7b2" : "#f8fafc";
        context.lineWidth = exposed ? 6 : 3;
        context.beginPath();
        if (object.variant === "central-core") {
            context.moveTo(0, -radius);
            context.lineTo(radius, 0);
            context.lineTo(0, radius);
            context.lineTo(-radius, 0);
            context.closePath();
        } else context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        if (broken) {
            context.beginPath();
            context.moveTo(-radius * 0.7, radius * 0.7);
            context.lineTo(radius * 0.7, -radius * 0.7);
            context.stroke();
        }
        context.globalAlpha = 1;
    }
}

class ContinuityWardenRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 96, 150);
        const defeated = object.state === "defeated";
        const guarding = object.state === "guard" || object.state === "counter-ready";
        const warning = object.actionState === "telegraph";
        if (defeated) context.rotate(-0.95);
        context.fillStyle = "#4d5b61";
        context.strokeStyle = warning ? COLOR.WARNING : defeated ? "#64748b" : "#e1eaed";
        context.lineWidth = warning ? 5 : 3;
        polygon(context, bossBodyPolygonVertices("continuity-warden", { width, height }));
        context.fill();
        context.stroke();
        context.fillStyle = "#617783";
        context.strokeStyle = guarding ? "#fef08a" : "#eef7fa";
        context.lineWidth = guarding ? 6 : 4;
        const sign = direction(object);
        const shieldX = sign * width * 0.72;
        context.fillRect(shieldX - width * 0.18, -height * 0.34, width * 0.36, height * 0.62);
        context.strokeRect(shieldX - width * 0.18, -height * 0.34, width * 0.36, height * 0.62);
        context.strokeStyle = object.actionState === "active" ? COLOR.HAZARD : "#ffca70";
        context.lineWidth = 8;
        context.beginPath();
        context.moveTo(-sign * width * 0.28, -height * 0.18);
        context.lineTo(-sign * width * 0.85, height * 0.3);
        context.stroke();
        if (String(object.state).includes("thruster") || object.state === "charge") {
            context.fillStyle = "#68e7ff";
            context.beginPath();
            context.moveTo(-sign * width * 0.45, height * 0.3);
            context.lineTo(-sign * width * 1.05, height * 0.46);
            context.lineTo(-sign * width * 0.5, height * 0.05);
            context.closePath();
            context.fill();
        }
    }
}

class SecurityEmitterRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 95, 650);
        context.fillStyle = "#1e313a";
        context.strokeStyle = object.state === "active" ? COLOR.HAZARD : "#6f8791";
        context.lineWidth = object.state === "active" ? 6 : 4;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.fillStyle = object.state === "active" ? "#ff7580" : "#475569";
        for (const y of [-height * 0.28, height * 0.28]) {
            context.beginPath();
            context.arc(0, y, width * 0.23, 0, Math.PI * 2);
            context.fill();
        }
    }
}

class SecurityBeamRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 3160, 130);
        const active = object.state === "active";
        context.globalAlpha = active ? 0.62 : 0.32;
        context.fillStyle = active ? "rgba(255, 89, 98, 0.35)" : "rgba(251, 191, 36, 0.18)";
        context.strokeStyle = active ? COLOR.HAZARD : COLOR.WARNING;
        context.lineWidth = active ? 6 : 4;
        context.setLineDash(active ? [] : [22, 14]);
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.setLineDash([]);
        context.globalAlpha = 1;
        context.strokeStyle = object.state === "telegraph" ? COLOR.WARNING : "#fff1f2";
        context.lineWidth = 4;
        const labels = String(object.variant ?? "")
            .toUpperCase()
            .split("-");
        for (let index = 0; index < labels.length; index += 1) {
            const x = -width * 0.3 + index * Math.min(width * 0.22, 260);
            chevron(context, x, 0, 1, Math.min(height * 0.25, 34), context.strokeStyle);
        }
    }
}

class DepartureGateRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 480, 760);
        context.strokeStyle = object.state === "open" ? "#ffe998" : "#a4b5bd";
        context.fillStyle = object.state === "open" ? "rgba(255,233,152,0.08)" : "#28353d";
        context.lineWidth = 6;
        if (object.state === "open") {
            context.beginPath();
            context.moveTo(-width * 0.5, height * 0.5);
            context.lineTo(-width * 0.5, -height * 0.5);
            context.lineTo(-width * 0.22, -height * 0.72);
            context.moveTo(width * 0.5, height * 0.5);
            context.lineTo(width * 0.5, -height * 0.5);
            context.lineTo(width * 0.22, -height * 0.72);
            context.stroke();
            return;
        }
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeStyle = "#647a84";
        for (let x = -width * 0.3; x <= width * 0.3; x += width * 0.2) {
            context.beginPath();
            context.moveTo(x, -height * 0.48);
            context.lineTo(x, height * 0.48);
            context.stroke();
        }
    }
}

class ThresholdBridgeRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        if (object.state !== "active") return;
        const { width, height } = size(object, 240, 130);
        context.fillStyle = "#1f343d";
        context.strokeStyle = "#78dda4";
        context.lineWidth = 5;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
    }
}

class MaintenanceShuttleRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        if (object.state === "hidden") return;
        const { width, height } = size(object, 500, 390);
        context.fillStyle = "#31434c";
        context.strokeStyle = "#dce8ec";
        context.lineWidth = 6;
        context.beginPath();
        context.roundRect(-width * 0.5, -height * 0.5, width, height, 48);
        context.fill();
        context.stroke();
        context.fillStyle = "#174c5d";
        context.strokeStyle = "#71dff5";
        context.lineWidth = 4;
        context.fillRect(-width * 0.22, -height * 0.32, width * 0.44, height * 0.23);
        context.strokeRect(-width * 0.22, -height * 0.32, width * 0.44, height * 0.23);
        context.fillStyle = "#17252c";
        context.strokeStyle = "#8fa4ae";
        context.fillRect(-width * 0.18, -height * 0.02, width * 0.36, height * 0.48);
        context.strokeRect(-width * 0.18, -height * 0.02, width * 0.36, height * 0.48);
        for (const x of [-width * 0.38, width * 0.38]) {
            context.fillStyle = "#202e35";
            context.beginPath();
            context.arc(x, height * 0.42, height * 0.11, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        }
    }
}

const PAD_SURFACE_STYLE = Object.freeze({
    "main-security-runway": Object.freeze({ fill: "#263a44", stroke: "#9aafb9" }),
    "raised-ledge": Object.freeze({ fill: "#2b424b", stroke: "#9eb1ba" }),
    "recovery-deck": Object.freeze({ fill: "#244d3a", stroke: "#78dda4" }),
    "departure-deck": Object.freeze({ fill: "#1f343d", stroke: "#748d98" })
});

class PadSurfaceRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 300, 80);
        const style = PAD_SURFACE_STYLE[object.variant] ?? PAD_SURFACE_STYLE["main-security-runway"];
        context.fillStyle = style.fill;
        context.strokeStyle = style.stroke;
        context.lineWidth = object.variant === "recovery-deck" ? 5 : 4;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeStyle = "rgba(148, 163, 184, 0.36)";
        for (let x = -width * 0.42; x < width * 0.42; x += 72) {
            context.beginPath();
            context.moveTo(x, -height * 0.42);
            context.lineTo(x + 30, height * 0.42);
            context.stroke();
        }
    }
}

class InvisibleRenderer extends BossPolygonObjectRenderer {
    drawShape() {}
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

class SecurityGuardRenderer extends BossPolygonObjectRenderer {
    constructor({ elevated = false } = {}) {
        super();
        this.elevated = elevated;
    }

    drawShape(context, object) {
        const { width, height } = size(object, 240, 150);
        const warning = object.state === "warning";
        const active = object.state === "active";
        const recovery = object.state === "recovery";
        const returning = object.state === "return";
        context.fillStyle = this.elevated ? "#334155" : "#1e3a4a";
        context.strokeStyle = active
            ? COLOR.HAZARD
            : warning
              ? COLOR.WARNING
              : recovery || returning
                ? COLOR.EXPOSED
                : COLOR.EDGE;
        context.lineWidth = warning || active || recovery || returning ? 5 : 3;
        const vertices = object.geometry?.type === "polygon" ? object.geometry.vertices : null;
        if (vertices) polygon(context, vertices);
        else {
            context.beginPath();
            context.moveTo(-width * 0.5, 0);
            context.lineTo(-width * 0.24, -height * 0.48);
            context.lineTo(width * 0.3, -height * 0.42);
            context.lineTo(width * 0.5, 0);
            context.lineTo(width * 0.22, height * 0.48);
            context.lineTo(-width * 0.32, height * 0.42);
            context.closePath();
        }
        context.fill();
        context.stroke();
        context.fillStyle = recovery || returning ? COLOR.EXPOSED : COLOR.DARK;
        context.fillRect(-width * 0.1, -height * 0.16, width * 0.3, height * 0.32);
        context.strokeStyle = this.elevated ? "#a5f3fc" : "#67e8f9";
        context.beginPath();
        context.moveTo(-width * 0.42, 0);
        context.lineTo(-width * 0.62, this.elevated ? height * 0.25 : 0);
        context.stroke();
        if (active) chevron(context, width * 0.2, 0, 1, height * 0.32, COLOR.HAZARD);
    }
}

class ZoneRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 220, 140);
        const active = object.state === "active" || object.state === "beam-active" || object.state === "burst-active";
        context.globalAlpha = active ? 0.62 : 0.32;
        context.fillStyle = active ? "rgba(251, 113, 133, 0.35)" : "rgba(251, 191, 36, 0.2)";
        context.strokeStyle = active ? COLOR.HAZARD : COLOR.WARNING;
        context.lineWidth = active ? 5 : 3;
        context.setLineDash(active ? [] : [20, 14]);
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.setLineDash([]);
        context.globalAlpha = 1;
    }
}

class SecurityHubRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 300, 280);
        const disabled = object.state === "shutdown" || object.state === "disabled";
        context.globalAlpha = disabled ? 0.5 : 1;
        context.fillStyle = "#263544";
        context.strokeStyle = object.state === "core-open" ? COLOR.EXPOSED : COLOR.EDGE;
        context.lineWidth = object.state === "core-open" ? 6 : 4;
        context.beginPath();
        context.moveTo(0, -height * 0.5);
        context.lineTo(width * 0.45, -height * 0.2);
        context.lineTo(width * 0.45, height * 0.25);
        context.lineTo(0, height * 0.5);
        context.lineTo(-width * 0.45, height * 0.25);
        context.lineTo(-width * 0.45, -height * 0.2);
        context.closePath();
        context.fill();
        context.stroke();
        context.fillStyle = object.state === "core-open" ? COLOR.EXPOSED : "#0f172a";
        context.beginPath();
        context.arc(0, 0, Math.min(width, height) * 0.2, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
    }
}

class ContinuityCoreRenderer extends SecurityHubRenderer {
    drawShape(context, object) {
        super.drawShape(context, object);
        const { width, height } = size(object, 320, 300);
        context.strokeStyle = object.state === "disabled" ? COLOR.EDGE : "#a78bfa";
        context.lineWidth = 4;
        for (const sign of [-1, 1]) {
            context.beginPath();
            context.moveTo(sign * width * 0.45, -height * 0.18);
            context.lineTo(sign * width * 0.7, -height * 0.38);
            context.lineTo(sign * width * 0.7, height * 0.38);
            context.lineTo(sign * width * 0.45, height * 0.18);
            context.stroke();
        }
    }
}

class PartitionWallRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 180, 1100);
        const moving = object.state === "descending" || object.state === "rising";
        context.fillStyle = "#334155";
        context.strokeStyle = moving ? COLOR.WARNING : object.state === "locked" ? COLOR.HAZARD : COLOR.EDGE;
        context.lineWidth = moving || object.state === "locked" ? 5 : 3;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeStyle = "#64748b";
        for (let y = -height * 0.35; y < height * 0.42; y += 72) {
            context.beginPath();
            context.moveTo(-width * 0.38, y);
            context.lineTo(width * 0.38, y);
            context.stroke();
        }
    }
}

const GENERIC_RENDERER = new GenericRenderer();
const RENDERER_BY_KIND = Object.freeze({
    [KIND.CARRIAGE]: new CarriageRenderer(),
    [KIND.BEAM]: new BeamRenderer(),
    [KIND.RAM]: new RamRenderer(),
    [KIND.WEAKPOINT]: new WeakpointRenderer(),
    [KIND.GRAPPLE_ANCHOR]: new GrappleAnchorRenderer(),
    [KIND.RESIDENTIAL_PURSUER]: new ResidentialPursuerRenderer(),
    [KIND.CHARGE_LINE]: new AttackLineRenderer(),
    [KIND.SLAM_ZONE]: new SlamZoneRenderer(),
    [KIND.DIVE_LINE]: new AttackLineRenderer({ dive: true }),
    [KIND.ARCHITECTURE_IMPACT]: new ArchitectureImpactRenderer(),
    [KIND.GUARD_A]: new SecurityGuardRenderer({ elevated: true }),
    [KIND.GUARD_B]: new SecurityGuardRenderer(),
    [KIND.SECURITY_HUB]: new SecurityHubRenderer(),
    [KIND.LANDING_WARNING]: new ZoneRenderer(),
    [KIND.HUB_BEAM]: new ZoneRenderer(),
    [KIND.PROTECTION_LINK]: new GenericRenderer(),
    [KIND.PROTECTED_GATE]: new GenericRenderer(),
    [KIND.CONTINUITY_CORE]: new ContinuityCoreRenderer(),
    [KIND.ACTUATOR]: new GenericRenderer(),
    [KIND.PARTITION_WALL]: new PartitionWallRenderer(),
    [KIND.SLOT_SHUTTER]: new GenericRenderer(),
    [KIND.CONTROL_PULSE]: new ZoneRenderer(),
    [KIND.EXIT_HARDPOINT]: new WeakpointRenderer(),
    [KIND.EXCHANGE_MAINTENANCE_BODY]: new ExchangeMaintenanceBodyRenderer(),
    [KIND.EXCHANGE_RAIL]: new ExchangeRailRenderer(),
    [KIND.EXCHANGE_ARCHITECTURE]: new ExchangeArchitectureRenderer(),
    [KIND.EXCHANGE_ARM]: new ExchangeArmRenderer(),
    [KIND.EXCHANGE_END_STOP]: new ExchangeEndStopRenderer(),
    [KIND.EXCHANGE_MODULE]: new ExchangeModuleRenderer(),
    [KIND.CONTINUITY_WARDEN]: new ContinuityWardenRenderer(),
    [KIND.SECURITY_EMITTER]: new SecurityEmitterRenderer(),
    [KIND.WARDEN_HAZARD]: new ZoneRenderer(),
    [KIND.SECURITY_BEAM]: new SecurityBeamRenderer(),
    [KIND.DEPARTURE_GATE]: new DepartureGateRenderer(),
    [KIND.THRESHOLD_BRIDGE]: new ThresholdBridgeRenderer(),
    [KIND.MAINTENANCE_SHUTTLE]: new MaintenanceShuttleRenderer(),
    [KIND.VICTORY_CAMERA]: new InvisibleRenderer(),
    [KIND.PAD_SURFACE]: new PadSurfaceRenderer()
});

export function bossPolygonObjectRenderer(kind) {
    return RENDERER_BY_KIND[kind] ?? GENERIC_RENDERER;
}
import { bossBodyPolygonVertices } from "../../game/boss/BossBodyPolygon.js";
