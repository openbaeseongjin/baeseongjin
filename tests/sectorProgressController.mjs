import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { CircleCollider } from "../src/game/physics/colliders/CircleCollider.js";
import { advanceSectorProgress } from "../src/game/world/SectorProgressController.js";
import { SectorProgressState } from "../src/game/world/SectorProgressState.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

function player(id, position) {
    return {
        id,
        lifeState: "active",
        physics: { position: new Vector2(position.x, position.y), collider: new CircleCollider({ radius: 18 }) }
    };
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
        "a physically reached Node must request its chooser without a Stage-entry cursor"
    );
    assert.equal("currentLandmarkId" in progress.snapshot(), false);

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
        "the position-driven choice request must open the actual GameSimulation chooser"
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

    owner.physics.position.set(second.entry.x + 63, second.entry.y);
    events = advanceSectorProgress({ world, progress, players: [owner], commandsByPlayerId: new Map(), dt: 0 });
    assert.equal(
        events.some(({ type }) => type === "stage-savepoint-reached"),
        false,
        "entering an arbitrary square around the Stage start must not activate its save point"
    );

    owner.physics.position.set(second.entry.x + 56, second.entry.y);
    events = advanceSectorProgress({ world, progress, players: [owner], commandsByPlayerId: new Map(), dt: 0 });
    assert.ok(
        events.some(
            ({ type, respawnAnchorId }) =>
                type === "stage-savepoint-reached" && respawnAnchorId === "sector-01:landmark:02:checkpoint"
        )
    );
    assert.deepEqual(
        owner.physics.position,
        new Vector2(second.entry.x + 56, second.entry.y),
        "progress must not teleport the player"
    );

    const target = world.landmarks.find(({ id }) => id === "sector-02:landmark:01");
    owner.physics.position.set(target.entry.x, target.entry.y);
    events = advanceSectorProgress({ world, progress, players: [owner], commandsByPlayerId: new Map(), dt: 0 });
    assert.ok(
        events.some(
            ({ type, respawnAnchorId }) =>
                type === "stage-savepoint-reached" && respawnAnchorId === target.respawnAnchorId
        ),
        "a physically touched save point must activate without route or Sector-entry state"
    );
}
