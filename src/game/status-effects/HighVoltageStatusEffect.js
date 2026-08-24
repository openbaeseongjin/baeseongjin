import { PeriodicDamageStatusEffect } from "./CombatStatusEffect.js";
import { STATUS_EFFECT_SPEC } from "./StatusEffectDefinition.js";

export class HighVoltageStatusEffect extends PeriodicDamageStatusEffect {
    constructor(spec = STATUS_EFFECT_SPEC.HIGH_VOLTAGE) {
        super(spec);
    }
    draw(renderState) {
        return this.drawParticles(renderState);
    }
}
