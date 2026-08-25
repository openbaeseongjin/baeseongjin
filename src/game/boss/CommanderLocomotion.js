export class CommanderLocomotion {
    constructor({ body, acceleration, deceleration, floorBounds, bodyWidth }) {
        this.body = body;
        this.acceleration = acceleration;
        this.deceleration = deceleration;
        this.floorBounds = floorBounds;
        this.bodyWidth = bodyWidth;
        this.distance = 0;
    }

    advanceToward(targetX, dt, maxSpeed, stopDistance = 0, floorBounds = this.floorBounds) {
        const delta = targetX - this.body.position.x;
        const desiredVelocity = Math.abs(delta) <= stopDistance ? 0 : Math.sign(delta) * maxSpeed;
        const rate =
            desiredVelocity === 0 || Math.sign(desiredVelocity) !== Math.sign(this.body.velocity.x)
                ? this.deceleration
                : this.acceleration;
        const velocityDelta = Math.max(-rate * dt, Math.min(rate * dt, desiredVelocity - this.body.velocity.x));
        this.body.applyImpulse({ x: velocityDelta, y: 0 });
        const previousX = this.body.position.x;
        this.body.integratePhysics(dt);
        const halfWidth = this.bodyWidth * 0.5;
        const minimumX = floorBounds.x + halfWidth;
        const maximumX = floorBounds.x + floorBounds.width - halfWidth;
        if (this.body.position.x < minimumX || this.body.position.x > maximumX) {
            this.body.setPhysicsPosition({
                x: Math.max(minimumX, Math.min(maximumX, this.body.position.x)),
                y: this.body.position.y
            });
            this.body.setPhysicsVelocity({ x: 0, y: 0 });
        }
        this.distance += Math.abs(this.body.position.x - previousX);
        return this.snapshot();
    }

    moveAtVelocity(velocityX, dt, floorBounds = this.floorBounds) {
        const desiredDelta = velocityX - this.body.velocity.x;
        this.body.applyImpulse({ x: desiredDelta, y: 0 });
        return this.advanceToward(
            this.body.position.x + Math.sign(velocityX) * floorBounds.width,
            dt,
            Math.abs(velocityX),
            0,
            floorBounds
        );
    }

    stop() {
        this.body.stopPhysics();
        return this.snapshot();
    }

    snapshot() {
        return Object.freeze({ distance: this.distance, body: this.body.snapshot() });
    }

    restore(snapshot) {
        this.distance = snapshot?.distance ?? 0;
        this.body.restore(snapshot.body);
        return this.snapshot();
    }
}
