import { ImpactTarget } from "./ImpactTarget.js";

export class ImpactTargetRegistry {
    constructor(targets = []) {
        this.targetsById = new Map();
        for (const target of targets) this.register(target);
    }

    register(target) {
        if (!(target instanceof ImpactTarget)) throw new Error("ImpactTargetRegistry only accepts ImpactTarget");
        if (this.targetsById.has(target.id)) throw new Error(`duplicate ImpactTarget id: ${target.id}`);
        this.targetsById.set(target.id, target);
        return target;
    }

    unregister(targetId) {
        return this.targetsById.delete(targetId);
    }

    find(targetId) {
        return this.targetsById.get(targetId) ?? null;
    }

    activeSnapshots() {
        return Object.freeze(
            [...this.targetsById.values()].filter((target) => target.active).map((target) => target.snapshot())
        );
    }

    resolve(targetId, impact) {
        const target = this.find(targetId);
        if (!target) return Object.freeze({ accepted: false, reason: "target-missing", damage: 0 });
        return target.resolve(impact);
    }
}
