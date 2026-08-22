import { ACTION_EVENT_TYPE, ACTION_SIGNATURE_ID, ACTION_SOURCE_KIND } from "../ActionAugmentDefinition.js";
import { ActionSignatureDefinition } from "./ActionSignatureDefinition.js";

export class DamageReflectSignature extends ActionSignatureDefinition {
    constructor(effect) {
        super(ACTION_SIGNATURE_ID.DAMAGE_REFLECT);
        this.effect = effect;
    }

    decorateActivation(activation) {
        return { ...activation, reflectEffect: Object.freeze({ ...this.effect }) };
    }

    reflectedDamageEvent({ amount, sourceKind, attackerId }) {
        return Object.freeze([
            Object.freeze({
                eventType: ACTION_EVENT_TYPE.DAMAGE_REFLECTED,
                attackerId,
                reflectedDamage: amount,
                sourceKind,
                causalLineRequired: sourceKind === ACTION_SOURCE_KIND.PROJECTILE
            })
        ]);
    }
}
