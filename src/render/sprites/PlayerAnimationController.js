import { StateMachine } from "../../core/state/StateMachine.js";

export const PLAYER_ANIMATION_DURATIONS = Object.freeze({ hit: 0.24, death: 0.45, respawn: 0.45 });
export const PLAYER_RUN_CYCLE_DISTANCE = 180;
export const PLAYER_AIR_SPIN_RADIANS_PER_SECOND = Math.PI * 4;
const STATES = Object.freeze(["idle", "run", "jump", "fall", "rope", "hit", "death", "respawn"]);
const TRANSITIONS = Object.freeze(
    Object.fromEntries(STATES.map((state) => [state, STATES.filter((next) => next !== state)]))
);

function locomotionState(player, rope, horizontalThreshold) {
    if (!player.isGrounded && rope?.isAttached) return "rope";
    if (!player.isGrounded) return player.velocity.y < 0 ? "jump" : "fall";
    if (Math.abs(player.velocity.x) >= horizontalThreshold) return "run";
    return "idle";
}

export class PlayerAnimationController {
    constructor({
        horizontalThreshold = 8,
        transientDurations = PLAYER_ANIMATION_DURATIONS,
        runCycleDurationSeconds = 0.72,
        runCycleDistance = PLAYER_RUN_CYCLE_DISTANCE
    } = {}) {
        if (!Number.isFinite(horizontalThreshold) || horizontalThreshold < 0) {
            throw new Error("horizontalThreshold must be non-negative");
        }
        if (
            !transientDurations ||
            !Number.isFinite(transientDurations.hit) ||
            transientDurations.hit <= 0 ||
            !Number.isFinite(transientDurations.death) ||
            transientDurations.death <= 0 ||
            !Number.isFinite(transientDurations.respawn) ||
            transientDurations.respawn <= 0
        ) {
            throw new Error("transientDurations requires positive hit, death, and respawn durations");
        }
        if (!Number.isFinite(runCycleDurationSeconds) || runCycleDurationSeconds <= 0) {
            throw new Error("runCycleDurationSeconds must be positive");
        }
        if (!Number.isFinite(runCycleDistance) || runCycleDistance <= 0) {
            throw new Error("runCycleDistance must be positive");
        }
        this.horizontalThreshold = horizontalThreshold;
        this.transientDurations = Object.freeze({
            hit: transientDurations.hit,
            death: transientDurations.death,
            respawn: transientDurations.respawn
        });
        this.runCycleDurationSeconds = runCycleDurationSeconds;
        this.runCycleDistance = runCycleDistance;
        this.runTravelDistance = 0;
        this.previousPositionX = null;
        this.machine = new StateMachine({ initialState: "idle", transitions: TRANSITIONS });
        this.flipX = false;
        this.processedEventIds = new Set();
        this.processedEventOrder = [];
        this.deathPosition = null;
    }

    update({ player, rope, events = [], dt }) {
        const horizontalTravel = this.recordHorizontalTravel(player);
        this.machine.advance(dt);
        if (Math.abs(player.velocity.x) >= this.horizontalThreshold) this.flipX = player.velocity.x < 0;

        const freshEvents = events.filter((event) => this.rememberEvent(event.id));
        const respawn = freshEvents.find(({ type }) => type === "respawn");
        if (respawn) {
            this.runTravelDistance = 0;
            this.deathPosition = respawn.deathPosition ?? player.position;
            this.machine.transition("death", { restart: true });
            return this.snapshot();
        }
        if (
            this.machine.state === "death" &&
            this.machine.elapsedSeconds + Number.EPSILON < this.transientDurations.death
        ) {
            return this.snapshot();
        }
        if (this.machine.state === "death") {
            this.deathPosition = null;
            this.machine.transition("respawn", { restart: true });
            return this.snapshot();
        }
        if (
            this.machine.state === "respawn" &&
            this.machine.elapsedSeconds + Number.EPSILON < this.transientDurations.respawn
        ) {
            return this.snapshot();
        }
        const hit = freshEvents.find(({ type }) => type === "hit");
        if (hit) {
            this.runTravelDistance = 0;
            this.machine.transition("hit", { restart: true });
            return this.snapshot();
        }
        if (
            this.machine.state === "hit" &&
            this.machine.elapsedSeconds + Number.EPSILON < this.transientDurations.hit
        ) {
            return this.snapshot();
        }
        const nextState = locomotionState(player, rope, this.horizontalThreshold);
        const wasRunning = this.machine.state === "run";
        this.machine.transition(nextState);
        if (nextState === "run") {
            if (!wasRunning) this.runTravelDistance = 0;
            else this.runTravelDistance = (this.runTravelDistance + horizontalTravel) % this.runCycleDistance;
        } else this.runTravelDistance = 0;
        return this.snapshot();
    }

    recordHorizontalTravel(player) {
        const positionX = player?.position?.x;
        const travel =
            Number.isFinite(positionX) && Number.isFinite(this.previousPositionX)
                ? Math.abs(positionX - this.previousPositionX)
                : 0;
        this.previousPositionX = Number.isFinite(positionX) ? positionX : null;
        return travel;
    }

    rememberEvent(id) {
        if (typeof id !== "string" || !id || this.processedEventIds.has(id)) return false;
        this.processedEventIds.add(id);
        this.processedEventOrder.push(id);
        while (this.processedEventOrder.length > 64) this.processedEventIds.delete(this.processedEventOrder.shift());
        return true;
    }

    snapshot() {
        const snapshot = this.machine.snapshot();
        const elapsedSeconds =
            snapshot.state === "run"
                ? (this.runTravelDistance / this.runCycleDistance) * this.runCycleDurationSeconds
                : snapshot.elapsedSeconds;
        const rotationOffset = snapshot.state === "jump" ? elapsedSeconds * PLAYER_AIR_SPIN_RADIANS_PER_SECOND : 0;
        return Object.freeze({
            ...snapshot,
            elapsedSeconds,
            flipX: this.flipX,
            rotationOffset,
            positionOverride: snapshot.state === "death" ? this.deathPosition : null
        });
    }
}
