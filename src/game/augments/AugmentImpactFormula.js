import { ropeImpactDamageForSpeed } from "../combat/RopeImpactAttack.js";
import { AUGMENT_IMPACT_CONFIG, ROPE_IMPACT_CONFIG } from "../config.js";
import { actionAugmentById } from "./actions/ActionAugmentCatalog.js";
import { ACTION_SIGNATURE_ID, BASE_ACTION_ID } from "./actions/ActionAugmentDefinition.js";

const IMPACT = AUGMENT_IMPACT_CONFIG.baseDamage;
const DEFAULT_PUNCH = actionAugmentById(BASE_ACTION_ID.DEFAULT_PUNCH).effect;

function formula({
    cardId = null,
    damageMultiplier,
    range,
    knockback = null,
    dynamicDamage = false,
    ropeImpactDamageMultiplier = null
}) {
    return Object.freeze({
        cardId,
        damage: dynamicDamage || ropeImpactDamageMultiplier !== null ? null : IMPACT * damageMultiplier,
        dynamicDamage,
        ropeImpactDamageMultiplier,
        range,
        knockback: knockback ? Object.freeze({ ...knockback }) : null
    });
}

const FORMULAS = Object.freeze({
    "rope-impact": formula({ damageMultiplier: 0, ropeImpactDamageMultiplier: 1, range: 80 }),
    [BASE_ACTION_ID.DEFAULT_PUNCH]: formula({
        damageMultiplier: DEFAULT_PUNCH.damageMultiplier,
        range: DEFAULT_PUNCH.range,
        knockback: { distance: DEFAULT_PUNCH.knockbackDistance, duration: DEFAULT_PUNCH.knockbackSeconds }
    }),
    "electrified-rope": Object.freeze({
        cardId: "electrified-rope",
        damage: AUGMENT_IMPACT_CONFIG.electrifiedDamagePerSecond * AUGMENT_IMPACT_CONFIG.electrifiedPulseSeconds,
        dynamicDamage: false,
        ropeImpactDamageMultiplier: null,
        range: 500,
        knockback: null
    }),
    "collision-explosion-direct": formula({
        cardId: "collision-explosion",
        damageMultiplier: 0,
        ropeImpactDamageMultiplier: 1,
        range: 80,
        knockback: { distance: 100, duration: 0.25 }
    }),
    "collision-explosion-splash": formula({
        cardId: "collision-explosion",
        damageMultiplier: 0,
        ropeImpactDamageMultiplier: 0.5,
        range: 120,
        knockback: { distance: 100, duration: 0.25 }
    }),
    [ACTION_SIGNATURE_ID.EXPLOSIVE_TRAIL]: formula({
        cardId: ACTION_SIGNATURE_ID.EXPLOSIVE_TRAIL,
        damageMultiplier: 0.8,
        range: 80
    }),
    [BASE_ACTION_ID.DASH_STRIKE]: formula({
        cardId: BASE_ACTION_ID.DASH_STRIKE,
        damageMultiplier: 1,
        range: 100,
        knockback: { distance: 75, duration: 0.25 }
    }),
    [ACTION_SIGNATURE_ID.DAMAGE_REFLECT]: formula({
        cardId: ACTION_SIGNATURE_ID.DAMAGE_REFLECT,
        dynamicDamage: true,
        damageMultiplier: 0,
        range: 3000
    }),
    [BASE_ACTION_ID.PUSH_AWAY]: formula({
        cardId: BASE_ACTION_ID.PUSH_AWAY,
        damageMultiplier: 0.2,
        range: 140,
        knockback: { distance: 175, duration: 0.25 }
    }),
    [ACTION_SIGNATURE_ID.WALL_IMPACT]: formula({
        cardId: ACTION_SIGNATURE_ID.WALL_IMPACT,
        damageMultiplier: 0.8,
        range: 3000
    }),
    [BASE_ACTION_ID.STRAIGHT_SHOT]: formula({
        cardId: BASE_ACTION_ID.STRAIGHT_SHOT,
        damageMultiplier: 0.8,
        range: 3000
    }),
    [ACTION_SIGNATURE_ID.END_WAVE]: formula({
        cardId: ACTION_SIGNATURE_ID.END_WAVE,
        damageMultiplier: 0.8,
        range: 120
    })
});

function nearlyEqual(left, right, tolerance = 1e-6) {
    return Math.abs(left - right) <= tolerance;
}

export function augmentImpactFormula(effectId) {
    return FORMULAS[effectId] ?? null;
}

export function playerHasAugment(player, cardId) {
    if (!cardId) return true;
    if (typeof player?.foundation?.has === "function") return player.foundation.has(cardId);
    if (Array.isArray(player?.foundation?.selectedIds)) return player.foundation.selectedIds.includes(cardId);
    return false;
}

export function validateAugmentImpactFormula(player, claim, target = null, { positionTolerance = 40 } = {}) {
    const resolved = augmentImpactFormula(claim.effectId);
    if (!resolved || !playerHasAugment(player, resolved.cardId)) return Object.freeze({ valid: false });
    if (claim.effectId === BASE_ACTION_ID.DEFAULT_PUNCH && player.foundation?.baseActionId) {
        return Object.freeze({ valid: false });
    }
    if (resolved.ropeImpactDamageMultiplier !== null) {
        if (!Number.isFinite(claim.impactSpeed) || claim.impactSpeed < ROPE_IMPACT_CONFIG.minimumSpeed) {
            return Object.freeze({ valid: false });
        }
        const expectedDamage =
            ropeImpactDamageForSpeed(claim.impactSpeed, ROPE_IMPACT_CONFIG) * resolved.ropeImpactDamageMultiplier;
        if (!nearlyEqual(claim.damage, expectedDamage)) return Object.freeze({ valid: false });
    } else if (resolved.dynamicDamage) {
        if (claim.damage <= 0 || claim.damage > player.maxHealth) return Object.freeze({ valid: false });
    } else if (!nearlyEqual(claim.damage, resolved.damage)) {
        return Object.freeze({ valid: false });
    }
    const sourceDistance = Math.hypot(
        claim.sourcePosition.x - claim.contactPosition.x,
        claim.sourcePosition.y - claim.contactPosition.y
    );
    if (sourceDistance > resolved.range + (target?.radius ?? 0) + positionTolerance) {
        return Object.freeze({ valid: false });
    }
    if (resolved.knockback === null) {
        if (claim.knockback !== undefined) return Object.freeze({ valid: false });
    } else {
        if (
            !claim.knockback ||
            !nearlyEqual(claim.knockback.distance, resolved.knockback.distance) ||
            !nearlyEqual(claim.knockback.duration, resolved.knockback.duration) ||
            Math.hypot(claim.knockback.direction.x, claim.knockback.direction.y) <= 1e-6
        ) {
            return Object.freeze({ valid: false });
        }
    }
    return Object.freeze({ valid: true, formula: resolved });
}
