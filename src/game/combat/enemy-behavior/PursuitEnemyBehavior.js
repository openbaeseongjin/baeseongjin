import { Vector2 } from "../../../game-kit/index.js";
import { TimedEnemyBehavior } from "./EnemyBehaviorBase.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND, PURSUIT_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";
import { frozenDirection, validateBehaviorDt } from "./EnemyBehaviorSupport.js";
import { PURSUIT_BEHAVIOR_STATE_DEFINITION } from "./states/PursuitEnemyBehaviorStates.js";

export class PursuitEnemyBehavior extends TimedEnemyBehavior {
    constructor({
        state = PURSUIT_BEHAVIOR_STATE.SEEK,
        remainingSeconds = 0,
        targetId = null,
        dashDirection = null,
        moveSpeed = 160,
        dashSpeed = 640,
        triggerDistance = 96,
        acquireRange = 960,
        windupSeconds = 0.25,
        dashSeconds = 0.2,
        recoverySeconds = 0.5
    } = {}) {
        super({
            kind: ENEMY_BEHAVIOR_KIND.PURSUIT,
            initialState: PURSUIT_BEHAVIOR_STATE.SEEK,
            state,
            remainingSeconds
        });
        this.targetId = targetId;
        this.dashDirection = dashDirection ? new Vector2(dashDirection.x, dashDirection.y).normalize() : new Vector2();
        this.moveSpeed = moveSpeed;
        this.dashSpeed = dashSpeed;
        this.triggerDistance = triggerDistance;
        this.acquireRange = acquireRange;
        this.windupSeconds = windupSeconds;
        this.dashSeconds = dashSeconds;
        this.recoverySeconds = recoverySeconds;
    }

    advance(enemy, { targets = [], dt = ENEMY_BEHAVIOR_CONFIG.ZERO } = {}) {
        validateBehaviorDt(dt);
        let remainingDt = dt;
        let outcome = null;
        for (let transitions = 0; transitions < ENEMY_BEHAVIOR_CONFIG.MAXIMUM_TRANSITIONS_PER_STEP; transitions += 1) {
            const result = PURSUIT_BEHAVIOR_STATE_DEFINITION[this.state].advance(this, enemy, {
                targets,
                dt,
                remainingDt
            });
            remainingDt = result.remainingDt;
            outcome = result.outcome ?? outcome;
            if (!result.continueState) break;
        }
        return outcome;
    }

    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: this.state,
            remainingSeconds: this.remainingSeconds,
            targetId: this.targetId,
            dashDirection: frozenDirection(this.dashDirection)
        });
    }

    restore(snapshot = {}) {
        this.restoreState(snapshot.state, snapshot.remainingSeconds ?? 0, PURSUIT_BEHAVIOR_STATE.SEEK);
        this.targetId = snapshot.targetId ?? null;
        this.dashDirection.set(snapshot.dashDirection?.x ?? 0, snapshot.dashDirection?.y ?? 0).normalize();
    }
}
