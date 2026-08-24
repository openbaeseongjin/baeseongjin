import { paintSpriteFrame } from "../sprites/SpriteCanvasPainter.js";
import { bossPolygonObjectRenderer } from "./BossPolygonObjectRenderers.js";
import { ContinuityWardenAnimationController } from "./ContinuityWardenAnimationController.js";

const OBJECT_KIND = Object.freeze({ WARDEN: "boss-continuity-warden" });
const MOTION_STATE = Object.freeze({
    "ground-thruster-dash": true,
    "diagonal-thruster-dash": true,
    charge: true
});
const COLOR = Object.freeze({
    CYAN: "#67e8f9",
    SKY: "#38bdf8",
    WHITE: "#ecfeff",
    WARNING: "#fbbf24"
});

function direction(object) {
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
        paintSpriteFrame({
            context,
            image: this.assets.imageFor(frame.atlasId),
            frame,
            position: object.position,
            size: this.definition.size,
            anchor: this.definition.anchor,
            pixelSnap: true,
            flipX: this.definition.flipX(object.direction)
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
        if (MOTION_STATE[object.state] === true && object.actionState === "active") {
            const pulse = Math.floor(animation.phaseElapsedSeconds * 18) % 2;
            context.fillStyle = COLOR.CYAN;
            context.fillRect(-sign * (64 + pulse * 4), 31, sign * 22, 8);
            context.fillStyle = COLOR.SKY;
            context.fillRect(-sign * (82 + pulse * 6), 34, sign * 28, 4);
            context.fillStyle = COLOR.WHITE;
            context.fillRect(-sign * 58, 33, sign * 12, 3);
        }
        if (object.state === "security-command" || object.state === "security-active") {
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
        context.restore();
    }
}

export class ContinuityWardenSpriteObjectRendererCatalog {
    constructor({ assets, definition }) {
        this.renderers = Object.freeze({
            [OBJECT_KIND.WARDEN]: new ContinuityWardenSpriteRenderer({ assets, definition })
        });
    }

    rendererFor(kind) {
        return this.renderers[kind] ?? bossPolygonObjectRenderer(kind);
    }
}
