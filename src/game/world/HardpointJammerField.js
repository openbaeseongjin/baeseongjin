export const HARDPOINT_JAMMER_PHASE = Object.freeze({
    NORMAL: "normal",
    WARNING: "warning",
    ACTIVE: "active",
    CLEAR: "clear",
    DISABLED: "disabled"
});

export const HARDPOINT_JAMMER_AUTHORITY = Object.freeze({
    AUTHORITATIVE: "authoritative",
    SNAPSHOT: "snapshot"
});

export const HARDPOINT_JAMMER_CYCLE = Object.freeze({ warning: 0.75, active: 1.5, clear: 0.5 });

function requireDuration(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be finite and positive`);
    return value;
}

function normalizeGroup(group) {
    if (typeof group?.id !== "string" || typeof group?.sourceObjectId !== "string") {
        throw new Error("Hardpoint Jammer group requires stable id and sourceObjectId");
    }
    const eligibleSurfaceIds = Object.freeze([...(group.eligibleSurfaceIds ?? [])]);
    if (eligibleSurfaceIds.length < 2 || new Set(eligibleSurfaceIds).size !== eligibleSurfaceIds.length) {
        throw new Error(`Hardpoint Jammer '${group.id}' requires distinct Base-clear candidates`);
    }
    const cycle = group.cycle ?? HARDPOINT_JAMMER_CYCLE;
    return Object.freeze({
        id: group.id,
        sourceObjectId: group.sourceObjectId,
        eligibleSurfaceIds,
        cycle: Object.freeze({
            warning: requireDuration(cycle.warning, `${group.id}.warning`),
            active: requireDuration(cycle.active, `${group.id}.active`),
            clear: requireDuration(cycle.clear, `${group.id}.clear`)
        })
    });
}

function initialState(group) {
    return {
        id: group.id,
        sourceObjectId: group.sourceObjectId,
        phase: HARDPOINT_JAMMER_PHASE.NORMAL,
        targetSurfaceId: null,
        remainingSeconds: 0,
        targetCursor: 0
    };
}

function selectTarget(group, state, attachedSurfaceIds) {
    for (let offset = 0; offset < group.eligibleSurfaceIds.length; offset += 1) {
        const index = (state.targetCursor + offset) % group.eligibleSurfaceIds.length;
        const surfaceId = group.eligibleSurfaceIds[index];
        if (attachedSurfaceIds.has(surfaceId)) continue;
        state.targetCursor = (index + 1) % group.eligibleSurfaceIds.length;
        return surfaceId;
    }
    return null;
}

export class HardpointJammerField {
    constructor(groups = []) {
        this.groups = Object.freeze(groups.map(normalizeGroup));
        this.states = new Map(this.groups.map((group) => [group.id, initialState(group)]));
    }

    advance(dt, { activeSourceObjectIds = new Set(), attachedSurfaceIds = new Set() } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Hardpoint Jammer dt must be finite and non-negative");
        for (const group of this.groups) {
            const state = this.states.get(group.id);
            if (!activeSourceObjectIds.has(group.sourceObjectId)) {
                Object.assign(state, initialState(group), { phase: HARDPOINT_JAMMER_PHASE.DISABLED });
                continue;
            }
            if (state.phase === HARDPOINT_JAMMER_PHASE.DISABLED) Object.assign(state, initialState(group));
            state.remainingSeconds = Math.max(0, state.remainingSeconds - dt);
            if (state.phase === HARDPOINT_JAMMER_PHASE.NORMAL) {
                const targetSurfaceId = selectTarget(group, state, attachedSurfaceIds);
                if (!targetSurfaceId) continue;
                state.phase = HARDPOINT_JAMMER_PHASE.WARNING;
                state.targetSurfaceId = targetSurfaceId;
                state.remainingSeconds = group.cycle.warning;
            } else if (state.remainingSeconds === 0 && state.phase === HARDPOINT_JAMMER_PHASE.WARNING) {
                state.phase = HARDPOINT_JAMMER_PHASE.ACTIVE;
                state.remainingSeconds = group.cycle.active;
            } else if (state.remainingSeconds === 0 && state.phase === HARDPOINT_JAMMER_PHASE.ACTIVE) {
                state.phase = HARDPOINT_JAMMER_PHASE.CLEAR;
                state.remainingSeconds = group.cycle.clear;
            } else if (state.remainingSeconds === 0 && state.phase === HARDPOINT_JAMMER_PHASE.CLEAR) {
                state.phase = HARDPOINT_JAMMER_PHASE.NORMAL;
                state.targetSurfaceId = null;
            }
        }
        return this.snapshot();
    }

    canAttachToSurface(surface) {
        return ![...this.states.values()].some(
            (state) => state.phase === HARDPOINT_JAMMER_PHASE.ACTIVE && state.targetSurfaceId === surface?.id
        );
    }

    snapshot() {
        return Object.freeze([...this.states.values()].map((state) => Object.freeze({ ...state })));
    }

    restore(snapshot = []) {
        const stateById = new Map(snapshot.map((state) => [state.id, state]));
        for (const group of this.groups) {
            const restored = stateById.get(group.id);
            if (!restored) continue;
            if (!Object.values(HARDPOINT_JAMMER_PHASE).includes(restored.phase)) {
                throw new Error(`Hardpoint Jammer '${group.id}' snapshot phase is invalid`);
            }
            if (restored.targetSurfaceId !== null && !group.eligibleSurfaceIds.includes(restored.targetSurfaceId)) {
                throw new Error(`Hardpoint Jammer '${group.id}' snapshot target is invalid`);
            }
            Object.assign(this.states.get(group.id), initialState(group), restored);
        }
        return this.snapshot();
    }
}
