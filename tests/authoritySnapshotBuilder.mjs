import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { WORLD_GENERATION_REVISION } from "../src/game/world/WorldGenerator.js";

export function run() {
    const simulation = new GameSimulation();
    const partner = simulation.addPlayer({ x: 180, y: 500 });
    partner.artifacts.add({ id: "rapid-gear", modifiers: { fireIntervalMultiplier: 0.75 } });
    simulation.playerEntity.artifacts.add({ id: "power-core", modifiers: { damageMultiplier: 1.4 } });
    simulation.playerEntity.weapon.cooldown = 0;
    const command = createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
    simulation.step(1 / 120, command);

    const first = buildAuthoritySnapshot({ simulation, acknowledgements: { "player-1": 7 } });
    assert.equal(first.serverTick, 1);
    assert.equal(first.worldSeed, simulation.world.seed);
    assert.equal(first.worldRevision, WORLD_GENERATION_REVISION);
    assert.deepEqual(first.acknowledgements, { "player-1": 7 });
    assert.equal(first.state.players[0].id, simulation.playerEntity.id);
    assert.equal(first.state.players[1].id, partner.entity.id);
    assert.equal(first.state.players[0].rope.isAttached, false);
    assert.deepEqual(
        first.state.players[0].artifacts.map(({ id }) => id),
        ["power-core"]
    );
    assert.deepEqual(
        first.state.players[1].artifacts.map(({ id }) => id),
        ["rapid-gear"]
    );
    assert.equal(first.events[0].eventType, "spawn");
    assert.equal(Object.hasOwn(first.state, "projectiles"), false);
    assert.equal(Object.hasOwn(first.state, "enemyProjectiles"), false);
    assert.equal(Object.hasOwn(first.state, "world"), false);

    const second = buildAuthoritySnapshot({ simulation, acknowledgements: { "player-1": 7 } });
    assert.deepEqual(second.events, [], "authority events must appear in only one snapshot envelope");
    assert.deepEqual(second.state, first.state, "draining events must not change authoritative game state");
}
