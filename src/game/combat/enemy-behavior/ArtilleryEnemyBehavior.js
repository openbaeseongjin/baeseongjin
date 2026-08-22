import { TimedEnemyBehavior } from "./EnemyBehaviorBase.js";
import { ARTILLERY_BEHAVIOR_STATE, ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND } from "./EnemyBehaviorDefinition.js";
import { validateBehaviorDt } from "./EnemyBehaviorSupport.js";
import { ARTILLERY_BEHAVIOR_STATE_DEFINITION } from "./states/ArtilleryEnemyBehaviorStates.js";

export class ArtilleryEnemyBehavior extends TimedEnemyBehavior {
    constructor({
        state = ARTILLERY_BEHAVIOR_STATE.IDLE,
        remainingSeconds = 0,
        targetPosition = null,
        targetId = null,
        telegraphSeconds = 0.65,
        cooldownSeconds = 1.4,
        strikeRadius = 72,
        damage = 20,
        acquireRange = 1080
    } = {}) {
        super({
            kind: ENEMY_BEHAVIOR_KIND.ARTILLERY,
            initialState: ARTILLERY_BEHAVIOR_STATE.IDLE,
            state,
            remainingSeconds
        });
        this.targetPosition = targetPosition ? { x: targetPosition.x, y: targetPosition.y } : null;
        this.targetId = targetId;
        this.telegraphSeconds = telegraphSeconds;
        this.cooldownSeconds = cooldownSeconds;
        this.strikeRadius = strikeRadius;
        this.damage = damage;
        this.acquireRange = acquireRange;
    }
    advance(enemy, { targets = [], dt = ENEMY_BEHAVIOR_CONFIG.ZERO } = {}) {
        validateBehaviorDt(dt);
        return ARTILLERY_BEHAVIOR_STATE_DEFINITION[this.state].advance(this, enemy, { targets, dt });
    }
    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: this.state,
            remainingSeconds: this.remainingSeconds,
            targetId: this.targetId,
            targetPosition: this.targetPosition ? Object.freeze({ ...this.targetPosition }) : null,
            strikeRadius: this.strikeRadius
        });
    }
    restore(snapshot = {}) {
        this.restoreState(snapshot.state, snapshot.remainingSeconds ?? 0, ARTILLERY_BEHAVIOR_STATE.IDLE);
        this.targetId = snapshot.targetId ?? null;
        this.targetPosition = snapshot.targetPosition ? { ...snapshot.targetPosition } : null;
    }
}
