import { EnergyOrbSpell } from "./definitions/EnergyOrbSpell.js";
import { MeteorSpell } from "./definitions/MeteorSpell.js";
import { MobilitySurgeSpell } from "./definitions/MobilitySurgeSpell.js";
import { PhysicsDashSpell } from "./definitions/PhysicsDashSpell.js";
import { SPELL_ID, SPELL_SPEC } from "./SpellDefinition.js";

export const SPELL_DEFINITION = Object.freeze({
    [SPELL_ID.ENERGY_ORB]: Object.freeze(new EnergyOrbSpell(SPELL_SPEC.ENERGY_ORB)),
    [SPELL_ID.MOBILITY_SURGE]: Object.freeze(new MobilitySurgeSpell(SPELL_SPEC.MOBILITY_SURGE)),
    [SPELL_ID.METEOR]: Object.freeze(new MeteorSpell(SPELL_SPEC.METEOR)),
    [SPELL_ID.PHYSICS_DASH]: Object.freeze(new PhysicsDashSpell(SPELL_SPEC.PHYSICS_DASH))
});

export function spellDefinition(id) {
    return SPELL_DEFINITION[id] ?? null;
}
