export class ActionContactState {
    constructor() {
        this.byActivation = new Map();
    }

    begin(activationId) {
        this.byActivation.set(activationId, { damaged: new Set(), contacts: new Set() });
    }

    #tracker(activationId) {
        const tracker = this.byActivation.get(activationId) ?? { damaged: new Set(), contacts: new Set() };
        this.byActivation.set(activationId, tracker);
        return tracker;
    }

    hasContact(activationId, targetId) {
        return this.#tracker(activationId).contacts.has(targetId);
    }

    hasDamaged(activationId, targetId) {
        return this.#tracker(activationId).damaged.has(targetId);
    }

    damagedCount(activationId) {
        return this.#tracker(activationId).damaged.size;
    }

    markDamaged(activationId, targetId) {
        this.#tracker(activationId).damaged.add(targetId);
    }

    replaceContacts(activationId, contacts) {
        this.#tracker(activationId).contacts = contacts;
    }

    delete(activationId) {
        this.byActivation.delete(activationId);
    }

    clear() {
        this.byActivation.clear();
    }
}
