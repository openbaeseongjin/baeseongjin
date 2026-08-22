import { ACTION_REJECTION_REASON, ACTION_SIGNATURE_ID } from "../ActionAugmentDefinition.js";
import { ActionSignatureDefinition } from "./ActionSignatureDefinition.js";

export class PiercingShotSignature extends ActionSignatureDefinition {
    constructor(effect) {
        super(ACTION_SIGNATURE_ID.PIERCING_SHOT);
        this.effect = effect;
    }

    decorateActivation(activation) {
        return { ...activation, pierceEffect: Object.freeze({ ...this.effect }) };
    }

    createResolutionTracker() {
        const targetIds = new Set();
        return Object.freeze({
            observeProjectileHit: ({ targetId }) => {
                if (!targetId) throw new Error("pierce hit requires a targetId");
                if (targetIds.has(targetId)) {
                    return Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.DUPLICATE_TARGET });
                }
                targetIds.add(targetId);
                return Object.freeze({
                    accepted: true,
                    preservesDamage: this.effect.preservesDamage,
                    preservesSpeed: this.effect.preservesSpeed
                });
            }
        });
    }
}
