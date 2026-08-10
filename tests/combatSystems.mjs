import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import {
    distancePointToSegment,
    updateAutomaticWeapon,
    updateEnemyProjectiles,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../src/game/combat/CombatSystems.js";
import { COMBAT_CONFIG } from "../src/game/config.js";
import { FixedLengthRope } from "../src/game/rope/FixedLengthRope.js";
import { ROPE_CONFIG } from "../src/game/config.js";
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
    const spawnedPlayerProjectile = updateAutomaticWeapon({
        owner,
        enemies,
        projectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: 1 / 120
    });
    assert.equal(projectiles.length, 1);
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
    const rope = new FixedLengthRope(ROPE_CONFIG);
    const target = {
        id: "player-1",
        physics: { position: new Vector2(0, 100), config: { radius: 15 }, addImpulse() {} },
        health: 100,
        hitInvulnerabilityRemaining: 0,
        ropeDisabledRemaining: 0
    };
    rope.attach(target.physics.position, { x: 0, y: 0 });
    target.rope = rope;
    const ropeShot = [{ position: new Vector2(-10, 50), velocity: new Vector2(20, 0), radius: 7, damage: 20 }];
    const ropeEvents = updateEnemyProjectiles({
        projectiles: ropeShot,
        targets: [target],
        config: COMBAT_CONFIG,
        dt: 0.5
    });
    assert.equal(rope.isAttached, false, "enemy projectiles must sever the rope before checking body damage");
    assert.equal(target.ropeDisabledRemaining, 0.6);
    assert.equal(target.health, 100);
    assert.deepEqual(ropeEvents.ropeCutAt, new Vector2(0, 50));
    assert.equal(ropeEvents.ropeCuts[0].playerId, "player-1");
    assert.equal(ropeEvents.resolutions[0].resolution, "rope-cut");

    const bodyShot = [{ position: new Vector2(-10, 100), velocity: new Vector2(20, 0), radius: 7, damage: 20 }];
    const bodyEvents = updateEnemyProjectiles({
        projectiles: bodyShot,
        targets: [target],
        config: COMBAT_CONFIG,
        dt: 0.5
    });
    assert.equal(target.health, 80, "body hits must reduce HP exactly once");
    assert.equal(target.hitInvulnerabilityRemaining, COMBAT_CONFIG.playerHitInvulnerability);
    assert.equal(bodyEvents.ropeCutAt, null);
    assert.equal(bodyEvents.hits[0].type, "player-hit");
    assert.equal(bodyEvents.hits[0].damage, 20);
    assert.equal(bodyEvents.hits[0].playerId, "player-1");
    assert.equal(bodyEvents.resolutions[0].resolution, "player-hit");

    const secondRope = new FixedLengthRope(ROPE_CONFIG);
    const secondTarget = {
        id: "player-2",
        physics: { position: new Vector2(60, 0), config: { radius: 15 }, addImpulse() {} },
        rope: secondRope,
        health: 100,
        hitInvulnerabilityRemaining: 0,
        ropeDisabledRemaining: 0,
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
    assert.equal(spawned[0].targetId, "player-2", "the closest active player must be targeted");
    const secondBodyShot = [
        {
            id: "enemy-projectile-second",
            position: secondTarget.physics.position.clone(),
            velocity: new Vector2(),
            radius: 7,
            damage: 20
        }
    ];
    const secondBodyEvents = updateEnemyProjectiles({
        projectiles: secondBodyShot,
        targets: [target, secondTarget],
        config: COMBAT_CONFIG,
        dt: 0
    });
    assert.equal(secondTarget.health, 80);
    assert.equal(secondBodyEvents.hits[0].playerId, "player-2");
}
