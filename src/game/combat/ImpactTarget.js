export const IMPACT_TARGET_KIND = Object.freeze({
    ENEMY: "enemy",
    BOSS: "boss"
});

export const IMPACT_RESOLUTION = Object.freeze({
    HIT: "target-hit",
    DEFEATED: "target-defeated",
    PHASE_COMPLETED: "target-phase-completed",
    ALREADY_DEFEATED: "target-already-dead"
});

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function requireNonNegative(value, label) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be non-negative`);
    return value;
}

export function scaledWeakpointDamage(phaseMaxHealth, fixedDamageRatio = 0.25) {
    requireNonNegative(phaseMaxHealth, "phaseMaxHealth");
    if (!Number.isFinite(fixedDamageRatio) || fixedDamageRatio < 0 || fixedDamageRatio > 1) {
        throw new Error("fixedDamageRatio must be between 0 and 1");
    }
    return phaseMaxHealth * fixedDamageRatio;
}

export function createImpactDamage({
    normalDamage,
    weakpointExposed = false,
    phaseMaxHealth = 0,
    weakpointRatio = 0.25
}) {
    const normalizedNormalDamage = requireNonNegative(normalDamage, "normalDamage");
    const weakpointDamage = weakpointExposed ? scaledWeakpointDamage(phaseMaxHealth, weakpointRatio) : 0;
    return Object.freeze({
        normalDamage: normalizedNormalDamage,
        weakpointDamage,
        totalDamage: normalizedNormalDamage + weakpointDamage,
        weakpointHit: weakpointExposed
    });
}

export class ImpactTarget {
    constructor({ id, kind = IMPACT_TARGET_KIND.ENEMY, isActive = null, snapshot, applyImpact }) {
        this.id = requireId(id, "ImpactTarget id");
        this.kind = requireId(kind, "ImpactTarget kind");
        if (typeof snapshot !== "function") throw new Error("ImpactTarget requires snapshot()");
        if (typeof applyImpact !== "function") throw new Error("ImpactTarget requires applyImpact()");
        if (isActive !== null && typeof isActive !== "function") {
            throw new Error("ImpactTarget isActive must be a function");
        }
        this.isTargetActive = isActive;
        this.snapshotTarget = snapshot;
        this.applyTargetImpact = applyImpact;
    }

    snapshot() {
        const state = this.snapshotTarget();
        if (!state || state.id !== this.id) throw new Error("ImpactTarget snapshot id mismatch");
        return state;
    }

    get active() {
        if (this.isTargetActive) return this.isTargetActive() === true;
        const state = this.snapshot();
        return state.active !== false && (state.health === undefined || state.health > 0);
    }

    activeSnapshot() {
        if (this.isTargetActive && !this.active) return null;
        const state = this.snapshot();
        if (!this.isTargetActive && (state.active === false || (state.health !== undefined && state.health <= 0))) {
            return null;
        }
        return state;
    }

    resolve({ sourcePlayerId, sourceKind, normalDamage, position, causalId }) {
        requireId(sourcePlayerId, "sourcePlayerId");
        requireId(sourceKind, "sourceKind");
        requireId(causalId, "causalId");
        const before = this.snapshot();
        if (before.active === false || (before.health !== undefined && before.health <= 0)) {
            return Object.freeze({
                accepted: true,
                resolution: IMPACT_RESOLUTION.ALREADY_DEFEATED,
                damage: 0,
                normalDamage: 0,
                weakpointDamage: 0,
                weakpointHit: false
            });
        }
        const damage = createImpactDamage({
            normalDamage,
            weakpointExposed: before.weakpointExposed === true,
            phaseMaxHealth: before.phaseMaxHealth ?? 0,
            weakpointRatio: before.weakpointDamageRatio ?? 0.25
        });
        const result = this.applyTargetImpact(
            Object.freeze({ sourcePlayerId, sourceKind, position, causalId, ...damage })
        );
        if (!result || typeof result.accepted !== "boolean") {
            throw new Error("ImpactTarget applyImpact() must return an accepted result");
        }
        return Object.freeze({ ...damage, ...result, damage: result.damage ?? damage.totalDamage });
    }
}
