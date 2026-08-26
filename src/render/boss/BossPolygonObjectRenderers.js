import { bossBodyPolygonVertices } from "../../game/boss/BossBodyPolygon.js";
import {
    CONTINUITY_WARDEN_GATE_SIZE,
    CONTINUITY_WARDEN_GATE_STATE,
    CONTINUITY_WARDEN_LOCOMOTION_STATE,
    CONTINUITY_WARDEN_OBJECT_KIND,
    CONTINUITY_WARDEN_SECURITY_STAR_STATE,
    CONTINUITY_WARDEN_SHUTTLE_CONTACT_ANCHOR,
    CONTINUITY_WARDEN_SHUTTLE_SIZE,
    CONTINUITY_WARDEN_SHUTTLE_STATE,
    CONTINUITY_WARDEN_STATE
} from "../../game/boss/ContinuityWardenDefinition.js";
import { resolveContinuityWardenPose } from "./ContinuityWardenPoseResolver.js";
import {
    LOWER_SECTOR_COMMANDER_ACTION_PHASE,
    LOWER_SECTOR_COMMANDER_BODY_GEOMETRY,
    LOWER_SECTOR_COMMANDER_GRAB_STAGE,
    LOWER_SECTOR_COMMANDER_OBJECT_KIND,
    LOWER_SECTOR_COMMANDER_STATE,
    LOWER_SECTOR_COMMANDER_SURFACE_KIND
} from "../../game/boss/LowerSectorCommanderDefinition.js";
import { KINEMATIC_JUMP_PHASE } from "../../game/boss/KinematicJumpMotion.js";

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
    [CONTINUITY_WARDEN_STATE.BATON_1]: "melee",
    [CONTINUITY_WARDEN_STATE.BATON_2]: "melee",
    [CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM]: "melee",
    [CONTINUITY_WARDEN_STATE.BACK_SWING]: "melee",
    [CONTINUITY_WARDEN_STATE.COUNTER_BASH]: "melee",
    [CONTINUITY_WARDEN_STATE.GROUND_DASH]: "dash",
    [CONTINUITY_WARDEN_STATE.DIAGONAL_DASH]: "dash",
    [CONTINUITY_WARDEN_STATE.CHARGE]: "dash",
    [CONTINUITY_WARDEN_STATE.MISSILE]: "missile",
    [CONTINUITY_WARDEN_STATE.JUMP]: "missile",
    [CONTINUITY_WARDEN_STATE.SUMMON]: "summon"
});

const WARDEN_ATTACK_FAMILY_COLOR = Object.freeze({
    melee: COLOR.WARNING,
    dash: "#38bdf8",
    missile: "#a78bfa",
    summon: "#4ade80"
});
const WARDEN_TELEGRAPH_COLOR_BY_STATE = Object.freeze({
    "baton-1": COLOR.WARNING,
    "baton-2": COLOR.WARNING,
    "overhead-slam": COLOR.WARNING,
    "back-swing": COLOR.WARNING,
    "counter-bash": COLOR.WARNING,
    "ground-thruster-dash": WARDEN_ATTACK_FAMILY_COLOR.dash,
    "diagonal-thruster-dash": WARDEN_ATTACK_FAMILY_COLOR.dash,
    charge: COLOR.WARNING
});

const WARDEN_MELEE_RANGE_IMAGE_PROFILE = Object.freeze({
    "baton-1": Object.freeze({ startY: 0.24, controlY: -0.34, endY: -0.08, directionMultiplier: 1 }),
    "baton-2": Object.freeze({ startY: -0.18, controlY: 0.32, endY: 0.2, directionMultiplier: 1 }),
    "back-swing": Object.freeze({ startY: 0.18, controlY: -0.28, endY: -0.16, directionMultiplier: -1 }),
    "counter-bash": Object.freeze({ startY: 0.08, controlY: -0.08, endY: 0, directionMultiplier: 1 })
});

const WARDEN_MELEE_RANGE_IMAGE = Object.freeze({
    HORIZONTAL_SPAN_RATIO: 0.84,
    OUTER_WIDTH_RATIO: 0.2,
    INNER_WIDTH_RATIO: 0.11,
    CORE_WIDTH_RATIO: 0.035,
    MIN_OUTER_WIDTH: 16,
    MIN_INNER_WIDTH: 9,
    MIN_CORE_WIDTH: 3,
    IMPACT_RADIUS_RATIO: 0.1,
    OUTER_COLOR: "rgba(251, 113, 133, 0.58)",
    INNER_COLOR: "rgba(251, 191, 36, 0.92)",
    CORE_COLOR: "rgba(255, 247, 237, 0.95)"
});
const WARDEN_MELEE_STROKE_LAYER = Object.freeze([
    Object.freeze({ color: "OUTER_COLOR", minimum: "MIN_OUTER_WIDTH", ratio: "OUTER_WIDTH_RATIO" }),
    Object.freeze({ color: "INNER_COLOR", minimum: "MIN_INNER_WIDTH", ratio: "INNER_WIDTH_RATIO" }),
    Object.freeze({ color: "CORE_COLOR", minimum: "MIN_CORE_WIDTH", ratio: "CORE_WIDTH_RATIO" })
]);

const WARDEN_BEAM_RANGE_IMAGE = Object.freeze({
    OUTER_HEIGHT_RATIO: 0.46,
    INNER_HEIGHT_RATIO: 0.28,
    CORE_HEIGHT_RATIO: 0.09,
    MIN_OUTER_HEIGHT: 28,
    MIN_INNER_HEIGHT: 16,
    MIN_CORE_HEIGHT: 6,
    TILE_WIDTH_RATIO: 0.52,
    MIN_TILE_WIDTH: 44,
    TILE_GAP_RATIO: 0.22,
    EDGE_HEIGHT_RATIO: 0.04,
    OUTER_COLOR: "rgba(136, 19, 55, 0.8)",
    INNER_COLOR: "rgba(251, 113, 133, 0.9)",
    CORE_COLOR: "#fff1f2",
    EDGE_COLOR: "#a5f3fc"
});

const KIND = Object.freeze({
    GRAPPLE_ANCHOR: "grapple-anchor",
    CONTINUITY_WARDEN: CONTINUITY_WARDEN_OBJECT_KIND.WARDEN,
    SECURITY_STAR: CONTINUITY_WARDEN_OBJECT_KIND.SECURITY_STAR,
    WARDEN_HAZARD: CONTINUITY_WARDEN_OBJECT_KIND.HAZARD,
    SECURITY_BEAM: CONTINUITY_WARDEN_OBJECT_KIND.BEAM,
    DEPARTURE_GATE: CONTINUITY_WARDEN_OBJECT_KIND.GATE,
    THRESHOLD_BRIDGE: CONTINUITY_WARDEN_OBJECT_KIND.BRIDGE,
    MAINTENANCE_SHUTTLE: CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE,
    VICTORY_CAMERA: CONTINUITY_WARDEN_OBJECT_KIND.CAMERA
});
const WARDEN_THRUSTER_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.GROUND_DASH]: true,
    [CONTINUITY_WARDEN_STATE.DIAGONAL_DASH]: true
});
const WARDEN_TELEGRAPH_FILL = Object.freeze({
    dash: "rgba(56, 189, 248, 0.2)",
    missile: "rgba(167, 139, 250, 0.2)",
    summon: "rgba(74, 222, 128, 0.2)",
    melee: "rgba(251, 191, 36, 0.2)"
});
const MISSILE_RACK_VFX = Object.freeze({
    indexes: Object.freeze([-2, -1, 0, 1, 2]),
    horizontalSpacingRatio: 0.16,
    yRatio: -0.52,
    outerYOffset: 4,
    radius: 5
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

function wardenTelegraphColor(state, family) {
    return WARDEN_TELEGRAPH_COLOR_BY_STATE[state] ?? WARDEN_ATTACK_FAMILY_COLOR[family] ?? COLOR.WARNING;
}

function pixelStreak(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function pixelBlock(context, centerX, centerY, width, height, color) {
    context.fillStyle = color;
    context.fillRect(
        Math.round(centerX - width * 0.5),
        Math.round(centerY - height * 0.5),
        Math.max(1, Math.round(width)),
        Math.max(1, Math.round(height))
    );
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

function applyWardenLocomotionPose(context, object, height) {
    const pose = resolveContinuityWardenPose(object, { width: 1, height });
    context.translate(pose.positionOffset.x, pose.positionOffset.y);
    context.rotate(pose.rotation);
    context.scale(pose.size.width, pose.size.height / height);
}

class ContinuityWardenRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 96, 150);
        const defeated = object.state === "defeated";
        const guarding = object.state === "guard" || object.state === "counter-ready";
        const warning = object.actionState === "telegraph";
        const family = WARDEN_ATTACK_FAMILY[object.state] ?? null;
        const warningColor = wardenTelegraphColor(object.state, family);
        if (defeated) context.rotate(WARDEN_DEFEAT_STAGE_ROTATION[object.defeatStage] ?? -0.95);
        else applyWardenLocomotionPose(context, object, height);
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
        if (object.missileArmed) {
            context.fillStyle = "#a78bfa";
            context.strokeStyle = "#ede9fe";
            context.lineWidth = 2;
            for (const index of MISSILE_RACK_VFX.indexes) {
                context.beginPath();
                context.arc(
                    index * width * MISSILE_RACK_VFX.horizontalSpacingRatio,
                    height * MISSILE_RACK_VFX.yRatio - Math.abs(index) * MISSILE_RACK_VFX.outerYOffset,
                    MISSILE_RACK_VFX.radius,
                    0,
                    Math.PI * 2
                );
                context.fill();
                context.stroke();
            }
        }
        if (
            WARDEN_THRUSTER_STATE[object.state] === true ||
            object.state === CONTINUITY_WARDEN_STATE.CHARGE ||
            object.locomotionState === CONTINUITY_WARDEN_LOCOMOTION_STATE.JUMP ||
            object.locomotionState === CONTINUITY_WARDEN_LOCOMOTION_STATE.FALL
        ) {
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

class LowerSectorCommanderRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 128, 192);
        const sign = direction(object);
        const walkRadians = (((object.movementProgress ?? 0) % 36) / 36) * Math.PI * 2;
        if (object.state === LOWER_SECTOR_COMMANDER_STATE.WALK) {
            context.translate(0, -Math.abs(Math.sin(walkRadians)) * 4);
            context.rotate(sign * Math.sin(walkRadians) * 0.035);
        } else if (object.state === LOWER_SECTOR_COMMANDER_STATE.JUMP) {
            const rising = object.jumpPhase === KINEMATIC_JUMP_PHASE.JUMP;
            context.rotate(sign * (rising ? -0.12 : 0.08));
            context.scale(rising ? 0.94 : 1.04, rising ? 1.08 : 0.96);
        } else if (
            object.state === LOWER_SECTOR_COMMANDER_STATE.CHARGE &&
            object.actionState === LOWER_SECTOR_COMMANDER_ACTION_PHASE.TELEGRAPH
        ) {
            context.translate(-sign * width * 0.08, height * 0.08);
            context.rotate(sign * 0.11);
            context.scale(1.08, 0.9);
        } else if (object.state === LOWER_SECTOR_COMMANDER_STATE.DEFEATED) {
            context.rotate(-sign * Math.min(1, object.defeatProgress ?? 0) * 1.05);
        }
        context.fillStyle = "#30373b";
        context.strokeStyle =
            object.actionState === LOWER_SECTOR_COMMANDER_ACTION_PHASE.TELEGRAPH ? "#fbbf24" : "#d6c29a";
        context.lineWidth = 4;
        polygon(context, bossBodyPolygonVertices("lower-sector-commander", { width, height }));
        context.fill();
        context.stroke();

        context.fillStyle = "#f97316";
        for (const sensorX of [-0.14, 0.14]) {
            context.beginPath();
            context.arc(
                sign * width * 0.25 + sensorX * width,
                -height * LOWER_SECTOR_COMMANDER_BODY_GEOMETRY.EYE_HEIGHT_RATIO,
                5,
                0,
                Math.PI * 2
            );
            context.fill();
        }

        const shoulderY = -height * 0.08;
        const hookReach = object.state === LOWER_SECTOR_COMMANDER_STATE.GRAB ? width * 0.95 : width * 0.62;
        context.strokeStyle = "#8b7355";
        context.lineWidth = 5;
        context.setLineDash([8, 6]);
        context.beginPath();
        context.moveTo(sign * width * 0.32, shoulderY);
        context.lineTo(sign * hookReach, shoulderY + height * 0.05);
        context.stroke();
        context.setLineDash([]);
        context.strokeStyle = "#c7a66b";
        context.lineWidth = 8;
        context.beginPath();
        context.arc(sign * (hookReach + width * 0.08), shoulderY + height * 0.07, width * 0.12, 0.2, Math.PI * 1.65);
        context.stroke();

        const hammerRaised =
            object.state === LOWER_SECTOR_COMMANDER_STATE.HAMMER ||
            (object.state === LOWER_SECTOR_COMMANDER_STATE.GRAB &&
                object.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.HAMMER);
        context.save();
        context.translate(-sign * width * 0.3, -height * 0.04);
        context.rotate(sign * (hammerRaised ? -0.75 : 0.35));
        context.strokeStyle = "#745c43";
        context.lineWidth = 9;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(-sign * width * 0.68, height * 0.2);
        context.stroke();
        context.fillStyle = "#51463c";
        context.strokeStyle = "#c9b28d";
        context.lineWidth = 3;
        context.fillRect(-sign * width * 0.92 - width * 0.2, height * 0.04, width * 0.4, height * 0.28);
        context.strokeRect(-sign * width * 0.92 - width * 0.2, height * 0.04, width * 0.4, height * 0.28);
        context.restore();
    }
}

class CommanderGrabRangeRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const radius = (object.size?.width ?? 900) * 0.5;
        context.strokeStyle = "rgba(251, 191, 36, 0.85)";
        context.lineWidth = 4;
        context.setLineDash([16, 12]);
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
        if (!object.targetPosition) return;
        const targetX = object.targetPosition.x - object.position.x;
        const targetY = object.targetPosition.y - object.position.y;
        context.strokeStyle = "rgba(251, 113, 133, 0.9)";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(targetX, targetY);
        context.stroke();
        context.beginPath();
        context.arc(targetX, targetY, 28, 0, Math.PI * 2);
        context.stroke();
    }
}

class CommanderArenaSurfaceRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 240, 80);
        context.fillStyle = object.variant === LOWER_SECTOR_COMMANDER_SURFACE_KIND.LEDGE ? "#24313a" : "#354149";
        context.strokeStyle = "#7f8f91";
        context.lineWidth = 4;
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        context.strokeRect(-width * 0.5, -height * 0.5, width, height);
    }
}

const SECURITY_STAR_FALLBACK_STYLE = Object.freeze({
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.IDLE]: Object.freeze({ color: "#d6c895", core: 4, ray: 12 }),
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.TELEGRAPH]: Object.freeze({ color: "#f59e0b", core: 6, ray: 20 }),
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.ACTIVE]: Object.freeze({ color: "#ef4444", core: 8, ray: 26 }),
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.ENDING]: Object.freeze({ color: "#d9aa3e", core: 5, ray: 16 })
});

class SecurityStarRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const style =
            SECURITY_STAR_FALLBACK_STYLE[object.state] ??
            SECURITY_STAR_FALLBACK_STYLE[CONTINUITY_WARDEN_SECURITY_STAR_STATE.IDLE];
        context.imageSmoothingEnabled = false;
        context.globalCompositeOperation = "lighter";
        pixelBlock(context, 0, 0, style.ray * 2, 3, style.color);
        pixelBlock(context, 0, 0, 3, style.ray * 2, style.color);
        pixelBlock(context, 0, 0, style.core, style.core, "#fff7d6");
        const diagonal = Math.round(style.ray * 0.55);
        for (const xSign of [-1, 1]) {
            for (const ySign of [-1, 1]) {
                pixelBlock(context, xSign * diagonal, ySign * diagonal, 3, 3, style.color);
            }
        }
    }
}

class SecurityBeamRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, 3160, 130);
        const active = object.state === "active";
        context.globalAlpha = active ? 0.62 : 0.32;
        context.fillStyle = active ? "rgba(255, 89, 98, 0.35)" : "rgba(251, 191, 36, 0.18)";
        context.strokeStyle = COLOR.WARNING;
        context.lineWidth = 4;
        context.setLineDash([22, 14]);
        context.fillRect(-width * 0.5, -height * 0.5, width, height);
        if (!active) context.strokeRect(-width * 0.5, -height * 0.5, width, height);
        context.setLineDash([]);
        context.globalAlpha = 1;
        if (active) this.drawActiveRangeImage(context, width, height);
        context.fillStyle = active ? "rgba(255,255,255,0.72)" : "rgba(251,191,36,0.7)";
        const bandHeight = Math.max(4, Math.round(height * (active ? 0.12 : 0.06)));
        const segmentWidth = Math.max(24, Math.round(height * 0.55));
        const segmentGap = Math.max(16, Math.round(segmentWidth * 0.7));
        for (let x = -width * 0.5; x < width * 0.5; x += segmentWidth + segmentGap) {
            context.fillRect(Math.round(x), -Math.round(bandHeight * 0.5), segmentWidth, bandHeight);
        }
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

    drawActiveRangeImage(context, width, height) {
        const style = WARDEN_BEAM_RANGE_IMAGE;
        const outerHeight = Math.max(style.MIN_OUTER_HEIGHT, height * style.OUTER_HEIGHT_RATIO);
        const innerHeight = Math.max(style.MIN_INNER_HEIGHT, height * style.INNER_HEIGHT_RATIO);
        const coreHeight = Math.max(style.MIN_CORE_HEIGHT, height * style.CORE_HEIGHT_RATIO);
        const edgeHeight = Math.max(2, height * style.EDGE_HEIGHT_RATIO);
        const tileWidth = Math.max(style.MIN_TILE_WIDTH, height * style.TILE_WIDTH_RATIO);
        const tileGap = Math.max(8, tileWidth * style.TILE_GAP_RATIO);
        context.save();
        context.imageSmoothingEnabled = false;
        context.globalCompositeOperation = "lighter";
        pixelBlock(context, 0, 0, width, outerHeight, style.OUTER_COLOR);
        pixelBlock(context, 0, 0, width, innerHeight, style.INNER_COLOR);
        pixelBlock(context, 0, 0, width, coreHeight, style.CORE_COLOR);
        pixelBlock(context, 0, coreHeight * 0.75, width, edgeHeight, style.EDGE_COLOR);
        for (let x = -width * 0.5; x < width * 0.5; x += tileWidth + tileGap) {
            pixelBlock(context, x + tileWidth * 0.5, -innerHeight * 0.38, tileWidth, edgeHeight, style.CORE_COLOR);
            pixelBlock(context, x + tileWidth * 0.5, innerHeight * 0.38, tileWidth, edgeHeight, style.CORE_COLOR);
        }
        context.restore();
    }
}

class DepartureGateRenderer extends BossPolygonObjectRenderer {
    drawShape(context, object) {
        const { width, height } = size(object, CONTINUITY_WARDEN_GATE_SIZE.width, CONTINUITY_WARDEN_GATE_SIZE.height);
        const lit =
            object.state === CONTINUITY_WARDEN_GATE_STATE.OPEN || object.state === CONTINUITY_WARDEN_GATE_STATE.LIGHT;
        context.strokeStyle = lit ? "#ffe998" : "#a4b5bd";
        context.fillStyle = object.state === CONTINUITY_WARDEN_GATE_STATE.OPEN ? "rgba(255,233,152,0.08)" : "#28353d";
        context.lineWidth = 6;
        if (object.state === CONTINUITY_WARDEN_GATE_STATE.OPEN) {
            context.beginPath();
            context.moveTo(-width * 0.5, 0);
            context.lineTo(-width * 0.5, -height);
            context.lineTo(-width * 0.22, -height);
            context.moveTo(width * 0.5, 0);
            context.lineTo(width * 0.5, -height);
            context.lineTo(width * 0.22, -height);
            context.stroke();
            return;
        }
        context.fillRect(-width * 0.5, -height, width, height);
        context.strokeRect(-width * 0.5, -height, width, height);
        context.strokeStyle = "#647a84";
        for (let x = -width * 0.3; x <= width * 0.3; x += width * 0.2) {
            context.beginPath();
            context.moveTo(x, -height * 0.98);
            context.lineTo(x, -height * 0.02);
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
        if (object.state === CONTINUITY_WARDEN_SHUTTLE_STATE.HIDDEN) return;
        const { width, height } = size(
            object,
            CONTINUITY_WARDEN_SHUTTLE_SIZE.width,
            CONTINUITY_WARDEN_SHUTTLE_SIZE.height
        );
        context.translate(width * (0.5 - CONTINUITY_WARDEN_SHUTTLE_CONTACT_ANCHOR.x), 0);
        context.fillStyle = "#31434c";
        context.strokeStyle = "#dce8ec";
        context.lineWidth = 6;
        context.beginPath();
        context.roundRect(-width * 0.5, -height, width, height, 48);
        context.fill();
        context.stroke();
        context.fillStyle = "#174c5d";
        context.strokeStyle = "#71dff5";
        context.lineWidth = 4;
        context.fillRect(-width * 0.22, -height * 0.82, width * 0.44, height * 0.23);
        context.strokeRect(-width * 0.22, -height * 0.82, width * 0.44, height * 0.23);
        context.fillStyle = "#17252c";
        context.strokeStyle = "#8fa4ae";
        context.fillRect(-width * 0.18, -height * 0.52, width * 0.36, height * 0.48);
        context.strokeRect(-width * 0.18, -height * 0.52, width * 0.36, height * 0.48);
        const wheelRadius = height * 0.11;
        for (const x of [-width * 0.38, width * 0.38]) {
            context.fillStyle = "#202e35";
            context.beginPath();
            context.arc(x, -wheelRadius, wheelRadius, 0, Math.PI * 2);
            context.fill();
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
        const meleeActive = active && family === "melee";
        const telegraphColor = wardenTelegraphColor(object.variant, family);
        if (!meleeActive && family !== "dash") {
            context.globalAlpha = active ? 0.62 : 0.32;
            context.fillStyle = active
                ? "rgba(251, 113, 133, 0.35)"
                : (WARDEN_TELEGRAPH_FILL[family] ?? "rgba(251, 191, 36, 0.2)");
            context.strokeStyle = telegraphColor;
            context.lineWidth = 3;
            context.setLineDash([20, 14]);
            context.fillRect(-width * 0.5, -height * 0.5, width, height);
            if (!active) context.strokeRect(-width * 0.5, -height * 0.5, width, height);
            context.setLineDash([]);
        }
        if (!active && family === "dash") {
            chevron(context, 0, 0, direction(object), Math.min(width, height) * 0.55, telegraphColor);
        }
        context.globalAlpha = 1;
        if (meleeActive) this.drawMeleeRangeImage(context, object, width, height);
        if (active && family === "dash") this.drawDashTrail(context, object, width, height);
    }

    drawMeleeRangeImage(context, object, width, height) {
        if (object.variant === "overhead-slam") {
            this.drawOverheadRangeImage(context, width, height);
            return;
        }
        const profile = WARDEN_MELEE_RANGE_IMAGE_PROFILE[object.variant] ?? WARDEN_MELEE_RANGE_IMAGE_PROFILE["baton-1"];
        const style = WARDEN_MELEE_RANGE_IMAGE;
        const sign = direction(object) * profile.directionMultiplier;
        const span = width * style.HORIZONTAL_SPAN_RATIO;
        this.drawLayeredMeleeCurve(
            context,
            { x: -sign * span * 0.5, y: profile.startY * height },
            { x: 0, y: profile.controlY * height },
            { x: sign * span * 0.5, y: profile.endY * height },
            width,
            height
        );
    }

    drawOverheadRangeImage(context, width, height) {
        this.drawLayeredMeleeCurve(
            context,
            { x: -width * 0.16, y: -height * 0.46 },
            { x: width * 0.18, y: -height * 0.08 },
            { x: 0, y: height * 0.42 },
            width,
            height
        );
    }

    drawLayeredMeleeCurve(context, start, control, end, width, height) {
        const style = WARDEN_MELEE_RANGE_IMAGE;
        context.save();
        context.globalCompositeOperation = "lighter";
        context.lineCap = "round";
        context.lineJoin = "round";
        for (const layer of WARDEN_MELEE_STROKE_LAYER) {
            context.strokeStyle = style[layer.color];
            context.lineWidth = Math.max(style[layer.minimum], height * style[layer.ratio]);
            context.beginPath();
            context.moveTo(start.x, start.y);
            context.quadraticCurveTo(control.x, control.y, end.x, end.y);
            context.stroke();
        }
        context.fillStyle = style.CORE_COLOR;
        context.beginPath();
        context.arc(end.x, end.y, Math.max(6, Math.min(width, height) * style.IMPACT_RADIUS_RATIO), 0, Math.PI * 2);
        context.fill();
        context.restore();
    }

    drawDashTrail(context, object, width, height) {
        const sign = direction(object);
        context.globalCompositeOperation = "lighter";
        pixelStreak(context, -sign * width * 0.48, -height * 0.18, sign * width * 0.4, 8, "#67e8f9");
        pixelStreak(context, -sign * width * 0.42, 0, sign * width * 0.3, 5, "#38bdf8");
        pixelStreak(context, -sign * width * 0.35, height * 0.18, sign * width * 0.22, 4, "#ecfeff");
    }
}

const GENERIC_RENDERER = new GenericRenderer();
const RENDERER_BY_KIND = Object.freeze({
    [LOWER_SECTOR_COMMANDER_OBJECT_KIND.BODY]: new LowerSectorCommanderRenderer(),
    [LOWER_SECTOR_COMMANDER_OBJECT_KIND.GRAB_RANGE]: new CommanderGrabRangeRenderer(),
    [LOWER_SECTOR_COMMANDER_OBJECT_KIND.HAZARD]: new ZoneRenderer(),
    [LOWER_SECTOR_COMMANDER_OBJECT_KIND.ARENA_SURFACE]: new CommanderArenaSurfaceRenderer(),
    [KIND.GRAPPLE_ANCHOR]: new GrappleAnchorRenderer(),
    [KIND.CONTINUITY_WARDEN]: new ContinuityWardenRenderer(),
    [KIND.SECURITY_STAR]: new SecurityStarRenderer(),
    [KIND.WARDEN_HAZARD]: new ZoneRenderer(),
    [KIND.SECURITY_BEAM]: new SecurityBeamRenderer(),
    [KIND.DEPARTURE_GATE]: new DepartureGateRenderer(),
    [KIND.THRESHOLD_BRIDGE]: new ThresholdBridgeRenderer(),
    [KIND.MAINTENANCE_SHUTTLE]: new MaintenanceShuttleRenderer(),
    [KIND.VICTORY_CAMERA]: new InvisibleRenderer()
});

export function bossPolygonObjectRenderer(kind) {
    return RENDERER_BY_KIND[kind] ?? GENERIC_RENDERER;
}
