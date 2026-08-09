import { run as fixedStep } from "./fixedStepRunner.mjs";
import { run as inputSampler } from "./inputSampler.mjs";
import { run as vector2 } from "./vector2.mjs";
import { run as gameKitBoundary } from "./gameKitBoundary.mjs";

const suites = { fixedStep, inputSampler, vector2, gameKitBoundary };
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
