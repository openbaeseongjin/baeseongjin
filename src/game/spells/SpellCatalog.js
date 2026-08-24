import * as SpellClass from "./definitions/ConfiguredSpellDefinitions.js";
import { SPELL_ID, SPELL_SPEC } from "./SpellDefinition.js";

const SPELL_CLASS = Object.freeze({
    [SPELL_ID.ENERGY_ORB]: SpellClass.EnergyOrbSpell,
    [SPELL_ID.LONG_RANGE_ORB]: SpellClass.LongRangeOrbSpell,
    [SPELL_ID.OVERCHARGED_ORB]: SpellClass.OverchargedOrbSpell,
    [SPELL_ID.IGNITION_ORB]: SpellClass.IgnitionOrbSpell,
    [SPELL_ID.ARCANE_SLASH]: SpellClass.ArcaneSlashSpell,
    [SPELL_ID.MOBILITY_SURGE]: SpellClass.MobilitySurgeSpell,
    [SPELL_ID.LOW_GRAVITY]: SpellClass.LowGravitySpell,
    [SPELL_ID.COOLDOWN_RESET]: SpellClass.CooldownResetSpell,
    [SPELL_ID.FREEZE_BOLT]: SpellClass.FreezeBoltSpell,
    [SPELL_ID.GATHERING_ORB]: SpellClass.GatheringOrbSpell,
    [SPELL_ID.METEOR]: SpellClass.MeteorSpell,
    [SPELL_ID.FROST_BURST]: SpellClass.FrostBurstSpell,
    [SPELL_ID.SHATTER_BOMB]: SpellClass.ShatterBombSpell,
    [SPELL_ID.THERMAL_LASER]: SpellClass.ThermalLaserSpell,
    [SPELL_ID.ELECTRIC_ORB]: SpellClass.ElectricOrbSpell,
    [SPELL_ID.PHYSICS_DASH]: SpellClass.PhysicsDashSpell,
    [SPELL_ID.CHAIN_DASH]: SpellClass.ChainDashSpell,
    [SPELL_ID.THRUSTER_FLIGHT]: SpellClass.ThrusterFlightSpell
});

export const SPELL_DEFINITION = Object.freeze(
    Object.fromEntries(
        Object.values(SPELL_SPEC).map((definition) => {
            const DefinitionClass = SPELL_CLASS[definition.id];
            return [definition.id, Object.freeze(new DefinitionClass(definition))];
        })
    )
);

export function spellDefinition(id) {
    return SPELL_DEFINITION[id] ?? null;
}
