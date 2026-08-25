import { createInputCapabilityMixin } from "./InputCapability.js";

export const withLocomotionInput = createInputCapabilityMixin({
    id: "locomotion",
    order: 20,
    apply(command, { dt, surfaces, collisionActors = [], collisionBroadPhase = null, onSurfaceCollision = null }) {
        const result = this.physics.step(dt, command, surfaces, this.ropeObject.rope, {
            actorId: this.id,
            actorRef: this,
            actors: collisionActors,
            broadPhase: collisionBroadPhase
        });
        if (result.startedSurfaceCollision) onSurfaceCollision?.(result);
    }
});
