import assert from "node:assert/strict";
import { createGameRenderer, resolveRendererProfile } from "../src/render/GameRendererFactory.js";
import { assertGameRenderer } from "../src/render/SceneRenderer.js";
import { CameraWorldRenderer, SceneRendererComposition } from "../src/render/SceneRendererComposition.js";
import { SpriteAnimation } from "../src/render/sprites/SpriteAnimation.js";
import { paintSpriteFrame } from "../src/render/sprites/SpriteCanvasPainter.js";
import { PlayerAnimationController } from "../src/render/sprites/PlayerAnimationController.js";
import { SpriteLocalPlayerRenderer } from "../src/render/sprites/SpriteActorRenderers.js";
import { DEFAULT_PLAYER_SPRITE_DEFINITION } from "../src/render/sprites/PlayerSpriteCatalog.js";
import { PLAYER_SPRITE_STATES, PlayerSpriteDefinition } from "../src/render/sprites/PlayerSpriteDefinition.js";
import {
    createPlayerSpriteDefinitionFromManifest,
    loadPlayerSpriteManifest
} from "../src/render/sprites/PlayerSpriteManifest.js";
import { createPlayerPresentationEvents } from "../src/render/sprites/PlayerPresentationEvent.js";
import { SpriteAssetFallbackRenderer } from "../src/render/SpriteSceneRenderer.js";
import { SpriteImageAsset, SpriteImageAssetSet } from "../src/render/sprites/SpriteImageAsset.js";
import { AuthoredWorldObjectRenderer, localRopes, RopeRenderer } from "../src/render/layers/SharedSceneRenderers.js";
import { runtimeAssetUrl } from "../src/render/assets/RuntimeAssetCatalog.js";
import { AuthoredAreaStructureRenderer } from "../src/render/world/AuthoredAreaStructureRenderer.js";

function recordingContext() {
    const calls = [];
    const context = new Proxy(
        {
            calls,
            globalAlpha: 1,
            save: () => calls.push(["save"]),
            restore: () => calls.push(["restore"]),
            setTransform: (...args) => calls.push(["setTransform", ...args]),
            createLinearGradient: () => ({ addColorStop() {} }),
            drawImage: (...args) => calls.push(["drawImage", ...args]),
            translate: (...args) => calls.push(["translate", ...args]),
            rotate: (...args) => calls.push(["rotate", ...args]),
            scale: (...args) => calls.push(["scale", ...args]),
            beginPath: (...args) => calls.push(["beginPath", ...args]),
            closePath: (...args) => calls.push(["closePath", ...args]),
            moveTo: (...args) => calls.push(["moveTo", ...args]),
            lineTo: (...args) => calls.push(["lineTo", ...args]),
            fill: (...args) => calls.push(["fill", ...args]),
            stroke: (...args) => calls.push(["stroke", ...args]),
            fillRect: (...args) => calls.push(["fillRect", ...args]),
            strokeRect: (...args) => calls.push(["strokeRect", ...args]),
            fillText: (...args) => calls.push(["fillText", ...args]),
            arc: (...args) => calls.push(["arc", ...args]),
            setLineDash: (...args) => calls.push(["setLineDash", ...args])
        },
        {
            get: (target, key) => (key in target ? target[key] : () => {}),
            set: (target, key, value) => {
                target[key] = value;
                calls.push(["set", key, value]);
                return true;
            }
        }
    );
    return context;
}

function makeCanvas(context) {
    return {
        getContext: () => context,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 })
    };
}

function rectangleSpan(context, axis) {
    const offsetIndex = axis === "x" ? 1 : 2;
    const sizeIndex = axis === "x" ? 3 : 4;
    const rectangles = context.calls.filter(([name]) => name === "fillRect" || name === "strokeRect");
    const start = Math.min(...rectangles.map((call) => call[offsetIndex]));
    const end = Math.max(...rectangles.map((call) => call[offsetIndex] + call[sizeIndex]));
    return end - start;
}

function frame(x = 0, durationSeconds = 0.1) {
    return { x, y: 0, width: 8, height: 8, durationSeconds };
}

function playerFrame(column = 0, row = 0, durationSeconds = 0.1, atlasId = "main") {
    return { atlasId, x: column * 24, y: row * 24, width: 24, height: 24, durationSeconds };
}

function playerStates(overrides = {}, atlasId = "main") {
    return Object.fromEntries(
        PLAYER_SPRITE_STATES.map((state, index) => [
            state,
            overrides[state] ?? { frames: [playerFrame(index % 4, Math.floor(index / 4), 0.1, atlasId)] }
        ])
    );
}

function playerDefinition(overrides = {}) {
    return new PlayerSpriteDefinition({
        id: "test-player",
        atlases: {
            main: {
                source: "/test-player.png",
                size: { width: 96, height: 96 },
                frameSize: { width: 24, height: 24 }
            }
        },
        destinationSize: { width: 40, height: 40 },
        anchor: { x: 0.5, y: 0.5 },
        offset: { x: 1, y: 2 },
        states: playerStates(),
        ...overrides
    });
}

export async function run() {
    assert.match(
        runtimeAssetUrl("characters", "player-mock", "player-action-mock.svg"),
        /\/assets\/runtime\/characters\/player-mock\/player-action-mock\.svg$/
    );
    assert.throws(() => runtimeAssetUrl("sprites", "player-mock", "player.png"), /Unknown runtime asset category/);
    assert.throws(() => runtimeAssetUrl("characters", "Player Mock", "player.png"), /lowercase kebab-case/);
    assert.throws(() => runtimeAssetUrl("characters", "player-mock", "../player.png"), /cannot leave/);

    const context = recordingContext();
    const canvas = makeCanvas(context);
    assert.equal(createGameRenderer({ canvas }).sceneRenderer.profile, "sprite");

    const order = [];
    const composition = new SceneRendererComposition({
        profile: "ordered",
        renderers: [{ draw: () => order.push("background") }, { draw: () => order.push("world") }]
    });
    composition.draw({ context, scene: {}, viewport: { cssWidth: 320, cssHeight: 180 } });
    assert.deepEqual(order, ["background", "world"]);
    assert.ok(Object.isFrozen(composition.renderers));

    const fallbackCalls = [];
    const assetFallback = new SpriteAssetFallbackRenderer({
        asset: { status: "failed" },
        spriteRenderer: { draw: () => fallbackCalls.push("sprite") },
        polygonRenderer: { draw: () => fallbackCalls.push("polygon") }
    });
    assetFallback.draw({});
    assert.deepEqual(fallbackCalls, ["polygon"]);
    assetFallback.asset.status = "ready";
    assetFallback.draw({});
    assert.deepEqual(fallbackCalls, ["polygon", "sprite"]);

    let mockImage;
    const mockImages = [];
    class MockImage {
        constructor() {
            this.listeners = {};
            mockImage = this;
            mockImages.push(this);
        }
        addEventListener(type, listener) {
            this.listeners[type] = listener;
        }
    }
    const assetWarnings = [];
    const failedAsset = new SpriteImageAsset({
        source: "/missing.png",
        ImageClass: MockImage,
        warn: (message) => assetWarnings.push(message)
    });
    mockImage.listeners.error();
    assert.equal(failedAsset.status, "failed");
    assert.match(assetWarnings[0], /polygon scene fallback/);

    const wrongSizeAsset = new SpriteImageAsset({
        source: "/wrong-size.png",
        expectedSize: { width: 96, height: 96 },
        ImageClass: MockImage,
        warn: (message) => assetWarnings.push(message)
    });
    mockImage.naturalWidth = 24;
    mockImage.naturalHeight = 48;
    mockImage.listeners.load();
    assert.equal(wrongSizeAsset.status, "failed");
    assert.match(wrongSizeAsset.error.message, /24x48; expected 96x96/);

    const readyAsset = new SpriteImageAsset({
        source: "/right-size.png",
        expectedSize: { width: 96, height: 96 },
        ImageClass: MockImage
    });
    mockImage.naturalWidth = 96;
    mockImage.naturalHeight = 96;
    mockImage.listeners.load();
    assert.equal(readyAsset.status, "ready");
    assert.equal(readyAsset.image, mockImage);
    assert.throws(
        () => new SpriteImageAsset({ source: "/bad.png", expectedSize: { width: 0, height: 96 } }),
        /positive integer/
    );

    const imageSetStart = mockImages.length;
    const assetSet = new SpriteImageAssetSet({
        atlases: {
            locomotion: { source: "/locomotion.png", size: { width: 96, height: 48 } },
            actions: { source: "/actions.png", size: { width: 96, height: 24 } }
        },
        ImageClass: MockImage
    });
    const [locomotionImage, actionsImage] = mockImages.slice(imageSetStart);
    assert.equal(assetSet.status, "pending");
    locomotionImage.naturalWidth = 96;
    locomotionImage.naturalHeight = 48;
    locomotionImage.listeners.load();
    assert.equal(assetSet.status, "pending");
    actionsImage.naturalWidth = 96;
    actionsImage.naturalHeight = 24;
    actionsImage.listeners.load();
    assert.equal(assetSet.status, "ready");
    assert.equal(assetSet.imageFor("locomotion"), locomotionImage);
    assert.equal(assetSet.imageFor("actions"), actionsImage);
    assert.throws(() => assetSet.imageFor("missing"), /Unknown sprite atlas/);

    const failedSetStart = mockImages.length;
    const failedSet = new SpriteImageAssetSet({
        atlases: {
            locomotion: { source: "/locomotion.png", size: { width: 96, height: 48 } },
            actions: { source: "/missing-actions.png", size: { width: 96, height: 24 } }
        },
        ImageClass: MockImage,
        warn: (message) => assetWarnings.push(message)
    });
    mockImages[failedSetStart + 1].listeners.error();
    assert.equal(failedSet.status, "failed");
    assert.match(failedSet.error.message, /missing-actions/);

    const worldOrder = [];
    const worldContext = recordingContext();
    new CameraWorldRenderer([
        { draw: () => worldOrder.push("terrain") },
        { draw: () => worldOrder.push("actors") }
    ]).draw({
        context: worldContext,
        scene: { camera: { x: 10, y: 20, zoom: 2 }, impact: null },
        viewport: { cssWidth: 320, cssHeight: 180 }
    });
    assert.deepEqual(worldOrder, ["terrain", "actors"]);
    assert.deepEqual(
        worldContext.calls.filter(([name]) => ["save", "translate", "scale", "restore"].includes(name)),
        [["save"], ["translate", -20, -40], ["scale", 2, 2], ["restore"]]
    );

    assert.equal(resolveRendererProfile(""), "sprite");
    assert.equal(resolveRendererProfile("?renderer=polygon"), "polygon");
    const warnings = [];
    assert.equal(resolveRendererProfile("?renderer=unknown", { warn: (message) => warnings.push(message) }), "sprite");
    assert.match(warnings[0], /unknown/i);

    const received = [];
    const custom = createGameRenderer({
        canvas,
        profile: "test",
        sceneRendererFactories: { test: () => ({ profile: "test", draw: (args) => received.push(args) }) }
    });
    const scene = { mobileView: true, playerHealth: 1, playerMaxHealth: 1 };
    custom.draw(scene);
    assert.equal(received.length, 1);
    assert.equal(received[0].scene, scene);
    assert.deepEqual(received[0].viewport, {
        cssWidth: 320,
        cssHeight: 180,
        zoom: 1,
        cullMargin: 96,
        visibleWorldBounds: { minX: 0, minY: 0, maxX: 320, maxY: 180 },
        worldBounds: { minX: -96, minY: -96, maxX: 416, maxY: 276 }
    });
    assert.equal(received[0].renderStats, null, "draw-count instrumentation stays disabled outside metrics mode");

    const capped = createGameRenderer({
        canvas: makeCanvas(recordingContext()),
        profile: "test",
        sceneRendererFactories: { test: () => ({ profile: "test", draw() {} }) },
        canvasOptions: { pixelRatio: () => 3, performancePolicy: { maxPixelRatio: 1.5 } }
    });
    capped.draw(scene);
    assert.equal(capped.resolution.effectivePixelRatio, 1.5, "factory exposes the canvas performance policy");

    assert.throws(() => createGameRenderer({ canvas, profile: "missing" }), /Unknown renderer profile/);
    assert.throws(() => createGameRenderer({ canvas, sceneRendererFactories: null }), /must be an object/);
    assert.throws(
        () => createGameRenderer({ canvas, profile: "bad", sceneRendererFactories: { bad: true } }),
        /must be a function/
    );
    assert.throws(
        () =>
            createGameRenderer({ canvas, profile: "bad", sceneRendererFactories: { bad: () => ({ profile: "bad" }) } }),
        /Scene renderer requires/
    );
    assert.throws(
        () =>
            createGameRenderer({
                canvas,
                profile: "wanted",
                sceneRendererFactories: { wanted: () => ({ profile: "actual", draw() {} }) }
            }),
        /does not match/
    );
    assert.throws(
        () => assertGameRenderer({ draw() {}, screenToWorld() {}, cssWidth: Infinity, cssHeight: 1 }),
        /finite/
    );
    assert.throws(() => assertGameRenderer({ cssWidth: 1, cssHeight: 1 }), /draw/);

    const nonLoop = new SpriteAnimation({ id: "idle", loop: false, frames: [frame(0, 0.1), frame(8, 0.2)] });
    assert.ok(Object.isFrozen(nonLoop));
    assert.ok(Object.isFrozen(nonLoop.frames));
    assert.ok(nonLoop.frames.every(Object.isFrozen));
    assert.ok(Math.abs(nonLoop.totalDurationSeconds - 0.3) < Number.EPSILON);
    assert.equal(nonLoop.frameAt(0).x, 0);
    assert.equal(nonLoop.frameAt(0.1).x, 8);
    assert.equal(nonLoop.frameAt(0.3).x, 8);
    assert.equal(nonLoop.frameAt(20).x, 8);
    const loop = new SpriteAnimation({ id: "loop", loop: true, frames: [frame(0, 0.1), frame(8, 0.2)] });
    assert.equal(loop.frameAt(0).x, 0);
    assert.equal(loop.frameAt(0.1).x, 8);
    assert.equal(loop.frameAt(0.3).x, 0);
    assert.equal(loop.frameAt(20.3).x, 8);
    for (const bad of [
        { id: " ", frames: [frame()] },
        { id: "x", loop: 1, frames: [frame()] },
        { id: "x", frames: [] },
        { id: "x", frames: [{ ...frame(), x: Infinity }] },
        { id: "x", frames: [{ ...frame(), y: -Infinity }] },
        { id: "x", frames: [{ ...frame(), width: 0 }] },
        { id: "x", frames: [{ ...frame(), height: -1 }] },
        { id: "x", frames: [{ ...frame(), durationSeconds: 0 }] },
        { id: "x", frames: [{ ...frame(), durationSeconds: Infinity }] }
    ]) {
        assert.throws(() => new SpriteAnimation(bad));
    }
    assert.throws(() => loop.frameAt(-1));
    assert.throws(() => loop.frameAt(Infinity));

    const image = {};
    const sprite = frame(3);
    const position = { x: 40, y: 60 };
    const size = { width: 20, height: 10 };
    const anchor = { x: 0.25, y: 0.5 };
    const normal = recordingContext();
    paintSpriteFrame({ context: normal, image, frame: sprite, position, size, anchor });
    assert.deepEqual(
        normal.calls.filter(([name]) => name === "save" || name === "restore"),
        [["save"], ["restore"]]
    );
    assert.equal(normal.imageSmoothingEnabled, false);
    assert.deepEqual(
        normal.calls.find(([name]) => name === "drawImage"),
        ["drawImage", image, 3, 0, 8, 8, 35, 55, 20, 10]
    );
    const flipped = recordingContext();
    paintSpriteFrame({ context: flipped, image, frame: sprite, position, size, anchor, flipX: true });
    assert.deepEqual(
        flipped.calls.filter(([name]) => name === "save" || name === "restore"),
        [["save"], ["restore"]]
    );
    assert.deepEqual(
        flipped.calls.filter(([name]) => name === "translate" || name === "scale"),
        [
            ["translate", 40, 0],
            ["scale", -1, 1]
        ]
    );
    const flippedDraw = flipped.calls.find(([name]) => name === "drawImage");
    assert.deepEqual(flippedDraw.slice(1, 6), [image, 3, 0, 8, 8]);
    assert.deepEqual([40 - flippedDraw[6] - 20, flippedDraw[7], 20, 10], [35, 55, 20, 10]);
    const rotated = recordingContext();
    paintSpriteFrame({
        context: rotated,
        image,
        frame: sprite,
        position,
        size,
        anchor,
        offset: { x: 2, y: -1 },
        rotation: 0.5
    });
    assert.deepEqual(
        rotated.calls.filter(([name]) => name === "translate" || name === "rotate"),
        [
            ["translate", 40, 60],
            ["rotate", 0.5],
            ["translate", 2, -1]
        ]
    );
    assert.deepEqual(
        rotated.calls.find(([name]) => name === "drawImage"),
        ["drawImage", image, 3, 0, 8, 8, -5, -5, 20, 10]
    );
    const cued = recordingContext();
    paintSpriteFrame({
        context: cued,
        image,
        frame: sprite,
        position: { x: 40.4, y: 60.4 },
        size,
        anchor,
        offset: { x: 2.4, y: -1.4 },
        opacity: 0.5,
        pixelSnap: true
    });
    assert.equal(cued.globalAlpha, 0.5);
    assert.deepEqual(
        cued.calls.find(([name]) => name === "drawImage"),
        ["drawImage", image, 3, 0, 8, 8, 38, 54, 20, 10]
    );
    for (const bad of [
        { frame: { ...sprite, x: NaN } },
        { frame: { ...sprite, width: 0 } },
        { size: { ...size, width: -1 } },
        { position: { ...position, y: Infinity } },
        { anchor: { x: 0, y: NaN } },
        { offset: { x: 0, y: Infinity } },
        { opacity: 0 },
        { pixelSnap: "yes" },
        { flipX: "yes" },
        { rotation: Infinity }
    ]) {
        assert.throws(() =>
            paintSpriteFrame({ context: recordingContext(), image, frame: sprite, position, size, anchor, ...bad })
        );
    }

    assert.ok(Object.isFrozen(DEFAULT_PLAYER_SPRITE_DEFINITION));
    assert.ok(Object.isFrozen(DEFAULT_PLAYER_SPRITE_DEFINITION.states.idle));
    assert.ok(Object.isFrozen(DEFAULT_PLAYER_SPRITE_DEFINITION.states.idle.frames));
    assert.ok(DEFAULT_PLAYER_SPRITE_DEFINITION.states.idle.frames.every(Object.isFrozen));
    assert.deepEqual(DEFAULT_PLAYER_SPRITE_DEFINITION.atlases.mock.size, { width: 96, height: 96 });
    assert.deepEqual(DEFAULT_PLAYER_SPRITE_DEFINITION.atlases.mock.frameSize, { width: 24, height: 24 });
    assert.equal(
        DEFAULT_PLAYER_SPRITE_DEFINITION.atlases.mock.source,
        runtimeAssetUrl("characters", "player-mock", "player-action-mock.svg")
    );
    assert.deepEqual(DEFAULT_PLAYER_SPRITE_DEFINITION.destinationSize, { width: 48, height: 48 });
    assert.deepEqual(Object.keys(DEFAULT_PLAYER_SPRITE_DEFINITION.presentations), PLAYER_SPRITE_STATES);
    for (const state of PLAYER_SPRITE_STATES) {
        const presentation = DEFAULT_PLAYER_SPRITE_DEFINITION.presentationFor(state);
        assert.equal(presentation.state, state);
        assert.equal(presentation.clipState, state, `${state} must use action-specific frames instead of a fallback`);
        for (const spriteFrame of presentation.clip.frames) {
            assert.equal(spriteFrame.atlasId, "mock");
            assert.equal(spriteFrame.width, 24);
            assert.equal(spriteFrame.height, 24);
            assert.equal(spriteFrame.x % 24, 0);
            assert.equal(spriteFrame.y % 24, 0);
            assert.ok(spriteFrame.x + spriteFrame.width <= 96);
            assert.ok(spriteFrame.y + spriteFrame.height <= 96);
        }
    }
    const presentationSignature = (state) => {
        const presentation = DEFAULT_PLAYER_SPRITE_DEFINITION.presentationFor(state);
        const firstFrame = presentation.clip.frames[0];
        return [
            presentation.clipState,
            firstFrame.atlasId,
            firstFrame.x,
            firstFrame.y,
            presentation.size.width,
            presentation.size.height,
            presentation.offset.x,
            presentation.offset.y,
            presentation.opacity
        ];
    };
    for (const [left, right] of [
        ["idle", "run"],
        ["jump", "fall"],
        ["jump", "rope"],
        ["idle", "hit"],
        ["idle", "respawn"],
        ["hit", "respawn"]
    ]) {
        assert.notDeepEqual(presentationSignature(left), presentationSignature(right), `${left}/${right} must differ`);
    }

    const fallbackDefinition = playerDefinition({
        states: playerStates(
            Object.fromEntries(
                PLAYER_SPRITE_STATES.filter((state) => state !== "idle").map((state) => [state, { fallback: "idle" }])
            )
        )
    });
    assert.equal(fallbackDefinition.presentationFor("hit").clipState, "idle");
    assert.throws(() => playerDefinition({ states: { idle: { frames: [playerFrame()] } } }), /state 'run'/);
    assert.throws(
        () => playerDefinition({ states: playerStates({ hit: { frames: [playerFrame(4, 0)] } }) }),
        /outside the declared atlas grid/
    );
    assert.throws(
        () => playerDefinition({ states: playerStates({ hit: { frames: [{ ...playerFrame(), x: 1 }] } }) }),
        /outside the declared atlas grid/
    );
    assert.throws(
        () => playerDefinition({ states: playerStates({ hit: { frames: [playerFrame()], cue: null } }) }),
        /cue must be an object/
    );
    assert.throws(
        () =>
            playerDefinition({
                states: playerStates({ idle: { fallback: "run" }, run: { fallback: "idle" } })
            }),
        /fallback cycle/
    );

    const customDefinition = playerDefinition({
        states: playerStates({ idle: { frames: [playerFrame(1, 0)] } })
    });
    const playerContext = recordingContext();
    new SpriteLocalPlayerRenderer({ assets: { imageFor: () => image }, definition: customDefinition }).draw({
        context: playerContext,
        scene: {
            localPlayerId: "local-player",
            player: {
                position: { x: 40, y: 60 },
                velocity: { x: 0, y: 0 },
                isGrounded: true,
                lifeState: "active",
                rope: { isAttached: false }
            },
            playerPresentationEvents: []
        },
        presentationTimeSeconds: 0
    });
    assert.deepEqual(
        playerContext.calls.find(([name]) => name === "drawImage"),
        ["drawImage", image, 24, 0, 24, 24, 21, 42, 40, 40],
        "player renderer must consume definition-owned frame, size, anchor, and offset"
    );
    const singlePlayerContext = recordingContext();
    const singlePlayer = {
        position: { x: 40, y: 60 },
        velocity: { x: 0, y: 0 },
        isGrounded: true,
        lifeState: "active",
        rope: { isAttached: false }
    };
    Object.defineProperty(singlePlayer, "angle", { get: () => 0.625 });
    new SpriteLocalPlayerRenderer({ assets: { imageFor: () => image }, definition: customDefinition }).draw({
        context: singlePlayerContext,
        scene: { localPlayerId: "local-player", player: singlePlayer, playerPresentationEvents: [] },
        presentationTimeSeconds: 0
    });
    assert.deepEqual(
        singlePlayerContext.calls.find(([name]) => name === "rotate"),
        ["rotate", 0.625],
        "the single-player renderer must preserve prototype-backed physics rotation"
    );
    const ropeContext = recordingContext();
    new RopeRenderer(localRopes).draw({
        context: ropeContext,
        scene: {
            player: { position: { x: 40, y: 60 }, angle: 0 },
            rope: {
                isAttached: true,
                anchor: { x: 40, y: 0 },
                attachmentOffset: { x: 12, y: -7 },
                tension: 0
            }
        }
    });
    assert.deepEqual(
        ropeContext.calls.find(([name]) => name === "lineTo"),
        ["lineTo", 52, 53],
        "the shared rope renderer must end at the rotated hand attachment instead of the body centre"
    );
    const authoredObjectContext = recordingContext();
    new AuthoredWorldObjectRenderer().draw({
        context: authoredObjectContext,
        scene: {
            worldProgress: { completedObjectiveIds: [], unlockedGateIds: [] },
            world: {
                objects: [
                    {
                        id: "sector-01-01:anchor-a",
                        kind: "grapple-landmark",
                        presentationId: "world-object:grapple-landmark",
                        position: { x: 40, y: 60 },
                        label: "A"
                    }
                ],
                areas: [{ recoveryPoints: [{ x: 80, y: 100 }] }]
            }
        }
    });
    assert.ok(
        authoredObjectContext.calls.some(([name]) => name === "strokeRect"),
        "grapple landmarks use a mechanical bracket silhouette"
    );
    assert.equal(
        authoredObjectContext.calls.some(([name]) => name === "arc"),
        false,
        "grapple and recovery points are not exposed as circular debug markers"
    );
    assert.deepEqual(
        authoredObjectContext.calls.find(([name]) => name === "fillText")?.slice(1),
        ["A", 0, -25],
        "route landmark labels sit outside the grapple fixture instead of inside a circle"
    );

    const areaStructureContext = recordingContext();
    new AuthoredAreaStructureRenderer().draw({
        context: areaStructureContext,
        scene: {
            world: {
                areas: [
                    {
                        id: "sector-01-01",
                        sectorId: "sector-01",
                        order: 1,
                        name: "SERVICE SHAFT",
                        subtitle: "VERTICAL GRID CASCADE FAILURE",
                        bounds: { x: -480, y: -960, width: 960, height: 960 },
                        exit: { x: 320, y: -928 },
                        gateId: "sector-01-01:gate"
                    }
                ],
                gates: [
                    {
                        id: "sector-01-01:gate",
                        barrier: { x: 288, y: -1024, width: 64, height: 128 }
                    }
                ]
            }
        }
    });
    assert.ok(
        areaStructureContext.calls.some(
            ([name, x, y, width, height]) =>
                name === "fillRect" && x === -480 && y === -960 && width === 44 && height === 960
        ),
        "authored areas render a world-space left wall from their actual bounds"
    );
    assert.ok(
        areaStructureContext.calls.some(
            ([name, x, y, width, height]) =>
                name === "fillRect" && x === 436 && y === -960 && width === 44 && height === 960
        ),
        "authored areas render a matching right wall instead of one screen-space shaft"
    );
    assert.ok(
        areaStructureContext.calls.some(([name, label]) => name === "fillText" && label === "01 · SERVICE SHAFT"),
        "each room shell carries its authored area identity"
    );
    const proceduralStructureContext = recordingContext();
    new AuthoredAreaStructureRenderer().draw({
        context: proceduralStructureContext,
        scene: { world: { surfaces: [], areas: [] } }
    });
    assert.equal(
        proceduralStructureContext.calls.some(([name]) => name === "fillRect"),
        false,
        "procedural worlds do not inherit authored room shells"
    );

    const gateContext = recordingContext();
    new AuthoredWorldObjectRenderer().draw({
        context: gateContext,
        scene: {
            worldProgress: { completedObjectiveIds: [], unlockedGateIds: [] },
            world: {
                objects: [
                    {
                        id: "sector-01-01:service-gate",
                        kind: "gate",
                        gateId: "sector-01-01:gate",
                        presentationId: "world-object:gate",
                        position: { x: 320, y: -928 }
                    }
                ],
                areas: []
            }
        }
    });
    assert.ok(
        gateContext.calls.some(([name]) => name === "fillRect"),
        "locked Gates render solid door panels"
    );
    assert.equal(
        gateContext.calls.some(([name]) => name === "lineTo"),
        false,
        "Gate presentation no longer uses a floating diagonal X debug symbol"
    );
    assert.ok(rectangleSpan(gateContext, "y") > 48, "a Gate door must remain taller than the 48px player");
    assert.ok(rectangleSpan(gateContext, "y") <= 64, "a Gate door must stay only slightly taller than the 48px player");
    const gateFrame = gateContext.calls.find(
        ([name, , , width, height]) => name === "strokeRect" && width === 52 && height === 62
    );
    assert.equal(gateFrame[2] + gateFrame[4], 96, "the Gate door bottom must sit on the authored exit deck");
    const unlockedGateContext = recordingContext();
    new AuthoredWorldObjectRenderer().draw({
        context: unlockedGateContext,
        scene: {
            worldProgress: { completedObjectiveIds: [], unlockedGateIds: ["sector-01-01:gate"] },
            world: {
                objects: [
                    {
                        id: "sector-01-01:service-gate",
                        kind: "gate",
                        gateId: "sector-01-01:gate",
                        presentationId: "world-object:gate",
                        position: { x: 320, y: -928 }
                    }
                ],
                areas: []
            }
        }
    });
    assert.equal(
        unlockedGateContext.calls.some(
            ([name, , , width, height]) => name === "fillRect" && width > 70 && height > 130
        ),
        false,
        "an unlocked Gate leaves its central passage visually open"
    );

    const gatePanel = {
        id: "sector-01-02:exit-panel",
        kind: "gate-panel",
        gateId: "sector-01-02:gate",
        objectiveId: "sector-01-02:exit-panel-engaged",
        requiredObjectiveIds: ["sector-01-02:final-deck-reached"],
        presentationId: "world-object:gate-panel",
        position: { x: 208, y: -1024 }
    };
    const lockedPanelContext = recordingContext();
    new AuthoredWorldObjectRenderer().draw({
        context: lockedPanelContext,
        scene: {
            worldProgress: { completedObjectiveIds: [], unlockedGateIds: [] },
            world: { objects: [gatePanel], areas: [] }
        }
    });
    assert.ok(
        lockedPanelContext.calls.some(([name]) => name === "fillRect"),
        "the Gate panel is always visible"
    );
    assert.ok(
        lockedPanelContext.calls.some(
            ([name, key, value]) => name === "set" && key === "fillStyle" && value === "#fb7185"
        ),
        "a blocked Gate panel shows a locked status light"
    );
    assert.ok(
        rectangleSpan(lockedPanelContext, "y") < 48,
        "a Gate control panel silhouette must stay smaller than the 48px player"
    );
    const readyPanelContext = recordingContext();
    new AuthoredWorldObjectRenderer().draw({
        context: readyPanelContext,
        scene: {
            worldProgress: {
                completedObjectiveIds: ["sector-01-02:final-deck-reached"],
                unlockedGateIds: []
            },
            world: { objects: [gatePanel], areas: [] }
        }
    });
    assert.ok(
        readyPanelContext.calls.some(
            ([name, key, value]) => name === "set" && key === "fillStyle" && value === "#fbbf24"
        ),
        "a ready Gate panel uses the shared interaction color"
    );
    const openedPanelContext = recordingContext();
    new AuthoredWorldObjectRenderer().draw({
        context: openedPanelContext,
        scene: {
            worldProgress: {
                completedObjectiveIds: ["sector-01-02:final-deck-reached", "sector-01-02:exit-panel-engaged"],
                unlockedGateIds: ["sector-01-02:gate"]
            },
            world: { objects: [gatePanel], areas: [] }
        }
    });
    assert.ok(
        openedPanelContext.calls.some(
            ([name, key, value]) => name === "set" && key === "fillStyle" && value === "#67e8f9"
        ),
        "an opened Gate panel matches the Gate's open-state color"
    );

    const manifest = {
        formatVersion: 1,
        id: "manifest-player",
        render: {
            facing: "right",
            size: { width: 48, height: 48 },
            anchor: { x: 0.5, y: 0.625 },
            offset: { x: 0, y: 0 },
            pixelSnap: true
        },
        atlases: {
            locomotion: {
                image: "locomotion.png",
                size: { width: 96, height: 48 },
                frameSize: { width: 24, height: 24 }
            },
            actions: {
                image: "actions.png",
                size: { width: 96, height: 24 },
                frameSize: { width: 24, height: 24 }
            }
        },
        animations: Object.fromEntries(
            PLAYER_SPRITE_STATES.map((state, index) => {
                const action = state === "hit" || state === "respawn";
                return [
                    state,
                    {
                        loop: !action,
                        frames: [
                            {
                                atlas: action ? "actions" : "locomotion",
                                cell: {
                                    column: action ? index - 5 : index % 4,
                                    row: action ? 0 : Math.floor(index / 4)
                                },
                                durationMs: action ? (state === "hit" ? 300 : 450) : 100
                            }
                        ]
                    }
                ];
            })
        )
    };
    const manifestDefinition = createPlayerSpriteDefinitionFromManifest(manifest, {
        baseUrl: "https://game.test/sprites/player/sprite-manifest.json"
    });
    assert.deepEqual(Object.keys(manifestDefinition.atlases), ["locomotion", "actions"]);
    assert.equal(manifestDefinition.atlases.actions.source, "https://game.test/sprites/player/actions.png");
    assert.equal(manifestDefinition.presentationFor("idle").clip.frames[0].atlasId, "locomotion");
    assert.equal(manifestDefinition.presentationFor("hit").clip.frames[0].atlasId, "actions");

    let fetchedManifestUrl;
    const fetchedDefinition = await loadPlayerSpriteManifest("https://game.test/sprites/player/sprite-manifest.json", {
        fetchFn: async (url) => {
            fetchedManifestUrl = url;
            return { ok: true, json: async () => manifest };
        }
    });
    assert.equal(fetchedManifestUrl, "https://game.test/sprites/player/sprite-manifest.json");
    assert.equal(fetchedDefinition.presentationFor("respawn").clip.frames[0].atlasId, "actions");
    const unsafeManifest = structuredClone(manifest);
    unsafeManifest.atlases.actions.image = "../actions.png";
    assert.throws(() => createPlayerSpriteDefinitionFromManifest(unsafeManifest), /cannot leave/);
    unsafeManifest.atlases.actions.image = "%2e%2e/actions.png";
    assert.throws(() => createPlayerSpriteDefinitionFromManifest(unsafeManifest), /cannot leave/);
    const unknownAtlasManifest = structuredClone(manifest);
    unknownAtlasManifest.animations.hit.frames[0].atlas = "toString";
    assert.throws(() => createPlayerSpriteDefinitionFromManifest(unknownAtlasManifest), /unknown atlas 'toString'/);
    const unknownFieldManifest = structuredClone(manifest);
    unknownFieldManifest.collider = { radius: 12 };
    assert.throws(() => createPlayerSpriteDefinitionFromManifest(unknownFieldManifest), /unknown fields: collider/);

    const atlasImages = { locomotion: {}, actions: {} };
    const multiAtlasContext = recordingContext();
    const multiAtlasRenderer = new SpriteLocalPlayerRenderer({
        assets: { imageFor: (atlasId) => atlasImages[atlasId] },
        definition: manifestDefinition
    });
    assert.equal(
        multiAtlasRenderer.controllerFor("duration-check").transientDurations.hit,
        0.3,
        "transient presentation duration must come from manifest frame timing"
    );
    multiAtlasRenderer.draw({
        context: multiAtlasContext,
        scene: {
            localPlayerId: "local-player",
            player: {
                id: "local-player",
                position: { x: 40, y: 60 },
                velocity: { x: 0, y: 0 },
                isGrounded: true,
                lifeState: "active",
                rope: { isAttached: false }
            },
            playerPresentationEvents: [{ id: "hit:multi-atlas", playerId: "local-player", type: "hit" }]
        },
        presentationTimeSeconds: 0
    });
    assert.equal(
        multiAtlasContext.calls.find(([name]) => name === "drawImage")[1],
        atlasImages.actions,
        "player renderer must select the frame-owned atlas without state-specific branching"
    );

    const controller = new PlayerAnimationController();
    const grounded = { velocity: { x: 0, y: 0 }, isGrounded: true, lifeState: "active" };
    assert.equal(controller.update({ player: grounded, rope: { isAttached: false }, events: [], dt: 0 }).state, "idle");
    assert.equal(
        controller.update({
            player: { ...grounded, velocity: { x: -80, y: 0 } },
            rope: { isAttached: false },
            events: [],
            dt: 0.1
        }).state,
        "run"
    );
    assert.equal(controller.snapshot().flipX, true);
    assert.equal(
        controller.update({
            player: { ...grounded, isGrounded: false, velocity: { x: 0, y: -10 } },
            rope: { isAttached: false },
            events: [],
            dt: 0.1
        }).state,
        "jump"
    );
    assert.equal(controller.snapshot().flipX, true, "vertical motion must preserve facing");
    assert.equal(
        controller.update({ player: grounded, rope: { isAttached: true }, events: [], dt: 0.1 }).state,
        "rope"
    );
    assert.equal(
        controller.update({
            player: grounded,
            rope: { isAttached: false },
            events: [{ id: "hit-1", type: "hit" }],
            dt: 0
        }).state,
        "hit"
    );
    assert.equal(
        controller.update({
            player: grounded,
            rope: { isAttached: false },
            events: [{ id: "hit-2", type: "hit" }],
            dt: 0.2
        }).elapsedSeconds,
        0,
        "a new hit must restart the transient"
    );
    assert.equal(
        controller.update({
            player: grounded,
            rope: { isAttached: false },
            events: [{ id: "respawn-1", type: "respawn" }],
            dt: 0
        }).state,
        "respawn"
    );
    assert.equal(
        controller.update({
            player: grounded,
            rope: { isAttached: false },
            events: [{ id: "hit-3", type: "hit" }],
            dt: 0.1
        }).state,
        "respawn",
        "hit must be ignored during respawn"
    );
    assert.equal(
        controller.update({ player: grounded, rope: { isAttached: false }, events: [], dt: 0.35 }).state,
        "idle",
        "transient completion must resolve current locomotion"
    );
    assert.deepEqual(
        createPlayerPresentationEvents([
            {
                eventId: "impact-1",
                objectId: "enemy-projectile-1",
                eventType: "resolve",
                resolution: "player-hit",
                parameters: { targetId: "remote-player" }
            },
            {
                eventId: "respawn-1",
                eventType: "player-respawned",
                playerId: "local-player",
                reason: "health",
                causeId: "enemy-projectile-1",
                position: { x: 120, y: 500 }
            }
        ]),
        [
            { id: "hit:enemy-projectile-1", playerId: "remote-player", type: "hit" },
            { id: "respawn:local-player:enemy-projectile-1", playerId: "local-player", type: "respawn" }
        ]
    );
    assert.deepEqual(
        createPlayerPresentationEvents([
            {
                projectileId: "enemy-projectile-1",
                eventType: "predicted-resolve",
                resolution: "player-hit",
                targetId: "remote-player"
            },
            {
                type: "checkpoint-respawn",
                playerId: "local-player",
                reason: "health",
                causeId: "enemy-projectile-1",
                position: { x: 120, y: 500 }
            }
        ]),
        [
            { id: "hit:enemy-projectile-1", playerId: "remote-player", type: "hit" },
            { id: "respawn:local-player:enemy-projectile-1", playerId: "local-player", type: "respawn" }
        ],
        "predicted and authoritative impact/status events must collapse to the same presentation ids"
    );
}
