import { BOSS_03_STAGE_SPEC } from "./generated/Boss03Stage.generated.js";
import { BOSS_06_STAGE_SPEC } from "./generated/Boss06Stage.generated.js";

export const BOSS_STAGE_CATALOG = Object.freeze({
    [BOSS_03_STAGE_SPEC.id]: BOSS_03_STAGE_SPEC,
    [BOSS_06_STAGE_SPEC.id]: BOSS_06_STAGE_SPEC
});

export function bossStageSpecById(id) {
    return BOSS_STAGE_CATALOG[id] ?? null;
}
