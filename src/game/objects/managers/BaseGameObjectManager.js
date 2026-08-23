const EMPTY_OBJECTS = Object.freeze([]);

function requireObjectId(object, kind) {
    if (typeof object?.id !== "string" || object.id.length === 0) {
        throw new Error(`${kind} object requires a non-empty id`);
    }
    return object.id;
}

export class BaseGameObjectManager {
    #items;
    #byId;

    constructor(kind, items = []) {
        if (typeof kind !== "string" || kind.length === 0) throw new Error("BaseGameObjectManager requires a kind");
        this.kind = kind;
        this.#commit(items);
    }

    get mutable() {
        return true;
    }

    get allowsDuplicateIds() {
        return false;
    }

    get all() {
        return this.#items;
    }

    get size() {
        return this.#items.length;
    }

    validateObject(object) {
        return object;
    }

    ids() {
        return this.#items.map(({ id }) => id);
    }

    replace(items) {
        this.#requireMutable();
        return this.#commit(items);
    }

    add(object) {
        this.#requireMutable();
        const id = requireObjectId(object, this.kind);
        this.validateObject(object);
        if (!this.allowsDuplicateIds && Object.hasOwn(this.#byId, id)) {
            throw new Error(`duplicate ${this.kind} object id: ${id}`);
        }
        return this.#commit([...this.#items, object]).at(-1);
    }

    find(id) {
        return this.#byId[id]?.[0] ?? null;
    }

    findAll(id) {
        return this.#byId[id] ?? EMPTY_OBJECTS;
    }

    remove(id) {
        this.#requireMutable();
        const object = this.find(id);
        if (!object) return null;
        this.#commit(this.#items.filter((candidate) => candidate !== object));
        return object;
    }

    removeWhere(predicate) {
        this.#requireMutable();
        const removed = [];
        const retained = [];
        for (const object of this.#items) {
            if (predicate(object)) removed.push(object);
            else retained.push(object);
        }
        if (removed.length > 0) this.#commit(retained);
        return Object.freeze(removed);
    }

    clear() {
        this.#requireMutable();
        if (this.#items.length === 0) return this.#items;
        return this.#commit([]);
    }

    renderSnapshots() {
        return this.#items.map((object) => object.renderSnapshot());
    }

    #requireMutable() {
        if (!this.mutable) throw new Error(`${this.kind} manager is immutable`);
    }

    #commit(items) {
        if (!Array.isArray(items)) throw new Error(`${this.kind} objects must be an array`);
        const byId = Object.create(null);
        for (const object of items) {
            const id = requireObjectId(object, this.kind);
            this.validateObject(object);
            const matches = byId[id] ?? [];
            if (!this.allowsDuplicateIds && matches.length > 0) {
                throw new Error(`duplicate ${this.kind} object id: ${id}`);
            }
            matches.push(object);
            byId[id] = matches;
        }
        for (const id of Object.keys(byId)) byId[id] = Object.freeze(byId[id]);
        this.#items = Object.freeze([...items]);
        this.#byId = Object.freeze(byId);
        return this.#items;
    }
}
