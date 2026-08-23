import { BossEncounterRuntime } from "./BossEncounterRuntime.js";
import { BOSS_MECHANIC_TYPE } from "../boss-authoring/BossStageSpec.js";
import { CentralExchangeMaintenanceRuntime } from "./CentralExchangeMaintenanceRuntime.js";
import { ContinuityControlCoreRuntime } from "./ContinuityControlCoreRuntime.js";
import { ContinuityWardenRuntime } from "./ContinuityWardenRuntime.js";
import { ResidentialSecuritySystemRuntime } from "./ResidentialSecuritySystemRuntime.js";

const ENCOUNTER_RUNTIME_BY_MECHANIC = Object.freeze({
    [BOSS_MECHANIC_TYPE.CENTRAL_EXCHANGE_MAINTENANCE]: CentralExchangeMaintenanceRuntime,
    [BOSS_MECHANIC_TYPE.RESIDENT_SECURITY_SYSTEM]: ResidentialSecuritySystemRuntime,
    [BOSS_MECHANIC_TYPE.CONTINUITY_CONTROL_CORE]: ContinuityControlCoreRuntime,
    [BOSS_MECHANIC_TYPE.CONTINUITY_WARDEN]: ContinuityWardenRuntime
});

export function createBossEncounterRuntime(definition, snapshot = null) {
    const Runtime = ENCOUNTER_RUNTIME_BY_MECHANIC[definition.arena?.boss?.mechanicId] ?? BossEncounterRuntime;
    return new Runtime(definition, snapshot);
}
