import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { updateEnemyWeapons } from "../src/game/combat/CombatSystems.js";
import { EnemyObject } from "../src/game/combat/EnemyObject.js";
import { COMBAT_CONFIG } from "../src/game/config.js";
import { EntityRegistry } from "../src/game/simulation/EntityRegistry.js";

function activeTarget(id, x, y) {
    return {
        id,
        physics: { position: new Vector2(x, y), config: { radius: 15 }, addImpulse() {} },
        health: 100,
        lifeState: "active"
    };
}

function advanceToFire({ enemy, targets, projectiles, registry }) {
    const steps = [0, COMBAT_CONFIG.enemyAcquireSeconds, COMBAT_CONFIG.enemyTrackSeconds];
    for (const dt of steps) {
        updateEnemyWeapons({ enemies: [enemy], targets, projectiles, registry, config: COMBAT_CONFIG, dt });
    }
    return updateEnemyWeapons({
        enemies: [enemy],
        targets,
        projectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyLockSeconds
    });
}

export function run() {
    const registry = new EntityRegistry();
    const patroller = new EnemyObject({
        id: "enemy-patrol",
        position: new Vector2(100, 0),
        level: 2,
        activation: { x: 100, y: -16, width: 40, height: 32 },
        patrol: {
            speed: 40,
            corridor: {
                start: { x: 100, y: 0 },
                end: { x: 140, y: 0 }
            }
        },
        radius: 18,
        health: 30,
        maxHealth: 30,
        fireCooldown: 0
    });

    updateEnemyWeapons({
        enemies: [patroller],
        targets: [],
        projectiles: [],
        registry,
        config: COMBAT_CONFIG,
        dt: 0.5
    });
    assert.deepEqual(patroller.position, new Vector2(120, 0), "a patrolling enemy must advance along its corridor");
    updateEnemyWeapons({
        enemies: [patroller],
        targets: [],
        projectiles: [],
        registry,
        config: COMBAT_CONFIG,
        dt: 0.5
    });
    assert.deepEqual(
        patroller.position,
        new Vector2(140, 0),
        "the patrol must deterministically reach its endpoint before reversing"
    );
    updateEnemyWeapons({
        enemies: [patroller],
        targets: [],
        projectiles: [],
        registry,
        config: COMBAT_CONFIG,
        dt: 0.5
    });
    assert.deepEqual(
        patroller.position,
        new Vector2(120, 0),
        "a corridor patrol must ping-pong back through the same route without target input"
    );

    const clampedPatroller = new EnemyObject({
        id: "enemy-patrol-clamped",
        position: new Vector2(120, 20),
        level: 2,
        activation: { x: 100, y: 0, width: 40, height: 40 },
        patrol: {
            speed: 120,
            corridor: {
                start: { x: 20, y: -30 },
                end: { x: 260, y: 90 }
            }
        },
        radius: 18,
        health: 30,
        maxHealth: 30,
        fireCooldown: 0
    });
    for (let step = 0; step < 8; step += 1) {
        updateEnemyWeapons({
            enemies: [clampedPatroller],
            targets: [],
            projectiles: [],
            registry,
            config: COMBAT_CONFIG,
            dt: 0.25
        });
        assert.ok(
            clampedPatroller.position.x >= 100 &&
                clampedPatroller.position.x <= 140 &&
                clampedPatroller.position.y >= 0 &&
                clampedPatroller.position.y <= 40,
            "patrol movement must stay inside the authored activation band"
        );
    }

    const lockedEnemy = new EnemyObject({
        id: "enemy-locked",
        position: new Vector2(100, 0),
        level: 2,
        patrol: {
            speed: 40,
            corridor: {
                start: { x: 100, y: 0 },
                end: { x: 140, y: 0 }
            }
        },
        radius: 18,
        health: 30,
        maxHealth: 30,
        fireCooldown: 0
    });
    const targetA = activeTarget("player-a", 82, 0);
    const targetB = activeTarget("player-b", 60, 0);
    const projectiles = [];
    const firstSpawn = advanceToFire({ enemy: lockedEnemy, targets: [targetA], projectiles, registry });
    assert.equal(firstSpawn[0].targetId, "player-a");
    assert.equal(lockedEnemy.lockedTargetId, "player-a");

    const pausedPosition = lockedEnemy.position.clone();
    updateEnemyWeapons({
        enemies: [lockedEnemy],
        targets: [targetA, targetB],
        projectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyFireFlashSeconds + COMBAT_CONFIG.enemyFireInterval * 0.5
    });
    assert.deepEqual(
        lockedEnemy.position,
        pausedPosition,
        "an enemy that is holding an attack target must pause patrol instead of drifting during cooldown"
    );
    assert.equal(lockedEnemy.lockedTargetId, "player-a");

    updateEnemyWeapons({
        enemies: [lockedEnemy],
        targets: [targetA, targetB],
        projectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyFireInterval * 0.5
    });
    assert.equal(lockedEnemy.attackState, "track");
    updateEnemyWeapons({
        enemies: [lockedEnemy],
        targets: [targetA, targetB],
        projectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyTrackSeconds
    });
    const secondSpawn = updateEnemyWeapons({
        enemies: [lockedEnemy],
        targets: [targetA, targetB],
        projectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: COMBAT_CONFIG.enemyLockSeconds
    });
    assert.equal(
        secondSpawn[0].targetId,
        "player-a",
        "a closer later entrant must not retarget the enemy mid-cycle while the previous target is still valid"
    );

    const bandLimitedEnemy = new EnemyObject({
        id: "enemy-band-limited",
        position: new Vector2(100, 0),
        level: 2,
        activation: { x: 100, y: -20, width: 80, height: 40 },
        radius: 18,
        health: 30,
        maxHealth: 30,
        fireCooldown: 0
    });
    const bandProjectiles = [];
    updateEnemyWeapons({
        enemies: [bandLimitedEnemy],
        targets: [activeTarget("outside-band", 99, 0)],
        projectiles: bandProjectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: 0
    });
    assert.equal(bandProjectiles.length, 0, "an enemy must not acquire a target outside its authored band");
    updateEnemyWeapons({
        enemies: [bandLimitedEnemy],
        targets: [activeTarget("inside-band", 120, 0)],
        projectiles: bandProjectiles,
        registry,
        config: COMBAT_CONFIG,
        dt: 0
    });
    assert.equal(bandProjectiles.length, 0);
    assert.equal(bandLimitedEnemy.lockedTargetId, "inside-band");
    assert.equal(bandLimitedEnemy.attackState, "acquire");

    assert.equal(COMBAT_CONFIG.enemyHealth, 100, "the Sentry first-pass health must stay 100");
    assert.equal(COMBAT_CONFIG.enemyAttackRange, 760, "the Sentry recognition range must stay 760");
    assert.equal(COMBAT_CONFIG.enemyProjectileSpeed, 520, "the Sentry projectile speed must stay 520");
    assert.equal(COMBAT_CONFIG.enemyFireInterval, 1.0, "the Sentry repeat cadence must stay 1.0 second");

    const sentry = new EnemyObject({
        id: "enemy-sentry-range",
        position: new Vector2(100, 0),
        level: 2,
        activation: { x: 100, y: -40, width: 760, height: 80 },
        radius: 18,
        health: COMBAT_CONFIG.enemyHealth,
        maxHealth: COMBAT_CONFIG.enemyHealth,
        fireCooldown: 0
    });
    const sentryProjectiles = [];
    const sentrySpawn = advanceToFire({
        enemy: sentry,
        targets: [activeTarget("sentry-range-600", 700, 0)],
        projectiles: sentryProjectiles,
        registry
    });
    assert.equal(
        sentrySpawn[0].targetId,
        "sentry-range-600",
        "a target farther than the old 520 range but within 760 must be acquired"
    );
    assert.equal(
        Math.round(sentrySpawn[0].velocity.length()),
        COMBAT_CONFIG.enemyProjectileSpeed,
        "the Sentry projectile must travel at the tuned speed"
    );
    assert.equal(sentry.fireCooldown, COMBAT_CONFIG.enemyFireInterval, "the fired shot must start a 1.0s cadence");

    const farSentry = new EnemyObject({
        id: "enemy-sentry-far",
        position: new Vector2(100, 0),
        level: 2,
        activation: { x: -800, y: -40, width: 1600, height: 80 },
        radius: 18,
        health: COMBAT_CONFIG.enemyHealth,
        maxHealth: COMBAT_CONFIG.enemyHealth,
        fireCooldown: 0
    });
    updateEnemyWeapons({
        enemies: [farSentry],
        targets: [activeTarget("sentry-out-of-range", 901, 0)],
        projectiles: [],
        registry,
        config: COMBAT_CONFIG,
        dt: 0
    });
    assert.equal(farSentry.lockedTargetId, null, "a target beyond 760 must not be acquired");

    const losSentry = new EnemyObject({
        id: "enemy-sentry-los",
        position: new Vector2(100, 0),
        level: 2,
        activation: { x: -800, y: -40, width: 1600, height: 80 },
        rules: ["cover-ends-los"],
        radius: 18,
        health: COMBAT_CONFIG.enemyHealth,
        maxHealth: COMBAT_CONFIG.enemyHealth,
        fireCooldown: 0
    });
    updateEnemyWeapons({
        enemies: [losSentry],
        targets: [activeTarget("sentry-behind-cover", 200, 0)],
        projectiles: [],
        registry,
        config: COMBAT_CONFIG,
        surfaces: [
            {
                id: "cover-wall",
                kind: "cover",
                collision: true,
                areaId: null,
                vertices: [
                    { x: 150, y: -50 },
                    { x: 150, y: 50 }
                ]
            }
        ],
        dt: 0
    });
    assert.equal(losSentry.lockedTargetId, null, "cover LOS must still gate acquisition within 760");
}
