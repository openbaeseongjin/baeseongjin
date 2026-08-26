import { isGravitySupportingContactNormal } from "../physics/colliders/Collider.js";

export const CAPTURED_SLAM_MOTION = Object.freeze({
    ACTIVE_SECONDS: 0.75,
    DOWNWARD_SPEED_RATIO: 1.5,
    REBOUND_SPEED_RATIO: 1.25
});

function positive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive and finite`);
    return value;
}

export class CapturedSlamMotionState {
    constructor({
        activeSeconds = CAPTURED_SLAM_MOTION.ACTIVE_SECONDS,
        downwardSpeedRatio = CAPTURED_SLAM_MOTION.DOWNWARD_SPEED_RATIO,
        reboundSpeedRatio = CAPTURED_SLAM_MOTION.REBOUND_SPEED_RATIO
    } = {}) {
        this.activeSeconds = positive(activeSeconds, "captured slam activeSeconds");
        this.downwardSpeedRatio = positive(downwardSpeedRatio, "captured slam downwardSpeedRatio");
        this.reboundSpeedRatio = positive(reboundSpeedRatio, "captured slam reboundSpeedRatio");
        this.reset();
    }

    get active() {
        return this.remainingSeconds > 0;
    }

    begin(baseSpeed) {
        const speed = positive(baseSpeed, "captured slam baseSpeed");
        this.remainingSeconds = this.activeSeconds;
        this.reboundSpeed = speed * this.reboundSpeedRatio;
        return Object.freeze({ downwardSpeed: speed * this.downwardSpeedRatio });
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("captured slam dt must be finite and non-negative");
        this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);
        if (!this.active) this.reboundSpeed = 0;
        return this.active;
    }

    resolveSurfaceCollision({ impactVelocity, collisionNormals = Object.freeze([]) } = {}) {
        if (
            !this.active ||
            !Number.isFinite(impactVelocity?.y) ||
            impactVelocity.y <= 0 ||
            !collisionNormals.some((normal) => isGravitySupportingContactNormal(normal))
        ) {
            return null;
        }
        const reboundSpeed = this.reboundSpeed;
        this.reset();
        return Object.freeze({ reboundVelocityY: -reboundSpeed });
    }

    reset() {
        const wasActive = this.active;
        this.remainingSeconds = 0;
        this.reboundSpeed = 0;
        return wasActive;
    }
}
