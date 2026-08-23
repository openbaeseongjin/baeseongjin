import { Vector2 } from "../../game-kit/index.js";
import { withSurfacePhysics } from "./SurfacePhysicsMixin.js";
import { SURFACE_MOTION_TYPE } from "./SurfacePhysicsDefinition.js";
import { assertCollider } from "./colliders/Collider.js";
import { withRopeAttachable } from "../rope/RopeAttachableMixin.js";

const DEFAULT_COLLISION_RESTITUTION = 0.25;

function finitePosition(position, label) {
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
        throw new TypeError(`${label} requires finite x and y`);
    }
    return position;
}

export class KinematicPhysicsBody extends withRopeAttachable(withSurfacePhysics(class {})) {
    constructor({
        id,
        actorKind,
        position,
        collider,
        collisionRestitution = DEFAULT_COLLISION_RESTITUTION,
        canGroundActors = false,
        ropeAttachment = false,
        ropeable = false
    }) {
        super();
        if (typeof id !== "string" || !id) throw new TypeError("KinematicPhysicsBody requires id");
        if (typeof actorKind !== "string" || !actorKind) {
            throw new TypeError("KinematicPhysicsBody requires actorKind");
        }
        if (!Number.isFinite(collisionRestitution) || collisionRestitution < 0 || collisionRestitution > 1) {
            throw new RangeError("KinematicPhysicsBody collisionRestitution must be 0..1");
        }
        if (typeof canGroundActors !== "boolean") {
            throw new TypeError("KinematicPhysicsBody canGroundActors must be boolean");
        }
        this.id = id;
        this.physicsActorKind = actorKind;
        this.collisionRestitution = collisionRestitution;
        this.canGroundActors = canGroundActors;
        this.initializeSurfacePhysics({
            position: new Vector2(finitePosition(position, "KinematicPhysicsBody position").x, position.y),
            collider: assertCollider(collider),
            motionType: SURFACE_MOTION_TYPE.KINEMATIC,
            ropeable
        });
        this.initializeRopeAttachable(ropeAttachment);
    }

    setKinematicPosition(position, dt) {
        const next = finitePosition(position, "KinematicPhysicsBody position");
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError("KinematicPhysicsBody dt must be non-negative");
        const velocity =
            dt > 0 ? { x: (next.x - this.position.x) / dt, y: (next.y - this.position.y) / dt } : { x: 0, y: 0 };
        this.setPhysicsVelocity(velocity);
        this.setPhysicsPosition(next);
        return this.position;
    }

    holdKinematicPosition() {
        this.stopPhysics();
        return this.position;
    }

    replaceCollider(collider) {
        this.collider = assertCollider(collider);
        return this.collider;
    }

    collisionActor(offset = { x: 0, y: 0 }) {
        const translated = finitePosition(offset, "KinematicPhysicsBody offset");
        return Object.freeze({
            id: this.id,
            physicsActorKind: this.physicsActorKind,
            position: Object.freeze({ x: this.position.x + translated.x, y: this.position.y + translated.y }),
            angle: this.angle ?? 0,
            angularVelocity: this.angularVelocity ?? 0,
            velocity: Object.freeze({ x: this.velocity.x, y: this.velocity.y }),
            collider: this.collider,
            mass: this.mass,
            motionType: this.motionType,
            collisionRestitution: this.collisionRestitution,
            canGroundActors: this.canGroundActors,
            ropeAttachment: this.ropeAttachmentSnapshot(translated),
            ropeableSurface: this.ropeableSurfaceSnapshot(translated),
            lifeState: "active"
        });
    }

    snapshot() {
        return Object.freeze({
            position: Object.freeze({ x: this.position.x, y: this.position.y }),
            velocity: Object.freeze({ x: this.velocity.x, y: this.velocity.y })
        });
    }

    restore(snapshot) {
        finitePosition(snapshot?.position, "KinematicPhysicsBody snapshot position");
        finitePosition(snapshot?.velocity, "KinematicPhysicsBody snapshot velocity");
        this.setPhysicsPosition(snapshot.position);
        this.setPhysicsVelocity(snapshot.velocity);
        return this;
    }
}
