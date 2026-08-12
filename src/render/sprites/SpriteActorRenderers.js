import { paintPixelSprite } from "./PixelSpritePainter.js";
import { PlayerAnimationController } from "./PlayerAnimationController.js";
import { SpriteAnimation } from "./SpriteAnimation.js";
import { paintSpriteFrame } from "./SpriteCanvasPainter.js";

const PLAYER_SOURCE_SIZE = Object.freeze({ width: 24, height: 24 });
const PLAYER_DESTINATION_SIZE = Object.freeze({ width: 30, height: 30 });
const PLAYER_ANCHOR = Object.freeze({ x: 0.5, y: 0.5 });
const frame = (column, row, durationSeconds) => ({
    x: column * PLAYER_SOURCE_SIZE.width,
    y: row * PLAYER_SOURCE_SIZE.height,
    ...PLAYER_SOURCE_SIZE,
    durationSeconds
});
const PLAYER_CLIPS = Object.freeze({
    idle: new SpriteAnimation({ id: "idle", frames: [frame(0, 2, 0.32), frame(1, 2, 0.32)] }),
    run: new SpriteAnimation({
        id: "run",
        frames: [frame(0, 1, 0.11), frame(1, 1, 0.11), frame(2, 1, 0.11), frame(3, 1, 0.11)]
    }),
    jump: new SpriteAnimation({ id: "jump", loop: false, frames: [frame(0, 3, 1)] }),
    fall: new SpriteAnimation({ id: "fall", loop: false, frames: [frame(1, 3, 1)] }),
    rope: new SpriteAnimation({ id: "rope", frames: [frame(2, 3, 0.18), frame(3, 3, 0.18)] }),
    hit: new SpriteAnimation({ id: "hit", loop: false, frames: [frame(3, 2, 0.08), frame(2, 2, 0.16)] }),
    respawn: new SpriteAnimation({
        id: "respawn",
        loop: false,
        frames: [frame(3, 0, 0.12), frame(2, 0, 0.11), frame(1, 0, 0.11), frame(0, 0, 0.11)]
    })
});

const ENEMY_SPRITE = Object.freeze({
    rows: Object.freeze(["..aa..", ".abbaa", "abbbba", "abccba", ".bbbb.", ".a..a."])
});
const PLAYER_PROJECTILE_SPRITE = Object.freeze({ rows: Object.freeze([".a.", "aba", ".a."]) });
const ENEMY_PROJECTILE_SPRITE = Object.freeze({ rows: Object.freeze(["..a..", ".aba.", "abcba", ".aba.", "..a.."]) });

function eventsForPlayer(scene, playerId) {
    return (scene.playerPresentationEvents ?? []).filter((event) => event.playerId === playerId);
}

class PlayerSpriteRendererBase {
    constructor({ asset, selectPlayers, markerColor }) {
        this.asset = asset;
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
            const clip = PLAYER_CLIPS[animation.state];
            paintSpriteFrame({
                context: args.context,
                image: this.asset.image,
                frame: clip.frameAt(animation.elapsedSeconds),
                position: player.position,
                size: PLAYER_DESTINATION_SIZE,
                anchor: PLAYER_ANCHOR,
                flipX: animation.flipX
            });
            args.context.fillStyle = this.markerColor;
            args.context.fillRect(player.position.x - 6, player.position.y + 15, 12, 2);
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
    constructor({ asset }) {
        super({
            asset,
            selectPlayers: (scene) => [{ ...scene.player, id: scene.player.id ?? scene.localPlayerId }],
            markerColor: "#67e8f9"
        });
    }
}

export class SpriteRemotePlayerRenderer extends PlayerSpriteRendererBase {
    constructor({ asset }) {
        super({
            asset,
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
