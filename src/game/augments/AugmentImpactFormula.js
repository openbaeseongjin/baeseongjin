import { ropeImpactDamageForSpeed } from "../combat/RopeImpactAttack.js";
import { AUGMENT_IMPACT_CONFIG, ROPE_IMPACT_CONFIG } from "../config.js";
import { SPELL_EFFECT_ID, SPELL_ID, SPELL_SPEC } from "../spells/SpellDefinition.js";

const IMPACT_FORMULA = Object.freeze({
    "rope-impact": Object.freeze({
        cardId: null,
        damage: null,
        ropeImpactDamageMultiplier: 1,
        range: 80,
        knockback: null
    }),
    "electrified-rope": Object.freeze({
        cardId: "electrified-rope",
        damage: AUGMENT_IMPACT_CONFIG.electrifiedDamagePerSecond * AUGMENT_IMPACT_CONFIG.electrifiedPulseSeconds,
        ropeImpactDamageMultiplier: null,
        range: 500,
        knockback: null
    }),
    "collision-explosion-direct": Object.freeze({
        cardId: "collision-explosion",
        damage: null,
        ropeImpactDamageMultiplier: 1,
        range: 80,
        knockback: Object.freeze({ distance: 100, duration: 0.25 })
    }),
    "collision-explosion-splash": Object.freeze({
        cardId: "collision-explosion",
        damage: null,
        ropeImpactDamageMultiplier: 0.5,
        range: 120,
        knockback: Object.freeze({ distance: 100, duration: 0.25 })
    }),
    [SPELL_ID.ENERGY_ORB]: Object.freeze({
        cardId: null,
        damage: SPELL_SPEC.ENERGY_ORB.projectile.damage,
        ropeImpactDamageMultiplier: null,
        range: SPELL_SPEC.ENERGY_ORB.projectile.range,
        knockback: Object.freeze({
            distance: SPELL_SPEC.ENERGY_ORB.projectile.knockbackDistance,
            duration: SPELL_SPEC.ENERGY_ORB.projectile.knockbackDurationSeconds
        })
    }),
    [SPELL_ID.METEOR]: Object.freeze({
        cardId: SPELL_ID.METEOR,
        damage: SPELL_SPEC.METEOR.projectile.damage,
        ropeImpactDamageMultiplier: null,
        range: SPELL_SPEC.METEOR.projectile.range,
        knockback: Object.freeze({
            distance: SPELL_SPEC.METEOR.projectile.knockbackDistance,
            duration: SPELL_SPEC.METEOR.projectile.knockbackDurationSeconds
        })
    }),
    [SPELL_EFFECT_ID.METEOR_SPLASH]: Object.freeze({
        cardId: SPELL_ID.METEOR,
        damage: SPELL_SPEC.METEOR.projectile.splashDamage,
        ropeImpactDamageMultiplier: null,
        range: SPELL_SPEC.METEOR.projectile.explosionRadius,
        knockback: Object.freeze({
            distance: SPELL_SPEC.METEOR.projectile.knockbackDistance,
            duration: SPELL_SPEC.METEOR.projectile.knockbackDurationSeconds
        })
    })
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
    const formula = augmentImpactFormula(claim.effectId);
    if (!formula || !playerHasAugment(player, formula.cardId)) return Object.freeze({ valid: false });
    if (formula.ropeImpactDamageMultiplier !== null) {
        if (!Number.isFinite(claim.impactSpeed) || claim.impactSpeed < ROPE_IMPACT_CONFIG.minimumSpeed) {
            return Object.freeze({ valid: false });
        }
        const expectedDamage =
            ropeImpactDamageForSpeed(claim.impactSpeed, ROPE_IMPACT_CONFIG) * formula.ropeImpactDamageMultiplier;
        if (!nearlyEqual(claim.damage, expectedDamage)) return Object.freeze({ valid: false });
    } else if (!nearlyEqual(claim.damage, formula.damage)) {
        return Object.freeze({ valid: false });
    }
    const sourceDistance = Math.hypot(
        claim.sourcePosition.x - claim.contactPosition.x,
        claim.sourcePosition.y - claim.contactPosition.y
    );
    if (sourceDistance > formula.range + (target?.radius ?? target?.collider?.radius ?? 0) + positionTolerance) {
        return Object.freeze({ valid: false });
    }
    if (formula.knockback === null) {
        if (claim.knockback !== undefined) return Object.freeze({ valid: false });
    } else if (
        !claim.knockback ||
        !nearlyEqual(claim.knockback.distance, formula.knockback.distance) ||
        !nearlyEqual(claim.knockback.duration, formula.knockback.duration) ||
        Math.hypot(claim.knockback.direction.x, claim.knockback.direction.y) <= 1e-6
    ) {
        return Object.freeze({ valid: false });
    }
    return Object.freeze({ valid: true, formula });
}
