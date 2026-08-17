import { PREVIEW_SECTOR_WIDTH_RANGE } from "./sectors/SectorDefinition.js";

function issue(code, sectorId = null, details = {}) {
    return Object.freeze({ code, ...(sectorId ? { sectorId } : {}), ...details });
}

function pointInsideLocalBounds(bounds, point) {
    return (
        Number.isFinite(bounds?.width) &&
        Number.isFinite(bounds?.height) &&
        Number.isFinite(point?.x) &&
        Number.isFinite(point?.y) &&
        point.x >= -bounds.width * 0.5 &&
        point.x <= bounds.width * 0.5 &&
        point.y >= -bounds.height &&
        point.y <= 0
    );
}

function boundsInsideLocalBounds(localBounds, bounds) {
    return (
        Number.isFinite(localBounds?.width) &&
        Number.isFinite(localBounds?.height) &&
        Number.isFinite(bounds?.x) &&
        Number.isFinite(bounds?.y) &&
        Number.isFinite(bounds?.width) &&
        Number.isFinite(bounds?.height) &&
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.x >= -localBounds.width * 0.5 &&
        bounds.x + bounds.width <= localBounds.width * 0.5 &&
        bounds.y >= -localBounds.height &&
        bounds.y + bounds.height <= 0
    );
}

function expectedLegacyStageAliases() {
    const aliases = [];
    for (let sector = 1; sector <= 6; sector += 1) {
        for (let stage = 1; stage <= 8; stage += 1) {
            aliases.push(`${sector}-${stage}`);
        }
    }
    return aliases;
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}

function enemySelectionIssueCode(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return "encounter-selection-invalid";
    }
    const hasFixed = value.fixedEnemyType !== undefined && value.fixedEnemyType !== null;
    const hasPool = value.allowedEnemyTypes !== undefined && value.allowedEnemyTypes !== null;
    if (Number(hasFixed) + Number(hasPool) !== 1) {
        return "encounter-selection-source";
    }
    if (hasFixed) {
        return isNonEmptyString(value.fixedEnemyType) ? null : "encounter-selection-fixed-type";
    }
    if (!Array.isArray(value.allowedEnemyTypes) || value.allowedEnemyTypes.length === 0) {
        return "encounter-selection-pool-empty";
    }
    if (!value.allowedEnemyTypes.every((enemyType) => isNonEmptyString(enemyType))) {
        return "encounter-selection-pool-type";
    }
    return new Set(value.allowedEnemyTypes).size === value.allowedEnemyTypes.length
        ? null
        : "encounter-selection-pool-duplicate";
}

export function validateSectorCatalog(catalog) {
    if (!catalog || typeof catalog !== "object") {
        return Object.freeze({
            valid: false,
            issues: Object.freeze([issue("sector-catalog-missing")])
        });
    }
    if (!Array.isArray(catalog.sectors) || !Array.isArray(catalog.stageAliases)) {
        const issues = [];
        if (!Array.isArray(catalog.sectors)) issues.push(issue("sector-catalog-sectors-missing"));
        if (!Array.isArray(catalog.stageAliases)) issues.push(issue("sector-catalog-stage-aliases-missing"));
        return Object.freeze({
            valid: false,
            issues: Object.freeze(issues)
        });
    }

    const issues = [];
    const sectorIds = new Set();
    const previewSectorIds = new Set();
    const landmarkIds = new Set();
    const objectiveIds = new Set();
    const encounterIds = new Set();
    const slotIds = new Set();

    for (const [sectorIndex, sector] of catalog.sectors.entries()) {
        if (typeof sector.id !== "string" || !sector.id) {
            issues.push(issue("sector-id-missing"));
            continue;
        }
        if (sectorIds.has(sector.id)) issues.push(issue("sector-id-duplicate", sector.id));
        sectorIds.add(sector.id);
        if (sector.runtimePreview) previewSectorIds.add(sector.id);
        if (sector.order !== sectorIndex + 1) {
            issues.push(issue("sector-order", sector.id, { expected: sectorIndex + 1 }));
        }
        if (
            !Number.isFinite(sector.width) ||
            sector.width < PREVIEW_SECTOR_WIDTH_RANGE.min ||
            sector.width > PREVIEW_SECTOR_WIDTH_RANGE.max
        ) {
            issues.push(issue("sector-width-range", sector.id));
        }

        const sectorLandmarkIds = new Set();
        for (const [landmarkIndex, landmark] of sector.landmarks.entries()) {
            if (typeof landmark.id !== "string" || !landmark.id) {
                issues.push(issue("landmark-id-missing", sector.id));
                continue;
            }
            if (landmarkIds.has(landmark.id))
                issues.push(issue("landmark-id-duplicate", sector.id, { id: landmark.id }));
            if (sectorLandmarkIds.has(landmark.id)) {
                issues.push(issue("sector-landmark-duplicate", sector.id, { id: landmark.id }));
            }
            landmarkIds.add(landmark.id);
            sectorLandmarkIds.add(landmark.id);
            if (landmark.order !== landmarkIndex + 1) {
                issues.push(issue("landmark-order", sector.id, { id: landmark.id, expected: landmarkIndex + 1 }));
            }
            if (
                !Number.isFinite(landmark.localBounds?.width) ||
                landmark.localBounds.width <= 0 ||
                !Number.isFinite(landmark.localBounds?.height) ||
                landmark.localBounds.height <= 0
            ) {
                issues.push(issue("landmark-local-bounds", sector.id, { id: landmark.id }));
            }
            if (
                !Number.isFinite(landmark.subregionBounds?.x) ||
                !Number.isFinite(landmark.subregionBounds?.y) ||
                !Number.isFinite(landmark.subregionBounds?.width) ||
                !Number.isFinite(landmark.subregionBounds?.height) ||
                landmark.subregionBounds.width <= 0 ||
                landmark.subregionBounds.height <= 0 ||
                landmark.subregionBounds.x < 0 ||
                landmark.subregionBounds.x + landmark.subregionBounds.width > sector.width
            ) {
                issues.push(issue("landmark-subregion-bounds", sector.id, { id: landmark.id }));
            }
            if (!pointInsideLocalBounds(landmark.localBounds, landmark.entry)) {
                issues.push(issue("landmark-entry-bounds", sector.id, { id: landmark.id }));
            }
            if (!pointInsideLocalBounds(landmark.localBounds, landmark.exit)) {
                issues.push(issue("landmark-exit-bounds", sector.id, { id: landmark.id }));
            }

            for (const objective of landmark.objectives) {
                if (!isNonEmptyString(objective.id)) {
                    issues.push(issue("objective-id-missing", sector.id, { landmarkId: landmark.id }));
                    continue;
                }
                if (!isNonEmptyString(objective.type)) {
                    issues.push(issue("objective-type-missing", sector.id, { id: objective.id }));
                }
                if (objectiveIds.has(objective.id)) {
                    issues.push(issue("objective-id-duplicate", sector.id, { id: objective.id }));
                }
                objectiveIds.add(objective.id);
                if (objective.bounds && !boundsInsideLocalBounds(landmark.localBounds, objective.bounds)) {
                    issues.push(issue("objective-bounds", sector.id, { id: objective.id, landmarkId: landmark.id }));
                }
            }

            for (const encounter of landmark.encounters) {
                if ("areaId" in encounter) {
                    issues.push(
                        issue("encounter-area-authority", sector.id, {
                            encounterId: encounter.encounterId,
                            landmarkId: landmark.id
                        })
                    );
                }
                if (!isNonEmptyString(encounter.encounterId)) {
                    issues.push(issue("encounter-id-missing", sector.id, { landmarkId: landmark.id }));
                    continue;
                }
                if (!isNonEmptyString(encounter.slotId)) {
                    issues.push(
                        issue("encounter-slot-id-missing", sector.id, {
                            encounterId: encounter.encounterId,
                            landmarkId: landmark.id
                        })
                    );
                }
                const enemySelectionIssue =
                    encounter.enemySelection !== undefined ? enemySelectionIssueCode(encounter.enemySelection) : null;
                if (enemySelectionIssue) {
                    issues.push(issue(enemySelectionIssue, sector.id, { encounterId: encounter.encounterId }));
                }
                if (encounter.enemySelection && "areaId" in encounter.enemySelection) {
                    issues.push(issue("encounter-area-authority", sector.id, { encounterId: encounter.encounterId }));
                }
                if (encounterIds.has(encounter.encounterId)) {
                    issues.push(issue("encounter-id-duplicate", sector.id, { encounterId: encounter.encounterId }));
                }
                if (slotIds.has(encounter.slotId)) {
                    issues.push(issue("encounter-slot-duplicate", sector.id, { slotId: encounter.slotId }));
                }
                encounterIds.add(encounter.encounterId);
                slotIds.add(encounter.slotId);
                if (!pointInsideLocalBounds(landmark.localBounds, encounter.position)) {
                    issues.push(
                        issue("encounter-position-bounds", sector.id, {
                            encounterId: encounter.encounterId,
                            landmarkId: landmark.id
                        })
                    );
                }
                if (encounter.activation && !boundsInsideLocalBounds(landmark.localBounds, encounter.activation)) {
                    issues.push(
                        issue("encounter-activation-bounds", sector.id, {
                            encounterId: encounter.encounterId,
                            landmarkId: landmark.id
                        })
                    );
                }
            }
        }

        if (!isNonEmptyString(sector.sectorEntry?.id)) {
            issues.push(issue("sector-entry-id-missing", sector.id));
        }
        if (!sectorLandmarkIds.has(sector.sectorEntry?.landmarkId)) {
            issues.push(
                issue("sector-entry-landmark-missing", sector.id, { landmarkId: sector.sectorEntry?.landmarkId })
            );
        } else {
            const target = sector.landmarks.find(({ id }) => id === sector.sectorEntry.landmarkId);
            if (!pointInsideLocalBounds(target.localBounds, sector.sectorEntry.position)) {
                issues.push(issue("sector-entry-bounds", sector.id, { landmarkId: target.id }));
            }
        }
    }

    for (const objectiveId of objectiveIds) {
        const objective = catalog.sectors
            .flatMap((sector) => sector.landmarks)
            .flatMap((landmark) => landmark.objectives)
            .find(({ id }) => id === objectiveId);
        for (const requiredObjectiveId of objective.requiredObjectiveIds ?? []) {
            if (!objectiveIds.has(requiredObjectiveId)) {
                issues.push(issue("objective-requirement-missing", null, { objectiveId, requiredObjectiveId }));
            }
        }
    }

    const expectedAliases = expectedLegacyStageAliases();
    const expectedAliasSet = new Set(expectedAliases);
    const seenAliases = new Set();
    for (const aliasRecord of catalog.stageAliases) {
        if (seenAliases.has(aliasRecord.legacyStageAlias)) {
            issues.push(
                issue("stage-alias-duplicate", aliasRecord.sectorId, { legacyStageAlias: aliasRecord.legacyStageAlias })
            );
        }
        seenAliases.add(aliasRecord.legacyStageAlias);
        if (!expectedAliasSet.has(aliasRecord.legacyStageAlias)) {
            issues.push(
                issue("stage-alias-unknown", aliasRecord.sectorId, {
                    legacyStageAlias: aliasRecord.legacyStageAlias
                })
            );
        }
        if (aliasRecord.runtimePreview) {
            if (!previewSectorIds.has(aliasRecord.sectorId)) {
                issues.push(
                    issue("stage-alias-preview-sector-missing", aliasRecord.sectorId, {
                        legacyStageAlias: aliasRecord.legacyStageAlias
                    })
                );
            }
            if (!landmarkIds.has(aliasRecord.landmarkId)) {
                issues.push(
                    issue("stage-alias-landmark-missing", aliasRecord.sectorId, {
                        legacyStageAlias: aliasRecord.legacyStageAlias
                    })
                );
            }
            for (const objectiveId of aliasRecord.objectiveIds ?? []) {
                if (!objectiveIds.has(objectiveId)) {
                    issues.push(
                        issue("stage-alias-objective-missing", aliasRecord.sectorId, {
                            legacyStageAlias: aliasRecord.legacyStageAlias,
                            objectiveId
                        })
                    );
                }
            }
            for (const encounterId of aliasRecord.encounterIds ?? []) {
                if (!encounterIds.has(encounterId)) {
                    issues.push(
                        issue("stage-alias-encounter-missing", aliasRecord.sectorId, {
                            legacyStageAlias: aliasRecord.legacyStageAlias,
                            encounterId
                        })
                    );
                }
            }
        }
    }

    for (const expectedAlias of expectedAliases) {
        if (!seenAliases.has(expectedAlias)) {
            issues.push(issue("stage-alias-coverage-missing", null, { legacyStageAlias: expectedAlias }));
        }
    }
    if (catalog.stageAliases.length !== expectedAliases.length) {
        issues.push(
            issue("stage-alias-count", null, { expected: expectedAliases.length, actual: catalog.stageAliases.length })
        );
    }

    return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) });
}
