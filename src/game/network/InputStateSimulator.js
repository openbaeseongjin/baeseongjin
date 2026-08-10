export class InputStateSimulator {
    constructor({ holdTicks }) {
        if (!Number.isSafeInteger(holdTicks) || holdTicks < 1) {
            throw new Error("holdTicks must be a positive safe integer");
        }
        this.holdTicks = holdTicks;
        this.states = new Map();
    }

    expand(batch, playerIds) {
        const incoming = new Map(batch.commands.map((entry) => [entry.playerId, entry]));
        for (const entry of batch.commands) {
            this.states.set(entry.playerId, { entry, expiresAtTick: batch.tick + this.holdTicks });
        }

        const commands = [];
        for (const playerId of playerIds) {
            const entry = incoming.get(playerId);
            if (entry) {
                commands.push(entry);
                continue;
            }
            const held = this.states.get(playerId);
            if (held && batch.tick < held.expiresAtTick) commands.push(held.entry);
        }
        return Object.freeze({ ...batch, commands: Object.freeze(commands) });
    }

    removePlayer(playerId) {
        this.states.delete(playerId);
    }
}
