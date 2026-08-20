import { createInputCapabilityMixin } from "./InputCapability.js";

export const withLocomotionInput = createInputCapabilityMixin({
    id: "locomotion",
    order: 20,
    apply(command, { dt, surfaces, collisionActors = [], onLanding = null }) {
        const result = this.physics.step(dt, command, surfaces, this.ropeObject.rope, {
            actorId: this.id,
            actors: collisionActors
        });
        if (result.landed) onLanding?.(result);
    }
});
