import { ENEMY_ATTACK_STATE, ENEMY_WEAPON_CONFIG } from "../EnemyWeaponDefinition.js";
import { EnemyWeaponAttackState, enemyWeaponStepResult } from "./EnemyWeaponAttackState.js";

export class FireEnemyWeaponState extends EnemyWeaponAttackState {
    advance(weapon, { remainingDt }) {
        const nextRemainingDt = remainingDt - weapon.consume(remainingDt);
        if (weapon.remainingSeconds > ENEMY_WEAPON_CONFIG.ZERO) {
            return enemyWeaponStepResult(nextRemainingDt, { continueState: false });
        }
        weapon.transition(ENEMY_ATTACK_STATE.COOLDOWN, weapon.fireCooldown);
        weapon.clearAim();
        return enemyWeaponStepResult(nextRemainingDt, { continueState: true });
    }
}
