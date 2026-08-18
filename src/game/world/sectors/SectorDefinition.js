function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

export const PREVIEW_SECTOR_WIDTH_RANGE = Object.freeze({
    min: 3840,
    max: 4800
});

export function canonicalSectorId(sectorNumber) {
    return `sector-${String(sectorNumber).padStart(2, "0")}`;
}

export function canonicalLandmarkId(sectorId, order) {
    return `${sectorId}:landmark:${String(order).padStart(2, "0")}`;
}

export function canonicalEncounterId(landmarkId, legacyLocalId) {
    return `${landmarkId}:encounter:${legacyLocalId}`;
}

export function canonicalEncounterSlotId(landmarkId, legacyLocalId) {
    return `${landmarkId}:slot:${legacyLocalId}`;
}

export function canonicalObjectiveId(landmarkId, legacyLocalId) {
    return `${landmarkId}:objective:${legacyLocalId}`;
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
    accessModuleId = null,
    accessHint = null,
    legacyStageAlias
} = {}) {
    return freezeValue({
        encounterId,
        slotId,
        position,
        activation,
        ...(enemySelection ? { enemySelection } : {}),
        ...(accessModuleId ? { accessModuleId } : {}),
        ...(accessHint ? { accessHint } : {}),
        ...(legacyStageAlias ? { legacyStageAlias } : {})
    });
}

export function sectorObjective({
    id,
    type,
    bounds = null,
    requiredObjectiveIds = [],
    completionDelaySeconds,
    sourceObjectId,
    legacyStageAlias
} = {}) {
    return freezeValue({
        id,
        type,
        requiredObjectiveIds,
        ...(bounds ? { bounds } : {}),
        ...(completionDelaySeconds !== undefined ? { completionDelaySeconds } : {}),
        ...(sourceObjectId ? { sourceObjectId } : {}),
        ...(legacyStageAlias ? { legacyStageAlias } : {})
    });
}

export function landmark({
    id,
    order,
    name = "",
    subtitle = "",
    legacyStageAlias,
    localBounds: stageLocalBounds,
    subregionBounds: previewBounds,
    entry,
    exit,
    encounters = [],
    objectives = []
} = {}) {
    return freezeValue({
        id,
        order,
        name,
        subtitle,
        legacyStageAlias,
        localBounds: stageLocalBounds,
        subregionBounds: previewBounds,
        entry,
        exit,
        encounters,
        objectives
    });
}

export function defineSector({ id, order, width, runtimePreview = false, sectorEntry: entry, landmarks = [] } = {}) {
    return freezeValue({
        id,
        order,
        width,
        runtimePreview,
        sectorEntry: entry,
        landmarks
    });
}

export function stageAliasRecord({
    legacyStageAlias,
    sectorId,
    landmarkId,
    objectiveIds = [],
    encounterIds = [],
    runtimePreview = false
} = {}) {
    return freezeValue({
        legacyStageAlias,
        sectorId,
        landmarkId,
        objectiveIds,
        encounterIds,
        runtimePreview
    });
}

export function defineSectorCatalog({ id, revision, sectors = [], stageAliases = [] } = {}) {
    return freezeValue({ id, revision, sectors, stageAliases });
}
