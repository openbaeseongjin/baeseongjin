function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

export const PREVIEW_SECTOR_WIDTH_RANGE = Object.freeze({
    min: 3840,
    max: 4800
});

export const ACCESS_MODULE_SOURCE_KIND = Object.freeze({
    ENEMY_DEFEAT: "enemy-defeat",
    OBJECTIVE_COMPLETION: "objective-completion"
});

export function canonicalSectorId(sectorNumber) {
    return `sector-${String(sectorNumber).padStart(2, "0")}`;
}

export function canonicalLandmarkId(sectorId, order) {
    return `${sectorId}:landmark:${String(order).padStart(2, "0")}`;
}

export function canonicalEncounterId(landmarkId, localId) {
    return `${landmarkId}:encounter:${localId}`;
}

export function canonicalEncounterSlotId(landmarkId, localId) {
    return `${landmarkId}:slot:${localId}`;
}

export function canonicalObjectiveId(landmarkId, localId) {
    return `${landmarkId}:objective:${localId}`;
}

export function localBounds(width, height) {
    return freezeValue({ width, height });
}

export function subregionBounds(x, y, width, height) {
    return freezeValue({ x, y, width, height });
}

export function sectorEntry(id, landmarkId, position, properties = {}) {
    return freezeValue({ id, landmarkId, position, ...properties });
}

export function encounterSlot({
    encounterId,
    slotId,
    position,
    activation = null,
    enemySelection = null,
    swarmMemberCount,
    accessModuleId = null,
    stageId
} = {}) {
    return freezeValue({
        encounterId,
        slotId,
        position,
        activation,
        ...(enemySelection ? { enemySelection } : {}),
        ...(swarmMemberCount !== undefined ? { swarmMemberCount } : {}),
        ...(accessModuleId ? { accessModuleId } : {}),
        ...(stageId ? { stageId } : {})
    });
}

export function sectorObjective({
    id,
    type,
    bounds = null,
    requiredObjectiveIds = [],
    completionDelaySeconds,
    sourceObjectId,
    stageId,
    accessModuleId,
    sources,
    requiredCount
} = {}) {
    return freezeValue({
        id,
        type,
        requiredObjectiveIds,
        ...(bounds ? { bounds } : {}),
        ...(completionDelaySeconds !== undefined ? { completionDelaySeconds } : {}),
        ...(sourceObjectId ? { sourceObjectId } : {}),
        ...(accessModuleId ? { accessModuleId } : {}),
        ...(sources ? { sources } : {}),
        ...(requiredCount !== undefined ? { requiredCount } : {}),
        ...(stageId ? { stageId } : {})
    });
}

export function landmark({
    id,
    order,
    name = "",
    subtitle = "",
    stageId,
    localBounds: stageLocalBounds,
    subregionBounds: previewBounds,
    entry,
    exit,
    contentBoundaryId = null,
    contentBoundaryRequiredObjectiveIds = [],
    encounters = [],
    objectives = []
} = {}) {
    return freezeValue({
        id,
        order,
        name,
        subtitle,
        stageId,
        localBounds: stageLocalBounds,
        subregionBounds: previewBounds,
        entry,
        exit,
        contentBoundaryId,
        contentBoundaryRequiredObjectiveIds,
        encounters,
        objectives
    });
}

export function defineSector({
    id,
    order,
    width,
    runtimePreview = false,
    accessModuleRequirement = 0,
    contentBoundaryStageId = null,
    sectorEntry: entry,
    landmarks = []
} = {}) {
    return freezeValue({
        id,
        order,
        width,
        runtimePreview,
        accessModuleRequirement,
        contentBoundaryStageId,
        sectorEntry: entry,
        landmarks
    });
}

export function stageIdentityRecord({
    stageId,
    sectorId,
    landmarkId,
    objectiveIds = [],
    encounterIds = [],
    runtimePreview = false
} = {}) {
    return freezeValue({
        stageId,
        sectorId,
        landmarkId,
        objectiveIds,
        encounterIds,
        runtimePreview
    });
}

export function defineSectorCatalog({ id, revision, sectors = [], stageIdentities = [] } = {}) {
    return freezeValue({ id, revision, sectors, stageIdentities });
}
