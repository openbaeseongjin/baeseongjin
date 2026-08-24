import { CombatSpellDefinition } from "../SpellDefinition.js";

export class PhysicsDashSpell extends CombatSpellDefinition {
    cast(context) {
        context.player.physics.applyImpulse(context.direction, this.spec.impulse);
        context.preserveMovementImpulse();
        return true;
    }
}
