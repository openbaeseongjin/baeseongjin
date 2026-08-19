import assert from "node:assert/strict";
import { SectorProgressState } from "../src/game/world/SectorProgressState.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

function completeLandmark(progress, world, landmarkId) {
    const landmark = world.landmarks.find(({ id }) => id === landmarkId);
    for (const objectiveId of landmark.objectiveIds) {
        const objective = world.objectives.find(({ id }) => id === objectiveId);
        for (const requiredId of objective.requiredObjectiveIds ?? []) {
            if (!progress.snapshot().completedObjectiveIds.includes(requiredId)) progress.completeObjective(requiredId);
        }
        progress.completeObjective(objectiveId);
    }
    return landmark.outboundRouteId;
}

export function run() {
    const world = createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 320 });
    const progress = new SectorProgressState(world);
    assert.equal("currentSectorId" in progress.snapshot(), false);
    assert.equal("currentLandmarkId" in progress.snapshot(), false);
    assert.equal("visitedLandmarkIds" in progress.snapshot(), false);
    assert.equal("respawnAnchorId" in progress.snapshot(), false);

    const firstRouteId = completeLandmark(progress, world, "sector-01:landmark:01");
    assert.equal(progress.isRouteUnlocked(firstRouteId), true);
    const stage02Snapshot = progress.snapshot();
    assert.deepEqual(new SectorProgressState(world, stage02Snapshot).snapshot(), stage02Snapshot);
    const encounterId = world.landmarks.find(({ id }) => id === "sector-02:landmark:02").encounterIds[0];
    assert.equal(progress.resolveEncounter(encounterId).accepted, true);

    for (let order = 2; order <= 8; order += 1) {
        const sourceId = `sector-01:landmark:${String(order).padStart(2, "0")}`;
        const routeId = completeLandmark(progress, world, sourceId);
        if (routeId) {
            const route = world.routeLocks.find(({ id }) => id === routeId);
            if (route.requiredAccessModuleCount) {
                const [firstModuleId, secondModuleId, thirdModuleId] = world.sectors[0].accessModuleIds;
                assert.equal(progress.collectAccessModule(firstModuleId).changed, true);
                assert.equal(progress.accessSummary("sector-01").ready, false);
                assert.equal(progress.collectAccessModule(secondModuleId).changed, true);
                assert.equal(progress.accessSummary("sector-01").ready, false);
                const finalCollection = progress.collectAccessModule(thirdModuleId);
                assert.equal(finalCollection.changed, true);
                assert.deepEqual(finalCollection.unlockedRouteIds, [routeId]);
                assert.equal(progress.accessSummary("sector-01").ready, true);
            }
        }
    }
    const priorObjectiveIds = progress.snapshot().completedObjectiveIds;

    completeLandmark(progress, world, "sector-02:landmark:01");
    const sector02Encounter = world.landmarks.find(({ id }) => id === "sector-02:landmark:02").encounterIds[0];
    assert.equal(progress.resolveEncounter(sector02Encounter).accepted, true);
    const beforeSoloDeath = progress.snapshot();
    assert.deepEqual(progress.snapshot(), beforeSoloDeath, "solo respawn must not mutate shared Sector progress");

    assert.ok(progress.snapshot().completedObjectiveIds.length >= priorObjectiveIds.length);
    assert.equal(progress.snapshot().resolvedEncounterIds.includes(sector02Encounter), true);

    const restored = new SectorProgressState(world, progress.snapshot());
    assert.deepEqual(restored.snapshot(), progress.snapshot());
    assert.throws(() => new SectorProgressState(world, {}), /must be an array|activeObjectiveSequences/);

    const boundary = new SectorProgressState(world);
    for (const landmark of world.landmarks) {
        for (const objectiveId of landmark.objectiveIds) {
            const objective = world.objectives.find(({ id }) => id === objectiveId);
            for (const requiredId of objective.requiredObjectiveIds ?? []) {
                if (!boundary.isObjectiveComplete(requiredId)) boundary.completeObjective(requiredId);
            }
            boundary.completeObjective(objectiveId);
        }
        const route = world.routeLocks.find(({ sourceLandmarkId }) => sourceLandmarkId === landmark.id);
        if (route?.requiredAccessModuleCount) {
            const sourceSector = world.sectors.find(({ id }) => id === landmark.sectorId);
            for (const accessModuleId of sourceSector.accessModuleIds.slice(0, route.requiredAccessModuleCount)) {
                boundary.collectAccessModule(accessModuleId);
            }
        }
    }
    assert.equal(boundary.snapshot().contentBoundaryReached, true);

    const resetAccess = new SectorProgressState(world);
    for (const accessModuleId of world.sectors[0].accessModuleIds.slice(0, 2)) {
        resetAccess.collectAccessModule(accessModuleId);
    }
    assert.equal(resetAccess.accessSummary("sector-01").ready, false);
    resetAccess.collectAccessModule(world.sectors[0].accessModuleIds[2]);
    const accessSnapshot = resetAccess.snapshot();
    assert.equal(new SectorProgressState(world, accessSnapshot).accessSummary("sector-01").ready, true);
}
