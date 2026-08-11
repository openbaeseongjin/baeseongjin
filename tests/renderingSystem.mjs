import assert from "node:assert/strict";
import { createGameRenderer } from "../src/render/GameRendererFactory.js";
import { assertGameRenderer } from "../src/render/SceneRenderer.js";
import { SpriteAnimation } from "../src/render/sprites/SpriteAnimation.js";
import { paintSpriteFrame } from "../src/render/sprites/SpriteCanvasPainter.js";

function recordingContext() {
    const calls = [];
    const context = new Proxy(
        {
            calls,
            save: () => calls.push(["save"]),
            restore: () => calls.push(["restore"]),
            setTransform: (...args) => calls.push(["setTransform", ...args]),
            createLinearGradient: () => ({ addColorStop() {} }),
            drawImage: (...args) => calls.push(["drawImage", ...args]),
            translate: (...args) => calls.push(["translate", ...args]),
            scale: (...args) => calls.push(["scale", ...args])
        },
        { get: (target, key) => (key in target ? target[key] : () => {}) }
    );
    return context;
}

function makeCanvas(context) {
    return {
        getContext: () => context,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 })
    };
}

function frame(x = 0, durationSeconds = 0.1) {
    return { x, y: 0, width: 8, height: 8, durationSeconds };
}

export function run() {
    const context = recordingContext();
    const canvas = makeCanvas(context);
    assert.equal(createGameRenderer({ canvas }).sceneRenderer.profile, "polygon");

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
    assert.deepEqual(received[0].viewport, { cssWidth: 320, cssHeight: 180 });

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
    for (const bad of [
        { frame: { ...sprite, x: NaN } },
        { frame: { ...sprite, width: 0 } },
        { size: { ...size, width: -1 } },
        { position: { ...position, y: Infinity } },
        { anchor: { x: 0, y: NaN } },
        { flipX: "yes" }
    ]) {
        assert.throws(() =>
            paintSpriteFrame({ context: recordingContext(), image, frame: sprite, position, size, anchor, ...bad })
        );
    }
}
