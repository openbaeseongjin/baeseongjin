import { createPlayerCommandBatch } from "../network/PlayerCommandBatch.js";

function assertTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

export class RemoteCommandStream {
    constructor({ playerId, inputLeadTicks = 1 }) {
        if (typeof playerId !== "string" || playerId.length === 0) throw new Error("playerId must be non-empty");
        if (!Number.isSafeInteger(inputLeadTicks) || inputLeadTicks < 1) {
            throw new Error("inputLeadTicks must be a positive safe integer");
        }
        this.playerId = playerId;
        this.inputLeadTicks = inputLeadTicks;
        this.nextSequence = 0;
        this.lastTargetTick = -1;
        this.latestServerTick = -1;
        this.latestSnapshot = null;
        this.pending = new Map();
    }

    createBatch(estimatedServerTick, command) {
        assertTick(estimatedServerTick, "estimatedServerTick");
        const targetTick = Math.max(estimatedServerTick + this.inputLeadTicks, this.lastTargetTick + 1);
        const sequence = this.nextSequence;
        const batch = createPlayerCommandBatch(targetTick, [{ playerId: this.playerId, sequence, command }]);
        this.nextSequence += 1;
        this.lastTargetTick = targetTick;
        this.pending.set(sequence, batch);
        return batch;
    }

    acceptSnapshot(snapshot) {
        const serverTick = assertTick(snapshot?.serverTick, "snapshot.serverTick");
        if (serverTick <= this.latestServerTick) return false;
        const acknowledgedSequence = snapshot.acknowledgements?.[this.playerId];
        if (acknowledgedSequence !== undefined) {
            assertTick(acknowledgedSequence, "acknowledgedSequence");
            for (const sequence of this.pending.keys()) {
                if (sequence <= acknowledgedSequence) this.pending.delete(sequence);
            }
        }
        this.latestServerTick = serverTick;
        this.latestSnapshot = snapshot;
        return true;
    }

    pendingBatches() {
        return Object.freeze(
            [...this.pending.entries()].sort(([left], [right]) => left - right).map(([, batch]) => batch)
        );
    }
}
