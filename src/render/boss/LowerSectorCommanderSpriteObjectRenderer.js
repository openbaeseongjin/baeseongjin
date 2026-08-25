import { LOWER_SECTOR_COMMANDER_OBJECT_KIND } from "../../game/boss/LowerSectorCommanderDefinition.js";
import { paintSpriteFrame } from "../sprites/SpriteCanvasPainter.js";
import { bossPolygonObjectRenderer } from "./BossPolygonObjectRenderers.js";
import { LowerSectorCommanderAnimationController } from "./LowerSectorCommanderAnimationController.js";
import { LowerSectorCommanderChainHookRenderer } from "./LowerSectorCommanderChainHookRenderer.js";

const OBJECT_KIND = Object.freeze({ BODY: LOWER_SECTOR_COMMANDER_OBJECT_KIND.BODY });

class LowerSectorCommanderSpriteRenderer {
    constructor({ assets, definition }) {
        this.assets = assets;
        this.definition = definition;
        this.controllers = new Map();
        this.chainHookRenderer = new LowerSectorCommanderChainHookRenderer({ assets, definition });
        this.fallback = bossPolygonObjectRenderer(OBJECT_KIND.BODY);
    }

    draw(context, object, presentation, presentationTimeSeconds) {
        if (!this.definition.supports(object) || this.assets.status !== "ready") {
            this.fallback.draw(context, object);
            return;
        }
        const animation = this.controllerFor(object.id).update(object, presentation?.events, presentationTimeSeconds);
        const frame = this.definition.frameFor(object, animation);
        this.chainHookRenderer.drawBehind(context, object, animation);
        paintSpriteFrame({
            context,
            image: this.assets.imageFor(frame.atlasId),
            frame,
            position: object.position,
            size: this.definition.size,
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
        this.renderers = Object.freeze({
            [OBJECT_KIND.BODY]: new LowerSectorCommanderSpriteRenderer({ assets, definition })
        });
    }

    supports(kind) {
        return Object.hasOwn(this.renderers, kind);
    }

    rendererFor(kind) {
        return this.renderers[kind] ?? bossPolygonObjectRenderer(kind);
    }
}
