function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a non-empty string`);
    return value;
}

export class GameObject {
    constructor({ id }) {
        Object.defineProperty(this, "id", {
            value: requireId(id, "id"),
            enumerable: true,
            writable: false
        });
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
