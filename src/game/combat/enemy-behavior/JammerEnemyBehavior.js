import { StateEnemyBehavior } from "./EnemyBehaviorBase.js";
import { COMBAT_CONFIG } from "../../config.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND, JAMMER_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";
import { EnemyRoamingMotion } from "./EnemyRoamingMotion.js";
import { validateBehaviorDt } from "./EnemyBehaviorSupport.js";
import { JAMMER_BEHAVIOR_STATE_DEFINITION } from "./states/JammerEnemyBehaviorStates.js";

export class JammerEnemyBehavior extends StateEnemyBehavior {
    constructor({
        state = JAMMER_BEHAVIOR_STATE.ROAM,
        acquireRange = COMBAT_CONFIG.enemyAttackRange,
        moveSpeed = 70,
        roamRadius = 110,
        preferredRange = 360,
        mobility = null
    } = {}) {
        super({
            kind: ENEMY_BEHAVIOR_KIND.JAMMER,
            initialState: JAMMER_BEHAVIOR_STATE.ROAM,
            state
        });
        this.acquireRange = acquireRange;
        this.mobility = new EnemyRoamingMotion({
            speed: moveSpeed,
            roamRadius,
            preferredRange,
            ...(mobility ?? {})
        });
    }

    advance(enemy, { targets = [], dt = ENEMY_BEHAVIOR_CONFIG.ZERO } = {}) {
        validateBehaviorDt(dt);
        return JAMMER_BEHAVIOR_STATE_DEFINITION[this.state].advance(this, enemy, { targets, dt });
    }

    snapshot() {
        return Object.freeze({ kind: this.kind, state: this.state, mobility: this.mobility.snapshot() });
    }

    restore(snapshot = {}) {
        this.restoreState(snapshot.state, JAMMER_BEHAVIOR_STATE.ROAM);
        this.mobility.restore(snapshot.mobility);
    }
}
