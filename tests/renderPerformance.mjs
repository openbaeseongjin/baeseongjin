import assert from "node:assert/strict";
import {
    RenderFrameStats,
    RenderPerformanceMetrics,
    resolveCanvasBackingStore
} from "../src/render/RenderPerformanceMetrics.js";
import { createRenderViewport, isVisible } from "../src/render/RenderViewport.js";
import { enemyAimLine, enemySensorColor } from "../src/render/EnemyTelegraphPresentation.js";
import { SpriteEnemyRenderer, SpriteProjectileRenderer } from "../src/render/sprites/SpriteActorRenderers.js";
import { PolygonEnemyRenderer, PolygonProjectileRenderer } from "../src/render/polygon/PolygonActorRenderers.js";

function drawingContext() {
    return new Proxy(
        {
            fillRect() {},
            beginPath() {},
            arc() {},
            fill() {},
            save() {},
            restore() {}
        },
        { get: (target, key) => (key in target ? target[key] : () => {}) }
    );
}

function collectorSnapshot(draw) {
    const renderStats = new RenderFrameStats();
    draw(renderStats);
    return renderStats.snapshot();
}

export function run() {
    const phoneResolution = resolveCanvasBackingStore({
        cssWidth: 360,
        cssHeight: 800,
        devicePixelRatio: 3
    });
    assert.equal(phoneResolution.effectivePixelRatio, 2, "device DPR is capped independently of CSS size");
    assert.deepEqual([phoneResolution.backingWidth, phoneResolution.backingHeight], [720, 1600]);

    const tabletResolution = resolveCanvasBackingStore({
        cssWidth: 1280,
        cssHeight: 800,
        devicePixelRatio: 3
    });
    assert.ok(tabletResolution.effectivePixelRatio < 2, "large viewports must also respect the backing-pixel budget");
    assert.ok(
        tabletResolution.backingWidth * tabletResolution.backingHeight <= 3 * 1024 * 1024,
        "backing store must stay inside the configured pixel budget"
    );

    const viewport = createRenderViewport({
        camera: { x: 100, y: -200, zoom: 2 },
        cssWidth: 400,
        cssHeight: 200,
        cullMargin: 20
    });
    assert.deepEqual(viewport.visibleWorldBounds, { minX: 100, minY: -200, maxX: 300, maxY: -100 });
    assert.deepEqual(viewport.worldBounds, { minX: 80, minY: -220, maxX: 320, maxY: -80 });
    assert.equal(isVisible(viewport, { minX: 310, minY: -100, maxX: 330, maxY: -70 }), true);
    assert.equal(isVisible(viewport, { minX: 500, minY: 0, maxX: 520, maxY: 20 }), false);
    assert.ok(Object.isFrozen(viewport));
    assert.ok(Object.isFrozen(viewport.worldBounds));

    const trackedAim = enemyAimLine({
        position: { x: 10, y: 20 },
        attackState: "track",
        aimDirection: { x: 0, y: -1 }
    });
    assert.deepEqual(trackedAim.end, { x: 10, y: -500 });
    assert.equal(trackedAim.width, 1.5);
    assert.equal(
        enemyAimLine({ position: { x: 0, y: 0 }, attackState: "cooldown", aimDirection: { x: 1, y: 0 } }),
        null
    );
    assert.equal(enemySensorColor({ attackState: "lock" }), "#ff5a36");
    assert.equal(enemySensorColor({ attackState: "lock", rules: ["cutter-fire"] }), "#ff7a00");
    assert.equal(
        enemyAimLine({
            position: { x: 0, y: 0 },
            attackState: "lock",
            aimDirection: { x: 1, y: 0 },
            rules: ["cutter-fire"]
        }).color,
        "#ff8c1a",
        "a cutter-fire enemy must telegraph a distinct hot-orange aim line"
    );

    const metrics = new RenderPerformanceMetrics({ sampleSize: 4 });
    const resolution = {
        cssWidth: 400,
        cssHeight: 200,
        backingWidth: 800,
        backingHeight: 400,
        devicePixelRatio: 3,
        effectivePixelRatio: 2
    };
    const emptyCounts = Object.freeze({});
    metrics.record({ startedAtMs: 0, endedAtMs: 4, resolution, droppedSteps: 0, drawCounts: emptyCounts });
    metrics.record({ startedAtMs: 16, endedAtMs: 21, resolution, droppedSteps: 2, drawCounts: emptyCounts });
    const snapshot = metrics.record({
        startedAtMs: 36,
        endedAtMs: 43,
        resolution,
        droppedSteps: 2,
        drawCounts: emptyCounts
    });
    assert.equal(snapshot.frameIntervalP50Ms, 18);
    assert.equal(snapshot.frameIntervalP95Ms, 19.8);
    assert.equal(snapshot.maxFrameIntervalMs, 20);
    assert.equal(snapshot.renderDurationP95Ms, 6.8);
    assert.equal(snapshot.maxRenderDurationMs, 7);
    assert.equal(snapshot.recentDroppedSteps, 0);
    assert.equal(snapshot.droppedSteps, 2);

    const actorViewport = createRenderViewport({
        camera: { x: 0, y: 0, zoom: 1 },
        cssWidth: 320,
        cssHeight: 180,
        cullMargin: 0
    });
    const enemies = [
        { position: { x: 40, y: 40 }, radius: 12, health: 5, maxHealth: 10 },
        { position: { x: 800, y: 800 }, radius: 12, health: 5, maxHealth: 10 }
    ];
    const projectiles = [
        { position: { x: 60, y: 60 }, radius: 4 },
        { position: { x: -400, y: -400 }, radius: 4 }
    ];
    const spriteCounts = collectorSnapshot((renderStats) => {
        new SpriteEnemyRenderer().draw({
            context: drawingContext(),
            scene: { enemies },
            viewport: actorViewport,
            renderStats
        });
        new SpriteProjectileRenderer({
            selectProjectiles: (scene) => scene.projectiles,
            sprite: { rows: ["a"] },
            palette: { a: "#fff" },
            size: { width: 8, height: 8 },
            category: "playerProjectiles"
        }).draw({ context: drawingContext(), scene: { projectiles }, viewport: actorViewport, renderStats });
    });
    assert.deepEqual(spriteCounts.enemies, { total: 2, drawn: 1 });
    assert.deepEqual(spriteCounts.playerProjectiles, { total: 2, drawn: 1 });

    const polygonCounts = collectorSnapshot((renderStats) => {
        new PolygonEnemyRenderer().draw({
            context: drawingContext(),
            scene: { enemies },
            viewport: actorViewport,
            renderStats
        });
        new PolygonProjectileRenderer({
            selectProjectiles: (scene) => scene.projectiles,
            color: "#fff",
            category: "enemyProjectiles"
        }).draw({ context: drawingContext(), scene: { projectiles }, viewport: actorViewport, renderStats });
    });
    assert.deepEqual(polygonCounts.enemies, { total: 2, drawn: 1 });
    assert.deepEqual(polygonCounts.enemyProjectiles, { total: 2, drawn: 1 });
}
