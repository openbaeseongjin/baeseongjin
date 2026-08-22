export class PlayerRopeFeedbackRule {
    constructor(definition) {
        if (!definition || typeof definition.predicate !== "function" || typeof definition.present !== "function") {
            throw new Error("PlayerRopeFeedbackRule requires a definition");
        }
        this.definition = definition;
    }

    get order() {
        return this.definition.order;
    }

    apply(frame, context) {
        if (!this.definition.predicate(frame, context)) return false;
        this.definition.present(frame, context);
        return true;
    }
}
