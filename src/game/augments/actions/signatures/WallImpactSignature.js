import { ACTION_REJECTION_REASON, ACTION_SIGNATURE_ID } from "../ActionAugmentDefinition.js";
import { ActionSignatureDefinition } from "./ActionSignatureDefinition.js";

export class WallImpactSignature extends ActionSignatureDefinition {
    constructor(effect) {
        super(ACTION_SIGNATURE_ID.WALL_IMPACT);
        this.effect = effect;
    }

    decorateActivation(activation) {
        return { ...activation, wallImpactEffect: Object.freeze({ ...this.effect }) };
    }

    createResolutionTracker() {
        const targetIds = new Set();
        return Object.freeze({
            observeWallImpact: ({ targetId }) => {
                if (!targetId) throw new Error("wall impact requires a targetId");
                if (targetIds.has(targetId)) {
                    return Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.DUPLICATE_TARGET });
                }
                targetIds.add(targetId);
                return Object.freeze({ accepted: true, damage: this.effect.damage });
            }
        });
    }
}
