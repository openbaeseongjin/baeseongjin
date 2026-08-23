import { BaseGameObjectManager } from "./BaseGameObjectManager.js";

export class EnemyObjectManager extends BaseGameObjectManager {
    #active = Object.freeze([]);
    #spawnsByObjectId;
    #staticStateByObjectId = new Map();

    constructor(spawns = []) {
        super("enemy");
        this.#spawnsByObjectId = Object.freeze(
            Object.fromEntries(spawns.map((spawn) => [spawn.objectId ?? spawn.encounterId ?? spawn.slotId, spawn]))
        );
        this.tombstones = new Map();
    }

    get active() {
        return this.#active;
    }

    replace(enemies) {
        this.#active = Object.freeze([]);
        const replaced = super.replace(enemies);
        for (const enemy of replaced) enemy.suspendSurfacePhysics();
        return replaced;
    }

    findAlive(enemyId) {
        const enemy = super.find(enemyId);
        return enemy?.health > 0 ? enemy : null;
    }

    isAuthoredObjectId(objectId) {
        return Object.hasOwn(this.#spawnsByObjectId, objectId);
    }

    staticStateFor(objectId, createState) {
        if (this.#staticStateByObjectId.has(objectId)) return this.#staticStateByObjectId.get(objectId);
        const spawn = this.#spawnsByObjectId[objectId];
        if (!spawn) return null;
        const state = createState(spawn);
        this.#staticStateByObjectId.set(objectId, state);
        return state;
    }

    remove(enemyId) {
        const removed = super.remove(enemyId);
        if (removed) this.#active = Object.freeze(this.#active.filter(({ id }) => id !== enemyId));
        return removed;
    }

    removeWhere(predicate) {
        const removed = super.removeWhere(predicate);
        if (removed.length > 0) {
            const removedIds = new Set(removed.map(({ id }) => id));
            this.#active = Object.freeze(this.#active.filter(({ id }) => !removedIds.has(id)));
        }
        return removed;
    }

    beginFrame({ collisionBroadPhase, tick, surfaces, players, neutralActors }) {
        const previousActive = this.#active;
        const active = collisionBroadPhase.beginFrame({ tick, surfaces, players, enemies: this.all, neutralActors });
        for (const enemy of active) enemy.observeActivation(players);
        const activeIds = new Set(active.map(({ id }) => id));
        for (const enemy of previousActive) {
            if (!activeIds.has(enemy.id)) enemy.suspendSurfacePhysics();
        }
        this.#active = active;
        return active;
    }
}
