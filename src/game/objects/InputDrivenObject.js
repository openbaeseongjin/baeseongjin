import { defineObjectOwner, GameObject, requireObjectId } from "./GameObject.js";

export class InputDrivenObject extends GameObject {
    #inputCapabilities = new Map();

    constructor({ id, ownerId }) {
        super({ id });
        defineObjectOwner(this, ownerId);
    }

    get driveKind() {
        return "input";
    }

    registerInputCapability({ id, order = 0, apply }) {
        requireObjectId(id, "input capability id");
        if (!Number.isFinite(order)) throw new Error("input capability order must be finite");
        if (typeof apply !== "function") throw new Error("input capability apply must be a function");
        if (this.#inputCapabilities.has(id)) throw new Error(`duplicate input capability: ${id}`);
        this.#inputCapabilities.set(id, Object.freeze({ id, order, apply }));
    }

    hasInputCapability(id) {
        return this.#inputCapabilities.has(id);
    }

    inputCapabilities() {
        return Object.freeze([...this.#inputCapabilities.values()]);
    }
}
