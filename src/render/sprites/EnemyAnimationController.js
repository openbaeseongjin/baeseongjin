import { StateMachine } from "../../core/state/StateMachine.js";

function stateTransitions(states) {
    if (!Array.isArray(states) || states.length === 0 || states.some((state) => typeof state !== "string" || !state)) {
        throw new Error("EnemyAnimationController requires non-empty states");
    }
    const uniqueStates = [...new Set(states)];
    return Object.freeze(
        Object.fromEntries(uniqueStates.map((state) => [state, uniqueStates.filter((next) => next !== state)]))
    );
}

export class EnemyAnimationController {
    constructor({ states, initialState } = {}) {
        this.machine = new StateMachine({ initialState, transitions: stateTransitions(states) });
        this.flipX = false;
    }

    update({ state, dt, facingX = null } = {}) {
        this.machine.advance(dt);
        const transition = this.machine.transition(state);
        if (!transition.accepted) {
            throw new Error(`invalid enemy animation transition: ${transition.from} -> ${transition.to}`);
        }
        if (Number.isFinite(facingX) && Math.abs(facingX) > Number.EPSILON) this.flipX = facingX < 0;
        return this.snapshot();
    }

    snapshot() {
        return Object.freeze({ ...this.machine.snapshot(), flipX: this.flipX });
    }
}
