import { colliderSnapshotBoundingRadius, colliderSnapshotBounds } from "../colliders/Collider.js";
import { Quadtree, boundsIntersect, expandBounds, unionBounds } from "./Quadtree.js";

function surfaceBounds(surface) {
    if ([surface?.x, surface?.y, surface?.width, surface?.height].every(Number.isFinite)) {
        return { x: surface.x, y: surface.y, width: surface.width, height: surface.height };
    }
    const vertices = surface?.vertices ?? [];
    const xs = vertices.map(({ x }) => x);
    const ys = vertices.map(({ y }) => y);
    if (xs.length === 0 || ys.length === 0) throw new Error("collision surface requires bounds or vertices");
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

function actorKind(actor) {
    return typeof actor?.enemyType === "string" ? "enemy" : "player";
}

function actorBounds(actor) {
    const collider = typeof actor.collider?.snapshot === "function" ? actor.collider.snapshot() : actor.collider;
    return colliderSnapshotBounds(collider, actor.position);
}

function sweptColliderBounds(collider, start, end, padding = 0) {
    const snapshot = typeof collider.snapshot === "function" ? collider.snapshot() : collider;
    const swept = unionBounds(colliderSnapshotBounds(snapshot, start), colliderSnapshotBounds(snapshot, end));
    return padding > 0 ? expandBounds(swept, padding) : swept;
}

export function createSimulationInterestBounds(players, { interestHalfWidth, interestHalfHeight }) {
    return Object.freeze(
        players
            .filter(({ lifeState }) => lifeState === undefined || lifeState === "active")
            .map((player) => {
                const position = player.position ?? player.physics?.position;
                return Object.freeze({
                    x: position.x - interestHalfWidth,
                    y: position.y - interestHalfHeight,
                    width: interestHalfWidth * 2,
                    height: interestHalfHeight * 2
                });
            })
    );
}

export class CollisionBroadPhase {
    constructor(config) {
        for (const key of ["interestHalfWidth", "interestHalfHeight"]) {
            if (!Number.isFinite(config?.[key]) || config[key] <= 0) {
                throw new Error(`CollisionBroadPhase ${key} must be positive`);
            }
        }
        this.config = Object.freeze({ ...config });
        this.surfaceTree = new Quadtree({
            capacity: config.quadtreeCapacity,
            maxDepth: config.quadtreeMaxDepth
        });
        this.actorTree = new Quadtree({
            capacity: config.quadtreeCapacity,
            maxDepth: config.quadtreeMaxDepth
        });
        this.surfaceSource = null;
        this.surfaceOrder = new Map();
        this.surfaceCount = 0;
        this.indexedActorIds = new Set();
        this.actorOrder = new Map();
        this.interestBounds = Object.freeze([]);
        this.frameTick = null;
        this.staticBuilds = 0;
        this.resetFrameMetrics();
    }

    resetFrameMetrics() {
        this.surfaceQueries = 0;
        this.surfaceCandidates = 0;
        this.surfacePotential = 0;
        this.actorQueries = 0;
        this.actorCandidates = 0;
        this.actorPotential = 0;
        this.activeEnemyCount = 0;
        this.totalEnemyCount = 0;
    }

    setSurfaces(surfaces) {
        if (this.surfaceSource === surfaces) return false;
        this.surfaceSource = surfaces;
        this.surfaceOrder = new Map(surfaces.map((surface, index) => [surface, index]));
        this.surfaceCount = surfaces.length;
        this.surfaceTree.rebuild(
            surfaces.map((surface, index) => ({
                id: surface.id ?? `surface:${index}`,
                bounds: surfaceBounds(surface),
                value: surface
            }))
        );
        this.staticBuilds += 1;
        return true;
    }

    beginFrame({ tick, surfaces, players, enemies }) {
        this.setSurfaces(surfaces);
        this.resetFrameMetrics();
        this.frameTick = tick;
        this.interestBounds = createSimulationInterestBounds(players, this.config);
        const activeEnemies = enemies.filter((enemy) => {
            if (enemy.health !== undefined && enemy.health <= 0) return false;
            const bounds = actorBounds(enemy);
            return this.interestBounds.some((interest) => boundsIntersect(bounds, interest));
        });
        const actors = [
            ...players.filter(({ lifeState }) => lifeState === undefined || lifeState === "active"),
            ...activeEnemies
        ];
        this.indexedActorIds = new Set(actors.map(({ id }) => id));
        this.actorOrder = new Map(actors.map(({ id }, index) => [id, index]));
        this.actorTree.rebuild(
            actors.map((actor) => ({
                id: actor.id,
                bounds: actorBounds(actor),
                value: actor
            }))
        );
        this.activeEnemyCount = activeEnemies.length;
        this.totalEnemyCount = enemies.length;
        return Object.freeze(activeEnemies);
    }

    querySurfaces({ collider, start, end }) {
        const padding = colliderSnapshotBoundingRadius(
            typeof collider.snapshot === "function" ? collider.snapshot() : collider
        );
        const candidates = this.surfaceTree
            .query(sweptColliderBounds(collider, start, end, padding))
            .sort((left, right) => this.surfaceOrder.get(left) - this.surfaceOrder.get(right));
        this.surfaceQueries += 1;
        this.surfaceCandidates += candidates.length;
        this.surfacePotential += this.surfaceCount;
        return candidates;
    }

    queryActors({ actorId, collider, start, end, kinds = null }) {
        const candidateKinds = kinds ? new Set(kinds) : null;
        const candidates = this.actorTree
            .query(sweptColliderBounds(collider, start, end))
            .filter(
                (actor) =>
                    actor.id !== actorId &&
                    (candidateKinds === null || candidateKinds.has(actorKind(actor))) &&
                    (actor.lifeState === undefined || actor.lifeState === "active") &&
                    (actor.health === undefined || actor.health > 0)
            )
            .sort((left, right) => this.actorOrder.get(left.id) - this.actorOrder.get(right.id));
        this.actorQueries += 1;
        this.actorCandidates += candidates.length;
        this.actorPotential += Math.max(0, this.actorTree.size - 1);
        return candidates;
    }

    updateActor(actor) {
        if (!actor?.id || !this.indexedActorIds.has(actor.id)) return false;
        this.actorTree.update(actor.id, actorBounds(actor), actor);
        return true;
    }

    invalidateFrame() {
        this.frameTick = null;
    }

    snapshot() {
        const surfaceReduction = this.surfacePotential === 0 ? 0 : 1 - this.surfaceCandidates / this.surfacePotential;
        const actorReduction = this.actorPotential === 0 ? 0 : 1 - this.actorCandidates / this.actorPotential;
        return Object.freeze({
            frameTick: this.frameTick,
            activeEnemyCount: this.activeEnemyCount,
            totalEnemyCount: this.totalEnemyCount,
            interestBounds: this.interestBounds,
            surfaceQueries: this.surfaceQueries,
            surfaceCandidates: this.surfaceCandidates,
            surfacePotential: this.surfacePotential,
            surfaceReduction,
            actorQueries: this.actorQueries,
            actorCandidates: this.actorCandidates,
            actorPotential: this.actorPotential,
            actorReduction,
            staticBuilds: this.staticBuilds
        });
    }
}
