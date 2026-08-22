// GENERATED FILE - DO NOT EDIT
// Source: docs/bsh/scenario/AREA-CATALOG.json
import { defineAreaCatalog } from "../../AreaDefinition.js";
import { GENERATED_AREA as STAGE_3_1 } from "./Sector03Stage01.generated.js";
import { GENERATED_AREA as STAGE_3_2 } from "./Sector03Stage02.generated.js";
import { GENERATED_AREA as STAGE_3_3 } from "./Sector03Stage03.generated.js";
import { GENERATED_AREA as STAGE_3_4 } from "./Sector03Stage04.generated.js";
import { GENERATED_AREA as STAGE_3_5 } from "./Sector03Stage05.generated.js";
import { GENERATED_AREA as STAGE_3_6 } from "./Sector03Stage06.generated.js";
import { GENERATED_AREA as STAGE_3_7 } from "./Sector03Stage07.generated.js";
import { GENERATED_AREA as STAGE_3_8 } from "./Sector03Stage08.generated.js";

// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const MANIFEST = {
  "catalogId": "sector-03",
  "catalogOutputPath": "src/game/world/areas/generated/sector03/Sector03Catalog.generated.js",
  "catalogRevision": "sector-03-scenarios-rev3-v2-generated",
  "expectedStageIds": [
    "3-1",
    "3-2",
    "3-3",
    "3-4",
    "3-5",
    "3-6",
    "3-7",
    "3-8"
  ],
  "schemaVersion": "area-catalog-v2",
  "stageSources": [
    {
      "areaId": "sector-03-01",
      "outputPath": "src/game/world/areas/generated/sector03/Sector03Stage01.generated.js",
      "sectorId": "sector-03",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/3/3-1/AREA-SPEC.v2.json",
      "stageId": "3-1"
    },
    {
      "areaId": "sector-03-02",
      "outputPath": "src/game/world/areas/generated/sector03/Sector03Stage02.generated.js",
      "sectorId": "sector-03",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/3/3-2/AREA-SPEC.v2.json",
      "stageId": "3-2"
    },
    {
      "areaId": "sector-03-03",
      "outputPath": "src/game/world/areas/generated/sector03/Sector03Stage03.generated.js",
      "sectorId": "sector-03",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/3/3-3/AREA-SPEC.v2.json",
      "stageId": "3-3"
    },
    {
      "areaId": "sector-03-04",
      "outputPath": "src/game/world/areas/generated/sector03/Sector03Stage04.generated.js",
      "sectorId": "sector-03",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/3/3-4/AREA-SPEC.v2.json",
      "stageId": "3-4"
    },
    {
      "areaId": "sector-03-05",
      "outputPath": "src/game/world/areas/generated/sector03/Sector03Stage05.generated.js",
      "sectorId": "sector-03",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/3/3-5/AREA-SPEC.v2.json",
      "stageId": "3-5"
    },
    {
      "areaId": "sector-03-06",
      "outputPath": "src/game/world/areas/generated/sector03/Sector03Stage06.generated.js",
      "sectorId": "sector-03",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/3/3-6/AREA-SPEC.v2.json",
      "stageId": "3-6"
    },
    {
      "areaId": "sector-03-07",
      "outputPath": "src/game/world/areas/generated/sector03/Sector03Stage07.generated.js",
      "sectorId": "sector-03",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/3/3-7/AREA-SPEC.v2.json",
      "stageId": "3-7"
    },
    {
      "areaId": "sector-03-08",
      "outputPath": "src/game/world/areas/generated/sector03/Sector03Stage08.generated.js",
      "sectorId": "sector-03",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/3/3-8/AREA-SPEC.v2.json",
      "stageId": "3-8"
    }
  ]
};

export const GENERATED_AREA_CATALOG_MANIFEST = Object.freeze(MANIFEST);
export const GENERATED_AREAS = Object.freeze([
    STAGE_3_1,
    STAGE_3_2,
    STAGE_3_3,
    STAGE_3_4,
    STAGE_3_5,
    STAGE_3_6,
    STAGE_3_7,
    STAGE_3_8
]);
export const GENERATED_AREA_CATALOG = defineAreaCatalog({
    id: GENERATED_AREA_CATALOG_MANIFEST.catalogId,
    revision: GENERATED_AREA_CATALOG_MANIFEST.catalogRevision,
    areas: GENERATED_AREAS
});
