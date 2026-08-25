import { BOSS_MECHANIC_TYPE } from "../boss-authoring/BossStageSpec.js";
import { ContinuityWardenRuntime } from "./ContinuityWardenRuntime.js";

const ENCOUNTER_RUNTIME_BY_MECHANIC = Object.freeze({
    [BOSS_MECHANIC_TYPE.CONTINUITY_WARDEN]: ContinuityWardenRuntime
});

export function createBossEncounterRuntime(definition, snapshot = null, { worldSeed = 1 } = {}) {
    const mechanicId = definition.arena?.boss?.mechanicId;
    const Runtime = ENCOUNTER_RUNTIME_BY_MECHANIC[mechanicId];
    if (!Runtime) throw new Error(`unsupported Boss encounter: ${mechanicId}`);
    return new Runtime(definition, snapshot, { worldSeed });
}
