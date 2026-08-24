import { CombatSpellDefinition } from "../SpellDefinition.js";

export class MobilitySurgeSpell extends CombatSpellDefinition {
    cast(context) {
        context.activateMobilityBuff({
            durationSeconds: this.spec.cooldownSeconds * this.spec.durationRatio,
            multiplier: this.spec.movementMultiplier
        });
        return true;
    }
}
