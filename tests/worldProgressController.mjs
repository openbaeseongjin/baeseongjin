import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { collisionSurfacesForProgress } from "../src/game/world/WorldGateGeometry.js";
import { advanceWorldProgress, completeWorldProgressObjective } from "../src/game/world/WorldProgressController.js";
import { WorldProgressState } from "../src/game/world/WorldProgressState.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

export function run() {
    const world = assembleAuthoredWorld(SECTOR_01_AREA_CATALOG, { seed: 42, floorY: 560 });
    const progress = new WorldProgressState(SECTOR_01_AREA_CATALOG);
    const player = {
        id: "player:test",
        lifeState: "active",
        physics: { position: new Vector2() }
    };
    const commands = new Map([[player.id, { interact: true }]]);
    const terminal = world.objects.find(({ id }) => id === "sector-01-01:service-terminal");
    player.physics.position.set(terminal.position.x, terminal.position.y);

    const sequenceStarted = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands,
        dt: 1 / 120
    });
    assert.deepEqual(
        sequenceStarted.map(({ type }) => type),
        ["objective-sequence-started"]
    );
    assert.equal(progress.isGateUnlocked("sector-01-01:gate"), false);
    assert.ok(progress.objectiveSequence("sector-01-01:terminal-read"));

    const sequencePending = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands,
        dt: 2.69
    });
    assert.deepEqual(sequencePending, []);
    const objectiveEvents = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands,
        dt: 0.02
    });
    assert.deepEqual(
        objectiveEvents.map(({ type }) => type),
        ["objective-completed", "gate-unlocked"]
    );
    assert.equal(collisionSurfacesForProgress(world, progress).filter(({ kind }) => kind === "gate-barrier").length, 7);

    const firstGate = world.gates[0];
    player.physics.position.set(firstGate.trigger.x + 10, firstGate.trigger.y + 10);
    const gateEvents = advanceWorldProgress({ world, progress, players: [player], commandsByPlayerId: commands });
    assert.deepEqual(
        gateEvents.map(({ type }) => type),
        ["gate-crossed"]
    );
    assert.equal(progress.currentAreaId, "sector-01-02");

    const area02Objective = world.objectives.find(({ id }) => id === "sector-01-02:final-deck-reached");
    const area02Panel = world.objects.find(({ id }) => id === "sector-01-02:exit-panel");
    player.physics.position.set(area02Panel.position.x, area02Panel.position.y);
    commands.set(player.id, { interact: false });
    const reachEvents = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands
    });
    assert.deepEqual(
        reachEvents.map(({ type }) => type),
        ["objective-completed"]
    );
    assert.equal(reachEvents[0].objectiveId, area02Objective.id);
    assert.equal(progress.isGateUnlocked("sector-01-02:gate"), false);

    commands.set(player.id, { interact: true });
    player.physics.position.set(area02Panel.position.x, area02Panel.position.y);
    const panelEvents = advanceWorldProgress({ world, progress, players: [player], commandsByPlayerId: commands });
    assert.deepEqual(
        panelEvents.map(({ type }) => type),
        ["objective-completed", "gate-unlocked"]
    );

    const secondGate = world.gates.find(({ id }) => id === "sector-01-02:gate");
    player.physics.position.set(
        secondGate.trigger.x + secondGate.trigger.width * 0.5,
        secondGate.trigger.y + secondGate.trigger.height * 0.5
    );
    const secondGateEvents = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands
    });
    assert.deepEqual(
        secondGateEvents.map(({ type }) => type),
        ["gate-crossed"]
    );
    assert.equal(progress.currentAreaId, "sector-01-03");

    const area03Panel = world.objects.find(({ id }) => id === "sector-01-03:service-panel");
    player.physics.position.set(area03Panel.position.x, area03Panel.position.y);
    const area03PanelEvents = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands
    });
    assert.deepEqual(
        area03PanelEvents.map(({ type }) => type),
        ["objective-completed", "gate-unlocked"]
    );

    const area03Gate = world.gates.find(({ id }) => id === "sector-01-03:gate");
    const area03Door = world.objects.find(({ id }) => id === "sector-01-03:security-gate");
    assert.deepEqual(area03Gate.trigger, {
        x: area03Door.position.x - 26,
        y: area03Door.position.y - 62,
        width: 52,
        height: 62
    });

    player.physics.position.set(area03Door.position.x, area03Gate.trigger.y - 1);
    const aboveDoorEvents = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands
    });
    assert.deepEqual(aboveDoorEvents, [], "moving above the 1-3 door must not enter its portal");
    assert.equal(progress.currentAreaId, "sector-01-03");

    player.physics.position.set(
        area03Gate.trigger.x + area03Gate.trigger.width * 0.5,
        area03Gate.trigger.y + area03Gate.trigger.height * 0.5
    );
    const insideDoorEvents = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands
    });
    assert.deepEqual(
        insideDoorEvents.map(({ type }) => type),
        ["gate-crossed"]
    );
    assert.equal(progress.currentAreaId, "sector-01-04");

    const maintenanceNode = world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    player.physics.position.set(maintenanceNode.position.x, maintenanceNode.position.y);
    const choiceRequested = advanceWorldProgress({
        world,
        progress,
        players: [player],
        commandsByPlayerId: commands
    });
    assert.deepEqual(
        choiceRequested.map(({ type }) => type),
        ["objective-choice-requested"]
    );
    assert.equal(progress.isObjectiveComplete("sector-01-04:augment-selected"), false);

    const choiceCompleted = completeWorldProgressObjective({
        progress,
        objectiveId: "sector-01-04:augment-selected",
        areaId: "sector-01-04",
        player
    });
    assert.deepEqual(
        choiceCompleted.map(({ type }) => type),
        ["objective-completed"]
    );
    assert.equal(progress.isGateUnlocked("sector-01-04:gate"), false);

    const partner = {
        id: "player:partner",
        lifeState: "active",
        physics: { position: new Vector2(maintenanceNode.position.x, maintenanceNode.position.y) }
    };
    commands.set(partner.id, { interact: true });
    const repeatedChoiceRequest = advanceWorldProgress({
        world,
        progress,
        players: [player, partner],
        commandsByPlayerId: commands
    });
    assert.deepEqual(
        repeatedChoiceRequest.map(({ playerId }) => playerId),
        [player.id, partner.id],
        "every nearby player must receive a personal chooser request even after shared completion"
    );
}
