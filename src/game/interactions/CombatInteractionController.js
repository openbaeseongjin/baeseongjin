import { ActorCaptureInteractionState } from "./ActorCaptureInteractionState.js";

const ACTIVE_CAPTURE_PHASE = Object.freeze({ pulling: true, held: true });

export class CombatInteractionController {
    constructor({ captureDefinitions = Object.freeze({}) } = {}) {
        this.captureDefinitions = captureDefinitions;
        this.interactions = new Map();
        this.interactionIdByTargetId = new Map();
    }

    beginCapture({ interactionId, definitionId, sourceActorId, targetActorId, startPosition, targetPosition }) {
        const definition = this.captureDefinitions[definitionId];
        if (!definition) throw new Error(`unknown capture definition: ${definitionId}`);
        this.cancelTarget(targetActorId);
        const state = new ActorCaptureInteractionState({
            interactionId,
            definition,
            sourceActorId,
            targetActorId,
            startPosition,
            targetPosition
        });
        this.interactions.set(interactionId, state);
        this.interactionIdByTargetId.set(targetActorId, interactionId);
        return state.snapshot();
    }

    canAct(targetActorId) {
        const interactionId = this.interactionIdByTargetId.get(targetActorId);
        return !interactionId || this.interactions.get(interactionId)?.active !== true;
    }

    hasInteraction(interactionId) {
        return this.interactions.get(interactionId)?.active === true;
    }

    advance(dt) {
        const outcomes = [];
        for (const [interactionId, state] of this.interactions) {
            const previousActive = state.active;
            const snapshot = state.advance(dt);
            outcomes.push(Object.freeze({ ...snapshot, position: state.position() }));
            if (previousActive && !state.active) this.interactionIdByTargetId.delete(state.targetActorId);
            if (!state.active) this.interactions.delete(interactionId);
        }
        return Object.freeze(outcomes);
    }

    cancelTarget(targetActorId) {
        const interactionId = this.interactionIdByTargetId.get(targetActorId);
        if (!interactionId) return false;
        const state = this.interactions.get(interactionId);
        state?.cancel();
        this.interactions.delete(interactionId);
        this.interactionIdByTargetId.delete(targetActorId);
        return true;
    }

    cancelSource(sourceActorId) {
        let changed = false;
        for (const state of [...this.interactions.values()]) {
            if (state.sourceActorId !== sourceActorId) continue;
            changed = this.cancelTarget(state.targetActorId) || changed;
        }
        return changed;
    }

    snapshot() {
        return Object.freeze({
            interactions: Object.freeze([...this.interactions.values()].map((state) => state.snapshot()))
        });
    }

    restore(snapshot = null, { preserveActive = false } = {}) {
        const preserved = preserveActive ? [...this.interactions.values()].filter(({ active }) => active) : [];
        this.interactions.clear();
        this.interactionIdByTargetId.clear();
        for (const entry of snapshot?.interactions ?? []) {
            const definition = this.captureDefinitions[entry.definitionId];
            if (!definition || entry.active !== true || ACTIVE_CAPTURE_PHASE[entry.phase] !== true) continue;
            const state = new ActorCaptureInteractionState({
                interactionId: entry.interactionId,
                definition,
                sourceActorId: entry.sourceActorId,
                targetActorId: entry.targetActorId,
                startPosition: entry.startPosition,
                targetPosition: entry.targetPosition
            });
            state.elapsedSeconds = Math.max(0, Math.min(definition.holdSeconds, entry.elapsedSeconds ?? 0));
            state.phase = entry.phase;
            this.interactions.set(state.interactionId, state);
            this.interactionIdByTargetId.set(state.targetActorId, state.interactionId);
        }
        for (const state of preserved) {
            if (this.interactions.has(state.interactionId)) continue;
            this.interactions.set(state.interactionId, state);
            this.interactionIdByTargetId.set(state.targetActorId, state.interactionId);
        }
        return this.snapshot();
    }
}
