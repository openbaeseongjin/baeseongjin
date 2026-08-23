import { BaseGameObjectManager } from "./BaseGameObjectManager.js";

const EMPTY_INPUT_OBJECTS = Object.freeze([]);

export class PlayerObjectManager extends BaseGameObjectManager {
    #ropes = new BaseGameObjectManager("rope");
    #weapons = new BaseGameObjectManager("automatic-weapon");
    #inputDrivenByOwnerId = new Map();

    constructor() {
        super("player");
    }

    add() {
        throw new Error("PlayerObjectManager requires addRuntime() so Player, Rope and Weapon stay atomic");
    }

    addRuntime(runtime) {
        if (!runtime?.entity || !runtime.ropeObject || !runtime.weapon || !Array.isArray(runtime.inputDrivenObjects)) {
            throw new Error("PlayerObjectManager requires a complete Player runtime");
        }
        super.add(runtime.entity);
        try {
            this.#ropes.add(runtime.ropeObject);
            this.#weapons.add(runtime.weapon);
            this.#inputDrivenByOwnerId.set(runtime.entity.id, Object.freeze([...runtime.inputDrivenObjects]));
        } catch (error) {
            super.remove(runtime.entity.id);
            this.#ropes.remove(runtime.ropeObject.id);
            this.#weapons.remove(runtime.weapon.id);
            this.#inputDrivenByOwnerId.delete(runtime.entity.id);
            throw error;
        }
        return runtime;
    }

    remove(playerId) {
        const player = super.remove(playerId);
        if (!player) return null;
        this.#ropes.remove(player.ropeObject.id);
        this.#weapons.remove(player.weapon.id);
        this.#inputDrivenByOwnerId.delete(playerId);
        return player;
    }

    active() {
        return this.all.filter(({ lifeState }) => lifeState === "active");
    }

    inputDrivenFor(playerId) {
        return this.#inputDrivenByOwnerId.get(playerId) ?? EMPTY_INPUT_OBJECTS;
    }
}
