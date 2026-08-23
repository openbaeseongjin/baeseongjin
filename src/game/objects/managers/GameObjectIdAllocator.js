export class GameObjectIdAllocator {
    constructor() {
        this.nextId = 1;
    }

    createId(kind) {
        const id = `${kind}-${this.nextId}`;
        this.nextId += 1;
        return id;
    }
}
