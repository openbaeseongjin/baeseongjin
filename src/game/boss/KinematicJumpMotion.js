import { Vector2 } from "../../game-kit/index.js";
import { withGravityPhysics, withPhysics, requireFinitePhysicsVector } from "../physics/PhysicsMixin.js";

export const KINEMATIC_JUMP_PHASE = Object.freeze({ GROUNDED: "grounded", JUMP: "jump", FALL: "fall" });

function requirePositiveFinite(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive finite number`);
    return value;
}

function requireNonNegativeFinite(value, label) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a non-negative finite number`);
    return value;
}

function immutableVector(vector) {
    return Object.freeze({ x: vector.x, y: vector.y });
}

function requireJumpPhases(phases) {
    for (const key of Object.keys(KINEMATIC_JUMP_PHASE)) {
        if (typeof phases?.[key] !== "string" || phases[key].length === 0) {
            throw new Error(`KinematicJumpMotion phases.${key} must be a non-empty string`);
        }
    }
    return Object.freeze({
        GROUNDED: phases.GROUNDED,
        JUMP: phases.JUMP,
        FALL: phases.FALL
    });
}

export class KinematicJumpMotion extends withGravityPhysics(withPhysics(class {})) {
    constructor({ position, gravity, phases = KINEMATIC_JUMP_PHASE }) {
        super();
        const initialPosition = requireFinitePhysicsVector(position, "KinematicJumpMotion position");
        this.gravity = requirePositiveFinite(gravity, "KinematicJumpMotion gravity");
        this.phases = requireJumpPhases(phases);
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
        if (!this._active) return this.phases.GROUNDED;
        return this.velocity.y < 0 ? this.phases.JUMP : this.phases.FALL;
    }

    begin({ position, target, durationSeconds }) {
        const launchPosition = requireFinitePhysicsVector(position, "KinematicJumpMotion launch position");
        const landingTarget = requireFinitePhysicsVector(target, "KinematicJumpMotion landing target");
        const duration = requirePositiveFinite(durationSeconds, "KinematicJumpMotion durationSeconds");
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

    beginDrop({ position, target }) {
        const launchPosition = requireFinitePhysicsVector(position, "KinematicJumpMotion drop position");
        const landingTarget = requireFinitePhysicsVector(target, "KinematicJumpMotion drop target");
        const verticalDrop = landingTarget.y - launchPosition.y;
        if (verticalDrop <= 0) throw new RangeError("KinematicJumpMotion drop target must be below its position");
        const durationSeconds = Math.sqrt((2 * verticalDrop) / this.gravity);
        this.begin({ position: launchPosition, target: landingTarget, durationSeconds });
        this.setPhysicsVelocity({ x: this.velocity.x, y: 0 });
        return this;
    }

    advance(dt) {
        requireNonNegativeFinite(dt, "KinematicJumpMotion dt");
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
        if (!snapshot || typeof snapshot.active !== "boolean")
            throw new Error("KinematicJumpMotion snapshot requires active");
        const position = requireFinitePhysicsVector(snapshot.position, "KinematicJumpMotion snapshot position");
        const velocity = requireFinitePhysicsVector(snapshot.velocity, "KinematicJumpMotion snapshot velocity");
        const acceleration = requireFinitePhysicsVector(
            snapshot.acceleration,
            "KinematicJumpMotion snapshot acceleration"
        );
        const elapsedSeconds = requireNonNegativeFinite(snapshot.elapsedSeconds, "KinematicJumpMotion elapsedSeconds");
        const durationSeconds = requireNonNegativeFinite(
            snapshot.durationSeconds,
            "KinematicJumpMotion durationSeconds"
        );
        if (snapshot.active) {
            requireFinitePhysicsVector(snapshot.target, "KinematicJumpMotion snapshot target");
            requirePositiveFinite(durationSeconds, "KinematicJumpMotion snapshot durationSeconds");
            if (elapsedSeconds >= durationSeconds) throw new Error("active jump snapshot must precede its duration");
        } else if (snapshot.target !== null || elapsedSeconds !== 0 || durationSeconds !== 0) {
            throw new Error("inactive jump snapshot must not retain an active jump");
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
