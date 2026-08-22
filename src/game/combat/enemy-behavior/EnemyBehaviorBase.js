import { StateMachine } from "../../../core/state/StateMachine.js";
import { TimedStateController } from "../../../core/state/TimedStateController.js";
import { ENEMY_BEHAVIOR_STATES, ENEMY_BEHAVIOR_TRANSITIONS, normalizeEnemyState } from "../EnemyStateCatalog.js";
import { ENEMY_BEHAVIOR_CONFIG } from "./EnemyBehaviorDefinition.js";

export class TimedEnemyBehavior {
    #controller;

    constructor({ kind, initialState, state, remainingSeconds = ENEMY_BEHAVIOR_CONFIG.ZERO }) {
        this.kind = kind;
        this.#controller = new TimedStateController({
            initialState,
            transitions: ENEMY_BEHAVIOR_TRANSITIONS[kind],
            state: normalizeEnemyState(state, ENEMY_BEHAVIOR_STATES[kind], initialState),
            remainingSeconds
        });
    }

    get state() {
        return this.#controller.state;
    }

    get remainingSeconds() {
        return this.#controller.remainingSeconds;
    }

    transition(nextState, durationSeconds = ENEMY_BEHAVIOR_CONFIG.ZERO) {
        const result = this.#controller.transition(nextState, { durationSeconds });
        if (!result.accepted) throw new Error(`invalid ${this.kind} transition: ${result.from} -> ${result.to}`);
    }

    consume(dt) {
        return this.#controller.consume(dt);
    }

    restoreState(state, remainingSeconds = ENEMY_BEHAVIOR_CONFIG.ZERO, fallback) {
        this.#controller.restore({
            state: normalizeEnemyState(state, ENEMY_BEHAVIOR_STATES[this.kind], fallback),
            remainingSeconds: Math.max(ENEMY_BEHAVIOR_CONFIG.ZERO, remainingSeconds)
        });
    }
}

export class StateEnemyBehavior {
    #controller;

    constructor({ kind, initialState, state }) {
        this.kind = kind;
        this.#controller = new StateMachine({
            initialState: normalizeEnemyState(state, ENEMY_BEHAVIOR_STATES[kind], initialState),
            transitions: ENEMY_BEHAVIOR_TRANSITIONS[kind]
        });
    }

    get state() {
        return this.#controller.state;
    }

    transition(nextState) {
        const result = this.#controller.transition(nextState);
        if (!result.accepted) throw new Error(`invalid ${this.kind} transition: ${result.from} -> ${result.to}`);
    }

    restoreState(state, fallback) {
        this.#controller.restore({ state: normalizeEnemyState(state, ENEMY_BEHAVIOR_STATES[this.kind], fallback) });
    }
}
