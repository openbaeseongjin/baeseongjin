import { run as fixedStep } from "./fixedStepRunner.mjs";
import { run as inputSampler } from "./inputSampler.mjs";
import { run as mobileControlLayout } from "./mobileControlLayout.mjs";
import { run as vector2 } from "./vector2.mjs";
import { run as gameKitBoundary } from "./gameKitBoundary.mjs";
import { run as fixedLengthRope } from "./fixedLengthRope.mjs";
import { run as worldGenerator } from "./worldGenerator.mjs";
import { run as playerPhysics } from "./playerPhysics.mjs";
import { run as versionContract } from "./versionContract.mjs";
import { run as swingDrag } from "./swingDrag.mjs";
import { run as gameSimulation } from "./gameSimulation.mjs";
import { run as combatSystems } from "./combatSystems.mjs";
import { run as combatFeedback } from "./combatFeedback.mjs";
import { run as playerLifeCycle } from "./playerLifeCycle.mjs";
import { run as pwaContract } from "./pwaContract.mjs";
import { run as installPrompt } from "./installPrompt.mjs";
import { run as serviceWorkerUpdater } from "./serviceWorkerUpdater.mjs";
import { run as canvasRenderer } from "./canvasRenderer.mjs";
import { run as artifactInventory } from "./artifactInventory.mjs";
import { run as artifactCatalog } from "./artifactCatalog.mjs";
import { run as worldTraversalValidator } from "./worldTraversalValidator.mjs";
import { run as runMetrics } from "./runMetrics.mjs";
import { run as metricsDebugMode } from "./metricsDebugMode.mjs";
import { run as commandReplay } from "./commandReplay.mjs";

const suites = {
    fixedStep,
    inputSampler,
    mobileControlLayout,
    vector2,
    gameKitBoundary,
    fixedLengthRope,
    worldGenerator,
    playerPhysics,
    versionContract,
    swingDrag,
    gameSimulation,
    combatSystems,
    combatFeedback,
    playerLifeCycle,
    pwaContract,
    installPrompt,
    serviceWorkerUpdater,
    canvasRenderer,
    artifactInventory,
    artifactCatalog,
    worldTraversalValidator,
    runMetrics,
    metricsDebugMode,
    commandReplay
};
let failures = 0;
for (const [name, run] of Object.entries(suites)) {
    try {
        await run();
        console.log(`PASS ${name}`);
    } catch (error) {
        failures += 1;
        console.error(`FAIL ${name}`);
        console.error(error);
    }
}
if (failures > 0) process.exitCode = 1;
else console.log(`All ${Object.keys(suites).length} suites passed.`);
