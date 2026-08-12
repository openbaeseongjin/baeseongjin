import { GameApp } from "./game/GameApp.js";
import { MultiplayerGameApp } from "./game/MultiplayerGameApp.js";
import { RemoteGameAuthority } from "./game/runtime/RemoteGameAuthority.js";
import { channelSocketUrl, configuredMultiplayerServer } from "./game/runtime/MultiplayerServerEndpoint.js";
import { GameModeMenu } from "./game/ui/GameModeMenu.js";
import { setupInstallPrompt } from "./pwa/InstallPrompt.js";
import { setupServiceWorkerUpdater } from "./pwa/ServiceWorkerUpdater.js";
import { StartupUpdateLoadingScreen } from "./pwa/StartupUpdateLoadingScreen.js";
import { isMetricsPanelEnabled } from "./game/metrics/MetricsDebugMode.js";
import { setupPlaytestDiagnostics } from "./game/metrics/PlaytestDiagnostics.js";
import { createGameRenderer, resolveRendererProfile } from "./render/GameRendererFactory.js";

const canvas = document.getElementById("game-canvas");
if (!canvas) {
    throw new Error("Bootstrap failed: canvas #game-canvas not found");
}
const rendererProfile = resolveRendererProfile(globalThis.location.search);

let app = null;
let launching = false;
let pageClosing = false;
const modeMenu = new GameModeMenu(document.getElementById("game-mode-menu"));
const startupLoadingScreen = new StartupUpdateLoadingScreen(document.getElementById("startup-update-loading"));
const channelBadge = document.getElementById("channel-badge");
let activeChannelId = null;
const diagnostics = setupPlaytestDiagnostics({
    root: document.getElementById("copy-diagnostics"),
    navigator: globalThis.navigator,
    enabled: isMetricsPanelEnabled(globalThis.location?.search),
    context: () => ({
        version: document.getElementById("app-version").dataset.version,
        url: globalThis.location.href,
        channelId: activeChannelId
    })
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
async function launch() {
    if (launching || app || pageClosing) return;
    launching = true;
    while (!app && !pageClosing) {
        const choice = await modeMenu.choose();
        modeMenu.setBusy(true, choice.mode);
        let authority = null;
        try {
            if (choice.mode === "single") {
                activeChannelId = null;
                app = new GameApp({
                    canvas,
                    renderer: createGameRenderer({ canvas, profile: rendererProfile }),
                    onDiagnostics: (snapshot) => diagnostics.update(snapshot)
                });
            } else {
                const serverUrl = configuredMultiplayerServer();
                if (!serverUrl) throw new Error("고정 멀티 서버 주소가 아직 설정되지 않았습니다.");
                authority = new RemoteGameAuthority({ url: channelSocketUrl(serverUrl, choice.channelId) });
                await authority.connect();
                activeChannelId = authority.channelId;
                app = new MultiplayerGameApp({
                    canvas,
                    renderer: createGameRenderer({ canvas, profile: rendererProfile }),
                    authority,
                    onDisconnect: returnToMenu,
                    onDiagnostics: (snapshot) => diagnostics.update(snapshot)
                });
                channelBadge.textContent = `채널 ${authority.channelId}`;
                channelBadge.hidden = false;
            }
            modeMenu.hide();
            app.start();
        } catch (error) {
            authority?.close();
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
    channelBadge.hidden = true;
    modeMenu.setStatus(message, true);
    launch();
}

async function bootstrap() {
    startupLoadingScreen.show();
    await serviceWorkerUpdater.ready;
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
        app?.stop();
    },
    { once: true }
);
