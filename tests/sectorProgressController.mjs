import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { advanceSectorProgress } from "../src/game/world/SectorProgressController.js";
import { SectorProgressState } from "../src/game/world/SectorProgressState.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

function player(id, position) {
    return {
        id,
        lifeState: "active",
        physics: { position: new Vector2(position.x, position.y) }
    };
}

function completeObjectives(progress, world, landmark) {
    for (const objectiveId of landmark.objectiveIds) {
        const objective = world.objectives.find(({ id }) => id === objectiveId);
        for (const requiredId of objective.requiredObjectiveIds ?? []) {
            if (!progress.isObjectiveComplete(requiredId)) progress.completeObjective(requiredId);
        }
        progress.completeObjective(objectiveId);
    }
}

export function run() {
    const world = createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 320 });
    const progress = new SectorProgressState(world);
    const first = world.landmarks[0];
    const second = world.landmarks[1];
    const firstObjective = world.objectives.find(({ id }) => id === first.objectiveIds[0]);
    assert.equal(firstObjective.type, "reach");
    assert.equal(firstObjective.sourceObjectId, undefined);
    const owner = player("player-1", {
        x: firstObjective.bounds.x + firstObjective.bounds.width * 0.5,
        y: firstObjective.bounds.y + firstObjective.bounds.height * 0.5
    });
    const commands = new Map();

    assert.equal(progress.isRouteUnlocked(first.outboundRouteId), false);
    let events = advanceSectorProgress({ world, progress, players: [owner], commandsByPlayerId: commands, dt: 0 });
    assert.equal(events[0].type, "objective-sequence-started");
    events = advanceSectorProgress({ world, progress, players: [owner], commandsByPlayerId: new Map(), dt: 3 });
    assert.ok(events.some(({ type }) => type === "objective-completed"));
    assert.ok(events.some(({ type, routeId }) => type === "route-unlocked" && routeId === first.outboundRouteId));

    owner.physics.position.set(second.entry.x, second.entry.y);
    events = advanceSectorProgress({ world, progress, players: [owner], commandsByPlayerId: new Map(), dt: 0 });
    assert.ok(events.some(({ type, landmarkId }) => type === "landmark-entered" && landmarkId === second.id));
    assert.equal(progress.snapshot().currentLandmarkId, second.id);
    assert.deepEqual(
        owner.physics.position,
        new Vector2(second.entry.x, second.entry.y),
        "progress must not teleport the player"
    );

    const sectorTransitionRoute = world.routeLocks.find(
        ({ targetLandmarkId }) => targetLandmarkId === "sector-02:landmark:01"
    );
    while (progress.snapshot().currentLandmarkId !== sectorTransitionRoute.sourceLandmarkId) {
        const current = world.landmarks.find(({ id }) => id === progress.snapshot().currentLandmarkId);
        completeObjectives(progress, world, current);
        progress.visitLandmark(world.routeLocks.find(({ id }) => id === current.outboundRouteId).targetLandmarkId);
    }
    const transitionSource = world.landmarks.find(({ id }) => id === sectorTransitionRoute.sourceLandmarkId);
    completeObjectives(progress, world, transitionSource);
    const target = world.landmarks.find(({ id }) => id === sectorTransitionRoute.targetLandmarkId);
    owner.physics.position.set(target.entry.x, target.entry.y);
    events = advanceSectorProgress({ world, progress, players: [owner], commandsByPlayerId: new Map(), dt: 0 });
    assert.ok(events.some(({ type }) => type === "sector-entered"));
    assert.equal(progress.snapshot().currentSectorId, "sector-02");
    assert.equal(progress.snapshot().respawnAnchorId, "sector-02:entry");
}
