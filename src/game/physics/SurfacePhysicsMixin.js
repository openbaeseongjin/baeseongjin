import { Vector2 } from "../../game-kit/index.js";
import { assertCollider, colliderSnapshotBoundingRadius } from "./colliders/Collider.js";

function requireFiniteVector(vector, label) {
    if (!vector || !Number.isFinite(vector.x) || !Number.isFinite(vector.y)) {
        throw new Error(`${label} must contain finite x and y values`);
    }
    return vector;
}

export function withSurfacePhysics(Base) {
    return class extends Base {
        initializeSurfacePhysics({
            position,
            velocity = new Vector2(),
            collider,
            mass = null,
            motionType = "dynamic"
        }) {
            this.position = requireFiniteVector(position, "surface physics position");
            this.velocity = requireFiniteVector(velocity, "surface physics velocity");
            this.collider = assertCollider(collider);
            const colliderRadius = colliderSnapshotBoundingRadius(this.collider.snapshot());
            this.mass =
                Number.isFinite(mass) && mass > 0
                    ? mass
                    : Math.max(0.25, (Number.isFinite(colliderRadius) ? colliderRadius / 15 : 1) ** 2);
            this.motionType = motionType === "static" ? "static" : "dynamic";
            Object.defineProperty(this, "surfacePhysicsStepPending", {
                value: false,
                enumerable: false,
                writable: true
            });
            Object.defineProperty(this, "actorCollisionVelocity", {
                value: new Vector2(),
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "surfaceControlVelocity", {
                value: new Vector2(),
                enumerable: false,
                writable: false
            });
        }

        beginSurfacePhysicsStep() {
            if (this.surfacePhysicsStepPending) return false;
            this.velocity.set(this.actorCollisionVelocity.x, this.actorCollisionVelocity.y);
            this.actorCollisionVelocity.set(0, 0);
            this.surfaceControlVelocity.set(0, 0);
            this.surfacePhysicsStepPending = true;
            return true;
        }

        carryActorCollisionVelocity(velocityDelta, dt, damping = 6) {
            requireFiniteVector(velocityDelta, "actor collision velocity delta");
            if (!Number.isFinite(dt) || dt < 0) throw new Error("actor collision dt must be non-negative");
            if (!Number.isFinite(damping) || damping < 0)
                throw new Error("actor collision damping must be non-negative");
            if (this.motionType === "static") {
                this.actorCollisionVelocity.set(0, 0);
                return false;
            }
            const retention = Math.exp(-damping * dt);
            this.actorCollisionVelocity.set(velocityDelta.x * retention, velocityDelta.y * retention);
            return velocityDelta.x !== 0 || velocityDelta.y !== 0;
        }

        queueSurfaceDisplacement(displacement, dt) {
            requireFiniteVector(displacement, "surface physics displacement");
            if (!Number.isFinite(dt) || dt <= 0) return false;
            this.beginSurfacePhysicsStep();
            const velocityX = displacement.x / dt;
            const velocityY = displacement.y / dt;
            this.surfaceControlVelocity.x += velocityX;
            this.surfaceControlVelocity.y += velocityY;
            this.velocity.x += velocityX;
            this.velocity.y += velocityY;
            return displacement.x !== 0 || displacement.y !== 0;
        }

        predictedSurfacePosition(dt) {
            if (!Number.isFinite(dt) || dt < 0) throw new Error("surface physics dt must be finite and non-negative");
            return this.position.clone().add(this.velocity.clone().scale(dt));
        }

        resolveSurfaceActors({ actorId, actors = [], isGrounded = false }) {
            const collidedActorIds = [];
            let grounded = isGrounded;
            const velocityDelta = new Vector2();
            for (const other of actors) {
                const result = this.collider.resolveActor({
                    actorId,
                    position: this.position,
                    velocity: this.velocity,
                    mass: this.mass,
                    motionType: this.motionType,
                    other,
                    isGrounded: grounded
                });
                grounded = result.isGrounded;
                if (result.collided) {
                    collidedActorIds.push(other.id);
                    velocityDelta.x += result.velocityDelta.x;
                    velocityDelta.y += result.velocityDelta.y;
                }
            }
            return Object.freeze({
                isGrounded: grounded,
                collidedActorIds: Object.freeze(collidedActorIds),
                velocityDelta: Object.freeze({ x: velocityDelta.x, y: velocityDelta.y })
            });
        }

        advanceSurfacePhysics(
            dt,
            surfaces,
            {
                actorId = null,
                actorRef = null,
                actors = [],
                actorKinds = null,
                broadPhase = null,
                isGrounded = false
            } = {}
        ) {
            if (!Number.isFinite(dt) || dt < 0) throw new Error("surface physics dt must be finite and non-negative");
            const previousPosition = this.position.clone();
            const incomingVelocity = this.velocity.clone();
            const destination = this.position.clone();
            if (dt > 0) destination.add(this.velocity.clone().scale(dt));
            const candidateSurfaces = broadPhase
                ? broadPhase.querySurfaces({ collider: this.collider, start: previousPosition, end: destination })
                : surfaces;
            const candidateActors =
                broadPhase && actorId !== null
                    ? broadPhase.queryActors({
                          actorId,
                          collider: this.collider,
                          start: previousPosition,
                          end: destination,
                          kinds: actorKinds
                      })
                    : actors;
            this.position.set(destination.x, destination.y);
            const surfaceResolution = this.collider.resolveSurfaces({
                position: this.position,
                velocity: this.velocity,
                surfaces: candidateSurfaces,
                previousPosition
            });
            const actorResolution =
                actorId === null
                    ? Object.freeze({
                          isGrounded,
                          collidedActorIds: Object.freeze([]),
                          velocityDelta: Object.freeze({ x: 0, y: 0 })
                      })
                    : this.resolveSurfaceActors({
                          actorId,
                          actors: candidateActors,
                          isGrounded: isGrounded || surfaceResolution.isGrounded
                      });
            const finalSurfaceResolution =
                actorResolution.collidedActorIds.length === 0
                    ? surfaceResolution
                    : this.collider.resolveSurfaces({
                          position: this.position,
                          velocity: this.velocity,
                          surfaces: candidateSurfaces,
                          previousPosition
                      });
            this.surfacePhysicsStepPending = false;
            if (broadPhase && actorRef) broadPhase.updateActor(actorRef);
            return Object.freeze({
                previousPosition,
                incomingVelocity,
                isGrounded:
                    actorResolution.isGrounded || surfaceResolution.isGrounded || finalSurfaceResolution.isGrounded,
                collisionNormals: Object.freeze([
                    ...surfaceResolution.collisionNormals,
                    ...(finalSurfaceResolution === surfaceResolution ? [] : finalSurfaceResolution.collisionNormals)
                ]),
                collidedActorIds: actorResolution.collidedActorIds,
                actorVelocityDelta: actorResolution.velocityDelta
            });
        }
    };
}
