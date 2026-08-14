import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
import {
    createCurrentGameSimulation,
    createGameSimulationForWorldRevision
} from "../src/game/simulation/GameSimulationFactory.js";
import { authoredCatalogForRevision, DEFAULT_AUTHORED_AREA_CATALOG } from "../src/game/world/AuthoredWorldFactory.js";

function command({ interact = false } = {}) {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
}

export function run() {
    assert.equal(authoredCatalogForRevision(DEFAULT_AUTHORED_AREA_CATALOG.revision), DEFAULT_AUTHORED_AREA_CATALOG);
    assert.equal(authoredCatalogForRevision("unknown-world-revision"), null);

    const server = createCurrentGameSimulation({ worldSeed: 2718 });
    const ownerId = server.getPrimaryPlayerId();
    const owner = server.players[0];
    const firstSnapshot = buildAuthoritySnapshot({ simulation: server });
    assert.equal(firstSnapshot.worldRevision, DEFAULT_AUTHORED_AREA_CATALOG.revision);
    assert.equal(firstSnapshot.state.worldProgress.currentAreaId, "sector-01-01");
    assert.equal(firstSnapshot.state.windStates.length, server.world.windZones.length);

    const predictor = new OwnerPredictionRuntime({
        ownerId,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: firstSnapshot.worldSeed,
            playerId: ownerId,
            worldRevision: firstSnapshot.worldRevision
        })
    });
    predictor.reconcile(firstSnapshot, []);
    assert.equal(predictor.renderSnapshot().world.definitionRevision, firstSnapshot.worldRevision);

    const terminal = server.world.objects.find(({ id }) => id === "sector-01-01:service-terminal");
    owner.physics.position.set(terminal.position.x, terminal.position.y);
    server.stepCommandBatch(
        1 / 120,
        createPlayerCommandBatch(1, [{ playerId: ownerId, sequence: 0, command: command({ interact: true }) }]),
        { advanceInputDrivenObjects: false }
    );
    const progressedSnapshot = buildAuthoritySnapshot({ simulation: server });
    predictor.reconcile(progressedSnapshot, []);
    assert.equal(
        predictor.renderSnapshot().worldProgress.unlockedGateIds.includes("sector-01-01:gate"),
        true,
        "shared authored progress must open the same Gate collision on the predicting client"
    );
    assert.equal(
        predictor.simulation.activeCollisionSurfaces.filter(({ kind }) => kind === "gate-barrier").length,
        DEFAULT_AUTHORED_AREA_CATALOG.areas.length - 1
    );
}
