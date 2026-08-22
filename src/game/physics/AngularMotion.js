import { ANGULAR_PHYSICS } from "./AngularPhysicsDefinition.js";

function assertFinite(value, label) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    return value;
}

export function normalizeAngle(angle) {
    assertFinite(angle, "angle");
    return (
        ((((angle + ANGULAR_PHYSICS.HALF_TURN) % ANGULAR_PHYSICS.FULL_TURN) + ANGULAR_PHYSICS.FULL_TURN) %
            ANGULAR_PHYSICS.FULL_TURN) -
        ANGULAR_PHYSICS.HALF_TURN
    );
}

export function shortestAngleDelta(from, to) {
    return normalizeAngle(to - from);
}

export function rotateVector(vector, angle) {
    assertFinite(vector?.x, "vector.x");
    assertFinite(vector?.y, "vector.y");
    assertFinite(angle, "angle");
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return {
        x: vector.x * cosine - vector.y * sine,
        y: vector.x * sine + vector.y * cosine
    };
}

export class AngularMotion {
    constructor({ inertia, maxSpeed, airDamping, uprightStrength, uprightDamping }) {
        if (!Number.isFinite(inertia) || inertia <= ANGULAR_PHYSICS.ZERO)
            throw new Error("AngularMotion requires positive inertia");
        if (!Number.isFinite(maxSpeed) || maxSpeed <= ANGULAR_PHYSICS.ZERO)
            throw new Error("AngularMotion requires positive maxSpeed");
        for (const [label, value] of Object.entries({ airDamping, uprightStrength, uprightDamping })) {
            if (!Number.isFinite(value) || value < ANGULAR_PHYSICS.ZERO)
                throw new Error(`AngularMotion requires non-negative ${label}`);
        }
        this.inverseInertia = ANGULAR_PHYSICS.UNIT / inertia;
        this.maxSpeed = maxSpeed;
        this.airDamping = airDamping;
        this.uprightStrength = uprightStrength;
        this.uprightDamping = uprightDamping;
        this.angle = ANGULAR_PHYSICS.ZERO;
        this.velocity = ANGULAR_PHYSICS.ZERO;
        this.acceleration = ANGULAR_PHYSICS.ZERO;
        this.velocityRetention = ANGULAR_PHYSICS.UNIT;
    }

    reset() {
        this.angle = ANGULAR_PHYSICS.ZERO;
        this.velocity = ANGULAR_PHYSICS.ZERO;
        this.acceleration = ANGULAR_PHYSICS.ZERO;
        this.velocityRetention = ANGULAR_PHYSICS.UNIT;
    }

    set(angle, velocity) {
        this.angle = normalizeAngle(angle);
        this.velocity = this.#clampSpeed(assertFinite(velocity, "angular velocity"));
        this.acceleration = ANGULAR_PHYSICS.ZERO;
        this.velocityRetention = ANGULAR_PHYSICS.UNIT;
    }

    worldOffset(localOffset) {
        return rotateVector(localOffset, this.angle);
    }

    stepVelocity() {
        return this.#clampSpeed(this.velocity + this.acceleration) * this.velocityRetention;
    }

    pointVelocity(linearVelocity, localOffset) {
        const offset = this.worldOffset(localOffset);
        const angularVelocity = this.stepVelocity();
        return {
            x: linearVelocity.x - angularVelocity * offset.y,
            y: linearVelocity.y + angularVelocity * offset.x
        };
    }

    tangentialVelocity(localOffset) {
        const offset = this.worldOffset(localOffset);
        const angularVelocity = this.stepVelocity();
        return { x: -angularVelocity * offset.y, y: angularVelocity * offset.x };
    }

    applyImpulseAtWorldOffset(impulse, worldOffset) {
        this.acceleration += (worldOffset.x * impulse.y - worldOffset.y * impulse.x) * this.inverseInertia;
    }

    applyPositionCorrectionAtWorldOffset(correction, worldOffset) {
        this.angle = normalizeAngle(
            this.angle + (worldOffset.x * correction.y - worldOffset.y * correction.x) * this.inverseInertia
        );
    }

    applyForces(dt, isGrounded) {
        if (!Number.isFinite(dt) || dt < ANGULAR_PHYSICS.ZERO) throw new Error("AngularMotion dt must be non-negative");
        if (isGrounded) {
            const acceleration = -this.uprightStrength * Math.sin(this.angle) - this.uprightDamping * this.velocity;
            this.acceleration += acceleration * dt;
        } else {
            this.velocityRetention *= Math.exp(-this.airDamping * dt);
        }
    }

    integrate(dt) {
        if (!Number.isFinite(dt) || dt < ANGULAR_PHYSICS.ZERO) throw new Error("AngularMotion dt must be non-negative");
        this.velocity = this.stepVelocity();
        this.angle = normalizeAngle(this.angle + this.velocity * dt);
        this.acceleration = ANGULAR_PHYSICS.ZERO;
        this.velocityRetention = ANGULAR_PHYSICS.UNIT;
    }

    #clampSpeed(value) {
        return Math.max(-this.maxSpeed, Math.min(this.maxSpeed, value));
    }
}
