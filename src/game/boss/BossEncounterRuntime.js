import { TimedStateController } from "../../core/state/TimedStateController.js";

const SHIELD_TRANSITIONS = Object.freeze({
    closed: Object.freeze(["exposed"]),
    exposed: Object.freeze(["closed"])
});

const ENCOUNTER_STATUSES = new Set(["inactive", "active", "completed"]);
const PARTICIPANT_STATUSES = new Set(["active", "spectating"]);

function result(value) {
    return Object.freeze(value);
}

function assertNonNegative(value, label) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be non-negative`);
    return value;
}

function assertPositive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive`);
    return value;
}

function assertId(value, label) {
    if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
    return value;
}

function normalizeParticipantIds(participantIds) {
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
        throw new Error("Boss encounter requires at least one participant");
    }
    const normalized = participantIds.map((id) => assertId(id, "participantId"));
    if (new Set(normalized).size !== normalized.length)
        throw new Error("Boss encounter participant IDs must be unique");
    return Object.freeze([...normalized].sort());
}

function validateDefinition(definition) {
    if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
        throw new Error("BossEncounterRuntime requires a definition");
    }
    assertId(definition.id, "Boss encounter id");
    assertPositive(definition.maxHealth, "Boss maxHealth");
    if (!Number.isSafeInteger(definition.phaseCount) || definition.phaseCount <= 0) {
        throw new Error("Boss phaseCount must be a positive safe integer");
    }
    assertPositive(definition.phaseHealth, "Boss phaseHealth");
    if (definition.maxHealth !== definition.phaseCount * definition.phaseHealth) {
        throw new Error("Boss maxHealth must equal phaseCount × phaseHealth");
    }
    assertPositive(definition.exposureSeconds, "Boss exposureSeconds");
    if (!Array.isArray(definition.breakerIds) || definition.breakerIds.length !== definition.phaseCount) {
        throw new Error("Boss breakerIds must match phaseCount");
    }
    for (const breakerId of definition.breakerIds) assertId(breakerId, "Boss breakerId");
    return definition;
}

export class BossEncounterRuntime {
    constructor(definition, snapshot = null) {
        this.definition = validateDefinition(definition);
        this.status = "inactive";
        this.attempt = 0;
        this.phaseIndex = 0;
        this.health = definition.maxHealth;
        this.participants = new Map();
        this.eventSequence = 0;
        this.events = [];
        this.shield = this.#createShield("closed", 0);
        if (snapshot) this.restore(snapshot);
    }

    #createShield(state, remainingSeconds) {
        return new TimedStateController({
            initialState: "closed",
            transitions: SHIELD_TRANSITIONS,
            state,
            remainingSeconds
        });
    }

    #emit(eventType, payload = {}) {
        this.eventSequence += 1;
        const event = result({
            eventId: `${this.definition.id}:event:${this.eventSequence}`,
            eventType,
            sequence: this.eventSequence,
            ...payload
        });
        this.events.push(event);
        return event;
    }

    #participantStatus(playerId) {
        return this.participants.get(playerId) ?? null;
    }

    #currentBreakerId() {
        return this.status === "completed" ? null : this.definition.breakerIds[this.phaseIndex];
    }

    #resetAttempt() {
        this.attempt += 1;
        this.phaseIndex = 0;
        this.health = this.definition.maxHealth;
        this.shield = this.#createShield("closed", 0);
        for (const playerId of this.participants.keys()) this.participants.set(playerId, "active");
        this.#emit("boss-attempt-started", { attempt: this.attempt, phase: 1 });
    }

    start({ participantIds }) {
        if (this.status !== "inactive") {
            return result({ accepted: false, changed: false, reason: "encounter-already-started" });
        }
        const ids = normalizeParticipantIds(participantIds);
        this.status = "active";
        this.attempt = 1;
        this.participants = new Map(ids.map((playerId) => [playerId, "active"]));
        this.#emit("boss-encounter-started", { attempt: this.attempt, participantIds: ids });
        return result({ accepted: true, changed: true, attempt: this.attempt });
    }

    interactBreaker({ playerId, breakerId }) {
        assertId(playerId, "playerId");
        assertId(breakerId, "breakerId");
        if (this.status !== "active") {
            return result({ accepted: false, changed: false, reason: "encounter-not-active" });
        }
        if (this.#participantStatus(playerId) !== "active") {
            return result({ accepted: false, changed: false, reason: "participant-not-active" });
        }
        if (breakerId !== this.#currentBreakerId()) {
            return result({ accepted: false, changed: false, reason: "breaker-not-current" });
        }
        if (this.shield.state !== "closed") {
            return result({ accepted: false, changed: false, reason: "core-already-exposed" });
        }
        this.shield.transition("exposed", { durationSeconds: this.definition.exposureSeconds });
        this.#emit("boss-core-exposed", {
            playerId,
            breakerId,
            phase: this.phaseIndex + 1,
            durationSeconds: this.definition.exposureSeconds
        });
        return result({ accepted: true, changed: true, phase: this.phaseIndex + 1 });
    }

    applyDamage({ sourcePlayerId = null, damage }) {
        assertPositive(damage, "Boss damage");
        if (sourcePlayerId !== null) assertId(sourcePlayerId, "sourcePlayerId");
        if (this.status !== "active") {
            return result({ accepted: false, changed: false, reason: "encounter-not-active", appliedDamage: 0 });
        }
        if (sourcePlayerId !== null && this.#participantStatus(sourcePlayerId) !== "active") {
            return result({ accepted: false, changed: false, reason: "participant-not-active", appliedDamage: 0 });
        }
        if (this.shield.state !== "exposed") {
            return result({ accepted: false, changed: false, reason: "core-shielded", appliedDamage: 0 });
        }
        const phaseFloor = this.definition.maxHealth - (this.phaseIndex + 1) * this.definition.phaseHealth;
        const appliedDamage = Math.min(damage, this.health - phaseFloor);
        this.health = Math.max(phaseFloor, this.health - appliedDamage);
        this.#emit("boss-damaged", {
            sourcePlayerId,
            phase: this.phaseIndex + 1,
            damage: appliedDamage,
            health: this.health
        });
        if (this.health > phaseFloor) {
            return result({ accepted: true, changed: true, appliedDamage, completed: false });
        }
        this.shield.transition("closed");
        if (this.health === 0) {
            this.status = "completed";
            this.#emit("boss-encounter-completed", { sourcePlayerId, attempt: this.attempt });
            return result({ accepted: true, changed: true, appliedDamage, completed: true });
        }
        const completedPhase = this.phaseIndex + 1;
        this.phaseIndex += 1;
        this.#emit("boss-phase-completed", { completedPhase, nextPhase: this.phaseIndex + 1 });
        return result({ accepted: true, changed: true, appliedDamage, completed: false, completedPhase });
    }

    advance(dt) {
        const step = assertNonNegative(dt, "BossEncounterRuntime dt");
        if (this.status !== "active" || step === 0) {
            return result({ accepted: this.status === "active", changed: false });
        }
        let changed = false;
        if (this.shield.state === "exposed") {
            this.shield.consume(step);
            changed = true;
            if (this.shield.remainingSeconds === 0) {
                this.shield.transition("closed");
                this.#emit("boss-core-shielded", { phase: this.phaseIndex + 1 });
            }
        }
        return result({ accepted: true, changed });
    }

    handlePlayerDefeat(playerId, cause = "unknown") {
        assertId(playerId, "playerId");
        assertId(cause, "Boss participant defeat cause");
        if (this.status !== "active") {
            return result({ accepted: false, changed: false, reason: "encounter-not-active", retryStarted: false });
        }
        const participantStatus = this.#participantStatus(playerId);
        if (participantStatus === null) {
            return result({ accepted: false, changed: false, reason: "participant-unknown", retryStarted: false });
        }
        if (participantStatus === "spectating") {
            return result({
                accepted: true,
                changed: false,
                reason: "participant-already-defeated",
                retryStarted: false
            });
        }
        this.participants.set(playerId, "spectating");
        this.#emit("boss-participant-defeated", { playerId, cause, attempt: this.attempt });
        const retryStarted = [...this.participants.values()].every((status) => status === "spectating");
        if (retryStarted) this.#resetAttempt();
        return result({ accepted: true, changed: true, retryStarted, attempt: this.attempt });
    }

    drainEvents() {
        const events = Object.freeze(this.events);
        this.events = [];
        return events;
    }

    snapshot() {
        return result({
            encounterId: this.definition.id,
            status: this.status,
            attempt: this.attempt,
            phase: this.phaseIndex + 1,
            phaseCount: this.definition.phaseCount,
            health: this.health,
            maxHealth: this.definition.maxHealth,
            shieldState: this.shield.state,
            exposureRemainingSeconds: this.shield.remainingSeconds,
            currentBreakerId: this.#currentBreakerId(),
            participantStates: Object.freeze(
                [...this.participants.entries()].map(([playerId, status]) => result({ playerId, status }))
            ),
            eventSequence: this.eventSequence
        });
    }

    restore(snapshot) {
        if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
            throw new Error("Boss encounter snapshot must be an object");
        }
        if (snapshot.encounterId !== this.definition.id) throw new Error("Boss encounter snapshot ID mismatch");
        if (!ENCOUNTER_STATUSES.has(snapshot.status)) throw new Error("Boss encounter snapshot status is invalid");
        if (!Number.isSafeInteger(snapshot.attempt) || snapshot.attempt < 0) {
            throw new Error("Boss encounter snapshot attempt is invalid");
        }
        if (
            !Number.isSafeInteger(snapshot.phase) ||
            snapshot.phase < 1 ||
            snapshot.phase > this.definition.phaseCount
        ) {
            throw new Error("Boss encounter snapshot phase is invalid");
        }
        if (snapshot.phaseCount !== this.definition.phaseCount) {
            throw new Error("Boss encounter snapshot phaseCount is inconsistent");
        }
        if (snapshot.maxHealth !== this.definition.maxHealth) {
            throw new Error("Boss encounter snapshot maxHealth is inconsistent");
        }
        if (!Number.isFinite(snapshot.health) || snapshot.health < 0 || snapshot.health > this.definition.maxHealth) {
            throw new Error("Boss encounter snapshot health is invalid");
        }
        const expectedPhase =
            snapshot.health === 0
                ? this.definition.phaseCount
                : Math.min(
                      this.definition.phaseCount,
                      Math.floor((this.definition.maxHealth - snapshot.health) / this.definition.phaseHealth) + 1
                  );
        if (snapshot.phase !== expectedPhase) throw new Error("Boss encounter snapshot phase and health disagree");
        if (!Array.isArray(snapshot.participantStates)) {
            throw new Error("Boss encounter participantStates must be an array");
        }
        const participantIds = new Set();
        const participants = snapshot.participantStates.map(({ playerId, status }) => {
            assertId(playerId, "Boss encounter snapshot playerId");
            if (participantIds.has(playerId)) throw new Error("Boss encounter snapshot participant IDs must be unique");
            participantIds.add(playerId);
            if (!PARTICIPANT_STATUSES.has(status)) throw new Error("Boss encounter participant status is invalid");
            return [playerId, status];
        });
        if (snapshot.status !== "inactive" && participants.length === 0) {
            throw new Error("Active Boss encounter snapshot requires participants");
        }
        if (!Number.isSafeInteger(snapshot.eventSequence) || snapshot.eventSequence < 0) {
            throw new Error("Boss encounter eventSequence is invalid");
        }
        const shieldState = snapshot.shieldState;
        if (shieldState !== "closed" && shieldState !== "exposed") {
            throw new Error("Boss encounter shieldState is invalid");
        }
        const exposureRemainingSeconds = assertNonNegative(
            snapshot.exposureRemainingSeconds,
            "Boss encounter exposureRemainingSeconds"
        );
        if (exposureRemainingSeconds > this.definition.exposureSeconds) {
            throw new Error("Boss encounter exposureRemainingSeconds exceeds the definition");
        }
        if (shieldState === "closed" && exposureRemainingSeconds !== 0) {
            throw new Error("Closed Boss core cannot retain exposure time");
        }
        if (snapshot.status === "active" && (snapshot.attempt < 1 || snapshot.health === 0)) {
            throw new Error("Active Boss encounter snapshot is inconsistent");
        }
        if (snapshot.status === "completed" && (snapshot.health !== 0 || shieldState !== "closed")) {
            throw new Error("Completed Boss encounter snapshot is inconsistent");
        }
        if (
            snapshot.status === "inactive" &&
            (snapshot.attempt !== 0 || snapshot.health !== this.definition.maxHealth || participants.length > 0)
        ) {
            throw new Error("Inactive Boss encounter snapshot is inconsistent");
        }
        this.status = snapshot.status;
        this.attempt = snapshot.attempt;
        this.phaseIndex = snapshot.phase - 1;
        this.health = snapshot.health;
        this.participants = new Map(participants);
        this.eventSequence = snapshot.eventSequence;
        this.events = [];
        this.shield = this.#createShield(shieldState, exposureRemainingSeconds);
        if (snapshot.currentBreakerId !== this.#currentBreakerId()) {
            throw new Error("Boss encounter currentBreakerId is inconsistent");
        }
        return this;
    }
}
