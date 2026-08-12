const FULL_TURN = Math.PI * 2;

function assertFinite(value, label) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    return value;
}

export function normalizeAngle(angle) {
    assertFinite(angle, "angle");
    return ((((angle + Math.PI) % FULL_TURN) + FULL_TURN) % FULL_TURN) - Math.PI;
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
        if (!Number.isFinite(inertia) || inertia <= 0) throw new Error("AngularMotion requires positive inertia");
        if (!Number.isFinite(maxSpeed) || maxSpeed <= 0) throw new Error("AngularMotion requires positive maxSpeed");
        for (const [label, value] of Object.entries({ airDamping, uprightStrength, uprightDamping })) {
            if (!Number.isFinite(value) || value < 0) throw new Error(`AngularMotion requires non-negative ${label}`);
        }
        this.inverseInertia = 1 / inertia;
        this.maxSpeed = maxSpeed;
        this.airDamping = airDamping;
        this.uprightStrength = uprightStrength;
        this.uprightDamping = uprightDamping;
        this.angle = 0;
        this.velocity = 0;
    }

    reset() {
        this.angle = 0;
        this.velocity = 0;
    }

    set(angle, velocity) {
        this.angle = normalizeAngle(angle);
        this.velocity = this.#clampSpeed(assertFinite(velocity, "angular velocity"));
    }

    worldOffset(localOffset) {
        return rotateVector(localOffset, this.angle);
    }

    pointVelocity(linearVelocity, localOffset) {
        const offset = this.worldOffset(localOffset);
        return {
            x: linearVelocity.x - this.velocity * offset.y,
            y: linearVelocity.y + this.velocity * offset.x
        };
    }

    tangentialVelocity(localOffset) {
        const offset = this.worldOffset(localOffset);
        return { x: -this.velocity * offset.y, y: this.velocity * offset.x };
    }

    applyImpulseAtWorldOffset(impulse, worldOffset) {
        this.velocity = this.#clampSpeed(
            this.velocity + (worldOffset.x * impulse.y - worldOffset.y * impulse.x) * this.inverseInertia
        );
    }

    applyPositionCorrectionAtWorldOffset(correction, worldOffset) {
        this.angle = normalizeAngle(
            this.angle + (worldOffset.x * correction.y - worldOffset.y * correction.x) * this.inverseInertia
        );
    }

    applyForces(dt, isGrounded) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("AngularMotion dt must be non-negative");
        if (isGrounded) {
            const acceleration = -this.uprightStrength * Math.sin(this.angle) - this.uprightDamping * this.velocity;
            this.velocity = this.#clampSpeed(this.velocity + acceleration * dt);
        } else {
            this.velocity *= Math.exp(-this.airDamping * dt);
        }
    }

    integrate(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("AngularMotion dt must be non-negative");
        this.angle = normalizeAngle(this.angle + this.velocity * dt);
    }

    #clampSpeed(value) {
        return Math.max(-this.maxSpeed, Math.min(this.maxSpeed, value));
    }
}
