export const POINTER_SPELL_TOKEN = Object.freeze({
    LEFT: "left",
    RIGHT: "right"
});

export const POINTER_SPELL_COMMAND = Object.freeze({
    RIGHT_LEFT_LEFT: "right-left-left",
    RIGHT_LEFT_RIGHT: "right-left-right",
    RIGHT_RIGHT_LEFT: "right-right-left",
    RIGHT_RIGHT_RIGHT: "right-right-right"
});

export const POINTER_SPELL_COMMAND_ORDER = Object.freeze(Object.values(POINTER_SPELL_COMMAND));

export const POINTER_SPELL_COMMAND_BY_TOKENS = Object.freeze({
    [POINTER_SPELL_COMMAND.RIGHT_LEFT_LEFT]: POINTER_SPELL_COMMAND.RIGHT_LEFT_LEFT,
    [POINTER_SPELL_COMMAND.RIGHT_LEFT_RIGHT]: POINTER_SPELL_COMMAND.RIGHT_LEFT_RIGHT,
    [POINTER_SPELL_COMMAND.RIGHT_RIGHT_LEFT]: POINTER_SPELL_COMMAND.RIGHT_RIGHT_LEFT,
    [POINTER_SPELL_COMMAND.RIGHT_RIGHT_RIGHT]: POINTER_SPELL_COMMAND.RIGHT_RIGHT_RIGHT
});

export const POINTER_SPELL_INPUT_SPEC = Object.freeze({
    tokenWindowSeconds: 0.75,
    commandLength: 3
});

function requireToken(token) {
    if (token !== POINTER_SPELL_TOKEN.LEFT && token !== POINTER_SPELL_TOKEN.RIGHT) {
        throw new Error(`unsupported pointer spell token: ${token}`);
    }
    return token;
}

function requireCommandKey(commandKey) {
    if (!POINTER_SPELL_COMMAND_BY_TOKENS[commandKey]) {
        throw new Error(`unsupported pointer spell command: ${commandKey}`);
    }
    return commandKey;
}

export class PointerSpellCommandBuffer {
    constructor(spec = POINTER_SPELL_INPUT_SPEC) {
        this.spec = spec;
        this.tokens = [];
        this.expiresAtSeconds = 0;
        this.commandSequence = 0;
        this.commandKey = null;
    }

    get active() {
        return this.tokens.length > 0;
    }

    expire(nowSeconds) {
        if (this.active && nowSeconds >= this.expiresAtSeconds) this.cancel();
    }

    input(token, nowSeconds) {
        requireToken(token);
        if (!Number.isFinite(nowSeconds) || nowSeconds < 0)
            throw new Error("pointer spell input time must be non-negative");
        this.expire(nowSeconds);
        if (!this.active && token !== POINTER_SPELL_TOKEN.RIGHT) {
            return Object.freeze({ consumed: false, completed: false, commandKey: null });
        }
        this.tokens.push(token);
        this.expiresAtSeconds = nowSeconds + this.spec.tokenWindowSeconds;
        if (this.tokens.length < this.spec.commandLength) {
            return Object.freeze({ consumed: true, completed: false, commandKey: null });
        }
        const commandKey = POINTER_SPELL_COMMAND_BY_TOKENS[this.tokens.join("-")] ?? null;
        this.tokens.length = 0;
        this.expiresAtSeconds = 0;
        if (!commandKey) return Object.freeze({ consumed: true, completed: false, commandKey: null });
        this.commandSequence += 1;
        this.commandKey = commandKey;
        return Object.freeze({ consumed: true, completed: true, commandKey });
    }

    issue(commandKey) {
        this.cancel();
        this.commandSequence += 1;
        this.commandKey = requireCommandKey(commandKey);
        return this.commandKey;
    }

    cancel() {
        this.tokens.length = 0;
        this.expiresAtSeconds = 0;
    }

    reset() {
        this.cancel();
        this.commandSequence = 0;
        this.commandKey = null;
    }

    snapshot(nowSeconds) {
        this.expire(nowSeconds);
        return Object.freeze({
            tokens: Object.freeze([...this.tokens]),
            commandSequence: this.commandSequence,
            commandKey: this.commandKey,
            remainingSeconds: this.active ? Math.max(0, this.expiresAtSeconds - nowSeconds) : 0
        });
    }
}
