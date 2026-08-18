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
    assert.equal(progress.snapshot().currentSectorId, "sector-01");
    assert.equal(progress.snapshot().currentLandmarkId, "sector-01:landmark:01");
    assert.equal(progress.snapshot().respawnAnchorId, "sector-01:entry");

    const firstRouteId = completeLandmark(progress, world, "sector-01:landmark:01");
    assert.equal(progress.isRouteUnlocked(firstRouteId), true);
    assert.equal(progress.visitLandmark("sector-01:landmark:02").accepted, true);
    assert.equal(progress.snapshot().respawnAnchorId, "sector-01:landmark:02:checkpoint");
    const stage02Snapshot = progress.snapshot();
    assert.deepEqual(new SectorProgressState(world, stage02Snapshot).snapshot(), stage02Snapshot);
    assert.throws(
        () =>
            new SectorProgressState(world, {
                ...stage02Snapshot,
                respawnAnchorId: "sector-01:landmark:03:checkpoint"
            }),
        /respawn anchor/
    );
    const encounterId = world.landmarks.find(({ id }) => id === "sector-02:landmark:02").encounterIds[0];
    assert.equal(progress.resolveEncounter(encounterId).reason, "encounter-not-current-sector");

    for (let order = 2; order <= 8; order += 1) {
        const sourceId = `sector-01:landmark:${String(order).padStart(2, "0")}`;
        const routeId = completeLandmark(progress, world, sourceId);
        if (routeId) {
            const route = world.routeLocks.find(({ id }) => id === routeId);
            if (route.requiredAccessModuleCount) {
                assert.equal(progress.visitLandmark(route.targetLandmarkId).reason, "landmark-route-locked");
                const [firstModuleId, secondModuleId] = world.sectors[0].accessModuleIds;
                assert.equal(progress.collectAccessModule(firstModuleId).changed, true);
                assert.equal(progress.accessSummary().ready, false);
                assert.equal(progress.collectAccessModule(secondModuleId).changed, true);
                assert.equal(progress.accessSummary().ready, true);
            }
            assert.equal(progress.visitLandmark(route.targetLandmarkId).accepted, true);
        }
    }
    assert.equal(progress.snapshot().currentSectorId, "sector-02");
    assert.equal(progress.snapshot().respawnAnchorId, "sector-02:entry");
    const priorObjectiveIds = progress.snapshot().completedObjectiveIds;

    completeLandmark(progress, world, "sector-02:landmark:01");
    const sector02Encounter = world.landmarks.find(({ id }) => id === "sector-02:landmark:02").encounterIds[0];
    progress.visitLandmark("sector-02:landmark:02");
    assert.equal(progress.resolveEncounter(sector02Encounter).accepted, true);
    const beforeSoloDeath = progress.snapshot();
    assert.deepEqual(progress.snapshot(), beforeSoloDeath, "solo respawn must not mutate shared Sector progress");

    const reset = progress.resetCurrentSector();
    assert.equal(reset.type, "sector-reset");
    assert.equal(reset.sectorId, "sector-02");
    assert.equal(reset.respawnAnchorId, "sector-02:entry");
    assert.deepEqual(progress.snapshot().completedObjectiveIds, priorObjectiveIds);
    assert.equal(progress.snapshot().resolvedEncounterIds.includes(sector02Encounter), false);
    assert.equal(progress.snapshot().currentLandmarkId, "sector-02:landmark:01");
    assert.equal(progress.snapshot().respawnAnchorId, "sector-02:entry");
    assert.equal(progress.baselineSnapshot().revision, reset.baselineRevision);

    const restored = new SectorProgressState(world, progress.snapshot());
    assert.deepEqual(restored.snapshot(), progress.snapshot());
    assert.throws(
        () => new SectorProgressState(world, { ...progress.snapshot(), currentSectorId: "missing" }),
        /unknown current Sector/
    );

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
            for (const accessModuleId of world.sectors[0].accessModuleIds.slice(0, route.requiredAccessModuleCount)) {
                boundary.collectAccessModule(accessModuleId);
            }
        }
        if (route) boundary.visitLandmark(route.targetLandmarkId);
    }
    assert.equal(boundary.snapshot().contentBoundaryReached, true);

    const resetAccess = new SectorProgressState(world);
    for (const accessModuleId of world.sectors[0].accessModuleIds.slice(0, 2)) {
        resetAccess.collectAccessModule(accessModuleId);
    }
    const accessSnapshot = resetAccess.snapshot();
    assert.equal(new SectorProgressState(world, accessSnapshot).accessSummary().ready, true);
    resetAccess.resetCurrentSector();
    assert.deepEqual(resetAccess.snapshot().collectedAccessModuleIds, []);
}
