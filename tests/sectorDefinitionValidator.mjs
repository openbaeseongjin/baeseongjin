import assert from "node:assert/strict";
import { resolveObjectTriggerBounds } from "../src/game/world/areas/AreaDefinition.js";
import { validateSectorCatalog } from "../src/game/world/SectorDefinitionValidator.js";
import {
    buildLegacyAreaSectorPreviewCatalog,
    LEGACY_AREA_SECTOR_PREVIEW_CATALOG,
    PREVIEW_SECTOR_WIDTH
} from "../src/game/world/sectors/LegacyAreaSectorPreviewCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../src/game/world/areas/sector02/Sector02AreaCatalog.js";

function mutableCatalog() {
    return structuredClone(LEGACY_AREA_SECTOR_PREVIEW_CATALOG);
}

function expectedAliases() {
    const aliases = [];
    for (let sector = 1; sector <= 6; sector += 1) {
        for (let stage = 1; stage <= 8; stage += 1) {
            aliases.push(`${sector}-${stage}`);
        }
    }
    return aliases;
}

export function run() {
    assert.deepEqual(validateSectorCatalog(null), {
        valid: false,
        issues: [{ code: "sector-catalog-missing" }]
    });
    assert.deepEqual(validateSectorCatalog({ sectors: [] }), {
        valid: false,
        issues: [{ code: "sector-catalog-stage-aliases-missing" }]
    });

    assert.deepEqual(buildLegacyAreaSectorPreviewCatalog(), LEGACY_AREA_SECTOR_PREVIEW_CATALOG);
    assert.deepEqual(validateSectorCatalog(LEGACY_AREA_SECTOR_PREVIEW_CATALOG), { valid: true, issues: [] });

    assert.equal(LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors.length, 3);
    assert.deepEqual(
        LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors.map(({ id, width, runtimePreview }) => ({
            id,
            width,
            runtimePreview
        })),
        [
            { id: "sector-01", width: PREVIEW_SECTOR_WIDTH, runtimePreview: true },
            { id: "sector-02", width: PREVIEW_SECTOR_WIDTH, runtimePreview: true },
            { id: "sector-03", width: PREVIEW_SECTOR_WIDTH, runtimePreview: true }
        ]
    );
    assert.deepEqual(
        LEGACY_AREA_SECTOR_PREVIEW_CATALOG.stageAliases.map(({ legacyStageAlias }) => legacyStageAlias),
        expectedAliases()
    );

    const stage11 = LEGACY_AREA_SECTOR_PREVIEW_CATALOG.stageAliases.find(
        ({ legacyStageAlias }) => legacyStageAlias === "1-1"
    );
    assert.deepEqual(stage11, {
        legacyStageAlias: "1-1",
        sectorId: "sector-01",
        landmarkId: "sector-01:landmark:01",
        objectiveIds: ["sector-01:landmark:01:objective:terminal-read"],
        encounterIds: [],
        runtimePreview: true
    });

    const stage61 = LEGACY_AREA_SECTOR_PREVIEW_CATALOG.stageAliases.find(
        ({ legacyStageAlias }) => legacyStageAlias === "6-1"
    );
    assert.deepEqual(stage61, {
        legacyStageAlias: "6-1",
        sectorId: "sector-06",
        landmarkId: "sector-06:landmark:01",
        objectiveIds: [],
        encounterIds: [],
        runtimePreview: false
    });

    const sector02 = LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors.find(({ id }) => id === "sector-02");
    assert.equal(sector02.landmarks.length, 8);
    assert.equal(sector02.landmarks[1].legacyStageAlias, "2-2");
    assert.equal(sector02.landmarks[1].subregionBounds.width, PREVIEW_SECTOR_WIDTH / 8);

    const legacyDrone = SECTOR_02_AREA_CATALOG.areas[1].objects.find(({ id }) => id === "sector-02-02:drone-1");
    const importedEncounter = sector02.landmarks[1].encounters.find(
        ({ slotId }) => slotId === "sector-02:landmark:02:slot:drone-1"
    );
    assert.deepEqual(importedEncounter.position, legacyDrone.position);
    assert.deepEqual(
        importedEncounter.activation,
        resolveObjectTriggerBounds(legacyDrone.position, legacyDrone.activationSpec)
    );
    assert.equal("areaId" in importedEncounter, false);
    assert.equal(importedEncounter.encounterId, "sector-02:landmark:02:encounter:drone-1");
    assert.deepEqual(importedEncounter.enemySelection, { fixedEnemyType: "patrol-drone-t1" });
    assert.equal(importedEncounter.legacyStageAlias, "2-2");
    assert.equal(Object.isFrozen(importedEncounter), true);
    assert.equal(Object.isFrozen(importedEncounter.enemySelection), true);

    const missingSectorEntry = mutableCatalog();
    missingSectorEntry.sectors[0].sectorEntry.landmarkId = "sector-01:landmark:99";
    assert.ok(
        validateSectorCatalog(missingSectorEntry).issues.some(({ code }) => code === "sector-entry-landmark-missing")
    );

    const invalidWidth = mutableCatalog();
    invalidWidth.sectors[0].width = 3200;
    assert.ok(validateSectorCatalog(invalidWidth).issues.some(({ code }) => code === "sector-width-range"));

    const missingSectorEntryId = mutableCatalog();
    missingSectorEntryId.sectors[0].sectorEntry.id = "";
    assert.ok(
        validateSectorCatalog(missingSectorEntryId).issues.some(({ code }) => code === "sector-entry-id-missing")
    );

    const duplicateSlot = mutableCatalog();
    const duplicateSlotEncounters = duplicateSlot.sectors
        .flatMap((sector) => sector.landmarks)
        .flatMap((landmark) => landmark.encounters);
    duplicateSlotEncounters[1].slotId = duplicateSlotEncounters[0].slotId;
    assert.ok(validateSectorCatalog(duplicateSlot).issues.some(({ code }) => code === "encounter-slot-duplicate"));

    const missingEncounterId = mutableCatalog();
    missingEncounterId.sectors[1].landmarks[1].encounters[0].encounterId = "";
    assert.ok(validateSectorCatalog(missingEncounterId).issues.some(({ code }) => code === "encounter-id-missing"));

    const missingSlotId = mutableCatalog();
    missingSlotId.sectors[1].landmarks[1].encounters[0].slotId = "";
    assert.ok(validateSectorCatalog(missingSlotId).issues.some(({ code }) => code === "encounter-slot-id-missing"));

    const duplicateAlias = mutableCatalog();
    duplicateAlias.stageAliases[1].legacyStageAlias = duplicateAlias.stageAliases[0].legacyStageAlias;
    assert.ok(validateSectorCatalog(duplicateAlias).issues.some(({ code }) => code === "stage-alias-duplicate"));

    const incompleteCoverage = mutableCatalog();
    incompleteCoverage.stageAliases.pop();
    assert.ok(
        validateSectorCatalog(incompleteCoverage).issues.some(({ code }) => code === "stage-alias-coverage-missing")
    );

    const unknownAlias = mutableCatalog();
    unknownAlias.stageAliases[0].legacyStageAlias = "7-1";
    assert.ok(validateSectorCatalog(unknownAlias).issues.some(({ code }) => code === "stage-alias-unknown"));

    const forbiddenAreaAuthority = mutableCatalog();
    forbiddenAreaAuthority.sectors[1].landmarks[1].encounters[0].areaId = "sector-02-02";
    assert.ok(
        validateSectorCatalog(forbiddenAreaAuthority).issues.some(({ code }) => code === "encounter-area-authority")
    );

    const nestedForbiddenAreaAuthority = mutableCatalog();
    nestedForbiddenAreaAuthority.sectors[1].landmarks[1].encounters[0].enemySelection.areaId = "sector-02-02";
    assert.ok(
        validateSectorCatalog(nestedForbiddenAreaAuthority).issues.some(
            ({ code }) => code === "encounter-area-authority"
        )
    );

    const pooledSelection = mutableCatalog();
    pooledSelection.sectors[1].landmarks[1].encounters[0].enemySelection = {
        allowedEnemyTypes: ["pursuit-drone-t1", "shield-drone-t1"]
    };
    assert.deepEqual(validateSectorCatalog(pooledSelection), { valid: true, issues: [] });

    const missingSelectionSource = mutableCatalog();
    missingSelectionSource.sectors[1].landmarks[1].encounters[0].enemySelection = {};
    assert.ok(
        validateSectorCatalog(missingSelectionSource).issues.some(({ code }) => code === "encounter-selection-source")
    );

    const ambiguousSelection = mutableCatalog();
    ambiguousSelection.sectors[1].landmarks[1].encounters[0].enemySelection = {
        fixedEnemyType: "patrol-drone-t1",
        allowedEnemyTypes: ["shield-drone-t1"]
    };
    assert.ok(
        validateSectorCatalog(ambiguousSelection).issues.some(({ code }) => code === "encounter-selection-source")
    );

    const invalidFixedSelection = mutableCatalog();
    invalidFixedSelection.sectors[1].landmarks[1].encounters[0].enemySelection = {
        fixedEnemyType: ""
    };
    assert.ok(
        validateSectorCatalog(invalidFixedSelection).issues.some(
            ({ code }) => code === "encounter-selection-fixed-type"
        )
    );

    const emptyPoolSelection = mutableCatalog();
    emptyPoolSelection.sectors[1].landmarks[1].encounters[0].enemySelection = {
        allowedEnemyTypes: []
    };
    assert.ok(
        validateSectorCatalog(emptyPoolSelection).issues.some(({ code }) => code === "encounter-selection-pool-empty")
    );

    const invalidPoolSelection = mutableCatalog();
    invalidPoolSelection.sectors[1].landmarks[1].encounters[0].enemySelection = {
        allowedEnemyTypes: [""]
    };
    assert.ok(
        validateSectorCatalog(invalidPoolSelection).issues.some(({ code }) => code === "encounter-selection-pool-type")
    );

    const duplicatePoolSelection = mutableCatalog();
    duplicatePoolSelection.sectors[1].landmarks[1].encounters[0].enemySelection = {
        allowedEnemyTypes: ["shield-drone-t1", "shield-drone-t1"]
    };
    assert.ok(
        validateSectorCatalog(duplicatePoolSelection).issues.some(
            ({ code }) => code === "encounter-selection-pool-duplicate"
        )
    );
}
