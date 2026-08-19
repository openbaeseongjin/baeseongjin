function normalizeTransitions(transitions) {
    if (!transitions || typeof transitions !== "object") throw new Error("StateMachine requires transitions");
    const normalized = {};
    for (const [state, destinations] of Object.entries(transitions)) {
        if (!state.trim() || !Array.isArray(destinations)) throw new Error("State transitions must be arrays");
        normalized[state] = Object.freeze([...new Set(destinations)]);
    }
    return Object.freeze(normalized);
}

function transitionResult({ accepted, changed, restarted, from, to, reason }) {
    return Object.freeze({
        accepted,
        changed,
        restarted,
        from,
        to,
        ...(reason ? { reason } : {})
    });
}

export class StateMachine {
    constructor({ initialState, transitions }) {
        if (typeof initialState !== "string" || !initialState.trim()) {
            throw new Error("StateMachine requires a non-empty initialState");
        }
        this.transitions = normalizeTransitions(transitions);
        if (!Object.hasOwn(this.transitions, initialState)) {
            throw new Error(`Initial state '${initialState}' is missing from transitions`);
        }
        this.state = initialState;
        this.elapsedSeconds = 0;
    }

    canTransition(nextState) {
        return nextState === this.state || this.transitions[this.state].includes(nextState);
    }

    transition(nextState, { restart = false } = {}) {
        if (typeof nextState !== "string" || !nextState.trim()) throw new Error("nextState must be non-empty");
        const from = this.state;
        if (!this.canTransition(nextState)) {
            return transitionResult({
                accepted: false,
                changed: false,
                restarted: false,
                from,
                to: nextState,
                reason: "transition-not-allowed"
            });
        }
        const changed = nextState !== from;
        const restarted = !changed && restart;
        if (changed) this.state = nextState;
        if (changed || restarted) this.elapsedSeconds = 0;
        return transitionResult({ accepted: true, changed, restarted, from, to: nextState });
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("StateMachine dt must be non-negative");
        this.elapsedSeconds += dt;
        return this.snapshot();
    }

    restore({ state, elapsedSeconds = 0 }) {
        if (typeof state !== "string" || !Object.hasOwn(this.transitions, state)) {
            throw new Error(`Unknown StateMachine state '${state}'`);
        }
        if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
            throw new Error("StateMachine elapsedSeconds must be non-negative");
        }
        this.state = state;
        this.elapsedSeconds = elapsedSeconds;
    }

    snapshot() {
        return Object.freeze({ state: this.state, elapsedSeconds: this.elapsedSeconds });
    }
}
