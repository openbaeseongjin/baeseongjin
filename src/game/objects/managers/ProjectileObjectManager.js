import { BaseGameObjectManager } from "./BaseGameObjectManager.js";

export class ProjectileObjectManager extends BaseGameObjectManager {
    constructor(kind) {
        super(kind);
    }

    commitLifecycle(result) {
        if (!Array.isArray(result?.survivors)) throw new Error(`${this.kind} lifecycle requires survivors`);
        this.replace(result.survivors);
        return result;
    }

    findByPredictionId(predictionId) {
        return this.all.find((projectile) => projectile.predictionId === predictionId) ?? null;
    }

    removeOwnedBy(ownerId) {
        return this.removeWhere((projectile) => projectile.ownerId === ownerId);
    }
}
