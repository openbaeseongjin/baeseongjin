function freezeResult(value) {
    return Object.freeze(value);
}

function sortedIds(values, order) {
    return Object.freeze([...values].sort((left, right) => order.get(left) - order.get(right)));
}

function requireSnapshotArray(value, label) {
    if (!Array.isArray(value) || value.some((id) => typeof id !== "string")) {
        throw new Error(`${label} must be an array of ids`);
    }
    return value;
}

export class SectorProgressState {
    constructor(world, snapshot = null) {
        if (!world?.sectors?.length || !world?.landmarks?.length) {
            throw new Error("SectorProgressState requires a seamless Sector world");
        }
        this.world = world;
        this.sectorsById = new Map(world.sectors.map((sector) => [sector.id, sector]));
        this.landmarksById = new Map(world.landmarks.map((landmark) => [landmark.id, landmark]));
        this.objectivesById = new Map(world.objectives.map((objective) => [objective.id, objective]));
        this.encountersById = new Map(world.enemySpawns.map((encounter) => [encounter.encounterId, encounter]));
        this.routesById = new Map(world.routeLocks.map((route) => [route.id, route]));
        this.accessModulesById = new Map((world.accessModules ?? []).map((module) => [module.id, module]));
        this.respawnAnchorsById = new Map((world.respawnAnchors ?? []).map((anchor) => [anchor.id, anchor]));
        this.idOrder = new Map();
        let order = 0;
        for (const sector of world.sectors) {
            for (const landmarkId of sector.landmarkIds) {
                const landmark = this.landmarksById.get(landmarkId);
                this.idOrder.set(landmarkId, order++);
                for (const objectiveId of landmark.objectiveIds) this.idOrder.set(objectiveId, order++);
                for (const encounterId of landmark.encounterIds) this.idOrder.set(encounterId, order++);
                if (landmark.outboundRouteId) this.idOrder.set(landmark.outboundRouteId, order++);
            }
        }
        for (const accessModule of world.accessModules ?? []) this.idOrder.set(accessModule.id, order++);
        const firstSector = world.sectors[0];
        this.currentSectorId = firstSector.id;
        this.currentLandmarkId = firstSector.entryLandmarkId;
        this.respawnAnchorId = this.#landmark().respawnAnchorId ?? firstSector.respawnAnchorId;
        this.completedObjectiveIds = new Set();
        this.resolvedEncounterIds = new Set();
        this.collectedAccessModuleIds = new Set();
        this.unlockedRouteIds = new Set();
        this.visitedLandmarkIds = new Set([this.currentLandmarkId]);
        this.activeObjectiveSequences = new Map();
        this.sectorBaselineRevision = 0;
        this.contentBoundaryReached = false;
        this.#unlockSatisfiedRoutes();
        if (snapshot) this.restore(snapshot);
    }

    #sector(sectorId = this.currentSectorId) {
        return this.sectorsById.get(sectorId);
    }

    #landmark(landmarkId = this.currentLandmarkId) {
        return this.landmarksById.get(landmarkId);
    }

    #routeTouchesSector(route, sectorId) {
        return (
            this.#landmark(route.sourceLandmarkId)?.sectorId === sectorId ||
            this.#landmark(route.targetLandmarkId)?.sectorId === sectorId
        );
    }

    #routeAccessReady(route) {
        if (!route.requiredAccessModuleCount) return true;
        const sourceSectorId = this.#landmark(route.sourceLandmarkId)?.sectorId;
        const collected = [...this.collectedAccessModuleIds].filter(
            (id) => this.accessModulesById.get(id)?.sectorId === sourceSectorId
        );
        return collected.length >= route.requiredAccessModuleCount;
    }

    #unlockSatisfiedRoutes() {
        for (const route of this.world.routeLocks) {
            if (this.unlockedRouteIds.has(route.id)) continue;
            if (
                route.requiredObjectiveIds.every((id) => this.completedObjectiveIds.has(id)) &&
                this.#routeAccessReady(route)
            ) {
                this.unlockedRouteIds.add(route.id);
            }
        }
    }

    completeObjective(objectiveId) {
        const objective = this.objectivesById.get(objectiveId);
        if (!objective) return freezeResult({ accepted: false, changed: false, reason: "objective-unknown" });
        const landmark = this.#landmark(objective.landmarkId);
        if (landmark?.sectorId !== this.currentSectorId) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-not-current-sector" });
        }
        if (this.completedObjectiveIds.has(objectiveId)) {
            return freezeResult({ accepted: true, changed: false, reason: "objective-already-complete" });
        }
        if ((objective.requiredObjectiveIds ?? []).some((id) => !this.completedObjectiveIds.has(id))) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-blocked" });
        }
        this.completedObjectiveIds.add(objectiveId);
        this.activeObjectiveSequences.delete(objectiveId);
        const before = this.unlockedRouteIds.size;
        this.#unlockSatisfiedRoutes();
        const finalSector = this.world.sectors.at(-1);
        const finalLandmark = this.#landmark(finalSector.exitLandmarkId);
        if (
            this.currentSectorId === finalSector.id &&
            this.currentLandmarkId === finalLandmark.id &&
            finalLandmark.objectiveIds.every((id) => this.completedObjectiveIds.has(id))
        ) {
            this.contentBoundaryReached = true;
        }
        return freezeResult({
            accepted: true,
            changed: true,
            objectiveId,
            unlockedRouteIds: sortedIds(
                [...this.unlockedRouteIds].filter((id) => !this.routesById.get(id)?.sectorTransition),
                this.idOrder
            ),
            routeChanged: this.unlockedRouteIds.size !== before
        });
    }

    isObjectiveComplete(objectiveId) {
        return this.completedObjectiveIds.has(objectiveId);
    }

    objectiveSequence(objectiveId) {
        return this.activeObjectiveSequences.get(objectiveId) ?? null;
    }

    startObjectiveSequence(objectiveId, { playerId, durationSeconds }) {
        const objective = this.objectivesById.get(objectiveId);
        if (!objective) return freezeResult({ accepted: false, changed: false, reason: "objective-unknown" });
        if (this.completedObjectiveIds.has(objectiveId)) {
            return freezeResult({ accepted: true, changed: false, reason: "objective-already-complete" });
        }
        if (this.activeObjectiveSequences.has(objectiveId)) {
            return freezeResult({
                accepted: true,
                changed: false,
                reason: "objective-sequence-active",
                sequence: this.activeObjectiveSequences.get(objectiveId)
            });
        }
        if (typeof playerId !== "string" || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-sequence-invalid" });
        }
        const sequence = freezeResult({ objectiveId, playerId, durationSeconds, remainingSeconds: durationSeconds });
        this.activeObjectiveSequences.set(objectiveId, sequence);
        return freezeResult({ accepted: true, changed: true, sequence });
    }

    advanceObjectiveSequence(objectiveId, dt) {
        const sequence = this.activeObjectiveSequences.get(objectiveId);
        if (!sequence) return freezeResult({ accepted: false, changed: false, reason: "objective-sequence-missing" });
        if (!Number.isFinite(dt) || dt < 0) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-sequence-dt" });
        }
        const remainingSeconds = Math.max(0, sequence.remainingSeconds - dt);
        if (remainingSeconds > 0) {
            const updated = freezeResult({ ...sequence, remainingSeconds });
            this.activeObjectiveSequences.set(objectiveId, updated);
            return freezeResult({ accepted: true, changed: dt > 0, sequenceCompleted: false, sequence: updated });
        }
        const completion = this.completeObjective(objectiveId);
        return freezeResult({
            ...completion,
            sequenceCompleted: completion.changed,
            playerId: sequence.playerId,
            durationSeconds: sequence.durationSeconds,
            remainingSeconds: 0
        });
    }

    resolveEncounter(encounterId) {
        const encounter = this.encountersById.get(encounterId);
        if (!encounter) return freezeResult({ accepted: false, changed: false, reason: "encounter-unknown" });
        if (encounter.sectorId !== this.currentSectorId) {
            return freezeResult({ accepted: false, changed: false, reason: "encounter-not-current-sector" });
        }
        if (this.resolvedEncounterIds.has(encounterId)) {
            return freezeResult({ accepted: true, changed: false, reason: "encounter-already-resolved" });
        }
        this.resolvedEncounterIds.add(encounterId);
        return freezeResult({ accepted: true, changed: true, encounterId });
    }

    collectAccessModule(accessModuleId) {
        const module = this.accessModulesById.get(accessModuleId);
        if (!module) return freezeResult({ accepted: false, changed: false, reason: "access-module-unknown" });
        if (module.sectorId !== this.currentSectorId) {
            return freezeResult({ accepted: false, changed: false, reason: "access-module-not-current-sector" });
        }
        if (this.collectedAccessModuleIds.has(accessModuleId)) {
            return freezeResult({ accepted: true, changed: false, reason: "access-module-already-collected" });
        }
        this.collectedAccessModuleIds.add(accessModuleId);
        const before = this.unlockedRouteIds.size;
        this.#unlockSatisfiedRoutes();
        return freezeResult({
            accepted: true,
            changed: true,
            accessModuleId,
            routeChanged: this.unlockedRouteIds.size !== before,
            access: this.accessSummary()
        });
    }

    accessSummary(sectorId = this.currentSectorId) {
        const sector = this.#sector(sectorId);
        const moduleIds = (sector.accessModuleIds ?? []).filter((id) => this.accessModulesById.has(id));
        const collectedModuleIds = moduleIds.filter((id) => this.collectedAccessModuleIds.has(id));
        return freezeResult({
            sectorId,
            requiredCount: sector.accessModuleRequirement ?? 0,
            collectedModuleIds: Object.freeze(collectedModuleIds),
            availableModuleIds: Object.freeze(moduleIds),
            ready: collectedModuleIds.length >= (sector.accessModuleRequirement ?? 0)
        });
    }

    visitLandmark(landmarkId) {
        const target = this.landmarksById.get(landmarkId);
        if (!target) return freezeResult({ accepted: false, changed: false, reason: "landmark-unknown" });
        if (landmarkId === this.currentLandmarkId) {
            return freezeResult({ accepted: true, changed: false, reason: "landmark-current" });
        }
        const route = this.world.routeLocks.find(
            ({ sourceLandmarkId, targetLandmarkId }) =>
                sourceLandmarkId === this.currentLandmarkId && targetLandmarkId === landmarkId
        );
        if (!route || !this.unlockedRouteIds.has(route.id)) {
            return freezeResult({ accepted: false, changed: false, reason: "landmark-route-locked" });
        }
        const previousSectorId = this.currentSectorId;
        this.currentSectorId = target.sectorId;
        this.currentLandmarkId = landmarkId;
        this.respawnAnchorId = target.respawnAnchorId;
        this.visitedLandmarkIds.add(landmarkId);
        if (previousSectorId !== this.currentSectorId) this.sectorBaselineRevision += 1;
        return freezeResult({
            accepted: true,
            changed: true,
            landmarkId,
            previousSectorId,
            currentSectorId: this.currentSectorId,
            sectorChanged: previousSectorId !== this.currentSectorId,
            respawnAnchorId: this.respawnAnchorId
        });
    }

    isRouteUnlocked(routeId) {
        return this.unlockedRouteIds.has(routeId);
    }

    resetCurrentSector() {
        const sector = this.#sector();
        const sectorLandmarkIds = new Set(sector.landmarkIds);
        for (const objectiveId of [...this.completedObjectiveIds]) {
            if (sectorLandmarkIds.has(this.objectivesById.get(objectiveId)?.landmarkId)) {
                this.completedObjectiveIds.delete(objectiveId);
            }
        }
        for (const [objectiveId] of [...this.activeObjectiveSequences]) {
            if (sectorLandmarkIds.has(this.objectivesById.get(objectiveId)?.landmarkId)) {
                this.activeObjectiveSequences.delete(objectiveId);
            }
        }
        for (const encounterId of [...this.resolvedEncounterIds]) {
            if (sectorLandmarkIds.has(this.encountersById.get(encounterId)?.landmarkId)) {
                this.resolvedEncounterIds.delete(encounterId);
            }
        }
        for (const accessModuleId of [...this.collectedAccessModuleIds]) {
            if (this.accessModulesById.get(accessModuleId)?.sectorId === sector.id) {
                this.collectedAccessModuleIds.delete(accessModuleId);
            }
        }
        for (const routeId of [...this.unlockedRouteIds]) {
            const route = this.routesById.get(routeId);
            if (route && this.#routeTouchesSector(route, sector.id)) this.unlockedRouteIds.delete(routeId);
        }
        for (const landmarkId of sector.landmarkIds) this.visitedLandmarkIds.delete(landmarkId);
        this.currentLandmarkId = sector.entryLandmarkId;
        this.respawnAnchorId = sector.respawnAnchorId;
        this.visitedLandmarkIds.add(this.currentLandmarkId);
        this.sectorBaselineRevision += 1;
        this.contentBoundaryReached = false;
        this.#unlockSatisfiedRoutes();
        return freezeResult({
            type: "sector-reset",
            sectorId: sector.id,
            baselineRevision: this.sectorBaselineRevision,
            respawnAnchorId: sector.respawnAnchorId,
            preservedPriorSectorObjectiveIds: sortedIds(this.completedObjectiveIds, this.idOrder),
            preservedPriorSectorEncounterIds: sortedIds(this.resolvedEncounterIds, this.idOrder)
        });
    }

    baselineSnapshot() {
        const sector = this.#sector();
        return freezeResult({
            sectorId: sector.id,
            revision: this.sectorBaselineRevision,
            respawnAnchorId: sector.respawnAnchorId,
            entryLandmarkId: sector.entryLandmarkId
        });
    }

    snapshot() {
        return freezeResult({
            currentSectorId: this.currentSectorId,
            currentLandmarkId: this.currentLandmarkId,
            respawnAnchorId: this.respawnAnchorId,
            completedObjectiveIds: sortedIds(this.completedObjectiveIds, this.idOrder),
            resolvedEncounterIds: sortedIds(this.resolvedEncounterIds, this.idOrder),
            collectedAccessModuleIds: sortedIds(this.collectedAccessModuleIds, this.idOrder),
            unlockedRouteIds: sortedIds(this.unlockedRouteIds, this.idOrder),
            visitedLandmarkIds: sortedIds(this.visitedLandmarkIds, this.idOrder),
            activeObjectiveSequences: Object.freeze(
                [...this.activeObjectiveSequences.values()].sort(
                    (left, right) => this.idOrder.get(left.objectiveId) - this.idOrder.get(right.objectiveId)
                )
            ),
            sectorBaselineRevision: this.sectorBaselineRevision,
            contentBoundaryReached: this.contentBoundaryReached
        });
    }

    restore(snapshot) {
        if (!this.sectorsById.has(snapshot?.currentSectorId)) throw new Error("unknown current Sector");
        const landmark = this.landmarksById.get(snapshot.currentLandmarkId);
        if (!landmark || landmark.sectorId !== snapshot.currentSectorId) throw new Error("unknown current landmark");
        const completedObjectiveIds = new Set(
            requireSnapshotArray(snapshot.completedObjectiveIds, "completedObjectiveIds")
        );
        const resolvedEncounterIds = new Set(
            requireSnapshotArray(snapshot.resolvedEncounterIds, "resolvedEncounterIds")
        );
        const collectedAccessModuleIds = new Set(
            requireSnapshotArray(snapshot.collectedAccessModuleIds ?? [], "collectedAccessModuleIds")
        );
        const unlockedRouteIds = new Set(requireSnapshotArray(snapshot.unlockedRouteIds, "unlockedRouteIds"));
        const visitedLandmarkIds = new Set(requireSnapshotArray(snapshot.visitedLandmarkIds, "visitedLandmarkIds"));
        const respawnAnchor = this.respawnAnchorsById.get(snapshot.respawnAnchorId);
        if (
            !respawnAnchor ||
            respawnAnchor.sectorId !== snapshot.currentSectorId ||
            respawnAnchor.landmarkId !== snapshot.currentLandmarkId ||
            !visitedLandmarkIds.has(respawnAnchor.landmarkId)
        ) {
            throw new Error("respawn anchor must match the current visited landmark");
        }
        if (!Array.isArray(snapshot.activeObjectiveSequences)) {
            throw new Error("activeObjectiveSequences must be an array");
        }
        if ([...completedObjectiveIds].some((id) => !this.objectivesById.has(id))) throw new Error("unknown objective");
        if ([...resolvedEncounterIds].some((id) => !this.encountersById.has(id))) throw new Error("unknown encounter");
        if ([...collectedAccessModuleIds].some((id) => !this.accessModulesById.has(id))) {
            throw new Error("unknown access module");
        }
        if ([...unlockedRouteIds].some((id) => !this.routesById.has(id))) throw new Error("unknown route");
        if ([...visitedLandmarkIds].some((id) => !this.landmarksById.has(id))) throw new Error("unknown landmark");
        if (!Number.isSafeInteger(snapshot.sectorBaselineRevision) || snapshot.sectorBaselineRevision < 0) {
            throw new Error("invalid Sector baseline revision");
        }
        this.currentSectorId = snapshot.currentSectorId;
        this.currentLandmarkId = snapshot.currentLandmarkId;
        this.respawnAnchorId = snapshot.respawnAnchorId;
        this.completedObjectiveIds = completedObjectiveIds;
        this.resolvedEncounterIds = resolvedEncounterIds;
        this.collectedAccessModuleIds = collectedAccessModuleIds;
        this.unlockedRouteIds = unlockedRouteIds;
        this.visitedLandmarkIds = visitedLandmarkIds;
        this.activeObjectiveSequences = new Map(
            snapshot.activeObjectiveSequences.map((sequence) => {
                if (!this.objectivesById.has(sequence?.objectiveId)) throw new Error("unknown objective sequence");
                if (!Number.isFinite(sequence.remainingSeconds) || sequence.remainingSeconds < 0) {
                    throw new Error("invalid objective sequence");
                }
                return [sequence.objectiveId, freezeResult({ ...sequence })];
            })
        );
        this.sectorBaselineRevision = snapshot.sectorBaselineRevision;
        this.contentBoundaryReached = snapshot.contentBoundaryReached === true;
        return this;
    }
}
