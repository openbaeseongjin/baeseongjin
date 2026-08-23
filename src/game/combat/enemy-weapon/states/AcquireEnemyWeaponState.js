import { ENEMY_ATTACK_STATE, ENEMY_WEAPON_CONFIG } from "../EnemyWeaponDefinition.js";
import { EnemyWeaponAttackState, enemyWeaponStepResult } from "./EnemyWeaponAttackState.js";

export class AcquireEnemyWeaponState extends EnemyWeaponAttackState {
    get canAdvancePatrol() {
        return true;
    }

    advance(weapon, { enemy, target, config, remainingDt }) {
        const nextRemainingDt = remainingDt - weapon.consume(remainingDt);
        if (weapon.remainingSeconds > ENEMY_WEAPON_CONFIG.ZERO) {
            return enemyWeaponStepResult(nextRemainingDt, { continueState: false });
        }
        weapon.transition(ENEMY_ATTACK_STATE.TRACK, config.enemyTrackSeconds);
        return enemyWeaponStepResult(nextRemainingDt, {
            continueState: weapon.aimAt(enemy, target)
        });
    }
}
