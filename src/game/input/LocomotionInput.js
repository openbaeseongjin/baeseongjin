import { createInputCapabilityMixin } from "./InputCapability.js";

export const withLocomotionInput = createInputCapabilityMixin({
    id: "locomotion",
    order: 20,
    apply(command, { dt, surfaces, collisionActors = [], collisionBroadPhase = null, onLanding = null }) {
        const result = this.physics.step(dt, command, surfaces, this.ropeObject.rope, {
            actorId: this.id,
            actorRef: this,
            actors: collisionActors,
            broadPhase: collisionBroadPhase
        });
        if (result.landed) onLanding?.(result);
    }
});
