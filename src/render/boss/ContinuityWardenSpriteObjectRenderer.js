import { paintSpriteFrame } from "../sprites/SpriteCanvasPainter.js";
import { bossPolygonObjectRenderer } from "./BossPolygonObjectRenderers.js";
import { ContinuityWardenAnimationController } from "./ContinuityWardenAnimationController.js";
import {
    CONTINUITY_WARDEN_BOTTOM_CENTER_ANCHOR,
    CONTINUITY_WARDEN_GATE_SIZE,
    CONTINUITY_WARDEN_LOCOMOTION_STATE,
    CONTINUITY_WARDEN_OBJECT_KIND,
    CONTINUITY_WARDEN_SECURITY_STAR_SIZE,
    CONTINUITY_WARDEN_SECURITY_STAR_STATE,
    CONTINUITY_WARDEN_SHUTTLE_CONTACT_ANCHOR,
    CONTINUITY_WARDEN_SHUTTLE_SIZE,
    CONTINUITY_WARDEN_SHUTTLE_STATE,
    CONTINUITY_WARDEN_STATE
} from "../../game/boss/ContinuityWardenDefinition.js";
import { resolveContinuityWardenPose } from "./ContinuityWardenPoseResolver.js";

const OBJECT_KIND = Object.freeze({ WARDEN: CONTINUITY_WARDEN_OBJECT_KIND.WARDEN });
const MOTION_STATE = Object.freeze({
    "ground-thruster-dash": true,
    "diagonal-thruster-dash": true,
    charge: true
});
const MISSILE_RACK_VFX = Object.freeze({
    indexes: Object.freeze([-2, -1, 0, 1, 2]),
    horizontalSpacing: 11,
    y: -70,
    outerYOffset: 3,
    radius: 4
});
const COLOR = Object.freeze({
    CYAN: "#67e8f9",
    SKY: "#38bdf8",
    WHITE: "#ecfeff",
    WARNING: "#fbbf24"
});
const SECURITY_STAR_CELL = Object.freeze({ width: 64, height: 64 });
const SECURITY_STAR_ENDING_SECONDS = 0.44;
const SECURITY_STAR_CLIP = Object.freeze({
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.IDLE]: Object.freeze({ start: 0, count: 3, seconds: 0.16, loop: true }),
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.TELEGRAPH]: Object.freeze({
        start: 3,
        count: 4,
        seconds: 0.11,
        loop: false
    }),
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.ACTIVE]: Object.freeze({ start: 7, count: 2, seconds: 0.08, loop: true }),
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.ENDING]: Object.freeze({
        start: 9,
        count: 4,
        seconds: 0.11,
        loop: false
    })
});
const SECURITY_STAR_TERMINAL_STATE = Object.freeze({
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.TELEGRAPH]: true,
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.ACTIVE]: true,
    [CONTINUITY_WARDEN_SECURITY_STAR_STATE.ENDING]: true
});

function direction(object) {
    if (typeof object.direction === "number") return object.direction < 0 ? -1 : 1;
    return object.direction === "left" ? -1 : 1;
}

class ContinuityWardenSpriteRenderer {
    constructor({ assets, definition }) {
        this.assets = assets;
        this.definition = definition;
        this.controllers = new Map();
        this.fallback = bossPolygonObjectRenderer(OBJECT_KIND.WARDEN);
    }

    draw(context, object, presentation, presentationTimeSeconds) {
        if (!this.definition.supports(object) || this.assets.status !== "ready") {
            this.fallback.draw(context, object);
            return;
        }
        const animation = this.controllerFor(object.id).update(object, presentation?.events, presentationTimeSeconds);
        const frame = this.definition.frameFor(object, animation);
        const pose = resolveContinuityWardenPose(object, this.definition.size);
        paintSpriteFrame({
            context,
            image: this.assets.imageFor(frame.atlasId),
            frame,
            position: {
                x: object.position.x + pose.positionOffset.x,
                y: object.position.y + pose.positionOffset.y
            },
            size: pose.size,
            anchor: this.definition.anchor,
            pixelSnap: true,
            flipX: this.definition.flipX(object.direction),
            rotation: pose.rotation
        });
        this.drawAttachedVfx(context, object, animation);
    }

    controllerFor(objectId) {
        const key = objectId ?? OBJECT_KIND.WARDEN;
        let controller = this.controllers.get(key);
        if (!controller) {
            controller = new ContinuityWardenAnimationController();
            this.controllers.set(key, controller);
        }
        return controller;
    }

    drawAttachedVfx(context, object, animation) {
        const sign = direction(object);
        context.save();
        context.imageSmoothingEnabled = false;
        context.translate(Math.round(object.position.x), Math.round(object.position.y));
        context.globalCompositeOperation = "lighter";
        if (
            (MOTION_STATE[object.state] === true ||
                object.locomotionState === CONTINUITY_WARDEN_LOCOMOTION_STATE.JUMP ||
                object.locomotionState === CONTINUITY_WARDEN_LOCOMOTION_STATE.FALL) &&
            object.actionState === "active"
        ) {
            const pulse = Math.floor(animation.phaseElapsedSeconds * 18) % 2;
            context.fillStyle = COLOR.CYAN;
            context.fillRect(-sign * (64 + pulse * 4), 31, sign * 22, 8);
            context.fillStyle = COLOR.SKY;
            context.fillRect(-sign * (82 + pulse * 6), 34, sign * 28, 4);
            context.fillStyle = COLOR.WHITE;
            context.fillRect(-sign * 58, 33, sign * 12, 3);
        }
        if (
            object.state === "security-command" ||
            object.state === "security-active" ||
            object.state === CONTINUITY_WARDEN_STATE.SUMMON
        ) {
            const x = sign * 48;
            const pulse = 5 + (Math.floor(animation.stateElapsedSeconds * 12) % 2) * 3;
            context.strokeStyle = COLOR.CYAN;
            context.lineWidth = 3;
            context.strokeRect(x - pulse, -50 - pulse, pulse * 2, pulse * 2);
            context.fillStyle = COLOR.WHITE;
            context.fillRect(x - 2, -52, 4, 4);
        }
        if (object.state === "guard") {
            context.strokeStyle = COLOR.WARNING;
            context.lineWidth = 3;
            context.setLineDash([5, 4]);
            context.beginPath();
            context.arc(sign * 42, -2, 38, -Math.PI * 0.48, Math.PI * 0.48);
            context.stroke();
        }
        if (object.missileArmed) {
            context.fillStyle = "#a78bfa";
            context.strokeStyle = COLOR.WHITE;
            context.lineWidth = 2;
            for (const index of MISSILE_RACK_VFX.indexes) {
                context.beginPath();
                context.arc(
                    index * MISSILE_RACK_VFX.horizontalSpacing,
                    MISSILE_RACK_VFX.y - Math.abs(index) * MISSILE_RACK_VFX.outerYOffset,
                    MISSILE_RACK_VFX.radius,
                    0,
                    Math.PI * 2
                );
                context.fill();
                context.stroke();
            }
        }
        context.restore();
    }
}

class SecurityStarAnimationController {
    constructor() {
        this.incomingState = null;
        this.endingStartedAt = null;
    }

    resolve(object, presentationTimeSeconds) {
        const incomingState = SECURITY_STAR_CLIP[object.state]
            ? object.state
            : CONTINUITY_WARDEN_SECURITY_STAR_STATE.IDLE;
        if (incomingState !== this.incomingState) {
            if (
                incomingState === CONTINUITY_WARDEN_SECURITY_STAR_STATE.IDLE &&
                SECURITY_STAR_TERMINAL_STATE[this.incomingState] === true
            ) {
                this.endingStartedAt = presentationTimeSeconds;
            } else {
                this.endingStartedAt = null;
            }
            this.incomingState = incomingState;
        }
        if (this.endingStartedAt !== null) {
            const progress = Math.max(
                0,
                Math.min(1, (presentationTimeSeconds - this.endingStartedAt) / SECURITY_STAR_ENDING_SECONDS)
            );
            if (progress < 1) {
                return Object.freeze({ state: CONTINUITY_WARDEN_SECURITY_STAR_STATE.ENDING, progress });
            }
            this.endingStartedAt = null;
        }
        return Object.freeze({ state: incomingState, progress: object.animationProgress ?? 0 });
    }
}

function securityStarFrame(state, progress, presentationTimeSeconds) {
    const clip = SECURITY_STAR_CLIP[state] ?? SECURITY_STAR_CLIP[CONTINUITY_WARDEN_SECURITY_STAR_STATE.IDLE];
    const localIndex = clip.loop
        ? Math.floor(presentationTimeSeconds / clip.seconds) % clip.count
        : Math.min(clip.count - 1, Math.floor(Math.max(0, Math.min(1, progress)) * clip.count));
    return Object.freeze({
        x: (clip.start + localIndex) * SECURITY_STAR_CELL.width,
        y: 0,
        width: SECURITY_STAR_CELL.width,
        height: SECURITY_STAR_CELL.height
    });
}

class SecurityStarSpriteRenderer {
    constructor({ assets }) {
        this.assets = assets;
        this.controllers = new Map();
        this.fallback = bossPolygonObjectRenderer(CONTINUITY_WARDEN_OBJECT_KIND.SECURITY_STAR);
    }

    draw(context, object, _presentation, presentationTimeSeconds = 0) {
        const image = this.assets?.securityStarImage();
        if (!image) {
            this.fallback.draw(context, object);
            return;
        }
        const controller = this.controllerFor(object.id);
        const animation = controller.resolve(object, presentationTimeSeconds);
        paintSpriteFrame({
            context,
            image,
            frame: securityStarFrame(animation.state, animation.progress, presentationTimeSeconds),
            position: object.position,
            size: object.size ?? CONTINUITY_WARDEN_SECURITY_STAR_SIZE,
            anchor: { x: 0.5, y: 0.5 },
            pixelSnap: true,
            flipX: object.variant === "right"
        });
    }

    controllerFor(objectId) {
        const key = objectId ?? CONTINUITY_WARDEN_OBJECT_KIND.SECURITY_STAR;
        let controller = this.controllers.get(key);
        if (!controller) {
            controller = new SecurityStarAnimationController();
            this.controllers.set(key, controller);
        }
        return controller;
    }
}

class MaintenanceShuttleSpriteRenderer {
    constructor({ assets }) {
        this.assets = assets;
        this.fallback = bossPolygonObjectRenderer(CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE);
    }

    draw(context, object) {
        if (object.state === CONTINUITY_WARDEN_SHUTTLE_STATE.HIDDEN) return;
        const image = this.assets?.imageFor(CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE);
        if (!image) {
            this.fallback.draw(context, object);
            return;
        }
        const width = Math.max(1, object.size?.width ?? CONTINUITY_WARDEN_SHUTTLE_SIZE.width);
        const height = Math.max(1, object.size?.height ?? CONTINUITY_WARDEN_SHUTTLE_SIZE.height);
        context.save();
        context.imageSmoothingEnabled = false;
        context.drawImage(
            image,
            Math.round(object.position.x - width * CONTINUITY_WARDEN_SHUTTLE_CONTACT_ANCHOR.x),
            Math.round(object.position.y - height * CONTINUITY_WARDEN_SHUTTLE_CONTACT_ANCHOR.y),
            width,
            height
        );
        context.restore();
    }
}

class DepartureGateSpriteRenderer {
    constructor({ assets }) {
        this.assets = assets;
        this.fallback = bossPolygonObjectRenderer(CONTINUITY_WARDEN_OBJECT_KIND.GATE);
    }

    draw(context, object) {
        const image = this.assets?.gateImageFor(object.state, object.stateProgress);
        if (!image) {
            this.fallback.draw(context, object);
            return;
        }
        const width = Math.max(1, object.size?.width ?? CONTINUITY_WARDEN_GATE_SIZE.width);
        const height = Math.max(1, object.size?.height ?? CONTINUITY_WARDEN_GATE_SIZE.height);
        context.save();
        context.imageSmoothingEnabled = false;
        context.drawImage(
            image,
            Math.round(object.position.x - width * CONTINUITY_WARDEN_BOTTOM_CENTER_ANCHOR.x),
            Math.round(object.position.y - height * CONTINUITY_WARDEN_BOTTOM_CENTER_ANCHOR.y),
            width,
            height
        );
        context.restore();
    }
}

export class ContinuityWardenSpriteObjectRendererCatalog {
    constructor({ assets, definition, objectSpriteAssets = null }) {
        this.renderers = Object.freeze({
            [OBJECT_KIND.WARDEN]: new ContinuityWardenSpriteRenderer({ assets, definition }),
            [CONTINUITY_WARDEN_OBJECT_KIND.SECURITY_STAR]: new SecurityStarSpriteRenderer({
                assets: objectSpriteAssets
            }),
            [CONTINUITY_WARDEN_OBJECT_KIND.GATE]: new DepartureGateSpriteRenderer({
                assets: objectSpriteAssets
            }),
            [CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE]: new MaintenanceShuttleSpriteRenderer({
                assets: objectSpriteAssets
            })
        });
    }

    supports(kind) {
        return Object.hasOwn(this.renderers, kind);
    }

    rendererFor(kind) {
        return this.renderers[kind] ?? bossPolygonObjectRenderer(kind);
    }
}
