import { run as gameplay } from "./gameplayScenario.mjs";
import { run as multiplayer } from "./multiplayerScenario.mjs";
import { run as clientDelivery } from "./clientDeliveryScenario.mjs";

const scenarios = { gameplay, multiplayer, clientDelivery };
const startedAt = performance.now();
let failures = 0;

for (const [name, run] of Object.entries(scenarios)) {
    const scenarioStartedAt = performance.now();
    try {
        await run();
        console.log(`PASS ${name} (${Math.round(performance.now() - scenarioStartedAt)}ms)`);
    } catch (error) {
        failures += 1;
        console.error(`FAIL ${name}`);
        console.error(error);
    }
}

const elapsedSeconds = (performance.now() - startedAt) / 1000;
if (elapsedSeconds > 180) {
    failures += 1;
    console.error(`FAIL time-budget (${elapsedSeconds.toFixed(1)}s > 180s)`);
}

if (failures > 0) process.exitCode = 1;
else console.log(`All ${Object.keys(scenarios).length} scenarios passed in ${elapsedSeconds.toFixed(1)}s.`);
