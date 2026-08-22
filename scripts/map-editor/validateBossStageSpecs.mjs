import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
    bossStageDerivedPreview,
    canonicalizeBossStageSpec,
    scaledBossPhaseHealth
} from "../../src/game/boss-authoring/BossStageSpec.js";
import { validateBossStageSpec } from "../../src/game/boss-authoring/BossStageSpecValidator.js";
import { BOSS_01_STAGE_SPEC } from "../../src/game/boss-authoring/generated/Boss01Stage.generated.js";
import { BOSS_02_STAGE_SPEC } from "../../src/game/boss-authoring/generated/Boss02Stage.generated.js";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const definitions = Object.freeze([
    Object.freeze({ id: "boss-01", generated: BOSS_01_STAGE_SPEC }),
    Object.freeze({ id: "boss-02", generated: BOSS_02_STAGE_SPEC })
]);

for (const definition of definitions) {
    const relativePath = `src/game/boss-authoring/specs/${definition.id}.json`;
    const source = JSON.parse(await readFile(resolve(projectRoot, relativePath), "utf8"));
    const validation = validateBossStageSpec(source, { file: relativePath });
    if (!validation.valid) {
        for (const issue of validation.issues) console.error(`[BOSS-STAGE] ${issue.file}: ${issue.code}`);
        process.exitCode = 1;
        continue;
    }
    if (
        JSON.stringify(canonicalizeBossStageSpec(source)) !==
        JSON.stringify(canonicalizeBossStageSpec(definition.generated))
    ) {
        console.error(`[BOSS-STAGE] generated ${definition.id} definition is stale.`);
        process.exitCode = 1;
        continue;
    }
    const preview = bossStageDerivedPreview(source);
    const summary = preview.participants
        .map(
            ({ participantCount, totalHealth, phases }) =>
                `${participantCount}p=${totalHealth}[${phases.map(({ maxHealth, healthFloor, weakFixedDamage }) => `${maxHealth}/${healthFloor}/${weakFixedDamage}`).join(",")}]`
        )
        .join(" ");
    console.log(`[BOSS-STAGE] PASS ${definition.id} ${summary}`);
}

let invalidCountRejected = false;
try {
    scaledBossPhaseHealth({ base: 1000, additionalPlayerMultiplier: 0.5 }, 5);
} catch (cause) {
    invalidCountRejected = cause instanceof RangeError;
}
if (!invalidCountRejected) {
    console.error("[BOSS-STAGE] participant counts outside 1..4 must be rejected.");
    process.exitCode = 1;
}
