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
        this.contentBoundariesById = new Map(
            world.landmarks
                .filter(({ contentBoundaryId }) => typeof contentBoundaryId === "string")
                .map((landmark) => [landmark.contentBoundaryId, landmark])
        );
        this.accessModuleIdsByEncounterId = new Map();
        this.accessModuleIdsByObjectiveId = new Map();
        for (const module of world.accessModules ?? []) {
            for (const source of module.sources ?? []) {
                let index;
                let sourceId;
                if (source.encounterId) {
                    index = this.accessModuleIdsByEncounterId;
                    sourceId = source.encounterId;
                } else if (source.objectiveId) {
                    index = this.accessModuleIdsByObjectiveId;
                    sourceId = source.objectiveId;
                } else {
                    continue;
                }
                index.set(sourceId, Object.freeze([...(index.get(sourceId) ?? []), module.id]));
            }
        }
        this.idOrder = new Map();
        let order = 0;
        for (const sector of world.sectors) {
            for (const landmarkId of sector.landmarkIds) {
                const landmark = this.landmarksById.get(landmarkId);
                this.idOrder.set(landmarkId, order++);
                for (const objectiveId of landmark.objectiveIds) this.idOrder.set(objectiveId, order++);
                for (const encounterId of landmark.encounterIds) this.idOrder.set(encounterId, order++);
                if (landmark.contentBoundaryId) this.idOrder.set(landmark.contentBoundaryId, order++);
                if (landmark.outboundRouteId) this.idOrder.set(landmark.outboundRouteId, order++);
            }
        }
        for (const accessModule of world.accessModules ?? []) this.idOrder.set(accessModule.id, order++);
        this.completedObjectiveIds = new Set();
        this.resolvedEncounterIds = new Set();
        this.collectedAccessModuleIds = new Set();
        this.unlockedRouteIds = new Set();
        this.activeObjectiveSequences = new Map();
        this.reachedContentBoundaryIds = new Set();
        this.contentBoundaryId = null;
        this.#unlockSatisfiedRoutes();
        if (snapshot) this.restore(snapshot);
    }

    #routeAccessReady(route) {
        if (!route.requiredAccessModuleCount) return true;
        const sourceSectorId = this.landmarksById.get(route.sourceLandmarkId)?.sectorId;
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

    #collectAccessModules(moduleIds) {
        return Object.freeze(
            (moduleIds ?? [])
                .map((accessModuleId) => this.collectAccessModule(accessModuleId))
                .filter(({ changed }) => changed)
        );
    }

    completeObjective(objectiveId) {
        const objective = this.objectivesById.get(objectiveId);
        if (!objective) return freezeResult({ accepted: false, changed: false, reason: "objective-unknown" });
        if (this.completedObjectiveIds.has(objectiveId)) {
            return freezeResult({ accepted: true, changed: false, reason: "objective-already-complete" });
        }
        if ((objective.requiredObjectiveIds ?? []).some((id) => !this.completedObjectiveIds.has(id))) {
            return freezeResult({ accepted: false, changed: false, reason: "objective-blocked" });
        }
        this.completedObjectiveIds.add(objectiveId);
        this.activeObjectiveSequences.delete(objectiveId);
        const before = this.unlockedRouteIds.size;
        const accessCollections = this.#collectAccessModules(this.accessModuleIdsByObjectiveId.get(objectiveId));
        this.#unlockSatisfiedRoutes();
        let contentBoundary = null;
        for (const [contentBoundaryId, landmark] of this.contentBoundariesById) {
            if (this.reachedContentBoundaryIds.has(contentBoundaryId)) continue;
            if (!landmark.contentBoundaryRequiredObjectiveIds.every((id) => this.completedObjectiveIds.has(id))) {
                continue;
            }
            this.reachedContentBoundaryIds.add(contentBoundaryId);
            this.contentBoundaryId = contentBoundaryId;
            contentBoundary = freezeResult({
                id: contentBoundaryId,
                landmarkId: landmark.id,
                sectorId: landmark.sectorId,
                stageId: landmark.stageId,
                requiredObjectiveIds: landmark.contentBoundaryRequiredObjectiveIds
            });
            break;
        }
        return freezeResult({
            accepted: true,
            changed: true,
            objectiveId,
            accessCollections,
            contentBoundary,
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
        if (this.resolvedEncounterIds.has(encounterId)) {
            return freezeResult({ accepted: true, changed: false, reason: "encounter-already-resolved" });
        }
        this.resolvedEncounterIds.add(encounterId);
        return freezeResult({
            accepted: true,
            changed: true,
            encounterId,
            accessCollections: this.#collectAccessModules(this.accessModuleIdsByEncounterId.get(encounterId))
        });
    }

    collectAccessModule(accessModuleId) {
        const module = this.accessModulesById.get(accessModuleId);
        if (!module) return freezeResult({ accepted: false, changed: false, reason: "access-module-unknown" });
        if (this.collectedAccessModuleIds.has(accessModuleId)) {
            return freezeResult({ accepted: true, changed: false, reason: "access-module-already-collected" });
        }
        this.collectedAccessModuleIds.add(accessModuleId);
        const beforeRoutes = new Set(this.unlockedRouteIds);
        this.#unlockSatisfiedRoutes();
        return freezeResult({
            accepted: true,
            changed: true,
            accessModuleId,
            module,
            unlockedRouteIds: sortedIds(
                [...this.unlockedRouteIds].filter((id) => !beforeRoutes.has(id)),
                this.idOrder
            ),
            routeChanged: this.unlockedRouteIds.size !== beforeRoutes.size,
            access: this.accessSummary(module.sectorId)
        });
    }

    accessSummary(sectorId) {
        const sector = this.sectorsById.get(sectorId);
        if (!sector) throw new Error(`unknown access Sector: ${sectorId}`);
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

    accessSourceSummary(sourceIds, requiredCount) {
        const availableSourceIds = (sourceIds ?? []).filter((id) => this.accessModulesById.has(id));
        const collectedSourceIds = availableSourceIds.filter((id) => this.collectedAccessModuleIds.has(id));
        return freezeResult({
            requiredCount,
            availableSourceIds: Object.freeze(availableSourceIds),
            collectedSourceIds: Object.freeze(collectedSourceIds),
            ready: collectedSourceIds.length >= requiredCount
        });
    }

    isRouteUnlocked(routeId) {
        return this.unlockedRouteIds.has(routeId);
    }

    resetContentBoundary() {
        this.contentBoundaryId = null;
        return this;
    }

    snapshot() {
        return freezeResult({
            completedObjectiveIds: sortedIds(this.completedObjectiveIds, this.idOrder),
            resolvedEncounterIds: sortedIds(this.resolvedEncounterIds, this.idOrder),
            collectedAccessModuleIds: sortedIds(this.collectedAccessModuleIds, this.idOrder),
            unlockedRouteIds: sortedIds(this.unlockedRouteIds, this.idOrder),
            activeObjectiveSequences: Object.freeze(
                [...this.activeObjectiveSequences.values()].sort(
                    (left, right) => this.idOrder.get(left.objectiveId) - this.idOrder.get(right.objectiveId)
                )
            ),
            reachedContentBoundaryIds: sortedIds(this.reachedContentBoundaryIds, this.idOrder),
            contentBoundaryId: this.contentBoundaryId,
            contentBoundaryReached: this.contentBoundaryId !== null
        });
    }

    restore(snapshot) {
        if (!snapshot || Array.isArray(snapshot) || typeof snapshot !== "object") {
            throw new Error("Sector progress snapshot must be an object");
        }
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
        const reachedContentBoundaryIds = new Set(
            requireSnapshotArray(snapshot.reachedContentBoundaryIds ?? [], "reachedContentBoundaryIds")
        );
        if (!Array.isArray(snapshot.activeObjectiveSequences)) {
            throw new Error("activeObjectiveSequences must be an array");
        }
        if ([...completedObjectiveIds].some((id) => !this.objectivesById.has(id))) throw new Error("unknown objective");
        if ([...resolvedEncounterIds].some((id) => !this.encountersById.has(id))) throw new Error("unknown encounter");
        if ([...collectedAccessModuleIds].some((id) => !this.accessModulesById.has(id))) {
            throw new Error("unknown access module");
        }
        if ([...unlockedRouteIds].some((id) => !this.routesById.has(id))) throw new Error("unknown route");
        if ([...reachedContentBoundaryIds].some((id) => !this.contentBoundariesById.has(id))) {
            throw new Error("unknown content boundary");
        }
        this.completedObjectiveIds = completedObjectiveIds;
        this.resolvedEncounterIds = resolvedEncounterIds;
        this.collectedAccessModuleIds = collectedAccessModuleIds;
        this.unlockedRouteIds = unlockedRouteIds;
        this.reachedContentBoundaryIds = reachedContentBoundaryIds;
        this.activeObjectiveSequences = new Map(
            snapshot.activeObjectiveSequences.map((sequence) => {
                if (!this.objectivesById.has(sequence?.objectiveId)) throw new Error("unknown objective sequence");
                if (!Number.isFinite(sequence.remainingSeconds) || sequence.remainingSeconds < 0) {
                    throw new Error("invalid objective sequence");
                }
                return [sequence.objectiveId, freezeResult({ ...sequence })];
            })
        );
        this.contentBoundaryId = null;
        if (snapshot.contentBoundaryReached === true) {
            this.contentBoundaryId = snapshot.contentBoundaryId ?? null;
        }
        if (this.contentBoundaryId !== null && !this.contentBoundariesById.has(this.contentBoundaryId)) {
            throw new Error("unknown active content boundary");
        }
        return this;
    }
}
