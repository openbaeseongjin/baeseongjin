import assert from "node:assert/strict";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { SEAMLESS_SECTOR_RUNTIME_REVISION } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

function completeLandmark(progress, world, landmarkId) {
    const landmark = world.landmarks.find(({ id }) => id === landmarkId);
    for (const objectiveId of landmark.objectiveIds) {
        const objective = world.objectives.find(({ id }) => id === objectiveId);
        for (const requiredId of objective.requiredObjectiveIds ?? []) {
            if (!progress.isObjectiveComplete(requiredId)) progress.completeObjective(requiredId);
        }
        progress.completeObjective(objectiveId);
    }
    const route = world.routeLocks.find(({ sourceLandmarkId }) => sourceLandmarkId === landmarkId);
    if (route) progress.visitLandmark(route.targetLandmarkId);
}

export function run() {
    const debugStart = createCurrentGameSimulation({
        worldSeed: 9182,
        playerId: "debug-player",
        startAreaId: "sector-03-02"
    });
    assert.equal(debugStart.worldProgress.snapshot().currentLandmarkId, "sector-03:landmark:02");
    assert.equal(debugStart.activeRespawnAnchor.id, "sector-03:entry");

    const simulation = createCurrentGameSimulation({ worldSeed: 9182, playerId: "player-1" });
    assert.equal(simulation.world.definitionRevision, SEAMLESS_SECTOR_RUNTIME_REVISION);
    assert.equal(simulation.world.areas.length, 0);
    assert.equal(simulation.world.gates.length, 0);
    assert.equal(simulation.activeCheckpoint, null);
    assert.equal(simulation.activeRespawnAnchor.id, "sector-01:entry");

    const owner = simulation.players[0];
    const teammate = simulation.addPlayer(
        { x: owner.physics.position.x + 80, y: owner.physics.position.y },
        "player-2"
    ).entity;
    completeLandmark(simulation.worldProgress, simulation.world, "sector-01:landmark:01");
    const progressBeforeSoloDeath = simulation.worldProgress.snapshot();
    const teammateBefore = teammate.physics.position.clone();
    const removedEnemyId = simulation.enemies[0].objectId;
    simulation.enemies = simulation.enemies.slice(1);
    owner.physics.position.set(900, -500);
    assert.equal(simulation.respawnPlayerAtCheckpoint(owner, "health", "solo-death"), true);
    assert.deepEqual(simulation.worldProgress.snapshot(), progressBeforeSoloDeath);
    assert.equal(
        simulation.enemies.some(({ objectId }) => objectId === removedEnemyId),
        false
    );
    assert.deepEqual(teammate.physics.position, teammateBefore);
    assert.deepEqual(
        { x: owner.physics.position.x, y: owner.physics.position.y },
        {
            x: simulation.activeRespawnAnchor.position.x,
            y: simulation.activeRespawnAnchor.position.y
        }
    );
    assert.equal(simulation.snapshot().eventFlash.type, "sector-respawn");

    completeLandmark(simulation.worldProgress, simulation.world, "sector-01:landmark:02");
    const baselineBeforeWipe = simulation.worldProgress.snapshot().sectorBaselineRevision;
    const currentSectorEnemyIds = new Set(
        simulation.world.enemySpawns
            .filter(({ sectorId }) => sectorId === "sector-01")
            .map(({ encounterId }) => encounterId)
    );
    simulation.enemies = simulation.enemies.filter(({ objectId }) => !currentSectorEnemyIds.has(objectId));
    simulation.respawnPlayerAtCheckpoint(owner, "health", "party-wipe");
    simulation.respawnPlayerAtCheckpoint(teammate, "health", "party-wipe");
    assert.equal(simulation.worldProgress.snapshot().currentLandmarkId, "sector-01:landmark:01");
    assert.equal(simulation.worldProgress.snapshot().completedObjectiveIds.length, 0);
    assert.ok(simulation.worldProgress.snapshot().sectorBaselineRevision > baselineBeforeWipe);
    assert.ok(simulation.enemies.some(({ objectId }) => currentSectorEnemyIds.has(objectId)));
    assert.equal(simulation.snapshot().eventFlash.type, "sector-reset");
    for (const player of simulation.players) {
        assert.deepEqual(
            { x: player.physics.position.x, y: player.physics.position.y },
            {
                x: simulation.activeRespawnAnchor.position.x,
                y: simulation.activeRespawnAnchor.position.y
            }
        );
    }
}
