import { paintPixelSprite } from "./PixelSpritePainter.js";
import { EnemyAnimationController } from "./EnemyAnimationController.js";
import { PlayerAnimationController } from "./PlayerAnimationController.js";
import { paintSpriteFrame } from "./SpriteCanvasPainter.js";
import { centeredBounds, circleBounds, isVisible } from "../RenderViewport.js";
import { drawEnemyBehaviorTelegraph } from "../EnemyTelegraphPresentation.js";
import { resolveEnemyPresentationState, resolveUprightAimTransform } from "../EnemyPresentationState.js";
import { enemySectorIdBySourceId } from "./EnemySpritePackageCatalog.js";

const ENEMY_SPRITE = Object.freeze({
    rows: Object.freeze(["......aa", "..aaaaaa", "abbbccca", "abccccba", "..aaaaaa", "......aa"])
});
const PLAYER_PROJECTILE_SPRITE = Object.freeze({ rows: Object.freeze([".a.", "aba", ".a."]) });
const ENEMY_PROJECTILE_SPRITE = Object.freeze({ rows: Object.freeze(["..a..", ".aba.", "abcba", ".aba.", "..a.."]) });

function eventsForPlayer(scene, playerId) {
    return (scene.playerPresentationEvents ?? []).filter((event) => event.playerId === playerId);
}

export { resolveUprightAimTransform };

export function resolveEnemyAimLayerDirection(enemy) {
    return resolveEnemyPresentationState(enemy).aimLayerDirection;
}

export function resolvePursuitDirectionTransform(enemy, presentationState) {
    return resolveEnemyPresentationState(enemy).primaryState === presentationState
        ? resolveEnemyPresentationState(enemy).pursuitTransform
        : null;
}

export function resolveGuardOctant(guardDirection) {
    const x = guardDirection?.x;
    const y = guardDirection?.y;
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.hypot(x, y) <= Number.EPSILON) return 0;
    return ((Math.round(Math.atan2(y, x) / (Math.PI / 4)) % 8) + 8) % 8;
}

export function resolveEnemyGuardLayerDirection(enemy) {
    return resolveEnemyPresentationState(enemy).guardLayerDirection;
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
            const position = animation.positionOverride ?? player.position;
            paintSpriteFrame({
                context: args.context,
                image: this.assets.imageFor(frame.atlasId),
                frame,
                position,
                size: presentation.size,
                anchor: presentation.anchor,
                offset: presentation.offset,
                opacity: presentation.opacity,
                pixelSnap: presentation.pixelSnap,
                flipX: animation.flipX,
                rotation: animation.state === "death" ? 0 : (player.angle ?? 0) + animation.rotationOffset
            });
            if (animation.state !== "death") {
                args.context.fillStyle = this.markerColor;
                args.context.fillRect(Math.round(position.x) - 6, Math.round(position.y) + 18, 12, 2);
            }
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
                    death: this.definition.presentationFor("death").clip.totalDurationSeconds,
                    respawn: this.definition.presentationFor("respawn").clip.totalDurationSeconds
                },
                runCycleDurationSeconds: this.definition.presentationFor("run").clip.totalDurationSeconds
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
    constructor({
        packageCatalog,
        size = { width: 36, height: 36 },
        presentationResolver = resolveEnemyPresentationState,
        spriteResolver = () => ENEMY_SPRITE
    } = {}) {
        if (!packageCatalog) throw new Error("SpriteEnemyRenderer requires an enemy sprite package catalog");
        this.packageCatalog = packageCatalog;
        this.size = Object.freeze({ ...size });
        this.presentationResolver = presentationResolver;
        this.spriteResolver = spriteResolver;
        this.controllers = new Map();
        this.previousTime = null;
    }

    draw({ context, scene, viewport, renderStats, presentationTimeSeconds = 0 }) {
        const enemies = scene.enemies ?? [];
        const currentTime = Number.isFinite(presentationTimeSeconds) ? presentationTimeSeconds : 0;
        const dt = this.previousTime === null ? 0 : Math.min(0.1, Math.max(0, currentTime - this.previousTime));
        this.previousTime = currentTime;
        const activeAnimationIds = new Set();
        const sectorIdBySourceId = enemySectorIdBySourceId(scene.world);
        let drawn = 0;
        for (const enemy of enemies) {
            const presentation = this.presentationResolver(enemy);
            const spritePackage = this.packageCatalog.packageFor({
                sectorId:
                    enemy.sectorId ?? sectorIdBySourceId[enemy.objectId] ?? sectorIdBySourceId[enemy.areaId] ?? null,
                enemyType: presentation.enemyType
            });
            const spritePresentation =
                spritePackage?.definition.presentationFor(presentation.enemyType, presentation.primaryState) ?? null;
            const renderSize = presentation.renderSize ?? spritePresentation?.size ?? this.size;
            const radius = Math.max(renderSize.width, renderSize.height, (enemy.radius ?? 0) * 2) * 0.5 + 14;
            if (!isVisible(viewport, circleBounds(enemy.position, radius))) continue;
            drawn += 1;
            const aimLine = presentation.aimLine;
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
            drawEnemyBehaviorTelegraph(context, enemy, enemies, presentation);
            const usesProductionSprite = Boolean(spritePackage);
            if (usesProductionSprite) {
                const animationId = typeof enemy.id === "string" && enemy.id ? enemy.id : enemy;
                activeAnimationIds.add(animationId);
                const controller = this.controllerFor(
                    animationId,
                    spritePackage,
                    presentation.enemyType,
                    spritePresentation.clipState
                );
                const pursuitDirectionTransform = presentation.pursuitTransform;
                const animation = controller.update({
                    state: spritePresentation.clipState,
                    dt,
                    facingX:
                        spritePresentation.guardLayer || pursuitDirectionTransform
                            ? null
                            : (presentation.facingDirection?.x ?? null)
                });
                const frame = spritePresentation.clip.frameAt(animation.elapsedSeconds);
                paintSpriteFrame({
                    context,
                    image: spritePackage.assets.imageFor(frame.atlasId),
                    frame,
                    position: enemy.position,
                    size: renderSize,
                    anchor: spritePresentation.anchor,
                    offset: spritePresentation.offset,
                    opacity: spritePresentation.opacity,
                    pixelSnap: spritePresentation.pixelSnap,
                    flipX:
                        spritePresentation.aimLayer || spritePresentation.guardLayer
                            ? false
                            : (pursuitDirectionTransform?.flipX ?? animation.flipX),
                    rotation: spritePresentation.guardLayer
                        ? 0
                        : (pursuitDirectionTransform?.rotation ?? enemy.angle ?? 0)
                });
                if (spritePresentation.aimLayer) {
                    const aimTransform = resolveUprightAimTransform(presentation.aimLayerDirection);
                    paintSpriteFrame({
                        context,
                        image: spritePackage.assets.imageFor(spritePresentation.aimLayer.frame.atlasId),
                        frame: spritePresentation.aimLayer.frame,
                        position: enemy.position,
                        size: renderSize,
                        anchor: spritePresentation.anchor,
                        offset: spritePresentation.offset,
                        opacity: spritePresentation.opacity,
                        pixelSnap: spritePresentation.pixelSnap,
                        flipX: aimTransform.flipX,
                        rotation: aimTransform.rotation
                    });
                }
                if (spritePresentation.guardLayer) {
                    const directionIndex = resolveGuardOctant(presentation.guardLayerDirection);
                    const guardFrame = spritePresentation.guardLayer.frames[directionIndex];
                    paintSpriteFrame({
                        context,
                        image: spritePackage.assets.imageFor(guardFrame.atlasId),
                        frame: guardFrame,
                        position: enemy.position,
                        size: renderSize,
                        anchor: spritePresentation.anchor,
                        offset: spritePresentation.offset,
                        opacity: spritePresentation.opacity,
                        pixelSnap: spritePresentation.pixelSnap,
                        flipX: false,
                        rotation: 0
                    });
                }
            } else {
                paintPixelSprite({
                    context,
                    sprite: this.spriteResolver(presentation, enemy),
                    palette: presentation.drone
                        ? { a: "#78350f", b: "#fbbf24", c: "#fef3c7" }
                        : { a: "#881337", b: "#fb7185", c: "#fecdd3" },
                    position: enemy.position,
                    size: renderSize
                });
            }
            if (!usesProductionSprite && presentation.drone) {
                const halfWidth = renderSize.width * 0.5;
                const halfHeight = renderSize.height * 0.5;
                context.strokeStyle = "#94a3b8";
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(enemy.position.x - halfWidth, enemy.position.y - halfHeight * 0.7);
                context.lineTo(enemy.position.x + halfWidth, enemy.position.y - halfHeight * 0.7);
                context.stroke();
            }
            if (!usesProductionSprite) {
                const sensorSize = Math.max(3, renderSize.width / 6);
                context.fillStyle = presentation.sensorColor;
                context.fillRect(
                    enemy.position.x - renderSize.width * 0.3,
                    enemy.position.y - sensorSize * 0.5,
                    sensorSize,
                    sensorSize
                );
            }
        }
        for (const animationId of this.controllers.keys()) {
            if (!activeAnimationIds.has(animationId)) this.controllers.delete(animationId);
        }
        renderStats?.recordCollection("enemies", enemies.length, drawn);
    }

    controllerFor(animationId, spritePackage, enemyType, initialState) {
        const canonicalEnemyType = spritePackage.definition.canonicalEnemyType(enemyType);
        let entry = this.controllers.get(animationId);
        if (!entry || entry.enemyType !== canonicalEnemyType || entry.packageId !== spritePackage.id) {
            const states = Object.keys(spritePackage.definition.enemies[canonicalEnemyType].clips);
            entry = {
                packageId: spritePackage.id,
                enemyType: canonicalEnemyType,
                controller: new EnemyAnimationController({ states, initialState })
            };
            this.controllers.set(animationId, entry);
        }
        return entry.controller;
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

export class SpriteCutterProjectileRenderer {
    constructor({ selectProjectiles, size = { width: 14, height: 14 }, category = "cutterProjectiles" } = {}) {
        if (typeof selectProjectiles !== "function") {
            throw new Error("SpriteCutterProjectileRenderer requires selectProjectiles");
        }
        this.selectProjectiles = selectProjectiles;
        this.size = Object.freeze({ ...size });
        this.category = category;
        this.palette = Object.freeze({ a: "#7c2d12", b: "#ff8c1a", c: "#fff7ed" });
    }

    draw({ context, scene, viewport, renderStats }) {
        const projectiles = this.selectProjectiles(scene);
        let drawn = 0;
        for (const projectile of projectiles) {
            if (!isVisible(viewport, centeredBounds(projectile.position, this.size))) continue;
            drawn += 1;
            const speed = Math.hypot(projectile.velocity.x, projectile.velocity.y) || 1;
            const tail = {
                x: projectile.position.x - (projectile.velocity.x / speed) * 18,
                y: projectile.position.y - (projectile.velocity.y / speed) * 18
            };
            context.strokeStyle = "rgba(255, 140, 26, 0.6)";
            context.lineWidth = 2;
            context.lineCap = "round";
            context.beginPath();
            context.moveTo(tail.x, tail.y);
            context.lineTo(projectile.position.x, projectile.position.y);
            context.stroke();
            context.lineCap = "butt";
            paintPixelSprite({
                context,
                sprite: ENEMY_PROJECTILE_SPRITE,
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
