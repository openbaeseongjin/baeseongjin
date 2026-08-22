import { GateLockingCarriageRuntime } from "./GateLockingCarriageRuntime.js";

const MECHANISM_RUNTIME = Object.freeze({
    "rail-carriage": GateLockingCarriageRuntime
});

export function createBossMechanismRuntime(definition, snapshot = null) {
    const mechanicId = definition.arena?.boss?.mechanicId;
    const Runtime = MECHANISM_RUNTIME[mechanicId];
    if (!Runtime) throw new Error(`unsupported Boss mechanism: ${mechanicId}`);
    return new Runtime(definition, snapshot);
}
