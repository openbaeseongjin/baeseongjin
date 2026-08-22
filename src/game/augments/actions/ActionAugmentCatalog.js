import {
    ACTION_AUGMENT_CATEGORY,
    ACTION_MODIFIER_ID,
    ACTION_SIGNATURE_ID,
    BASE_ACTION_ID
} from "./ActionAugmentDefinition.js";

const ACTION_CATEGORIES = Object.freeze({
    [ACTION_AUGMENT_CATEGORY.BASE_ACTION]: true,
    [ACTION_AUGMENT_CATEGORY.SIGNATURE]: true,
    [ACTION_AUGMENT_CATEGORY.UNIVERSAL_MODIFIER]: true
});

function freezeCard(definition) {
    if (!ACTION_CATEGORIES[definition.category]) {
        throw new Error(`unsupported action augment category: ${definition.category}`);
    }
    return Object.freeze({
        ...definition,
        tags: Object.freeze([...(definition.tags ?? [])]),
        compatibleBaseActionIds: Object.freeze([...(definition.compatibleBaseActionIds ?? [])])
    });
}

export const ACTION_AUGMENT_CATALOG = Object.freeze([
    freezeCard({
        id: BASE_ACTION_ID.DEFAULT_PUNCH,
        category: ACTION_AUGMENT_CATEGORY.BASE_ACTION,
        displayName: "주먹",
        cooldownSeconds: 0.5,
        tags: ["built-in", "attack", "right-click"],
        effect: Object.freeze({
            range: 55,
            damageMultiplier: 0.4,
            knockbackDistance: 50,
            knockbackSeconds: 0.25
        })
    }),
    freezeCard({
        id: BASE_ACTION_ID.DIRECTION_DASH,
        category: ACTION_AUGMENT_CATEGORY.BASE_ACTION,
        displayName: "점멸",
        cooldownSeconds: 5,
        tags: ["movement", "right-click"],
        effect: Object.freeze({
            distance: 150
        })
    }),
    freezeCard({
        id: BASE_ACTION_ID.DASH_STRIKE,
        category: ACTION_AUGMENT_CATEGORY.BASE_ACTION,
        displayName: "돌진 타격",
        cooldownSeconds: 5,
        tags: ["movement", "attack", "right-click"],
        effect: Object.freeze({
            impulse: 500,
            hitWindowSeconds: 0.5,
            damage: 100,
            knockbackDistance: 75
        })
    }),
    freezeCard({
        id: BASE_ACTION_ID.INSTANT_GUARD,
        category: ACTION_AUGMENT_CATEGORY.BASE_ACTION,
        displayName: "순간 방어",
        cooldownSeconds: 5,
        tags: ["defense", "right-click"],
        effect: Object.freeze({
            durationSeconds: 0.5
        })
    }),
    freezeCard({
        id: BASE_ACTION_ID.PUSH_AWAY,
        category: ACTION_AUGMENT_CATEGORY.BASE_ACTION,
        displayName: "밀쳐내기",
        cooldownSeconds: 5,
        tags: ["attack", "control", "right-click"],
        effect: Object.freeze({
            radius: 140,
            damage: 20,
            knockbackDistance: 175,
            bossKnockback: false
        })
    }),
    freezeCard({
        id: BASE_ACTION_ID.STRAIGHT_SHOT,
        category: ACTION_AUGMENT_CATEGORY.BASE_ACTION,
        displayName: "직선 사격",
        cooldownSeconds: 2.5,
        tags: ["attack", "projectile", "right-click"],
        effect: Object.freeze({
            speed: 2000,
            range: 3000,
            lifetimeSeconds: 1.5,
            damage: 80,
            knockbackDistance: 0
        })
    }),
    freezeCard({
        id: BASE_ACTION_ID.SLOW_FALL,
        category: ACTION_AUGMENT_CATEGORY.BASE_ACTION,
        displayName: "느린 낙하",
        cooldownSeconds: 5,
        tags: ["movement", "utility", "right-click"],
        effect: Object.freeze({
            durationSeconds: 2,
            gravityScale: 0.25
        })
    }),
    freezeCard({
        id: ACTION_SIGNATURE_ID.EXPLOSIVE_TRAIL,
        category: ACTION_AUGMENT_CATEGORY.SIGNATURE,
        displayName: "폭발 흔적",
        compatibleBaseActionIds: [BASE_ACTION_ID.DIRECTION_DASH],
        tags: ["signature", "aoe"],
        effect: Object.freeze({
            width: 60,
            delaySeconds: 0.5,
            damage: 80
        })
    }),
    freezeCard({
        id: ACTION_SIGNATURE_ID.COLLISION_REBOUND,
        category: ACTION_AUGMENT_CATEGORY.SIGNATURE,
        displayName: "충돌 반동",
        compatibleBaseActionIds: [BASE_ACTION_ID.DASH_STRIKE],
        tags: ["signature", "rebound"],
        effect: Object.freeze({
            preservesSpeed: true,
            distinctEnemyOnce: true,
            reflectsFromSolids: true
        })
    }),
    freezeCard({
        id: ACTION_SIGNATURE_ID.DAMAGE_REFLECT,
        category: ACTION_AUGMENT_CATEGORY.SIGNATURE,
        displayName: "피해 반사",
        compatibleBaseActionIds: [BASE_ACTION_ID.INSTANT_GUARD],
        tags: ["signature", "defense"],
        effect: Object.freeze({
            blockedDamageOnly: true,
            firstBlockedHitOnly: true,
            causalLineForProjectile: true
        })
    }),
    freezeCard({
        id: ACTION_SIGNATURE_ID.WALL_IMPACT,
        category: ACTION_AUGMENT_CATEGORY.SIGNATURE,
        displayName: "벽 충돌",
        compatibleBaseActionIds: [BASE_ACTION_ID.PUSH_AWAY],
        tags: ["signature", "control"],
        effect: Object.freeze({
            damage: 80,
            distinctTargetOnce: true
        })
    }),
    freezeCard({
        id: ACTION_SIGNATURE_ID.PIERCING_SHOT,
        category: ACTION_AUGMENT_CATEGORY.SIGNATURE,
        displayName: "관통 사격",
        compatibleBaseActionIds: [BASE_ACTION_ID.STRAIGHT_SHOT],
        tags: ["signature", "projectile"],
        effect: Object.freeze({
            distinctEnemyOnce: true,
            preservesDamage: true,
            preservesSpeed: true
        })
    }),
    freezeCard({
        id: ACTION_SIGNATURE_ID.END_WAVE,
        category: ACTION_AUGMENT_CATEGORY.SIGNATURE,
        displayName: "종료 파동",
        compatibleBaseActionIds: [BASE_ACTION_ID.SLOW_FALL],
        tags: ["signature", "aoe"],
        effect: Object.freeze({
            radius: 120,
            damage: 80
        })
    }),
    freezeCard({
        id: ACTION_MODIFIER_ID.FAST_REUSE,
        category: ACTION_AUGMENT_CATEGORY.UNIVERSAL_MODIFIER,
        displayName: "빠른 재사용",
        tags: ["universal", "cooldown"],
        effect: Object.freeze({
            cooldownMultiplier: 0.6
        })
    }),
    freezeCard({
        id: ACTION_MODIFIER_ID.EXTRA_CHARGE,
        category: ACTION_AUGMENT_CATEGORY.UNIVERSAL_MODIFIER,
        displayName: "추가 충전",
        tags: ["universal", "charge"],
        effect: Object.freeze({
            additionalCharges: 1
        })
    }),
    freezeCard({
        id: ACTION_MODIFIER_ID.ROPE_LINK,
        category: ACTION_AUGMENT_CATEGORY.UNIVERSAL_MODIFIER,
        displayName: "로프 연동",
        tags: ["universal", "rope"],
        effect: Object.freeze({
            cooldownMultiplier: 0.5,
            windowSeconds: 1
        })
    }),
    freezeCard({
        id: ACTION_MODIFIER_ID.POST_ACTION_SHIELD,
        category: ACTION_AUGMENT_CATEGORY.UNIVERSAL_MODIFIER,
        displayName: "사용 후 보호막",
        tags: ["universal", "defense"],
        effect: Object.freeze({
            shieldRatio: 0.15,
            durationSeconds: 2
        })
    })
]);

const ACTION_AUGMENT_BY_ID = Object.freeze(Object.fromEntries(ACTION_AUGMENT_CATALOG.map((card) => [card.id, card])));

export const ACTION_AUGMENT_IDS = Object.freeze(ACTION_AUGMENT_CATALOG.map(({ id }) => id));
export const BASE_ACTION_IDS = Object.freeze(
    ACTION_AUGMENT_CATALOG.filter(({ category }) => category === ACTION_AUGMENT_CATEGORY.BASE_ACTION).map(
        ({ id }) => id
    )
);
export const SIGNATURE_ACTION_IDS = Object.freeze(
    ACTION_AUGMENT_CATALOG.filter(({ category }) => category === ACTION_AUGMENT_CATEGORY.SIGNATURE).map(({ id }) => id)
);
export const UNIVERSAL_MODIFIER_IDS = Object.freeze(
    ACTION_AUGMENT_CATALOG.filter(({ category }) => category === ACTION_AUGMENT_CATEGORY.UNIVERSAL_MODIFIER).map(
        ({ id }) => id
    )
);

export function actionAugmentById(id) {
    return ACTION_AUGMENT_BY_ID[id] ?? null;
}
