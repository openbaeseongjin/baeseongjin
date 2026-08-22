export class ClientFeedbackObject {
    sync() {
        throw new Error(`${this.constructor.name} must implement sync`);
    }

    emit({ emit }, id, presetId, position, direction, options = {}) {
        return emit(id, presetId, position, direction, options);
    }

    project(definition, value, lookup, context) {
        if (!definition.predicate(value, lookup)) return false;
        const { id, presetId, position, direction, options } = definition.request(value, lookup);
        this.emit(context, id, presetId, position, direction, options);
        return true;
    }
}
