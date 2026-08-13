import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import {
    createAudioDefinitionLoader,
    createAudioPackDefinition,
    loadAudioPackDefinition
} from "../src/audio/AudioCatalog.js";
import { createAudioPackageDefinitionFromManifest } from "../src/audio/AudioManifest.js";
import { createAudioPackFromManifest } from "../src/audio/AudioPack.js";
import {
    AUDIO_MAX_DISTANCE,
    calculateSpatialAudio,
    dbToLinearGain,
    distanceGainDb
} from "../src/audio/AudioSpatializer.js";
import { AUDIO_SETTINGS_STORAGE_KEY, AudioSettings, DEFAULT_AUDIO_SETTINGS } from "../src/audio/AudioSettings.js";
import { AudioMixer } from "../src/audio/AudioMixer.js";
import { AudioVoiceManager } from "../src/audio/AudioVoiceManager.js";
import { AudioEventBindings } from "../src/audio/AudioEventBindings.js";
import { BrowserAudioAdapter } from "../src/audio/BrowserAudioAdapter.js";
import { BrowserAudioLifecycle } from "../src/audio/BrowserAudioLifecycle.js";
import { GameAudioHost } from "../src/audio/GameAudioHost.js";
import { validateAudioPackDirectory } from "../scripts/validateAudioAssets.mjs";
import { SettingsMenu } from "../src/game/ui/SettingsMenu.js";
import { AudioSettingsPanel } from "../src/game/ui/AudioSettingsPanel.js";
import { createStaticRequestHandler } from "../scripts/staticHandler.mjs";

function readJson(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}

function loadMockDefinition() {
    const pack = createAudioPackFromManifest(readJson("assets/runtime/audio/packs/default-mock/audio-pack.json"));
    const packages = Object.fromEntries(
        pack.packages.map(({ category, assetId }) => [
            category,
            createAudioPackageDefinitionFromManifest(
                readJson(`assets/runtime/audio/${category}/${assetId}/audio-manifest.json`),
                { baseUrl: `https://example.test/assets/runtime/audio/${category}/${assetId}/audio-manifest.json` }
            )
        ])
    );
    return createAudioPackDefinition(pack, packages);
}

class MemoryStorage {
    constructor(initial = {}) {
        this.values = new Map(Object.entries(initial));
    }

    getItem(key) {
        return this.values.has(key) ? this.values.get(key) : null;
    }

    setItem(key, value) {
        this.values.set(key, value);
    }
}

class FakeParameter {
    constructor(value = 1) {
        this.value = value;
        this.cancelled = 0;
    }

    cancelScheduledValues() {
        this.cancelled += 1;
    }

    setValueAtTime(value) {
        this.value = value;
    }

    linearRampToValueAtTime(value) {
        this.value = value;
    }
}

class FakeNode {
    constructor() {
        this.connections = [];
        this.disconnected = false;
    }

    connect(node) {
        this.connections.push(node);
        return node;
    }

    disconnect() {
        this.disconnected = true;
        this.connections.length = 0;
    }
}

class FakeGainNode extends FakeNode {
    constructor() {
        super();
        this.gain = new FakeParameter();
    }
}

class FakePannerNode extends FakeNode {
    constructor() {
        super();
        this.pan = new FakeParameter(0);
    }
}

class FakeBufferSource extends FakeNode {
    constructor() {
        super();
        this.playbackRate = { value: 1 };
        this.listeners = new Map();
    }

    addEventListener(type, listener) {
        this.listeners.set(type, listener);
    }

    start() {
        this.started = true;
    }

    stop() {
        this.listeners.get("ended")?.();
        this.onended?.();
    }
}

class FakeAudioContext {
    constructor() {
        this.state = "suspended";
        this.currentTime = 0;
        this.destination = new FakeNode();
        this.bufferSources = [];
        this.panners = [];
    }

    createGain() {
        return new FakeGainNode();
    }

    createStereoPanner() {
        const panner = new FakePannerNode();
        this.panners.push(panner);
        return panner;
    }

    createBufferSource() {
        const source = new FakeBufferSource();
        this.bufferSources.push(source);
        return source;
    }

    createMediaElementSource() {
        return new FakeNode();
    }

    async decodeAudioData() {
        return { duration: 0.25, numberOfChannels: 1 };
    }

    async resume() {
        this.state = "running";
    }

    async suspend() {
        this.state = "suspended";
    }

    async close() {
        this.state = "closed";
    }
}

class FakeAudioElement {
    constructor() {
        this.listeners = new Map();
        this.readyState = 0;
        this.paused = true;
        this.currentTime = 0;
        this.duration = 3;
    }

    canPlayType() {
        return "probably";
    }

    addEventListener(type, listener) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set());
        this.listeners.get(type).add(listener);
    }

    removeEventListener(type, listener) {
        this.listeners.get(type)?.delete(listener);
    }

    load() {
        this.readyState = 4;
        for (const listener of [...(this.listeners.get("loadedmetadata") ?? [])]) listener();
        for (const listener of [...(this.listeners.get("canplay") ?? [])]) listener();
    }

    async play() {
        this.paused = false;
    }

    pause() {
        this.paused = true;
    }

    removeAttribute() {}
}

class GestureBlockedAudioElement extends FakeAudioElement {
    async play() {
        const error = new Error("user activation is required");
        error.name = "NotAllowedError";
        throw error;
    }
}

class FakeRuntimeAdapter {
    constructor() {
        this.masterGains = [];
        this.groupGains = [];
        this.oneShots = [];
        this.loops = [];
        this.handles = [];
        this.state = "running";
        this.runtimeFailureListeners = new Set();
    }

    contextState() {
        return this.state;
    }

    setMasterGain(gain) {
        this.masterGains.push(gain);
    }

    setGroupGain(group, gain, transitionMs) {
        this.groupGains.push({ group, gain, transitionMs });
    }

    playOneShot(request) {
        this.oneShots.push(request);
        const handle = {
            stopped: false,
            stop: () => {
                if (handle.stopped) return;
                handle.stopped = true;
                request.onEnded();
            }
        };
        this.handles.push(handle);
        return handle;
    }

    playLoop(request) {
        this.loops.push(request);
        const handle = {
            stopped: false,
            spatial: null,
            spatialUpdates: 0,
            stop: () => (handle.stopped = true),
            setSpatial: (spatial) => {
                handle.spatial = spatial;
                handle.spatialUpdates += 1;
            }
        };
        this.handles.push(handle);
        return handle;
    }

    subscribeRuntimeFailures(listener) {
        this.runtimeFailureListeners.add(listener);
        return () => this.runtimeFailureListeners.delete(listener);
    }

    reportRuntimeFailure(failure) {
        for (const listener of this.runtimeFailureListeners) listener(failure);
    }

    suspend() {
        this.state = "suspended";
    }

    async resume() {
        this.state = "running";
        return true;
    }

    release() {
        this.state = "closed";
    }
}

class FakeElement {
    constructor(id = "") {
        this.id = id;
        this.hidden = false;
        this.dataset = {};
        this.listeners = new Map();
        this.attributes = new Map();
        this.children = [];
        this.value = "";
        this.textContent = "";
        this.checked = false;
        this.disabled = false;
    }

    addEventListener(type, listener) {
        this.listeners.set(type, listener);
    }

    removeEventListener(type, listener) {
        if (this.listeners.get(type) === listener) this.listeners.delete(type);
    }

    setAttribute(name, value) {
        this.attributes.set(name, value);
    }

    append(child) {
        this.children.push(child);
    }

    remove() {
        this.removed = true;
    }

    focus() {
        this.focused = true;
    }
}

async function testManifestAndValidator() {
    const definition = loadMockDefinition();
    assert.equal(Object.keys(definition.packages).length, 4);
    assert.equal(Object.keys(definition.clips).length, 9);
    assert.deepEqual(Object.keys(definition.cues).sort(), [
        "ambience-altitude-wind",
        "bgm-climb",
        "bgm-run-complete",
        "gameplay-checkpoint-reached",
        "gameplay-player-hit",
        "gameplay-rope-attach",
        "gameplay-weapon-fire",
        "ui-confirm"
    ]);
    const result = validateAudioPackDirectory("assets/runtime/audio/packs/default-mock");
    assert.equal(result.packageCount, 4);
    assert.equal(result.sourceCount, 9);
    assert.equal(result.cueCount, 8);

    const invalid = readJson("assets/runtime/audio/gameplay/default-mock/audio-manifest.json");
    invalid.clips["rope-attach"].sources[0].path = "../escape.wav";
    assert.throws(() => createAudioPackageDefinitionFromManifest(invalid), /cannot leave its package/);
    const invalidOneShot = readJson("assets/runtime/audio/gameplay/default-mock/audio-manifest.json");
    invalidOneShot.clips["rope-attach"].playback = "stream";
    assert.throws(() => createAudioPackageDefinitionFromManifest(invalidOneShot), /must reference buffer clips/);

    const alternateGameplayManifest = readJson("assets/runtime/audio/gameplay/default-mock/audio-manifest.json");
    alternateGameplayManifest.id = "alternate-mock";
    const alternateGameplay = createAudioPackageDefinitionFromManifest(alternateGameplayManifest);
    const swappedPack = createAudioPackDefinition(
        {
            id: "swapped-mock",
            packages: definition.packages
                ? Object.entries(definition.packages).map(([category, packageDefinition]) => ({
                      category,
                      assetId: category === "gameplay" ? "alternate-mock" : packageDefinition.id
                  }))
                : []
        },
        { ...definition.packages, gameplay: alternateGameplay }
    );
    assert.ok(swappedPack.clips["gameplay/alternate-mock:rope-attach"]);
    assert.equal(swappedPack.cues["gameplay-rope-attach"].packageId, "alternate-mock");
    assert.ok(
        definition.clips["gameplay/default-mock:rope-attach"],
        "swapping packages must not mutate the original definition"
    );

    const runtimeRoot = "https://example.test/assets/runtime/audio/";
    const resources = new Map([
        ["packs/default-mock/audio-pack.json", readJson("assets/runtime/audio/packs/default-mock/audio-pack.json")],
        ...Object.entries(definition.packages).map(([category, packageDefinition]) => [
            `${category}/${packageDefinition.id}/audio-manifest.json`,
            readJson(`assets/runtime/audio/${category}/${packageDefinition.id}/audio-manifest.json`)
        ])
    ]);
    resources.set("gameplay/alternate-mock/audio-manifest.json", alternateGameplayManifest);
    const fetched = [];
    const loadedOverride = await loadAudioPackDefinition("default-mock", {
        rootUrl: runtimeRoot,
        packageOverrides: { gameplay: "alternate-mock" },
        fetcher: async (url) => {
            const relativePath = String(url).slice(runtimeRoot.length);
            fetched.push(relativePath);
            const value = resources.get(relativePath);
            return {
                ok: Boolean(value),
                status: value ? 200 : 404,
                url: String(url),
                async json() {
                    return structuredClone(value);
                }
            };
        }
    });
    assert.equal(loadedOverride.packages.gameplay.id, "alternate-mock");
    assert.ok(fetched.includes("gameplay/alternate-mock/audio-manifest.json"));
    assert.equal(fetched.includes("gameplay/default-mock/audio-manifest.json"), false);

    const loaderCalls = [];
    const loadSelectedDefinition = createAudioDefinitionLoader({
        packId: "production-audio",
        packageOverrides: { gameplay: "gameplay-review-b" },
        loader: async (packId, options) => {
            loaderCalls.push({ packId, options });
            return { id: packId };
        }
    });
    assert.deepEqual(await loadSelectedDefinition(), { id: "production-audio" });
    assert.deepEqual(loaderCalls, [
        {
            packId: "production-audio",
            options: { packageOverrides: { gameplay: "gameplay-review-b" } }
        }
    ]);
}

function testSettingsAndSpatialAudio() {
    const corruptStorage = new MemoryStorage({ [AUDIO_SETTINGS_STORAGE_KEY]: "not-json" });
    assert.deepEqual(new AudioSettings({ storage: corruptStorage }).snapshot(), DEFAULT_AUDIO_SETTINGS);
    const storage = new MemoryStorage();
    const settings = new AudioSettings({ storage });
    settings.setMuted(true);
    settings.setGainDb("bgm", null);
    const restored = new AudioSettings({ storage });
    assert.equal(restored.snapshot().muted, true);
    assert.equal(restored.snapshot().gainsDb.bgm, null);
    assert.throws(() => settings.setGainDb("bgm", 1), /between -60 and 0/);

    assert.equal(distanceGainDb(160), 0);
    assert.equal(distanceGainDb(AUDIO_MAX_DISTANCE), -36);
    assert.equal(distanceGainDb(AUDIO_MAX_DISTANCE + 1), Number.NEGATIVE_INFINITY);
    const center = calculateSpatialAudio({
        listener: { x: 0, y: 0 },
        source: { x: 0, y: 0 },
        visibleWorldBounds: { minX: -100, maxX: 100, minY: -100, maxY: 100 }
    });
    assert.equal(center.pan, 0);
    assert.equal(center.gain, 1);
    const warning = calculateSpatialAudio({
        listener: { x: 0, y: 0 },
        source: { x: 1200, y: 0 },
        visibleWorldBounds: { minX: -100, maxX: 100, minY: -100, maxY: 100 },
        minGainDb: -18
    });
    assert.equal(warning.pan, 1);
    assert.ok(Math.abs(warning.gain - dbToLinearGain(-18)) < 1e-12);
    const outside = calculateSpatialAudio({
        listener: { x: 0, y: 0 },
        source: { x: 1201, y: 0 },
        visibleWorldBounds: { minX: -100, maxX: 100, minY: -100, maxY: 100 },
        minGainDb: -18
    });
    assert.equal(outside.gain, 0);
}

function testSettingsUiExtensionBoundary() {
    const tabList = new FakeElement();
    const close = new FakeElement();
    const root = new FakeElement();
    root.hidden = true;
    let rootQueries = 0;
    root.querySelector = (selector) => {
        rootQueries += 1;
        return { "[data-settings-tabs]": tabList, "[data-settings-close]": close }[selector] ?? null;
    };
    const trigger = new FakeElement();
    const documentTarget = new FakeElement();
    documentTarget.activeElement = trigger;
    documentTarget.createElement = () => new FakeElement();
    const menu = new SettingsMenu({ root, trigger, documentTarget });
    assert.equal(rootQueries, 0, "constructors must not traverse the DOM");
    menu.attach();
    const audioPanel = new FakeElement("settings-panel-audio");
    const graphicsPanel = new FakeElement("settings-panel-graphics");
    menu.registerTab({ id: "audio", label: "오디오", panel: audioPanel });
    menu.registerTab({ id: "graphics", label: "그래픽", panel: graphicsPanel });
    assert.equal(tabList.children.length, 2, "future settings tabs must use the same registration boundary");
    assert.equal(audioPanel.hidden, false);
    tabList.children[1].listeners.get("click")();
    assert.equal(graphicsPanel.hidden, false);
    assert.equal(audioPanel.hidden, true);
    trigger.listeners.get("click")();
    assert.equal(root.hidden, false);
    const audioTab = tabList.children[0];
    const graphicsTab = tabList.children[1];
    let keyboardPrevented = false;
    tabList.listeners.get("keydown")({
        key: "ArrowLeft",
        target: graphicsTab,
        preventDefault: () => (keyboardPrevented = true)
    });
    assert.equal(keyboardPrevented, true);
    assert.equal(audioPanel.hidden, false);
    assert.equal(audioTab.focused, true, "arrow keys must move focus with the selected tab");
    close.listeners.get("click")();
    assert.equal(root.hidden, true);
    menu.detach();
    assert.equal(tabList.listeners.has("keydown"), false);

    const controls = Object.fromEntries(
        ["master", "gameplay", "ui", "ambience", "bgm"].flatMap((key) => [
            [`[data-audio-gain="${key}"]`, new FakeElement()],
            [`[data-audio-gain-output="${key}"]`, new FakeElement()]
        ])
    );
    controls["[data-audio-muted]"] = new FakeElement();
    controls["[data-audio-reset]"] = new FakeElement();
    controls["[data-audio-status]"] = new FakeElement();
    let panelQueries = 0;
    const panelRoot = {
        querySelector: (selector) => {
            panelQueries += 1;
            return controls[selector] ?? null;
        }
    };
    const settings = new AudioSettings({ storage: new MemoryStorage() });
    const panel = new AudioSettingsPanel({ root: panelRoot, settings });
    assert.equal(panelQueries, 0, "audio panel construction must not attach to DOM state");
    assert.equal(settings.listeners.size, 0);
    panel.attach();
    assert.equal(controls['[data-audio-gain="master"]'].value, "-6");
    controls['[data-audio-gain="bgm"]'].value = "-60";
    controls['[data-audio-gain="bgm"]'].listeners.get("input")();
    assert.equal(settings.snapshot().gainsDb.bgm, null);
    panel.setRuntimeStatus("degraded", { failures: [{ clipKey: "optional" }] });
    assert.equal(controls["[data-audio-status]"].hidden, false);
    assert.match(controls["[data-audio-status]"].textContent, /일부 음원 사용 불가/);
    controls["[data-audio-reset]"].listeners.get("click")();
    assert.deepEqual(settings.snapshot(), DEFAULT_AUDIO_SETTINGS);
    panel.detach();
    assert.equal(settings.listeners.size, 0);
    assert.equal(controls['[data-audio-gain="bgm"]'].listeners.has("input"), false);
}

function testMixerVoicePolicyAndBindings() {
    const definition = loadMockDefinition();
    const adapter = new FakeRuntimeAdapter();
    const settings = new AudioSettings({ storage: new MemoryStorage() });
    const mixer = new AudioMixer({ adapter, settings });
    let now = 100;
    const manager = new AudioVoiceManager({ adapter, mixer, maxVoices: 2, clock: () => now, random: () => 0 });
    manager.setDefinition(definition, Object.keys(definition.clips));
    const world = {
        listener: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        visibleWorldBounds: { minX: -100, maxX: 100, minY: -100, maxY: 100 }
    };
    assert.equal(manager.play("gameplay-weapon-fire", { ...world, emitterId: "player-1", causalId: "shot:1" }), true);
    assert.equal(manager.play("gameplay-weapon-fire", { ...world, emitterId: "player-1", causalId: "shot:2" }), false);
    now += 50;
    assert.equal(manager.play("gameplay-weapon-fire", { ...world, emitterId: "player-1", causalId: "shot:1" }), false);
    assert.equal(adapter.oneShots[0].clipKey.endsWith(":weapon-fire-a"), true);
    assert.equal(manager.play("gameplay-weapon-fire", { ...world, emitterId: "player-2", causalId: "shot:3" }), true);
    assert.equal(
        adapter.oneShots[1].clipKey.endsWith(":weapon-fire-b"),
        true,
        "variations must avoid immediate repeat"
    );
    now += 50;
    assert.equal(manager.play("gameplay-player-hit", { ...world, emitterId: "player-1", causalId: "hit:1" }), true);
    assert.equal(manager.diagnostics().voiceSteals, 1, "higher-priority audio must steal the oldest low voice");
    assert.equal(
        adapter.groupGains.some(({ group, gain }) => group === "bgm" && gain < dbToLinearGain(-8)),
        true
    );
    manager.stopAll();
    assert.equal(manager.startLoop("bgm-climb", "bgm:main", world), true);
    assert.equal(manager.startLoop("bgm-climb", "bgm:main", { ...world, position: { x: 10, y: 0 } }), true);
    assert.equal(adapter.loops.length, 1, "a lifecycle key must keep one logical loop");
    assert.equal(
        adapter.handles.at(-1).spatialUpdates,
        0,
        "an unchanged non-spatial loop must not schedule audio parameters every fixed step"
    );
    assert.equal(manager.startLoop("bgm-run-complete", "bgm:main", world), true);
    assert.equal(adapter.loops.length, 2);
    assert.equal(adapter.handles.at(-2).stopped, true, "loop replacement must stop the outgoing source");
    assert.equal(manager.diagnostics().activeVoices, 1, "a crossfade remains one logical lifecycle voice");

    const boundedAdapter = new FakeRuntimeAdapter();
    const boundedManager = new AudioVoiceManager({
        adapter: boundedAdapter,
        mixer,
        maxVoices: 1,
        clock: () => now,
        random: () => 0
    });
    boundedManager.setDefinition(definition, Object.keys(definition.clips));
    for (let index = 0; index < 1024; index += 1) {
        assert.equal(boundedManager.play("gameplay-weapon-fire", { ...world, emitterId: `transient-${index}` }), true);
        boundedAdapter.handles.at(-1).stop();
    }
    assert.ok(
        boundedManager.lastTriggerAt.size <= 512,
        "cooldown history must stay bounded when extensible bindings use transient emitter IDs"
    );
    boundedManager.release();

    const calls = [];
    const bindings = new AudioEventBindings({
        play: (cueId, request) => calls.push({ cueId, request }),
        startLoop: (cueId, key, request) => calls.push({ cueId, key, request }),
        stopAll: () => calls.push({ cueId: "stop-all" })
    });
    bindings.handleEvents(
        [
            { eventType: "predicted-spawn", predictionId: "player-1:4", ownerId: "player-1", position: { x: 3, y: 4 } },
            {
                eventType: "predicted-resolve",
                objectId: "enemy-shot-1",
                resolution: "player-hit",
                position: { x: 0, y: 0 }
            }
        ],
        { ...world, localPlayerId: "player-1", tick: 4 }
    );
    assert.deepEqual(
        calls.slice(0, 2).map(({ cueId }) => cueId),
        ["gameplay-weapon-fire", "gameplay-player-hit"]
    );
    assert.equal(calls[0].request.causalId, "weapon-fire:player-1:4");
    bindings.presentFrame({
        events: [
            {
                eventType: "spawn",
                objectId: "projectile-server-1",
                parameters: { predictionId: "player-1:4", ownerId: "player-1" },
                position: { x: 3, y: 4 }
            }
        ],
        context: { ...world, localPlayerId: "player-1", tick: 5 }
    });
    assert.equal(calls.at(-1).request.causalId, "weapon-fire:player-1:4");
    const extensibleBindings = new AudioEventBindings(
        { play: (cueId, request) => calls.push({ cueId, request }) },
        {
            eventHandlers: [
                (event, context) =>
                    event.eventType === "artifact-selected"
                        ? {
                              cueId: "ui-artifact-selected",
                              request: { ...context, causalId: `artifact:${event.eventId}` }
                          }
                        : null
            ]
        }
    );
    extensibleBindings.presentFrame({
        events: [{ eventType: "artifact-selected", eventId: "selection-1" }],
        context: world
    });
    assert.equal(calls.at(-1).cueId, "ui-artifact-selected", "new event bindings must compose without engine branches");
    bindings.syncScene({ ...world, runState: "playing" });
    bindings.syncScene({ ...world, runState: "completed" });
    assert.deepEqual(
        calls.filter(({ key }) => key === "bgm:main").map(({ cueId }) => cueId),
        ["bgm-climb", "bgm-run-complete"]
    );
    bindings.stopScene();
    assert.equal(calls.at(-1).cueId, "stop-all");
    manager.release();
    mixer.release();
}

async function testBrowserAdapterAndHost() {
    const context = new FakeAudioContext();
    const fetched = [];
    const adapter = new BrowserAudioAdapter({
        context,
        AudioElementClass: FakeAudioElement,
        fetcher: async function receiverAwareFetch(url) {
            assert.equal(this, globalThis, "native fetch must keep the browser global receiver");
            fetched.push(url);
            return url.endsWith("missing.wav")
                ? { ok: false, status: 404 }
                : {
                      ok: true,
                      status: 200,
                      async arrayBuffer() {
                          return new ArrayBuffer(8);
                      }
                  };
        },
        timeoutMs: 50
    });
    await adapter.activate();
    const definition = {
        clips: {
            "gameplay/mock:buffer": {
                key: "gameplay/mock:buffer",
                required: true,
                playback: "buffer",
                channels: "mono",
                durationSeconds: 0.25,
                sources: [
                    { path: "missing.wav", mimeType: "audio/wav", url: "https://example.test/missing.wav" },
                    { path: "ready.wav", mimeType: "audio/wav", url: "https://example.test/ready.wav" }
                ]
            },
            "bgm/mock:stream": {
                key: "bgm/mock:stream",
                required: true,
                playback: "stream",
                channels: "stereo",
                durationSeconds: 3,
                loop: { startSeconds: 0, endSeconds: 1 },
                sources: [{ path: "music.wav", mimeType: "audio/wav", url: "https://example.test/music.wav" }]
            }
        }
    };
    const preparation = await adapter.prepare(definition);
    assert.equal(preparation.requiredReady, 2);
    assert.deepEqual(fetched, ["https://example.test/missing.wav", "https://example.test/ready.wav"]);
    const oneShot = adapter.playOneShot({
        clipKey: "gameplay/mock:buffer",
        group: "gameplay",
        gain: 1,
        pitchRatio: 1,
        pan: 0,
        onEnded() {}
    });
    assert.equal(context.bufferSources.at(-1).started, true);
    oneShot.stop(0);
    assert.equal(adapter.activeHandles.size, 0, "manually stopped buffer voices must release immediately");

    const installFailingSource = () => {
        const source = new FakeBufferSource();
        source.start = () => {
            throw new Error("context closed");
        };
        source.stop = () => {
            throw new Error("source never started");
        };
        const createBufferSource = context.createBufferSource.bind(context);
        context.createBufferSource = () => {
            context.createBufferSource = createBufferSource;
            context.bufferSources.push(source);
            return source;
        };
        return source;
    };
    const failedOneShotSource = installFailingSource();
    assert.throws(
        () =>
            adapter.playOneShot({
                clipKey: "gameplay/mock:buffer",
                group: "gameplay",
                gain: 1,
                pitchRatio: 1,
                pan: 0,
                onEnded() {}
            }),
        /context closed/
    );
    assert.equal(adapter.activeHandles.size, 0, "a failed buffer start must not retain an active handle");
    assert.equal(failedOneShotSource.disconnected, true, "a failed buffer start must disconnect its source node");

    const failedLoopSource = installFailingSource();
    assert.throws(
        () =>
            adapter.playLoop({
                clipKey: "gameplay/mock:buffer",
                group: "gameplay",
                gain: 1,
                pan: 0,
                fadeInMs: 0
            }),
        /context closed/
    );
    assert.equal(adapter.activeHandles.size, 0, "a failed buffer loop start must not retain an active handle");
    assert.equal(failedLoopSource.disconnected, true, "a failed buffer loop start must disconnect its source node");
    const stream = adapter.playLoop({
        clipKey: "bgm/mock:stream",
        group: "bgm",
        gain: 0.5,
        pan: 0,
        fadeInMs: 0
    });
    const streamPanner = context.panners.at(-1);
    stream.setSpatial({ gain: 0.5, pan: 0.25 });
    stream.setSpatial({ gain: 0.5, pan: 0.5 });
    assert.equal(
        streamPanner.pan.cancelled,
        2,
        "moving loop pan updates must replace pending automation instead of growing an unbounded timeline"
    );
    await adapter.suspend();
    assert.equal(context.state, "suspended");
    await adapter.resume();
    assert.equal(context.state, "running");
    stream.stop(0);

    const timeoutContext = new FakeAudioContext();
    timeoutContext.decodeAudioData = () => new Promise(() => {});
    const timeoutAdapter = new BrowserAudioAdapter({
        context: timeoutContext,
        AudioElementClass: FakeAudioElement,
        fetcher: async () => ({
            ok: true,
            async arrayBuffer() {
                return new ArrayBuffer(8);
            }
        }),
        timeoutMs: 5
    });
    const timedOutPreparation = await timeoutAdapter.prepare({
        clips: {
            "gameplay/mock:timeout": {
                key: "gameplay/mock:timeout",
                required: true,
                playback: "buffer",
                channels: "mono",
                durationSeconds: 0.25,
                sources: [{ path: "slow.wav", mimeType: "audio/wav", url: "https://example.test/slow.wav" }]
            }
        }
    });
    assert.equal(timedOutPreparation.failures[0].failureCode, "all-sources-failed:timeout");

    const strictAdapter = new FakeRuntimeAdapter();
    strictAdapter.activate = async () => {};
    strictAdapter.prepare = async () => ({
        availableClipKeys: new Set(),
        failures: [{ clipKey: "gameplay/mock:required", required: true, failureCode: "decode-empty" }],
        clips: [],
        requiredReady: 0,
        requiredTotal: 1,
        optionalReady: 0,
        optionalTotal: 0
    });
    const host = new GameAudioHost({
        adapter: strictAdapter,
        settings: new AudioSettings({ storage: new MemoryStorage() })
    });
    await assert.rejects(
        host.prepare({ id: "strict", clips: { required: { required: true } }, cues: {}, packages: {} }),
        /decode-empty/
    );
    assert.equal(host.snapshot().status, "failed");

    const degradedAdapter = new FakeRuntimeAdapter();
    degradedAdapter.activate = async () => {};
    degradedAdapter.prepare = async () => ({
        availableClipKeys: new Set(["gameplay/mock:required"]),
        failures: [{ clipKey: "gameplay/mock:optional", required: false, failureCode: "fetch-failed" }],
        clips: [],
        requiredReady: 1,
        requiredTotal: 1,
        optionalReady: 0,
        optionalTotal: 1
    });
    const degradedHost = new GameAudioHost({
        adapter: degradedAdapter,
        settings: new AudioSettings({ storage: new MemoryStorage() })
    });
    await degradedHost.prepare({
        id: "degraded",
        packages: {},
        clips: { required: { required: true }, optional: { required: false } },
        cues: {
            "required-cue": {
                id: "required-cue",
                required: true,
                variations: [{ clipKey: "gameplay/mock:required" }]
            }
        }
    });
    assert.equal(degradedHost.snapshot().status, "degraded", "only explicit optional failures may degrade");

    const blockedContext = new FakeAudioContext();
    const blockedAdapter = new BrowserAudioAdapter({
        context: blockedContext,
        AudioElementClass: GestureBlockedAudioElement,
        fetcher: async () => ({ ok: false, status: 404 }),
        timeoutMs: 50
    });
    const blockedHost = new GameAudioHost({
        adapter: blockedAdapter,
        settings: new AudioSettings({ storage: new MemoryStorage() })
    });
    const blockedClipKey = "bgm/runtime:blocked";
    await blockedHost.prepare({
        id: "runtime-blocked",
        packages: {},
        clips: {
            [blockedClipKey]: {
                key: blockedClipKey,
                required: true,
                playback: "stream",
                channels: "stereo",
                durationSeconds: 3,
                sources: [{ path: "blocked.wav", mimeType: "audio/wav", url: "https://example.test/blocked.wav" }]
            }
        },
        cues: {
            "bgm-runtime-blocked": {
                id: "bgm-runtime-blocked",
                group: "bgm",
                kind: "loop",
                required: true,
                variations: [{ clipKey: blockedClipKey, weight: 1 }],
                spatial: "none",
                gainDb: 0,
                priority: 50,
                transitionMs: 0
            }
        }
    });
    assert.equal(blockedHost.startLoop("bgm-runtime-blocked", "bgm:runtime", {}), true);
    await Promise.resolve();
    await Promise.resolve();
    const blockedSnapshot = blockedHost.snapshot();
    assert.equal(blockedSnapshot.status, "suspended", "gesture-blocked playback must request a resumable state");
    assert.equal(blockedSnapshot.runtimeFailures.length, 1);
    assert.equal(blockedSnapshot.failures.at(-1).failureCode, "notallowederror");
    assert.equal(blockedSnapshot.voices.activeVoices, 0, "a rejected media play promise must release its voice");

    const fatalAdapter = new FakeRuntimeAdapter();
    fatalAdapter.activate = async () => {};
    fatalAdapter.prepare = async () => ({
        availableClipKeys: new Set([blockedClipKey]),
        failures: [],
        clips: [],
        requiredReady: 1,
        requiredTotal: 1,
        optionalReady: 0,
        optionalTotal: 0
    });
    const fatalHost = new GameAudioHost({
        adapter: fatalAdapter,
        settings: new AudioSettings({ storage: new MemoryStorage() })
    });
    await fatalHost.prepare({
        id: "runtime-fatal",
        packages: {},
        clips: { [blockedClipKey]: { key: blockedClipKey, required: true } },
        cues: {}
    });
    fatalAdapter.reportRuntimeFailure({
        clipKey: blockedClipKey,
        cueId: "bgm-runtime-fatal",
        required: true,
        failureCode: "notsupportederror"
    });
    assert.equal(fatalHost.snapshot().status, "failed", "non-recoverable required playback failures must be visible");
    assert.equal(fatalHost.snapshot().failures.length, 1);
    adapter.release();
    timeoutAdapter.release();
    host.release();
    degradedHost.release();
    blockedHost.release();
    fatalHost.release();
}

async function testStaticAudioDelivery() {
    const server = createServer(createStaticRequestHandler("."));
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    try {
        const { port } = server.address();
        const response = await fetch(`http://127.0.0.1:${port}/assets/runtime/audio/bgm/default-mock/climb.wav`, {
            headers: { range: "bytes=0-43" }
        });
        assert.equal(response.status, 206);
        assert.equal(response.headers.get("content-type"), "audio/wav");
        assert.equal(response.headers.get("content-range"), "bytes 0-43/576044");
        assert.equal((await response.arrayBuffer()).byteLength, 44);
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
}

async function testBrowserLifecycle() {
    const listeners = new Map();
    const documentTarget = {
        hidden: false,
        addEventListener(type, listener) {
            listeners.set(`document:${type}`, listener);
        },
        removeEventListener(type) {
            listeners.delete(`document:${type}`);
        }
    };
    const windowTarget = {
        addEventListener(type, listener) {
            listeners.set(`window:${type}`, listener);
        },
        removeEventListener(type) {
            listeners.delete(`window:${type}`);
        }
    };
    let suspended = 0;
    let resumeAttempts = 0;
    let resynced = 0;
    const required = [];
    const host = {
        status: "suspended",
        suspend: () => suspended++,
        async resume() {
            resumeAttempts += 1;
            if (resumeAttempts > 2) this.status = "ready";
            return resumeAttempts > 2;
        }
    };
    const lifecycle = new BrowserAudioLifecycle({
        host,
        bindings: { resync: () => resynced++ },
        windowTarget,
        documentTarget,
        onResumeRequired: (value) => required.push(value)
    });
    lifecycle.attach();
    await listeners.get("window:pointerdown")();
    assert.equal(resumeAttempts, 1, "a runtime playback block must retry on the next user activation");
    documentTarget.hidden = true;
    await listeners.get("document:visibilitychange")();
    assert.equal(suspended, 1);
    documentTarget.hidden = false;
    await listeners.get("document:visibilitychange")();
    assert.deepEqual(required, [true, true]);
    await listeners.get("window:pointerdown")();
    assert.deepEqual(required, [true, true, false]);
    assert.equal(resynced, 1);
    assert.equal(listeners.has("window:blur"), false, "blur must not suspend audio");
    lifecycle.release();
    assert.equal(listeners.size, 0);
}

export async function run() {
    await testManifestAndValidator();
    testSettingsAndSpatialAudio();
    testSettingsUiExtensionBoundary();
    testMixerVoicePolicyAndBindings();
    await testBrowserAdapterAndHost();
    await testBrowserLifecycle();
    await testStaticAudioDelivery();
}
