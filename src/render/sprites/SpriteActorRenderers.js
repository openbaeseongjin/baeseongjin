import { paintPixelSprite } from "./PixelSpritePainter.js";
import { PlayerAnimationController } from "./PlayerAnimationController.js";
import { paintSpriteFrame } from "./SpriteCanvasPainter.js";
import { centeredBounds, circleBounds, isVisible } from "../RenderViewport.js";
import { enemyAimLine, enemySensorColor } from "../EnemyTelegraphPresentation.js";

const ENEMY_SPRITE = Object.freeze({
    rows: Object.freeze(["......aa", "..aaaaaa", "abbbccca", "abccccba", "..aaaaaa", "......aa"])
});
const PLAYER_PROJECTILE_SPRITE = Object.freeze({ rows: Object.freeze([".a.", "aba", ".a."]) });
const ENEMY_PROJECTILE_SPRITE = Object.freeze({ rows: Object.freeze(["..a..", ".aba.", "abcba", ".aba.", "..a.."]) });

function eventsForPlayer(scene, playerId) {
    return (scene.playerPresentationEvents ?? []).filter((event) => event.playerId === playerId);
}

class PlayerSpriteRendererBase {
    constructor({ assets, definition, selectPlayers, selectPlayerId = (_scene, player) => player.id, markerColor }) {
        this.assets = assets;
        this.definition = definition;
        this.selectPlayers = selectPlayers;
        this.selectPlayerId = selectPlayerId;
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
            const playerId = this.selectPlayerId(args.scene, player);
            activeIds.add(playerId);
            const controller = this.controllerFor(playerId);
            const animation = controller.update({
                player,
                rope: player.rope ?? args.scene.rope,
                events: eventsForPlayer(args.scene, playerId),
                dt
            });
            const presentation = this.definition.presentationFor(animation.state);
            const frame = presentation.clip.frameAt(animation.elapsedSeconds);
            paintSpriteFrame({
                context: args.context,
                image: this.assets.imageFor(frame.atlasId),
                frame,
                position: player.position,
                size: presentation.size,
                anchor: presentation.anchor,
                offset: presentation.offset,
                opacity: presentation.opacity,
                pixelSnap: presentation.pixelSnap,
                flipX: animation.flipX,
                rotation: player.angle ?? 0
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
            controller = new PlayerAnimationController({
                transientDurations: {
                    hit: this.definition.presentationFor("hit").clip.totalDurationSeconds,
                    respawn: this.definition.presentationFor("respawn").clip.totalDurationSeconds
                }
            });
            this.controllers.set(playerId, controller);
        }
        return controller;
    }
}

export class SpriteLocalPlayerRenderer extends PlayerSpriteRendererBase {
    constructor({ assets, definition }) {
        super({
            assets,
            definition,
            selectPlayers: (scene) => [scene.player],
            selectPlayerId: (scene, player) => player.id ?? scene.localPlayerId,
            markerColor: "#67e8f9"
        });
    }
}

export class SpriteRemotePlayerRenderer extends PlayerSpriteRendererBase {
    constructor({ assets, definition }) {
        super({
            assets,
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

    draw({ context, scene, viewport, renderStats }) {
        const enemies = scene.enemies ?? [];
        let drawn = 0;
        for (const enemy of enemies) {
            const radius = Math.max(this.size.width, this.size.height, (enemy.radius ?? 0) * 2) * 0.5 + 14;
            if (!isVisible(viewport, circleBounds(enemy.position, radius))) continue;
            drawn += 1;
            const aimLine = enemyAimLine(enemy);
            if (aimLine) {
                context.save();
                context.strokeStyle = aimLine.color;
                context.lineWidth = aimLine.width;
                context.beginPath();
                context.moveTo(enemy.position.x, enemy.position.y);
                context.lineTo(aimLine.end.x, aimLine.end.y);
                context.stroke();
                context.restore();
            }
            paintPixelSprite({
                context,
                sprite: ENEMY_SPRITE,
                palette: { a: "#881337", b: "#fb7185", c: "#fecdd3" },
                position: enemy.position,
                size: this.size
            });
            context.fillStyle = enemySensorColor(enemy);
            context.fillRect(enemy.position.x - 11, enemy.position.y - 3, 6, 6);
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
        renderStats?.recordCollection("enemies", enemies.length, drawn);
    }
}

export class SpriteProjectileRenderer {
    constructor({ selectProjectiles, sprite, palette, size, category = "projectiles" }) {
        this.selectProjectiles = selectProjectiles;
        this.sprite = sprite;
        this.palette = palette;
        this.size = Object.freeze({ ...size });
        this.category = category;
    }

    draw({ context, scene, viewport, renderStats }) {
        const projectiles = this.selectProjectiles(scene);
        let drawn = 0;
        for (const projectile of projectiles) {
            if (!isVisible(viewport, centeredBounds(projectile.position, this.size))) continue;
            drawn += 1;
            paintPixelSprite({
                context,
                sprite: this.sprite,
                palette: this.palette,
                position: projectile.position,
                size: this.size
            });
        }
        renderStats?.recordCollection(this.category, projectiles.length, drawn);
    }
}

export const playerProjectileSprite = PLAYER_PROJECTILE_SPRITE;
export const enemyProjectileSprite = ENEMY_PROJECTILE_SPRITE;
