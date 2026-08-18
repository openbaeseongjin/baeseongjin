const ACTION_CATEGORIES = new Set(["base-action", "signature", "universal-modifier"]);

function freezeCard(definition) {
    if (!ACTION_CATEGORIES.has(definition.category)) {
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
        id: "direction-dash",
        category: "base-action",
        displayName: "방향 돌진",
        cooldownSeconds: 5,
        tags: ["movement", "right-click"],
        effect: Object.freeze({
            distance: 150,
            durationSeconds: 0.25
        })
    }),
    freezeCard({
        id: "dash-strike",
        category: "base-action",
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
        id: "instant-guard",
        category: "base-action",
        displayName: "순간 방어",
        cooldownSeconds: 5,
        tags: ["defense", "right-click"],
        effect: Object.freeze({
            durationSeconds: 0.5
        })
    }),
    freezeCard({
        id: "push-away",
        category: "base-action",
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
        id: "straight-shot",
        category: "base-action",
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
        id: "slow-fall",
        category: "base-action",
        displayName: "느린 낙하",
        cooldownSeconds: 5,
        tags: ["movement", "utility", "right-click"],
        effect: Object.freeze({
            durationSeconds: 2,
            gravityScale: 0.25
        })
    }),
    freezeCard({
        id: "explosive-trail",
        category: "signature",
        displayName: "폭발 흔적",
        compatibleBaseActionIds: ["direction-dash"],
        tags: ["signature", "aoe"],
        effect: Object.freeze({
            width: 60,
            delaySeconds: 0.5,
            damage: 80
        })
    }),
    freezeCard({
        id: "collision-rebound",
        category: "signature",
        displayName: "충돌 반동",
        compatibleBaseActionIds: ["dash-strike"],
        tags: ["signature", "rebound"],
        effect: Object.freeze({
            preservesSpeed: true,
            distinctEnemyOnce: true,
            reflectsFromSolids: true
        })
    }),
    freezeCard({
        id: "damage-reflect",
        category: "signature",
        displayName: "피해 반사",
        compatibleBaseActionIds: ["instant-guard"],
        tags: ["signature", "defense"],
        effect: Object.freeze({
            blockedDamageOnly: true,
            firstBlockedHitOnly: true,
            causalLineForProjectile: true
        })
    }),
    freezeCard({
        id: "wall-impact",
        category: "signature",
        displayName: "벽 충돌",
        compatibleBaseActionIds: ["push-away"],
        tags: ["signature", "control"],
        effect: Object.freeze({
            damage: 80,
            distinctTargetOnce: true
        })
    }),
    freezeCard({
        id: "piercing-shot",
        category: "signature",
        displayName: "관통 사격",
        compatibleBaseActionIds: ["straight-shot"],
        tags: ["signature", "projectile"],
        effect: Object.freeze({
            distinctEnemyOnce: true,
            preservesDamage: true,
            preservesSpeed: true
        })
    }),
    freezeCard({
        id: "end-wave",
        category: "signature",
        displayName: "종료 파동",
        compatibleBaseActionIds: ["slow-fall"],
        tags: ["signature", "aoe"],
        effect: Object.freeze({
            radius: 120,
            damage: 80
        })
    }),
    freezeCard({
        id: "fast-reuse",
        category: "universal-modifier",
        displayName: "빠른 재사용",
        tags: ["universal", "cooldown"],
        effect: Object.freeze({
            cooldownMultiplier: 0.6
        })
    }),
    freezeCard({
        id: "extra-charge",
        category: "universal-modifier",
        displayName: "추가 충전",
        tags: ["universal", "charge"],
        effect: Object.freeze({
            additionalCharges: 1
        })
    }),
    freezeCard({
        id: "rope-link",
        category: "universal-modifier",
        displayName: "로프 연동",
        tags: ["universal", "rope"],
        effect: Object.freeze({
            cooldownMultiplier: 0.5,
            windowSeconds: 1
        })
    }),
    freezeCard({
        id: "post-action-shield",
        category: "universal-modifier",
        displayName: "사용 후 보호막",
        tags: ["universal", "defense"],
        effect: Object.freeze({
            shieldRatio: 0.15,
            durationSeconds: 2
        })
    })
]);

const ACTION_AUGMENT_BY_ID = new Map(ACTION_AUGMENT_CATALOG.map((card) => [card.id, card]));

export const ACTION_AUGMENT_IDS = Object.freeze(ACTION_AUGMENT_CATALOG.map(({ id }) => id));
export const BASE_ACTION_IDS = Object.freeze(
    ACTION_AUGMENT_CATALOG.filter(({ category }) => category === "base-action").map(({ id }) => id)
);
export const SIGNATURE_ACTION_IDS = Object.freeze(
    ACTION_AUGMENT_CATALOG.filter(({ category }) => category === "signature").map(({ id }) => id)
);
export const UNIVERSAL_MODIFIER_IDS = Object.freeze(
    ACTION_AUGMENT_CATALOG.filter(({ category }) => category === "universal-modifier").map(({ id }) => id)
);

export function actionAugmentById(id) {
    return ACTION_AUGMENT_BY_ID.get(id) ?? null;
}
