import { ClientFeedbackObject } from "./ClientFeedbackObject.js";
import { createEnemyFeedbackStates } from "./EnemyFeedbackStates.js";

export class EnemyCombatFeedback extends ClientFeedbackObject {
    constructor({ states = createEnemyFeedbackStates() } = {}) {
        super();
        this.states = states;
    }

    sync({ enemies = [], players = [] }, context) {
        const byId = new Map([...players, ...enemies].map((object) => [object.id, object]));
        for (const enemy of enemies) for (const state of this.states) state.project(enemy, byId, context);
    }
}
