import { Vector2 } from "../../game-kit/index.js";
import { rotateVector } from "../physics/AngularMotion.js";
import { hookReach } from "./RopeLauncher.js";

const POSITION_ITERATIONS = 12;

function finiteVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return value;
}

export class FixedLengthRope {
    constructor(config) {
        this.config = config;
        this.anchor = null;
        this.attachmentOffset = null;
        this.length = 0;
        this.currentLength = 0;
        this.tension = 0;
    }

    get isAttached() {
        return this.anchor !== null;
    }

    attach(playerPosition, anchor, { angle = 0, attachmentOffset = null } = {}) {
        finiteVector(playerPosition, "playerPosition");
        finiteVector(anchor, "anchor");
        if (!Number.isFinite(angle)) throw new Error("rope attachment angle must be finite");
        const selectedOffset = attachmentOffset
            ? finiteVector(attachmentOffset, "attachmentOffset")
            : {
                  x: Math.abs(this.config.handOffset.x) * (anchor.x < playerPosition.x ? -1 : 1),
                  y: this.config.handOffset.y
              };
        const worldOffset = rotateVector(selectedOffset, angle);
        const handPosition = {
            x: playerPosition.x + worldOffset.x,
            y: playerPosition.y + worldOffset.y
        };
        const distance = Math.hypot(handPosition.x - anchor.x, handPosition.y - anchor.y);
        if (distance <= 0 || distance > hookReach(this.config)) return false;
        this.anchor = new Vector2(anchor.x, anchor.y);
        this.attachmentOffset = new Vector2(selectedOffset.x, selectedOffset.y);
        this.length = distance;
        this.currentLength = distance;
        this.tension = 0;
        return true;
    }

    detach() {
        this.anchor = null;
        this.attachmentOffset = null;
        this.length = 0;
        this.currentLength = 0;
        this.tension = 0;
    }

    apply(position, velocity, angularMotion, dt) {
        if (!this.anchor) return;
        if (!angularMotion || !this.attachmentOffset) {
            throw new Error("attached rope requires angular motion and an attachment offset");
        }
        let constraint = this.#constraint(position, angularMotion);
        for (let iteration = 0; iteration < POSITION_ITERATIONS && constraint; iteration += 1) {
            const error = constraint.distance - this.length;
            if (Math.abs(error) <= 0.0001) break;
            const magnitude = -error / constraint.inverseEffectiveMass;
            const correction = {
                x: constraint.normal.x * magnitude,
                y: constraint.normal.y * magnitude
            };
            position.x += correction.x;
            position.y += correction.y;
            angularMotion.applyPositionCorrectionAtWorldOffset(correction, constraint.worldOffset);
            constraint = this.#constraint(position, angularMotion);
        }
        if (!constraint) return;
        const pointVelocity = angularMotion.pointVelocity(velocity, this.attachmentOffset);
        const radialVelocity = pointVelocity.x * constraint.normal.x + pointVelocity.y * constraint.normal.y;
        const impulseMagnitude = -radialVelocity / constraint.inverseEffectiveMass;
        const impulse = {
            x: constraint.normal.x * impulseMagnitude,
            y: constraint.normal.y * impulseMagnitude
        };
        velocity.x += impulse.x;
        velocity.y += impulse.y;
        angularMotion.applyImpulseAtWorldOffset(impulse, constraint.worldOffset);
        this.currentLength = this.#constraint(position, angularMotion)?.distance ?? this.length;
        this.tension = dt > 0 ? Math.abs(impulseMagnitude) / dt : 0;
    }

    #constraint(position, angularMotion) {
        const worldOffset = angularMotion.worldOffset(this.attachmentOffset);
        const deltaX = position.x + worldOffset.x - this.anchor.x;
        const deltaY = position.y + worldOffset.y - this.anchor.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance <= 0.000001) return null;
        const normal = { x: deltaX / distance, y: deltaY / distance };
        const angularLever = worldOffset.x * normal.y - worldOffset.y * normal.x;
        return {
            distance,
            normal,
            worldOffset,
            inverseEffectiveMass: 1 + angularLever * angularLever * angularMotion.inverseInertia
        };
    }
}
