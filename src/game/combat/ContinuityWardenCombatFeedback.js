import { ClientFeedbackObject } from "./ClientFeedbackObject.js";
import { continuityWardenCombatFeedbackSource } from "./ContinuityWardenCombatFeedbackDefinition.js";
import { createContinuityWardenCombatFeedbackStates } from "./ContinuityWardenCombatFeedbackState.js";

export class ContinuityWardenCombatFeedback extends ClientFeedbackObject {
    constructor({ states = createContinuityWardenCombatFeedbackStates() } = {}) {
        super();
        this.states = states;
    }

    sync({ bossStage = null }, context) {
        const source = continuityWardenCombatFeedbackSource(bossStage);
        if (!source) return;
        for (const state of this.states) state.project(source, context);
    }
}
