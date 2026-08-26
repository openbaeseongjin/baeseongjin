import { LOWER_SECTOR_COMMANDER_OBJECT_KIND } from "../../game/boss/LowerSectorCommanderDefinition.js";
import { paintSpriteFrame } from "../sprites/SpriteCanvasPainter.js";
import { bossPolygonObjectRenderer } from "./BossPolygonObjectRenderers.js";
import { LowerSectorCommanderAnimationController } from "./LowerSectorCommanderAnimationController.js";
import { LowerSectorCommanderChainHookRenderer } from "./LowerSectorCommanderChainHookRenderer.js";

const OBJECT_KIND = Object.freeze({
    BODY: LOWER_SECTOR_COMMANDER_OBJECT_KIND.BODY,
    HAZARD: LOWER_SECTOR_COMMANDER_OBJECT_KIND.HAZARD,
    ARENA_SURFACE: LOWER_SECTOR_COMMANDER_OBJECT_KIND.ARENA_SURFACE
});
const ASSET_STATUS = Object.freeze({ FAILED: "failed", READY: "ready" });

class EmptyBossObjectRenderer {
    draw() {}
}

class LowerSectorCommanderSpriteRenderer {
    constructor({ assets, definition }) {
        this.assets = assets;
        this.definition = definition;
        this.controllers = new Map();
        this.chainHookRenderer = new LowerSectorCommanderChainHookRenderer({ assets, definition });
        this.fallback = bossPolygonObjectRenderer(OBJECT_KIND.BODY);
    }

    draw(context, object, presentation, presentationTimeSeconds) {
        if (!this.definition.supports(object)) {
            this.fallback.draw(context, object);
            return;
        }
        const animation = this.controllerFor(object.id).update(object, presentation?.events, presentationTimeSeconds);
        const desiredFrame = this.definition.frameFor(object, animation);
        const desiredStatus = this.assets.statusFor([desiredFrame.atlasId]);
        let frame = desiredStatus === ASSET_STATUS.READY ? desiredFrame : null;
        if (!frame) {
            void this.assets.prepare([desiredFrame.atlasId]);
            const idleFrame = this.definition.idleFrameAt(animation.stateElapsedSeconds);
            const idleStatus = this.assets.statusFor([idleFrame.atlasId]);
            if (idleStatus === ASSET_STATUS.READY) frame = idleFrame;
            else {
                void this.assets.prepare([idleFrame.atlasId]);
                if (desiredStatus === ASSET_STATUS.FAILED && idleStatus === ASSET_STATUS.FAILED) {
                    this.fallback.draw(context, object);
                }
                return;
            }
        }
        this.chainHookRenderer.drawBehind(context, object, animation);
        paintSpriteFrame({
            context,
            image: this.assets.imageFor(frame.atlasId),
            frame,
            position: object.position,
            size: this.definition.sizeFor(frame),
            anchor: this.definition.anchor,
            pixelSnap: true,
            flipX: this.definition.flipX(object, frame)
        });
        this.chainHookRenderer.drawFront(context, object, animation);
    }

    controllerFor(objectId) {
        const key = objectId ?? OBJECT_KIND.BODY;
        let controller = this.controllers.get(key);
        if (!controller) {
            controller = new LowerSectorCommanderAnimationController();
            this.controllers.set(key, controller);
        }
        return controller;
    }
}

export class LowerSectorCommanderSpriteObjectRendererCatalog {
    constructor({ assets, definition }) {
        const empty = new EmptyBossObjectRenderer();
        this.renderers = Object.freeze({
            [OBJECT_KIND.BODY]: new LowerSectorCommanderSpriteRenderer({ assets, definition }),
            [OBJECT_KIND.HAZARD]: empty,
            [OBJECT_KIND.ARENA_SURFACE]: empty
        });
    }

    supports(kind) {
        return Object.hasOwn(this.renderers, kind);
    }

    rendererFor(kind) {
        return this.renderers[kind] ?? bossPolygonObjectRenderer(kind);
    }
}
