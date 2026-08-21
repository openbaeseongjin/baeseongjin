// REFERENCE SCAFFOLD — pure logic.
// Adapt Vector/circle helpers to repository utilities.

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function currentBossPhaseTarget(definition, bossSnapshot) {
    return definition.phaseTargets?.find((target) => target.phase === bossSnapshot.phase) ?? null;
}

export function resolveBossPhaseTargetImpact({
    definition,
    bossSnapshot,
    target,
    playerPosition,
    ropeAttached,
    impactSpeed,
    baseDamage,
    minimumSpeed
}) {
    if (bossSnapshot?.status !== "active") {
        return Object.freeze({ accepted: false, reason: "boss-not-active" });
    }
    if (bossSnapshot.shieldState !== "exposed") {
        return Object.freeze({ accepted: false, reason: "target-not-exposed" });
    }
    if (!ropeAttached) {
        return Object.freeze({ accepted: false, reason: "rope-not-attached" });
    }
    if (!Number.isFinite(impactSpeed) || impactSpeed < minimumSpeed) {
        return Object.freeze({ accepted: false, reason: "speed-below-minimum" });
    }
    if (!target || distance(playerPosition, target.assembly) > target.assembly.radius) {
        return Object.freeze({ accepted: false, reason: "target-not-overlapped" });
    }

    const weak = distance(playerPosition, target.weakPoint) <= target.weakPoint.radius;
    const multiplier = weak ? target.weakPoint.damageMultiplier : 1.0;

    return Object.freeze({
        accepted: true,
        reason: null,
        hitZone: weak ? "weak-point" : "assembly",
        multiplier,
        baseDamage,
        damage: baseDamage * multiplier
    });
}
