import { AuthorityCommandInbox } from "../network/AuthorityCommandInbox.js";
import { createCommandReceipt } from "../network/CommandReceipt.js";
import { InputStateSimulator } from "../network/InputStateSimulator.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
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
    constructor({
        simulation,
        fixedDt = 1 / 120,
        snapshotIntervalTicks = 6,
        maxPastTicks = 2,
        maxFutureTicks = MULTIPLAYER_TIMING.maxFutureTicks,
        inputHoldTicks = MULTIPLAYER_TIMING.inputHoldTicks
    }) {
        if (!simulation) throw new Error("simulation is required");
        this.simulation = simulation;
        this.fixedDt = assertPositive(fixedDt, "fixedDt");
        this.snapshotIntervalTicks = assertPositiveInteger(snapshotIntervalTicks, "snapshotIntervalTicks");
        this.inbox = new AuthorityCommandInbox({ maxPastTicks, maxFutureTicks });
        this.inputState = new InputStateSimulator({ holdTicks: inputHoldTicks });
    }

    submit(authenticatedPlayerId, batch) {
        if (!this.simulation.players.some(({ id }) => id === authenticatedPlayerId)) {
            throw new Error(`unknown authenticated playerId: ${authenticatedPlayerId}`);
        }
        if (batch.tick <= this.simulation.tick) {
            return createCommandReceipt({
                serverTick: this.simulation.tick,
                targetTick: batch.tick,
                accepted: Object.freeze([]),
                rejected: Object.freeze(
                    batch.commands.map(({ playerId, sequence }) =>
                        Object.freeze({ playerId, sequence, reason: "elapsed-tick" })
                    )
                )
            });
        }
        const foreignEntries = batch.commands.filter(({ playerId }) => playerId !== authenticatedPlayerId);
        if (foreignEntries.length > 0) {
            return createCommandReceipt({
                serverTick: this.simulation.tick,
                targetTick: batch.tick,
                accepted: Object.freeze([]),
                rejected: Object.freeze(
                    batch.commands.map(({ playerId, sequence }) =>
                        Object.freeze({ playerId, sequence, reason: "player-ownership" })
                    )
                )
            });
        }
        const result = this.inbox.ingest(batch, this.simulation.tick);
        return createCommandReceipt({
            serverTick: this.simulation.tick,
            targetTick: batch.tick,
            accepted: result.accepted,
            rejected: result.rejected
        });
    }

    advance() {
        const nextTick = this.simulation.tick + 1;
        const commands = this.inputState.expand(
            this.inbox.take(nextTick),
            this.simulation.players.map(({ id }) => id)
        );
        this.simulation.stepCommandBatch(this.fixedDt, commands);
        return nextTick % this.snapshotIntervalTicks === 0 ? this.snapshot() : null;
    }

    snapshot() {
        return buildAuthoritySnapshot({
            simulation: this.simulation,
            acknowledgements: this.inbox.acknowledgements()
        });
    }

    removePlayer(playerId) {
        this.inbox.removePlayer(playerId);
        this.inputState.removePlayer(playerId);
        return this.simulation.removePlayer(playerId);
    }
}
