import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_ENVIRONMENT_DEFINITION } from "../src/render/environment/EnvironmentCatalog.js";
import { EnvironmentAssetSet } from "../src/render/environment/EnvironmentAssetSet.js";
import { createEnvironmentDefinitionFromManifest } from "../src/render/environment/EnvironmentManifest.js";
import { EnvironmentRendererComposer } from "../src/render/environment/EnvironmentRendererComposer.js";
import { currentAuthoredArea, sceneEnvironmentZone } from "../src/render/environment/AltitudeZoneResolver.js";
import { PixelDecorationRenderer } from "../src/render/environment/renderers/PixelDecorationRenderer.js";
import { PixelBackdropRenderer } from "../src/render/environment/renderers/PixelBackdropRenderer.js";
import { PixelTerrainRenderer } from "../src/render/environment/renderers/PixelTerrainRenderer.js";
import { RenderFrameStats } from "../src/render/RenderPerformanceMetrics.js";
import { createRenderViewport } from "../src/render/RenderViewport.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

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
        strokeRect: (...args) => calls.push(["strokeRect", ...args]),
        setLineDash: (...args) => calls.push(["setLineDash", ...args]),
        fillRect: (...args) => calls.push(["fillRect", ...args]),
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

function readyAssets({ fail = null, atlases = DEFAULT_ENVIRONMENT_DEFINITION.atlases } = {}) {
    MockImage.instances = [];
    const assets = new EnvironmentAssetSet({
        atlases,
        ImageClass: MockImage,
        warn: () => {}
    });
    for (const [atlasId, atlas] of Object.entries(atlases)) {
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
    const sector0102Scene = authoredScene("sector-01", "sector-01-02", { x: 0, y: -100 });
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
    const seamlessWorld = createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 560 });
    const sector01Landmark = seamlessWorld.landmarks.find(({ id }) => id === "sector-01:landmark:01");
    const seamlessSector01Scene = {
        ...currentScene,
        player: { position: sector01Landmark.entry },
        world: seamlessWorld,
        worldProgress: {
            currentSectorId: "sector-01",
            currentLandmarkId: sector01Landmark.id
        }
    };
    assert.equal(currentAuthoredArea(seamlessSector01Scene)?.legacyAreaId, "sector-01-01");
    const sector02Landmark = seamlessWorld.landmarks.find(({ id }) => id === "sector-02:landmark:01");
    const seamlessScene = {
        ...currentScene,
        player: { position: sector02Landmark.entry },
        world: seamlessWorld,
        worldProgress: {
            currentSectorId: "sector-02",
            currentLandmarkId: sector02Landmark.id
        }
    };
    assert.equal(currentAuthoredArea(seamlessScene)?.id, sector02Landmark.id);
    assert.equal(sceneEnvironmentZone(definition, seamlessScene).id, "residential-commercial");
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
    const sector01Manifest = JSON.parse(
        readFileSync(resolve(ROOT, "assets/runtime/environments/sector-01-maintenance/sprite-manifest.json"), "utf8")
    );
    const sector01Definition = createEnvironmentDefinitionFromManifest(sector01Manifest);
    const authoredAreaEnvironmentDefinitions = Object.freeze(
        Object.fromEntries(
            Array.from({ length: 8 }, (_, index) => [
                `sector-01-${String(index + 1).padStart(2, "0")}`,
                sector01Definition
            ])
        )
    );
    const mergedAtlases = { ...definition.atlases, ...sector01Definition.atlases };
    const authoredAssets = readyAssets({ atlases: mergedAtlases });
    const sector01LayerImages = ["far", "mid", "near"].map((layer) =>
        authoredAssets.imageFor(`sector-01-maintenance-backdrop-${layer}`)
    );
    const authoredBackdropRenderer = new PixelBackdropRenderer({
        definition,
        assets: authoredAssets,
        authoredAreaEnvironmentDefinitions
    });
    const sector0101BackdropContext = recordingContext();
    authoredBackdropRenderer.draw({
        context: sector0101BackdropContext,
        scene: sector01Scene,
        viewport
    });
    const sector0101DrawnImages = sector0101BackdropContext.calls
        .filter(([name]) => name === "drawImage")
        .map(([, image]) => image);
    assert.deepEqual(
        sector0101DrawnImages.slice(-3),
        sector01LayerImages,
        "Sector 01-1 draws the shared far, mid, and near layers in depth order"
    );
    const seamlessSector01BackdropContext = recordingContext();
    authoredBackdropRenderer.draw({
        context: seamlessSector01BackdropContext,
        scene: seamlessSector01Scene,
        viewport
    });
    assert.deepEqual(
        seamlessSector01BackdropContext.calls
            .filter(([name]) => name === "drawImage")
            .map(([, image]) => image)
            .slice(-3),
        sector01LayerImages,
        "the seamless Sector 01 landmark resolves its legacy Area environment package"
    );
    const sector0101BottomContext = recordingContext();
    authoredBackdropRenderer.draw({
        context: sector0101BottomContext,
        scene: authoredScene("sector-01", "sector-01-01", { x: 0, y: -10 }),
        viewport
    });
    const sector0101TopContext = recordingContext();
    authoredBackdropRenderer.draw({
        context: sector0101TopContext,
        scene: authoredScene("sector-01", "sector-01-01", { x: 0, y: -1070 }),
        viewport
    });
    const farLayerDraw = (context) =>
        context.calls.find(([name, image]) => name === "drawImage" && image === sector01LayerImages[0]);
    const bottomBackdropY = farLayerDraw(sector0101BottomContext)[7];
    const topBackdropY = farLayerDraw(sector0101TopContext)[7];
    assert.ok(topBackdropY > bottomBackdropY, "Sector 01-1 far background moves downward as the player climbs");
    const sector0102BackdropContext = recordingContext();
    authoredBackdropRenderer.draw({
        context: sector0102BackdropContext,
        scene: sector0102Scene,
        viewport
    });
    assert.deepEqual(
        sector0102BackdropContext.calls
            .filter(([name]) => name === "drawImage")
            .map(([, image]) => image)
            .slice(-3),
        sector01LayerImages,
        "Sector 01-2 continues the same Sector 01 depth-layer package"
    );
    const failedSector01Assets = readyAssets({
        atlases: mergedAtlases,
        fail: "sector-01-maintenance-backdrop-mid"
    });
    const authoredFallbackCalls = [];
    const authoredWarnings = [];
    const authoredComposer = new EnvironmentRendererComposer({
        definition,
        assets: failedSector01Assets,
        authoredAreaEnvironmentDefinitions,
        polygonBackdrop: { draw: () => authoredFallbackCalls.push("backdrop") },
        polygonTerrain: { draw: () => authoredFallbackCalls.push("terrain") },
        warn: (message) => authoredWarnings.push(message)
    });
    authoredComposer.draw({ context: recordingContext(), scene: sector01Scene, viewport });
    assert.equal(authoredComposer.status.backdrop.status, "failed");
    assert.deepEqual(authoredComposer.status.failedAtlasIds(), ["sector-01-maintenance-backdrop-mid"]);
    assert.deepEqual(authoredFallbackCalls, ["backdrop"]);
    assert.match(authoredWarnings[0], /backdrop atlas failed: sector-01-maintenance-backdrop-mid/);
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
    const groundFoundationContext = recordingContext();
    new PixelTerrainRenderer({ definition, assets }).draw({
        context: groundFoundationContext,
        scene: {
            ...sector01Scene,
            world: {
                ...sector01Scene.world,
                surfaces: [
                    {
                        id: "sector-01-01:p0",
                        presentationId: "terrain:ground-foundation",
                        oneWay: true,
                        oneWayEdgeEnd: 1,
                        vertices: [
                            { x: -448, y: 0 },
                            { x: 448, y: 0 },
                            { x: 448, y: 32 },
                            { x: -448, y: 32 }
                        ]
                    }
                ]
            }
        }
    });
    assert.ok(
        groundFoundationContext.calls.some(
            ([name, x, y, width, height]) =>
                name === "fillRect" && x === -448 && y === 4 && width === 896 && height === 640
        ),
        "Sector 01-1 start floor and its foundation fill the shaft between both collision walls"
    );
    const sector01PlatformSkinContext = recordingContext();
    new PixelTerrainRenderer({ definition, assets }).draw({
        context: sector01PlatformSkinContext,
        scene: {
            ...sector01Scene,
            world: {
                ...sector01Scene.world,
                surfaces: [
                    {
                        id: "sector-01-01:r1",
                        kind: "recovery",
                        oneWay: true,
                        oneWayEdgeEnd: 1,
                        vertices: [
                            { x: -80, y: 0 },
                            { x: 80, y: 0 },
                            { x: 80, y: 16 },
                            { x: -80, y: 16 }
                        ]
                    },
                    {
                        id: "sector-01-01:p4",
                        kind: "safe-deck",
                        oneWay: true,
                        oneWayEdgeEnd: 1,
                        vertices: [
                            { x: -160, y: -64 },
                            { x: 160, y: -64 },
                            { x: 160, y: -32 },
                            { x: -160, y: -32 }
                        ]
                    },
                    {
                        id: "sector-01-01:cable-overhang",
                        kind: "overhang",
                        oneWay: false,
                        vertices: [
                            { x: -112, y: -128 },
                            { x: 112, y: -128 },
                            { x: 112, y: -96 },
                            { x: -112, y: -96 }
                        ]
                    }
                ]
            }
        }
    });
    assert.ok(
        sector01PlatformSkinContext.calls.some(
            ([name, key, value]) => name === "set" && key === "fillStyle" && value === "rgba(7, 15, 25, 0.94)"
        ),
        "Sector 01 recovery catwalks use the recessed maintenance skin"
    );
    assert.ok(
        sector01PlatformSkinContext.calls.some(
            ([name, key, value]) => name === "set" && key === "fillStyle" && value === "rgba(13, 28, 42, 0.94)"
        ),
        "Sector 01 safe decks use reinforced panel skin"
    );
    assert.ok(
        sector01PlatformSkinContext.calls.some(
            ([name, key, value]) => name === "set" && key === "strokeStyle" && value === "rgba(100, 116, 139, 0.7)"
        ),
        "Sector 01 overhangs use cross-braced solid structure"
    );
    assert.ok(
        sector01PlatformSkinContext.calls.some(
            ([name, key, value]) => name === "set" && key === "strokeStyle" && value === "rgba(125, 166, 176, 0.62)"
        ),
        "Sector 01 one-way edges use a muted blue-gray cue instead of a bright cyan stripe"
    );
    assert.ok(
        sector01PlatformSkinContext.calls.some(
            ([name, pattern]) => name === "setLineDash" && pattern[0] === 12 && pattern[1] === 6
        ),
        "Sector 01 one-way catwalks use a segmented top edge as a non-color pass-through cue"
    );
    assert.ok(
        sector01PlatformSkinContext.calls.some(
            ([name, key, value]) => name === "set" && key === "fillStyle" && value === "rgba(1, 6, 11, 0.92)"
        ),
        "Sector 01 one-way catwalks expose dark grate apertures instead of reading as solid slabs"
    );
    assert.ok(
        sector01PlatformSkinContext.calls.some(
            ([name, key, value]) => name === "set" && key === "strokeStyle" && value === "rgba(110, 139, 151, 0.42)"
        ),
        "Sector 01 one-way grate apertures repeat a subtle upward structural notch"
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
        checkpointContext.calls.some(([name]) => name === "arc"),
        false,
        "checkpoint presentation uses an in-world structure instead of a debug circle"
    );
    assert.ok(
        checkpointContext.calls.some(([name]) => name === "fillRect"),
        "checkpoint beacon has a structural silhouette"
    );
    assert.ok(
        checkpointContext.calls.some(
            ([name, x, y, width, height]) =>
                name === "fillRect" && x === -5 && y === -48 && width === 10 && height === 36
        ),
        "active Stage save point opens around a player-scale central core instead of relying on color alone"
    );
    assert.ok(
        checkpointContext.calls.some(([name, text]) => name === "fillText" && text === "STAGE SAVE"),
        "the structure explicitly identifies the Stage save function"
    );
    assert.ok(
        checkpointContext.calls.some(
            ([name, key, value]) => name === "set" && key === "fillStyle" && value === "#cfe8eb"
        ),
        "shared checkpoint uses a neutral low-saturation status light"
    );
    const inactiveCheckpointContext = recordingContext();
    new PixelTerrainRenderer({ definition, assets }).draw({
        context: inactiveCheckpointContext,
        scene: {
            ...sector01Scene,
            activeCheckpoint: null,
            world: {
                ...sector01Scene.world,
                checkpoints: [{ id: "checkpoint:sector-01-01", x: 0, y: 0, level: 0, radius: 38 }]
            }
        }
    });
    assert.ok(
        inactiveCheckpointContext.calls.some(
            ([name, x, y, width, height]) =>
                name === "fillRect" && x === -13 && y === -45 && width === 26 && height === 30
        ),
        "inactive checkpoint keeps its shutters visibly closed"
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
