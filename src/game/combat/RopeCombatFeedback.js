import { PlayerRopeFeedbackObject } from "./PlayerRopeFeedbackObject.js";
import { createRopeFeedbackStates } from "./PlayerRopeFeedbackStates.js";

export class RopeCombatFeedback extends PlayerRopeFeedbackObject {
    constructor({ states = createRopeFeedbackStates() } = {}) {
        super(states);
    }
}
