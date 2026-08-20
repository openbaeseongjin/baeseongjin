import { Vector2 } from "../../game-kit/index.js";
import { assertCollider } from "./colliders/Collider.js";

function requireFiniteVector(vector, label) {
    if (!vector || !Number.isFinite(vector.x) || !Number.isFinite(vector.y)) {
        throw new Error(`${label} must contain finite x and y values`);
    }
    return vector;
}

export function withSurfacePhysics(Base) {
    return class extends Base {
        initializeSurfacePhysics({ position, velocity = new Vector2(), collider }) {
            this.position = requireFiniteVector(position, "surface physics position");
            this.velocity = requireFiniteVector(velocity, "surface physics velocity");
            this.collider = assertCollider(collider);
            Object.defineProperty(this, "surfacePhysicsStepPending", {
                value: false,
                enumerable: false,
                writable: true
            });
        }

        beginSurfacePhysicsStep() {
            if (this.surfacePhysicsStepPending) return false;
            this.velocity.set(0, 0);
            this.surfacePhysicsStepPending = true;
            return true;
        }

        queueSurfaceDisplacement(displacement, dt) {
            requireFiniteVector(displacement, "surface physics displacement");
            if (!Number.isFinite(dt) || dt <= 0) return false;
            this.beginSurfacePhysicsStep();
            this.velocity.x += displacement.x / dt;
            this.velocity.y += displacement.y / dt;
            return displacement.x !== 0 || displacement.y !== 0;
        }

        predictedSurfacePosition(dt) {
            if (!Number.isFinite(dt) || dt < 0) throw new Error("surface physics dt must be finite and non-negative");
            return this.position.clone().add(this.velocity.clone().scale(dt));
        }

        resolveSurfaceActors({ actorId, actors = [], isGrounded = false }) {
            const collidedActorIds = [];
            let grounded = isGrounded;
            for (const other of actors) {
                const result = this.collider.resolveActor({
                    actorId,
                    position: this.position,
                    velocity: this.velocity,
                    other,
                    isGrounded: grounded
                });
                grounded = result.isGrounded;
                if (result.collided) collidedActorIds.push(other.id);
            }
            return Object.freeze({
                isGrounded: grounded,
                collidedActorIds: Object.freeze(collidedActorIds)
            });
        }

        advanceSurfacePhysics(dt, surfaces, { actorId = null, actors = [], isGrounded = false } = {}) {
            if (!Number.isFinite(dt) || dt < 0) throw new Error("surface physics dt must be finite and non-negative");
            const previousPosition = this.position.clone();
            const incomingVelocity = this.velocity.clone();
            if (dt > 0) this.position.add(this.velocity.clone().scale(dt));
            const surfaceResolution = this.collider.resolveSurfaces({
                position: this.position,
                velocity: this.velocity,
                surfaces,
                previousPosition
            });
            const actorResolution =
                actorId === null
                    ? Object.freeze({ isGrounded, collidedActorIds: Object.freeze([]) })
                    : this.resolveSurfaceActors({
                          actorId,
                          actors,
                          isGrounded: isGrounded || surfaceResolution.isGrounded
                      });
            const finalSurfaceResolution =
                actorResolution.collidedActorIds.length === 0
                    ? surfaceResolution
                    : this.collider.resolveSurfaces({
                          position: this.position,
                          velocity: this.velocity,
                          surfaces,
                          previousPosition
                      });
            this.surfacePhysicsStepPending = false;
            return Object.freeze({
                previousPosition,
                incomingVelocity,
                isGrounded:
                    actorResolution.isGrounded || surfaceResolution.isGrounded || finalSurfaceResolution.isGrounded,
                collisionNormals: Object.freeze([
                    ...surfaceResolution.collisionNormals,
                    ...(finalSurfaceResolution === surfaceResolution ? [] : finalSurfaceResolution.collisionNormals)
                ]),
                collidedActorIds: actorResolution.collidedActorIds
            });
        }
    };
}
