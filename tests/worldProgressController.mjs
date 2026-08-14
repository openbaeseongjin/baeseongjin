import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { collisionSurfacesForProgress } from "../src/game/world/WorldGateGeometry.js";
import { advanceWorldProgress } from "../src/game/world/WorldProgressController.js";
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

    const objectiveEvents = advanceWorldProgress({ world, progress, players: [player], commandsByPlayerId: commands });
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
}
