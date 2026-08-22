import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { withPhysics } from "./PhysicsMixin.js";
import { PROJECTILE_MOTION } from "./ProjectileMotionDefinition.js";

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
            const velocity = this.projectileVelocity(context);
            const currentVelocity = this.physicsStepVelocity();
            this.applyImpulse({ x: velocity.x - currentVelocity.x, y: velocity.y - currentVelocity.y });
            this.integratePhysics(dt);
            this.ageSeconds += dt;
        }
    };

export const withHomingProjectileSteering = (Base) =>
    class extends Base {
        projectileVelocity({ state = null, targetPosition = null, speed = this.speed } = {}) {
            const target = targetPosition ?? state?.enemies?.find(({ id }) => id === this.targetId)?.position ?? null;
            if (!target) return super.projectileVelocity();
            const dx = target.x - this.position.x;
            const dy = target.y - this.position.y;
            const distance = Math.hypot(dx, dy);
            if (distance <= PROJECTILE_MOTION.MINIMUM_TARGET_DISTANCE) return super.projectileVelocity();
            return { x: (dx / distance) * speed, y: (dy / distance) * speed };
        }
    };

export const withProjectileMotionSimulation = createSimulationCapabilityMixin({
    id: PROJECTILE_MOTION.CAPABILITY,
    order: PROJECTILE_MOTION.ORDER,
    apply(context) {
        this.advanceProjectileMotion(context);
    }
});
