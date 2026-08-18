import assert from "node:assert/strict";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
import {
    createCurrentGameSimulation,
    createGameSimulationForWorldRevision
} from "../src/game/simulation/GameSimulationFactory.js";
import { SEAMLESS_SECTOR_RUNTIME_REVISION } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

export function run() {
    const server = createCurrentGameSimulation({ worldSeed: 2718, playerId: "player-1" });
    const ownerId = server.getPrimaryPlayerId();
    const snapshot = buildAuthoritySnapshot({ simulation: server });
    assert.equal(snapshot.worldRevision, SEAMLESS_SECTOR_RUNTIME_REVISION);
    assert.equal(snapshot.state.progressKind, "sector");
    assert.equal(snapshot.state.respawnAnchorId, "sector-01:entry");
    assert.equal("activeCheckpointId" in snapshot.state, false);
    assert.equal(snapshot.state.worldProgress.currentSectorId, "sector-01");
    assert.deepEqual(snapshot.state.partyWipeBaseline, {
        sectorId: "sector-01",
        revision: 0,
        respawnAnchorId: "sector-01:entry",
        entryLandmarkId: "sector-01:landmark:01"
    });

    const predictor = new OwnerPredictionRuntime({
        ownerId,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: snapshot.worldSeed,
            playerId: ownerId,
            worldRevision: snapshot.worldRevision
        })
    });
    predictor.reconcile(snapshot, []);
    assert.equal(predictor.renderSnapshot().world.definitionRevision, SEAMLESS_SECTOR_RUNTIME_REVISION);
    assert.equal(predictor.simulation.activeRespawnAnchor.id, "sector-01:entry");
    assert.deepEqual(predictor.simulation.worldProgress.snapshot(), snapshot.state.worldProgress);

    const objectiveId = server.world.landmarks[0].objectiveIds[0];
    server.worldProgress.completeObjective(objectiveId);
    server.worldProgress.visitLandmark("sector-01:landmark:02");
    server.restoreWorldProgress(server.worldProgress.snapshot());
    const progressed = buildAuthoritySnapshot({ simulation: server });
    assert.equal(progressed.state.respawnAnchorId, "sector-01:landmark:02:checkpoint");
    assert.equal(progressed.state.partyWipeBaseline.respawnAnchorId, "sector-01:entry");
    predictor.reconcile(progressed, []);
    assert.ok(predictor.simulation.worldProgress.snapshot().completedObjectiveIds.includes(objectiveId));
    assert.equal(predictor.simulation.activeRespawnAnchor.id, "sector-01:landmark:02:checkpoint");

    const wrongRevision = { ...progressed, worldRevision: "legacy-mismatch" };
    assert.throws(() => predictor.reconcile(wrongRevision, []), /world revision mismatch/);
}
