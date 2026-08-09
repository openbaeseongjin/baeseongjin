import { Vector2 } from "../../game-kit/index.js";
import { closestPointOnPolygon, pointInPolygon } from "../world/PolygonGeometry.js";

export class PlayerPhysics {
    constructor(config) {
        this.config = config;
        this.position = new Vector2(120, 500);
        this.velocity = new Vector2();
        this.isGrounded = false;
    }

    reset(position = { x: 120, y: 500 }) {
        this.position.set(position.x, position.y);
        this.velocity.set(0, 0);
        this.isGrounded = false;
    }

    step(dt, input, surfaces, rope) {
        if (rope.isAttached) {
            this.velocity.x += input.horizontal * this.config.airAcceleration * dt;
        } else {
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
        const radius = this.config.radius;
        this.isGrounded = false;
        for (let pass = 0; pass < 3; pass += 1) {
            let resolved = false;
            for (const surface of surfaces) {
                if (
                    this.position.x + radius < surface.x ||
                    this.position.x - radius > surface.x + surface.width ||
                    this.position.y + radius < surface.y ||
                    this.position.y - radius > surface.y + surface.height
                ) {
                    continue;
                }
                if (surface.oneWay && (this.velocity.y < 0 || previousPosition.y + radius > surface.topY + 10)) {
                    continue;
                }

                const closest = closestPointOnPolygon(this.position, surface.vertices);
                const inside = pointInPolygon(this.position, surface.vertices);
                let normalX = this.position.x - closest.x;
                let normalY = this.position.y - closest.y;
                const distance = Math.hypot(normalX, normalY);
                if (!inside && distance >= radius) continue;

                if (distance > 0.0001) {
                    const direction = inside ? -1 / distance : 1 / distance;
                    normalX *= direction;
                    normalY *= direction;
                } else {
                    normalX = 0;
                    normalY = -1;
                }
                const penetration = inside ? radius + distance : radius - distance;
                this.position.x += normalX * penetration;
                this.position.y += normalY * penetration;
                const inwardSpeed = this.velocity.x * normalX + this.velocity.y * normalY;
                if (inwardSpeed < 0) {
                    this.velocity.x -= normalX * inwardSpeed;
                    this.velocity.y -= normalY * inwardSpeed;
                }
                if (normalY < -0.55) this.isGrounded = true;
                resolved = true;
            }
            if (!resolved) break;
        }
    }
}
