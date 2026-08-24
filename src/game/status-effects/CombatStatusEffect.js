const NUMERIC_EPSILON = 1e-9;

function requirePositive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive finite number`);
    return value;
}

export class CombatStatusEffect {
    constructor(spec) {
        if (typeof spec?.id !== "string" || spec.id.length === 0) throw new Error("status effect spec requires an id");
        this.spec = spec;
        this.durationSeconds = requirePositive(spec.durationSeconds, `${spec.id}.durationSeconds`);
        this.remainingSeconds = 0;
        this.sourceId = null;
    }

    get id() {
        return this.spec.id;
    }

    get active() {
        return this.remainingSeconds > NUMERIC_EPSILON;
    }

    apply({ sourceId = null } = {}) {
        if (sourceId !== null && (typeof sourceId !== "string" || sourceId.length === 0)) {
            throw new Error(`${this.id} sourceId must be null or non-empty`);
        }
        const wasActive = this.active;
        this.remainingSeconds = this.durationSeconds;
        this.sourceId = sourceId;
        this.onApplied({ wasActive });
        return this.snapshot();
    }

    onApplied() {}

    canAct() {
        return true;
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error(`${this.id} dt must be finite and non-negative`);
        if (!this.active || dt === 0) return Object.freeze([]);
        const activeSeconds = Math.min(dt, this.remainingSeconds);
        this.remainingSeconds = Math.max(0, this.remainingSeconds - activeSeconds);
        const outcomes = this.advanceActive(activeSeconds);
        if (!this.active) this.finish();
        return Object.freeze(outcomes);
    }

    advanceActive() {
        return [];
    }

    finish() {
        this.remainingSeconds = 0;
        this.sourceId = null;
    }

    draw(renderState) {
        if (!this.active) return 0;
        throw new Error(`${this.constructor.name} must implement draw()`);
    }

    drawParticles(renderState) {
        if (!this.active || typeof renderState?.particles?.appendStatusParticles !== "function") return 0;
        return renderState.particles.appendStatusParticles({
            effectId: this.id,
            spec: this.spec.particle,
            position: renderState.position,
            radius: renderState.radius,
            velocity: renderState.velocity,
            remainingSeconds: this.remainingSeconds,
            durationSeconds: this.durationSeconds
        });
    }

    snapshotRuntime() {
        return Object.freeze({});
    }

    snapshot() {
        return Object.freeze({
            id: this.id,
            active: this.active,
            remainingSeconds: this.remainingSeconds,
            sourceId: this.sourceId,
            runtime: this.snapshotRuntime()
        });
    }

    restore(snapshot = null) {
        this.reset();
        if (!snapshot?.active) return this.snapshot();
        if (snapshot.id !== this.id) throw new Error(`status effect snapshot id mismatch: ${snapshot.id}`);
        requirePositive(snapshot.remainingSeconds, `${this.id}.remainingSeconds`);
        this.remainingSeconds = Math.min(this.durationSeconds, snapshot.remainingSeconds);
        this.sourceId = snapshot.sourceId ?? null;
        this.restoreRuntime(snapshot.runtime ?? null);
        return this.snapshot();
    }

    restoreRuntime() {}

    reset() {
        this.remainingSeconds = 0;
        this.sourceId = null;
        this.resetRuntime();
        return this.snapshot();
    }

    resetRuntime() {}
}

export class PeriodicDamageStatusEffect extends CombatStatusEffect {
    constructor(spec) {
        super(spec);
        this.pulseSeconds = requirePositive(spec.pulseSeconds, `${spec.id}.pulseSeconds`);
        this.totalDamage = requirePositive(spec.totalDamage, `${spec.id}.totalDamage`);
        this.damagePerPulse = (this.totalDamage * this.pulseSeconds) / this.durationSeconds;
        this.secondsUntilNextPulse = this.pulseSeconds;
    }

    onApplied({ wasActive }) {
        if (!wasActive) this.secondsUntilNextPulse = this.pulseSeconds;
    }

    advanceActive(activeSeconds) {
        this.secondsUntilNextPulse -= activeSeconds;
        let pulseCount = 0;
        while (this.secondsUntilNextPulse <= NUMERIC_EPSILON) {
            pulseCount += 1;
            this.secondsUntilNextPulse += this.pulseSeconds;
        }
        return pulseCount > 0
            ? [Object.freeze({ type: "damage", damage: pulseCount * this.damagePerPulse, sourceId: this.sourceId })]
            : [];
    }

    finish() {
        super.finish();
        this.secondsUntilNextPulse = this.pulseSeconds;
    }

    snapshotRuntime() {
        return Object.freeze({ secondsUntilNextPulse: this.secondsUntilNextPulse });
    }

    restoreRuntime(runtime) {
        this.secondsUntilNextPulse = Math.min(
            this.pulseSeconds,
            requirePositive(runtime?.secondsUntilNextPulse, `${this.id}.secondsUntilNextPulse`)
        );
    }

    resetRuntime() {
        this.secondsUntilNextPulse = this.pulseSeconds;
    }
}
