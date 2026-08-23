import { EnemyObjectManager } from "./EnemyObjectManager.js";
import { GameObjectIdAllocator } from "./GameObjectIdAllocator.js";
import { ImpactTargetManager } from "./ImpactTargetManager.js";
import { PlayerObjectManager } from "./PlayerObjectManager.js";
import { ProjectileObjectManager } from "./ProjectileObjectManager.js";
import { WorldObjectManager } from "./WorldObjectManager.js";

const EMPTY_OBJECTS = Object.freeze([]);

export class GameObjectManager {
    constructor({ world, collisionBroadPhase }) {
        if (!world || !collisionBroadPhase)
            throw new Error("GameObjectManager requires world and collision broad phase");
        this.identifiers = new GameObjectIdAllocator();
        this.spatial = collisionBroadPhase;
        this.worldObjects = new WorldObjectManager(world.objects ?? []);
        this.players = new PlayerObjectManager();
        this.enemies = new EnemyObjectManager(world.enemySpawns ?? []);
        this.playerProjectiles = new ProjectileObjectManager("player-projectile");
        this.enemyProjectiles = new ProjectileObjectManager("enemy-projectile");
        this.impactTargets = new ImpactTargetManager();
    }

    addPlayerRuntime(runtime) {
        return this.players.addRuntime(runtime);
    }

    removePlayer(playerId) {
        return this.players.remove(playerId);
    }

    ropeAttachmentSurfaces({ origin, aimPoint, maxAttachDistance, aimTolerance }) {
        const dx = aimPoint.x - origin.x;
        const dy = aimPoint.y - origin.y;
        const magnitude = Math.hypot(dx, dy);
        if (magnitude <= Number.EPSILON) return EMPTY_OBJECTS;
        const rayEnd = {
            x: origin.x + (dx / magnitude) * maxAttachDistance,
            y: origin.y + (dy / magnitude) * maxAttachDistance
        };
        const minX = Math.min(origin.x, rayEnd.x, aimPoint.x - aimTolerance);
        const minY = Math.min(origin.y, rayEnd.y, aimPoint.y - aimTolerance);
        const maxX = Math.max(origin.x, rayEnd.x, aimPoint.x + aimTolerance);
        const maxY = Math.max(origin.y, rayEnd.y, aimPoint.y + aimTolerance);
        return this.spatial.querySurfaceBounds({ x: minX, y: minY, width: maxX - minX, height: maxY - minY });
    }

    ropeAttachmentSurfacesInBounds(bounds) {
        return this.spatial.querySurfaceBounds(bounds);
    }

    beginSimulationFrame({ tick, surfaces, neutralActors = EMPTY_OBJECTS }) {
        return this.enemies.beginFrame({
            collisionBroadPhase: this.spatial,
            tick,
            surfaces,
            players: this.players.all,
            neutralActors
        });
    }
}
