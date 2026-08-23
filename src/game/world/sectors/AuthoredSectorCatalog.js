import { resolveObjectTriggerBounds } from "../areas/AreaDefinition.js";
import { resolveSectorEnemyEncounters } from "../EnemyEncounterSelection.js";
import { SECTOR_01_AREA_CATALOG } from "../areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../areas/sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "../areas/sector03/Sector03AreaCatalog.js";
import { SECTOR_04_AREA_CATALOG } from "../areas/sector04/Sector04AreaCatalog.js";
import { SECTOR_05_AREA_CATALOG } from "../areas/sector05/Sector05AreaCatalog.js";
import { SECTOR_06_AREA_CATALOG } from "../areas/sector06/Sector06AreaCatalog.js";
import { AUTHORED_RUNTIME_SECTOR_RANGE, authoredStageSectorId } from "../area-authoring-v2/AreaRuntimePromotion.js";
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
            accessModuleId: objective.accessModuleId,
            sources: objective.sources,
            requiredCount: objective.requiredCount,
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
                jammer: object.jammer,
                stageId
            });
        });
}

function importLandmark(area, landmarkIndex, contentBoundaryStageId) {
    const stageId = stageIdFromArea(area);
    const landmarkId = canonicalLandmarkId(area.sectorId, landmarkIndex + 1);
    const objectives = importObjectives(area, landmarkId, stageId);
    const objectiveIdByLocalId = Object.freeze(Object.fromEntries(objectives.map(({ id }) => [localId(id), id])));
    const contentBoundaryId = stageId === contentBoundaryStageId ? stageId : null;
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
        contentBoundaryId,
        contentBoundaryRequiredObjectiveIds: contentBoundaryId
            ? area.gate.requiredObjectiveIds.map((id) => objectiveIdByLocalId[localId(id)] ?? id)
            : [],
        objectives,
        encounters: importEncounters(area, landmarkId, stageId)
    });
}

function areaCatalogSectorIdentity(areaCatalog) {
    const sectorId = authoredStageSectorId(areaCatalog.areas[0]?.stageId);
    if (!sectorId || areaCatalog.areas.some(({ stageId }) => authoredStageSectorId(stageId) !== sectorId)) {
        throw new Error(`authored-area-catalog-sector-identity-invalid:${areaCatalog.id}`);
    }
    const order = Number(sectorId.slice("sector-".length));
    return Object.freeze({ id: canonicalSectorId(order), order });
}

function importPreviewSector(areaCatalog) {
    const sectorIdentity = areaCatalogSectorIdentity(areaCatalog);
    const sectorId = sectorIdentity.id;
    const landmarks = areaCatalog.areas.map((area, landmarkIndex) =>
        importLandmark(area, landmarkIndex, areaCatalog.contentBoundaryStageId)
    );
    return defineSector({
        id: sectorId,
        order: sectorIdentity.order,
        width: PREVIEW_SECTOR_WIDTH,
        runtimePreview: true,
        accessModuleRequirement: areaCatalog.accessModuleRequirement,
        contentBoundaryStageId: areaCatalog.contentBoundaryStageId,
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

function scenarioStageIdentities(runtimeStageIds) {
    const stageIdentities = [];
    for (
        let sectorNumber = AUTHORED_RUNTIME_SECTOR_RANGE.first;
        sectorNumber <= AUTHORED_RUNTIME_SECTOR_RANGE.last;
        sectorNumber += 1
    ) {
        const sectorId = canonicalSectorId(sectorNumber);
        for (let stageOrder = 1; stageOrder <= 8; stageOrder += 1) {
            const stageId = `${sectorNumber}-${stageOrder}`;
            if (runtimeStageIds[stageId]) continue;
            stageIdentities.push(
                stageIdentityRecord({
                    stageId,
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
    SECTOR_03_AREA_CATALOG,
    SECTOR_04_AREA_CATALOG,
    SECTOR_05_AREA_CATALOG,
    SECTOR_06_AREA_CATALOG
]);

export function buildAuthoredSectorCatalog({ areaCatalogs = DEFAULT_AUTHORED_AREA_CATALOGS } = {}) {
    const previewSectors = areaCatalogs.map((catalog) => importPreviewSector(catalog));
    const runtimeStageIds = Object.freeze(
        Object.fromEntries(previewSectors.flatMap((sector) => sector.landmarks.map(({ stageId }) => [stageId, true])))
    );
    return defineSectorCatalog({
        id: "authored-sector-catalog",
        revision: "authored-sector-catalog-v2",
        sectors: previewSectors,
        stageIdentities: [
            ...previewSectors.flatMap((sector) => previewStageIdentitiesFromSector(sector)),
            ...scenarioStageIdentities(runtimeStageIds)
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
