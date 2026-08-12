import { Vector2 } from "../../game-kit/index.js";
import { assertCollider } from "./colliders/Collider.js";
import { CircleCollider } from "./colliders/CircleCollider.js";

export class PlayerPhysics {
    constructor(config, { collider = new CircleCollider({ radius: config.radius }) } = {}) {
        this.config = config;
        this.collider = assertCollider(collider);
        this.position = new Vector2(120, 500);
        this.velocity = new Vector2();
        this.isGrounded = false;
    }

    reset(position = { x: 120, y: 500 }) {
        this.position.set(position.x, position.y);
        this.velocity.set(0, 0);
        this.isGrounded = false;
    }

    addImpulse(direction, magnitude) {
        this.velocity.x += direction.x * magnitude;
        this.velocity.y += direction.y * magnitude;
    }

    step(dt, input, surfaces, rope) {
        if (!rope.isAttached) {
            const acceleration = this.isGrounded ? this.config.groundAcceleration : this.config.airAcceleration;
            this.velocity.x += input.horizontal * acceleration * dt;
            if (input.horizontal === 0 && this.isGrounded) {
                this.velocity.x *= Math.exp(-this.config.groundDrag * dt);
            }
            this.velocity.x = Math.max(
                -this.config.maxHorizontalSpeed,
                Math.min(this.config.maxHorizontalSpeed, this.velocity.x)
            );
        }

        if (this.isGrounded && input.vertical < 0) {
            this.velocity.y = -this.config.jumpSpeed;
            this.isGrounded = false;
        }

        this.velocity.y += this.config.gravity * dt;
        rope.apply(this.position, this.velocity, dt);

        const previousPosition = this.position.clone();
        this.position.add(this.velocity.clone().scale(dt));
        this.resolveSurfaces(surfaces, previousPosition);
    }

    resolveSurfaces(surfaces, previousPosition) {
        this.isGrounded = this.collider.resolveSurfaces({
            position: this.position,
            velocity: this.velocity,
            surfaces,
            previousPosition
        }).isGrounded;
    }
}
