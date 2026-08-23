import { ENEMY_ATTACK_STATE } from "../EnemyWeaponDefinition.js";
import { EnemyWeaponAttackState, enemyWeaponStepResult } from "./EnemyWeaponAttackState.js";

export class IdleEnemyWeaponState extends EnemyWeaponAttackState {
    get canAcquireTarget() {
        return true;
    }

    get canAdvancePatrol() {
        return true;
    }

    advance(weapon, { config, remainingDt }) {
        weapon.transition(ENEMY_ATTACK_STATE.ACQUIRE, config.enemyAcquireSeconds);
        return enemyWeaponStepResult(remainingDt, { continueState: true });
    }
}
