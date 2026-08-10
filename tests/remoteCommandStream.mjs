import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { deserializePlayerCommandBatch, serializePlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import {
    deserializeWorldSnapshotEnvelope,
    serializeWorldSnapshotEnvelope
} from "../src/game/network/WorldSnapshotEnvelope.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { createCommandReceipt } from "../src/game/network/CommandReceipt.js";
import { RemoteCommandStream } from "../src/game/runtime/RemoteCommandStream.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

function command(horizontal) {
    return createPlayerCommand(
        {
            horizontal,
            vertical: 0,
            interact: false,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
}

export function run() {
    const simulation = new GameSimulation();
    const partner = simulation.addPlayer({ x: 180, y: 500 });
    simulation.enemies = [];
    const session = new AuthorityServerSession({ simulation, snapshotIntervalTicks: 6 });
    const primaryStream = new RemoteCommandStream({ playerId: simulation.playerEntity.id });
    const partnerStream = new RemoteCommandStream({ playerId: partner.entity.id });
    let firstSnapshot = null;
    let latestSnapshot = null;

    for (let tick = 1; tick <= 12; tick += 1) {
        const primaryBatch = deserializePlayerCommandBatch(
            serializePlayerCommandBatch(primaryStream.createBatch(simulation.tick, command(1)))
        );
        const partnerBatch = deserializePlayerCommandBatch(
            serializePlayerCommandBatch(partnerStream.createBatch(simulation.tick, command(-1)))
        );
        session.submit(primaryStream.playerId, primaryBatch);
        session.submit(partnerStream.playerId, partnerBatch);
        const snapshot = session.advance();
        if (!snapshot) continue;
        latestSnapshot = deserializeWorldSnapshotEnvelope(serializeWorldSnapshotEnvelope(snapshot));
        if (!firstSnapshot) firstSnapshot = latestSnapshot;
        assert.equal(primaryStream.acceptSnapshot(latestSnapshot), true);
        assert.equal(partnerStream.acceptSnapshot(latestSnapshot), true);
        assert.equal(primaryStream.pendingBatches().length, 0);
        assert.equal(partnerStream.pendingBatches().length, 0);
    }

    assert.equal(latestSnapshot.serverTick, 12);
    assert.equal(primaryStream.latestServerTick, 12);
    assert.equal(primaryStream.acceptSnapshot(firstSnapshot), false, "an older reordered snapshot must be ignored");
    assert.equal(primaryStream.latestSnapshot.serverTick, 12);
    assert.ok(simulation.player.velocity.x > 0);
    assert.ok(partner.physics.velocity.x < 0);

    const queued = new RemoteCommandStream({ playerId: "queued-player", inputLeadTicks: 2 });
    assert.equal(queued.createBatch(10, command(0)).tick, 12);
    assert.equal(queued.createBatch(10, command(0)).tick, 13, "target ticks must remain monotonic between snapshots");
    assert.deepEqual(
        queued.pendingBatches().map(({ commands }) => commands[0].sequence),
        [0, 1]
    );
    const rejection = createCommandReceipt({
        serverTick: 10,
        targetTick: 12,
        rejected: [{ playerId: "queued-player", sequence: 0, reason: "elapsed-tick" }]
    });
    assert.equal(queued.acceptReceipt(rejection).length, 1);
    assert.deepEqual(
        queued.pendingBatches().map(({ commands }) => commands[0].sequence),
        [1],
        "a rejected command must leave the pending queue without waiting for snapshot ACK"
    );
    assert.deepEqual(queued.acceptReceipt(rejection), [], "a duplicate receipt must be idempotent");
}
