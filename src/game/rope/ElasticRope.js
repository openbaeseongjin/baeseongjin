import { Vector2 } from "../../game-kit/index.js";

export class ElasticRope {
    constructor(config) {
        this.config = config;
        this.anchor = null;
        this.restLength = 0;
        this.currentLength = 0;
        this.tension = 0;
    }

    get isAttached() {
        return this.anchor !== null;
    }

    attach(playerPosition, anchor) {
        const distance = playerPosition.distanceTo(anchor);
        if (distance > this.config.maxAttachDistance || distance <= 0) return false;
        this.anchor = new Vector2(anchor.x, anchor.y);
        this.currentLength = distance;
        this.restLength = Math.max(this.config.minimumRestLength, distance * this.config.initialRestRatio);
        this.tension = 0;
        return true;
    }

    detach() {
        this.anchor = null;
        this.currentLength = 0;
        this.restLength = 0;
        this.tension = 0;
    }

    apply(position, velocity, dt) {
        if (!this.anchor) return;
        this.restLength = Math.max(this.config.minimumRestLength, this.restLength - this.config.retractSpeed * dt);
        const towardAnchor = this.anchor.clone().subtract(position);
        const distance = towardAnchor.length();
        if (distance <= 0) return;
        towardAnchor.scale(1 / distance);
        this.currentLength = distance;
        const stretch = Math.max(0, distance - this.restLength);
        const radialVelocity = velocity.dot(towardAnchor);
        const acceleration = stretch * this.config.springStrength - radialVelocity * this.config.radialDamping;
        this.tension = Math.max(0, acceleration);
        velocity.add(towardAnchor.clone().scale(this.tension * dt));

        const maximumLength = this.restLength * this.config.maximumStretchRatio;
        if (distance > maximumLength) {
            position.set(
                this.anchor.x - towardAnchor.x * maximumLength,
                this.anchor.y - towardAnchor.y * maximumLength
            );
            const escapingSpeed = velocity.dot(towardAnchor) * -1;
            if (escapingSpeed > 0) velocity.add(towardAnchor.clone().scale(escapingSpeed));
            this.currentLength = maximumLength;
        }
    }
}
