// GENERATED FILE - DO NOT EDIT
// Source: docs/bsh/scenario/AREA-CATALOG.json
import { defineAreaCatalog } from "../../AreaDefinition.js";
import { GENERATED_AREA as STAGE_5_1 } from "./Sector05Stage01.generated.js";
import { GENERATED_AREA as STAGE_5_2 } from "./Sector05Stage02.generated.js";
import { GENERATED_AREA as STAGE_5_3 } from "./Sector05Stage03.generated.js";
import { GENERATED_AREA as STAGE_5_4 } from "./Sector05Stage04.generated.js";
import { GENERATED_AREA as STAGE_5_5 } from "./Sector05Stage05.generated.js";
import { GENERATED_AREA as STAGE_5_6 } from "./Sector05Stage06.generated.js";
import { GENERATED_AREA as STAGE_5_7 } from "./Sector05Stage07.generated.js";
import { GENERATED_AREA as STAGE_5_8 } from "./Sector05Stage08.generated.js";

// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const MANIFEST = {
  "accessModuleRequirement": 0,
  "catalogId": "sector-05-continuity-control",
  "catalogOutputPath": "src/game/world/areas/generated/sector05/Sector05Catalog.generated.js",
  "catalogRevision": "sector-05-runtime-rev1",
  "contentBoundaryStageId": "5-8",
  "expectedStageIds": [
    "5-1",
    "5-2",
    "5-3",
    "5-4",
    "5-5",
    "5-6",
    "5-7",
    "5-8"
  ],
  "schemaVersion": "area-catalog-v2",
  "stageSources": [
    {
      "areaId": "sector-05-01",
      "outputPath": "src/game/world/areas/generated/sector05/Sector05Stage01.generated.js",
      "sectorId": "sector-05",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/5/5-1/AREA-SPEC.v2.json",
      "stageId": "5-1"
    },
    {
      "areaId": "sector-05-02",
      "outputPath": "src/game/world/areas/generated/sector05/Sector05Stage02.generated.js",
      "sectorId": "sector-05",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/5/5-2/AREA-SPEC.v2.json",
      "stageId": "5-2"
    },
    {
      "areaId": "sector-05-03",
      "outputPath": "src/game/world/areas/generated/sector05/Sector05Stage03.generated.js",
      "sectorId": "sector-05",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/5/5-3/AREA-SPEC.v2.json",
      "stageId": "5-3"
    },
    {
      "areaId": "sector-05-04",
      "outputPath": "src/game/world/areas/generated/sector05/Sector05Stage04.generated.js",
      "sectorId": "sector-05",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/5/5-4/AREA-SPEC.v2.json",
      "stageId": "5-4"
    },
    {
      "areaId": "sector-05-05",
      "outputPath": "src/game/world/areas/generated/sector05/Sector05Stage05.generated.js",
      "sectorId": "sector-05",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/5/5-5/AREA-SPEC.v2.json",
      "stageId": "5-5"
    },
    {
      "areaId": "sector-05-06",
      "outputPath": "src/game/world/areas/generated/sector05/Sector05Stage06.generated.js",
      "sectorId": "sector-05",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/5/5-6/AREA-SPEC.v2.json",
      "stageId": "5-6"
    },
    {
      "areaId": "sector-05-07",
      "outputPath": "src/game/world/areas/generated/sector05/Sector05Stage07.generated.js",
      "sectorId": "sector-05",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/5/5-7/AREA-SPEC.v2.json",
      "stageId": "5-7"
    },
    {
      "areaId": "sector-05-08",
      "outputPath": "src/game/world/areas/generated/sector05/Sector05Stage08.generated.js",
      "sectorId": "sector-05",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/5/5-8/AREA-SPEC.v2.json",
      "stageId": "5-8"
    }
  ]
};

export const GENERATED_AREA_CATALOG_MANIFEST = Object.freeze(MANIFEST);
export const GENERATED_AREAS = Object.freeze([
    STAGE_5_1,
    STAGE_5_2,
    STAGE_5_3,
    STAGE_5_4,
    STAGE_5_5,
    STAGE_5_6,
    STAGE_5_7,
    STAGE_5_8
]);
export const GENERATED_AREA_CATALOG = defineAreaCatalog({
    id: GENERATED_AREA_CATALOG_MANIFEST.catalogId,
    revision: GENERATED_AREA_CATALOG_MANIFEST.catalogRevision,
    accessModuleRequirement: GENERATED_AREA_CATALOG_MANIFEST.accessModuleRequirement,
    contentBoundaryStageId: GENERATED_AREA_CATALOG_MANIFEST.contentBoundaryStageId ?? null,
    areas: GENERATED_AREAS
});
