import { STATUS_EFFECT_ID } from "../../status-effects/StatusEffectDefinition.js";
import { CombatSpellDefinition } from "../SpellDefinition.js";

export class MeteorSpell extends CombatSpellDefinition {
    cast(context) {
        context.spawnProjectile({
            spellId: this.id,
            targetPolicyId: this.spec.targetPolicyId,
            ...this.spec.projectile,
            direction: context.direction,
            position: context.player.physics.position,
            statusEffectId: STATUS_EFFECT_ID.IGNITED
        });
        return true;
    }
}
