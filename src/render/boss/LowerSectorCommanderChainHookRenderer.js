import { paintSpriteFrame } from "../sprites/SpriteCanvasPainter.js";
import {
    LOWER_SECTOR_COMMANDER_GRAB_STAGE,
    LOWER_SECTOR_COMMANDER_STATE
} from "../../game/boss/LowerSectorCommanderDefinition.js";

const CHAIN_IMAGE = Object.freeze({
    handOffsetX: 50,
    handOffsetY: -20,
    extensionSeconds: 0.22,
    initialSag: 36,
    linkSpacing: 22,
    linkSize: Object.freeze({ width: 28, height: 18 }),
    hookSize: Object.freeze({ width: 64, height: 64 }),
    tensionSize: Object.freeze({ width: 128, height: 64 })
});
const ACTIVE_STAGE = Object.freeze({
    [LOWER_SECTOR_COMMANDER_GRAB_STAGE.SEARCH]: true,
    [LOWER_SECTOR_COMMANDER_GRAB_STAGE.CAPTURED]: true,
    [LOWER_SECTOR_COMMANDER_GRAB_STAGE.HAMMER]: true
});

function direction(object) {
    if (typeof object.direction === "number") return object.direction < 0 ? -1 : 1;
    return object.direction === "left" ? -1 : 1;
}

function validPoint(point) {
    return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

function quadraticPoint(start, control, end, ratio) {
    const inverse = 1 - ratio;
    return {
        x: inverse * inverse * start.x + 2 * inverse * ratio * control.x + ratio * ratio * end.x,
        y: inverse * inverse * start.y + 2 * inverse * ratio * control.y + ratio * ratio * end.y
    };
}

function chainPath(object, animation) {
    if (
        object.state !== LOWER_SECTOR_COMMANDER_STATE.GRAB ||
        ACTIVE_STAGE[object.grabStage] !== true ||
        !validPoint(object.targetPosition)
    ) {
        return null;
    }
    const start = {
        x: object.position.x + direction(object) * CHAIN_IMAGE.handOffsetX,
        y: object.position.y + CHAIN_IMAGE.handOffsetY
    };
    const progress =
        object.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.SEARCH
            ? Math.min(1, animation.grabStageElapsedSeconds / CHAIN_IMAGE.extensionSeconds)
            : 1;
    const end = {
        x: start.x + (object.targetPosition.x - start.x) * progress,
        y: start.y + (object.targetPosition.y - start.y) * progress
    };
    const control = {
        x: (start.x + end.x) * 0.5,
        y: (start.y + end.y) * 0.5 + (1 - progress) * CHAIN_IMAGE.initialSag
    };
    return Object.freeze({ start, control, end, progress });
}

export class LowerSectorCommanderChainHookRenderer {
    constructor({ assets, definition }) {
        this.assets = assets;
        this.definition = definition;
    }

    drawBehind(context, object, animation) {
        const path = chainPath(object, animation);
        if (!path) return;
        const distance = Math.hypot(path.end.x - path.start.x, path.end.y - path.start.y);
        const linkCount = Math.max(1, Math.ceil(distance / CHAIN_IMAGE.linkSpacing));
        const frame = this.definition.chainLinkFrame;
        const image = this.assets.imageFor(frame.atlasId);
        for (let index = 0; index < linkCount; index += 1) {
            const ratio = (index + 0.5) / linkCount;
            const nextRatio = Math.min(1, ratio + 0.02);
            const point = quadraticPoint(path.start, path.control, path.end, ratio);
            const next = quadraticPoint(path.start, path.control, path.end, nextRatio);
            paintSpriteFrame({
                context,
                image,
                frame,
                position: point,
                size: CHAIN_IMAGE.linkSize,
                anchor: { x: 0.5, y: 0.5 },
                pixelSnap: true,
                rotation: Math.atan2(next.y - point.y, next.x - point.x)
            });
        }
    }

    drawFront(context, object, animation) {
        const path = chainPath(object, animation);
        if (!path) return;
        const angle = Math.atan2(path.end.y - path.start.y, path.end.x - path.start.x);
        if (object.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.SEARCH) {
            const frame = this.definition.hookFrameAt(animation.grabStageElapsedSeconds);
            paintSpriteFrame({
                context,
                image: this.assets.imageFor(frame.atlasId),
                frame,
                position: path.end,
                size: CHAIN_IMAGE.hookSize,
                anchor: { x: 0.5, y: 0.5 },
                pixelSnap: true,
                rotation: angle
            });
            return;
        }
        const frame = this.definition.tensionFrameAt(animation.grabStageElapsedSeconds);
        paintSpriteFrame({
            context,
            image: this.assets.imageFor(frame.atlasId),
            frame,
            position: path.end,
            size: CHAIN_IMAGE.tensionSize,
            anchor: { x: 0.82, y: 0.5 },
            pixelSnap: true,
            flipX: angle > Math.PI * 0.5 || angle < -Math.PI * 0.5,
            rotation: angle
        });
    }
}
