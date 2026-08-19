import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { GameApp } from "../src/game/GameApp.js";
import { restartSingleGameForDebugSettings } from "../src/game/runtime/SingleGameDebugRestart.js";
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
    const current = snapshot({
        tick: 102,
        player: { position: new Vector2(10, 0), angle: 0, velocity: new Vector2() }
    });
    assert.deepEqual(
        interpolateRenderSnapshot(previous, current, 0).player.position,
        previous.player.position,
        "alpha zero must begin at the previous fixed-step state without snapping forward"
    );

    const midpoint = interpolateRenderSnapshot(previous, current, 0.5);
    assert.equal(midpoint.tick, 102);
    assert.deepEqual([midpoint.player.position.x, midpoint.player.position.y], [5, 0]);

    const lastCatchUpStep = interpolateRenderSnapshot(
        snapshot({
            tick: 103,
            player: { position: new Vector2(30, 0), angle: 0, velocity: new Vector2() }
        }),
        snapshot({
            tick: 104,
            player: { position: new Vector2(40, 0), angle: 0, velocity: new Vector2() }
        }),
        0.5
    );
    assert.equal(
        lastCatchUpStep.player.position.x,
        35,
        "a catch-up frame must interpolate only the final fixed step instead of the whole display frame"
    );

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

    const app = new GameApp({
        canvas: {},
        renderer: {
            profile: "test",
            cssWidth: 1280,
            cssHeight: 720,
            screenToWorld: () => ({ x: 0, y: 0 }),
            draw: () => ({})
        },
        worldSeed: 1
    });
    const idleInput = Object.freeze({
        horizontal: 0,
        vertical: 0,
        interact: false,
        pointer: Object.freeze({ x: 0, y: 0, down: false }),
        viewport: Object.freeze({ width: 1280, height: 720 }),
        mobileControls: Object.freeze({
            visible: false,
            ropePointerDown: false,
            left: false,
            right: false,
            jump: false
        })
    });
    app.update(app.runner.dt, idleInput);
    app.update(app.runner.dt, idleInput);
    assert.equal(app.setHudVisible(false), false);
    assert.equal(app.hudVisible, false, "single-player HUD visibility must be presentation-only app state");
    assert.equal(
        app.previousRenderSnapshot.tick,
        1,
        "catch-up updates must retain only the final step's previous state"
    );
    assert.equal(app.authority.snapshot().tick, 2);

    const tunedApp = new GameApp({
        canvas: {},
        renderer: {
            profile: "test",
            cssWidth: 1280,
            cssHeight: 720,
            screenToWorld: () => ({ x: 0, y: 0 }),
            draw: () => ({})
        },
        worldSeed: 2,
        ropeTuning: {
            hookSpeed: 1800,
            hookFlightRatio: { numerator: 1, denominator: 2 },
            ropeDisabledSeconds: 1.2
        },
        debugAugmentIds: ["direction-dash", "fast-reuse"]
    });
    assert.equal(tunedApp.authority.snapshot().ropeConfig.hookSpeed, 1800);
    assert.equal(tunedApp.authority.snapshot().maxAttachDistance, 900);
    assert.equal(tunedApp.authority.simulation.ropeDisabledSeconds, 1.2);
    assert.deepEqual(tunedApp.authority.snapshot().selectedAugmentIds, ["direction-dash", "fast-reuse"]);
    tunedApp.applyDebugSettings({ ropeTuning: { hookSpeed: 400 } });
    assert.equal(
        tunedApp.authority.snapshot().ropeConfig.hookSpeed,
        1800,
        "changing saved Rope tuning must not hot-swap the current Run"
    );
    assert.deepEqual(
        tunedApp.authority.snapshot().selectedAugmentIds,
        ["direction-dash", "fast-reuse"],
        "changing saved debug settings must not hot-swap the current loadout"
    );

    const lifecycle = [];
    const restarted = restartSingleGameForDebugSettings({
        currentApp: { stop: () => lifecycle.push("stop") },
        debugSettings: { ropeTuning: { hookSpeed: 1800 } },
        beforeRestart: () => lifecycle.push("before"),
        createApp: (debug) => ({
            debug,
            start: () => lifecycle.push("start")
        })
    });
    assert.deepEqual(lifecycle, ["stop", "before", "start"]);
    assert.equal(restarted.debug.ropeTuning.hookSpeed, 1800);
}
