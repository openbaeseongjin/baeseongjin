export class DebugEnemyTrainingDummy {
    constructor() {
        this.enemyId = null;
        this.presentationControlled = false;
    }

    assign(enemy) {
        if (!enemy?.id) throw new Error("DebugEnemyTrainingDummy requires an enemy");
        this.enemyId = enemy.id;
        this.presentationControlled = false;
        return this.snapshot(enemy);
    }

    matches(enemy) {
        return Boolean(this.enemyId) && (typeof enemy === "string" ? enemy : enemy?.id) === this.enemyId;
    }

    ownsProjectile(projectile) {
        return this.matches(projectile?.ownerId);
    }

    canSimulate(enemy) {
        return !this.presentationControlled || !this.matches(enemy);
    }

    setPresentationControlled(controlled) {
        if (!this.enemyId) return false;
        this.presentationControlled = Boolean(controlled);
        return true;
    }

    clear() {
        const enemyId = this.enemyId;
        this.enemyId = null;
        this.presentationControlled = false;
        return enemyId;
    }

    snapshot(enemy) {
        if (!this.matches(enemy)) return null;
        return Object.freeze({
            ...enemy.renderSnapshot(),
            enemyId: enemy.id,
            presentationControlled: this.presentationControlled
        });
    }
}
