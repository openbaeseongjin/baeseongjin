import { AngularMotion } from "./AngularMotion.js";
import { PHYSICS } from "./PhysicsDefinition.js";

export const withAngularPhysics = (Base) =>
    class extends Base {
        #angularMotion;

        initializeAngularPhysics(config) {
            this.#angularMotion = new AngularMotion(config);
        }

        get angle() {
            return this.#angularMotion.angle;
        }

        get angularVelocity() {
            return this.#angularMotion.velocity;
        }

        get angularAcceleration() {
            return this.#angularMotion.acceleration;
        }

        get inverseAngularInertia() {
            return this.#angularMotion.inverseInertia;
        }

        angularStepVelocity() {
            return this.#angularMotion.stepVelocity();
        }

        resetAngularPhysics() {
            this.#angularMotion.reset();
        }

        setAngularState(angle, angularVelocity) {
            this.#angularMotion.set(angle, angularVelocity);
        }

        applyAngularForces(dt, isGrounded) {
            this.#angularMotion.applyForces(dt, isGrounded);
        }

        integrateAngularPhysics(dt) {
            this.#angularMotion.integrate(dt);
        }

        angularWorldOffset(localOffset) {
            return this.#angularMotion.worldOffset(localOffset);
        }

        angularPointVelocity(linearVelocity, localOffset) {
            return this.#angularMotion.pointVelocity(linearVelocity, localOffset);
        }

        angularTangentialVelocity(localOffset) {
            return this.#angularMotion.tangentialVelocity(localOffset);
        }

        applyAngularImpulseAtWorldOffset(impulse, worldOffset) {
            this.#angularMotion.applyImpulseAtWorldOffset(impulse, worldOffset);
        }

        applyAngularPositionCorrectionAtWorldOffset(correction, worldOffset) {
            this.#angularMotion.applyPositionCorrectionAtWorldOffset(correction, worldOffset);
        }

        applyImpulseAtLocalPoint(impulse, localOffset, scale = PHYSICS.DEFAULT_IMPULSE_SCALE) {
            const scaledImpulse = { x: impulse.x * scale, y: impulse.y * scale };
            this.applyImpulse(scaledImpulse);
            this.applyAngularImpulseAtWorldOffset(scaledImpulse, this.angularWorldOffset(localOffset));
        }
    };
