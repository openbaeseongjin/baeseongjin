import { GameApp } from "./game/GameApp.js";
import { MultiplayerGameApp } from "./game/MultiplayerGameApp.js";
import { RemoteGameAuthority } from "./game/runtime/RemoteGameAuthority.js";
import { GameModeMenu } from "./game/ui/GameModeMenu.js";
import { setupInstallPrompt } from "./pwa/InstallPrompt.js";
import { setupServiceWorkerUpdater } from "./pwa/ServiceWorkerUpdater.js";

const canvas = document.getElementById("game-canvas");
if (!canvas) {
    throw new Error("Bootstrap failed: canvas #game-canvas not found");
}

let app = null;
const modeMenu = new GameModeMenu(document.getElementById("game-mode-menu"));
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
    while (!app) {
        const mode = await modeMenu.choose();
        modeMenu.setBusy(true, mode);
        try {
            if (mode === "single") {
                app = new GameApp({ canvas });
            } else {
                const authority = new RemoteGameAuthority();
                await authority.connect();
                app = new MultiplayerGameApp({ canvas, authority });
            }
            modeMenu.hide();
            app.start();
        } catch (error) {
            modeMenu.setStatus(error.message, true);
            modeMenu.setBusy(false);
        }
    }
}

launch();
globalThis.addEventListener(
    "pagehide",
    () => {
        releaseInstallPrompt();
        releaseServiceWorkerUpdater();
        app?.stop();
    },
    { once: true }
);
