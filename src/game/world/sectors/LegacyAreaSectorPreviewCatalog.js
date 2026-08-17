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
    stageAliasRecord,
    subregionBounds
} from "./SectorDefinition.js";

export const PREVIEW_SECTOR_WIDTH = PREVIEW_SECTOR_WIDTH_RANGE.max;
const PREVIEW_LANDMARK_WIDTH = PREVIEW_SECTOR_WIDTH / 8;

function legacyStageAliasFromArea(area) {
    return `${Number.parseInt(area.sectorId.slice(-2), 10)}-${area.order}`;
}

function legacyLocalId(id) {
    return id.split(":").at(-1);
}

function importObjectives(area, landmarkId, legacyStageAlias) {
    const objectiveIdMap = new Map(
        area.objectives.map((objective) => [
            objective.id,
            canonicalObjectiveId(landmarkId, legacyLocalId(objective.id))
        ])
    );
    return area.objectives.map((objective) =>
        sectorObjective({
            id: objectiveIdMap.get(objective.id),
            type: objective.type,
            bounds: objective.bounds ?? null,
            requiredObjectiveIds: (objective.requiredObjectiveIds ?? []).map((requiredId) =>
                objectiveIdMap.get(requiredId)
            ),
            completionDelaySeconds: objective.completionDelaySeconds,
            sourceObjectId: objective.sourceObjectId,
            legacyStageAlias
        })
    );
}

function importEncounters(area, landmarkId, legacyStageAlias) {
    return area.objects
        .filter(({ kind }) => kind === "sentry" || kind === "patrol-drone")
        .map((object) => {
            const localId = legacyLocalId(object.id);
            return encounterSlot({
                encounterId: canonicalEncounterId(landmarkId, localId),
                slotId: canonicalEncounterSlotId(landmarkId, localId),
                position: object.position,
                activation: object.activation
                    ? object.activation
                    : object.activationSpec
                      ? resolveObjectTriggerBounds(object.position, object.activationSpec)
                      : null,
                enemySelection: {
                    fixedEnemyType: object.enemyType ?? object.kind
                },
                legacyStageAlias
            });
        });
}

function importLandmark(area, landmarkIndex) {
    const legacyStageAlias = legacyStageAliasFromArea(area);
    const landmarkId = canonicalLandmarkId(area.sectorId, landmarkIndex + 1);
    return landmark({
        id: landmarkId,
        order: landmarkIndex + 1,
        name: area.name,
        subtitle: area.subtitle,
        legacyStageAlias,
        localBounds: localBounds(area.bounds.width, area.bounds.height),
        subregionBounds: subregionBounds(
            landmarkIndex * PREVIEW_LANDMARK_WIDTH,
            -area.bounds.height,
            PREVIEW_LANDMARK_WIDTH,
            area.bounds.height
        ),
        entry: area.entry,
        exit: area.exit,
        objectives: importObjectives(area, landmarkId, legacyStageAlias),
        encounters: importEncounters(area, landmarkId, legacyStageAlias)
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
            legacyStageAlias: landmarks[0].legacyStageAlias
        }),
        landmarks
    });
}

function previewStageAliasesFromSector(sector) {
    return sector.landmarks.map((landmark) =>
        stageAliasRecord({
            legacyStageAlias: landmark.legacyStageAlias,
            sectorId: sector.id,
            landmarkId: landmark.id,
            objectiveIds: landmark.objectives.map(({ id }) => id),
            encounterIds: landmark.encounters.map(({ encounterId }) => encounterId),
            runtimePreview: true
        })
    );
}

function futureStageAliases() {
    const aliases = [];
    for (let sectorNumber = 4; sectorNumber <= 6; sectorNumber += 1) {
        const sectorId = canonicalSectorId(sectorNumber);
        for (let stageOrder = 1; stageOrder <= 8; stageOrder += 1) {
            aliases.push(
                stageAliasRecord({
                    legacyStageAlias: `${sectorNumber}-${stageOrder}`,
                    sectorId,
                    landmarkId: canonicalLandmarkId(sectorId, stageOrder),
                    objectiveIds: [],
                    encounterIds: [],
                    runtimePreview: false
                })
            );
        }
    }
    return aliases;
}

export function buildLegacyAreaSectorPreviewCatalog() {
    const previewSectors = [SECTOR_01_AREA_CATALOG, SECTOR_02_AREA_CATALOG, SECTOR_03_AREA_CATALOG].map(
        (catalog, sectorIndex) => importPreviewSector(catalog, sectorIndex)
    );
    return defineSectorCatalog({
        id: "legacy-area-sector-preview",
        revision: "sector-preview-v1",
        sectors: previewSectors,
        stageAliases: [
            ...previewSectors.flatMap((sector) => previewStageAliasesFromSector(sector)),
            ...futureStageAliases()
        ]
    });
}

export const LEGACY_AREA_SECTOR_PREVIEW_CATALOG = buildLegacyAreaSectorPreviewCatalog();

export function resolveLegacyAreaSectorPreviewEnemyEncounters({
    runSeed,
    worldRevision = LEGACY_AREA_SECTOR_PREVIEW_CATALOG.revision
} = {}) {
    return resolveSectorEnemyEncounters(LEGACY_AREA_SECTOR_PREVIEW_CATALOG, { runSeed, worldRevision });
}
