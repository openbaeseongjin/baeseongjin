import {
    ACTION_END_REASON,
    ACTION_REJECTION_REASON,
    ACTION_STATE_CONFIG,
    BASE_ACTION_ID
} from "../ActionAugmentDefinition.js";
import { DEFAULT_COMMAND_MODIFIERS, DEFAULT_MOVEMENT_MODIFIERS, ActionDefinition } from "./ActionDefinition.js";

export class SlowFallAction extends ActionDefinition {
    constructor() {
        super({ id: BASE_ACTION_ID.SLOW_FALL, immediate: false });
    }

    canBegin({ airborne }) {
        return airborne
            ? Object.freeze({ accepted: true })
            : Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.NOT_AIRBORNE });
    }

    activationPayload(effect) {
        return {
            durationSeconds: effect.durationSeconds,
            gravityScale: effect.gravityScale
        };
    }

    execute() {
        return false;
    }

    movementModifiers({ activeAction, effect }) {
        return activeAction
            ? Object.freeze({
                  gravityScale: effect.gravityScale,
                  preservesHorizontalControl: true,
                  preservesRopeControl: true
              })
            : DEFAULT_MOVEMENT_MODIFIERS;
    }

    commandModifiers({ activeAction, actionDown, effect }) {
        return activeAction && actionDown
            ? Object.freeze({ gravityScale: effect.gravityScale, preserveActionImpulse: false })
            : DEFAULT_COMMAND_MODIFIERS;
    }

    activeEndReason({ cancelRequested, isGrounded, durationRemaining }) {
        if (cancelRequested) return ACTION_END_REASON.RELEASED;
        if (isGrounded) return ACTION_END_REASON.LANDED;
        return durationRemaining === ACTION_STATE_CONFIG.ZERO ? ACTION_END_REASON.COMPLETED : null;
    }

    get rechargeOnBegin() {
        return false;
    }

    get rechargeOnEnd() {
        return true;
    }

    get cancelsOnRelease() {
        return true;
    }
}
