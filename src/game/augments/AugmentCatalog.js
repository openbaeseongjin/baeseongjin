import { SPELL_ID, SPELL_SPEC } from "../spells/SpellDefinition.js";

export const AUGMENT_ID = Object.freeze({
    FAST_LAUNCH: "fast-launch",
    LONG_ROPE: "long-rope",
    FAST_RECOVER: "fast-recover",
    RELEASE_PROPULSION: "release-propulsion",
    ELECTRIFIED_ROPE: "electrified-rope",
    COLLISION_EXPLOSION: "collision-explosion",
    ROPE_REGENERATION: "rope-regeneration",
    DOUBLE_JUMP: "double-jump"
});

const card = (definition) => Object.freeze({ ...definition, tier: "AUGMENT_V2" });
const ropeCard = (id, name, tagline, description) =>
    card({ id, name, family: "공통 로프", tagline, description, category: "rope" });
const spellCard = (definition, family, tagline, description) =>
    card({
        id: definition.id,
        name: definition.displayName,
        family,
        tagline,
        description,
        category: "spell",
        slotId: definition.slotId,
        role: definition.role
    });

const ROPE_CARDS = Object.freeze([
    ropeCard(AUGMENT_ID.FAST_LAUNCH, "빠른 발사", "발사 속도 +50%", "로프 발사 속도를 50% 올립니다."),
    ropeCard(AUGMENT_ID.LONG_ROPE, "긴 로프", "사거리 +20%", "로프 최대 사거리를 20% 늘립니다."),
    ropeCard(AUGMENT_ID.FAST_RECOVER, "빠른 회수", "재발사 대기 -50%", "모든 로프 재발사 대기를 절반으로 줄입니다."),
    ropeCard(
        AUGMENT_ID.RELEASE_PROPULSION,
        "해제 추진",
        "해제 후 속도 ×1.25",
        "정상 해제 직후 전체 속도를 1.25배로 증폭합니다."
    ),
    ropeCard(
        AUGMENT_ID.ELECTRIFIED_ROPE,
        "감전 로프",
        "접촉 중 지속 피해",
        "부착된 로프와 닿은 적에게 감전 피해를 줍니다."
    ),
    ropeCard(
        AUGMENT_ID.COLLISION_EXPLOSION,
        "충돌 폭발",
        "고속 충돌 폭발",
        "유효한 고속 로프 몸체 충돌이 범위 폭발과 넉백을 만듭니다."
    ),
    ropeCard(
        AUGMENT_ID.ROPE_REGENERATION,
        "로프 회복",
        "부착 중 초당 체력 2",
        "로프가 부착된 동안 최대 체력까지 초당 2를 회복합니다."
    )
]);

const PASSIVE_CARDS = Object.freeze([
    card({
        id: AUGMENT_ID.DOUBLE_JUMP,
        name: "2단 점프",
        family: "이동 패시브",
        tagline: "공중 점프 +1",
        description: "착지 전 기존 점프와 같은 공중 점프를 한 번 사용합니다.",
        category: "passive"
    })
]);

const SPELL_CARD_COPY = Object.freeze({
    [SPELL_ID.LONG_RANGE_ORB]: ["기본 공격", "사거리 ×2·속도 ×1.5", "빠르고 긴 단일 마력탄을 발사합니다."],
    [SPELL_ID.OVERCHARGED_ORB]: ["기본 공격", "피해 30", "피해를 강화한 단일 마력탄을 발사합니다."],
    [SPELL_ID.IGNITION_ORB]: ["기본 공격", "직접 5+점화", "단일 대상에게 점화를 남기는 마력탄을 발사합니다."],
    [SPELL_ID.ARCANE_SLASH]: ["기본 공격", "사거리 360 범위 검격", "전방 범위의 여러 적을 검격으로 벱니다."],
    [SPELL_ID.METEOR]: ["고위력 공격", "반경 350 점화 폭발", "암석 핵과 화염 꼬리를 가진 메테오를 발사합니다."],
    [SPELL_ID.FROST_BURST]: ["고위력 공격", "반경 280 빙결", "자기 주변 적에게 피해와 냉동을 적용합니다."],
    [SPELL_ID.SHATTER_BOMB]: [
        "고위력 공격",
        "피해 80·Impulse 600",
        "충돌 지점에 높은 즉발 피해와 외부 Impulse를 적용합니다."
    ],
    [SPELL_ID.THERMAL_LASER]: ["고위력 공격", "직선 점화", "긴 열선 안의 모든 대상을 점화합니다."],
    [SPELL_ID.ELECTRIC_ORB]: [
        "고위력 공격",
        "이동형 감전 영역",
        "느린 구체 주변 영역에 들어온 대상을 고전압 감전시킵니다."
    ],
    [SPELL_ID.MOBILITY_SURGE]: ["유틸", "이동 성능 ×1.5", "7.5초 동안 이동과 점프 성능을 강화합니다."],
    [SPELL_ID.LOW_GRAVITY]: ["유틸", "중력 ×0.5", "5초 동안 자기 중력을 절반으로 낮춥니다."],
    [SPELL_ID.COOLDOWN_RESET]: ["유틸", "다른 슬롯 즉시 준비", "다른 세 Spell 슬롯의 남은 대기시간을 초기화합니다."],
    [SPELL_ID.FREEZE_BOLT]: ["유틸", "단일 냉동", "피해 5와 냉동을 적용하는 단일 투사체입니다."],
    [SPELL_ID.GATHERING_ORB]: ["유틸", "적 집속 Impulse", "충돌 지점으로 주변 적을 끌어당깁니다."],
    [SPELL_ID.CHAIN_DASH]: ["이동", "2회 충전", "목표 속도 500의 대시를 두 번 연속 사용합니다."],
    [SPELL_ID.THRUSTER_FLIGHT]: ["이동", "1.5초 조종 비행", "커서 방향으로 지속 추진하며 궤도를 조정합니다."]
});

const SPELL_CARDS = Object.freeze(
    Object.entries(SPELL_CARD_COPY).map(([id, [family, tagline, description]]) =>
        spellCard(
            Object.values(SPELL_SPEC).find((definition) => definition.id === id),
            family,
            tagline,
            description
        )
    )
);

export const AUGMENT_CATALOG = Object.freeze([...ROPE_CARDS, ...PASSIVE_CARDS, ...SPELL_CARDS]);
export const REWARDABLE_AUGMENT_IDS = Object.freeze(AUGMENT_CATALOG.map(({ id }) => id));
export const MAX_AUGMENT_SELECTIONS = REWARDABLE_AUGMENT_IDS.length;
const AUGMENT_BY_ID = Object.freeze(Object.fromEntries(AUGMENT_CATALOG.map((augment) => [augment.id, augment])));

export function augmentById(id) {
    return id == null ? null : (AUGMENT_BY_ID[id] ?? null);
}
export function isRopeAugment(id) {
    return augmentById(id)?.category === "rope";
}
export function isSpellAugment(id) {
    return augmentById(id)?.category === "spell";
}
export function isPassiveAugment(id) {
    return augmentById(id)?.category === "passive";
}
export function isAugmentCompatibleWithSelection(augmentId, selectedAugmentIds = []) {
    const augment = augmentById(augmentId);
    return Boolean(augment && !selectedAugmentIds.includes(augment.id));
}
export function compatibleAugmentsForSelection(selectedAugmentIds = []) {
    return AUGMENT_CATALOG.filter(({ id }) => isAugmentCompatibleWithSelection(id, selectedAugmentIds));
}
