export const ARTIFACT_CATALOG = Object.freeze([
    Object.freeze({
        id: "power-core",
        name: "동력핵",
        description: "자동 사격 피해 +40%",
        modifiers: Object.freeze({ damageMultiplier: 1.4 })
    }),
    Object.freeze({
        id: "rapid-gear",
        name: "연사 톱니",
        description: "자동 사격 간격 -25%",
        modifiers: Object.freeze({ fireIntervalMultiplier: 0.75 })
    }),
    Object.freeze({
        id: "rope-resonance",
        name: "로프 공명기",
        description: "스윙 후 3초간 피해 +60%",
        modifiers: Object.freeze({ swingDamageMultiplier: 1.6, swingDamageDuration: 3 })
    })
]);

export function getArtifactEffects(artifacts, ropeBoostRemaining = 0) {
    let damageMultiplier = 1;
    let fireIntervalMultiplier = 1;
    let swingDamageMultiplier = 1;
    let swingDamageDuration = 0;
    for (const artifact of artifacts) {
        damageMultiplier *= artifact.modifiers?.damageMultiplier ?? 1;
        fireIntervalMultiplier *= artifact.modifiers?.fireIntervalMultiplier ?? 1;
        swingDamageMultiplier *= artifact.modifiers?.swingDamageMultiplier ?? 1;
        swingDamageDuration = Math.max(swingDamageDuration, artifact.modifiers?.swingDamageDuration ?? 0);
    }
    return Object.freeze({
        damageMultiplier: damageMultiplier * (ropeBoostRemaining > 0 ? swingDamageMultiplier : 1),
        fireIntervalMultiplier,
        swingDamageDuration
    });
}
