const STAGE_STATUS = Object.freeze({ INACTIVE: "inactive", ACTIVE: "active", COMPLETED: "completed" });
const PARTICIPANT_STATUS = Object.freeze({ ACTIVE: "active", SPECTATING: "spectating", DISCONNECTED: "disconnected" });
const INDIVIDUAL_RESPAWN_POLICY = "individual-respawn";
const VALID_PARTICIPANT_STATUS = Object.freeze(
    Object.fromEntries(Object.values(PARTICIPANT_STATUS).map((status) => [status, true]))
);

export const COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION = "composite-boss-stage-runtime-v2";
export { STAGE_STATUS as COMPOSITE_BOSS_STAGE_STATUS, PARTICIPANT_STATUS as COMPOSITE_BOSS_PARTICIPANT_STATUS };

export function freezeComposite(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeComposite(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(
        Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeComposite(entry)]))
    );
}

export function compositePoint(value, fallback = { x: 0, y: 0 }) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y) ? { x: value.x, y: value.y } : { ...fallback };
}

export function compositeWorldPoint(point, offset = { x: 0, y: 0 }) {
    return Object.freeze({ x: point.x + offset.x, y: point.y + offset.y });
}

export function compositeLocalPoint(point, offset = { x: 0, y: 0 }) {
    return { x: point.x - offset.x, y: point.y - offset.y };
}

export function compositeDistance(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

export function compositeInsideBounds(point, bounds) {
    return Boolean(
        bounds &&
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height
    );
}

export class CompositeBossEncounterRuntime {
    constructor(definition, snapshot = null) {
        this.definition = definition;
        this.status = STAGE_STATUS.INACTIVE;
        this.attempt = 0;
        this.scalingRoster = Object.freeze([]);
        this.participants = new Map();
        this.eventSequence = 0;
        this.events = [];
        this.processedImpactIds = new Set();
        this.processedHazardContactIds = new Set();
        if (snapshot) this.restore(snapshot);
    }

    emit(eventType, payload = {}) {
        this.eventSequence += 1;
        const event = freezeComposite({
            eventId: `${this.definition.id}:event:${this.eventSequence}`,
            eventType,
            sequence: this.eventSequence,
            ...payload
        });
        this.events.push(event);
        return event;
    }

    start({ participantIds }) {
        if (this.status !== STAGE_STATUS.INACTIVE) {
            return freezeComposite({ accepted: false, changed: false, reason: "encounter-already-started" });
        }
        if (!Array.isArray(participantIds) || participantIds.length < 1 || participantIds.length > 4) {
            throw new Error("Composite Boss participantIds must contain 1..4 player IDs");
        }
        const ids = [...new Set(participantIds)].sort();
        if (ids.length !== participantIds.length || ids.some((id) => typeof id !== "string" || !id)) {
            throw new Error("Composite Boss participant IDs must be unique non-empty strings");
        }
        this.scalingRoster = Object.freeze(ids);
        this.participants = new Map(ids.map((id) => [id, PARTICIPANT_STATUS.ACTIVE]));
        this.status = STAGE_STATUS.ACTIVE;
        this.attempt = 1;
        this.resetAttempt({ preserveCompleted: true });
        this.emit("boss-encounter-started", { attempt: this.attempt, participantIds: ids, health: this.totalHealth() });
        return freezeComposite({ accepted: true, changed: true, attempt: this.attempt, maxHealth: this.totalHealth() });
    }

    addParticipant(playerId) {
        if (this.status !== STAGE_STATUS.ACTIVE || typeof playerId !== "string" || !playerId) {
            return freezeComposite({ accepted: false, changed: false, reason: "encounter-not-active" });
        }
        const previous = this.participants.get(playerId);
        this.participants.set(playerId, PARTICIPANT_STATUS.ACTIVE);
        if (previous === PARTICIPANT_STATUS.ACTIVE) {
            return freezeComposite({ accepted: true, changed: false, reason: "participant-already-active" });
        }
        this.emit("boss-participant-joined", { playerId, attempt: this.attempt, scalingChanged: false });
        return freezeComposite({ accepted: true, changed: true, scalingChanged: false });
    }

    removeParticipant(playerId) {
        if (!this.participants.has(playerId)) {
            return freezeComposite({ accepted: false, changed: false, reason: "participant-unknown" });
        }
        if (this.participants.get(playerId) === PARTICIPANT_STATUS.DISCONNECTED) {
            return freezeComposite({ accepted: true, changed: false, reason: "participant-already-disconnected" });
        }
        this.participants.set(playerId, PARTICIPANT_STATUS.DISCONNECTED);
        this.emit("boss-participant-left", { playerId, attempt: this.attempt, scalingChanged: false });
        return freezeComposite({ accepted: true, changed: true, scalingChanged: false });
    }

    recoverParticipant(playerId) {
        if (typeof playerId !== "string" || !this.participants.has(playerId)) {
            return freezeComposite({ accepted: false, changed: false, reason: "participant-unknown" });
        }
        const previous = this.participants.get(playerId);
        if (previous === PARTICIPANT_STATUS.DISCONNECTED) {
            return freezeComposite({ accepted: false, changed: false, reason: "participant-disconnected" });
        }
        if (previous === PARTICIPANT_STATUS.ACTIVE) {
            return freezeComposite({ accepted: true, changed: false, reason: "participant-already-active" });
        }
        this.participants.set(playerId, PARTICIPANT_STATUS.ACTIVE);
        this.emit("boss-participant-recovered", { playerId, attempt: this.attempt });
        return freezeComposite({ accepted: true, changed: true });
    }

    applyHazardContact({ contactId, playerId, damage }) {
        if (this.status !== STAGE_STATUS.ACTIVE || this.participants.get(playerId) !== PARTICIPANT_STATUS.ACTIVE) {
            return freezeComposite({ accepted: false, changed: false, reason: "participant-not-active", damage: 0 });
        }
        if (this.processedHazardContactIds.has(contactId)) {
            return freezeComposite({ accepted: true, changed: false, reason: "contact-already-processed", damage: 0 });
        }
        this.processedHazardContactIds.add(contactId);
        this.emit("boss-player-contact", { contactId, playerId, damage });
        return freezeComposite({ accepted: true, changed: true, damage });
    }

    hasHazardContact(contactId) {
        return typeof contactId === "string" && this.processedHazardContactIds.has(contactId);
    }

    handlePlayerDefeat(playerId, cause = "unknown") {
        if (this.status !== STAGE_STATUS.ACTIVE || this.participants.get(playerId) !== PARTICIPANT_STATUS.ACTIVE) {
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "participant-not-active",
                retryStarted: false
            });
        }
        this.emit("boss-participant-defeated", { playerId, cause, attempt: this.attempt });
        if (this.definition.participantDefeatPolicy === INDIVIDUAL_RESPAWN_POLICY) {
            return freezeComposite({
                accepted: true,
                changed: true,
                retryStarted: false,
                individualRespawn: true,
                attempt: this.attempt
            });
        }
        this.participants.set(playerId, PARTICIPANT_STATUS.SPECTATING);
        const connected = [...this.participants.values()].filter(
            (status) => status !== PARTICIPANT_STATUS.DISCONNECTED
        );
        const retryStarted =
            connected.length > 0 && connected.every((status) => status === PARTICIPANT_STATUS.SPECTATING);
        if (retryStarted) {
            this.attempt += 1;
            for (const [id, status] of this.participants) {
                if (status !== PARTICIPANT_STATUS.DISCONNECTED) this.participants.set(id, PARTICIPANT_STATUS.ACTIVE);
            }
            this.processedHazardContactIds.clear();
            this.resetAttempt({ preserveCompleted: true });
            this.emit("boss-attempt-started", { attempt: this.attempt, health: this.totalHealth() });
        }
        return freezeComposite({ accepted: true, changed: true, retryStarted, attempt: this.attempt });
    }

    drainEvents() {
        const events = Object.freeze(this.events);
        this.events = [];
        return events;
    }

    baseSnapshot(extra = {}) {
        return freezeComposite({
            snapshotRevision: COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION,
            specRevision: this.definition.revision,
            stageId: this.definition.id,
            encounterId: this.definition.id,
            name: this.definition.name,
            status: this.status,
            attempt: this.attempt,
            phaseCount: this.definition.phases.length,
            maxHealth: this.maximumHealth(),
            currentHealth: this.totalHealth(),
            health: this.totalHealth(),
            scalingRoster: this.scalingRoster,
            participantStates: [...this.participants.entries()].map(([playerId, status]) => ({ playerId, status })),
            processedImpactIds: [...this.processedImpactIds].sort(),
            processedHazardContactIds: [...this.processedHazardContactIds].sort(),
            eventSequence: this.eventSequence,
            hudSpec: this.definition.bossHud,
            ...extra
        });
    }

    restoreBase(snapshot) {
        if (!snapshot || snapshot.snapshotRevision !== COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION) {
            throw new Error("Composite Boss snapshot revision mismatch");
        }
        if (snapshot.stageId !== this.definition.id || snapshot.specRevision !== this.definition.revision) {
            throw new Error("Composite Boss snapshot definition mismatch");
        }
        if (!Object.values(STAGE_STATUS).includes(snapshot.status)) throw new Error("Composite Boss status is invalid");
        if (!Array.isArray(snapshot.participantStates))
            throw new Error("Composite Boss participant states are invalid");
        const participantIds = new Set();
        for (const participant of snapshot.participantStates) {
            if (
                typeof participant?.playerId !== "string" ||
                !participant.playerId ||
                participantIds.has(participant.playerId) ||
                VALID_PARTICIPANT_STATUS[participant.status] !== true
            ) {
                throw new Error("Composite Boss participant state is invalid");
            }
            participantIds.add(participant.playerId);
        }
        this.status = snapshot.status;
        this.attempt = snapshot.attempt;
        this.scalingRoster = Object.freeze([...(snapshot.scalingRoster ?? [])]);
        this.participants = new Map(snapshot.participantStates.map(({ playerId, status }) => [playerId, status]));
        this.processedImpactIds = new Set(snapshot.processedImpactIds ?? []);
        this.processedHazardContactIds = new Set(snapshot.processedHazardContactIds ?? []);
        this.eventSequence = snapshot.eventSequence ?? 0;
        this.events = [];
    }
}
