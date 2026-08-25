import { SPELL_SLOT_COMMAND_BY_ID } from "./SpellSlotCommandInput.js";

export const MOBILE_GAMEPLAY_ACTION_ID = Object.freeze({
    ROPE: "rope"
});

function isSpellAction(actionId) {
    return Object.hasOwn(SPELL_SLOT_COMMAND_BY_ID, actionId);
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
