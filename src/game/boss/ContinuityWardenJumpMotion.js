import { Vector2 } from "../../game-kit/index.js";
import { withGravityPhysics, withPhysics, requireFinitePhysicsVector } from "../physics/PhysicsMixin.js";
import { CONTINUITY_WARDEN_LOCOMOTION_STATE } from "./ContinuityWardenDefinition.js";

function requirePositiveFinite(value, label) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${label} must be a positive finite number`);
    }
    return value;
}

function requireNonNegativeFinite(value, label) {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`${label} must be a non-negative finite number`);
    }
    return value;
}

function immutableVector(vector) {
    return Object.freeze({ x: vector.x, y: vector.y });
}

export class ContinuityWardenJumpMotion extends withGravityPhysics(withPhysics(class {})) {
    constructor({ position, gravity }) {
        super();
        const initialPosition = requireFinitePhysicsVector(position, "ContinuityWardenJumpMotion position");
        this.gravity = requirePositiveFinite(gravity, "ContinuityWardenJumpMotion gravity");
        this.initializePhysics({ position: new Vector2(initialPosition.x, initialPosition.y) });
        this._active = false;
        this._target = null;
        this._elapsedSeconds = 0;
        this._durationSeconds = 0;
    }

    get active() {
        return this._active;
    }

    get phase() {
        if (!this._active) return CONTINUITY_WARDEN_LOCOMOTION_STATE.GROUNDED;
        return this.velocity.y < 0 ? CONTINUITY_WARDEN_LOCOMOTION_STATE.JUMP : CONTINUITY_WARDEN_LOCOMOTION_STATE.FALL;
    }

    begin({ position, target, durationSeconds }) {
        const launchPosition = requireFinitePhysicsVector(position, "ContinuityWardenJumpMotion launch position");
        const landingTarget = requireFinitePhysicsVector(target, "ContinuityWardenJumpMotion landing target");
        const duration = requirePositiveFinite(durationSeconds, "ContinuityWardenJumpMotion durationSeconds");
        const verticalDisplacement = landingTarget.y - launchPosition.y;

        this.setPhysicsPosition(launchPosition);
        this.setPhysicsVelocity({
            x: (landingTarget.x - launchPosition.x) / duration,
            y: (verticalDisplacement - 0.5 * this.gravity * duration * duration) / duration
        });
        this._target = immutableVector(landingTarget);
        this._elapsedSeconds = 0;
        this._durationSeconds = duration;
        this._active = true;
        return this;
    }

    advance(dt) {
        requireNonNegativeFinite(dt, "ContinuityWardenJumpMotion dt");
        if (!this._active || dt === 0) return this.position;

        const remainingSeconds = this._durationSeconds - this._elapsedSeconds;
        const stepSeconds = Math.min(dt, remainingSeconds);
        this.applyGravity(stepSeconds, this.gravity);
        this.integratePhysics(stepSeconds);
        this._elapsedSeconds += stepSeconds;

        if (this._elapsedSeconds >= this._durationSeconds) {
            this.setPhysicsPosition(this._target);
            this.stopPhysics();
            this.clearPhysicsAcceleration();
            this._active = false;
            this._target = null;
            this._elapsedSeconds = 0;
            this._durationSeconds = 0;
        }
        return this.position;
    }

    cancel(position) {
        this.setPhysicsPosition(position);
        this.stopPhysics();
        this.clearPhysicsAcceleration();
        this._active = false;
        this._target = null;
        this._elapsedSeconds = 0;
        this._durationSeconds = 0;
        return this.position;
    }

    snapshot() {
        return Object.freeze({
            active: this._active,
            phase: this.phase,
            position: immutableVector(this.position),
            velocity: immutableVector(this.velocity),
            acceleration: immutableVector(this.acceleration),
            target: this._target ? immutableVector(this._target) : null,
            elapsedSeconds: this._elapsedSeconds,
            durationSeconds: this._durationSeconds
        });
    }

    restore(snapshot) {
        if (!snapshot || typeof snapshot.active !== "boolean") {
            throw new Error("ContinuityWardenJumpMotion snapshot requires active");
        }
        const position = requireFinitePhysicsVector(snapshot.position, "ContinuityWardenJumpMotion snapshot position");
        const velocity = requireFinitePhysicsVector(snapshot.velocity, "ContinuityWardenJumpMotion snapshot velocity");
        const acceleration = requireFinitePhysicsVector(
            snapshot.acceleration,
            "ContinuityWardenJumpMotion snapshot acceleration"
        );
        const elapsedSeconds = requireNonNegativeFinite(
            snapshot.elapsedSeconds,
            "ContinuityWardenJumpMotion snapshot elapsedSeconds"
        );
        const durationSeconds = requireNonNegativeFinite(
            snapshot.durationSeconds,
            "ContinuityWardenJumpMotion snapshot durationSeconds"
        );

        if (snapshot.active) {
            requireFinitePhysicsVector(snapshot.target, "ContinuityWardenJumpMotion snapshot target");
            requirePositiveFinite(durationSeconds, "ContinuityWardenJumpMotion snapshot durationSeconds");
            if (elapsedSeconds >= durationSeconds) {
                throw new Error("active ContinuityWardenJumpMotion snapshot must precede its duration");
            }
        } else if (snapshot.target !== null || elapsedSeconds !== 0 || durationSeconds !== 0) {
            throw new Error("inactive ContinuityWardenJumpMotion snapshot must not retain an active jump");
        }

        this.setPhysicsPosition(position);
        this.setPhysicsVelocity(velocity);
        this.acceleration.set(acceleration.x, acceleration.y);
        this._active = snapshot.active;
        this._target = snapshot.active ? immutableVector(snapshot.target) : null;
        this._elapsedSeconds = elapsedSeconds;
        this._durationSeconds = durationSeconds;
        return this;
    }
}
