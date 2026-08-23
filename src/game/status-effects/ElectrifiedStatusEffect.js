const NUMERIC_EPSILON = 1e-9;

export const ELECTRIFIED_STATUS_ID = "electrified";
const ELECTRIFIED_DURATION_SECONDS = 0.5;
const ELECTRIFIED_PULSE_SECONDS = 0.05;
const ELECTRIFIED_TOTAL_DAMAGE = 25;
export const ELECTRIFIED_STATUS_CONFIG = Object.freeze({
    durationSeconds: ELECTRIFIED_DURATION_SECONDS,
    pulseSeconds: ELECTRIFIED_PULSE_SECONDS,
    totalDamage: ELECTRIFIED_TOTAL_DAMAGE,
    damagePerPulse: (ELECTRIFIED_TOTAL_DAMAGE * ELECTRIFIED_PULSE_SECONDS) / ELECTRIFIED_DURATION_SECONDS
});

function requirePositive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive finite number`);
    return value;
}

export class ElectrifiedStatusEffect {
    constructor({
        durationSeconds = ELECTRIFIED_STATUS_CONFIG.durationSeconds,
        pulseSeconds = ELECTRIFIED_STATUS_CONFIG.pulseSeconds,
        damagePerPulse = ELECTRIFIED_STATUS_CONFIG.damagePerPulse
    } = {}) {
        this.durationSeconds = requirePositive(durationSeconds, "durationSeconds");
        this.pulseSeconds = requirePositive(pulseSeconds, "pulseSeconds");
        this.damagePerPulse = requirePositive(damagePerPulse, "damagePerPulse");
        this.remainingSeconds = 0;
        this.secondsUntilNextPulse = this.pulseSeconds;
        this.sourceId = null;
    }

    get active() {
        return this.remainingSeconds > 0;
    }

    apply({ sourceId = null } = {}) {
        if (sourceId !== null && (typeof sourceId !== "string" || sourceId.length === 0)) {
            throw new Error("electrified sourceId must be null or a non-empty string");
        }
        const wasActive = this.active;
        this.remainingSeconds = this.durationSeconds;
        this.sourceId = sourceId;
        if (!wasActive) this.secondsUntilNextPulse = this.pulseSeconds;
        return this.snapshot();
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("electrified dt must be finite and non-negative");
        if (!this.active || dt === 0) return Object.freeze({ pulseCount: 0, damage: 0, sourceId: this.sourceId });

        const activeSeconds = Math.min(dt, this.remainingSeconds);
        this.remainingSeconds = Math.max(0, this.remainingSeconds - activeSeconds);
        this.secondsUntilNextPulse -= activeSeconds;
        let pulseCount = 0;
        while (this.secondsUntilNextPulse <= NUMERIC_EPSILON) {
            pulseCount += 1;
            this.secondsUntilNextPulse += this.pulseSeconds;
        }
        const sourceId = this.sourceId;
        if (!this.active) {
            this.remainingSeconds = 0;
            this.secondsUntilNextPulse = this.pulseSeconds;
            this.sourceId = null;
        }
        return Object.freeze({ pulseCount, damage: pulseCount * this.damagePerPulse, sourceId });
    }

    snapshot() {
        return Object.freeze({
            id: ELECTRIFIED_STATUS_ID,
            active: this.active,
            remainingSeconds: this.remainingSeconds,
            secondsUntilNextPulse: this.secondsUntilNextPulse,
            sourceId: this.sourceId
        });
    }

    restore(snapshot = null) {
        this.remainingSeconds = 0;
        this.secondsUntilNextPulse = this.pulseSeconds;
        this.sourceId = null;
        if (!snapshot?.active) return this.snapshot();
        if (!Number.isFinite(snapshot.remainingSeconds) || snapshot.remainingSeconds <= 0) {
            throw new Error("active electrified status requires positive remainingSeconds");
        }
        if (!Number.isFinite(snapshot.secondsUntilNextPulse) || snapshot.secondsUntilNextPulse <= 0) {
            throw new Error("active electrified status requires positive secondsUntilNextPulse");
        }
        if (snapshot.sourceId !== null && (typeof snapshot.sourceId !== "string" || snapshot.sourceId.length === 0)) {
            throw new Error("electrified sourceId must be null or a non-empty string");
        }
        this.remainingSeconds = Math.min(this.durationSeconds, snapshot.remainingSeconds);
        this.secondsUntilNextPulse = Math.min(this.pulseSeconds, snapshot.secondsUntilNextPulse);
        this.sourceId = snapshot.sourceId ?? null;
        return this.snapshot();
    }

    reset() {
        return this.restore();
    }
}
