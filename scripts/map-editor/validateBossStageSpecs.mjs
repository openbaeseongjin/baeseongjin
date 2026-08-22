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

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const sourcePath = resolve(projectRoot, "src/game/boss-authoring/specs/boss-01.json");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const validation = validateBossStageSpec(source, { file: "src/game/boss-authoring/specs/boss-01.json" });

if (!validation.valid) {
    for (const issue of validation.issues) console.error(`[BOSS-STAGE] ${issue.file}: ${issue.code}`);
    process.exitCode = 1;
} else if (
    JSON.stringify(canonicalizeBossStageSpec(source)) !== JSON.stringify(canonicalizeBossStageSpec(BOSS_01_STAGE_SPEC))
) {
    console.error("[BOSS-STAGE] generated Boss01 definition is stale.");
    process.exitCode = 1;
} else {
    const preview = bossStageDerivedPreview(source);
    const summary = preview.participants
        .map(
            ({ participantCount, totalHealth, phases }) =>
                `${participantCount}p=${totalHealth}[${phases.map(({ maxHealth, healthFloor, weakFixedDamage }) => `${maxHealth}/${healthFloor}/${weakFixedDamage}`).join(",")}]`
        )
        .join(" ");
    let invalidCountRejected = false;
    try {
        scaledBossPhaseHealth({ base: 120, additionalPlayerMultiplier: source.combat.additionalPlayerMultiplier }, 5);
    } catch (cause) {
        invalidCountRejected = cause instanceof RangeError;
    }
    if (!invalidCountRejected) {
        console.error("[BOSS-STAGE] participant counts outside 1..4 must be rejected.");
        process.exitCode = 1;
    } else {
        console.log(`[BOSS-STAGE] PASS boss-01 ${summary}`);
    }
}
