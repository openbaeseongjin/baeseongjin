import assert from "node:assert/strict";
import { createWorldSnapshotEnvelope } from "../src/game/network/WorldSnapshotEnvelope.js";
import { RemoteWorldStateBuffer } from "../src/game/runtime/RemoteWorldStateBuffer.js";

function snapshot(serverTick, { players, enemies, eventId }) {
    return createWorldSnapshotEnvelope({
        serverTick,
        worldSeed: 1,
        worldRevision: "test-world",
        acknowledgements: {},
        state: {
            players,
            enemies,
            activeCheckpointId: `checkpoint-${serverTick}`,
            runState: "playing"
        },
        events: eventId ? [{ eventId, eventType: "test", tick: serverTick }] : []
    });
}

export function run() {
    const buffer = new RemoteWorldStateBuffer();
    assert.equal(buffer.sample(), null);
    const first = snapshot(6, {
        players: [
            { id: "player-a", position: { x: 0, y: 10 }, health: 100, lifeState: "active", rope: { isAttached: true } },
            { id: "removed", position: { x: 5, y: 5 }, health: 100 }
        ],
        enemies: [{ id: "enemy-a", position: { x: 20, y: 30 }, health: 20 }],
        eventId: "event-6"
    });
    const second = snapshot(12, {
        players: [
            {
                id: "player-a",
                position: { x: 12, y: 22 },
                health: 40,
                lifeState: "downed",
                rope: { isAttached: false }
            },
            { id: "spawned", position: { x: 100, y: 200 }, health: 100 }
        ],
        enemies: [{ id: "enemy-a", position: { x: 32, y: 18 }, health: 5 }],
        eventId: "event-12"
    });

    assert.equal(buffer.push(first), true);
    assert.equal(buffer.push(second), true);
    assert.equal(buffer.push(first), false, "a reordered snapshot must not replace newer state");
    const middle = buffer.sample(0.5);
    assert.deepEqual(middle.players[0].position, { x: 6, y: 16 });
    assert.equal(middle.players[0].health, 40, "health must use the latest authoritative value");
    assert.equal(middle.players[0].lifeState, "downed");
    assert.equal(middle.players[0].rope.isAttached, false);
    assert.equal(
        middle.players.some(({ id }) => id === "removed"),
        false
    );
    assert.deepEqual(middle.players[1].position, { x: 100, y: 200 }, "a new entity must start at its latest position");
    assert.deepEqual(middle.enemies[0].position, { x: 26, y: 24 });
    assert.equal(middle.activeCheckpointId, "checkpoint-12");
    assert.deepEqual(
        buffer.drainEvents().map(({ eventId }) => eventId),
        ["event-6", "event-12"]
    );
    assert.deepEqual(buffer.drainEvents(), []);
    assert.deepEqual(buffer.sample(-1).players[0].position, { x: 0, y: 10 });
    assert.deepEqual(buffer.sample(2).players[0].position, { x: 12, y: 22 });
    assert.throws(() => buffer.sample(Number.NaN), /alpha must be finite/);
}
