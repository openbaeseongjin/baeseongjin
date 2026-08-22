import { Vector2 } from "../../game-kit/index.js";
import { PHYSICS, PHYSICS_VECTOR_LABEL } from "./PhysicsDefinition.js";

export function requireFinitePhysicsVector(vector, label) {
    if (!vector || !Number.isFinite(vector.x) || !Number.isFinite(vector.y)) {
        throw new Error(`${label} must contain finite x and y values`);
    }
    return vector;
}

function physicsVector(vector, label) {
    const finite = requireFinitePhysicsVector(vector, label);
    return finite instanceof Vector2 ? finite : new Vector2(finite.x, finite.y);
}

export const withPhysics = (Base) =>
    class extends Base {
        initializePhysics({ position, velocity = new Vector2(), acceleration = new Vector2() }) {
            this.position = physicsVector(position, PHYSICS_VECTOR_LABEL.POSITION);
            this.velocity = physicsVector(velocity, PHYSICS_VECTOR_LABEL.VELOCITY);
            this.acceleration = physicsVector(acceleration, PHYSICS_VECTOR_LABEL.ACCELERATION);
        }

        setPhysicsPosition(position) {
            const finitePosition = requireFinitePhysicsVector(position, PHYSICS_VECTOR_LABEL.POSITION);
            this.position.set(finitePosition.x, finitePosition.y);
            return this.position;
        }

        setPhysicsVelocity(velocity) {
            const finiteVelocity = requireFinitePhysicsVector(velocity, PHYSICS_VECTOR_LABEL.VELOCITY);
            this.velocity.set(finiteVelocity.x, finiteVelocity.y);
            this.clearPhysicsAcceleration();
            return this.velocity;
        }

        stopPhysics() {
            return this.setPhysicsVelocity(PHYSICS.ZERO_VECTOR);
        }

        applyImpulse(impulse, scale = PHYSICS.DEFAULT_IMPULSE_SCALE) {
            const finiteImpulse = requireFinitePhysicsVector(impulse, PHYSICS_VECTOR_LABEL.IMPULSE);
            if (!Number.isFinite(scale)) throw new Error("physics impulse scale must be finite");
            this.acceleration.x += finiteImpulse.x * scale;
            this.acceleration.y += finiteImpulse.y * scale;
            return this.acceleration;
        }

        applyAcceleration(acceleration, dt) {
            if (!Number.isFinite(dt) || dt < PHYSICS.MINIMUM_DT) {
                throw new Error("physics dt must be finite and non-negative");
            }
            const finiteAcceleration = requireFinitePhysicsVector(acceleration, PHYSICS_VECTOR_LABEL.ACCELERATION);
            this.acceleration.x += finiteAcceleration.x * dt;
            this.acceleration.y += finiteAcceleration.y * dt;
            return this.acceleration;
        }

        physicsStepVelocity() {
            return this.velocity.clone().add(this.acceleration);
        }

        physicsDestination(dt) {
            if (!Number.isFinite(dt) || dt < PHYSICS.MINIMUM_DT) {
                throw new Error("physics dt must be finite and non-negative");
            }
            return this.position.clone().add(this.physicsStepVelocity().scale(dt));
        }

        integratePhysicsAcceleration() {
            this.velocity.add(this.acceleration);
            this.acceleration.set(PHYSICS.ZERO_VECTOR.x, PHYSICS.ZERO_VECTOR.y);
            return this.velocity;
        }

        integratePhysics(dt) {
            this.integratePhysicsAcceleration();
            const destination = this.physicsDestination(dt);
            this.position.set(destination.x, destination.y);
            return this.position;
        }

        clearPhysicsAcceleration() {
            this.acceleration.set(PHYSICS.ZERO_VECTOR.x, PHYSICS.ZERO_VECTOR.y);
        }

        applyPositionCorrection(correction) {
            const finiteCorrection = requireFinitePhysicsVector(correction, PHYSICS_VECTOR_LABEL.POSITION);
            this.position.x += finiteCorrection.x;
            this.position.y += finiteCorrection.y;
            return this.position;
        }
    };

export const withGravityPhysics = (Base) =>
    class extends Base {
        applyGravity(dt, gravity, scale = PHYSICS.DEFAULT_GRAVITY_SCALE) {
            this.applyAcceleration({ x: PHYSICS.ZERO_VECTOR.x, y: gravity * scale }, dt);
        }
    };
