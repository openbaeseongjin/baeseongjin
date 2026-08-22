import { BossStageDefinition, defineBossStage } from "./BossStageDefinition.js";
import { createBossMechanismRuntime } from "./BossMechanismRuntimeFactory.js";

export const BOSS_STAGE_SNAPSHOT_REVISION = "boss-stage-runtime-v2";

const STAGE_STATUS = Object.freeze({ INACTIVE: "inactive", ACTIVE: "active", COMPLETED: "completed" });
const PARTICIPANT_STATUS = Object.freeze({ ACTIVE: "active", SPECTATING: "spectating", DISCONNECTED: "disconnected" });
const VALID_STAGE_STATUSES = new Set(Object.values(STAGE_STATUS));
const VALID_PARTICIPANT_STATUSES = new Set(Object.values(PARTICIPANT_STATUS));

function freeze(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freeze(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freeze(entry)])));
}

function requireId(value, label) {
    if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
    return value;
}

function normalizedParticipantIds(participantIds) {
    if (!Array.isArray(participantIds)) throw new Error("Boss participantIds must be an array");
    const ids = participantIds.map((id) => requireId(id, "Boss participantId"));
    if (new Set(ids).size !== ids.length) throw new Error("Boss participantIds must be unique");
    return Object.freeze([...ids].sort());
}

export class BossEncounterRuntime {
    constructor(definition, snapshot = null) {
        this.definition = definition instanceof BossStageDefinition ? definition : defineBossStage(definition);
        this.status = STAGE_STATUS.INACTIVE;
        this.attempt = 0;
        this.phaseIndex = 0;
        this.health = 0;
        this.scalingRoster = Object.freeze([]);
        this.scaledHealth = null;
        this.participants = new Map();
        this.eventSequence = 0;
        this.processedImpactIds = new Set();
        this.processedHazardContactIds = new Set();
        this.events = [];
        this.mechanism = createBossMechanismRuntime(this.definition);
        if (snapshot) this.restore(snapshot);
    }

    #emit(eventType, payload = {}) {
        this.eventSequence += 1;
        const event = freeze({
            eventId: `${this.definition.id}:event:${this.eventSequence}`,
            eventType,
            sequence: this.eventSequence,
            ...payload
        });
        this.events.push(event);
        return event;
    }

    #resetAttempt() {
        this.attempt += 1;
        this.phaseIndex = 0;
        this.health = this.scaledHealth.maxHealth;
        this.mechanism.reset(0);
        for (const [playerId, status] of this.participants) {
            if (status !== PARTICIPANT_STATUS.DISCONNECTED) this.participants.set(playerId, PARTICIPANT_STATUS.ACTIVE);
        }
        this.#emit("boss-attempt-started", {
            attempt: this.attempt,
            phase: 1,
            health: this.health,
            maxHealth: this.scaledHealth.maxHealth
        });
    }

    start({ participantIds }) {
        if (this.status !== STAGE_STATUS.INACTIVE) {
            return freeze({ accepted: false, changed: false, reason: "encounter-already-started" });
        }
        const ids = normalizedParticipantIds(participantIds);
        this.scaledHealth = this.definition.scaledHealth(ids.length);
        this.scalingRoster = ids;
        this.participants = new Map(ids.map((playerId) => [playerId, PARTICIPANT_STATUS.ACTIVE]));
        this.status = STAGE_STATUS.ACTIVE;
        this.attempt = 1;
        this.phaseIndex = 0;
        this.health = this.scaledHealth.maxHealth;
        this.mechanism.reset(0);
        this.#emit("boss-encounter-started", {
            attempt: this.attempt,
            participantIds: ids,
            health: this.health,
            maxHealth: this.scaledHealth.maxHealth
        });
        return freeze({ accepted: true, changed: true, attempt: this.attempt, maxHealth: this.health });
    }

    addParticipant(playerId) {
        requireId(playerId, "Boss participantId");
        if (this.status !== STAGE_STATUS.ACTIVE) {
            return freeze({ accepted: false, changed: false, reason: "encounter-not-active" });
        }
        const previous = this.participants.get(playerId);
        this.participants.set(playerId, PARTICIPANT_STATUS.ACTIVE);
        if (previous === PARTICIPANT_STATUS.ACTIVE) {
            return freeze({ accepted: true, changed: false, reason: "participant-already-active" });
        }
        this.#emit("boss-participant-joined", { playerId, attempt: this.attempt, scalingChanged: false });
        return freeze({ accepted: true, changed: true, scalingChanged: false });
    }

    removeParticipant(playerId) {
        requireId(playerId, "Boss participantId");
        if (!this.participants.has(playerId)) {
            return freeze({ accepted: false, changed: false, reason: "participant-unknown" });
        }
        if (this.participants.get(playerId) === PARTICIPANT_STATUS.DISCONNECTED) {
            return freeze({ accepted: true, changed: false, reason: "participant-already-disconnected" });
        }
        this.participants.set(playerId, PARTICIPANT_STATUS.DISCONNECTED);
        this.#emit("boss-participant-left", { playerId, attempt: this.attempt, scalingChanged: false });
        return freeze({ accepted: true, changed: true, scalingChanged: false });
    }

    applyImpact({ impactId, sourcePlayerId = null, baseDamage, targetId = null }) {
        requireId(impactId, "Boss impactId");
        if (sourcePlayerId !== null) requireId(sourcePlayerId, "Boss sourcePlayerId");
        if (targetId !== null) requireId(targetId, "Boss targetId");
        if (!Number.isFinite(baseDamage) || baseDamage < 0) throw new Error("Boss baseDamage must be non-negative");
        if (this.status !== STAGE_STATUS.ACTIVE) {
            return freeze({ accepted: false, changed: false, reason: "encounter-not-active", appliedDamage: 0 });
        }
        if (sourcePlayerId !== null && this.participants.get(sourcePlayerId) !== PARTICIPANT_STATUS.ACTIVE) {
            return freeze({ accepted: false, changed: false, reason: "participant-not-active", appliedDamage: 0 });
        }
        if (this.mechanism.isCombatActive?.() === false) {
            return freeze({ accepted: false, changed: false, reason: "phase-transition-active", appliedDamage: 0 });
        }
        if (this.processedImpactIds.has(impactId)) {
            return freeze({ accepted: true, changed: false, reason: "impact-already-processed", appliedDamage: 0 });
        }
        this.processedImpactIds.add(impactId);
        const weakpointHit = targetId !== null && this.mechanism.isWeakpointActive(targetId);
        const normalDamage =
            baseDamage *
            (weakpointHit ? this.definition.weakNormalDamageMultiplier : this.definition.closedBodyDamageMultiplier);
        const weakBonus = weakpointHit
            ? this.scaledHealth.phaseHealths[this.phaseIndex] * this.definition.weakFixedPercent
            : 0;
        const requestedDamage = normalDamage + weakBonus;
        if (requestedDamage <= 0) {
            return freeze({
                accepted: true,
                changed: false,
                appliedDamage: 0,
                normalDamage,
                weakpointHit,
                weakBonus
            });
        }
        const phaseFloor = this.scaledHealth.phaseFloors[this.phaseIndex];
        const appliedDamage = Math.min(requestedDamage, this.health - phaseFloor);
        this.health = Math.max(phaseFloor, this.health - appliedDamage);
        this.#emit("boss-damaged", {
            impactId,
            sourcePlayerId,
            targetId,
            phase: this.phaseIndex + 1,
            baseDamage,
            normalDamage,
            weakBonus,
            damage: appliedDamage,
            health: this.health
        });
        if (this.health > phaseFloor) {
            return freeze({
                accepted: true,
                changed: true,
                appliedDamage,
                normalDamage,
                weakpointHit,
                weakBonus,
                completed: false
            });
        }
        if (phaseFloor === 0) {
            this.status = STAGE_STATUS.COMPLETED;
            this.mechanism.stop();
            this.#emit("boss-encounter-completed", { impactId, sourcePlayerId, attempt: this.attempt });
            return freeze({
                accepted: true,
                changed: true,
                appliedDamage,
                normalDamage,
                weakpointHit,
                weakBonus,
                completed: true
            });
        }
        const completedPhase = this.phaseIndex + 1;
        this.phaseIndex += 1;
        const mechanismTransition = this.mechanism.completePhase(this.phaseIndex);
        if (mechanismTransition.eventType) this.#emit(mechanismTransition.eventType, { phase: this.phaseIndex + 1 });
        this.#emit("boss-phase-completed", { completedPhase, nextPhase: this.phaseIndex + 1 });
        return freeze({
            accepted: true,
            changed: true,
            appliedDamage,
            normalDamage,
            weakpointHit,
            weakBonus,
            completed: false,
            completedPhase
        });
    }

    applyDamage({ sourcePlayerId = null, damage, impactId = null, targetId = null }) {
        return this.applyImpact({
            impactId: impactId ?? `${this.definition.id}:legacy-impact:${this.eventSequence + 1}`,
            sourcePlayerId,
            baseDamage: damage,
            targetId
        });
    }

    interactBreaker() {
        return freeze({ accepted: false, changed: false, reason: "boss-mechanic-not-interactive" });
    }

    advance(dt, context = null) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("BossEncounterRuntime dt must be non-negative");
        if (this.status !== STAGE_STATUS.ACTIVE || dt === 0) {
            return freeze({ accepted: this.status === STAGE_STATUS.ACTIVE, changed: false });
        }
        const outcome = this.mechanism.advance(dt, context);
        if (outcome.eventType) {
            this.#emit(outcome.eventType, {
                phase: this.phaseIndex + 1,
                targetId: this.mechanism.snapshot().activeTargetId
            });
        }
        return freeze({ accepted: true, changed: outcome.changed });
    }

    handlePlayerDefeat(playerId, cause = "unknown") {
        requireId(playerId, "Boss participantId");
        requireId(cause, "Boss defeat cause");
        if (this.status !== STAGE_STATUS.ACTIVE) {
            return freeze({ accepted: false, changed: false, reason: "encounter-not-active", retryStarted: false });
        }
        const status = this.participants.get(playerId);
        if (!status)
            return freeze({ accepted: false, changed: false, reason: "participant-unknown", retryStarted: false });
        if (status !== PARTICIPANT_STATUS.ACTIVE) {
            return freeze({ accepted: true, changed: false, reason: "participant-not-active", retryStarted: false });
        }
        this.participants.set(playerId, PARTICIPANT_STATUS.SPECTATING);
        this.#emit("boss-participant-defeated", { playerId, cause, attempt: this.attempt });
        const connected = [...this.participants.values()].filter((value) => value !== PARTICIPANT_STATUS.DISCONNECTED);
        const retryStarted =
            connected.length > 0 && connected.every((value) => value === PARTICIPANT_STATUS.SPECTATING);
        if (retryStarted) this.#resetAttempt();
        return freeze({ accepted: true, changed: true, retryStarted, attempt: this.attempt });
    }

    applyHazardContact({ contactId, playerId, damage }) {
        requireId(contactId, "Boss hazard contactId");
        requireId(playerId, "Boss hazard playerId");
        if (!Number.isFinite(damage) || damage <= 0) throw new Error("Boss hazard damage must be positive");
        if (this.status !== STAGE_STATUS.ACTIVE) {
            return freeze({ accepted: false, changed: false, reason: "encounter-not-active", damage: 0 });
        }
        if (this.participants.get(playerId) !== PARTICIPANT_STATUS.ACTIVE) {
            return freeze({ accepted: false, changed: false, reason: "participant-not-active", damage: 0 });
        }
        if (this.processedHazardContactIds.has(contactId)) {
            return freeze({ accepted: true, changed: false, reason: "contact-already-processed", damage: 0 });
        }
        this.processedHazardContactIds.add(contactId);
        this.#emit("boss-player-contact", { contactId, playerId, damage, phase: this.phaseIndex + 1 });
        return freeze({ accepted: true, changed: true, damage });
    }

    hasHazardContact(contactId) {
        return this.processedHazardContactIds.has(contactId);
    }

    drainEvents() {
        const events = Object.freeze(this.events);
        this.events = [];
        return events;
    }

    snapshot() {
        const phase = this.definition.phases[this.phaseIndex];
        const mechanism = this.mechanism.snapshot();
        const persistentWeakpoint =
            mechanism.persistentWeakpoint === true || (this.phaseIndex === 2 && mechanism.beamFailed === true);
        return freeze({
            snapshotRevision: BOSS_STAGE_SNAPSHOT_REVISION,
            specRevision: this.definition.revision,
            stageId: this.definition.id,
            encounterId: this.definition.id,
            name: this.definition.name,
            status: this.status,
            attempt: this.attempt,
            phase: this.phaseIndex + 1,
            phaseCount: this.definition.phases.length,
            currentHealth: this.health,
            health: this.health,
            maxHealth: this.scaledHealth?.maxHealth ?? 0,
            phaseHealths: this.scaledHealth?.phaseHealths ?? Object.freeze([]),
            phaseFloors: this.scaledHealth?.phaseFloors ?? Object.freeze([]),
            weakFixedPercent: this.definition.weakFixedPercent,
            weakNormalDamageMultiplier: this.definition.weakNormalDamageMultiplier,
            closedBodyDamageMultiplier: this.definition.closedBodyDamageMultiplier,
            scalingRoster: this.scalingRoster,
            participantStates: [...this.participants.entries()].map(([playerId, status]) => ({ playerId, status })),
            processedImpactIds: [...this.processedImpactIds].sort(),
            processedHazardContactIds: [...this.processedHazardContactIds].sort(),
            currentTargetId: this.status === STAGE_STATUS.ACTIVE ? phase.weakTargetId : null,
            currentObjective: this.status === STAGE_STATUS.ACTIVE ? (phase.objective ?? null) : null,
            phaseTransitioning: this.mechanism.isCombatActive?.() === false && this.status === STAGE_STATUS.ACTIVE,
            vulnerability: {
                active: mechanism.weakpointExposed,
                targetId: mechanism.activeTargetId,
                remainingSeconds: mechanism.weakpointExposed && !persistentWeakpoint ? mechanism.remainingSeconds : 0
            },
            mechanism,
            hudSpec: this.definition.bossHud,
            eventSequence: this.eventSequence
        });
    }

    restore(snapshot) {
        if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
            throw new Error("Boss Stage snapshot must be an object");
        }
        if (snapshot.snapshotRevision !== BOSS_STAGE_SNAPSHOT_REVISION) {
            throw new Error("Boss Stage snapshot revision mismatch");
        }
        if (snapshot.specRevision !== this.definition.revision) throw new Error("Boss Stage spec revision mismatch");
        if ((snapshot.stageId ?? snapshot.encounterId) !== this.definition.id)
            throw new Error("Boss Stage ID mismatch");
        if (!VALID_STAGE_STATUSES.has(snapshot.status)) throw new Error("Boss Stage status is invalid");
        if (!Number.isSafeInteger(snapshot.attempt) || snapshot.attempt < 0) throw new Error("Boss attempt is invalid");
        if (
            !Number.isSafeInteger(snapshot.phase) ||
            snapshot.phase < 1 ||
            snapshot.phase > this.definition.phases.length
        ) {
            throw new Error("Boss phase is invalid");
        }
        const scalingRoster = normalizedParticipantIds(snapshot.scalingRoster ?? []);
        const scaledHealth = scalingRoster.length > 0 ? this.definition.scaledHealth(scalingRoster.length) : null;
        if (snapshot.status !== STAGE_STATUS.INACTIVE && !scaledHealth)
            throw new Error("Boss scaling roster is missing");
        if (scaledHealth && snapshot.maxHealth !== scaledHealth.maxHealth)
            throw new Error("Boss maxHealth is inconsistent");
        if (
            !Number.isFinite(snapshot.currentHealth) ||
            snapshot.currentHealth < 0 ||
            snapshot.currentHealth > (scaledHealth?.maxHealth ?? 0)
        ) {
            throw new Error("Boss currentHealth is invalid");
        }
        const phaseIndex = snapshot.phase - 1;
        if (scaledHealth) {
            const floor = scaledHealth.phaseFloors[phaseIndex];
            const ceiling = floor + scaledHealth.phaseHealths[phaseIndex];
            if (snapshot.currentHealth < floor || snapshot.currentHealth > ceiling) {
                throw new Error("Boss phase and health disagree");
            }
        }
        if (!Array.isArray(snapshot.participantStates)) throw new Error("Boss participantStates must be an array");
        const participants = new Map();
        for (const entry of snapshot.participantStates) {
            requireId(entry?.playerId, "Boss participant state playerId");
            if (participants.has(entry.playerId)) throw new Error("Boss participant state IDs must be unique");
            if (!VALID_PARTICIPANT_STATUSES.has(entry.status)) throw new Error("Boss participant status is invalid");
            participants.set(entry.playerId, entry.status);
        }
        if (!Number.isSafeInteger(snapshot.eventSequence) || snapshot.eventSequence < 0) {
            throw new Error("Boss eventSequence is invalid");
        }
        if (!Array.isArray(snapshot.processedImpactIds)) throw new Error("Boss processedImpactIds must be an array");
        const processedImpactIds = new Set(
            snapshot.processedImpactIds.map((impactId) => requireId(impactId, "Boss processed impactId"))
        );
        if (processedImpactIds.size !== snapshot.processedImpactIds.length) {
            throw new Error("Boss processedImpactIds must be unique");
        }
        if (!Array.isArray(snapshot.processedHazardContactIds)) {
            throw new Error("Boss processedHazardContactIds must be an array");
        }
        const processedHazardContactIds = new Set(
            snapshot.processedHazardContactIds.map((contactId) =>
                requireId(contactId, "Boss processed hazard contactId")
            )
        );
        if (processedHazardContactIds.size !== snapshot.processedHazardContactIds.length) {
            throw new Error("Boss processedHazardContactIds must be unique");
        }
        this.status = snapshot.status;
        this.attempt = snapshot.attempt;
        this.phaseIndex = phaseIndex;
        this.health = snapshot.currentHealth;
        this.scalingRoster = scalingRoster;
        this.scaledHealth = scaledHealth;
        this.participants = participants;
        this.eventSequence = snapshot.eventSequence;
        this.processedImpactIds = processedImpactIds;
        this.processedHazardContactIds = processedHazardContactIds;
        this.events = [];
        this.mechanism.reset(phaseIndex);
        this.mechanism.restore(snapshot.mechanism);
        return this;
    }
}

export const BossStageRuntime = BossEncounterRuntime;
