import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { EnemyObject } from "../src/game/combat/EnemyObject.js";
import {
    createEnemyImpactTombstone,
    recordEnemyImpactTombstone,
    resolveEnemyImpactTombstone
} from "../src/game/combat/EnemyImpactTombstones.js";
import { resolvePlayerEnemyImpact } from "../src/game/combat/PlayerEnemyImpactResolver.js";

function createEnemy(properties = {}) {
    return new EnemyObject({
        id: "enemy-1",
        position: new Vector2(0, 0),
        level: 1,
        radius: 18,
        health: 100,
        maxHealth: 100,
        fireCooldown: 0,
        enemyType: "pursuit-drone-t1",
        ...properties
    });
}

export function run() {
    const tombstones = new Map();
    const tombstone = createEnemyImpactTombstone({ targetId: "enemy-1", defeatedAtTick: 144 });
    assert.equal(tombstone.targetId, "enemy-1");
    recordEnemyImpactTombstone(tombstones, { targetId: "enemy-1", defeatedAtTick: 144 });
    assert.equal(resolveEnemyImpactTombstone(tombstones, "enemy-1")?.defeatedAtTick, 144);

    const missing = resolvePlayerEnemyImpact({
        targetId: "never-seen",
        target: null,
        damage: 25
    });
    assert.deepEqual(
        missing,
        Object.freeze({
            accepted: false,
            reason: "target-missing",
            resolution: null,
            damage: 0,
            knockbackApplied: false,
            emitEffects: false
        }),
        "an arbitrary unknown target id must stay target-missing"
    );

    const lateDead = resolvePlayerEnemyImpact({
        targetId: "enemy-1",
        target: null,
        damage: 25,
        tombstones
    });
    assert.equal(lateDead.accepted, true);
    assert.equal(lateDead.resolution, "late-dead-noop");
    assert.equal(lateDead.emitEffects, false, "known tombstones must settle as a silent no-op");
    assert.equal(lateDead.knockbackApplied, false);

    const blockedEnemy = createEnemy({
        behavior: {
            advance() {},
            snapshot() {
                return null;
            },
            blocksImpactFrom(enemy, sourcePosition) {
                return sourcePosition.x > enemy.position.x;
            }
        }
    });
    const blocked = resolvePlayerEnemyImpact({
        targetId: blockedEnemy.id,
        target: blockedEnemy,
        sourcePosition: new Vector2(100, 0),
        damage: 25,
        knockback: {
            direction: new Vector2(1, 0),
            distance: 80,
            durationSeconds: 0.25
        }
    });
    assert.equal(blocked.accepted, true);
    assert.equal(blocked.resolution, "shield-blocked");
    assert.equal(blockedEnemy.health, 100, "shield checks must precede damage");

    const lethalEnemy = createEnemy({ health: 20, maxHealth: 20 });
    const lethal = resolvePlayerEnemyImpact({
        targetId: lethalEnemy.id,
        target: lethalEnemy,
        sourcePosition: new Vector2(-100, 0),
        damage: 25,
        knockback: {
            direction: new Vector2(1, 0),
            distance: 120,
            durationSeconds: 0.25
        }
    });
    assert.equal(lethal.accepted, true);
    assert.equal(lethal.resolution, "enemy-defeated");
    assert.equal(lethal.damage, 25);
    assert.equal(lethal.knockbackApplied, false, "lethal impacts must skip knockback");
    assert.equal(lethalEnemy.health, 0);
    assert.equal(lethalEnemy.knockbackSnapshot(), null);

    const survivingEnemy = createEnemy({ health: 100 });
    const surviving = resolvePlayerEnemyImpact({
        targetId: survivingEnemy.id,
        target: survivingEnemy,
        sourcePosition: new Vector2(-100, 0),
        damage: 25,
        knockback: {
            direction: new Vector2(0, -1),
            distance: 90,
            durationSeconds: 0.3
        }
    });
    assert.equal(surviving.accepted, true);
    assert.equal(surviving.resolution, "enemy-hit");
    assert.equal(surviving.knockbackApplied, true);
    assert.equal(survivingEnemy.health, 75);
    const initialPosition = survivingEnemy.position.clone();
    assert.equal(survivingEnemy.advanceImpactKnockback(0.1), true);
    assert.ok(survivingEnemy.position.y < initialPosition.y, "knockback must move along the requested vector");
    assert.ok(survivingEnemy.knockbackSnapshot()?.remainingSeconds > 0);
    assert.equal(survivingEnemy.advanceImpactKnockback(0.2), true);
    assert.equal(survivingEnemy.knockbackSnapshot(), null, "knockback state must clear after its duration");

    for (const enemyType of [
        "sentry-t1",
        "patrol-drone-t1",
        "shield-drone-t1",
        "artillery-drone-t1",
        "support-drone-t1"
    ]) {
        const fixedEnemy = createEnemy({ enemyType });
        const fixedImpact = resolvePlayerEnemyImpact({
            targetId: fixedEnemy.id,
            target: fixedEnemy,
            sourcePosition: new Vector2(-100, 0),
            damage: 25,
            knockback: {
                direction: new Vector2(0, -1),
                distance: 90,
                durationSeconds: 0.3
            }
        });
        assert.equal(fixedImpact.resolution, "enemy-hit");
        assert.equal(fixedImpact.damage, 25);
        assert.equal(fixedImpact.knockbackApplied, false, `${enemyType} must preserve its authored position/path`);
        assert.equal(fixedEnemy.health, 75);
        assert.equal(fixedEnemy.knockbackSnapshot(), null);
    }

    const swarmEnemy = createEnemy({ enemyType: "swarm-drone-t1" });
    const swarmImpact = resolvePlayerEnemyImpact({
        targetId: swarmEnemy.id,
        target: swarmEnemy,
        sourcePosition: new Vector2(-100, 0),
        damage: 25,
        knockback: { direction: new Vector2(1, 0), distance: 60, durationSeconds: 0.2 }
    });
    assert.equal(swarmImpact.knockbackApplied, true, "direct swarm dives must retain displacement feedback");

    const bossLikeEnemy = createEnemy({ impactDisplacementEnabled: false });
    const bossLike = resolvePlayerEnemyImpact({
        targetId: bossLikeEnemy.id,
        target: bossLikeEnemy,
        sourcePosition: new Vector2(-100, 0),
        damage: 30,
        knockback: {
            direction: new Vector2(1, 0),
            distance: 175,
            durationSeconds: 0.25
        },
        displacementAllowed: false
    });
    assert.equal(bossLike.accepted, true);
    assert.equal(bossLike.resolution, "enemy-hit");
    assert.equal(bossLike.damage, 30);
    assert.equal(bossLike.knockbackApplied, false, "explicit displacement opt-out must preserve damage-only bosses");
    assert.equal(bossLikeEnemy.knockbackSnapshot(), null);

    const constructorStateEnemy = createEnemy({
        knockbackState: {
            direction: { x: 3, y: 4 },
            distance: 100,
            durationSeconds: 0.5,
            remainingSeconds: 0.25
        }
    });
    const knockbackSnapshot = constructorStateEnemy.knockbackSnapshot();
    assert.ok(Math.abs(knockbackSnapshot.direction.x - 0.6) < 1e-9);
    assert.ok(Math.abs(knockbackSnapshot.direction.y - 0.8) < 1e-9);
    assert.equal(knockbackSnapshot.distance, 100);
    assert.equal(knockbackSnapshot.durationSeconds, 0.5);
    assert.equal(knockbackSnapshot.remainingSeconds, 0.25);
}
