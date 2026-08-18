import { Vector2 } from "../../game-kit/index.js";
import { AngularMotion } from "./AngularMotion.js";
import { assertCollider } from "./colliders/Collider.js";
import { CircleCollider } from "./colliders/CircleCollider.js";

export class PlayerPhysics {
    constructor(config, { collider = new CircleCollider({ radius: config.radius }) } = {}) {
        this.config = config;
        this.collider = assertCollider(collider);
        this.position = new Vector2(120, 500);
        this.velocity = new Vector2();
        this.angularMotion = new AngularMotion({
            inertia: config.angularInertia,
            maxSpeed: config.maxAngularSpeed,
            airDamping: config.airAngularDamping,
            uprightStrength: config.groundUprightStrength,
            uprightDamping: config.groundUprightDamping
        });
        this.isGrounded = false;
        this.lastSurfaceCollisionNormals = Object.freeze([]);
        this.lastSurfaceCollisionIncomingVelocity = Object.freeze({ x: 0, y: 0 });
    }

    get angle() {
        return this.angularMotion.angle;
    }

    get angularVelocity() {
        return this.angularMotion.velocity;
    }

    reset(position = { x: 120, y: 500 }) {
        this.position.set(position.x, position.y);
        this.velocity.set(0, 0);
        this.angularMotion.reset();
        this.isGrounded = false;
        this.lastSurfaceCollisionNormals = Object.freeze([]);
        this.lastSurfaceCollisionIncomingVelocity = Object.freeze({ x: 0, y: 0 });
    }

    setAngularState(angle, angularVelocity) {
        this.angularMotion.set(angle, angularVelocity);
    }

    applyAngularForces(dt, isGrounded) {
        this.angularMotion.applyForces(dt, isGrounded);
    }

    integrateAngularMotion(dt) {
        this.angularMotion.integrate(dt);
    }

    addImpulse(direction, magnitude) {
        this.velocity.x += direction.x * magnitude;
        this.velocity.y += direction.y * magnitude;
    }

    addImpulseAtLocalPoint(direction, magnitude, localOffset) {
        const impulse = { x: direction.x * magnitude, y: direction.y * magnitude };
        this.velocity.x += impulse.x;
        this.velocity.y += impulse.y;
        this.angularMotion.applyImpulseAtWorldOffset(impulse, this.angularMotion.worldOffset(localOffset));
    }

    step(dt, input, surfaces, rope) {
        const wasGrounded = this.isGrounded;
        if (!rope.isAttached) {
            const acceleration = this.isGrounded ? this.config.groundAcceleration : this.config.airAcceleration;
            this.velocity.x += input.horizontal * acceleration * dt;
            if (input.horizontal === 0 && this.isGrounded && !input.preserveActionImpulse) {
                this.velocity.x *= Math.exp(-this.config.groundDrag * dt);
            }
            if (!input.preserveActionImpulse) {
                this.velocity.x = Math.max(
                    -this.config.maxHorizontalSpeed,
                    Math.min(this.config.maxHorizontalSpeed, this.velocity.x)
                );
            }
        }

        if (this.isGrounded && input.vertical < 0) {
            this.velocity.y = -this.config.jumpSpeed;
            this.isGrounded = false;
        }

        const gravityScale = Number.isFinite(input.gravityScale) ? Math.max(0, input.gravityScale) : 1;
        this.velocity.y += this.config.gravity * gravityScale * dt;
        this.applyAngularForces(dt, this.isGrounded);
        rope.apply(this.position, this.velocity, this.angularMotion, dt);

        const previousPosition = this.position.clone();
        this.position.add(this.velocity.clone().scale(dt));
        this.integrateAngularMotion(dt);
        const impactVelocity = this.velocity.clone();
        this.resolveSurfaces(surfaces, previousPosition);
        this.lastSurfaceCollisionIncomingVelocity = Object.freeze({ x: impactVelocity.x, y: impactVelocity.y });
        rope.apply(this.position, this.velocity, this.angularMotion, dt);
        const landed = !wasGrounded && this.isGrounded;
        return Object.freeze({
            landed,
            impactSpeed: landed ? Math.max(0, impactVelocity.y) : 0,
            impactVelocity: landed
                ? Object.freeze({ x: impactVelocity.x, y: impactVelocity.y })
                : Object.freeze({ x: 0, y: 0 })
        });
    }

    resolveSurfaces(surfaces, previousPosition) {
        const resolution = this.collider.resolveSurfaces({
            position: this.position,
            velocity: this.velocity,
            surfaces,
            previousPosition
        });
        this.isGrounded = resolution.isGrounded;
        this.lastSurfaceCollisionNormals = resolution.collisionNormals ?? Object.freeze([]);
        return resolution;
    }
}
