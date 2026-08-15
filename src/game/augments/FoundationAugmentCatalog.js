const FOUNDATION_DEFINITIONS = [
    {
        id: "impulse-coil",
        name: "IMPULSE COIL",
        family: "MOMENTUM",
        tagline: "POWER THE SWING",
        description: "스윙 타이밍으로 강한 해제 추진력을 얻습니다."
    },
    {
        id: "relay-link",
        name: "RELAY LINK",
        family: "CHAINING",
        tagline: "KEEP THE CHAIN ALIVE",
        description: "해제 직후 다음 로프 연결을 한 번 보조합니다."
    },
    {
        id: "shear-current",
        name: "SHEAR CURRENT",
        family: "OFFENSE",
        tagline: "TURN THE ROPE INTO A BLADE",
        description: "적을 가로지른 로프를 놓아 절단 피해를 줍니다."
    }
];

export const FOUNDATION_AUGMENT_CATALOG = Object.freeze(
    FOUNDATION_DEFINITIONS.map((definition) => Object.freeze({ ...definition, tier: "FOUNDATION" }))
);

export const FOUNDATION_AUGMENT_CONFIG = Object.freeze({
    impulseReleaseMagnitude: 180,
    relayWindowSeconds: 0.65,
    relayAttachBufferSeconds: 0.16,
    relayAimTolerance: 108,
    shearDamage: 20,
    shearSegmentTolerance: 4
});

const FOUNDATION_BY_ID = new Map(FOUNDATION_AUGMENT_CATALOG.map((foundation) => [foundation.id, foundation]));

export function foundationAugmentById(id) {
    return FOUNDATION_BY_ID.get(id) ?? null;
}
