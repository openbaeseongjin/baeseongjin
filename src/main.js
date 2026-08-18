import { GameApp } from "./game/GameApp.js";
import { MultiplayerGameApp } from "./game/MultiplayerGameApp.js";
import { RemoteGameAuthority } from "./game/runtime/RemoteGameAuthority.js";
import { restartSingleGameForDebugSettings } from "./game/runtime/SingleGameDebugRestart.js";
import { channelSocketUrl, configuredMultiplayerServer } from "./game/runtime/MultiplayerServerEndpoint.js";
import { GameModeMenu } from "./game/ui/GameModeMenu.js";
import { setupInstallPrompt } from "./pwa/InstallPrompt.js";
import { setupServiceWorkerUpdater } from "./pwa/ServiceWorkerUpdater.js";
import { StartupUpdateLoadingScreen } from "./pwa/StartupUpdateLoadingScreen.js";
import { setupPlaytestDiagnostics } from "./game/metrics/PlaytestDiagnostics.js";
import { createGameRenderer, resolveRendererProfile } from "./render/GameRendererFactory.js";
import { AudioSettings } from "./audio/AudioSettings.js";
import { createAudioDefinitionLoader } from "./audio/AudioCatalog.js";
import { BrowserAudioAdapter } from "./audio/BrowserAudioAdapter.js";
import { GameAudioHost } from "./audio/GameAudioHost.js";
import { AudioEventBindings } from "./audio/AudioEventBindings.js";
import { BrowserAudioLifecycle } from "./audio/BrowserAudioLifecycle.js";
import { SettingsMenu } from "./game/ui/SettingsMenu.js";
import { AudioSettingsPanel } from "./game/ui/AudioSettingsPanel.js";
import { DebugSettings } from "./game/metrics/DebugSettings.js";
import { DebugPanel } from "./game/ui/DebugPanel.js";
import { CURRENT_AUTHORED_AREA_CATALOG } from "./game/world/areas/CurrentAuthoredAreaCatalog.js";
import { loadDefaultPlayerSpriteDefinition } from "./render/sprites/PlayerSpriteCatalog.js";
import { loadAuthoredAreaEnvironmentDefinitions } from "./render/environment/AuthoredAreaEnvironmentCatalog.js";

const canvas = document.getElementById("game-canvas");
if (!canvas) {
    throw new Error("Bootstrap failed: canvas #game-canvas not found");
}
const rendererProfile = resolveRendererProfile(globalThis.location.search);
let playerDefinition = null;
let authoredAreaEnvironmentDefinitions = Object.freeze({});

let app = null;
let launching = false;
let pageClosing = false;
let audioHost = null;
let audioBindings = null;
let audioLifecycle = null;
let audioLifecycleAttached = false;
const DEFAULT_GAME_AUDIO_SELECTION = Object.freeze({ packId: "default-mock", packageOverrides: Object.freeze({}) });
const modeMenu = new GameModeMenu(document.getElementById("game-mode-menu"));
const startupLoadingScreen = new StartupUpdateLoadingScreen(document.getElementById("startup-update-loading"));
const channelBadge = document.getElementById("channel-badge");
const audioResumeNotice = document.getElementById("audio-resume-notice");
let activeChannelId = null;
let audioStorage = null;
try {
    audioStorage = globalThis.localStorage;
} catch {
    // Browser privacy modes may deny storage; in-memory defaults remain valid.
}
const audioSettings = new AudioSettings({ storage: audioStorage });
const settingsMenu = new SettingsMenu({
    root: document.getElementById("settings-dialog"),
    trigger: document.getElementById("settings-trigger")
});
const debugAreaIds = CURRENT_AUTHORED_AREA_CATALOG.areas.map(({ id }) => id);
const debugSettings = new DebugSettings({ storage: audioStorage, validAreaIds: debugAreaIds });
let debugTabRegistered = false;
const debugPanel = new DebugPanel({
    trigger: document.getElementById("settings-trigger"),
    settings: debugSettings,
    areaIds: debugAreaIds,
    onActivate: () => {
        if (!debugTabRegistered) {
            settingsMenu.registerTab({
                id: "debug",
                label: "디버그",
                panel: document.getElementById("settings-panel-debug")
            });
            debugTabRegistered = true;
        }
        settingsMenu.show();
        settingsMenu.activate("debug", { focus: true });
    }
});
debugPanel.onApply = () => {
    const debug = debugSettings.snapshot();
    if (app instanceof GameApp) {
        app = restartSingleGameForDebugSettings({
            currentApp: app,
            debugSettings: debug,
            createApp: createSingleGameApp,
            beforeRestart: () => audioBindings?.stopScene()
        });
        settingsMenu.hide();
        return;
    }
    app?.applyDebugSettings(debug);
};
const audioSettingsPanel = new AudioSettingsPanel({
    root: document.getElementById("settings-panel-audio"),
    settings: audioSettings
});
settingsMenu.attach();
settingsMenu.registerTab({
    id: "audio",
    label: "오디오",
    panel: document.getElementById("settings-panel-audio")
});
audioSettingsPanel.attach();
debugPanel.attach();
const loadSelectedAudioDefinition = createAudioDefinitionLoader(DEFAULT_GAME_AUDIO_SELECTION);
const diagnosticsOptions = {
    root: document.getElementById("copy-diagnostics"),
    navigator: globalThis.navigator,
    context: () => ({
        version: document.getElementById("app-version").dataset.version,
        url: globalThis.location.href,
        channelId: activeChannelId
    })
};
let diagnosticsEnabled = debugSettings.snapshot().metrics;
let diagnostics = setupPlaytestDiagnostics({ ...diagnosticsOptions, enabled: diagnosticsEnabled });
debugSettings.subscribe((value) => {
    if (value.metrics === diagnosticsEnabled) return;
    diagnosticsEnabled = value.metrics;
    diagnostics.release();
    diagnostics = setupPlaytestDiagnostics({ ...diagnosticsOptions, enabled: diagnosticsEnabled });
});
const releaseInstallPrompt = setupInstallPrompt({
    window: globalThis.window,
    navigator: globalThis.navigator,
    root: document.getElementById("install-prompt")
});
const serviceWorkerUpdater = setupServiceWorkerUpdater({
    window: globalThis.window,
    navigator: globalThis.navigator,
    scriptUrl: new URL("../sw.js", import.meta.url)
});

function updateDiagnostics(snapshot) {
    diagnostics.update({ ...snapshot, audioDiagnostics: audioHost?.snapshot() ?? null });
}

function createSingleGameApp(debug) {
    return new GameApp({
        canvas,
        renderer: createGameRenderer({
            canvas,
            profile: rendererProfile,
            sceneRendererOptions: { playerDefinition, authoredAreaEnvironmentDefinitions }
        }),
        audioBindings,
        playerDefinition,
        onDiagnostics: updateDiagnostics,
        startAreaId: debug.startAreaId ?? undefined,
        metricsVisible: debug.metrics,
        ropeTuning: debug.ropeTuning,
        debugAugmentIds: debug.debugAugmentIds
    });
}

async function prepareGameAudio() {
    if (audioHost?.status === "ready" || audioHost?.status === "degraded") return audioHost.snapshot();
    if (audioHost?.status === "suspended" && (await audioHost.resume())) return audioHost.snapshot();
    if (!audioHost) {
        const adapter = new BrowserAudioAdapter();
        await adapter.activate();
        audioHost = new GameAudioHost({
            adapter,
            settings: audioSettings,
            onStatus: ({ status, detail }) => {
                if (status === "loading") {
                    const progress = detail.total ? ` (${detail.completed}/${detail.total})` : "";
                    modeMenu.setStatus(`오디오를 준비하는 중입니다${progress}`);
                }
                audioResumeNotice.hidden = status !== "suspended" || globalThis.document.hidden;
                audioSettingsPanel.setRuntimeStatus(status, audioHost?.snapshot());
            }
        });
        audioBindings = new AudioEventBindings(audioHost);
        audioLifecycle = new BrowserAudioLifecycle({
            host: audioHost,
            bindings: audioBindings,
            windowTarget: globalThis.window,
            documentTarget: globalThis.document,
            onResumeRequired: (required) => (audioResumeNotice.hidden = !required)
        });
    }
    const definition = await loadSelectedAudioDefinition();
    await audioHost.prepare(definition);
    if (!audioLifecycleAttached) {
        audioLifecycle.attach();
        audioLifecycleAttached = true;
    }
    if (globalThis.document.hidden) audioHost.suspend();
    return audioHost.snapshot();
}

async function launch() {
    if (launching || app || pageClosing) return;
    launching = true;
    while (!app && !pageClosing) {
        const choice = await modeMenu.choose();
        modeMenu.setBusy(true, choice.mode);
        let authority = null;
        try {
            await prepareGameAudio();
            audioBindings.uiConfirm();
            if (choice.mode === "single") {
                activeChannelId = null;
                debugPanel.setRopeTuningEnabled(true);
                const debug = debugSettings.snapshot();
                app = createSingleGameApp(debug);
            } else {
                debugPanel.setRopeTuningEnabled(false);
                const serverUrl = configuredMultiplayerServer();
                if (!serverUrl) throw new Error("고정 멀티 서버 주소가 아직 설정되지 않았습니다.");
                authority = new RemoteGameAuthority({ url: channelSocketUrl(serverUrl, choice.channelId) });
                await authority.connect();
                activeChannelId = authority.channelId;
                const debug = debugSettings.snapshot();
                app = new MultiplayerGameApp({
                    canvas,
                    renderer: createGameRenderer({
                        canvas,
                        profile: rendererProfile,
                        sceneRendererOptions: { playerDefinition, authoredAreaEnvironmentDefinitions }
                    }),
                    authority,
                    audioBindings,
                    playerDefinition,
                    onDisconnect: returnToMenu,
                    onDiagnostics: updateDiagnostics,
                    metricsVisible: debug.metrics
                });
                channelBadge.textContent = `채널 ${authority.channelId}`;
                channelBadge.hidden = false;
            }
            modeMenu.hide();
            app.start();
        } catch (error) {
            authority?.close();
            debugPanel.setRopeTuningEnabled(true);
            modeMenu.setStatus(error.message, true);
            modeMenu.setBusy(false);
        }
    }
    launching = false;
}

function returnToMenu(message) {
    if (pageClosing) return;
    const stoppedApp = app;
    app = null;
    modeMenu.rememberChannel(stoppedApp?.authority?.channelId);
    stoppedApp?.stop();
    debugPanel.setRopeTuningEnabled(true);
    audioBindings?.stopScene();
    channelBadge.hidden = true;
    modeMenu.setStatus(message, true);
    launch();
}

async function bootstrap() {
    startupLoadingScreen.show();
    await serviceWorkerUpdater.ready;
    if (pageClosing) return;
    [playerDefinition, authoredAreaEnvironmentDefinitions] = await Promise.all([
        loadDefaultPlayerSpriteDefinition(),
        loadAuthoredAreaEnvironmentDefinitions()
    ]);
    if (pageClosing) return;
    startupLoadingScreen.hide();
    launch();
}

bootstrap();
globalThis.addEventListener(
    "pagehide",
    () => {
        pageClosing = true;
        releaseInstallPrompt();
        serviceWorkerUpdater.release();
        diagnostics.release();
        if (audioLifecycleAttached) audioLifecycle.release();
        audioBindings?.stopScene();
        audioHost?.suspend();
        audioSettingsPanel.detach();
        settingsMenu.detach();
        debugPanel.detach();
        app?.stop();
    },
    { once: true }
);
