import { POINTER_SPELL_COMMAND } from "../../core/input/PointerSpellCommandBuffer.js";
import { STATUS_EFFECT_ID } from "../status-effects/StatusEffectDefinition.js";
import { SPELL_TARGET_POLICY_ID } from "./SpellTargetPolicy.js";

export const SPELL_SLOT_ID = Object.freeze({
    BASIC_ATTACK: POINTER_SPELL_COMMAND.RIGHT_LEFT_LEFT,
    UTILITY: POINTER_SPELL_COMMAND.RIGHT_LEFT_RIGHT,
    POWER_ATTACK: POINTER_SPELL_COMMAND.RIGHT_RIGHT_LEFT,
    MOVEMENT: POINTER_SPELL_COMMAND.RIGHT_RIGHT_RIGHT
});

export const SPELL_ID = Object.freeze({
    ENERGY_ORB: "energy-orb",
    MOBILITY_SURGE: "mobility-surge",
    METEOR: "meteor",
    PHYSICS_DASH: "physics-dash"
});

export const SPELL_EFFECT_ID = Object.freeze({
    METEOR_SPLASH: "meteor-splash"
});

export const SPELL_ROLE = Object.freeze({
    BASIC_ATTACK: "basic-attack",
    UTILITY: "utility",
    POWER_ATTACK: "power-attack",
    MOVEMENT: "movement"
});

export const SPELL_SPEC = Object.freeze({
    ENERGY_ORB: Object.freeze({
        id: SPELL_ID.ENERGY_ORB,
        slotId: SPELL_SLOT_ID.BASIC_ATTACK,
        role: SPELL_ROLE.BASIC_ATTACK,
        displayName: "에너지 공",
        cooldownSeconds: 1,
        targetPolicyId: SPELL_TARGET_POLICY_ID.EXCLUDE_SOURCE,
        projectile: Object.freeze({
            speed: 900,
            range: 240,
            radius: 8,
            damage: 50,
            knockbackDistance: 20,
            knockbackDurationSeconds: 0.15
        })
    }),
    MOBILITY_SURGE: Object.freeze({
        id: SPELL_ID.MOBILITY_SURGE,
        slotId: SPELL_SLOT_ID.UTILITY,
        role: SPELL_ROLE.UTILITY,
        displayName: "기동 증폭",
        cooldownSeconds: 15,
        durationRatio: 0.5,
        movementMultiplier: 1.5
    }),
    METEOR: Object.freeze({
        id: SPELL_ID.METEOR,
        slotId: SPELL_SLOT_ID.POWER_ATTACK,
        role: SPELL_ROLE.POWER_ATTACK,
        displayName: "메테오",
        cooldownSeconds: 5,
        targetPolicyId: SPELL_TARGET_POLICY_ID.EXCLUDE_SOURCE,
        projectile: Object.freeze({
            speed: 650,
            range: 900,
            radius: 14,
            damage: 150,
            explosionRadius: 140,
            splashDamage: 100,
            splashEffectId: SPELL_EFFECT_ID.METEOR_SPLASH,
            knockbackDistance: 100,
            knockbackDurationSeconds: 0.25
        })
    }),
    PHYSICS_DASH: Object.freeze({
        id: SPELL_ID.PHYSICS_DASH,
        slotId: SPELL_SLOT_ID.MOVEMENT,
        role: SPELL_ROLE.MOVEMENT,
        displayName: "물리 대시",
        cooldownSeconds: 1,
        impulse: 500
    })
});

export const SPELL_SLOT_ORDER = Object.freeze([
    SPELL_SLOT_ID.BASIC_ATTACK,
    SPELL_SLOT_ID.UTILITY,
    SPELL_SLOT_ID.POWER_ATTACK,
    SPELL_SLOT_ID.MOVEMENT
]);

export const SPELL_COMMAND_LABEL = Object.freeze({
    [SPELL_SLOT_ID.BASIC_ATTACK]: "RLL",
    [SPELL_SLOT_ID.UTILITY]: "RLR",
    [SPELL_SLOT_ID.POWER_ATTACK]: "RRL",
    [SPELL_SLOT_ID.MOVEMENT]: "RRR"
});

export const SPELL_STATUS_EFFECT = Object.freeze({
    [SPELL_ID.METEOR]: STATUS_EFFECT_ID.IGNITED,
    [SPELL_EFFECT_ID.METEOR_SPLASH]: STATUS_EFFECT_ID.IGNITED
});

export class CombatSpellDefinition {
    constructor(spec) {
        this.spec = spec;
    }

    get id() {
        return this.spec.id;
    }

    cast() {
        throw new Error(`${this.constructor.name} must implement cast()`);
    }
}
