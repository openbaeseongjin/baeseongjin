import { StateEnemyBehavior } from "./EnemyBehaviorBase.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND, SUPPORT_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";
import { EnemyRoamingMotion } from "./EnemyRoamingMotion.js";
import { validateBehaviorDt } from "./EnemyBehaviorSupport.js";
import { SUPPORT_BEHAVIOR_STATE_DEFINITION } from "./states/SupportEnemyBehaviorStates.js";

export class SupportEnemyBehavior extends StateEnemyBehavior {
    constructor({
        targetId = null,
        recognitionRange = 720,
        linkRange = 320,
        healingPerSecond = 18,
        healthSpentPerHealing = 1 / 3,
        regenerationPerSecond = 2,
        retargetHealthRatioGap = 0.18,
        approachSpeed = 130,
        retreatRange = 240,
        retreatSpeed = 150,
        roamSpeed = 95,
        roamRadius = 100,
        preferredRange = 300,
        mobility = null
    } = {}) {
        super({
            kind: ENEMY_BEHAVIOR_KIND.SUPPORT,
            initialState: SUPPORT_BEHAVIOR_STATE.IDLE,
            state: targetId ? SUPPORT_BEHAVIOR_STATE.LINK : SUPPORT_BEHAVIOR_STATE.IDLE
        });
        this.targetId = targetId;
        this.recognitionRange = recognitionRange;
        this.linkRange = linkRange;
        this.healingPerSecond = healingPerSecond;
        this.healthSpentPerHealing = healthSpentPerHealing;
        this.regenerationPerSecond = regenerationPerSecond;
        this.retargetHealthRatioGap = retargetHealthRatioGap;
        this.approachSpeed = approachSpeed;
        this.retreatRange = retreatRange;
        this.retreatSpeed = retreatSpeed;
        this.mobility = new EnemyRoamingMotion({
            speed: roamSpeed,
            roamRadius,
            preferredRange,
            ...(mobility ?? {})
        });
    }
    advance(enemy, { enemies = [], targets = [], dt = ENEMY_BEHAVIOR_CONFIG.ZERO } = {}) {
        validateBehaviorDt(dt);
        enemy.heal(this.regenerationPerSecond * dt);
        return SUPPORT_BEHAVIOR_STATE_DEFINITION[this.state].advance(this, enemy, { enemies, targets, dt });
    }
    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: this.state,
            targetId: this.targetId,
            mobility: this.mobility.snapshot()
        });
    }
    restore(snapshot = {}) {
        this.restoreState(snapshot.state, SUPPORT_BEHAVIOR_STATE.IDLE);
        this.targetId = snapshot.targetId ?? null;
        this.mobility.restore(snapshot.mobility);
    }
}
