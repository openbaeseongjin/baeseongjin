import { BOSS_01_STAGE_SPEC } from "./generated/Boss01Stage.generated.js";
import { BOSS_02_STAGE_SPEC } from "./generated/Boss02Stage.generated.js";
import { BOSS_04_STAGE_SPEC } from "./generated/Boss04Stage.generated.js";
import { BOSS_05_STAGE_SPEC } from "./generated/Boss05Stage.generated.js";

export const BOSS_STAGE_CATALOG = Object.freeze({
    [BOSS_01_STAGE_SPEC.id]: BOSS_01_STAGE_SPEC,
    [BOSS_02_STAGE_SPEC.id]: BOSS_02_STAGE_SPEC,
    [BOSS_04_STAGE_SPEC.id]: BOSS_04_STAGE_SPEC,
    [BOSS_05_STAGE_SPEC.id]: BOSS_05_STAGE_SPEC
});

export function bossStageSpecById(id) {
    return BOSS_STAGE_CATALOG[id] ?? null;
}
