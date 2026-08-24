const COLOR = Object.freeze({
    BODY: "#273442",
    DARK: "#111827",
    EDGE: "#a9bed0",
    HAZARD: "#fb7185",
    WARNING: "#fbbf24",
    WEAKPOINT: "#67e8f9",
    EXPOSED: "#fef08a"
});

const WARDEN_ATTACK_FAMILY = Object.freeze({
    "baton-1": "melee",
    "baton-2": "melee",
    "overhead-slam": "melee",
    "back-swing": "melee",
    "counter-bash": "melee",
    "ground-thruster-dash": "dash",
    "diagonal-thruster-dash": "dash",
    charge: "dash"
});

const WARDEN_ATTACK_FAMILY_COLOR = Object.freeze({
    melee: COLOR.WARNING,
    dash: "#38bdf8"
});

const KIND = Object.freeze({
    GRAPPLE_ANCHOR: "grapple-anchor",
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

function size(object, fallbackWidth, fallbackHeight) {
    return {
        width: Math.max(1, object.size?.width ?? fallbackWidth),
        height: Math.max(1, object.size?.height ?? fallbackHeight)
    };
}

function direction(object) {
    if (typeof object.direction === "number") return object.direction < 0 ? -1 : 1;
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

const WARDEN_DEFEAT_STAGE_ROTATION = Object.freeze({
    "baton-drop": -0.18,
    "shield-fall": -0.5,
    unconscious: -0.95,
    "security-off": -0.95,
    "gate-light": -0.95,
    "gate-open": -0.95,
    "shuttle-reveal": -0.95,
    "player-control": -0.95
});

class ContinuityWardenRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 96, 150);
        const defeated = object.state === "defeated";
        const guarding = object.state === "guard" || object.state === "counter-ready";
        const warning = object.actionState === "telegraph";
        const family = WARDEN_ATTACK_FAMILY[object.state] ?? null;
        const warningColor = family ? WARDEN_ATTACK_FAMILY_COLOR[family] : COLOR.WARNING;
        if (defeated) context.rotate(WARDEN_DEFEAT_STAGE_ROTATION[object.defeatStage] ?? -0.95);
        context.fillStyle = "#4d5b61";
        context.strokeStyle = warning ? warningColor : defeated ? "#64748b" : "#e1eaed";
        context.lineWidth = warning ? 5 : 3;
        context.setLineDash(warning && family === "dash" ? [10, 6] : []);
        polygon(context, bossBodyPolygonVertices("continuity-warden", { width, height }));
        context.fill();
        context.stroke();
        context.setLineDash([]);
        const sign = direction(object);
        const batonDropped = defeated && object.defeatStage !== "baton-drop" && object.defeatStage !== null;
        const shieldFallen = batonDropped && object.defeatStage !== "shield-fall";
        if (!shieldFallen) {
            context.fillStyle = "#617783";
            context.strokeStyle = guarding ? "#fef08a" : "#eef7fa";
            context.lineWidth = guarding ? 6 : 4;
            const shieldX = sign * width * 0.72;
            context.fillRect(shieldX - width * 0.18, -height * 0.34, width * 0.36, height * 0.62);
            context.strokeRect(shieldX - width * 0.18, -height * 0.34, width * 0.36, height * 0.62);
        }
        if (!batonDropped) {
            context.strokeStyle = object.actionState === "active" ? COLOR.HAZARD : "#ffca70";
            context.lineWidth = 8;
            context.beginPath();
            context.moveTo(-sign * width * 0.28, -height * 0.18);
            context.lineTo(-sign * width * 0.85, height * 0.3);
            context.stroke();
        }
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
        if (Number.isSafeInteger(object.order)) {
            context.fillStyle = COLOR.WARNING;
            context.font = "700 24px system-ui, sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(String(object.order), 0, 0);
        }
    }
}

class DepartureGateRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 480, 760);
        const lit = object.state === "open" || object.state === "light";
        context.strokeStyle = lit ? "#ffe998" : "#a4b5bd";
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

class ZoneRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 220, 140);
        const active = object.state === "active" || object.state === "beam-active" || object.state === "burst-active";
        const family = WARDEN_ATTACK_FAMILY[object.variant] ?? null;
        const telegraphColor = family ? WARDEN_ATTACK_FAMILY_COLOR[family] : COLOR.WARNING;
        context.globalAlpha = active ? 0.62 : 0.32;
        context.fillStyle = active
            ? "rgba(251, 113, 133, 0.35)"
            : family === "dash"
              ? "rgba(56, 189, 248, 0.2)"
              : "rgba(251, 191, 36, 0.2)";
        context.strokeStyle = active ? COLOR.HAZARD : telegraphColor;
        context.lineWidth = active ? 5 : 3;
        context.setLineDash(active ? [] : family === "dash" ? [10, 8] : [20, 14]);
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.setLineDash([]);
        if (!active && family === "dash") {
            chevron(context, 0, 0, direction(object), Math.min(width, height) * 0.55, telegraphColor);
        }
        context.globalAlpha = 1;
    }
}

const GENERIC_RENDERER = new GenericRenderer();
const RENDERER_BY_KIND = Object.freeze({
    [KIND.GRAPPLE_ANCHOR]: new GrappleAnchorRenderer(),
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
