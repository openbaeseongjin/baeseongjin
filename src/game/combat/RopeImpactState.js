export const ROPE_IMPACT_STATE_REASON = Object.freeze({
    SWING_REQUIRED: "swing-required",
    RELEASE_EXPIRED: "release-expired"
});

function requireNonNegative(value, label) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be non-negative`);
    return value;
}

function targetIdSet(targetIds) {
    if (!Array.isArray(targetIds) || targetIds.some((targetId) => typeof targetId !== "string" || !targetId)) {
        throw new Error("rope impact target IDs must be non-empty strings");
    }
    return new Set(targetIds);
}

export class RopeImpactState {
    constructor({ releaseCarrySeconds }) {
        this.releaseCarrySeconds = requireNonNegative(releaseCarrySeconds, "rope impact releaseCarrySeconds");
        this.swingArmed = false;
        this.released = false;
        this.releaseCarryRemaining = 0;
        this.touchingTargetIds = new Set();
    }

    reset() {
        this.swingArmed = false;
        this.released = false;
        this.releaseCarryRemaining = 0;
        this.touchingTargetIds.clear();
    }

    beginAttachment() {
        this.reset();
    }

    armSwing() {
        this.swingArmed = true;
        this.released = false;
        this.releaseCarryRemaining = 0;
        return true;
    }

    beginReleaseCarry() {
        if (!this.swingArmed) return false;
        this.released = true;
        this.releaseCarryRemaining = this.releaseCarrySeconds;
        return true;
    }

    advance(dt) {
        requireNonNegative(dt, "rope impact dt");
        if (!this.released || this.releaseCarryRemaining <= 0) return this.releaseCarryRemaining;
        this.releaseCarryRemaining = Math.max(0, this.releaseCarryRemaining - dt);
        return this.releaseCarryRemaining;
    }

    isActive({ ropeAttached }) {
        if (typeof ropeAttached !== "boolean") throw new Error("ropeAttached must be boolean");
        return this.swingArmed && (ropeAttached || (this.released && this.releaseCarryRemaining > 0));
    }

    unavailableReason({ ropeAttached }) {
        if (typeof ropeAttached !== "boolean") throw new Error("ropeAttached must be boolean");
        if (!this.swingArmed) return ROPE_IMPACT_STATE_REASON.SWING_REQUIRED;
        if (!ropeAttached && this.released && this.releaseCarryRemaining <= 0) {
            return ROPE_IMPACT_STATE_REASON.RELEASE_EXPIRED;
        }
        return ROPE_IMPACT_STATE_REASON.SWING_REQUIRED;
    }

    enteringTargetIds(targetIds) {
        const currentTargetIds = targetIdSet(targetIds);
        const entering = [...currentTargetIds].filter((targetId) => !this.touchingTargetIds.has(targetId));
        this.touchingTargetIds = currentTargetIds;
        return Object.freeze(entering);
    }

    snapshot() {
        return Object.freeze({
            swingArmed: this.swingArmed,
            released: this.released,
            releaseCarryRemaining: this.releaseCarryRemaining,
            touchingTargetIds: Object.freeze([...this.touchingTargetIds].sort())
        });
    }

    restore(snapshot = null) {
        if (snapshot === null) {
            this.reset();
            return this.snapshot();
        }
        if (typeof snapshot?.swingArmed !== "boolean" || typeof snapshot.released !== "boolean") {
            throw new Error("rope impact snapshot requires boolean swingArmed and released");
        }
        const releaseCarryRemaining = requireNonNegative(
            snapshot.releaseCarryRemaining,
            "rope impact releaseCarryRemaining"
        );
        if (!snapshot.released && releaseCarryRemaining > 0) {
            throw new Error("attached rope impact state cannot retain release carry");
        }
        if (!snapshot.swingArmed && (snapshot.released || releaseCarryRemaining > 0)) {
            throw new Error("unarmed rope impact state cannot be released");
        }
        this.swingArmed = snapshot.swingArmed;
        this.released = snapshot.released;
        this.releaseCarryRemaining = releaseCarryRemaining;
        this.touchingTargetIds = targetIdSet(snapshot.touchingTargetIds ?? []);
        return this.snapshot();
    }
}
