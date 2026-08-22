import { StateEnemyBehavior } from "./EnemyBehaviorBase.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND, SUPPORT_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";
import { validateBehaviorDt } from "./EnemyBehaviorSupport.js";
import { SUPPORT_BEHAVIOR_STATE_DEFINITION } from "./states/SupportEnemyBehaviorStates.js";

export class SupportEnemyBehavior extends StateEnemyBehavior {
    constructor({ targetId = null, range = 320, healingPerSecond = 18 } = {}) {
        super({
            kind: ENEMY_BEHAVIOR_KIND.SUPPORT,
            initialState: SUPPORT_BEHAVIOR_STATE.IDLE,
            state: targetId ? SUPPORT_BEHAVIOR_STATE.LINK : SUPPORT_BEHAVIOR_STATE.IDLE
        });
        this.targetId = targetId;
        this.range = range;
        this.healingPerSecond = healingPerSecond;
    }
    advance(enemy, { enemies = [], dt = ENEMY_BEHAVIOR_CONFIG.ZERO } = {}) {
        validateBehaviorDt(dt);
        return SUPPORT_BEHAVIOR_STATE_DEFINITION[this.state].advance(this, enemy, { enemies, dt });
    }
    snapshot() {
        return Object.freeze({ kind: this.kind, state: this.state, targetId: this.targetId });
    }
    restore(snapshot = {}) {
        this.restoreState(snapshot.state, SUPPORT_BEHAVIOR_STATE.IDLE);
        this.targetId = snapshot.targetId ?? null;
    }
}
