import { POINTER_SPELL_COMMAND_BY_TOKENS } from "./PointerSpellCommandBuffer.js";

export const MOBILE_GAMEPLAY_ACTION_ID = Object.freeze({
    ROPE: "rope"
});

function isSpellAction(actionId) {
    return Boolean(POINTER_SPELL_COMMAND_BY_TOKENS[actionId]);
}

export class MobileGameplayInputAdapter {
    constructor() {
        this.reset();
    }

    select(actionId) {
        if (actionId === MOBILE_GAMEPLAY_ACTION_ID.ROPE) return this.reset();
        if (!isSpellAction(actionId)) throw new Error(`unsupported mobile gameplay action: ${actionId}`);
        this.selectedActionId = actionId;
        return this.selectedActionId;
    }

    consumeSpellTarget() {
        if (!isSpellAction(this.selectedActionId)) return null;
        const commandKey = this.selectedActionId;
        this.reset();
        return commandKey;
    }

    reset() {
        this.selectedActionId = MOBILE_GAMEPLAY_ACTION_ID.ROPE;
        return this.selectedActionId;
    }

    snapshot() {
        return Object.freeze({ selectedActionId: this.selectedActionId });
    }
}
