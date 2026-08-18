import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
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
    const futureChoiceObjective = world.objectives.find(
        ({ landmarkId, type }) => landmarkId === "sector-01:landmark:04" && type === "interact-choice"
    );
    const futureChoiceSource = world.objects.find(({ id }) => id === futureChoiceObjective.sourceObjectId);
    const staleProgressPlayer = player("stale-progress-player", futureChoiceSource.position);
    const staleChoiceEvents = advanceSectorProgress({
        world,
        progress,
        players: [staleProgressPlayer],
        commandsByPlayerId: new Map([
            [staleProgressPlayer.id, { horizontal: 0, vertical: -1, interact: true, action: false }]
        ]),
        dt: 0
    });
    assert.ok(
        staleChoiceEvents.some(
            ({ type, objectiveId }) => type === "objective-choice-requested" && objectiveId === futureChoiceObjective.id
        ),
        "a physically reached Node must request its chooser even when currentLandmarkId is stale"
    );
    assert.equal(progress.currentLandmarkId, "sector-01:landmark:01");

    const staleSimulation = createCurrentGameSimulation({ worldSeed: 9182, playerId: "stale-simulation-player" });
    staleSimulation.enemies = [];
    const staleSimulationSource = staleSimulation.world.objects.find(
        ({ id }) => id === "sector-01-04:maintenance-node"
    );
    staleSimulation.players[0].physics.position.set(staleSimulationSource.position.x, staleSimulationSource.position.y);
    staleSimulation.step(
        1 / 120,
        createPlayerCommand(
            {
                horizontal: 0,
                vertical: -1,
                interact: true,
                action: false,
                pointer: { x: 0, y: 0, down: false },
                viewport: { width: 1280, height: 720 }
            },
            { x: 0, y: 0 }
        )
    );
    assert.ok(
        staleSimulation.getFoundationReward(staleSimulation.players[0].id),
        "the stale-landmark choice request must open the actual GameSimulation chooser"
    );

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
    assert.equal(progress.snapshot().respawnAnchorId, second.respawnAnchorId);
    assert.ok(
        events.some(
            ({ type, respawnAnchorId }) =>
                type === "landmark-entered" && respawnAnchorId === "sector-01:landmark:02:checkpoint"
        )
    );
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
    for (const accessModuleId of world.sectors[0].accessModuleIds.slice(0, 2)) {
        progress.collectAccessModule(accessModuleId);
    }
    const target = world.landmarks.find(({ id }) => id === sectorTransitionRoute.targetLandmarkId);
    owner.physics.position.set(target.entry.x, target.entry.y);
    events = advanceSectorProgress({ world, progress, players: [owner], commandsByPlayerId: new Map(), dt: 0 });
    assert.ok(events.some(({ type }) => type === "sector-entered"));
    assert.equal(progress.snapshot().currentSectorId, "sector-02");
    assert.equal(progress.snapshot().respawnAnchorId, "sector-02:entry");
}
