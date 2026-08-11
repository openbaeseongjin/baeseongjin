import { createPlayerCommandBatch } from "./PlayerCommandBatch.js";

function assertTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
}

export class AuthorityCommandInbox {
    constructor({ maxPastTicks, maxFutureTicks }) {
        assertTick(maxPastTicks, "maxPastTicks");
        assertTick(maxFutureTicks, "maxFutureTicks");
        this.maxPastTicks = maxPastTicks;
        this.maxFutureTicks = maxFutureTicks;
        this.lastAcceptedSequence = new Map();
        this.commandsByTick = new Map();
    }

    ingest(batch, currentTick) {
        assertTick(currentTick, "currentTick");
        const accepted = [];
        const rejected = [];
        const earliestTick = Math.max(0, currentTick - this.maxPastTicks);
        const latestTick = currentTick + this.maxFutureTicks;
        const tickReason = batch.tick < earliestTick ? "past-tick" : batch.tick > latestTick ? "future-tick" : null;

        for (const entry of batch.commands) {
            const lastSequence = this.lastAcceptedSequence.get(entry.playerId) ?? -1;
            const reason = tickReason ?? (entry.sequence <= lastSequence ? "stale-sequence" : null);
            if (reason) {
                rejected.push(Object.freeze({ playerId: entry.playerId, sequence: entry.sequence, reason }));
                continue;
            }

            let commands = this.commandsByTick.get(batch.tick);
            if (!commands) {
                commands = new Map();
                this.commandsByTick.set(batch.tick, commands);
            }
            commands.set(entry.playerId, entry);
            this.lastAcceptedSequence.set(entry.playerId, entry.sequence);
            accepted.push(entry);
        }

        return Object.freeze({ accepted: Object.freeze(accepted), rejected: Object.freeze(rejected) });
    }

    take(tick) {
        assertTick(tick, "tick");
        const commands = this.commandsByTick.get(tick);
        this.commandsByTick.delete(tick);
        return createPlayerCommandBatch(tick, commands ? [...commands.values()] : []);
    }

    acknowledgements() {
        return Object.freeze(
            Object.fromEntries(
                [...this.lastAcceptedSequence.entries()].sort(([left], [right]) => left.localeCompare(right))
            )
        );
    }

    removePlayer(playerId) {
        this.lastAcceptedSequence.delete(playerId);
        for (const commands of this.commandsByTick.values()) commands.delete(playerId);
    }
}
