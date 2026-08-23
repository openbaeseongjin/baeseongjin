import { ImpactTarget } from "../../combat/ImpactTarget.js";
import { BaseGameObjectManager } from "./BaseGameObjectManager.js";

export class ImpactTargetManager extends BaseGameObjectManager {
    constructor(targets = []) {
        super("impact-target", targets);
    }

    validateObject(target) {
        if (!(target instanceof ImpactTarget)) throw new Error("ImpactTargetManager only accepts ImpactTarget");
    }

    activeSnapshots() {
        const snapshots = [];
        for (const target of this.all) {
            const snapshot = target.activeSnapshot();
            if (snapshot) snapshots.push(snapshot);
        }
        return Object.freeze(snapshots);
    }

    resolve(targetId, impact) {
        const target = this.find(targetId);
        if (!target) return Object.freeze({ accepted: false, reason: "target-missing", damage: 0 });
        return target.resolve(impact);
    }
}
