import { CombatStatusEffect } from "./CombatStatusEffect.js";
import { STATUS_EFFECT_SPEC } from "./StatusEffectDefinition.js";

export class FrozenStatusEffect extends CombatStatusEffect {
    constructor(spec = STATUS_EFFECT_SPEC.FROZEN) {
        super(spec);
    }

    canAct() {
        return !this.active;
    }

    draw(renderState) {
        return this.drawParticles(renderState);
    }
}
