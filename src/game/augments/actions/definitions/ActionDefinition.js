import { ACTION_END_REASON, ACTION_STATE_CONFIG } from "../ActionAugmentDefinition.js";

const DEFAULT_MOVEMENT_MODIFIERS = Object.freeze({
    gravityScale: ACTION_STATE_CONFIG.UNIT,
    preservesHorizontalControl: true,
    preservesRopeControl: true
});

const DEFAULT_COMMAND_MODIFIERS = Object.freeze({
    gravityScale: ACTION_STATE_CONFIG.UNIT,
    preserveActionImpulse: false
});

export class ActionDefinition {
    constructor({ id, immediate }) {
        this.id = id;
        this.immediate = immediate;
    }

    canBegin() {
        return Object.freeze({ accepted: true });
    }

    createActivation({ shared, effect, signature }) {
        const activation = {
            ...shared,
            immediate: this.immediate,
            ...this.activationPayload(effect)
        };
        return signature ? signature.decorateActivation(activation) : activation;
    }

    activationPayload() {
        throw new Error(`${this.constructor.name} must implement activationPayload()`);
    }

    execute() {
        throw new Error(`${this.constructor.name} must implement execute()`);
    }

    movementModifiers() {
        return DEFAULT_MOVEMENT_MODIFIERS;
    }

    commandModifiers() {
        return DEFAULT_COMMAND_MODIFIERS;
    }

    activeEndReason({ durationRemaining }) {
        return durationRemaining === ACTION_STATE_CONFIG.ZERO ? ACTION_END_REASON.COMPLETED : null;
    }

    get rechargeOnBegin() {
        return true;
    }

    get rechargeOnEnd() {
        return false;
    }

    get cancelsOnRelease() {
        return false;
    }
}

export { DEFAULT_COMMAND_MODIFIERS, DEFAULT_MOVEMENT_MODIFIERS };
