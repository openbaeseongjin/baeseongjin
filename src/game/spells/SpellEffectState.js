const DEFAULT_EFFECT = Object.freeze({
    mobilityRemaining: 0,
    mobilityMultiplier: 1,
    lowGravityRemaining: 0,
    gravityScale: 1,
    flightRemaining: 0,
    flightAcceleration: 0,
    flightMaximumSpeed: 0
});

export class SpellEffectState {
    constructor() {
        this.reset();
    }
    activate(effect) {
        if (effect.kind === "mobility") {
            this.mobilityRemaining = effect.durationSeconds;
            this.mobilityMultiplier = effect.multiplier;
        }
        if (effect.kind === "low-gravity") {
            this.lowGravityRemaining = effect.durationSeconds;
            this.gravityScaleValue = effect.gravityScale;
        }
        if (effect.kind === "thruster-flight") {
            this.flightRemaining = effect.durationSeconds;
            this.flightAcceleration = effect.accelerationPerSecond;
            this.flightMaximumSpeed = effect.maximumDirectionalSpeed;
        }
    }
    movementMultiplier() {
        return this.mobilityRemaining > 0 ? this.mobilityMultiplier : 1;
    }
    gravityScale() {
        return this.lowGravityRemaining > 0 ? this.gravityScaleValue : 1;
    }
    applyFlight(player, direction, dt) {
        if (this.flightRemaining <= 0) return false;
        const velocity = player.physics.physicsStepVelocity();
        const directionalSpeed = velocity.x * direction.x + velocity.y * direction.y;
        const available = Math.max(0, this.flightMaximumSpeed - directionalSpeed);
        const impulse = Math.min(available, this.flightAcceleration * dt);
        if (impulse > 0) player.physics.applyImpulse(direction, impulse);
        return impulse > 0;
    }
    advance(dt) {
        this.mobilityRemaining = Math.max(0, this.mobilityRemaining - dt);
        this.lowGravityRemaining = Math.max(0, this.lowGravityRemaining - dt);
        this.flightRemaining = Math.max(0, this.flightRemaining - dt);
    }
    snapshot() {
        return Object.freeze({
            mobilityRemaining: this.mobilityRemaining,
            mobilityMultiplier: this.mobilityMultiplier,
            lowGravityRemaining: this.lowGravityRemaining,
            gravityScale: this.gravityScaleValue,
            flightRemaining: this.flightRemaining,
            flightAcceleration: this.flightAcceleration,
            flightMaximumSpeed: this.flightMaximumSpeed
        });
    }
    restore(snapshot = DEFAULT_EFFECT) {
        for (const key of [
            "mobilityRemaining",
            "mobilityMultiplier",
            "lowGravityRemaining",
            "gravityScale",
            "flightRemaining",
            "flightAcceleration",
            "flightMaximumSpeed"
        ])
            if (!Number.isFinite(snapshot[key]) || snapshot[key] < 0)
                throw new Error(`invalid spell effect state: ${key}`);
        this.mobilityRemaining = snapshot.mobilityRemaining;
        this.mobilityMultiplier = snapshot.mobilityMultiplier;
        this.lowGravityRemaining = snapshot.lowGravityRemaining;
        this.gravityScaleValue = snapshot.gravityScale;
        this.flightRemaining = snapshot.flightRemaining;
        this.flightAcceleration = snapshot.flightAcceleration;
        this.flightMaximumSpeed = snapshot.flightMaximumSpeed;
    }
    reset() {
        this.restore(DEFAULT_EFFECT);
    }
}
