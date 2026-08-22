import { ENEMY_ATTACK_STATE, ENEMY_WEAPON_CONFIG } from "../EnemyWeaponDefinition.js";
import { EnemyWeaponAttackState, enemyWeaponStepResult } from "./EnemyWeaponAttackState.js";

export class LockEnemyWeaponState extends EnemyWeaponAttackState {
    advance(weapon, { enemy, target, config, projectiles, registry, remainingDt }) {
        const nextRemainingDt = remainingDt - weapon.consume(remainingDt);
        if (weapon.remainingSeconds > ENEMY_WEAPON_CONFIG.ZERO || !weapon.aimDirection) {
            return enemyWeaponStepResult(nextRemainingDt, { continueState: false });
        }
        const spawnedProjectile = weapon.spawnProjectile({ enemy, target, config, projectiles, registry });
        weapon.setFireCooldown(config.enemyFireInterval);
        weapon.transition(ENEMY_ATTACK_STATE.FIRE, config.enemyFireFlashSeconds);
        return enemyWeaponStepResult(nextRemainingDt, {
            spawnedProjectile,
            continueState: nextRemainingDt > ENEMY_WEAPON_CONFIG.ZERO
        });
    }
}
