import { resolveObjectTriggerBounds } from "../areas/AreaDefinition.js";
import { resolveSectorEnemyEncounters } from "../EnemyEncounterSelection.js";
import { SECTOR_01_AREA_CATALOG } from "../areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../areas/sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "../areas/sector03/Sector03AreaCatalog.js";
import {
    canonicalEncounterId,
    canonicalEncounterSlotId,
    canonicalLandmarkId,
    canonicalObjectiveId,
    canonicalSectorId,
    defineSector,
    defineSectorCatalog,
    encounterSlot,
    landmark,
    localBounds,
    PREVIEW_SECTOR_WIDTH_RANGE,
    sectorEntry,
    sectorObjective,
    stageIdentityRecord,
    subregionBounds
} from "./SectorDefinition.js";

export const PREVIEW_SECTOR_WIDTH = PREVIEW_SECTOR_WIDTH_RANGE.max;
const PREVIEW_LANDMARK_WIDTH = PREVIEW_SECTOR_WIDTH / 8;

function stageIdFromArea(area) {
    if (typeof area.stageId !== "string" || area.stageId.length === 0) {
        throw new TypeError(`authored-area-stage-id-missing:${area.id}`);
    }
    return area.stageId;
}

function localId(id) {
    return id.split(":").at(-1);
}

function encounterActivation(object) {
    if (object.activation) return object.activation;
    if (object.activationSpec) return resolveObjectTriggerBounds(object.position, object.activationSpec);
    return null;
}

function importObjectives(area, landmarkId, stageId) {
    const objectiveIdBySourceId = Object.freeze(
        Object.fromEntries(
            area.objectives.map((objective) => [objective.id, canonicalObjectiveId(landmarkId, localId(objective.id))])
        )
    );
    return area.objectives.map((objective) =>
        sectorObjective({
            id: objectiveIdBySourceId[objective.id],
            type: objective.type,
            bounds: objective.bounds ?? null,
            requiredObjectiveIds: (objective.requiredObjectiveIds ?? []).map(
                (requiredId) => objectiveIdBySourceId[requiredId]
            ),
            completionDelaySeconds: objective.completionDelaySeconds,
            sourceObjectId: objective.sourceObjectId,
            stageId
        })
    );
}

function importEncounters(area, landmarkId, stageId) {
    return area.objects
        .filter(({ kind }) => kind === "sentry" || kind === "patrol-drone")
        .map((object) => {
            const objectLocalId = localId(object.id);
            return encounterSlot({
                encounterId: canonicalEncounterId(landmarkId, objectLocalId),
                slotId: canonicalEncounterSlotId(landmarkId, objectLocalId),
                position: object.position,
                activation: encounterActivation(object),
                enemySelection: object.enemySelection ?? {
                    fixedEnemyType: object.enemyType ?? object.kind
                },
                accessModuleId: object.accessModuleId,
                stageId
            });
        });
}

function importLandmark(area, landmarkIndex) {
    const stageId = stageIdFromArea(area);
    const landmarkId = canonicalLandmarkId(area.sectorId, landmarkIndex + 1);
    return landmark({
        id: landmarkId,
        order: landmarkIndex + 1,
        name: area.name,
        subtitle: area.subtitle,
        stageId,
        localBounds: localBounds(area.bounds.width, area.bounds.height),
        subregionBounds: subregionBounds(
            landmarkIndex * PREVIEW_LANDMARK_WIDTH,
            -area.bounds.height,
            PREVIEW_LANDMARK_WIDTH,
            area.bounds.height
        ),
        entry: area.entry,
        exit: area.exit,
        objectives: importObjectives(area, landmarkId, stageId),
        encounters: importEncounters(area, landmarkId, stageId)
    });
}

function importPreviewSector(areaCatalog, sectorIndex) {
    const sectorId = canonicalSectorId(sectorIndex + 1);
    const landmarks = areaCatalog.areas.map((area, landmarkIndex) => importLandmark(area, landmarkIndex));
    return defineSector({
        id: sectorId,
        order: sectorIndex + 1,
        width: PREVIEW_SECTOR_WIDTH,
        runtimePreview: true,
        sectorEntry: sectorEntry(`${sectorId}:entry`, landmarks[0].id, landmarks[0].entry, {
            stageId: landmarks[0].stageId
        }),
        landmarks
    });
}

function previewStageIdentitiesFromSector(sector) {
    return sector.landmarks.map((landmark) =>
        stageIdentityRecord({
            stageId: landmark.stageId,
            sectorId: sector.id,
            landmarkId: landmark.id,
            objectiveIds: landmark.objectives.map(({ id }) => id),
            encounterIds: landmark.encounters.map(({ encounterId }) => encounterId),
            runtimePreview: true
        })
    );
}

function scenarioStageIdentities() {
    const stageIdentities = [];
    for (let sectorNumber = 4; sectorNumber <= 6; sectorNumber += 1) {
        const sectorId = canonicalSectorId(sectorNumber);
        for (let stageOrder = 1; stageOrder <= 8; stageOrder += 1) {
            stageIdentities.push(
                stageIdentityRecord({
                    stageId: `${sectorNumber}-${stageOrder}`,
                    sectorId,
                    landmarkId: canonicalLandmarkId(sectorId, stageOrder),
                    objectiveIds: [],
                    encounterIds: [],
                    runtimePreview: false
                })
            );
        }
    }
    return stageIdentities;
}

const DEFAULT_AUTHORED_AREA_CATALOGS = Object.freeze([
    SECTOR_01_AREA_CATALOG,
    SECTOR_02_AREA_CATALOG,
    SECTOR_03_AREA_CATALOG
]);

export function buildAuthoredSectorCatalog({ areaCatalogs = DEFAULT_AUTHORED_AREA_CATALOGS } = {}) {
    const previewSectors = areaCatalogs.map((catalog, sectorIndex) => importPreviewSector(catalog, sectorIndex));
    return defineSectorCatalog({
        id: "authored-sector-catalog",
        revision: "authored-sector-catalog-v2",
        sectors: previewSectors,
        stageIdentities: [
            ...previewSectors.flatMap((sector) => previewStageIdentitiesFromSector(sector)),
            ...scenarioStageIdentities()
        ]
    });
}

export const AUTHORED_SECTOR_CATALOG = buildAuthoredSectorCatalog();

export function resolveAuthoredSectorEnemyEncounters({
    runSeed,
    worldRevision = AUTHORED_SECTOR_CATALOG.revision
} = {}) {
    return resolveSectorEnemyEncounters(AUTHORED_SECTOR_CATALOG, { runSeed, worldRevision });
}
