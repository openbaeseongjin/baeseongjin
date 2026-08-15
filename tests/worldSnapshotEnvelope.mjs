import assert from "node:assert/strict";
import {
    createWorldSnapshotEnvelope,
    deserializeWorldSnapshotEnvelope,
    serializeWorldSnapshotEnvelope,
    WORLD_SNAPSHOT_PROTOCOL_VERSION
} from "../src/game/network/WorldSnapshotEnvelope.js";

function envelopeWithPlayer(player) {
    return createWorldSnapshotEnvelope({
        snapshotSequence: 4,
        serverTick: 12,
        worldSeed: 1234,
        worldRevision: "test-world",
        acknowledgements: { "player-1": 8 },
        state: { players: [player], enemies: [] },
        events: []
    });
}

export function run() {
    const envelope = envelopeWithPlayer({
        id: "player-1",
        ownerMotionTick: 38,
        position: { x: 10, y: 20 }
    });
    assert.equal(envelope.protocolVersion, WORLD_SNAPSHOT_PROTOCOL_VERSION);
    assert.equal(envelope.protocolVersion, 6);
    assert.equal(envelope.state.players[0].ownerMotionTick, 38);
    assert.deepEqual(deserializeWorldSnapshotEnvelope(serializeWorldSnapshotEnvelope(envelope)), envelope);
    assert.throws(() => envelopeWithPlayer({ id: "player-1", position: { x: 10, y: 20 } }), /ownerMotionTick/);
    assert.throws(
        () => envelopeWithPlayer({ id: "player-1", ownerMotionTick: -1, position: { x: 10, y: 20 } }),
        /ownerMotionTick/
    );
    assert.throws(() => deserializeWorldSnapshotEnvelope('{"protocolVersion":4}'), /unsupported world snapshot/);
}
