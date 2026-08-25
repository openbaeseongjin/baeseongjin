import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { PROJECTILE_HOMING } from "../combat/ProjectileDefinition.js";
import { withPhysics } from "./PhysicsMixin.js";
import { PROJECTILE_MOTION } from "./ProjectileMotionDefinition.js";

function shortestAngleDelta(fromRadians, toRadians) {
    const wrapped =
        (((toRadians - fromRadians + PROJECTILE_HOMING.HALF_ROTATION_RADIANS) %
            PROJECTILE_HOMING.FULL_ROTATION_RADIANS) +
            PROJECTILE_HOMING.FULL_ROTATION_RADIANS) %
        PROJECTILE_HOMING.FULL_ROTATION_RADIANS;
    return wrapped - PROJECTILE_HOMING.HALF_ROTATION_RADIANS;
}

export const withProjectileLifetime = (Base) =>
    class extends withPhysics(Base) {
        initializeProjectileMotion({ position, velocity, ageSeconds = PROJECTILE_MOTION.INITIAL_AGE_SECONDS }) {
            this.initializePhysics({ position, velocity });
            this.ageSeconds = ageSeconds;
        }

        projectileVelocity() {
            return this.physicsStepVelocity();
        }

        advanceProjectileMotion({ dt, ...context }) {
            const start = { x: this.position.x, y: this.position.y };
            const velocity = this.projectileVelocity({ dt, ...context });
            const currentVelocity = this.physicsStepVelocity();
            this.applyImpulse({ x: velocity.x - currentVelocity.x, y: velocity.y - currentVelocity.y });
            this.integratePhysics(dt);
            this.recordClientCollisionSegment?.(start, this.position);
            this.ageSeconds += dt;
        }
    };

export const withHomingProjectileSteering = (Base) =>
    class extends Base {
        projectileVelocity({
            dt = PROJECTILE_MOTION.INITIAL_AGE_SECONDS,
            state = null,
            targetPosition = null,
            speed = this.speed
        } = {}) {
            const target =
                targetPosition ??
                state?.[this.targetStateCollection]?.find(({ id }) => id === this.targetId)?.position ??
                null;
            if (!target) return super.projectileVelocity();
            const dx = target.x - this.position.x;
            const dy = target.y - this.position.y;
            const distance = Math.hypot(dx, dy);
            if (distance <= PROJECTILE_MOTION.MINIMUM_TARGET_DISTANCE) return super.projectileVelocity();
            const currentVelocity = super.projectileVelocity();
            const currentSpeed = Math.hypot(currentVelocity.x, currentVelocity.y);
            const targetAngle = Math.atan2(dy, dx);
            if (currentSpeed <= PROJECTILE_MOTION.MINIMUM_TARGET_DISTANCE) {
                return { x: Math.cos(targetAngle) * speed, y: Math.sin(targetAngle) * speed };
            }
            const currentAngle = Math.atan2(currentVelocity.y, currentVelocity.x);
            const turnLimit = this.turnRateRadiansPerSecond * dt;
            const turn = Math.max(-turnLimit, Math.min(turnLimit, shortestAngleDelta(currentAngle, targetAngle)));
            const nextAngle = currentAngle + turn;
            return { x: Math.cos(nextAngle) * speed, y: Math.sin(nextAngle) * speed };
        }
    };

export const withProjectileMotionSimulation = createSimulationCapabilityMixin({
    id: PROJECTILE_MOTION.CAPABILITY,
    order: PROJECTILE_MOTION.ORDER,
    apply(context) {
        this.advanceProjectileMotion(context);
    }
});
