import { Vector2 } from "../../game-kit/index.js";
import { rotateVector } from "../physics/AngularMotion.js";
import { FIXED_LENGTH_ROPE } from "./FixedLengthRopeDefinition.js";
import { hookReach } from "./RopeLauncher.js";

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
        this.anchorOwnerId = null;
        this.anchorLocalOffset = null;
        this.attachmentOffset = null;
        this.length = FIXED_LENGTH_ROPE.ZERO;
        this.currentLength = FIXED_LENGTH_ROPE.ZERO;
        this.tension = FIXED_LENGTH_ROPE.ZERO;
    }

    get isAttached() {
        return this.anchor !== null;
    }

    attach(
        playerPosition,
        anchor,
        { angle = FIXED_LENGTH_ROPE.ZERO, attachmentOffset = null, anchorOwnerId = null, anchorLocalOffset = null } = {}
    ) {
        finiteVector(playerPosition, "playerPosition");
        finiteVector(anchor, "anchor");
        if (!Number.isFinite(angle)) throw new Error("rope attachment angle must be finite");
        if (anchorOwnerId !== null && (typeof anchorOwnerId !== "string" || !anchorOwnerId)) {
            throw new Error("anchorOwnerId must be null or a non-empty string");
        }
        if ((anchorOwnerId === null) !== (anchorLocalOffset === null)) {
            throw new Error("actor rope anchors require both owner ID and local offset");
        }
        const selectedOffset = attachmentOffset
            ? finiteVector(attachmentOffset, "attachmentOffset")
            : {
                  x:
                      Math.abs(this.config.handOffset.x) *
                      (anchor.x < playerPosition.x ? -FIXED_LENGTH_ROPE.UNIT : FIXED_LENGTH_ROPE.UNIT),
                  y: this.config.handOffset.y
              };
        const worldOffset = rotateVector(selectedOffset, angle);
        const handPosition = {
            x: playerPosition.x + worldOffset.x,
            y: playerPosition.y + worldOffset.y
        };
        const distance = Math.hypot(handPosition.x - anchor.x, handPosition.y - anchor.y);
        if (distance <= FIXED_LENGTH_ROPE.ZERO || distance > hookReach(this.config)) return false;
        this.anchor = new Vector2(anchor.x, anchor.y);
        this.anchorOwnerId = anchorOwnerId;
        this.anchorLocalOffset = anchorLocalOffset
            ? new Vector2(
                  finiteVector(anchorLocalOffset, "anchorLocalOffset").x,
                  finiteVector(anchorLocalOffset, "anchorLocalOffset").y
              )
            : null;
        this.attachmentOffset = new Vector2(selectedOffset.x, selectedOffset.y);
        this.length = distance;
        this.currentLength = distance;
        this.tension = FIXED_LENGTH_ROPE.ZERO;
        return true;
    }

    detach() {
        this.anchor = null;
        this.anchorOwnerId = null;
        this.anchorLocalOffset = null;
        this.attachmentOffset = null;
        this.length = FIXED_LENGTH_ROPE.ZERO;
        this.currentLength = FIXED_LENGTH_ROPE.ZERO;
        this.tension = FIXED_LENGTH_ROPE.ZERO;
    }

    updateAnchor(anchor) {
        if (!this.anchor) return false;
        finiteVector(anchor, "anchor");
        this.anchor.set(anchor.x, anchor.y);
        return true;
    }

    apply(physics, dt) {
        if (!this.anchor) return;
        if (!physics || !this.attachmentOffset) {
            throw new Error("attached rope requires angular physics and an attachment offset");
        }
        let constraint = this.#constraint(physics);
        for (
            let iteration = FIXED_LENGTH_ROPE.ZERO;
            iteration < FIXED_LENGTH_ROPE.POSITION_ITERATIONS && constraint;
            iteration += FIXED_LENGTH_ROPE.UNIT
        ) {
            const error = constraint.distance - this.length;
            if (Math.abs(error) <= FIXED_LENGTH_ROPE.POSITION_ERROR_TOLERANCE) break;
            const magnitude = -error / constraint.inverseEffectiveMass;
            const correction = {
                x: constraint.normal.x * magnitude,
                y: constraint.normal.y * magnitude
            };
            physics.applyPositionCorrection(correction);
            physics.applyAngularPositionCorrectionAtWorldOffset(correction, constraint.worldOffset);
            constraint = this.#constraint(physics);
        }
        if (!constraint) return;
        const pointVelocity = physics.angularPointVelocity(physics.physicsStepVelocity(), this.attachmentOffset);
        const radialVelocity = pointVelocity.x * constraint.normal.x + pointVelocity.y * constraint.normal.y;
        const impulseMagnitude = -radialVelocity / constraint.inverseEffectiveMass;
        const impulse = {
            x: constraint.normal.x * impulseMagnitude,
            y: constraint.normal.y * impulseMagnitude
        };
        physics.applyImpulse(impulse);
        physics.applyAngularImpulseAtWorldOffset(impulse, constraint.worldOffset);
        this.currentLength = this.#constraint(physics)?.distance ?? this.length;
        this.tension = dt > FIXED_LENGTH_ROPE.ZERO ? Math.abs(impulseMagnitude) / dt : FIXED_LENGTH_ROPE.ZERO;
    }

    #constraint(physics) {
        const worldOffset = physics.angularWorldOffset(this.attachmentOffset);
        const deltaX = physics.position.x + worldOffset.x - this.anchor.x;
        const deltaY = physics.position.y + worldOffset.y - this.anchor.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance <= FIXED_LENGTH_ROPE.MINIMUM_CONSTRAINT_DISTANCE) return null;
        const normal = { x: deltaX / distance, y: deltaY / distance };
        const angularLever = worldOffset.x * normal.y - worldOffset.y * normal.x;
        return {
            distance,
            normal,
            worldOffset,
            inverseEffectiveMass: FIXED_LENGTH_ROPE.UNIT + angularLever * angularLever * physics.inverseAngularInertia
        };
    }
}
