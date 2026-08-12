import { paintPixelSprite } from "./PixelSpritePainter.js";
import { PlayerAnimationController } from "./PlayerAnimationController.js";
import { paintSpriteFrame } from "./SpriteCanvasPainter.js";

const ENEMY_SPRITE = Object.freeze({
    rows: Object.freeze(["..aa..", ".abbaa", "abbbba", "abccba", ".bbbb.", ".a..a."])
});
const PLAYER_PROJECTILE_SPRITE = Object.freeze({ rows: Object.freeze([".a.", "aba", ".a."]) });
const ENEMY_PROJECTILE_SPRITE = Object.freeze({ rows: Object.freeze(["..a..", ".aba.", "abcba", ".aba.", "..a.."]) });

function eventsForPlayer(scene, playerId) {
    return (scene.playerPresentationEvents ?? []).filter((event) => event.playerId === playerId);
}

class PlayerSpriteRendererBase {
    constructor({ asset, definition, selectPlayers, markerColor }) {
        this.asset = asset;
        this.definition = definition;
        this.selectPlayers = selectPlayers;
        this.markerColor = markerColor;
        this.controllers = new Map();
        this.previousTime = null;
    }

    draw(args) {
        const currentTime = args.presentationTimeSeconds;
        if (!Number.isFinite(currentTime)) throw new Error("Sprite player renderer requires presentation time");
        const dt = this.previousTime === null ? 0 : Math.min(0.1, Math.max(0, currentTime - this.previousTime));
        this.previousTime = currentTime;
        const activeIds = new Set();
        for (const player of this.selectPlayers(args.scene)) {
            activeIds.add(player.id);
            const controller = this.controllerFor(player.id);
            const animation = controller.update({
                player,
                rope: player.rope ?? args.scene.rope,
                events: eventsForPlayer(args.scene, player.id),
                dt
            });
            const presentation = this.definition.presentationFor(animation.state);
            paintSpriteFrame({
                context: args.context,
                image: this.asset.image,
                frame: presentation.clip.frameAt(animation.elapsedSeconds),
                position: player.position,
                size: presentation.size,
                anchor: presentation.anchor,
                offset: presentation.offset,
                opacity: presentation.opacity,
                pixelSnap: presentation.pixelSnap,
                flipX: animation.flipX
            });
            args.context.fillStyle = this.markerColor;
            args.context.fillRect(Math.round(player.position.x) - 6, Math.round(player.position.y) + 18, 12, 2);
        }
        for (const id of this.controllers.keys()) {
            if (!activeIds.has(id)) this.controllers.delete(id);
        }
    }

    controllerFor(playerId) {
        let controller = this.controllers.get(playerId);
        if (!controller) {
            controller = new PlayerAnimationController();
            this.controllers.set(playerId, controller);
        }
        return controller;
    }
}

export class SpriteLocalPlayerRenderer extends PlayerSpriteRendererBase {
    constructor({ asset, definition }) {
        super({
            asset,
            definition,
            selectPlayers: (scene) => [{ ...scene.player, id: scene.player.id ?? scene.localPlayerId }],
            markerColor: "#67e8f9"
        });
    }
}

export class SpriteRemotePlayerRenderer extends PlayerSpriteRendererBase {
    constructor({ asset, definition }) {
        super({
            asset,
            definition,
            selectPlayers: (scene) => scene.otherPlayers ?? [],
            markerColor: "#c084fc"
        });
    }
}

export class SpriteEnemyRenderer {
    constructor({ size = { width: 36, height: 36 } } = {}) {
        this.size = Object.freeze({ ...size });
    }

    draw({ context, scene }) {
        for (const enemy of scene.enemies ?? []) {
            paintPixelSprite({
                context,
                sprite: ENEMY_SPRITE,
                palette: { a: "#881337", b: "#fb7185", c: "#fecdd3" },
                position: enemy.position,
                size: this.size
            });
            context.fillStyle = "#1f2937";
            context.fillRect(enemy.position.x - 20, enemy.position.y - enemy.radius - 11, 40, 5);
            context.fillStyle = "#fda4af";
            context.fillRect(
                enemy.position.x - 20,
                enemy.position.y - enemy.radius - 11,
                40 * (enemy.health / enemy.maxHealth),
                5
            );
        }
    }
}

export class SpriteProjectileRenderer {
    constructor({ selectProjectiles, sprite, palette, size }) {
        this.selectProjectiles = selectProjectiles;
        this.sprite = sprite;
        this.palette = palette;
        this.size = Object.freeze({ ...size });
    }

    draw({ context, scene }) {
        for (const projectile of this.selectProjectiles(scene)) {
            paintPixelSprite({
                context,
                sprite: this.sprite,
                palette: this.palette,
                position: projectile.position,
                size: this.size
            });
        }
    }
}

export const playerProjectileSprite = PLAYER_PROJECTILE_SPRITE;
export const enemyProjectileSprite = ENEMY_PROJECTILE_SPRITE;
