import { run as mobileControlLayout } from "./mobileControlLayout.mjs";
import { run as pwaContract } from "./pwaContract.mjs";
import { run as installPrompt } from "./installPrompt.mjs";
import { run as serviceWorkerUpdater } from "./serviceWorkerUpdater.mjs";
import { run as startupUpdateLoadingScreen } from "./startupUpdateLoadingScreen.mjs";
import { run as gameModeMenu } from "./gameModeMenu.mjs";
import { run as playtestDiagnostics } from "./playtestDiagnostics.mjs";

const steps = {
    mobileControlLayout,
    pwaContract,
    installPrompt,
    serviceWorkerUpdater,
    startupUpdateLoadingScreen,
    gameModeMenu,
    playtestDiagnostics
};

export async function run() {
    for (const [name, step] of Object.entries(steps)) {
        try {
            await step();
        } catch (error) {
            error.message = `client-delivery/${name}: ${error.message}`;
            throw error;
        }
    }
}
