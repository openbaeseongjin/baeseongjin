function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a non-empty string`);
    return value;
}

export class GameObject {
    #renderSnapshotCapability = null;

    constructor({ id }) {
        Object.defineProperty(this, "id", {
            value: requireId(id, "id"),
            enumerable: true,
            writable: false
        });
    }

    registerRenderSnapshotCapability({ kind, snapshot }) {
        requireId(kind, "render snapshot capability kind");
        if (typeof snapshot !== "function") throw new Error("render snapshot capability must be a function");
        if (this.#renderSnapshotCapability) throw new Error(`duplicate render snapshot capability: ${kind}`);
        this.#renderSnapshotCapability = Object.freeze({ kind, snapshot });
    }

    hasRenderSnapshotCapability(kind = null) {
        if (!this.#renderSnapshotCapability) return false;
        return kind === null ? true : this.#renderSnapshotCapability.kind === kind;
    }

    renderSnapshot() {
        if (!this.#renderSnapshotCapability) throw new Error(`${this.id} has no render snapshot capability`);
        const snapshot = this.#renderSnapshotCapability.snapshot();
        if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
            throw new Error(`${this.id} render snapshot must be an object`);
        }
        return snapshot;
    }
}

export function requireObjectId(value, label) {
    return requireId(value, label);
}

export function defineObjectOwner(object, ownerId) {
    Object.defineProperty(object, "ownerId", {
        value: requireId(ownerId, "ownerId"),
        enumerable: true,
        writable: false
    });
}
