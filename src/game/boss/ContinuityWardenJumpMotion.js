import { KinematicJumpMotion } from "./KinematicJumpMotion.js";
import { CONTINUITY_WARDEN_LOCOMOTION_STATE } from "./ContinuityWardenDefinition.js";

export class ContinuityWardenJumpMotion extends KinematicJumpMotion {
    constructor(options) {
        super({ ...options, phases: CONTINUITY_WARDEN_LOCOMOTION_STATE });
    }
}
