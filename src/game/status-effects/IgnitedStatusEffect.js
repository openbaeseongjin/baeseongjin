import { PeriodicDamageStatusEffect } from "./CombatStatusEffect.js";
import { STATUS_EFFECT_SPEC } from "./StatusEffectDefinition.js";

export class IgnitedStatusEffect extends PeriodicDamageStatusEffect {
    constructor(spec = STATUS_EFFECT_SPEC.IGNITED) {
        super(spec);
    }

    draw(renderState) {
        return this.drawParticles(renderState);
    }
}
