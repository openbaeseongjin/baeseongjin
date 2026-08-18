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
        state: { progressKind: "area", activeCheckpointId: null, players: [player], enemies: [] },
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
    assert.equal(envelope.protocolVersion, 8);
    assert.equal(envelope.state.players[0].ownerMotionTick, 38);
    assert.deepEqual(deserializeWorldSnapshotEnvelope(serializeWorldSnapshotEnvelope(envelope)), envelope);
    assert.throws(() => envelopeWithPlayer({ id: "player-1", position: { x: 10, y: 20 } }), /ownerMotionTick/);
    assert.throws(
        () => envelopeWithPlayer({ id: "player-1", ownerMotionTick: -1, position: { x: 10, y: 20 } }),
        /ownerMotionTick/
    );
    assert.throws(() => deserializeWorldSnapshotEnvelope('{"protocolVersion":4}'), /unsupported world snapshot/);
    const sectorEnvelope = createWorldSnapshotEnvelope({
        ...envelope,
        state: {
            progressKind: "sector",
            respawnAnchorId: "sector-01:entry",
            partyWipeBaseline: {
                sectorId: "sector-01",
                revision: 0,
                respawnAnchorId: "sector-01:entry",
                entryLandmarkId: "sector-01:landmark:01"
            },
            worldProgress: { currentSectorId: "sector-01" },
            players: envelope.state.players,
            enemies: []
        }
    });
    assert.equal(sectorEnvelope.state.respawnAnchorId, "sector-01:entry");
    assert.equal("activeCheckpointId" in sectorEnvelope.state, false);
    assert.throws(
        () =>
            createWorldSnapshotEnvelope({
                ...envelope,
                state: {
                    progressKind: "sector",
                    respawnAnchorId: "sector-01:entry",
                    partyWipeBaseline: sectorEnvelope.state.partyWipeBaseline,
                    worldProgress: sectorEnvelope.state.worldProgress,
                    activeCheckpointId: "checkpoint:legacy",
                    players: envelope.state.players,
                    enemies: []
                }
            }),
        /must not include activeCheckpointId/
    );
    assert.throws(
        () =>
            createWorldSnapshotEnvelope({
                ...envelope,
                state: {
                    progressKind: "sector",
                    respawnAnchorId: "sector-01:entry",
                    worldProgress: { currentSectorId: "sector-01" },
                    players: envelope.state.players,
                    enemies: []
                }
            }),
        /partyWipeBaseline must be an object/
    );
    assert.throws(
        () =>
            createWorldSnapshotEnvelope({
                ...envelope,
                state: {
                    progressKind: "sector",
                    respawnAnchorId: "sector-01:entry",
                    partyWipeBaseline: {
                        sectorId: "sector-01",
                        revision: -1,
                        respawnAnchorId: "sector-01:entry",
                        entryLandmarkId: "sector-01:landmark:01"
                    },
                    worldProgress: { currentSectorId: "sector-01" },
                    players: envelope.state.players,
                    enemies: []
                }
            }),
        /partyWipeBaseline.revision/
    );
}
