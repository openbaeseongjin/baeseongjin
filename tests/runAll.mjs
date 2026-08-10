import { run as fixedStep } from "./fixedStepRunner.mjs";
import { run as inputSampler } from "./inputSampler.mjs";
import { run as vector2 } from "./vector2.mjs";
import { run as gameKitBoundary } from "./gameKitBoundary.mjs";
import { run as fixedLengthRope } from "./fixedLengthRope.mjs";
import { run as worldGenerator } from "./worldGenerator.mjs";
import { run as playerPhysics } from "./playerPhysics.mjs";
import { run as versionContract } from "./versionContract.mjs";
import { run as swingDrag } from "./swingDrag.mjs";

const suites = {
    fixedStep,
    inputSampler,
    vector2,
    gameKitBoundary,
    fixedLengthRope,
    worldGenerator,
    playerPhysics,
    versionContract,
    swingDrag
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
