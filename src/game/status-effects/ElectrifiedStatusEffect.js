import { PeriodicDamageStatusEffect } from "./CombatStatusEffect.js";
import { STATUS_EFFECT_ID, STATUS_EFFECT_SPEC } from "./StatusEffectDefinition.js";

export const ELECTRIFIED_STATUS_ID = STATUS_EFFECT_ID.ELECTRIFIED;
export const ELECTRIFIED_STATUS_CONFIG = STATUS_EFFECT_SPEC.ELECTRIFIED;

export class ElectrifiedStatusEffect extends PeriodicDamageStatusEffect {
    constructor(spec = STATUS_EFFECT_SPEC.ELECTRIFIED) {
        super(spec);
    }

    draw(renderState) {
        return this.drawParticles(renderState);
    }
}
