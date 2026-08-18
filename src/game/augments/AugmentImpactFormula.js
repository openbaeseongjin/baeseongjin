import { ROPE_IMPACT_CONFIG } from "../config.js";

const IMPACT = ROPE_IMPACT_CONFIG.damage;

function formula({ cardId = null, damageMultiplier, range, knockback = null, dynamicDamage = false }) {
    return Object.freeze({
        cardId,
        damage: dynamicDamage ? null : IMPACT * damageMultiplier,
        dynamicDamage,
        range,
        knockback: knockback ? Object.freeze({ ...knockback }) : null
    });
}

const FORMULAS = new Map([
    ["rope-impact", formula({ damageMultiplier: 1, range: 80 })],
    ["default-punch", formula({ damageMultiplier: 0.4, range: 55, knockback: { distance: 50, duration: 0.25 } })],
    ["electrified-rope", formula({ cardId: "electrified-rope", damageMultiplier: 0.08, range: 500 })],
    [
        "collision-explosion-direct",
        formula({
            cardId: "collision-explosion",
            damageMultiplier: 1,
            range: 80,
            knockback: { distance: 100, duration: 0.25 }
        })
    ],
    [
        "collision-explosion-splash",
        formula({
            cardId: "collision-explosion",
            damageMultiplier: 0.5,
            range: 120,
            knockback: { distance: 100, duration: 0.25 }
        })
    ],
    ["explosive-trail", formula({ cardId: "explosive-trail", damageMultiplier: 0.8, range: 80 })],
    [
        "dash-strike",
        formula({ cardId: "dash-strike", damageMultiplier: 1, range: 100, knockback: { distance: 75, duration: 0.25 } })
    ],
    ["damage-reflect", formula({ cardId: "damage-reflect", dynamicDamage: true, damageMultiplier: 0, range: 3000 })],
    [
        "push-away",
        formula({
            cardId: "push-away",
            damageMultiplier: 0.2,
            range: 140,
            knockback: { distance: 175, duration: 0.25 }
        })
    ],
    ["wall-impact", formula({ cardId: "wall-impact", damageMultiplier: 0.8, range: 3000 })],
    ["straight-shot", formula({ cardId: "straight-shot", damageMultiplier: 0.8, range: 3000 })],
    ["end-wave", formula({ cardId: "end-wave", damageMultiplier: 0.8, range: 120 })]
]);

function nearlyEqual(left, right, tolerance = 1e-6) {
    return Math.abs(left - right) <= tolerance;
}

export function augmentImpactFormula(effectId) {
    return FORMULAS.get(effectId) ?? null;
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
    if (claim.effectId === "default-punch" && player.foundation?.baseActionId) {
        return Object.freeze({ valid: false });
    }
    if (resolved.dynamicDamage) {
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
