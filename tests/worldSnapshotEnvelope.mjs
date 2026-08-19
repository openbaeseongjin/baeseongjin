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
    assert.equal(envelope.protocolVersion, 11);
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
            worldProgress: {
                currentSectorId: "sector-01"
            },
            bossRuntime: {
                encounterId: "boss-01:containment-gantry-c-01",
                status: "active",
                phase: 1,
                health: 360
            },
            players: [
                {
                    ...envelope.state.players[0],
                    respawnAnchorId: "sector-01:landmark:02:checkpoint"
                }
            ],
            enemies: []
        }
    });
    assert.equal(sectorEnvelope.state.players[0].respawnAnchorId, "sector-01:landmark:02:checkpoint");
    assert.equal("respawnAnchorId" in sectorEnvelope.state, false);
    assert.equal("partyWipeBaseline" in sectorEnvelope.state, false);
    assert.equal("activeCheckpointId" in sectorEnvelope.state, false);
    assert.equal(sectorEnvelope.state.bossRuntime.encounterId, "boss-01:containment-gantry-c-01");
    assert.throws(
        () =>
            createWorldSnapshotEnvelope({
                ...envelope,
                state: {
                    ...sectorEnvelope.state,
                    players: [{ ...sectorEnvelope.state.players[0], respawnAnchorId: "" }]
                }
            }),
        /players\[\]\.respawnAnchorId/
    );
    assert.throws(
        () =>
            createWorldSnapshotEnvelope({
                ...envelope,
                state: {
                    ...sectorEnvelope.state,
                    respawnAnchorId: "sector-01:landmark:02:checkpoint"
                }
            }),
        /must not include respawnAnchorId/
    );
    assert.throws(
        () =>
            createWorldSnapshotEnvelope({
                ...envelope,
                state: {
                    ...sectorEnvelope.state,
                    partyWipeBaseline: { sectorId: "sector-01" }
                }
            }),
        /must not include partyWipeBaseline/
    );
}
