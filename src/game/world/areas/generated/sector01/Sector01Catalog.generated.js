// GENERATED FILE - DO NOT EDIT
// Source: docs/bsh/scenario/AREA-CATALOG.json
import { defineAreaCatalog } from "../../AreaDefinition.js";
import { GENERATED_AREA as STAGE_1_1 } from "./Sector01Stage01.generated.js";
import { GENERATED_AREA as STAGE_1_2 } from "./Sector01Stage02.generated.js";
import { GENERATED_AREA as STAGE_1_3 } from "./Sector01Stage03.generated.js";
import { GENERATED_AREA as STAGE_1_4 } from "./Sector01Stage04.generated.js";
import { GENERATED_AREA as STAGE_1_5 } from "./Sector01Stage05.generated.js";
import { GENERATED_AREA as STAGE_1_6 } from "./Sector01Stage06.generated.js";
import { GENERATED_AREA as STAGE_1_7 } from "./Sector01Stage07.generated.js";
import { GENERATED_AREA as STAGE_1_8 } from "./Sector01Stage08.generated.js";

// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const MANIFEST = {
  "accessModuleRequirement": 3,
  "catalogId": "sector-01-authored-mock",
  "catalogOutputPath": "src/game/world/areas/generated/sector01/Sector01Catalog.generated.js",
  "catalogRevision": "sector-01-scenarios-rev3-v3-v2-stage01-stage07",
  "expectedStageIds": [
    "1-1",
    "1-2",
    "1-3",
    "1-4",
    "1-5",
    "1-6",
    "1-7",
    "1-8"
  ],
  "schemaVersion": "area-catalog-v2",
  "stageSources": [
    {
      "areaId": "sector-01-01",
      "outputPath": "src/game/world/areas/generated/sector01/Sector01Stage01.generated.js",
      "sectorId": "sector-01",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/1/1-1/AREA-SPEC.v2.json",
      "stageId": "1-1"
    },
    {
      "areaId": "sector-01-02",
      "outputPath": "src/game/world/areas/generated/sector01/Sector01Stage02.generated.js",
      "sectorId": "sector-01",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/1/1-2/AREA-SPEC.v2.json",
      "stageId": "1-2"
    },
    {
      "areaId": "sector-01-03",
      "outputPath": "src/game/world/areas/generated/sector01/Sector01Stage03.generated.js",
      "sectorId": "sector-01",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/1/1-3/AREA-SPEC.v2.json",
      "stageId": "1-3"
    },
    {
      "areaId": "sector-01-04",
      "outputPath": "src/game/world/areas/generated/sector01/Sector01Stage04.generated.js",
      "sectorId": "sector-01",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/1/1-4/AREA-SPEC.v2.json",
      "stageId": "1-4"
    },
    {
      "areaId": "sector-01-05",
      "outputPath": "src/game/world/areas/generated/sector01/Sector01Stage05.generated.js",
      "sectorId": "sector-01",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/1/1-5/AREA-SPEC.v2.json",
      "stageId": "1-5"
    },
    {
      "areaId": "sector-01-06",
      "outputPath": "src/game/world/areas/generated/sector01/Sector01Stage06.generated.js",
      "sectorId": "sector-01",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/1/1-6/AREA-SPEC.v2.json",
      "stageId": "1-6"
    },
    {
      "areaId": "sector-01-07",
      "outputPath": "src/game/world/areas/generated/sector01/Sector01Stage07.generated.js",
      "sectorId": "sector-01",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/1/1-7/AREA-SPEC.v2.json",
      "stageId": "1-7"
    },
    {
      "areaId": "sector-01-08",
      "outputPath": "src/game/world/areas/generated/sector01/Sector01Stage08.generated.js",
      "sectorId": "sector-01",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/1/1-8/AREA-SPEC.v2.json",
      "stageId": "1-8"
    }
  ]
};

export const GENERATED_AREA_CATALOG_MANIFEST = Object.freeze(MANIFEST);
export const GENERATED_AREAS = Object.freeze([
    STAGE_1_1,
    STAGE_1_2,
    STAGE_1_3,
    STAGE_1_4,
    STAGE_1_5,
    STAGE_1_6,
    STAGE_1_7,
    STAGE_1_8
]);
export const GENERATED_AREA_CATALOG = defineAreaCatalog({
    id: GENERATED_AREA_CATALOG_MANIFEST.catalogId,
    revision: GENERATED_AREA_CATALOG_MANIFEST.catalogRevision,
    accessModuleRequirement: GENERATED_AREA_CATALOG_MANIFEST.accessModuleRequirement,
    contentBoundaryStageId: GENERATED_AREA_CATALOG_MANIFEST.contentBoundaryStageId ?? null,
    areas: GENERATED_AREAS
});
