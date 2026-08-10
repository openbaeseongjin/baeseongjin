import { Vector2 } from "../../game-kit/index.js";

export class FixedLengthRope {
    constructor(config) {
        this.config = config;
        this.anchor = null;
        this.length = 0;
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
        this.length = distance;
        this.currentLength = distance;
        this.tension = 0;
        return true;
    }

    detach() {
        this.anchor = null;
        this.length = 0;
        this.currentLength = 0;
        this.tension = 0;
    }

    apply(position, velocity, dt) {
        if (!this.anchor) return;
        const towardAnchor = this.anchor.clone().subtract(position);
        const distance = towardAnchor.length();
        if (distance <= 0) return;
        towardAnchor.scale(1 / distance);

        position.set(this.anchor.x - towardAnchor.x * this.length, this.anchor.y - towardAnchor.y * this.length);
        const radialVelocity = velocity.dot(towardAnchor);
        velocity.add(towardAnchor.clone().scale(-radialVelocity));
        this.currentLength = this.length;
        this.tension = dt > 0 ? Math.abs(radialVelocity) / dt : 0;
    }
}
