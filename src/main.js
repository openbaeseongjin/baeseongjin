import { GameApp } from "./game/GameApp.js";
import { MultiplayerGameApp } from "./game/MultiplayerGameApp.js";
import { RemoteGameAuthority } from "./game/runtime/RemoteGameAuthority.js";
import { channelSocketUrl, configuredMultiplayerServer } from "./game/runtime/MultiplayerServerEndpoint.js";
import { GameModeMenu } from "./game/ui/GameModeMenu.js";
import { setupInstallPrompt } from "./pwa/InstallPrompt.js";
import { setupServiceWorkerUpdater } from "./pwa/ServiceWorkerUpdater.js";

const canvas = document.getElementById("game-canvas");
if (!canvas) {
    throw new Error("Bootstrap failed: canvas #game-canvas not found");
}

let app = null;
let launching = false;
let pageClosing = false;
const modeMenu = new GameModeMenu(document.getElementById("game-mode-menu"));
const channelBadge = document.getElementById("channel-badge");
const releaseInstallPrompt = setupInstallPrompt({
    window: globalThis.window,
    navigator: globalThis.navigator,
    root: document.getElementById("install-prompt")
});
const releaseServiceWorkerUpdater = setupServiceWorkerUpdater({
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
                app = new GameApp({ canvas });
            } else {
                const serverUrl = configuredMultiplayerServer();
                if (!serverUrl) throw new Error("고정 멀티 서버 주소가 아직 설정되지 않았습니다.");
                authority = new RemoteGameAuthority({ url: channelSocketUrl(serverUrl, choice.channelId) });
                await authority.connect();
                app = new MultiplayerGameApp({ canvas, authority, onDisconnect: returnToMenu });
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

launch();
globalThis.addEventListener(
    "pagehide",
    () => {
        pageClosing = true;
        releaseInstallPrompt();
        releaseServiceWorkerUpdater();
        app?.stop();
    },
    { once: true }
);
