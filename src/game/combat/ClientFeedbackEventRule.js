export class ClientFeedbackEventRule {
    constructor(definition) {
        if (!definition || typeof definition.predicate !== "function" || typeof definition.present !== "function") {
            throw new Error("ClientFeedbackEventRule requires a definition");
        }
        this.definition = definition;
    }

    apply(event, context) {
        if (!this.definition.predicate(event, context)) return false;
        this.definition.present(event, context);
        return true;
    }
}
