import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
    bossStageDerivedPreview,
    canonicalizeBossStageSpec,
    scaledBossPhaseHealth
} from "../../src/game/boss-authoring/BossStageSpec.js";
import { validateBossStageSpec } from "../../src/game/boss-authoring/BossStageSpecValidator.js";
import { BOSS_06_STAGE_SPEC } from "../../src/game/boss-authoring/generated/Boss06Stage.generated.js";
import { defineBossStage } from "../../src/game/boss/BossStageDefinition.js";
import { createBossEncounterRuntime } from "../../src/game/boss/BossEncounterRuntimeFactory.js";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const definitions = Object.freeze([Object.freeze({ id: "boss-06", generated: BOSS_06_STAGE_SPEC })]);
const EXPECTED_ROPEABLE_ACTOR_IDS = Object.freeze({
    "boss-06": Object.freeze([])
});
const EXPECTED_ROPE_PRESENTATION_IDS = Object.freeze({
    "boss-06": Object.freeze([])
});

function sortedIds(values) {
    return [...values].sort((left, right) => left.localeCompare(right, "en"));
}

function sameIds(actual, expected) {
    return JSON.stringify(sortedIds(actual)) === JSON.stringify(sortedIds(expected));
}

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
    const runtime = createBossEncounterRuntime(defineBossStage(source));
    const collisionActors =
        runtime.collisionActors?.({ x: 0, y: 0 }) ?? runtime.mechanism?.collisionActors?.({ x: 0, y: 0 }) ?? [];
    const ropeableActorIds = collisionActors.filter(({ ropeableSurface }) => ropeableSurface).map(({ id }) => id);
    if (!sameIds(ropeableActorIds, EXPECTED_ROPEABLE_ACTOR_IDS[definition.id])) {
        console.error(`[BOSS-STAGE] ${definition.id} ropeable actor mismatch: ${JSON.stringify(ropeableActorIds)}`);
        process.exitCode = 1;
        continue;
    }
    const expectedPresentationIds = EXPECTED_ROPE_PRESENTATION_IDS[definition.id];
    if (expectedPresentationIds) {
        const objects = runtime.presentationObjects?.({ x: 0, y: 0 }, runtime.snapshot()) ?? [];
        const presentationIds = objects.filter(({ ropeAttachable }) => ropeAttachable === true).map(({ id }) => id);
        if (!sameIds(presentationIds, expectedPresentationIds)) {
            console.error(
                `[BOSS-STAGE] ${definition.id} Rope presentation mismatch: ${JSON.stringify(presentationIds)}`
            );
            process.exitCode = 1;
            continue;
        }
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
