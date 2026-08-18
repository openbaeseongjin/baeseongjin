import assert from "node:assert/strict";
import { FOUNDATION_AUGMENT_CATALOG } from "../src/game/augments/FoundationAugmentCatalog.js";
import { FoundationAugmentState } from "../src/game/augments/FoundationAugmentState.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { ROPE_CONFIG, ropeHookReach } from "../src/game/config.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

function command({ horizontal = 0, vertical = 0, interact = false, pointerDown = false, action = false } = {}) {
    return createPlayerCommand(
        {
            horizontal,
            vertical,
            interact,
            action,
            pointer: { x: 0, y: 0, down: pointerDown },
            viewport: { width: 1280, height: 720 }
        },
        { x: 300, y: 200 }
    );
}

function advanceToArea04(simulation) {
    for (const area of SECTOR_01_AREA_CATALOG.areas.slice(0, 3)) {
        for (const objective of area.objectives)
            assert.equal(simulation.worldProgress.completeObjective(objective.id).accepted, true);
        assert.equal(simulation.worldProgress.crossGate(area.gate.id).accepted, true);
    }
    simulation.restoreWorldProgress(simulation.worldProgress.snapshot());
}

export function run() {
    assert.equal(FOUNDATION_AUGMENT_CATALOG.length, 22);
    assert.deepEqual(
        Object.fromEntries(
            ["rope", "action", "signature", "modifier"].map((category) => [
                category,
                FOUNDATION_AUGMENT_CATALOG.filter((card) => card.category === category).length
            ])
        ),
        { rope: 6, action: 6, signature: 6, modifier: 4 }
    );

    const state = new FoundationAugmentState();
    assert.equal(state.select("direction-dash", { sourceId: "source-1" }), true);
    assert.equal(state.select("dash-strike", { sourceId: "source-2" }), false, "one Player may own one base Action");
    assert.equal(state.select("explosive-trail", { sourceId: "source-2" }), true);
    assert.equal(state.select("explosive-trail", { sourceId: "source-3" }), false, "selected cards do not stack");
    const restored = new FoundationAugmentState();
    restored.restore(state.selectedId, state.snapshot());
    assert.deepEqual(restored.snapshot(), state.snapshot());

    const fastLong = new FoundationAugmentState();
    fastLong.select("fast-launch");
    fastLong.select("long-rope");
    fastLong.select("fast-recover");
    const effective = fastLong.effectiveRopeConfig(ROPE_CONFIG);
    assert.equal(effective.hookSpeed, 1800);
    assert.equal(ropeHookReach(effective), 480);
    assert.equal(effective.hookReloadSeconds, 0.25);

    const simulation = new GameSimulation({ worldSeed: 1234, worldCatalog: SECTOR_01_AREA_CATALOG });
    advanceToArea04(simulation);
    const player = simulation.players[0];
    const node = simulation.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    player.physics.position.set(node.position.x, node.position.y);
    assert.equal(simulation.beginFoundationReward(player.id, node.id, node.objectiveId), true);
    const firstOffer = simulation.getFoundationReward(player.id);
    assert.equal(firstOffer.choices.length, 3);
    assert.equal(new Set(firstOffer.choices.map(({ id }) => id)).size, 3);
    simulation.step(1 / 120, command());
    simulation.step(1 / 120, command({ vertical: -1 }));
    const selectedId = firstOffer.choices[0].id;
    assert.deepEqual(simulation.playerState(player.id).selectedAugmentIds, [selectedId]);
    assert.equal(simulation.worldProgress.isObjectiveComplete(node.objectiveId), true);
    simulation.respawnPlayerAtCheckpoint(player, "fall");
    assert.deepEqual(simulation.playerState(player.id).selectedAugmentIds, [selectedId]);
    assert.equal(
        simulation.beginFoundationReward(player.id, node.id, node.objectiveId),
        false,
        "one source is consumed once"
    );

    const propulsion = new GameSimulation();
    propulsion.enemies = [];
    const propulsionPlayer = propulsion.players[0];
    propulsionPlayer.foundation.select("release-propulsion");
    propulsionPlayer.physics.velocity.set(100, -40);
    assert.equal(
        propulsionPlayer.ropeObject.rope.attach(propulsionPlayer.physics.position, {
            x: propulsionPlayer.physics.position.x,
            y: propulsionPlayer.physics.position.y - 100
        }),
        true
    );
    propulsionPlayer.ropeObject.wasPointerDown = true;
    const outcome = propulsion.dispatchOwnerInput(propulsionPlayer.id, command(), 0);
    assert.equal(outcome.foundationEvents[0].eventType, "augment-release-propulsion");
    assert.equal(propulsionPlayer.physics.velocity.x, 125);
    assert.equal(propulsionPlayer.physics.velocity.y, -50);
}
