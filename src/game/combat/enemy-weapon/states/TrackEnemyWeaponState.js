import { ENEMY_ATTACK_STATE, ENEMY_WEAPON_CONFIG } from "../EnemyWeaponDefinition.js";
import { EnemyWeaponAttackState, enemyWeaponStepResult } from "./EnemyWeaponAttackState.js";

export class TrackEnemyWeaponState extends EnemyWeaponAttackState {
    advance(weapon, { enemy, target, config, remainingDt }) {
        if (!weapon.aimAt(enemy, target)) {
            return enemyWeaponStepResult(remainingDt, { continueState: false });
        }
        const nextRemainingDt = remainingDt - weapon.consume(remainingDt);
        if (weapon.remainingSeconds > ENEMY_WEAPON_CONFIG.ZERO) {
            return enemyWeaponStepResult(nextRemainingDt, { continueState: false });
        }
        weapon.transition(ENEMY_ATTACK_STATE.LOCK, config.enemyLockSeconds);
        return enemyWeaponStepResult(nextRemainingDt, { continueState: true });
    }
}
