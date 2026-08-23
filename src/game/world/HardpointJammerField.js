import { ELECTRIFIED_STATUS_CONFIG, ELECTRIFIED_STATUS_ID } from "../status-effects/ElectrifiedStatusEffect.js";

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

export const HARDPOINT_JAMMER_CYCLE = Object.freeze({
    warning: 0.75,
    active: 1.5,
    clear: 0.5,
    claimGrace: 0.5,
    searchRetry: 0.1
});
export const HARDPOINT_JAMMER_IMPACT = Object.freeze({
    eventType: "player-jammer-shocked",
    effectId: ELECTRIFIED_STATUS_ID,
    totalDamage: ELECTRIFIED_STATUS_CONFIG.totalDamage
});

export const HARDPOINT_JAMMER_KEY = Object.freeze({
    impact: ({ groupId, cycleSequence, playerId, attachmentId }) =>
        `${groupId}:shock:${cycleSequence}:${playerId}:${attachmentId}`
});

function requireDuration(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be finite and positive`);
    return value;
}

function normalizeGroup(group) {
    if (typeof group?.id !== "string" || typeof group?.sourceObjectId !== "string") {
        throw new Error("Hardpoint Jammer group requires stable id and sourceObjectId");
    }
    const cycle = group.cycle ?? HARDPOINT_JAMMER_CYCLE;
    return Object.freeze({
        id: group.id,
        sourceObjectId: group.sourceObjectId,
        cycle: Object.freeze({
            warning: requireDuration(cycle.warning, `${group.id}.warning`),
            active: requireDuration(cycle.active, `${group.id}.active`),
            clear: requireDuration(cycle.clear, `${group.id}.clear`),
            claimGrace: requireDuration(
                cycle.claimGrace ?? HARDPOINT_JAMMER_CYCLE.claimGrace,
                `${group.id}.claimGrace`
            ),
            searchRetry: requireDuration(
                cycle.searchRetry ?? HARDPOINT_JAMMER_CYCLE.searchRetry,
                `${group.id}.searchRetry`
            )
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
        searchRemainingSeconds: 0,
        cycleSequence: 0
    };
}

function selectTarget(candidateSurfaceIds, attachedSurfaceIds, reservedSurfaceIds) {
    if (!Array.isArray(candidateSurfaceIds) || candidateSurfaceIds.length < 2) return null;
    const availableSurfaceIds = candidateSurfaceIds.filter(
        (surfaceId) =>
            typeof surfaceId === "string" &&
            surfaceId.length > 0 &&
            !attachedSurfaceIds.has(surfaceId) &&
            !reservedSurfaceIds.has(surfaceId)
    );
    return availableSurfaceIds.length >= 2 ? availableSurfaceIds[0] : null;
}

export class HardpointJammerField {
    constructor(groups = []) {
        this.groups = Object.freeze(groups.map(normalizeGroup));
        this.states = new Map(this.groups.map((group) => [group.id, initialState(group)]));
    }

    advance(
        dt,
        { activeSourceObjectIds = new Set(), attachedSurfaceIds = new Set(), candidateSurfaceIdsFor = () => [] } = {}
    ) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Hardpoint Jammer dt must be finite and non-negative");
        const reservedSurfaceIds = new Set(
            [...this.states.values()]
                .filter(({ phase }) => phase !== HARDPOINT_JAMMER_PHASE.NORMAL)
                .map(({ targetSurfaceId }) => targetSurfaceId)
                .filter(Boolean)
        );
        for (const group of this.groups) {
            const state = this.states.get(group.id);
            if (!activeSourceObjectIds.has(group.sourceObjectId)) {
                Object.assign(state, initialState(group), { phase: HARDPOINT_JAMMER_PHASE.DISABLED });
                continue;
            }
            if (state.phase === HARDPOINT_JAMMER_PHASE.DISABLED) Object.assign(state, initialState(group));
            state.remainingSeconds = Math.max(0, state.remainingSeconds - dt);
            state.searchRemainingSeconds = Math.max(0, state.searchRemainingSeconds - dt);
            if (state.phase === HARDPOINT_JAMMER_PHASE.NORMAL) {
                if (state.searchRemainingSeconds > 0) continue;
                const targetSurfaceId = selectTarget(
                    candidateSurfaceIdsFor(group, reservedSurfaceIds),
                    attachedSurfaceIds,
                    reservedSurfaceIds
                );
                if (!targetSurfaceId) {
                    state.searchRemainingSeconds = group.cycle.searchRetry;
                    continue;
                }
                state.phase = HARDPOINT_JAMMER_PHASE.WARNING;
                state.targetSurfaceId = targetSurfaceId;
                state.remainingSeconds = group.cycle.warning;
                state.searchRemainingSeconds = 0;
                state.cycleSequence += 1;
                reservedSurfaceIds.add(targetSurfaceId);
            } else if (state.remainingSeconds === 0 && state.phase === HARDPOINT_JAMMER_PHASE.WARNING) {
                state.phase = HARDPOINT_JAMMER_PHASE.ACTIVE;
                state.remainingSeconds = group.cycle.active;
            } else if (state.remainingSeconds === 0 && state.phase === HARDPOINT_JAMMER_PHASE.ACTIVE) {
                state.phase = HARDPOINT_JAMMER_PHASE.CLEAR;
                state.remainingSeconds = group.cycle.clear;
            } else if (state.remainingSeconds === 0 && state.phase === HARDPOINT_JAMMER_PHASE.CLEAR) {
                state.phase = HARDPOINT_JAMMER_PHASE.NORMAL;
                state.searchRemainingSeconds = group.cycle.claimGrace;
            }
        }
        return this.snapshot();
    }

    activeImpactForSurface(surfaceId, { playerId, attachmentId } = {}) {
        const state = [...this.states.values()].find(
            (candidate) => candidate.phase === HARDPOINT_JAMMER_PHASE.ACTIVE && candidate.targetSurfaceId === surfaceId
        );
        if (!state || typeof playerId !== "string" || typeof attachmentId !== "string") return null;
        return Object.freeze({
            impactId: HARDPOINT_JAMMER_KEY.impact({
                groupId: state.id,
                cycleSequence: state.cycleSequence,
                playerId,
                attachmentId
            }),
            groupId: state.id,
            sourceObjectId: state.sourceObjectId,
            surfaceId,
            cycleSequence: state.cycleSequence,
            ...HARDPOINT_JAMMER_IMPACT
        });
    }

    validatesImpact({ groupId, surfaceId, cycleSequence, playerId, attachmentId, impactId }) {
        const state = this.states.get(groupId);
        if (
            !state ||
            ![HARDPOINT_JAMMER_PHASE.ACTIVE, HARDPOINT_JAMMER_PHASE.CLEAR, HARDPOINT_JAMMER_PHASE.NORMAL].includes(
                state.phase
            ) ||
            state.targetSurfaceId !== surfaceId ||
            state.cycleSequence !== cycleSequence ||
            (state.phase === HARDPOINT_JAMMER_PHASE.NORMAL && state.searchRemainingSeconds <= 0)
        ) {
            return false;
        }
        return impactId === HARDPOINT_JAMMER_KEY.impact({ groupId, cycleSequence, playerId, attachmentId });
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
            if (restored.targetSurfaceId !== null && typeof restored.targetSurfaceId !== "string")
                throw new Error(`Hardpoint Jammer '${group.id}' snapshot target is invalid`);
            if (!Number.isSafeInteger(restored.cycleSequence) || restored.cycleSequence < 0)
                throw new Error(`Hardpoint Jammer '${group.id}' snapshot sequence is invalid`);
            if (!Number.isFinite(restored.searchRemainingSeconds) || restored.searchRemainingSeconds < 0)
                throw new Error(`Hardpoint Jammer '${group.id}' snapshot search timer is invalid`);
            Object.assign(this.states.get(group.id), initialState(group), restored);
        }
        return this.snapshot();
    }
}
