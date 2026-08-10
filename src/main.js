import { GameApp } from "./game/GameApp.js";
import { setupInstallPrompt } from "./pwa/InstallPrompt.js";

const canvas = document.getElementById("game-canvas");
if (!canvas) {
    throw new Error("Bootstrap failed: canvas #game-canvas not found");
}

const app = new GameApp({ canvas });
const releaseInstallPrompt = setupInstallPrompt({
    window: globalThis.window,
    navigator: globalThis.navigator,
    root: document.getElementById("install-prompt")
});
app.start();
globalThis.addEventListener(
    "pagehide",
    () => {
        releaseInstallPrompt();
        app.stop();
    },
    { once: true }
);

if ("serviceWorker" in navigator) {
    globalThis.addEventListener("load", () => navigator.serviceWorker.register(new URL("../sw.js", import.meta.url)));
}
