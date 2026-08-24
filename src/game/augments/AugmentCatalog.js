import { SPELL_ID, SPELL_ROLE, SPELL_SLOT_ID } from "../spells/SpellDefinition.js";

function createCard(definition) {
    return Object.freeze({ ...definition, tier: "AUGMENT_V2" });
}

export const AUGMENT_CATALOG = Object.freeze([
    createCard({
        id: "fast-launch",
        name: "빠른 발사",
        family: "공통 로프",
        tagline: "발사 속도 +50%",
        description: "로프 발사 속도를 50% 올립니다.",
        category: "rope"
    }),
    createCard({
        id: "long-rope",
        name: "긴 로프",
        family: "공통 로프",
        tagline: "사거리 +20%",
        description: "로프 최대 사거리를 20% 늘립니다.",
        category: "rope"
    }),
    createCard({
        id: "fast-recover",
        name: "빠른 회수",
        family: "공통 로프",
        tagline: "재발사 대기 -50%",
        description: "모든 로프 재발사 대기를 절반으로 줄입니다.",
        category: "rope"
    }),
    createCard({
        id: "release-propulsion",
        name: "해제 추진",
        family: "공통 로프",
        tagline: "해제 후 속도 ×1.25",
        description: "정상 해제 직후 전체 속도를 1.25배로 증폭합니다.",
        category: "rope"
    }),
    createCard({
        id: "electrified-rope",
        name: "감전 로프",
        family: "공통 로프",
        tagline: "접촉 중 지속 피해",
        description: "부착된 로프와 닿은 적에게 감전 피해를 줍니다.",
        category: "rope"
    }),
    createCard({
        id: "collision-explosion",
        name: "충돌 폭발",
        family: "공통 로프",
        tagline: "고속 충돌 폭발",
        description: "유효한 고속 로프 몸체 충돌이 범위 폭발과 넉백을 만듭니다.",
        category: "rope"
    }),
    createCard({
        id: SPELL_ID.METEOR,
        name: "메테오",
        family: "공격 마법",
        tagline: "고위력 점화 폭발",
        description: "조준 방향으로 메테오를 발사해 충돌 지점에 범위 피해와 점화를 적용합니다.",
        category: "spell",
        slotId: SPELL_SLOT_ID.POWER_ATTACK,
        role: SPELL_ROLE.POWER_ATTACK
    }),
    createCard({
        id: SPELL_ID.MOBILITY_SURGE,
        name: "기동 증폭",
        family: "유틸 마법",
        tagline: "속도·점프 ×1.50",
        description: "쿨다운의 절반 동안 지상·공중 이동과 점프 성능을 1.50배로 강화합니다.",
        category: "spell",
        slotId: SPELL_SLOT_ID.UTILITY,
        role: SPELL_ROLE.UTILITY
    })
]);

export const REWARDABLE_AUGMENT_IDS = Object.freeze(AUGMENT_CATALOG.map(({ id }) => id));
export const MAX_AUGMENT_SELECTIONS = REWARDABLE_AUGMENT_IDS.length;

const AUGMENT_BY_ID = Object.freeze(Object.fromEntries(AUGMENT_CATALOG.map((augment) => [augment.id, augment])));

export function augmentById(id) {
    return id === null || id === undefined ? null : (AUGMENT_BY_ID[id] ?? null);
}

export function isRopeAugment(id) {
    return augmentById(id)?.category === "rope";
}

export function isSpellAugment(id) {
    return augmentById(id)?.category === "spell";
}

export function isAugmentCompatibleWithSelection(augmentId, selectedAugmentIds = []) {
    const augment = augmentById(augmentId);
    return Boolean(augment && !selectedAugmentIds.includes(augment.id));
}

export function compatibleAugmentsForSelection(selectedAugmentIds = []) {
    return AUGMENT_CATALOG.filter(({ id }) => isAugmentCompatibleWithSelection(id, selectedAugmentIds));
}
