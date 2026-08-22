import { Vector2 } from "../../../game-kit/index.js";
import { TimedEnemyBehavior } from "./EnemyBehaviorBase.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND, SWARM_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";
import { frozenDirection, validateBehaviorDt } from "./EnemyBehaviorSupport.js";
import { SWARM_BEHAVIOR_STATE_DEFINITION } from "./states/SwarmEnemyBehaviorStates.js";

export class SwarmEnemyBehavior extends TimedEnemyBehavior {
    constructor({
        state = SWARM_BEHAVIOR_STATE.ORBIT,
        remainingSeconds = 0,
        diveDirection = null,
        diveSpeed = 520,
        diveSeconds = 0.24,
        recoverySeconds = 0.65,
        acquireRange = 560
    } = {}) {
        super({ kind: ENEMY_BEHAVIOR_KIND.SWARM, initialState: SWARM_BEHAVIOR_STATE.ORBIT, state, remainingSeconds });
        this.diveDirection = diveDirection ? new Vector2(diveDirection.x, diveDirection.y).normalize() : new Vector2();
        this.diveSpeed = diveSpeed;
        this.diveSeconds = diveSeconds;
        this.recoverySeconds = recoverySeconds;
        this.acquireRange = acquireRange;
    }
    advance(enemy, { enemies = [], targets = [], dt = ENEMY_BEHAVIOR_CONFIG.ZERO } = {}) {
        validateBehaviorDt(dt);
        return SWARM_BEHAVIOR_STATE_DEFINITION[this.state].advance(this, enemy, { enemies, targets, dt });
    }
    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: this.state,
            remainingSeconds: this.remainingSeconds,
            diveDirection: frozenDirection(this.diveDirection)
        });
    }
    restore(snapshot = {}) {
        this.restoreState(snapshot.state, snapshot.remainingSeconds ?? 0, SWARM_BEHAVIOR_STATE.ORBIT);
        this.diveDirection.set(snapshot.diveDirection?.x ?? 0, snapshot.diveDirection?.y ?? 0).normalize();
    }
}
