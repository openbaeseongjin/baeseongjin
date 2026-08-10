import assert from "node:assert/strict";
import { COMBAT_CONFIG, PLAYER_CONFIG, ROPE_CONFIG } from "../src/game/config.js";
import { createPlayerRuntime } from "../src/game/players/PlayerRuntimeFactory.js";
import { EntityRegistry } from "../src/game/simulation/EntityRegistry.js";

export function run() {
    const registry = new EntityRegistry();
    const first = createPlayerRuntime({
        registry,
        playerConfig: PLAYER_CONFIG,
        ropeConfig: ROPE_CONFIG,
        combatConfig: COMBAT_CONFIG
    });
    const second = createPlayerRuntime({
        registry,
        playerConfig: PLAYER_CONFIG,
        ropeConfig: ROPE_CONFIG,
        combatConfig: COMBAT_CONFIG,
        spawn: { x: 160, y: 500 }
    });
    assert.equal(first.entity.id, "player-1");
    assert.equal(second.entity.id, "player-2");
    assert.notEqual(first.physics, second.physics);
    assert.notEqual(first.rope, second.rope);
    assert.equal(first.entity.physics, first.physics);
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
