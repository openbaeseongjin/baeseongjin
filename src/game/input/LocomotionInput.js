import { createInputCapabilityMixin } from "./InputCapability.js";

export const withLocomotionInput = createInputCapabilityMixin({
    id: "locomotion",
    order: 20,
    apply(command, { dt, surfaces }) {
        this.physics.step(dt, command, surfaces, this.ropeObject.rope);
    }
});
