export class EnemyWeaponAttackState {
    get canAcquireTarget() {
        return false;
    }

    get canAdvancePatrol() {
        return false;
    }

    advance() {
        throw new Error(`${this.constructor.name} must implement advance()`);
    }
}

export function enemyWeaponStepResult(remainingDt, { spawnedProjectile = null, continueState }) {
    return Object.freeze({ remainingDt, spawnedProjectile, continueState });
}
