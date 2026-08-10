import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { updateAutomaticWeapon, updatePlayerProjectiles } from "../src/game/combat/CombatSystems.js";
import { COMBAT_CONFIG } from "../src/game/config.js";
import { EntityRegistry } from "../src/game/simulation/EntityRegistry.js";

export function run() {
    const registry = new EntityRegistry();
    const owner = {
        id: registry.createId("player"),
        physics: { position: new Vector2(0, 0) },
        weapon: { range: 320, damage: 10, fireInterval: 0.65, cooldown: 0 }
    };
    const enemies = [
        { id: "enemy-2", position: new Vector2(100, 0), radius: 18, health: 30 },
        { id: "enemy-1", position: new Vector2(-100, 0), radius: 18, health: 30 },
        { id: "enemy-3", position: new Vector2(321, 0), radius: 18, health: 30 }
    ];
    const projectiles = [];
    updateAutomaticWeapon({ owner, enemies, projectiles, registry, config: COMBAT_CONFIG, dt: 1 / 120 });
    assert.equal(projectiles.length, 1);
    assert.equal(projectiles[0].targetId, "enemy-1", "distance ties must resolve by stable entity id");
    assert.equal(owner.weapon.cooldown, 0.65);

    for (let step = 0; step < 60 && projectiles.length > 0; step += 1) {
        updatePlayerProjectiles({ projectiles, enemies, config: COMBAT_CONFIG, dt: 1 / 120 });
    }
    assert.equal(enemies[1].health, 20, "a homing projectile must damage its authoritative target once");

    owner.weapon.cooldown = 0;
    owner.weapon.range = 50;
    updateAutomaticWeapon({ owner, enemies, projectiles, registry, config: COMBAT_CONFIG, dt: 1 });
    assert.equal(projectiles.length, 0, "weapons must not fire when every enemy is outside range");
}
