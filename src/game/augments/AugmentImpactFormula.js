import { ropeImpactDamageForSpeed } from "../combat/RopeImpactAttack.js";
import { AUGMENT_IMPACT_CONFIG, ROPE_IMPACT_CONFIG } from "../config.js";
import { SPELL_EFFECT_ID, SPELL_ID, SPELL_SPEC } from "../spells/SpellDefinition.js";
import { combatTargetBoundingRadius } from "../combat/CombatTargetGeometry.js";

const formula = ({ cardId, damage, range, knockbackImpulse = 0 }) =>
    Object.freeze({
        cardId,
        damage,
        ropeImpactDamageMultiplier: null,
        range,
        knockback: knockbackImpulse > 0 ? Object.freeze({ impulse: knockbackImpulse }) : null
    });
const spellFormula = (key, effectId = key.id) => [
    effectId,
    formula({
        cardId: key.id === SPELL_ID.ENERGY_ORB ? null : key.id,
        damage: key.projectile?.damage ?? key.area?.damage ?? 0,
        range: key.projectile?.range ?? key.area?.range ?? key.area?.radius ?? 0,
        knockbackImpulse: key.projectile?.knockbackImpulse ?? key.area?.knockbackImpulse ?? 0
    })
];

const SPELL_FORMULAS = Object.freeze(
    Object.fromEntries([
        spellFormula(SPELL_SPEC.ENERGY_ORB),
        spellFormula(SPELL_SPEC.LONG_RANGE_ORB),
        spellFormula(SPELL_SPEC.OVERCHARGED_ORB),
        spellFormula(SPELL_SPEC.IGNITION_ORB),
        spellFormula(SPELL_SPEC.ARCANE_SLASH),
        spellFormula(SPELL_SPEC.FREEZE_BOLT),
        spellFormula(SPELL_SPEC.METEOR),
        spellFormula(SPELL_SPEC.FROST_BURST),
        spellFormula(SPELL_SPEC.SHATTER_BOMB),
        spellFormula(SPELL_SPEC.THERMAL_LASER),
        [SPELL_ID.GATHERING_ORB, formula({ cardId: SPELL_ID.GATHERING_ORB, damage: 5, range: 500 })],
        [
            SPELL_EFFECT_ID.GATHERING_SPLASH,
            formula({ cardId: SPELL_ID.GATHERING_ORB, damage: 5, range: 280, knockbackImpulse: 600 })
        ],
        [
            SPELL_EFFECT_ID.METEOR_SPLASH,
            formula({ cardId: SPELL_ID.METEOR, damage: 40, range: 350, knockbackImpulse: 400 })
        ],
        [
            SPELL_EFFECT_ID.SHATTER_SPLASH,
            formula({ cardId: SPELL_ID.SHATTER_BOMB, damage: 80, range: 210, knockbackImpulse: 600 })
        ],
        [SPELL_EFFECT_ID.ELECTRIC_ORB_AURA, formula({ cardId: SPELL_ID.ELECTRIC_ORB, damage: 0, range: 175 })]
    ])
);

const IMPACT_FORMULA = Object.freeze({
    "rope-impact": Object.freeze({
        cardId: null,
        damage: null,
        ropeImpactDamageMultiplier: 1,
        range: 80,
        knockback: null
    }),
    "electrified-rope": formula({
        cardId: "electrified-rope",
        damage: AUGMENT_IMPACT_CONFIG.electrifiedDamagePerSecond * AUGMENT_IMPACT_CONFIG.electrifiedPulseSeconds,
        range: 500
    }),
    "collision-explosion-direct": Object.freeze({
        cardId: "collision-explosion",
        damage: null,
        ropeImpactDamageMultiplier: 1,
        range: 80,
        knockback: Object.freeze({ impulse: 400 })
    }),
    "collision-explosion-splash": Object.freeze({
        cardId: "collision-explosion",
        damage: null,
        ropeImpactDamageMultiplier: 0.5,
        range: 120,
        knockback: Object.freeze({ impulse: 400 })
    }),
    ...SPELL_FORMULAS
});

function nearlyEqual(left, right, tolerance = 1e-6) {
    return Math.abs(left - right) <= tolerance;
}
export function augmentImpactFormula(effectId) {
    return IMPACT_FORMULA[effectId] ?? null;
}
export function playerHasAugment(player, cardId) {
    return cardId ? player?.augmentLoadout?.has(cardId) === true : true;
}

export function validateAugmentImpactFormula(player, claim, target = null, { positionTolerance = 40 } = {}) {
    const definition = augmentImpactFormula(claim.effectId);
    if (!definition || !playerHasAugment(player, definition.cardId)) return Object.freeze({ valid: false });
    if (definition.ropeImpactDamageMultiplier !== null) {
        if (!Number.isFinite(claim.impactSpeed) || claim.impactSpeed < ROPE_IMPACT_CONFIG.minimumSpeed)
            return Object.freeze({ valid: false });
        if (
            !nearlyEqual(
                claim.damage,
                ropeImpactDamageForSpeed(claim.impactSpeed, ROPE_IMPACT_CONFIG) * definition.ropeImpactDamageMultiplier
            )
        )
            return Object.freeze({ valid: false });
    } else if (!nearlyEqual(claim.damage, definition.damage)) return Object.freeze({ valid: false });
    const sourceDistance = Math.hypot(
        claim.sourcePosition.x - claim.contactPosition.x,
        claim.sourcePosition.y - claim.contactPosition.y
    );
    const targetRadius = target ? combatTargetBoundingRadius(target) : 0;
    if (sourceDistance > definition.range + targetRadius + positionTolerance) return Object.freeze({ valid: false });
    if (definition.knockback === null) {
        if (claim.knockback !== undefined) return Object.freeze({ valid: false });
    } else if (
        !claim.knockback ||
        !nearlyEqual(claim.knockback.impulse, definition.knockback.impulse) ||
        Math.hypot(claim.knockback.direction.x, claim.knockback.direction.y) <= 1e-6
    )
        return Object.freeze({ valid: false });
    return Object.freeze({ valid: true, formula: definition });
}
