import { PlayerRopeFeedbackObject } from "./PlayerRopeFeedbackObject.js";
import { createPlayerFeedbackStates } from "./PlayerRopeFeedbackStates.js";

export class PlayerCombatFeedback extends PlayerRopeFeedbackObject {
    constructor({ states = createPlayerFeedbackStates() } = {}) {
        super(states);
    }
}
