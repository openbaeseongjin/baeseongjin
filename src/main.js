import { GameApp } from "./game/GameApp.js";

const canvas = document.getElementById("game-canvas");
if (!canvas) {
    throw new Error("Bootstrap failed: canvas #game-canvas not found");
}

const app = new GameApp({ canvas });
app.start();
globalThis.addEventListener("pagehide", () => app.stop(), { once: true });

if ("serviceWorker" in navigator) {
    globalThis.addEventListener("load", () => navigator.serviceWorker.register(new URL("../sw.js", import.meta.url)));
}
