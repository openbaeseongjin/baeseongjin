import assert from "node:assert/strict";
import { ARTIFACT_CONFIG, COMBAT_CONFIG, PLAYER_CONFIG, ROPE_CONFIG } from "../src/game/config.js";
import { createPlayerRuntime } from "../src/game/players/PlayerRuntimeFactory.js";
import { EntityRegistry } from "../src/game/simulation/EntityRegistry.js";

export function run() {
    const registry = new EntityRegistry();
    const first = createPlayerRuntime({
        registry,
        playerConfig: PLAYER_CONFIG,
        ropeConfig: ROPE_CONFIG,
        combatConfig: COMBAT_CONFIG,
        artifactConfig: ARTIFACT_CONFIG
    });
    const second = createPlayerRuntime({
        registry,
        playerConfig: PLAYER_CONFIG,
        ropeConfig: ROPE_CONFIG,
        combatConfig: COMBAT_CONFIG,
        artifactConfig: ARTIFACT_CONFIG,
        spawn: { x: 160, y: 500 }
    });
    assert.equal(first.entity.id, "player-1");
    assert.equal(second.entity.id, "player-2");
    assert.notEqual(first.physics, second.physics);
    assert.notEqual(first.rope, second.rope);
    assert.notEqual(first.artifacts, second.artifacts);
    assert.notEqual(first.entity.aimWorld, second.entity.aimWorld);
    assert.notEqual(first.entity.lastPointer, second.entity.lastPointer);
    assert.notEqual(first.entity.lastViewport, second.entity.lastViewport);
    assert.equal(first.entity.physics, first.physics);
    assert.equal(first.entity.rope, first.rope);
    assert.equal(first.entity.artifacts, first.artifacts);
    first.artifacts.add({ id: "player-one-artifact" });
    assert.deepEqual(
        first.artifacts.snapshot().map(({ id }) => id),
        ["player-one-artifact"]
    );
    assert.deepEqual(second.artifacts.snapshot(), []);
    first.entity.aimWorld = { x: 20, y: 30 };
    first.entity.swingDrag = { used: true };
    first.entity.ropeDamageBoostRemaining = 2;
    assert.deepEqual(second.entity.aimWorld, { x: 0, y: 0 });
    assert.equal(second.entity.swingDrag, null);
    assert.equal(second.entity.ropeDamageBoostRemaining, 0);
    assert.deepEqual({ x: second.physics.position.x, y: second.physics.position.y }, { x: 160, y: 500 });
    assert.equal(first.entity.health, COMBAT_CONFIG.playerMaxHealth);
    assert.deepEqual(first.entity.weapon, {
        range: COMBAT_CONFIG.weaponRange,
        baseDamage: COMBAT_CONFIG.weaponDamage,
        damage: COMBAT_CONFIG.weaponDamage,
        baseFireInterval: COMBAT_CONFIG.fireInterval,
        fireInterval: COMBAT_CONFIG.fireInterval,
        cooldown: 0
    });
}
