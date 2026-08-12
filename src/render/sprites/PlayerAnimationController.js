import { StateMachine } from "../../core/state/StateMachine.js";

export const PLAYER_ANIMATION_DURATIONS = Object.freeze({ hit: 0.24, respawn: 0.45 });
const STATES = Object.freeze(["idle", "run", "jump", "fall", "rope", "hit", "respawn"]);
const TRANSITIONS = Object.freeze(
    Object.fromEntries(STATES.map((state) => [state, STATES.filter((next) => next !== state)]))
);

function locomotionState(player, rope, horizontalThreshold) {
    if (rope?.isAttached) return "rope";
    if (!player.isGrounded) return player.velocity.y < 0 ? "jump" : "fall";
    if (Math.abs(player.velocity.x) >= horizontalThreshold) return "run";
    return "idle";
}

export class PlayerAnimationController {
    constructor({ horizontalThreshold = 8 } = {}) {
        if (!Number.isFinite(horizontalThreshold) || horizontalThreshold < 0) {
            throw new Error("horizontalThreshold must be non-negative");
        }
        this.horizontalThreshold = horizontalThreshold;
        this.machine = new StateMachine({ initialState: "idle", transitions: TRANSITIONS });
        this.flipX = false;
        this.processedEventIds = new Set();
        this.processedEventOrder = [];
    }

    update({ player, rope, events = [], dt }) {
        this.machine.advance(dt);
        if (Math.abs(player.velocity.x) >= this.horizontalThreshold) this.flipX = player.velocity.x < 0;

        const freshEvents = events.filter((event) => this.rememberEvent(event.id));
        const respawn = freshEvents.find(({ type }) => type === "respawn");
        if (respawn) {
            this.machine.transition("respawn", { restart: true });
            return this.snapshot();
        }
        if (
            this.machine.state === "respawn" &&
            this.machine.elapsedSeconds + Number.EPSILON < PLAYER_ANIMATION_DURATIONS.respawn
        ) {
            return this.snapshot();
        }
        const hit = freshEvents.find(({ type }) => type === "hit");
        if (hit) {
            this.machine.transition("hit", { restart: true });
            return this.snapshot();
        }
        if (
            this.machine.state === "hit" &&
            this.machine.elapsedSeconds + Number.EPSILON < PLAYER_ANIMATION_DURATIONS.hit
        ) {
            return this.snapshot();
        }
        this.machine.transition(locomotionState(player, rope, this.horizontalThreshold));
        return this.snapshot();
    }

    rememberEvent(id) {
        if (typeof id !== "string" || !id || this.processedEventIds.has(id)) return false;
        this.processedEventIds.add(id);
        this.processedEventOrder.push(id);
        while (this.processedEventOrder.length > 64) this.processedEventIds.delete(this.processedEventOrder.shift());
        return true;
    }

    snapshot() {
        return Object.freeze({ ...this.machine.snapshot(), flipX: this.flipX });
    }
}
