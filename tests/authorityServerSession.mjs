import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
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
    const lateSimulation = new GameSimulation();
    lateSimulation.enemies = [];
    const lateSession = new AuthorityServerSession({ simulation: lateSimulation });
    lateSession.advance();
    const elapsed = lateSession.submit(
        lateSimulation.playerEntity.id,
        createPlayerCommandBatch(1, [{ playerId: lateSimulation.playerEntity.id, sequence: 99, command: command(1) }])
    );
    assert.equal(elapsed.rejected[0].reason, "elapsed-tick");
    assert.deepEqual(lateSession.inbox.acknowledgements(), {}, "an unapplied command must never be acknowledged");
    const next = lateSession.submit(
        lateSimulation.playerEntity.id,
        createPlayerCommandBatch(2, [{ playerId: lateSimulation.playerEntity.id, sequence: 0, command: command(1) }])
    );
    assert.equal(next.accepted.length, 1, "a rejected high sequence must not poison the next executable command");
    lateSession.advance();
    assert.ok(lateSimulation.player.velocity.x > 0);
    const velocityAfterCommand = lateSimulation.player.velocity.x;
    lateSession.advance();
    assert.ok(
        lateSimulation.player.velocity.x > velocityAfterCommand,
        "the latest input state must continue across an empty 120Hz authority tick"
    );

    const expiringSimulation = new GameSimulation();
    expiringSimulation.enemies = [];
    const expiringSession = new AuthorityServerSession({ simulation: expiringSimulation, inputHoldTicks: 2 });
    expiringSession.submit(
        expiringSimulation.playerEntity.id,
        createPlayerCommandBatch(1, [
            { playerId: expiringSimulation.playerEntity.id, sequence: 0, command: command(1) }
        ])
    );
    expiringSession.advance();
    expiringSession.advance();
    const velocityBeforeExpiry = expiringSimulation.player.velocity.x;
    expiringSession.advance();
    assert.ok(
        expiringSimulation.player.velocity.x <= velocityBeforeExpiry,
        "stale movement must stop accelerating after the bounded hold window"
    );

    const simulation = new GameSimulation();
    const partner = simulation.addPlayer({ x: 180, y: 500 });
    simulation.enemies = [];
    const session = new AuthorityServerSession({ simulation, snapshotIntervalTicks: 6 });

    const forged = session.submit(
        simulation.playerEntity.id,
        createPlayerCommandBatch(1, [{ playerId: partner.entity.id, sequence: 0, command: command(-1) }])
    );
    assert.equal(forged.accepted.length, 0);
    assert.equal(forged.rejected[0].reason, "player-ownership");
    assert.deepEqual(session.inbox.acknowledgements(), {});

    let snapshot = null;
    for (let tick = 1; tick <= 6; tick += 1) {
        const primaryResult = session.submit(
            simulation.playerEntity.id,
            createPlayerCommandBatch(tick, [
                { playerId: simulation.playerEntity.id, sequence: tick - 1, command: command(1) }
            ])
        );
        const partnerResult = session.submit(
            partner.entity.id,
            createPlayerCommandBatch(tick, [{ playerId: partner.entity.id, sequence: tick - 1, command: command(-1) }])
        );
        assert.equal(primaryResult.accepted.length, 1);
        assert.equal(partnerResult.accepted.length, 1);
        snapshot = session.advance();
        if (tick < 6) assert.equal(snapshot, null);
    }

    assert.ok(simulation.player.velocity.x > 0);
    assert.ok(partner.physics.velocity.x < 0);
    assert.equal(snapshot.serverTick, 6);
    assert.equal(Object.hasOwn(snapshot.state, "combatEffects"), false, "server snapshots must not carry client VFX");
    assert.equal(Object.hasOwn(snapshot.state, "impact"), false, "server snapshots must not carry camera feedback");
    assert.deepEqual(snapshot.acknowledgements, {
        [simulation.playerEntity.id]: 5,
        [partner.entity.id]: 5
    });
    assert.equal(snapshot.state.players.length, 2);
    assert.deepEqual(session.snapshot().events, [], "events must drain after their scheduled snapshot");
    assert.throws(() => session.submit("missing-player", createPlayerCommandBatch(7, [])), /unknown authenticated/);
}
