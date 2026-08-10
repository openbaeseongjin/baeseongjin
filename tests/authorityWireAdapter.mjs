import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { deserializeCommandReceipt } from "../src/game/network/CommandReceipt.js";
import { serializePlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { deserializeWorldSnapshotEnvelope } from "../src/game/network/WorldSnapshotEnvelope.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { AuthorityWireAdapter } from "../src/game/runtime/AuthorityWireAdapter.js";
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
    const adapter = new AuthorityWireAdapter(new AuthorityServerSession({ simulation, snapshotIntervalTicks: 6 }));
    const streams = [
        new RemoteCommandStream({ playerId: simulation.playerEntity.id }),
        new RemoteCommandStream({ playerId: partner.entity.id })
    ];

    let snapshot = null;
    for (let tick = 1; tick <= 6; tick += 1) {
        for (const [index, stream] of streams.entries()) {
            const batch = stream.createBatch(simulation.tick, command(index === 0 ? 1 : -1));
            const receipt = deserializeCommandReceipt(
                adapter.receiveCommand(stream.playerId, serializePlayerCommandBatch(batch))
            );
            assert.equal(receipt.accepted[0].sequence, tick - 1);
            assert.deepEqual(stream.acceptReceipt(receipt), []);
        }
        const serializedSnapshot = adapter.advance();
        if (serializedSnapshot) snapshot = deserializeWorldSnapshotEnvelope(serializedSnapshot);
    }

    assert.equal(snapshot.serverTick, 6);
    for (const stream of streams) {
        assert.equal(stream.acceptSnapshot(snapshot), true);
        assert.equal(stream.pendingBatches().length, 0);
    }
    assert.ok(simulation.player.velocity.x > 0);
    assert.ok(partner.physics.velocity.x < 0);
    assert.equal(deserializeWorldSnapshotEnvelope(adapter.snapshot()).serverTick, 6);
    assert.throws(() => adapter.receiveCommand(streams[0].playerId, '{"protocolVersion":99}'), /unsupported/);
}
