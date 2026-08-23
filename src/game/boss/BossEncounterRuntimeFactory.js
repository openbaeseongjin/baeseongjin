import { BossEncounterRuntime } from "./BossEncounterRuntime.js";
import { ContinuityControlCoreRuntime } from "./ContinuityControlCoreRuntime.js";
import { ResidentialSecuritySystemRuntime } from "./ResidentialSecuritySystemRuntime.js";

const ENCOUNTER_RUNTIME_BY_MECHANIC = Object.freeze({
    "residential-security-system": ResidentialSecuritySystemRuntime,
    "continuity-control-core": ContinuityControlCoreRuntime
});

export function createBossEncounterRuntime(definition, snapshot = null) {
    const Runtime = ENCOUNTER_RUNTIME_BY_MECHANIC[definition.arena?.boss?.mechanicId] ?? BossEncounterRuntime;
    return new Runtime(definition, snapshot);
}
