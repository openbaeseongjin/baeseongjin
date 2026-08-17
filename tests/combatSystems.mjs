import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import {
    advanceEnemyProjectiles,
    distancePointToSegment,
    updateAutomaticWeapon,
    updateEnemyWeapons,
    updatePlayerProjectiles
} from "../src/game/combat/CombatSystems.js";
import { AutomaticWeaponObject } from "../src/game/combat/AutomaticWeaponObject.js";
import { EnemyObject } from "../src/game/combat/EnemyObject.js";
import { BallisticProjectileObject, HomingProjectileObject } from "../src/game/combat/ProjectileObject.js";
import { COMBAT_CONFIG } from "../src/game/config.js";
import { SimulationDrivenObject } from "../src/game/objects/SimulationDrivenObject.js";
import { CircleCollider } from "../src/game/physics/colliders/CircleCollider.js";
import { EntityRegistry } from "../src/game/simulation/EntityRegistry.js";

export function run() {
    const registry = new EntityRegistry();
    const ownerId = registry.createId("player");
    const owner = {
        id: ownerId,
        physics: { position: new Vector2(0, 0), collider: new CircleCollider({ radius: 15 }) },
        weapon: new AutomaticWeaponObject({
            id: registry.createId("weapon"),
            ownerId,
            config: COMBAT_CONFIG
        }),
        lifeState: "active"
    };
    const enemies = [
        { id: "enemy-2", position: new Vector2(100, 0), radius: 18, health: 30 },
        { id: "enemy-1", position: new Vector2(-100, 0), radius: 18, health: 30 },
        { id: "enemy-3", position: new Vector2(321, 0), radius: 18, health: 30 }
    ];
    const projectiles = [];
    owner.weapon.isEnabled = true;
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
    assert.equal(
        owner.physics.collider.overlapsCircle(owner.physics.position, projectiles[0].position, projectiles[0].radius),
        false,
        "a projectile must start outside its owner's body instead of blinking under the player sprite"
    );
    assert.ok(projectiles[0].position.x < owner.physics.position.x, "the muzzle must face the selected target");
    assert.equal(owner.weapon.cooldown, 0.65);

    for (let step = 0; step < 60 && projectiles.length > 0; step += 1) {
        updatePlayerProjectiles({ projectiles, enemies, config: COMBAT_CONFIG, dt: 1 / 120 });
    }
    assert.equal(enemies[1].health, 20, "a homing projectile must damage its authoritative target once");

    const directHit = [
        new HomingProjectileObject({
            id: "direct-hit",
            ownerId,
            targetId: enemies[1].id,
            position: enemies[1].position.clone(),
            velocity: new Vector2(),
            radius: 4,
            damage: 10
        })
    ];
    const hitEvents = updatePlayerProjectiles({ projectiles: directHit, enemies, config: COMBAT_CONFIG, dt: 0 });
    assert.equal(hitEvents.hits[0].type, "enemy-hit");
    assert.equal(hitEvents.hits[0].damage, 10);
    assert.equal(hitEvents.resolutions[0].resolution, "enemy-hit");

    const claimDrivenProjectile = [
        new HomingProjectileObject({
            id: "claim-driven",
            ownerId,
            targetId: enemies[1].id,
            position: enemies[1].position.clone(),
            velocity: new Vector2(),
            radius: 4,
            damage: 10
        })
    ];
    const claimDrivenHealth = enemies[1].health;
    const claimDrivenEvents = updatePlayerProjectiles({
        projectiles: claimDrivenProjectile,
        enemies,
        config: COMBAT_CONFIG,
        dt: 1 / 120,
        resolveHits: false,
        maxLifetimeSeconds: 1
    });
    assert.equal(enemies[1].health, claimDrivenHealth, "server trajectory steps must not preempt the attacker claim");
    assert.equal(claimDrivenProjectile.length, 1);
    assert.equal(claimDrivenEvents.hits.length, 0);
    const expiredClaimDriven = updatePlayerProjectiles({
        projectiles: claimDrivenProjectile,
        enemies,
        config: COMBAT_CONFIG,
        dt: 1,
        resolveHits: false,
        maxLifetimeSeconds: 1
    });
    assert.equal(expiredClaimDriven.resolutions[0].resolution, "expired");
    assert.equal(claimDrivenProjectile.length, 0, "unclaimed player projectiles must have a bounded lifetime");

    owner.weapon.cooldown = 0;
    owner.weapon.range = 50;
    updateAutomaticWeapon({ owner, enemies, projectiles, registry, config: COMBAT_CONFIG, dt: 1 });
    assert.equal(projectiles.length, 0, "weapons must not fire when every enemy is outside range");

    assert.equal(distancePointToSegment({ x: 50, y: 5 }, { x: 0, y: 0 }, { x: 100, y: 0 }), 5);
    const travelingShot = [
        new BallisticProjectileObject({
            id: "traveling-shot",
            ownerId: "enemy-fire",
            targetId: "player-1",
            position: new Vector2(-10, 50),
            velocity: new Vector2(20, 0),
            radius: 7,
            damage: 20
        })
    ];
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
    const firingEnemy = new EnemyObject({
        id: "enemy-fire",
        position: new Vector2(100, 0),
        level: 1,
        radius: 18,
        health: 30,
        maxHealth: 30,
        fireCooldown: 0
    });
    const enemyShots = [];
    let spawned = updateEnemyWeapons({
        enemies: [firingEnemy],
        targets: [target, secondTarget],
        projectiles: enemyShots,
        registry,
        config: COMBAT_CONFIG,
        dt: 0
    });
    assert.equal(spawned.length, 0, "a Sentry must acquire before it can fire");
    assert.equal(firingEnemy.attackState, "acquire");
    updateEnemyWeapons({
        enemies: [firingEnemy],
        targets: [target, secondTarget],
        projectiles: enemyShots,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyAcquireSeconds
    });
    assert.equal(firingEnemy.attackState, "track");
    updateEnemyWeapons({
        enemies: [firingEnemy],
        targets: [target, secondTarget],
        projectiles: enemyShots,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyTrackSeconds
    });
    assert.equal(firingEnemy.attackState, "lock");
    secondTarget.physics.position.set(60, 100);
    spawned = updateEnemyWeapons({
        enemies: [firingEnemy],
        targets: [target, secondTarget],
        projectiles: enemyShots,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyLockSeconds
    });
    assert.ok(spawned[0] instanceof SimulationDrivenObject);
    assert.equal(spawned[0].targetId, "player-2", "the closest active player must be targeted");
    assert.equal(spawned[0].velocity.y, 0, "LOCK must preserve the last tracked direction while the target dodges");
    assert.equal(spawned[0].canCutRope, false, "a standard Sentry must not cut ropes by default");

    const cutterEnemy = new EnemyObject({
        id: "enemy-cutter",
        position: new Vector2(100, 0),
        level: 1,
        radius: 18,
        health: 30,
        maxHealth: 30,
        fireCooldown: 0,
        rules: ["cutter-fire"]
    });
    const cutterShots = [];
    updateEnemyWeapons({
        enemies: [cutterEnemy],
        targets: [target],
        projectiles: cutterShots,
        registry,
        config: COMBAT_CONFIG,
        dt: 0
    });
    updateEnemyWeapons({
        enemies: [cutterEnemy],
        targets: [target],
        projectiles: cutterShots,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyAcquireSeconds
    });
    updateEnemyWeapons({
        enemies: [cutterEnemy],
        targets: [target],
        projectiles: cutterShots,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyTrackSeconds
    });
    const cutterSpawned = updateEnemyWeapons({
        enemies: [cutterEnemy],
        targets: [target],
        projectiles: cutterShots,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyLockSeconds
    });
    assert.equal(cutterSpawned[0].canCutRope, true, "a cutter-fire enemy must opt in to rope-cutting projectiles");

    const coveredEnemy = new EnemyObject({
        id: "enemy-covered",
        position: new Vector2(100, 0),
        level: 1,
        areaId: "test-area",
        activation: { x: -200, y: -200, width: 400, height: 400 },
        rules: ["cover-ends-los"],
        radius: 18,
        health: 30,
        maxHealth: 30,
        fireCooldown: 0
    });
    const coveredTarget = {
        ...target,
        id: "covered-player",
        physics: { ...target.physics, position: new Vector2(-100, 0) }
    };
    const cover = {
        areaId: "test-area",
        kind: "cover",
        collision: true,
        vertices: [
            { x: -8, y: -48 },
            { x: 8, y: -48 },
            { x: 8, y: 48 },
            { x: -8, y: 48 }
        ]
    };
    assert.equal(
        updateEnemyWeapons({
            enemies: [coveredEnemy],
            targets: [coveredTarget],
            projectiles: [],
            registry,
            config: COMBAT_CONFIG,
            surfaces: [cover],
            dt: COMBAT_CONFIG.enemyAcquireSeconds + COMBAT_CONFIG.enemyTrackSeconds
        }).length,
        0
    );
    assert.equal(coveredEnemy.attackState, "idle", "authored cover must end Sentry line of sight");
}
