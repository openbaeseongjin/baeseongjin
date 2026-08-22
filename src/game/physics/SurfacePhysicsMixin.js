import { Vector2 } from "../../game-kit/index.js";
import { requireFinitePhysicsVector, withPhysics } from "./PhysicsMixin.js";
import { SURFACE_MOTION_TYPE, SURFACE_MOTION_TYPE_BY_STATIC, SURFACE_PHYSICS } from "./SurfacePhysicsDefinition.js";
import { assertCollider, colliderSnapshotBoundingRadius } from "./colliders/Collider.js";

export function withSurfacePhysics(Base) {
    return class extends withPhysics(Base) {
        initializeSurfacePhysics({
            position,
            velocity = new Vector2(),
            acceleration = new Vector2(),
            collider,
            mass = null,
            motionType = SURFACE_MOTION_TYPE.DYNAMIC
        }) {
            this.initializePhysics({ position, velocity, acceleration });
            this.collider = assertCollider(collider);
            const colliderRadius = colliderSnapshotBoundingRadius(this.collider.snapshot());
            this.mass =
                Number.isFinite(mass) && mass > SURFACE_PHYSICS.MINIMUM_EXPLICIT_MASS
                    ? mass
                    : Math.max(
                          SURFACE_PHYSICS.MINIMUM_MASS,
                          (Number.isFinite(colliderRadius)
                              ? colliderRadius / SURFACE_PHYSICS.MASS_RADIUS_DIVISOR
                              : SURFACE_PHYSICS.DEFAULT_MASS) ** SURFACE_PHYSICS.MASS_EXPONENT
                      );
            this.motionType = SURFACE_MOTION_TYPE_BY_STATIC[motionType === SURFACE_MOTION_TYPE.STATIC];
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
            this.actorCollisionVelocity.set(SURFACE_PHYSICS.ZERO_VECTOR.x, SURFACE_PHYSICS.ZERO_VECTOR.y);
            this.surfaceControlVelocity.set(SURFACE_PHYSICS.ZERO_VECTOR.x, SURFACE_PHYSICS.ZERO_VECTOR.y);
            this.surfacePhysicsStepPending = true;
            return true;
        }

        clearSurfacePhysicsStep() {
            this.actorCollisionVelocity.set(SURFACE_PHYSICS.ZERO_VECTOR.x, SURFACE_PHYSICS.ZERO_VECTOR.y);
            this.surfaceControlVelocity.set(SURFACE_PHYSICS.ZERO_VECTOR.x, SURFACE_PHYSICS.ZERO_VECTOR.y);
            this.surfacePhysicsStepPending = false;
        }

        suspendSurfacePhysics() {
            this.stopPhysics();
            this.clearSurfacePhysicsStep();
        }

        carryActorCollisionVelocity(velocityDelta, dt, damping = SURFACE_PHYSICS.DEFAULT_COLLISION_DAMPING) {
            requireFinitePhysicsVector(velocityDelta, "actor collision velocity delta");
            if (!Number.isFinite(dt) || dt < SURFACE_PHYSICS.MINIMUM_DT)
                throw new Error("actor collision dt must be non-negative");
            if (!Number.isFinite(damping) || damping < SURFACE_PHYSICS.MINIMUM_DT)
                throw new Error("actor collision damping must be non-negative");
            if (this.motionType === SURFACE_MOTION_TYPE.STATIC) {
                this.actorCollisionVelocity.set(SURFACE_PHYSICS.ZERO_VECTOR.x, SURFACE_PHYSICS.ZERO_VECTOR.y);
                return false;
            }
            const retention = Math.exp(-damping * dt);
            this.actorCollisionVelocity.set(velocityDelta.x * retention, velocityDelta.y * retention);
            return (
                velocityDelta.x !== SURFACE_PHYSICS.ZERO_VECTOR.x || velocityDelta.y !== SURFACE_PHYSICS.ZERO_VECTOR.y
            );
        }

        queueSurfaceDisplacement(displacement, dt) {
            requireFinitePhysicsVector(displacement, "surface physics displacement");
            if (!Number.isFinite(dt) || dt <= SURFACE_PHYSICS.MINIMUM_DT) return false;
            this.beginSurfacePhysicsStep();
            const velocityX = displacement.x / dt;
            const velocityY = displacement.y / dt;
            this.surfaceControlVelocity.x += velocityX;
            this.surfaceControlVelocity.y += velocityY;
            this.applyImpulse({ x: velocityX, y: velocityY });
            return displacement.x !== SURFACE_PHYSICS.ZERO_VECTOR.x || displacement.y !== SURFACE_PHYSICS.ZERO_VECTOR.y;
        }

        predictedSurfacePosition(dt) {
            return this.physicsDestination(dt);
        }

        resolveSurfaceActors({ actorId, velocity, actors = [], isGrounded = false }) {
            const collidedActorIds = [];
            let grounded = isGrounded;
            const velocityDelta = new Vector2();
            for (const other of actors) {
                const result = this.collider.resolveActor({
                    actorId,
                    position: this.position,
                    velocity,
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

        resolveActorPhysics({ actorId, actors = [], isGrounded = false }) {
            this.integratePhysicsAcceleration();
            const resolvedVelocity = this.velocity.clone();
            const resolution = this.resolveSurfaceActors({ actorId, velocity: resolvedVelocity, actors, isGrounded });
            this.applyImpulse({
                x: resolvedVelocity.x - this.velocity.x,
                y: resolvedVelocity.y - this.velocity.y
            });
            this.integratePhysicsAcceleration();
            return resolution;
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
            this.integratePhysicsAcceleration();
            const previousPosition = this.position.clone();
            const incomingVelocity = this.velocity.clone();
            const resolvedVelocity = this.velocity.clone();
            const destination = this.physicsDestination(dt);
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
                velocity: resolvedVelocity,
                surfaces: candidateSurfaces,
                previousPosition
            });
            const actorResolution =
                actorId === null
                    ? Object.freeze({
                          isGrounded,
                          collidedActorIds: Object.freeze([]),
                          velocityDelta: SURFACE_PHYSICS.ZERO_VECTOR
                      })
                    : this.resolveSurfaceActors({
                          actorId,
                          velocity: resolvedVelocity,
                          actors: candidateActors,
                          isGrounded: isGrounded || surfaceResolution.isGrounded
                      });
            const finalSurfaceResolution =
                actorResolution.collidedActorIds.length === SURFACE_PHYSICS.EMPTY_COLLISION_COUNT
                    ? surfaceResolution
                    : this.collider.resolveSurfaces({
                          position: this.position,
                          velocity: resolvedVelocity,
                          surfaces: candidateSurfaces,
                          previousPosition
                      });
            this.applyImpulse({
                x: resolvedVelocity.x - this.velocity.x,
                y: resolvedVelocity.y - this.velocity.y
            });
            this.integratePhysicsAcceleration();
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
