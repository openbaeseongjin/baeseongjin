// GENERATED FILE - DO NOT EDIT
// Source: docs/bsh/scenario/AREA-CATALOG.json
import { defineAreaCatalog } from "../../AreaDefinition.js";
import { GENERATED_AREA as STAGE_2_1 } from "./Sector02Stage01.generated.js";
import { GENERATED_AREA as STAGE_2_2 } from "./Sector02Stage02.generated.js";
import { GENERATED_AREA as STAGE_2_3 } from "./Sector02Stage03.generated.js";
import { GENERATED_AREA as STAGE_2_4 } from "./Sector02Stage04.generated.js";
import { GENERATED_AREA as STAGE_2_5 } from "./Sector02Stage05.generated.js";
import { GENERATED_AREA as STAGE_2_6 } from "./Sector02Stage06.generated.js";
import { GENERATED_AREA as STAGE_2_7 } from "./Sector02Stage07.generated.js";
import { GENERATED_AREA as STAGE_2_8 } from "./Sector02Stage08.generated.js";

// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const MANIFEST = {
  "accessModuleRequirement": 3,
  "catalogId": "sector-02-authored-mock",
  "catalogOutputPath": "src/game/world/areas/generated/sector02/Sector02Catalog.generated.js",
  "catalogRevision": "sector-02-scenarios-rev1-v2-v2-generated",
  "expectedStageIds": [
    "2-1",
    "2-2",
    "2-3",
    "2-4",
    "2-5",
    "2-6",
    "2-7",
    "2-8"
  ],
  "schemaVersion": "area-catalog-v2",
  "stageSources": [
    {
      "areaId": "sector-02-01",
      "outputPath": "src/game/world/areas/generated/sector02/Sector02Stage01.generated.js",
      "sectorId": "sector-02",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/2/2-1/AREA-SPEC.v2.json",
      "stageId": "2-1"
    },
    {
      "areaId": "sector-02-02",
      "outputPath": "src/game/world/areas/generated/sector02/Sector02Stage02.generated.js",
      "sectorId": "sector-02",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/2/2-2/AREA-SPEC.v2.json",
      "stageId": "2-2"
    },
    {
      "areaId": "sector-02-03",
      "outputPath": "src/game/world/areas/generated/sector02/Sector02Stage03.generated.js",
      "sectorId": "sector-02",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/2/2-3/AREA-SPEC.v2.json",
      "stageId": "2-3"
    },
    {
      "areaId": "sector-02-04",
      "outputPath": "src/game/world/areas/generated/sector02/Sector02Stage04.generated.js",
      "sectorId": "sector-02",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/2/2-4/AREA-SPEC.v2.json",
      "stageId": "2-4"
    },
    {
      "areaId": "sector-02-05",
      "outputPath": "src/game/world/areas/generated/sector02/Sector02Stage05.generated.js",
      "sectorId": "sector-02",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/2/2-5/AREA-SPEC.v2.json",
      "stageId": "2-5"
    },
    {
      "areaId": "sector-02-06",
      "outputPath": "src/game/world/areas/generated/sector02/Sector02Stage06.generated.js",
      "sectorId": "sector-02",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/2/2-6/AREA-SPEC.v2.json",
      "stageId": "2-6"
    },
    {
      "areaId": "sector-02-07",
      "outputPath": "src/game/world/areas/generated/sector02/Sector02Stage07.generated.js",
      "sectorId": "sector-02",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/2/2-7/AREA-SPEC.v2.json",
      "stageId": "2-7"
    },
    {
      "areaId": "sector-02-08",
      "outputPath": "src/game/world/areas/generated/sector02/Sector02Stage08.generated.js",
      "sectorId": "sector-02",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/2/2-8/AREA-SPEC.v2.json",
      "stageId": "2-8"
    }
  ]
};

export const GENERATED_AREA_CATALOG_MANIFEST = Object.freeze(MANIFEST);
export const GENERATED_AREAS = Object.freeze([
    STAGE_2_1,
    STAGE_2_2,
    STAGE_2_3,
    STAGE_2_4,
    STAGE_2_5,
    STAGE_2_6,
    STAGE_2_7,
    STAGE_2_8
]);
export const GENERATED_AREA_CATALOG = defineAreaCatalog({
    id: GENERATED_AREA_CATALOG_MANIFEST.catalogId,
    revision: GENERATED_AREA_CATALOG_MANIFEST.catalogRevision,
    accessModuleRequirement: GENERATED_AREA_CATALOG_MANIFEST.accessModuleRequirement,
    contentBoundaryStageId: GENERATED_AREA_CATALOG_MANIFEST.contentBoundaryStageId ?? null,
    areas: GENERATED_AREAS
});
