import assert from "node:assert/strict";
import { DEFAULT_ENVIRONMENT_DEFINITION } from "../src/render/environment/EnvironmentCatalog.js";
import { EnvironmentAssetSet } from "../src/render/environment/EnvironmentAssetSet.js";
import { EnvironmentRendererComposer } from "../src/render/environment/EnvironmentRendererComposer.js";
import { currentAuthoredArea, sceneEnvironmentZone } from "../src/render/environment/AltitudeZoneResolver.js";
import { PixelDecorationRenderer } from "../src/render/environment/renderers/PixelDecorationRenderer.js";
import { PixelBackdropRenderer } from "../src/render/environment/renderers/PixelBackdropRenderer.js";
import { PixelTerrainRenderer } from "../src/render/environment/renderers/PixelTerrainRenderer.js";
import { RenderFrameStats } from "../src/render/RenderPerformanceMetrics.js";
import { createRenderViewport } from "../src/render/RenderViewport.js";

function recordingContext() {
    const calls = [];
    const context = {
        calls,
        save: () => calls.push(["save"]),
        restore: () => calls.push(["restore"]),
        createLinearGradient: () => ({ addColorStop() {} }),
        drawImage: (...args) => calls.push(["drawImage", ...args]),
        translate: (...args) => calls.push(["translate", ...args]),
        rotate: (...args) => calls.push(["rotate", ...args]),
        scale: (...args) => calls.push(["scale", ...args]),
        beginPath: () => calls.push(["beginPath"]),
        moveTo: (...args) => calls.push(["moveTo", ...args]),
        lineTo: (...args) => calls.push(["lineTo", ...args]),
        bezierCurveTo: (...args) => calls.push(["bezierCurveTo", ...args]),
        closePath: () => calls.push(["closePath"]),
        clip: () => calls.push(["clip"]),
        fill: () => calls.push(["fill"]),
        stroke: () => calls.push(["stroke"]),
        fillRect: (...args) => calls.push(["fillRect", ...args]),
        strokeRect: (...args) => calls.push(["strokeRect", ...args]),
        arc: (...args) => calls.push(["arc", ...args]),
        fillText: (...args) => calls.push(["fillText", ...args])
    };
    return new Proxy(context, {
        set(target, key, value) {
            calls.push(["set", key, value]);
            target[key] = value;
            return true;
        }
    });
}

class MockImage {
    static instances = [];
    constructor() {
        this.listeners = {};
        MockImage.instances.push(this);
    }
    addEventListener(type, listener) {
        this.listeners[type] = listener;
    }
}

function scene() {
    return {
        camera: { x: 0, y: 0, zoom: 1 },
        player: { position: { x: 160, y: -1800 } },
        world: {
            seed: 7,
            surfaces: [
                {
                    level: 2,
                    oneWay: true,
                    oneWayEdgeEnd: 2,
                    vertices: [
                        { x: 0, y: 20 },
                        { x: 80, y: 10 },
                        { x: 120, y: 30 },
                        { x: 0, y: 80 }
                    ]
                }
            ],
            checkpoints: []
        }
    };
}

function readyAssets({ fail = null } = {}) {
    MockImage.instances = [];
    const assets = new EnvironmentAssetSet({
        atlases: DEFAULT_ENVIRONMENT_DEFINITION.atlases,
        ImageClass: MockImage,
        warn: () => {}
    });
    for (const [atlasId, atlas] of Object.entries(DEFAULT_ENVIRONMENT_DEFINITION.atlases)) {
        const image = MockImage.instances.find((candidate) => candidate.src === atlas.source);
        image.naturalWidth = atlas.size.width;
        image.naturalHeight = atlas.size.height;
        if (atlasId === fail) image.listeners.error();
        else image.listeners.load();
    }
    return assets;
}

export function run() {
    const definition = DEFAULT_ENVIRONMENT_DEFINITION;
    const viewport = { cssWidth: 320, cssHeight: 180 };
    const currentScene = scene();
    const assets = readyAssets();
    const authoredScene = (sectorId, areaId, position) => ({
        ...currentScene,
        player: { position },
        worldProgress: { currentAreaId: areaId },
        world: {
            ...currentScene.world,
            areas: [
                {
                    id: areaId,
                    sectorId,
                    bounds: { x: -480, y: -1080, width: 960, height: 1080 },
                    recoveryPoints: []
                }
            ]
        }
    });
    const sector01Scene = authoredScene("sector-01", "sector-01-01", { x: 0, y: -100 });
    const sector02Scene = authoredScene("sector-02", "sector-02-01", { x: 0, y: -100 });
    assert.equal(currentAuthoredArea(sector01Scene)?.id, "sector-01-01");
    assert.equal(
        sceneEnvironmentZone(definition, sector01Scene).id,
        "industrial-maintenance",
        "authored Sector 01 keeps its industrial shaft theme instead of using low-altitude waste"
    );
    assert.equal(
        sceneEnvironmentZone(definition, sector02Scene).id,
        "residential-commercial",
        "authored Sector 02 keeps its residential city theme instead of inheriting procedural altitude zones"
    );
    const fallenToPreviousSectorScene = {
        ...sector02Scene,
        player: { position: { x: 5000, y: -100 } },
        world: {
            ...sector02Scene.world,
            areas: [
                {
                    id: "sector-01-08",
                    sectorId: "sector-01",
                    bounds: { x: -480, y: -1080, width: 960, height: 1080 },
                    recoveryPoints: []
                },
                {
                    id: "sector-02-01",
                    sectorId: "sector-02",
                    bounds: { x: -480, y: -2160, width: 960, height: 1080 },
                    recoveryPoints: []
                }
            ]
        }
    };
    assert.equal(
        currentAuthoredArea(fallenToPreviousSectorScene)?.id,
        "sector-01-08",
        "authored background area follows the player's Y position when falling below forward-only progress"
    );
    assert.equal(
        sceneEnvironmentZone(definition, fallenToPreviousSectorScene).id,
        "industrial-maintenance",
        "falling to the previous sector restores that sector's background theme"
    );
    const fallenBackdropContext = recordingContext();
    new PixelBackdropRenderer({ definition, assets }).draw({
        context: fallenBackdropContext,
        scene: fallenToPreviousSectorScene,
        viewport
    });
    assert.ok(
        fallenBackdropContext.calls.some(
            ([name, label]) => name === "fillText" && label === "VERTICAL GRID / LOCKDOWN"
        ),
        "the rendered backdrop uses the previous sector's industrial authored treatment"
    );
    assert.equal(
        fallenBackdropContext.calls.some(
            ([name, label]) => name === "fillText" && label === "SECTOR 02 / EVACUATION ROUTE"
        ),
        false,
        "the forward progress sector must not keep controlling the rendered backdrop"
    );
    const terrainContext = recordingContext();
    new PixelTerrainRenderer({ definition, assets }).draw({ context: terrainContext, scene: currentScene });
    assert.ok(
        terrainContext.calls.some(([name]) => name === "clip"),
        "terrain tiles must be clipped to collision polygon"
    );
    const edgeImage = assets.imageFor("terrain-edge");
    assert.ok(
        terrainContext.calls.some(([name, image]) => name === "drawImage" && image === edgeImage),
        "terrain edge atlas must be painted inside the collision polygon"
    );
    const oneWayStart = terrainContext.calls.findLastIndex(([name]) => name === "beginPath");
    const oneWay = terrainContext.calls.slice(oneWayStart).filter(([name]) => name === "lineTo");
    assert.deepEqual(
        oneWay,
        [
            ["lineTo", 80, 10],
            ["lineTo", 120, 30]
        ],
        "one-way edge uses exact vertex chain"
    );
    const sector01TerrainContext = recordingContext();
    new PixelTerrainRenderer({ definition, assets }).draw({ context: sector01TerrainContext, scene: sector01Scene });
    const terrainFillImage = assets.imageFor("terrain-fill");
    assert.deepEqual(
        sector01TerrainContext.calls
            .find(([name, image]) => name === "drawImage" && image === terrainFillImage)
            .slice(2, 4),
        [0, 24],
        "Sector 01 paints the industrial terrain material"
    );
    const sector02TerrainContext = recordingContext();
    new PixelTerrainRenderer({ definition, assets }).draw({ context: sector02TerrainContext, scene: sector02Scene });
    assert.deepEqual(
        sector02TerrainContext.calls
            .find(([name, image]) => name === "drawImage" && image === terrainFillImage)
            .slice(2, 4),
        [24, 0],
        "Sector 02 paints the residential terrain material"
    );
    const checkpointContext = recordingContext();
    new PixelTerrainRenderer({ definition, assets }).draw({
        context: checkpointContext,
        scene: {
            ...sector01Scene,
            activeCheckpoint: { id: "checkpoint:sector-01-01", level: 0 },
            world: {
                ...sector01Scene.world,
                checkpoints: [{ id: "checkpoint:sector-01-01", x: 0, y: 0, level: 0, radius: 38 }]
            }
        }
    });
    assert.equal(
        checkpointContext.calls.some(([name]) => name === "arc" || name === "fillText"),
        false,
        "checkpoint presentation uses an in-world beacon instead of a labelled debug circle"
    );
    assert.ok(
        checkpointContext.calls.some(([name]) => name === "fillRect"),
        "checkpoint beacon has a structural silhouette"
    );
    const culledWorld = {
        ...currentScene.world,
        surfaces: [
            ...currentScene.world.surfaces,
            {
                level: 3,
                vertices: [
                    { x: 1600, y: 1600 },
                    { x: 1680, y: 1600 },
                    { x: 1680, y: 1680 },
                    { x: 1600, y: 1680 }
                ]
            }
        ]
    };
    const renderStats = new RenderFrameStats();
    new PixelTerrainRenderer({ definition, assets }).draw({
        context: recordingContext(),
        scene: { ...currentScene, world: culledWorld },
        viewport: createRenderViewport({
            camera: { x: 0, y: 0, zoom: 1 },
            cssWidth: 320,
            cssHeight: 180,
            cullMargin: 0
        }),
        renderStats
    });
    assert.deepEqual(
        renderStats.snapshot().terrainSurfaces,
        { total: 2, drawn: 1 },
        "terrain renderer owns surface-level view culling"
    );

    const authoredDecorationContext = recordingContext();
    const authoredDecorationStats = new RenderFrameStats();
    new PixelDecorationRenderer({ definition, assets }).draw({
        context: authoredDecorationContext,
        scene: sector01Scene,
        renderStats: authoredDecorationStats
    });
    assert.equal(
        authoredDecorationContext.calls.some(([name]) => name === "drawImage"),
        false,
        "authored worlds must not inherit procedural default-mock decoration sprites"
    );
    assert.deepEqual(
        authoredDecorationStats.snapshot().decorations,
        { total: 0, drawn: 0 },
        "authored worlds report the legacy decoration layer as intentionally empty"
    );

    MockImage.instances = [];
    const pending = new EnvironmentAssetSet({ atlases: definition.atlases, ImageClass: MockImage, warn: () => {} });
    const fallbackCalls = [];
    const composer = new EnvironmentRendererComposer({
        definition,
        assets: pending,
        polygonBackdrop: { draw: () => fallbackCalls.push("backdrop") },
        polygonTerrain: { draw: () => fallbackCalls.push("terrain") },
        warn: () => {}
    });
    composer.draw({ context: recordingContext(), scene: currentScene, viewport });
    assert.equal(composer.status.anyFailed(), false, "pending assets are not diagnostics failures");
    assert.deepEqual(fallbackCalls, ["backdrop", "terrain"], "pending components render their local fallback");
    for (const [atlasId, atlas] of Object.entries(definition.atlases)) {
        const image = MockImage.instances.find((candidate) => candidate.src === atlas.source);
        image.naturalWidth = atlas.size.width;
        image.naturalHeight = atlas.size.height;
        image.listeners.load();
    }
    composer.draw({ context: recordingContext(), scene: currentScene, viewport });
    assert.equal(composer.status.backdrop.status, "ready", "composer rechecks async readiness");
    assert.deepEqual(fallbackCalls, ["backdrop", "terrain"], "ready components stop using their fallback");

    const failedAssets = readyAssets({ fail: "backdrop-far" });
    const partialCalls = [];
    const warnings = [];
    const partial = new EnvironmentRendererComposer({
        definition,
        assets: failedAssets,
        polygonBackdrop: { draw: () => partialCalls.push("backdrop") },
        polygonTerrain: { draw: () => partialCalls.push("terrain") },
        warn: (message) => warnings.push(message)
    });
    partial.draw({ context: recordingContext(), scene: currentScene, viewport });
    partial.draw({ context: recordingContext(), scene: currentScene, viewport });
    assert.equal(partial.status.backdrop.status, "failed");
    assert.equal(partial.status.terrain.status, "ready");
    assert.equal(partial.status.decoration.status, "ready");
    assert.deepEqual(partialCalls, ["backdrop", "backdrop"], "one failed atlas falls back only its component");
    assert.equal(warnings.length, 1, "a component failure warns only once");
    assert.match(warnings[0], /backdrop atlas failed: backdrop-far/);
}
