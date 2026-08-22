export class EnemyFeedbackState {
    constructor(definition) {
        if (!definition || typeof definition.predicate !== "function" || typeof definition.request !== "function") {
            throw new Error("EnemyFeedbackState requires a definition");
        }
        this.definition = definition;
    }

    project(enemy, byId, context) {
        if (!this.predicate(enemy, byId)) return false;
        this.present(enemy, byId, context);
        return true;
    }

    predicate(enemy, byId) {
        return this.definition.predicate(enemy, byId, this.state(enemy));
    }

    present(enemy, byId, context) {
        const { id, presetId, position, direction, options } = this.definition.request(enemy, byId);
        this.emit(context, id, presetId, position, direction, options);
    }

    emit({ emit }, id, presetId, position, direction, options = {}) {
        return emit(id, presetId, position, direction, options);
    }

    state(enemy) {
        return enemy.behaviorState?.state ?? enemy.attackState;
    }
}
