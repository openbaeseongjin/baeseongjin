import { JAMMER_BEHAVIOR_STATE } from "../EnemyBehaviorDefinition.js";
import { nearestTarget } from "../EnemyBehaviorSupport.js";

export class JammerRoamState {
    advance(behavior, enemy, { targets, dt }) {
        const target = nearestTarget(enemy, targets, behavior.acquireRange, { respectActivation: false });
        behavior.mobility.advance(enemy, { focusPosition: target?.physics.position ?? null, dt });
        return null;
    }
}

export const JAMMER_BEHAVIOR_STATE_DEFINITION = Object.freeze({
    [JAMMER_BEHAVIOR_STATE.ROAM]: Object.freeze(new JammerRoamState())
});
