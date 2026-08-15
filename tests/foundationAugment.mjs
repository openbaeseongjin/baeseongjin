import assert from "node:assert/strict";
import { FOUNDATION_AUGMENT_CATALOG } from "../src/game/augments/FoundationAugmentCatalog.js";
import {
    advanceFoundationRewardSelection,
    createFoundationRewardSelection
} from "../src/game/rewards/FoundationRewardSelection.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

function command({ horizontal = 0, vertical = 0, interact = false, pointerDown = false, aimWorld = null } = {}) {
    return createPlayerCommand(
        {
            horizontal,
            vertical,
            interact,
            pointer: { x: aimWorld?.x ?? 0, y: aimWorld?.y ?? 0, down: pointerDown },
            viewport: { width: 1280, height: 720 }
        },
        aimWorld ?? { x: 0, y: 0 }
    );
}

function advanceToArea04(simulation) {
    for (const area of SECTOR_01_AREA_CATALOG.areas.slice(0, 3)) {
        for (const objective of area.objectives) {
            assert.equal(simulation.worldProgress.completeObjective(objective.id).accepted, true);
        }
        assert.equal(simulation.worldProgress.crossGate(area.gate.id).accepted, true);
    }
    simulation.restoreWorldProgress(simulation.worldProgress.snapshot());
}

function releaseAttachedRope(simulation, player, { swingUsed = false, direction = { x: 1, y: 0 } } = {}) {
    player.ropeObject.wasPointerDown = true;
    player.ropeObject.lastPointer = { x: 0, y: 0, down: true };
    player.ropeObject.swingDrag = {
        origin: { x: 0, y: 0 },
        direction,
        progress: swingUsed ? 1 : 0,
        age: 0.2,
        used: swingUsed
    };
    return simulation.dispatchOwnerInput(player.id, command(), 1 / 120);
}

export function run() {
    let selection = createFoundationRewardSelection({
        sourceId: "sector-01-04:maintenance-node",
        objectiveId: "sector-01-04:augment-selected",
        choices: FOUNDATION_AUGMENT_CATALOG
    });
    assert.equal(selection.rewardType, "foundation");
    assert.deepEqual(
        selection.choices.map(({ id }) => id),
        ["impulse-coil", "relay-link", "shear-current"]
    );
    let outcome = advanceFoundationRewardSelection(selection, command({ horizontal: 1 }));
    assert.equal(outcome.selection.selectedIndex, 0, "overlay entry input must be gated");
    outcome = advanceFoundationRewardSelection(outcome.selection, command());
    outcome = advanceFoundationRewardSelection(outcome.selection, command({ horizontal: -1 }));
    assert.equal(outcome.selection.selectedIndex, 2);
    outcome = advanceFoundationRewardSelection(outcome.selection, command());
    outcome = advanceFoundationRewardSelection(outcome.selection, command({ vertical: -1 }));
    assert.equal(outcome.confirmedFoundationId, "shear-current");

    const simulation = new GameSimulation({ worldSeed: 1234, worldCatalog: SECTOR_01_AREA_CATALOG });
    advanceToArea04(simulation);
    const player = simulation.players[0];
    const node = simulation.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    player.physics.position.set(node.position.x, node.position.y);
    simulation.step(1 / 120, command({ interact: true, vertical: -1 }));
    assert.equal(simulation.snapshot().foundationReward.sourceId, node.id);
    assert.equal(
        simulation.worldProgress.isObjectiveComplete("sector-01-04:augment-selected"),
        false,
        "opening the chooser must not complete the shared objective"
    );
    const choosingPosition = player.physics.position.clone();
    simulation.step(1 / 120, command());
    simulation.step(1 / 120, command({ horizontal: -1 }));
    simulation.step(1 / 120, command());
    simulation.step(1 / 120, command({ vertical: -1 }));
    assert.equal(simulation.playerState(player.id).foundationAugment, "shear-current");
    assert.equal(simulation.snapshot().foundationReward, null);
    assert.equal(simulation.worldProgress.isObjectiveComplete("sector-01-04:augment-selected"), true);
    assert.equal(player.physics.position.x, choosingPosition.x, "choice input must not move its owner horizontally");

    const exitPanel = simulation.world.objects.find(({ id }) => id === "sector-01-04:exit-panel");
    player.physics.position.set(exitPanel.position.x, exitPanel.position.y);
    simulation.step(1 / 120, command({ interact: true, vertical: -1 }));
    assert.equal(
        simulation.worldProgress.isGateUnlocked("sector-01-04:gate"),
        true,
        "the panel must become usable immediately after Foundation selection"
    );
    simulation.respawnPlayerAtCheckpoint(player, "fall");
    assert.equal(
        simulation.playerState(player.id).foundationAugment,
        "shear-current",
        "Foundation selection must survive checkpoint respawn"
    );

    const impulseSimulation = new GameSimulation();
    impulseSimulation.enemies = [];
    const impulsePlayer = impulseSimulation.players[0];
    impulsePlayer.foundation.select("impulse-coil");
    impulsePlayer.physics.velocity.set(0, 0);
    assert.equal(
        impulsePlayer.ropeObject.rope.attach(impulsePlayer.physics.position, {
            x: impulsePlayer.physics.position.x,
            y: impulsePlayer.physics.position.y - 100
        }),
        true
    );
    const impulseOutcome = releaseAttachedRope(impulseSimulation, impulsePlayer, { swingUsed: true });
    assert.ok(impulsePlayer.physics.velocity.x > 0, "Impulse Coil must add a directional release burst");
    assert.equal(impulseOutcome.foundationEvents[0].eventType, "foundation-impulse");

    const relaySimulation = new GameSimulation();
    relaySimulation.enemies = [];
    const relayPlayer = relaySimulation.players[0];
    relayPlayer.foundation.select("relay-link");
    assert.equal(
        relayPlayer.ropeObject.rope.attach(relayPlayer.physics.position, {
            x: relayPlayer.physics.position.x,
            y: relayPlayer.physics.position.y - 100
        }),
        true
    );
    releaseAttachedRope(relaySimulation, relayPlayer);
    assert.ok(relaySimulation.playerState(relayPlayer.id).augmentRuntimeState.relayWindowRemaining > 0);
    const relayTarget = {
        id: "relay-target",
        grappleable: true,
        vertices: [
            { x: relayPlayer.physics.position.x + 100, y: relayPlayer.physics.position.y - 10 },
            { x: relayPlayer.physics.position.x + 110, y: relayPlayer.physics.position.y - 10 },
            { x: relayPlayer.physics.position.x + 110, y: relayPlayer.physics.position.y + 10 },
            { x: relayPlayer.physics.position.x + 100, y: relayPlayer.physics.position.y + 10 }
        ]
    };
    relaySimulation.activeCollisionSurfaces = [relayTarget];
    relaySimulation.dispatchOwnerInput(
        relayPlayer.id,
        command({
            pointerDown: true,
            aimWorld: {
                x: relayPlayer.physics.position.x + 105,
                y: relayPlayer.physics.position.y + 110
            }
        }),
        1 / 120
    );
    assert.equal(relayPlayer.ropeObject.rope.isAttached, true, "Relay Link must allow the one assisted re-attach");
    assert.equal(relaySimulation.playerState(relayPlayer.id).augmentRuntimeState.relayWindowRemaining, 0);

    const shearSimulation = new GameSimulation();
    const shearPlayer = shearSimulation.players[0];
    const shearTarget = shearSimulation.enemies[0];
    shearPlayer.foundation.select("shear-current");
    shearPlayer.weapon.range = 0;
    shearPlayer.physics.position.set(200, 300);
    shearTarget.position.set(150, 300);
    shearTarget.health = shearTarget.maxHealth;
    assert.equal(shearPlayer.ropeObject.rope.attach(shearPlayer.physics.position, { x: 100, y: 300 }), true);
    shearPlayer.ropeObject.wasPointerDown = true;
    shearPlayer.ropeObject.lastPointer = { x: 0, y: 0, down: true };
    shearSimulation.step(1 / 120, command());
    assert.equal(shearTarget.health, shearTarget.maxHealth - 20);
    assert.ok(
        shearSimulation
            .drainReplicationEvents()
            .some(({ eventType, targetId }) => eventType === "foundation-shear-hit" && targetId === shearTarget.id)
    );
}
