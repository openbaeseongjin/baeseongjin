function freezeResult(result) {
    return Object.freeze(result);
}

function sortedIds(values, order) {
    return Object.freeze([...values].sort((left, right) => order.get(left) - order.get(right)));
}

export class WorldProgressState {
    constructor(catalog, snapshot = null, { startAreaId = null } = {}) {
        if (!catalog?.areas?.length) throw new Error("WorldProgressState requires at least one authored area");

        this.catalog = catalog;
        this.areasById = new Map(catalog.areas.map((area) => [area.id, area]));
        this.objectivesById = new Map();
        this.gatesById = new Map();
        this.idOrder = new Map();

        let order = 0;
        for (const area of catalog.areas) {
            for (const objective of area.objectives) {
                this.objectivesById.set(objective.id, { areaId: area.id, objective });
                this.idOrder.set(objective.id, order++);
            }
            this.gatesById.set(area.gate.id, { areaId: area.id, gate: area.gate });
            this.idOrder.set(area.gate.id, order++);
        }

        this.currentAreaId = startAreaId && this.areasById.has(startAreaId) ? startAreaId : catalog.areas[0].id;
        this.completedObjectiveIds = new Set();
        this.unlockedGateIds = new Set();
        this.crossedGateIds = new Set();
        this.activeObjectiveSequences = new Map();
        this.completed = false;
        this.contentBoundaryReached = false;

        this.#unlockSatisfiedGate(this.currentAreaId);
        if (snapshot) this.restore(snapshot);
    }

    #area(areaId) {
        return this.areasById.get(areaId);
    }

    #unlockSatisfiedGate(areaId) {
        const area = this.#area(areaId);
        if (!area) return false;
        const satisfied = area.gate.requiredObjectiveIds.every((id) => this.completedObjectiveIds.has(id));
        if (!satisfied || this.unlockedGateIds.has(area.gate.id)) return false;
        this.unlockedGateIds.add(area.gate.id);
        return true;
    }

    completeObjective(objectiveId) {
        const record = this.objectivesById.get(objectiveId);
        if (!record) return freezeResult({ accepted: false, changed: false, reason: "objective-unknown" });
        if (record.areaId !== this.currentAreaId) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-not-current" });
        }
        if (this.completedObjectiveIds.has(objectiveId)) {
            return freezeResult({ accepted: true, changed: false, reason: "objective-already-complete" });
        }
        const requiredObjectiveIds = record.objective.requiredObjectiveIds ?? [];
        if (requiredObjectiveIds.some((id) => !this.completedObjectiveIds.has(id))) {
            return freezeResult({
                accepted: false,
                changed: false,
                reason: "objective-blocked",
                requiredObjectiveIds
            });
        }

        this.completedObjectiveIds.add(objectiveId);
        this.activeObjectiveSequences.delete(objectiveId);
        const gateUnlocked = this.#unlockSatisfiedGate(record.areaId);
        const area = this.#area(record.areaId);
        return freezeResult({
            accepted: true,
            changed: true,
            objectiveId,
            gateId: gateUnlocked ? area.gate.id : null,
            gateUnlocked
        });
    }

    startObjectiveSequence(objectiveId, { playerId, durationSeconds }) {
        const record = this.objectivesById.get(objectiveId);
        if (!record) return freezeResult({ accepted: false, changed: false, reason: "objective-unknown" });
        if (record.areaId !== this.currentAreaId) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-not-current" });
        }
        if (this.completedObjectiveIds.has(objectiveId)) {
            return freezeResult({ accepted: true, changed: false, reason: "objective-already-complete" });
        }
        const existing = this.activeObjectiveSequences.get(objectiveId);
        if (existing) {
            return freezeResult({
                accepted: true,
                changed: false,
                reason: "objective-sequence-active",
                sequence: existing
            });
        }
        const requiredObjectiveIds = record.objective.requiredObjectiveIds ?? [];
        if (requiredObjectiveIds.some((id) => !this.completedObjectiveIds.has(id))) {
            return freezeResult({
                accepted: false,
                changed: false,
                reason: "objective-blocked",
                requiredObjectiveIds
            });
        }
        if (typeof playerId !== "string" || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-sequence-invalid" });
        }
        const sequence = Object.freeze({ objectiveId, playerId, durationSeconds, remainingSeconds: durationSeconds });
        this.activeObjectiveSequences.set(objectiveId, sequence);
        return freezeResult({ accepted: true, changed: true, sequence });
    }

    advanceObjectiveSequence(objectiveId, dt) {
        const sequence = this.activeObjectiveSequences.get(objectiveId);
        if (!sequence) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-sequence-missing" });
        }
        if (!Number.isFinite(dt) || dt < 0) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-sequence-dt" });
        }
        const remainingSeconds = Math.max(0, sequence.remainingSeconds - dt);
        if (remainingSeconds > 0) {
            const updated = Object.freeze({ ...sequence, remainingSeconds });
            this.activeObjectiveSequences.set(objectiveId, updated);
            return freezeResult({ accepted: true, changed: dt > 0, sequenceCompleted: false, sequence: updated });
        }
        this.activeObjectiveSequences.delete(objectiveId);
        const completion = this.completeObjective(objectiveId);
        return freezeResult({
            ...completion,
            sequenceCompleted: completion.changed,
            playerId: sequence.playerId,
            durationSeconds: sequence.durationSeconds,
            remainingSeconds: 0
        });
    }

    objectiveSequence(objectiveId) {
        return this.activeObjectiveSequences.get(objectiveId) ?? null;
    }

    crossGate(gateId) {
        const record = this.gatesById.get(gateId);
        if (!record) return freezeResult({ accepted: false, changed: false, reason: "gate-unknown" });
        if (this.crossedGateIds.has(gateId)) {
            return freezeResult({ accepted: true, changed: false, reason: "gate-already-crossed" });
        }
        if (record.areaId !== this.currentAreaId) {
            return freezeResult({ accepted: false, changed: false, reason: "gate-not-current" });
        }
        if (!this.unlockedGateIds.has(gateId)) {
            return freezeResult({ accepted: false, changed: false, reason: "gate-locked" });
        }
        this.crossedGateIds.add(gateId);
        const previousAreaId = this.currentAreaId;
        if (record.gate.nextAreaId === null) {
            if (record.gate.completionMode === "content-boundary") this.contentBoundaryReached = true;
            else this.completed = true;
        } else {
            this.currentAreaId = record.gate.nextAreaId;
            this.#unlockSatisfiedGate(this.currentAreaId);
        }
        return freezeResult({
            accepted: true,
            changed: true,
            gateId,
            previousAreaId,
            currentAreaId: this.currentAreaId,
            worldCompleted: this.completed,
            contentBoundaryReached: this.contentBoundaryReached
        });
    }

    isObjectiveComplete(objectiveId) {
        return this.completedObjectiveIds.has(objectiveId);
    }

    isGateUnlocked(gateId) {
        return this.unlockedGateIds.has(gateId);
    }

    isGateCrossed(gateId) {
        return this.crossedGateIds.has(gateId);
    }

    snapshot() {
        return Object.freeze({
            currentAreaId: this.currentAreaId,
            completedObjectiveIds: sortedIds(this.completedObjectiveIds, this.idOrder),
            unlockedGateIds: sortedIds(this.unlockedGateIds, this.idOrder),
            crossedGateIds: sortedIds(this.crossedGateIds, this.idOrder),
            activeObjectiveSequences: Object.freeze(
                [...this.activeObjectiveSequences.values()]
                    .sort((left, right) => this.idOrder.get(left.objectiveId) - this.idOrder.get(right.objectiveId))
                    .map((sequence) => Object.freeze({ ...sequence }))
            ),
            completed: this.completed,
            contentBoundaryReached: this.contentBoundaryReached
        });
    }

    restore(snapshot) {
        if (!this.areasById.has(snapshot?.currentAreaId)) throw new Error("Unknown current area in progress snapshot");
        const completedObjectiveIds = new Set(snapshot.completedObjectiveIds ?? []);
        const unlockedGateIds = new Set(snapshot.unlockedGateIds ?? []);
        const crossedGateIds = new Set(snapshot.crossedGateIds ?? []);
        const activeObjectiveSequences = new Map();

        for (const id of completedObjectiveIds) {
            if (!this.objectivesById.has(id)) throw new Error(`Unknown objective '${id}' in progress snapshot`);
        }
        for (const id of completedObjectiveIds) {
            const requiredObjectiveIds = this.objectivesById.get(id).objective.requiredObjectiveIds ?? [];
            if (requiredObjectiveIds.some((requiredId) => !completedObjectiveIds.has(requiredId))) {
                throw new Error(`Completed objective '${id}' requires its prerequisite objectives`);
            }
        }
        for (const id of unlockedGateIds) {
            if (!this.gatesById.has(id)) throw new Error(`Unknown gate '${id}' in progress snapshot`);
        }
        for (const id of crossedGateIds) {
            if (!this.gatesById.has(id)) throw new Error(`Unknown crossed gate '${id}' in progress snapshot`);
            if (!unlockedGateIds.has(id)) throw new Error(`Crossed gate '${id}' must also be unlocked`);
        }
        for (const sequence of snapshot.activeObjectiveSequences ?? []) {
            const record = this.objectivesById.get(sequence?.objectiveId);
            if (!record) throw new Error(`Unknown objective sequence '${sequence?.objectiveId}' in progress snapshot`);
            if (activeObjectiveSequences.has(sequence.objectiveId)) {
                throw new Error(`Duplicate objective sequence '${sequence.objectiveId}' in progress snapshot`);
            }
            if (record.areaId !== snapshot.currentAreaId || completedObjectiveIds.has(sequence.objectiveId)) {
                throw new Error(`Objective sequence '${sequence.objectiveId}' must be active in the current area`);
            }
            const requiredObjectiveIds = record.objective.requiredObjectiveIds ?? [];
            if (requiredObjectiveIds.some((requiredId) => !completedObjectiveIds.has(requiredId))) {
                throw new Error(`Objective sequence '${sequence.objectiveId}' requires its prerequisite objectives`);
            }
            if (
                typeof sequence.playerId !== "string" ||
                !Number.isFinite(sequence.durationSeconds) ||
                sequence.durationSeconds <= 0 ||
                !Number.isFinite(sequence.remainingSeconds) ||
                sequence.remainingSeconds <= 0 ||
                sequence.remainingSeconds > sequence.durationSeconds
            ) {
                throw new Error(`Objective sequence '${sequence.objectiveId}' has invalid timing state`);
            }
            activeObjectiveSequences.set(sequence.objectiveId, Object.freeze({ ...sequence }));
        }

        for (const [gateId, { areaId, gate }] of this.gatesById.entries()) {
            const satisfied = gate.requiredObjectiveIds.every((id) => completedObjectiveIds.has(id));
            if (unlockedGateIds.has(gateId) !== satisfied) {
                throw new Error(`Gate '${gateId}' unlock state does not match its objectives`);
            }
            const areaOrder = this.#area(areaId).order;
            const currentOrder = this.#area(snapshot.currentAreaId).order;
            if (crossedGateIds.has(gateId) && areaOrder > currentOrder) {
                throw new Error(`Gate '${gateId}' cannot be crossed after the current area`);
            }
        }
        const finalGate = this.catalog.areas.at(-1).gate;
        const finalGateCrossed = crossedGateIds.has(finalGate.id);
        const contentBoundaryReached = Boolean(snapshot.contentBoundaryReached);
        if (finalGate.completionMode === "content-boundary") {
            if (Boolean(snapshot.completed)) {
                throw new Error("Content-boundary progress snapshot cannot mark the world completed");
            }
            if (contentBoundaryReached !== finalGateCrossed) {
                throw new Error("Content-boundary progress snapshot must match the final Gate state");
            }
        } else {
            if (contentBoundaryReached) {
                throw new Error("Completed progress snapshot cannot mark a content boundary");
            }
            if (Boolean(snapshot.completed) !== finalGateCrossed) {
                throw new Error("Completed progress snapshot must match the final Gate state");
            }
        }

        this.currentAreaId = snapshot.currentAreaId;
        this.completedObjectiveIds = completedObjectiveIds;
        this.unlockedGateIds = unlockedGateIds;
        this.crossedGateIds = crossedGateIds;
        this.activeObjectiveSequences = activeObjectiveSequences;
        this.completed = Boolean(snapshot.completed);
        this.contentBoundaryReached = contentBoundaryReached;
        return this.snapshot();
    }
}
