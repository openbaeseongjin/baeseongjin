import { EnemyCombatFeedback } from "./EnemyCombatFeedback.js";
import { ProjectileCombatFeedback } from "./ProjectileCombatFeedback.js";
import { WindCombatFeedback } from "./WindCombatFeedback.js";
import { PlayerRopeCombatFeedback } from "./PlayerRopeCombatFeedback.js";

export function createClientFeedbackObjects() {
    const playerRope = new PlayerRopeCombatFeedback();
    return Object.freeze({
        all: Object.freeze([
            new EnemyCombatFeedback(),
            new WindCombatFeedback(),
            new ProjectileCombatFeedback(),
            playerRope
        ]),
        playerRope
    });
}
