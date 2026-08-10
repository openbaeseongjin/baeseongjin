import { AuthorityCommandInbox } from "../network/AuthorityCommandInbox.js";
import { buildAuthoritySnapshot } from "./AuthoritySnapshotBuilder.js";

function assertPositive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive`);
    return value;
}

function assertPositiveInteger(value, label) {
    if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${label} must be a positive safe integer`);
    return value;
}

export class AuthorityServerSession {
    constructor({ simulation, fixedDt = 1 / 120, snapshotIntervalTicks = 6, maxPastTicks = 2, maxFutureTicks = 12 }) {
        if (!simulation) throw new Error("simulation is required");
        this.simulation = simulation;
        this.fixedDt = assertPositive(fixedDt, "fixedDt");
        this.snapshotIntervalTicks = assertPositiveInteger(snapshotIntervalTicks, "snapshotIntervalTicks");
        this.inbox = new AuthorityCommandInbox({ maxPastTicks, maxFutureTicks });
    }

    submit(authenticatedPlayerId, batch) {
        if (!this.simulation.players.some(({ id }) => id === authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        const foreignEntries = batch.commands.filter(({ playerId }) => playerId !== authenticatedPlayerId);
        if (foreignEntries.length > 0) {
            return Object.freeze({
                accepted: Object.freeze([]),
                rejected: Object.freeze(
                    batch.commands.map(({ playerId, sequence }) =>
                        Object.freeze({ playerId, sequence, reason: "player-ownership" })
                    )
                )
            });
        }
        return this.inbox.ingest(batch, this.simulation.tick);
    }

    advance() {
        const nextTick = this.simulation.tick + 1;
        this.simulation.stepCommandBatch(this.fixedDt, this.inbox.take(nextTick));
        return nextTick % this.snapshotIntervalTicks === 0 ? this.snapshot() : null;
    }

    snapshot() {
        return buildAuthoritySnapshot({
            simulation: this.simulation,
            acknowledgements: this.inbox.acknowledgements()
        });
    }
}
