import { Vector2 } from "../../../game-kit/index.js";
import { TimedEnemyBehavior } from "./EnemyBehaviorBase.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND, SWARM_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";
import { frozenDirection, validateBehaviorDt } from "./EnemyBehaviorSupport.js";
import { SWARM_BEHAVIOR_STATE_DEFINITION } from "./states/SwarmEnemyBehaviorStates.js";

export class SwarmEnemyBehavior extends TimedEnemyBehavior {
    constructor({
        state = SWARM_BEHAVIOR_STATE.CHASE,
        remainingSeconds = 0,
        recoilDirection = null,
        chaseSpeed = 210,
        recoilSpeed = 360,
        recoverySeconds = 0.45,
        acquireRange = 900,
        neighborRadius = 80,
        separationDistance = 40,
        separationWeight = 7.5,
        alignmentWeight = 2,
        cohesionWeight = 2,
        targetWeight = 1.5,
        maneuverWeight = 5,
        maximumTurnRadiansPerSecond = 20,
        contactDamage = 14
    } = {}) {
        const normalizedState = state === SWARM_BEHAVIOR_STATE.RECOIL ? state : SWARM_BEHAVIOR_STATE.CHASE;
        super({
            kind: ENEMY_BEHAVIOR_KIND.SWARM,
            initialState: SWARM_BEHAVIOR_STATE.CHASE,
            state: normalizedState,
            remainingSeconds
        });
        this.recoilDirection = recoilDirection
            ? new Vector2(recoilDirection.x, recoilDirection.y).normalize()
            : new Vector2();
        this.chaseSpeed = chaseSpeed;
        this.recoilSpeed = recoilSpeed;
        this.recoverySeconds = recoverySeconds;
        this.acquireRange = acquireRange;
        this.neighborRadius = neighborRadius;
        this.separationDistance = separationDistance;
        this.separationWeight = separationWeight;
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight;
        this.targetWeight = targetWeight;
        this.maneuverWeight = maneuverWeight;
        this.maximumTurnRadiansPerSecond = maximumTurnRadiansPerSecond;
        this.contactDamage = contactDamage;
    }
    advance(enemy, { targets = [], swarmFlocks = null, dt = ENEMY_BEHAVIOR_CONFIG.ZERO } = {}) {
        validateBehaviorDt(dt);
        return SWARM_BEHAVIOR_STATE_DEFINITION[this.state].advance(this, enemy, {
            targets,
            swarmFlocks,
            dt
        });
    }
    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: this.state,
            remainingSeconds: this.remainingSeconds,
            recoilDirection: frozenDirection(this.recoilDirection)
        });
    }
    restore(snapshot = {}) {
        const state = snapshot.state === SWARM_BEHAVIOR_STATE.RECOIL ? snapshot.state : SWARM_BEHAVIOR_STATE.CHASE;
        this.restoreState(state, snapshot.remainingSeconds ?? 0, SWARM_BEHAVIOR_STATE.CHASE);
        const direction = snapshot.recoilDirection ?? snapshot.diveDirection;
        this.recoilDirection.set(direction?.x ?? 0, direction?.y ?? 0).normalize();
    }
}
