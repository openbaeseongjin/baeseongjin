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
    server.startBossEncounter();
    server.interactBossBreaker(ownerId, server.snapshot().bossRuntime.currentBreakerId);
    server.applyBossDamage(ownerId, 45);
    const snapshot = buildAuthoritySnapshot({ simulation: server });
    assert.equal(snapshot.worldRevision, SEAMLESS_SECTOR_RUNTIME_REVISION);
    assert.equal(snapshot.state.progressKind, "sector");
    assert.equal(snapshot.state.players[0].respawnAnchorId, "sector-01:entry");
    assert.equal(snapshot.state.players[0].actionState.loadout.baseActionId, "default-punch");
    assert.equal(snapshot.state.players[0].actionState.chargesRemaining, 1);
    assert.equal("respawnAnchorId" in snapshot.state, false);
    assert.equal("activeCheckpointId" in snapshot.state, false);
    assert.equal("currentSectorId" in snapshot.state.worldProgress, false);
    assert.equal("enemyType" in snapshot.state.enemies[0], false, "authored enemy static data must not repeat at 20Hz");
    assert.ok(
        JSON.stringify(snapshot.state.enemies).length < JSON.stringify(server.enemyStates()).length * 0.6,
        "dynamic enemy replication must materially reduce the enemy payload"
    );
    assert.equal("partyWipeBaseline" in snapshot.state, false);
    assert.equal(snapshot.state.bossRuntime.health, 315);
    assert.equal(snapshot.state.bossRuntime.shieldState, "exposed");
    assert.deepEqual(
        snapshot.events.filter(({ eventType }) => eventType.startsWith("boss-")).map(({ eventType }) => eventType),
        ["boss-encounter-started", "boss-core-exposed", "boss-damaged"]
    );

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
    assert.equal(
        predictor.simulation.enemyStates()[0].enemyType,
        server.enemyStates()[0].enemyType,
        "the client world revision must hydrate omitted enemy static data"
    );
    assert.equal(predictor.renderSnapshot().world.definitionRevision, SEAMLESS_SECTOR_RUNTIME_REVISION);
    assert.equal(predictor.simulation.activeRespawnAnchor.id, "sector-01:entry");
    assert.equal(predictor.simulation.playerState(ownerId).actionState.loadout.baseActionId, "default-punch");
    assert.deepEqual(predictor.simulation.worldProgress.snapshot(), snapshot.state.worldProgress);
    assert.deepEqual(predictor.simulation.snapshot().bossRuntime, snapshot.state.bossRuntime);

    const objectiveId = server.world.landmarks[0].objectiveIds[0];
    server.worldProgress.completeObjective(objectiveId);
    server.restoreWorldProgress(server.worldProgress.snapshot());
    const stage02Anchor = server.world.respawnAnchors.find(({ id }) => id === "sector-01:landmark:02:checkpoint");
    const ownerMotion = server.playerState(ownerId);
    server.applyOwnerMotion(ownerId, {
        ...ownerMotion,
        clientTick: server.getTick(),
        position: stage02Anchor.position,
        respawnAnchorId: stage02Anchor.id
    });
    const progressed = buildAuthoritySnapshot({ simulation: server });
    assert.equal(progressed.state.players[0].respawnAnchorId, "sector-01:landmark:02:checkpoint");
    const stage03Anchor = server.world.respawnAnchors.find(({ id }) => id === "sector-01:landmark:03:checkpoint");
    server.applyOwnerMotion(ownerId, {
        ...server.playerState(ownerId),
        clientTick: server.getTick() + 1,
        position: stage03Anchor.position,
        respawnAnchorId: stage03Anchor.id
    });
    assert.equal(
        server.playerState(ownerId).respawnAnchorId,
        stage03Anchor.id,
        "owner motion must accept the physically touched save point without Stage-entry state"
    );
    predictor.reconcile(progressed, []);
    assert.ok(predictor.simulation.worldProgress.snapshot().completedObjectiveIds.includes(objectiveId));
    assert.equal(predictor.simulation.activeRespawnAnchor.id, "sector-01:landmark:02:checkpoint");

    const wrongRevision = { ...progressed, worldRevision: "legacy-mismatch" };
    assert.throws(() => predictor.reconcile(wrongRevision, []), /world revision mismatch/);
}
