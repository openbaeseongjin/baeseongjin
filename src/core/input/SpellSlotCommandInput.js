export const SPELL_SLOT_COMMAND = Object.freeze({
    BASIC_ATTACK: "right-left-left",
    UTILITY: "right-left-right",
    POWER_ATTACK: "right-right-left",
    MOVEMENT: "right-right-right"
});

export const SPELL_SLOT_COMMAND_ORDER = Object.freeze(Object.values(SPELL_SLOT_COMMAND));

export const SPELL_SLOT_COMMAND_BY_ID = Object.freeze({
    [SPELL_SLOT_COMMAND.BASIC_ATTACK]: SPELL_SLOT_COMMAND.BASIC_ATTACK,
    [SPELL_SLOT_COMMAND.UTILITY]: SPELL_SLOT_COMMAND.UTILITY,
    [SPELL_SLOT_COMMAND.POWER_ATTACK]: SPELL_SLOT_COMMAND.POWER_ATTACK,
    [SPELL_SLOT_COMMAND.MOVEMENT]: SPELL_SLOT_COMMAND.MOVEMENT
});

export const SPELL_SLOT_KEY_CODE = Object.freeze({
    BASIC_ATTACK: "KeyQ",
    UTILITY: "KeyE",
    POWER_ATTACK: "KeyR",
    MOVEMENT: "ShiftLeft",
    MOVEMENT_ALTERNATE: "ShiftRight"
});

export const SPELL_SLOT_COMMAND_BY_KEY_CODE = Object.freeze({
    [SPELL_SLOT_KEY_CODE.BASIC_ATTACK]: SPELL_SLOT_COMMAND.BASIC_ATTACK,
    [SPELL_SLOT_KEY_CODE.UTILITY]: SPELL_SLOT_COMMAND.UTILITY,
    [SPELL_SLOT_KEY_CODE.POWER_ATTACK]: SPELL_SLOT_COMMAND.POWER_ATTACK,
    [SPELL_SLOT_KEY_CODE.MOVEMENT]: SPELL_SLOT_COMMAND.MOVEMENT,
    [SPELL_SLOT_KEY_CODE.MOVEMENT_ALTERNATE]: SPELL_SLOT_COMMAND.MOVEMENT
});

export const SPELL_SLOT_KEY_LABEL = Object.freeze({
    [SPELL_SLOT_COMMAND.BASIC_ATTACK]: "Q",
    [SPELL_SLOT_COMMAND.UTILITY]: "E",
    [SPELL_SLOT_COMMAND.POWER_ATTACK]: "R",
    [SPELL_SLOT_COMMAND.MOVEMENT]: "SHIFT"
});

function requireCommandKey(commandKey) {
    if (!Object.hasOwn(SPELL_SLOT_COMMAND_BY_ID, commandKey)) {
        throw new Error(`unsupported spell slot command: ${commandKey}`);
    }
    return commandKey;
}

export class SpellSlotCommandInput {
    constructor() {
        this.commandSequence = 0;
        this.commandKey = null;
    }

    issue(commandKey) {
        this.commandSequence += 1;
        this.commandKey = requireCommandKey(commandKey);
        return this.commandKey;
    }

    snapshot() {
        return Object.freeze({
            commandSequence: this.commandSequence,
            commandKey: this.commandKey
        });
    }

    consume() {
        const command = this.snapshot();
        this.commandKey = null;
        return command;
    }

    clear() {
        this.commandKey = null;
    }
}
