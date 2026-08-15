export const ACCESS_SCAN_PHASES = Object.freeze(["AVAILABLE", "WARNING", "LOCKED", "RESET"]);

const PHASE_CYCLE_KEYS = Object.freeze({
    AVAILABLE: "available",
    WARNING: "warning",
    LOCKED: "locked",
    RESET: "reset"
});

const PHASE_EPSILON = 1e-9;

function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
}

function accessScanPhase(group, elapsedSeconds) {
    const { available, warning, locked, reset } = group.cycle;
    const total = available + warning + locked + reset;
    const offset = group.phaseOffsetSeconds ?? 0;
    let phaseTime = positiveModulo(elapsedSeconds + offset, total);
    if (phaseTime < available - PHASE_EPSILON) return Object.freeze({ phase: "AVAILABLE", phaseTime });
    phaseTime -= available;
    if (phaseTime < warning - PHASE_EPSILON) return Object.freeze({ phase: "WARNING", phaseTime });
    phaseTime -= warning;
    if (phaseTime < locked - PHASE_EPSILON) return Object.freeze({ phase: "LOCKED", phaseTime });
    phaseTime -= locked;
    return Object.freeze({ phase: "RESET", phaseTime });
}

export function evaluateAccessScanGroup(group, elapsedSeconds) {
    if (!group?.id || !group?.cycle) throw new Error("Access Scan Group requires an id and a cycle");
    if (!Number.isFinite(elapsedSeconds)) throw new Error("elapsedSeconds must be finite");
    const { phase, phaseTime } = accessScanPhase(group, elapsedSeconds);
    const duration = group.cycle[PHASE_CYCLE_KEYS[phase]];
    const attachAllowed = phase === "AVAILABLE" || phase === "WARNING";
    return Object.freeze({
        id: group.id,
        phase,
        phaseTime,
        phaseProgress: duration > 0 ? phaseTime / duration : 0,
        secondsRemaining: duration - phaseTime,
        attachAllowed
    });
}

export function snapshotAccessScanStates(groups, elapsedSeconds) {
    return Object.freeze((groups ?? []).map((group) => evaluateAccessScanGroup(group, elapsedSeconds)));
}

export function accessScanStateMap(groups, elapsedSeconds) {
    return new Map((groups ?? []).map((group) => [group.id, evaluateAccessScanGroup(group, elapsedSeconds)]));
}

export function isSurfaceAccessAllowed(surface, stateByGroupId) {
    const groupId = surface?.grappleAccessGroup;
    if (!groupId) return true;
    const state = stateByGroupId?.get(groupId);
    if (!state) throw new Error(`Unknown access scan group '${groupId}'`);
    return state.attachAllowed;
}
