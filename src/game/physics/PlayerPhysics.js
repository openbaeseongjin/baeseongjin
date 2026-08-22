import { Vector2 } from "../../game-kit/index.js";
import { withAngularPhysics } from "./AngularPhysicsMixin.js";
import { PHYSICS } from "./PhysicsDefinition.js";
import { withGravityPhysics } from "./PhysicsMixin.js";
import { PHYSICS_ACTOR_KIND, PLAYER_PHYSICS } from "./PlayerPhysicsDefinition.js";
import { CircleCollider } from "./colliders/CircleCollider.js";
import { withSurfacePhysics } from "./SurfacePhysicsMixin.js";

const ENEMY_ACTOR_KINDS = Object.freeze([PHYSICS_ACTOR_KIND.ENEMY]);

export class PlayerPhysics extends withAngularPhysics(withGravityPhysics(withSurfacePhysics(class {}))) {
    constructor(config, { collider = new CircleCollider({ radius: config.radius }) } = {}) {
        super();
        this.config = config;
        this.initializeSurfacePhysics({
            position: new Vector2(PLAYER_PHYSICS.INITIAL_POSITION.x, PLAYER_PHYSICS.INITIAL_POSITION.y),
            velocity: new Vector2(),
            collider
        });
        this.initializeAngularPhysics({
            inertia: config.angularInertia,
            maxSpeed: config.maxAngularSpeed,
            airDamping: config.airAngularDamping,
            uprightStrength: config.groundUprightStrength,
            uprightDamping: config.groundUprightDamping
        });
        this.isGrounded = false;
        this.lastSurfaceCollisionNormals = Object.freeze([]);
        this.lastSurfaceCollisionIncomingVelocity = PLAYER_PHYSICS.ZERO_VECTOR;
    }

    reset(position = PLAYER_PHYSICS.INITIAL_POSITION) {
        this.setPhysicsPosition(position);
        this.setPhysicsVelocity(PLAYER_PHYSICS.ZERO_VECTOR);
        this.clearSurfacePhysicsStep();
        this.resetAngularPhysics();
        this.isGrounded = false;
        this.lastSurfaceCollisionNormals = Object.freeze([]);
        this.lastSurfaceCollisionIncomingVelocity = PLAYER_PHYSICS.ZERO_VECTOR;
    }

    step(dt, input, surfaces, rope, collision = {}) {
        const wasGrounded = this.isGrounded;
        if (!rope.isAttached) {
            const acceleration = this.isGrounded ? this.config.groundAcceleration : this.config.airAcceleration;
            this.applyAcceleration({ x: input.horizontal * acceleration, y: PHYSICS.ZERO_VECTOR.y }, dt);
            if (
                input.horizontal === PLAYER_PHYSICS.IDLE_HORIZONTAL_INPUT &&
                this.isGrounded &&
                !input.preserveActionImpulse
            ) {
                const stepVelocity = this.physicsStepVelocity();
                this.applyImpulse({
                    x: stepVelocity.x * Math.exp(-this.config.groundDrag * dt) - stepVelocity.x,
                    y: PHYSICS.ZERO_VECTOR.y
                });
            }
            if (!input.preserveActionImpulse) {
                const stepVelocity = this.physicsStepVelocity();
                const limitedVelocityX = Math.max(
                    -this.config.maxHorizontalSpeed,
                    Math.min(this.config.maxHorizontalSpeed, stepVelocity.x)
                );
                this.applyImpulse({ x: limitedVelocityX - stepVelocity.x, y: PHYSICS.ZERO_VECTOR.y });
            }
        }

        if (this.isGrounded && input.vertical < PLAYER_PHYSICS.JUMP_VERTICAL_THRESHOLD) {
            const stepVelocity = this.physicsStepVelocity();
            this.applyImpulse({
                x: PHYSICS.ZERO_VECTOR.x,
                y: -this.config.jumpSpeed - stepVelocity.y
            });
            this.isGrounded = false;
        }

        const gravityScale = Number.isFinite(input.gravityScale)
            ? Math.max(PHYSICS.MINIMUM_GRAVITY_SCALE, input.gravityScale)
            : PHYSICS.DEFAULT_GRAVITY_SCALE;
        this.applyGravity(dt, this.config.gravity, gravityScale);
        this.applyAngularForces(dt, this.isGrounded);
        rope.apply(this, dt);

        this.integrateAngularPhysics(dt);
        const surfaceResolution = this.advanceSurfacePhysics(dt, surfaces, {
            actorId: collision.actorId ?? null,
            actorRef: collision.actorRef ?? null,
            actors: collision.actors ?? [],
            actorKinds: ENEMY_ACTOR_KINDS,
            broadPhase: collision.broadPhase ?? null,
            isGrounded: this.isGrounded
        });
        const impactVelocity = surfaceResolution.incomingVelocity;
        this.isGrounded = surfaceResolution.isGrounded;
        this.lastSurfaceCollisionNormals = surfaceResolution.collisionNormals;
        this.lastSurfaceCollisionIncomingVelocity = Object.freeze({ x: impactVelocity.x, y: impactVelocity.y });
        rope.apply(this, dt);
        const landed = !wasGrounded && this.isGrounded;
        return Object.freeze({
            landed,
            collidedActorIds: surfaceResolution.collidedActorIds,
            impactSpeed: landed
                ? Math.max(PLAYER_PHYSICS.MINIMUM_IMPACT_SPEED, impactVelocity.y)
                : PLAYER_PHYSICS.MINIMUM_IMPACT_SPEED,
            impactVelocity: landed
                ? Object.freeze({ x: impactVelocity.x, y: impactVelocity.y })
                : PLAYER_PHYSICS.ZERO_VECTOR
        });
    }
}
