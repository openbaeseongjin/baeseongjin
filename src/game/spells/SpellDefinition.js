import { SPELL_SLOT_COMMAND } from "../../core/input/SpellSlotCommandInput.js";
import { STATUS_EFFECT_ID } from "../status-effects/StatusEffectDefinition.js";
import { SPELL_TARGET_POLICY_ID } from "./SpellTargetPolicy.js";

export const SPELL_SLOT_ID = Object.freeze({
    BASIC_ATTACK: SPELL_SLOT_COMMAND.BASIC_ATTACK,
    UTILITY: SPELL_SLOT_COMMAND.UTILITY,
    POWER_ATTACK: SPELL_SLOT_COMMAND.POWER_ATTACK,
    MOVEMENT: SPELL_SLOT_COMMAND.MOVEMENT
});

export const SPELL_ID = Object.freeze({
    ENERGY_ORB: "energy-orb",
    LONG_RANGE_ORB: "long-range-orb",
    OVERCHARGED_ORB: "overcharged-orb",
    IGNITION_ORB: "ignition-orb",
    ARCANE_SLASH: "arcane-slash",
    MOBILITY_SURGE: "mobility-surge",
    LOW_GRAVITY: "low-gravity",
    COOLDOWN_RESET: "cooldown-reset",
    FREEZE_BOLT: "freeze-bolt",
    GATHERING_ORB: "gathering-orb",
    METEOR: "meteor",
    FROST_BURST: "frost-burst",
    SHATTER_BOMB: "shatter-bomb",
    THERMAL_LASER: "thermal-laser",
    ELECTRIC_ORB: "electric-orb",
    PHYSICS_DASH: "physics-dash",
    CHAIN_DASH: "chain-dash",
    THRUSTER_FLIGHT: "thruster-flight"
});

export const SPELL_EFFECT_ID = Object.freeze({
    METEOR_SPLASH: "meteor-splash",
    SHATTER_SPLASH: "shatter-splash",
    GATHERING_SPLASH: "gathering-splash",
    ELECTRIC_ORB_AURA: "electric-orb-aura"
});

export const SPELL_ROLE = Object.freeze({
    BASIC_ATTACK: "basic-attack",
    UTILITY: "utility",
    POWER_ATTACK: "power-attack",
    MOVEMENT: "movement"
});

const EXCLUDE_SOURCE = SPELL_TARGET_POLICY_ID.EXCLUDE_SOURCE;
const projectile = (values) => Object.freeze(values);
const area = (values) => Object.freeze({ durationSeconds: 0.1, ...values });
const spec = (values) => Object.freeze(values);

export const SPELL_SPEC = Object.freeze({
    ENERGY_ORB: spec({
        id: SPELL_ID.ENERGY_ORB,
        slotId: SPELL_SLOT_ID.BASIC_ATTACK,
        role: SPELL_ROLE.BASIC_ATTACK,
        displayName: "에너지 공",
        cooldownSeconds: 1,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({ speed: 900, range: 250, radius: 8, damage: 20, knockbackImpulse: 0 })
    }),
    LONG_RANGE_ORB: spec({
        id: SPELL_ID.LONG_RANGE_ORB,
        slotId: SPELL_SLOT_ID.BASIC_ATTACK,
        role: SPELL_ROLE.BASIC_ATTACK,
        displayName: "장거리 마력탄",
        cooldownSeconds: 1,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({ speed: 1350, range: 500, radius: 8, damage: 20, knockbackImpulse: 0 })
    }),
    OVERCHARGED_ORB: spec({
        id: SPELL_ID.OVERCHARGED_ORB,
        slotId: SPELL_SLOT_ID.BASIC_ATTACK,
        role: SPELL_ROLE.BASIC_ATTACK,
        displayName: "과충전 마력탄",
        cooldownSeconds: 1,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({ speed: 900, range: 250, radius: 8, damage: 30, knockbackImpulse: 0 })
    }),
    IGNITION_ORB: spec({
        id: SPELL_ID.IGNITION_ORB,
        slotId: SPELL_SLOT_ID.BASIC_ATTACK,
        role: SPELL_ROLE.BASIC_ATTACK,
        displayName: "점화탄",
        cooldownSeconds: 1,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({
            speed: 900,
            range: 250,
            radius: 8,
            damage: 5,
            knockbackImpulse: 0,
            statusEffectId: STATUS_EFFECT_ID.IGNITED
        })
    }),
    ARCANE_SLASH: spec({
        id: SPELL_ID.ARCANE_SLASH,
        slotId: SPELL_SLOT_ID.BASIC_ATTACK,
        role: SPELL_ROLE.BASIC_ATTACK,
        displayName: "마력 검격",
        cooldownSeconds: 1,
        targetPolicyId: EXCLUDE_SOURCE,
        area: area({ shape: "cone", range: 360, halfAngleDegrees: 60, damage: 35 })
    }),
    MOBILITY_SURGE: spec({
        id: SPELL_ID.MOBILITY_SURGE,
        slotId: SPELL_SLOT_ID.UTILITY,
        role: SPELL_ROLE.UTILITY,
        displayName: "기동 증폭",
        cooldownSeconds: 15,
        effect: Object.freeze({ kind: "mobility", durationSeconds: 7.5, multiplier: 1.5 })
    }),
    LOW_GRAVITY: spec({
        id: SPELL_ID.LOW_GRAVITY,
        slotId: SPELL_SLOT_ID.UTILITY,
        role: SPELL_ROLE.UTILITY,
        displayName: "저중력",
        cooldownSeconds: 10,
        effect: Object.freeze({ kind: "low-gravity", durationSeconds: 5, gravityScale: 0.5 })
    }),
    COOLDOWN_RESET: spec({
        id: SPELL_ID.COOLDOWN_RESET,
        slotId: SPELL_SLOT_ID.UTILITY,
        role: SPELL_ROLE.UTILITY,
        displayName: "증강 대기시간 초기화",
        cooldownSeconds: 20,
        effect: Object.freeze({ kind: "cooldown-reset" })
    }),
    FREEZE_BOLT: spec({
        id: SPELL_ID.FREEZE_BOLT,
        slotId: SPELL_SLOT_ID.UTILITY,
        role: SPELL_ROLE.UTILITY,
        displayName: "빙결탄",
        cooldownSeconds: 7.5,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({
            speed: 900,
            range: 500,
            radius: 8,
            damage: 5,
            knockbackImpulse: 0,
            statusEffectId: STATUS_EFFECT_ID.FROZEN
        })
    }),
    GATHERING_ORB: spec({
        id: SPELL_ID.GATHERING_ORB,
        slotId: SPELL_SLOT_ID.UTILITY,
        role: SPELL_ROLE.UTILITY,
        displayName: "집속 구체",
        cooldownSeconds: 10,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({
            speed: 900,
            range: 500,
            radius: 8,
            damage: 5,
            explosionRadius: 280,
            splashDamage: 5,
            splashEffectId: SPELL_EFFECT_ID.GATHERING_SPLASH,
            knockbackImpulse: 600,
            knockbackMode: "inward"
        })
    }),
    METEOR: spec({
        id: SPELL_ID.METEOR,
        slotId: SPELL_SLOT_ID.POWER_ATTACK,
        role: SPELL_ROLE.POWER_ATTACK,
        displayName: "메테오",
        cooldownSeconds: 5,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({
            speed: 650,
            range: 900,
            radius: 20,
            damage: 50,
            explosionRadius: 350,
            splashDamage: 40,
            splashEffectId: SPELL_EFFECT_ID.METEOR_SPLASH,
            knockbackImpulse: 400,
            statusEffectId: STATUS_EFFECT_ID.IGNITED
        })
    }),
    FROST_BURST: spec({
        id: SPELL_ID.FROST_BURST,
        slotId: SPELL_SLOT_ID.POWER_ATTACK,
        role: SPELL_ROLE.POWER_ATTACK,
        displayName: "빙결 폭발",
        cooldownSeconds: 7.5,
        targetPolicyId: EXCLUDE_SOURCE,
        area: area({ shape: "circle", radius: 280, damage: 40, statusEffectId: STATUS_EFFECT_ID.FROZEN })
    }),
    SHATTER_BOMB: spec({
        id: SPELL_ID.SHATTER_BOMB,
        slotId: SPELL_SLOT_ID.POWER_ATTACK,
        role: SPELL_ROLE.POWER_ATTACK,
        displayName: "파쇄 폭탄",
        cooldownSeconds: 7.5,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({
            speed: 650,
            range: 900,
            radius: 20,
            damage: 80,
            explosionRadius: 210,
            splashDamage: 80,
            splashEffectId: SPELL_EFFECT_ID.SHATTER_SPLASH,
            knockbackImpulse: 600
        })
    }),
    THERMAL_LASER: spec({
        id: SPELL_ID.THERMAL_LASER,
        slotId: SPELL_SLOT_ID.POWER_ATTACK,
        role: SPELL_ROLE.POWER_ATTACK,
        displayName: "열선 레이저",
        cooldownSeconds: 5,
        targetPolicyId: EXCLUDE_SOURCE,
        area: area({ shape: "line", range: 1350, radius: 70, damage: 20, statusEffectId: STATUS_EFFECT_ID.IGNITED })
    }),
    ELECTRIC_ORB: spec({
        id: SPELL_ID.ELECTRIC_ORB,
        slotId: SPELL_SLOT_ID.POWER_ATTACK,
        role: SPELL_ROLE.POWER_ATTACK,
        displayName: "전기 구체",
        cooldownSeconds: 7.5,
        targetPolicyId: EXCLUDE_SOURCE,
        projectile: projectile({
            speed: 325,
            range: 675,
            radius: 20,
            damage: 0,
            targetsBodyCollision: false,
            piercing: true,
            auraRadius: 175,
            auraDamage: 0,
            auraEffectId: SPELL_EFFECT_ID.ELECTRIC_ORB_AURA,
            auraStatusEffectId: STATUS_EFFECT_ID.HIGH_VOLTAGE
        })
    }),
    PHYSICS_DASH: spec({
        id: SPELL_ID.PHYSICS_DASH,
        slotId: SPELL_SLOT_ID.MOVEMENT,
        role: SPELL_ROLE.MOVEMENT,
        displayName: "물리 대시",
        cooldownSeconds: 1,
        dash: Object.freeze({ speed: 500 })
    }),
    CHAIN_DASH: spec({
        id: SPELL_ID.CHAIN_DASH,
        slotId: SPELL_SLOT_ID.MOVEMENT,
        role: SPELL_ROLE.MOVEMENT,
        displayName: "연속 대시",
        cooldownSeconds: 2,
        maxCharges: 2,
        dash: Object.freeze({ speed: 500 })
    }),
    THRUSTER_FLIGHT: spec({
        id: SPELL_ID.THRUSTER_FLIGHT,
        slotId: SPELL_SLOT_ID.MOVEMENT,
        role: SPELL_ROLE.MOVEMENT,
        displayName: "추진 비행",
        cooldownSeconds: 5,
        effect: Object.freeze({
            kind: "thruster-flight",
            durationSeconds: 1.5,
            accelerationPerSecond: 1000,
            maximumDirectionalSpeed: 750
        })
    })
});

export const SPELL_SLOT_ORDER = Object.freeze(Object.values(SPELL_SLOT_ID));
export const SPELL_SLOT_LABEL = Object.freeze({
    [SPELL_SLOT_ID.BASIC_ATTACK]: "기본",
    [SPELL_SLOT_ID.UTILITY]: "유틸",
    [SPELL_SLOT_ID.POWER_ATTACK]: "강공",
    [SPELL_SLOT_ID.MOVEMENT]: "이동"
});
export const SPELL_STATUS_EFFECT = Object.freeze({
    [SPELL_ID.IGNITION_ORB]: STATUS_EFFECT_ID.IGNITED,
    [SPELL_ID.FREEZE_BOLT]: STATUS_EFFECT_ID.FROZEN,
    [SPELL_ID.METEOR]: STATUS_EFFECT_ID.IGNITED,
    [SPELL_EFFECT_ID.METEOR_SPLASH]: STATUS_EFFECT_ID.IGNITED,
    [SPELL_ID.FROST_BURST]: STATUS_EFFECT_ID.FROZEN,
    [SPELL_ID.THERMAL_LASER]: STATUS_EFFECT_ID.IGNITED,
    [SPELL_EFFECT_ID.ELECTRIC_ORB_AURA]: STATUS_EFFECT_ID.HIGH_VOLTAGE
});

export class CombatSpellDefinition {
    constructor(definition) {
        this.spec = definition;
    }
    get id() {
        return this.spec.id;
    }
    cast() {
        throw new Error(`${this.constructor.name} must implement cast()`);
    }
}
