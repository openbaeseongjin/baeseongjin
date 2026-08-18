const ACTION_SIGNATURE_BY_ACTION_ID = Object.freeze({
    "direction-dash": "explosive-trail",
    "dash-strike": "collision-rebound",
    "instant-guard": "damage-reflect",
    "push-away": "wall-impact",
    "straight-shot": "piercing-shot",
    "slow-fall": "end-wave"
});

const LEGACY_FOUNDATION_ID_MIGRATION = Object.freeze({
    "impulse-coil": "release-propulsion",
    "relay-link": "rope-link",
    "shear-current": "electrified-rope"
});

function createCard(definition) {
    return Object.freeze({
        ...definition,
        tier: "AUGMENT_V1"
    });
}

const AUGMENT_DEFINITIONS = Object.freeze([
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
        description: "성공, 취소, 만료를 포함한 모든 로프 재발사 대기를 절반으로 줄입니다.",
        category: "rope"
    }),
    createCard({
        id: "release-propulsion",
        name: "해제 추진",
        family: "공통 로프",
        tagline: "해제 후 속도 ×1.25",
        description: "정상 해제 직후 플레이어의 전체 속도를 1.25배로 증폭합니다.",
        category: "rope"
    }),
    createCard({
        id: "electrified-rope",
        name: "감전 로프",
        family: "공통 로프",
        tagline: "접촉 중 지속 피해",
        description: "부착된 로프와 닿은 적에게 0.10초 pulse로 감전 피해를 줍니다.",
        category: "rope"
    }),
    createCard({
        id: "collision-explosion",
        name: "충돌 폭발",
        family: "공통 로프",
        tagline: "고속 충돌 폭발",
        description: "유효한 고속 로프 몸체 충돌이 반경 120px 폭발과 넉백을 만듭니다.",
        category: "rope"
    }),
    createCard({
        id: "direction-dash",
        name: "방향 돌진",
        family: "기본 액션",
        tagline: "150px 돌진",
        description: "조준 방향으로 150px 돌진합니다.",
        category: "action",
        actionId: "direction-dash"
    }),
    createCard({
        id: "dash-strike",
        name: "돌진 타격",
        family: "기본 액션",
        tagline: "벡터 충격 타격",
        description: "현재 속도에 조준 방향 충격을 더하고 짧은 타격 창을 엽니다.",
        category: "action",
        actionId: "dash-strike"
    }),
    createCard({
        id: "instant-guard",
        name: "순간 방어",
        family: "기본 액션",
        tagline: "첫 HP 피해 무효",
        description: "짧은 시간 첫 전투 HP 피해를 0으로 막습니다.",
        category: "action",
        actionId: "instant-guard"
    }),
    createCard({
        id: "push-away",
        name: "밀쳐내기",
        family: "기본 액션",
        tagline: "주변 방사 넉백",
        description: "주변 적을 한 번에 밀쳐내고 피해를 줍니다.",
        category: "action",
        actionId: "push-away"
    }),
    createCard({
        id: "straight-shot",
        name: "직선 사격",
        family: "기본 액션",
        tagline: "2000px/s 직선탄",
        description: "고속 직선 탄환을 발사합니다.",
        category: "action",
        actionId: "straight-shot"
    }),
    createCard({
        id: "slow-fall",
        name: "느린 낙하",
        family: "기본 액션",
        tagline: "공중 낙하 완화",
        description: "공중에서 중력을 약화시켜 천천히 내려옵니다.",
        category: "action",
        actionId: "slow-fall"
    }),
    createCard({
        id: "explosive-trail",
        name: "폭발 흔적",
        family: "시그니처",
        tagline: "방향 돌진 전용",
        description: "돌진 경로를 0.50초 뒤 폭발시키는 흔적을 남깁니다.",
        category: "signature",
        actionId: "direction-dash"
    }),
    createCard({
        id: "collision-rebound",
        name: "충돌 반동",
        family: "시그니처",
        tagline: "돌진 타격 전용",
        description: "돌진 타격 중 적과 장애물에 속도 손실 없이 반사됩니다.",
        category: "signature",
        actionId: "dash-strike"
    }),
    createCard({
        id: "damage-reflect",
        name: "피해 반사",
        family: "시그니처",
        tagline: "순간 방어 전용",
        description: "막은 HP 피해를 공격자에게 한 번 되돌립니다.",
        category: "signature",
        actionId: "instant-guard"
    }),
    createCard({
        id: "wall-impact",
        name: "벽 충돌",
        family: "시그니처",
        tagline: "밀쳐내기 전용",
        description: "밀쳐진 적이 벽이나 바닥에 부딪히면 추가 피해를 줍니다.",
        category: "signature",
        actionId: "push-away"
    }),
    createCard({
        id: "piercing-shot",
        name: "관통 사격",
        family: "시그니처",
        tagline: "직선 사격 전용",
        description: "직선 사격이 적을 관통하며 피해를 유지합니다.",
        category: "signature",
        actionId: "straight-shot"
    }),
    createCard({
        id: "end-wave",
        name: "종료 파동",
        family: "시그니처",
        tagline: "느린 낙하 전용",
        description: "느린 낙하가 끝나는 지점에서 범위 파동을 방출합니다.",
        category: "signature",
        actionId: "slow-fall"
    }),
    createCard({
        id: "fast-reuse",
        name: "빠른 재사용",
        family: "범용 강화",
        tagline: "액션 쿨다운 ×0.60",
        description: "모든 액션 쿨다운을 40% 줄입니다.",
        category: "modifier"
    }),
    createCard({
        id: "extra-charge",
        name: "추가 충전",
        family: "범용 강화",
        tagline: "액션 최대 충전 +1",
        description: "액션 최대 충전을 1 늘리고 획득 즉시 가득 채웁니다.",
        category: "modifier"
    }),
    createCard({
        id: "rope-link",
        name: "로프 연동",
        family: "범용 강화",
        tagline: "해제 후 다음 액션 쿨다운 -50%",
        description: "로프 해제 뒤 1초 안에 쓰는 다음 액션의 쿨다운을 절반으로 줄입니다.",
        category: "modifier"
    }),
    createCard({
        id: "post-action-shield",
        name: "사용 후 보호막",
        family: "범용 강화",
        tagline: "액션 후 보호막 15%",
        description: "유효한 액션 종료 뒤 최대 체력 15% 보호막을 2초 동안 얻습니다.",
        category: "modifier"
    })
]);

export const FOUNDATION_AUGMENT_CATALOG = AUGMENT_DEFINITIONS;
export const AUGMENT_CATALOG = FOUNDATION_AUGMENT_CATALOG;

const AUGMENT_BY_ID = new Map(AUGMENT_CATALOG.map((augment) => [augment.id, augment]));

export function normalizeLegacyFoundationAugmentId(id) {
    return LEGACY_FOUNDATION_ID_MIGRATION[id] ?? id ?? null;
}

export function foundationAugmentById(id) {
    if (id === null || id === undefined) return null;
    return AUGMENT_BY_ID.get(normalizeLegacyFoundationAugmentId(id)) ?? null;
}

export function augmentById(id) {
    return foundationAugmentById(id);
}

export function isActionAugment(augmentId) {
    return augmentById(augmentId)?.category === "action";
}

export function isSignatureAugment(augmentId) {
    return augmentById(augmentId)?.category === "signature";
}

export function isModifierAugment(augmentId) {
    return augmentById(augmentId)?.category === "modifier";
}

export function isRopeAugment(augmentId) {
    return augmentById(augmentId)?.category === "rope";
}

export function selectedBaseActionId(selectedAugmentIds = []) {
    const normalized = Array.isArray(selectedAugmentIds) ? selectedAugmentIds : [];
    return normalized.find((id) => isActionAugment(id)) ?? null;
}

export function selectedSignatureId(selectedAugmentIds = []) {
    const normalized = Array.isArray(selectedAugmentIds) ? selectedAugmentIds : [];
    return normalized.find((id) => isSignatureAugment(id)) ?? null;
}

export function signatureForActionId(actionId) {
    return ACTION_SIGNATURE_BY_ACTION_ID[actionId] ?? null;
}

export function isAugmentCompatibleWithSelection(augmentId, selectedAugmentIds = []) {
    const augment = augmentById(augmentId);
    if (!augment) return false;
    const normalizedSelection = Array.isArray(selectedAugmentIds)
        ? selectedAugmentIds.map((id) => normalizeLegacyFoundationAugmentId(id)).filter(Boolean)
        : [];
    if (normalizedSelection.includes(augment.id)) return false;
    const currentActionId = selectedBaseActionId(normalizedSelection);
    const currentSignature = selectedSignatureId(normalizedSelection);
    if (augment.category === "action") {
        return currentActionId === null;
    }
    if (augment.category === "signature") {
        return currentActionId !== null && currentSignature === null && augment.actionId === currentActionId;
    }
    if (augment.category === "modifier") {
        return currentActionId !== null;
    }
    return true;
}

export function compatibleAugmentsForSelection(selectedAugmentIds = []) {
    return AUGMENT_CATALOG.filter(({ id }) => isAugmentCompatibleWithSelection(id, selectedAugmentIds));
}
