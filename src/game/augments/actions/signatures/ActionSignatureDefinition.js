export class ActionSignatureDefinition {
    constructor(id) {
        this.id = id;
    }

    decorateActivation() {
        throw new Error(`${this.constructor.name} must implement decorateActivation()`);
    }
}
