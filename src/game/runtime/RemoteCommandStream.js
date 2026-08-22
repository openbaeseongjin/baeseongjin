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
        this.latestSnapshotSequence = -1;
        this.latestSnapshot = null;
        this.pending = new Map();
    }

    createBatch(estimatedServerTick, command) {
        assertTick(estimatedServerTick, "estimatedServerTick");
        const targetTick = Math.max(estimatedServerTick + this.inputLeadTicks, this.lastTargetTick + 1);
        return this.createBatchAtTick(targetTick, command);
    }

    createBatchAtTick(targetTick, command) {
        assertTick(targetTick, "targetTick");
        if (targetTick <= this.lastTargetTick) return null;
        const sequence = this.nextSequence;
        const batch = createPlayerCommandBatch(targetTick, [{ playerId: this.playerId, sequence, command }]);
        this.nextSequence += 1;
        this.lastTargetTick = targetTick;
        this.pending.set(sequence, batch);
        return batch;
    }

    acceptSnapshot(snapshot) {
        const serverTick = assertTick(snapshot?.serverTick, "snapshot.serverTick");
        const snapshotSequence = assertTick(snapshot?.snapshotSequence, "snapshot.snapshotSequence");
        if (snapshotSequence <= this.latestSnapshotSequence || serverTick < this.latestServerTick) return false;
        const acknowledgedSequence = snapshot.acknowledgements?.[this.playerId];
        if (acknowledgedSequence !== undefined) {
            assertTick(acknowledgedSequence, "acknowledgedSequence");
            for (const sequence of this.pending.keys()) {
                if (sequence <= acknowledgedSequence) this.pending.delete(sequence);
            }
        }
        this.rebaseTargetTick(serverTick);
        this.latestServerTick = serverTick;
        this.latestSnapshotSequence = snapshotSequence;
        this.latestSnapshot = snapshot;
        return true;
    }

    acceptReceipt(receipt) {
        const removed = [];
        for (const rejection of receipt.rejected) {
            if (rejection.playerId !== this.playerId) continue;
            const batch = this.pending.get(rejection.sequence);
            if (!batch || batch.tick !== receipt.targetTick) continue;
            this.pending.delete(rejection.sequence);
            removed.push(rejection);
        }
        this.rebaseTargetTick(receipt.serverTick);
        return Object.freeze(removed);
    }

    rebaseTargetTick(serverTick) {
        assertTick(serverTick, "serverTick");
        const pendingTargetTicks = [...this.pending.values()].map(({ tick }) => tick);
        this.lastTargetTick = Math.max(serverTick + this.inputLeadTicks - 1, -1, ...pendingTargetTicks);
        return this.lastTargetTick;
    }

    pendingBatches() {
        return Object.freeze(
            [...this.pending.entries()].sort(([left], [right]) => left - right).map(([, batch]) => batch)
        );
    }
}
