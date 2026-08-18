export function restartSingleGameForDebugSettings({ currentApp, debugSettings, createApp, beforeRestart = () => {} }) {
    if (!currentApp || typeof currentApp.stop !== "function") {
        throw new Error("single debug restart requires the current app");
    }
    if (typeof createApp !== "function") throw new Error("single debug restart requires createApp");
    if (typeof beforeRestart !== "function") throw new Error("beforeRestart must be a function");
    currentApp.stop();
    beforeRestart();
    const nextApp = createApp(debugSettings);
    if (!nextApp || typeof nextApp.start !== "function") {
        throw new Error("single debug restart createApp must return a startable app");
    }
    nextApp.start();
    return nextApp;
}
