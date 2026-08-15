import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { interpolateRenderSnapshot } from "../src/render/interpolateRenderSnapshot.js";

function snapshot(overrides = {}) {
    return {
        tick: 100,
        resets: 0,
        runState: "playing",
        player: { position: new Vector2(0, 0), angle: 0, velocity: new Vector2() },
        enemies: [],
        projectiles: [],
        enemyProjectiles: [],
        ...overrides
    };
}

export function run() {
    const first = snapshot();
    assert.equal(
        interpolateRenderSnapshot(null, first, 0.5),
        first,
        "missing previous snapshot returns the current one"
    );

    const previous = snapshot();
    const sameTick = snapshot();
    assert.equal(interpolateRenderSnapshot(previous, sameTick, 0.5), sameTick, "same tick means no steps ran");
    const current = snapshot({ tick: 102 });
    assert.equal(interpolateRenderSnapshot(previous, current, 0), current);

    const moved = snapshot({
        tick: 102,
        player: { position: new Vector2(10, 0), angle: 0, velocity: new Vector2() }
    });
    const midpoint = interpolateRenderSnapshot(previous, moved, 0.5);
    assert.equal(midpoint.tick, 102);
    assert.deepEqual([midpoint.player.position.x, midpoint.player.position.y], [5, 0]);

    const angleWrap = interpolateRenderSnapshot(
        snapshot({ player: { position: new Vector2(0, 0), angle: -3.0, velocity: new Vector2() } }),
        snapshot({ tick: 101, player: { position: new Vector2(0, 0), angle: 3.0, velocity: new Vector2() } }),
        0.5
    );
    assert.ok(Math.abs(angleWrap.player.angle - -Math.PI) < 0.001, "angle lerp must take the short arc");

    const teleported = interpolateRenderSnapshot(
        previous,
        snapshot({ tick: 102, player: { position: new Vector2(500, 0), angle: 0, velocity: new Vector2() } }),
        0.5
    );
    assert.equal(teleported.player.position.x, 500, "portal and respawn jumps must snap instead of lerp");

    const reset = interpolateRenderSnapshot(previous, snapshot({ tick: 102, resets: 1 }), 0.5);
    assert.equal(reset.resets, 1);

    const enemies = interpolateRenderSnapshot(
        snapshot({
            enemies: [{ id: "enemy:1", position: new Vector2(0, 0) }],
            projectiles: [{ id: "proj:1", position: new Vector2(100, 0) }]
        }),
        snapshot({
            tick: 102,
            enemies: [
                { id: "enemy:1", position: new Vector2(20, 0) },
                { id: "enemy:2", position: new Vector2(40, 0) }
            ],
            projectiles: []
        }),
        0.5
    );
    assert.deepEqual([enemies.enemies[0].position.x, enemies.enemies[0].position.y], [10, 0]);
    assert.equal(enemies.enemies[1].position.x, 40, "entities spawned this frame render at their current position");
    assert.deepEqual(enemies.projectiles, []);
}
