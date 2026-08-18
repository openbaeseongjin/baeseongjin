import { StateMachine } from "./StateMachine.js";

function nonNegativeFinite(value, label) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be non-negative`);
    return value;
}

export class TimedStateController {
    constructor({ initialState, transitions, state = initialState, remainingSeconds = 0 }) {
        this.machine = new StateMachine({ initialState: state, transitions });
        this.remainingSeconds = nonNegativeFinite(remainingSeconds, "remainingSeconds");
    }

    get state() {
        return this.machine.state;
    }

    get elapsedSeconds() {
        return this.machine.elapsedSeconds;
    }

    transition(nextState, { durationSeconds = 0, restart = false } = {}) {
        const duration = nonNegativeFinite(durationSeconds, "durationSeconds");
        const result = this.machine.transition(nextState, { restart });
        if (result.changed || result.restarted) this.remainingSeconds = duration;
        return result;
    }

    consume(dt) {
        const step = nonNegativeFinite(dt, "TimedStateController dt");
        const consumed = Math.min(step, this.remainingSeconds);
        this.remainingSeconds = Math.max(0, this.remainingSeconds - consumed);
        this.machine.advance(consumed);
        return consumed;
    }

    setRemainingSeconds(value) {
        this.remainingSeconds = nonNegativeFinite(value, "remainingSeconds");
    }

    snapshot() {
        return Object.freeze({
            state: this.state,
            elapsedSeconds: this.elapsedSeconds,
            remainingSeconds: this.remainingSeconds
        });
    }
}
