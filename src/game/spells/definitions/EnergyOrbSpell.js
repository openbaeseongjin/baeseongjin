import { CombatSpellDefinition } from "../SpellDefinition.js";

export class EnergyOrbSpell extends CombatSpellDefinition {
    cast(context) {
        context.spawnProjectile({
            spellId: this.id,
            targetPolicyId: this.spec.targetPolicyId,
            ...this.spec.projectile,
            direction: context.direction,
            position: context.player.physics.position,
            explosionRadius: 0,
            splashDamage: 0,
            statusEffectId: null
        });
        return true;
    }
}
