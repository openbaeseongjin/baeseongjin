import { ENEMY_ATTACK_STATE, ENEMY_WEAPON_CONFIG } from "../EnemyWeaponDefinition.js";
import { EnemyWeaponAttackState, enemyWeaponStepResult } from "./EnemyWeaponAttackState.js";

export class CooldownEnemyWeaponState extends EnemyWeaponAttackState {
    advance(weapon, { enemy, target, config, remainingDt }) {
        const nextRemainingDt = remainingDt - weapon.consume(remainingDt);
        weapon.setFireCooldown(weapon.remainingSeconds);
        if (weapon.remainingSeconds > ENEMY_WEAPON_CONFIG.ZERO) {
            return enemyWeaponStepResult(nextRemainingDt, { continueState: false });
        }
        weapon.setFireCooldown(ENEMY_WEAPON_CONFIG.ZERO);
        weapon.transition(ENEMY_ATTACK_STATE.TRACK, config.enemyTrackSeconds);
        return enemyWeaponStepResult(nextRemainingDt, {
            continueState: weapon.aimAt(enemy, target)
        });
    }
}
