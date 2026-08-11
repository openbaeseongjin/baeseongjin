import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import {
    advanceEnemyProjectiles,
    distancePointToSegment,
    updateAutomaticWeapon,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../src/game/combat/CombatSystems.js";
import { COMBAT_CONFIG } from "../src/game/config.js";
import { SimulationDrivenObject } from "../src/game/objects/SimulationDrivenObject.js";
import { EntityRegistry } from "../src/game/simulation/EntityRegistry.js";

export function run() {
    const registry = new EntityRegistry();
    const owner = {
        id: registry.createId("player"),
        physics: { position: new Vector2(0, 0) },
        weapon: { range: 320, damage: 10, fireInterval: 0.65, cooldown: 0 },
        lifeState: "active"
    };
    const enemies = [
        { id: "enemy-2", position: new Vector2(100, 0), radius: 18, health: 30 },
        { id: "enemy-1", position: new Vector2(-100, 0), radius: 18, health: 30 },
        { id: "enemy-3", position: new Vector2(321, 0), radius: 18, health: 30 }
    ];
    const projectiles = [];
    const spawnedPlayerProjectile = updateAutomaticWeapon({
        owner,
        enemies,
        projectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: 1 / 120
    });
    assert.equal(projectiles.length, 1);
    assert.ok(projectiles[0] instanceof SimulationDrivenObject);
    assert.equal(spawnedPlayerProjectile, projectiles[0]);
    assert.equal(projectiles[0].targetId, "enemy-1", "distance ties must resolve by stable entity id");
    assert.equal(owner.weapon.cooldown, 0.65);

    for (let step = 0; step < 60 && projectiles.length > 0; step += 1) {
        updatePlayerProjectiles({ projectiles, enemies, config: COMBAT_CONFIG, dt: 1 / 120 });
    }
    assert.equal(enemies[1].health, 20, "a homing projectile must damage its authoritative target once");

    const directHit = [
        {
            targetId: enemies[1].id,
            position: enemies[1].position.clone(),
            velocity: new Vector2(),
            radius: 4,
            damage: 10
        }
    ];
    const hitEvents = updatePlayerProjectiles({ projectiles: directHit, enemies, config: COMBAT_CONFIG, dt: 0 });
    assert.equal(hitEvents.hits[0].type, "enemy-hit");
    assert.equal(hitEvents.hits[0].damage, 10);
    assert.equal(hitEvents.resolutions[0].resolution, "enemy-hit");

    owner.weapon.cooldown = 0;
    owner.weapon.range = 50;
    updateAutomaticWeapon({ owner, enemies, projectiles, registry, config: COMBAT_CONFIG, dt: 1 });
    assert.equal(projectiles.length, 0, "weapons must not fire when every enemy is outside range");

    assert.equal(distancePointToSegment({ x: 50, y: 5 }, { x: 0, y: 0 }, { x: 100, y: 0 }), 5);
    const travelingShot = [{ position: new Vector2(-10, 50), velocity: new Vector2(20, 0) }];
    const activeProjectiles = advanceEnemyProjectiles({
        projectiles: travelingShot,
        dt: 0.5,
        maxLifetimeSeconds: 1
    });
    assert.equal(activeProjectiles.expired.length, 0);
    assert.deepEqual(
        travelingShot[0].position,
        new Vector2(0, 50),
        "the neutral server simulation must advance projectile trajectories without choosing player impacts"
    );
    const projectileBeforeExpiration = travelingShot[0];
    const expiredProjectiles = advanceEnemyProjectiles({
        projectiles: travelingShot,
        dt: 0.5,
        maxLifetimeSeconds: 1
    });
    assert.deepEqual(expiredProjectiles.expired, [projectileBeforeExpiration]);
    assert.equal(travelingShot.length, 0, "neutral projectiles must leave server state when their lifetime ends");

    const target = {
        id: "player-1",
        physics: { position: new Vector2(0, 100), config: { radius: 15 }, addImpulse() {} },
        health: 100,
        lifeState: "active"
    };
    const secondTarget = {
        id: "player-2",
        physics: { position: new Vector2(60, 0), config: { radius: 15 }, addImpulse() {} },
        health: 100,
        lifeState: "active"
    };
    const firingEnemy = { id: "enemy-fire", position: new Vector2(100, 0), fireCooldown: 0 };
    const enemyShots = [];
    const spawned = updateEnemyWeapons({
        enemies: [firingEnemy],
        targets: [target, secondTarget],
        projectiles: enemyShots,
        registry,
        config: COMBAT_CONFIG,
        dt: 0
    });
    assert.ok(spawned[0] instanceof SimulationDrivenObject);
    assert.equal(spawned[0].targetId, "player-2", "the closest active player must be targeted");
}
