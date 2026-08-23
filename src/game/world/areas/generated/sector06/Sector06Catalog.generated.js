// GENERATED FILE - DO NOT EDIT
// Source: docs/bsh/scenario/AREA-CATALOG.json
import { defineAreaCatalog } from "../../AreaDefinition.js";
import { GENERATED_AREA as STAGE_6_1 } from "./Sector06Stage01.generated.js";
import { GENERATED_AREA as STAGE_6_2 } from "./Sector06Stage02.generated.js";
import { GENERATED_AREA as STAGE_6_3 } from "./Sector06Stage03.generated.js";
import { GENERATED_AREA as STAGE_6_4 } from "./Sector06Stage04.generated.js";
import { GENERATED_AREA as STAGE_6_5 } from "./Sector06Stage05.generated.js";
import { GENERATED_AREA as STAGE_6_6 } from "./Sector06Stage06.generated.js";
import { GENERATED_AREA as STAGE_6_7 } from "./Sector06Stage07.generated.js";
import { GENERATED_AREA as STAGE_6_8 } from "./Sector06Stage08.generated.js";

// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const MANIFEST = {
  "accessModuleRequirement": 0,
  "catalogId": "sector-06-rooftop-evacuation",
  "catalogOutputPath": "src/game/world/areas/generated/sector06/Sector06Catalog.generated.js",
  "catalogRevision": "sector-06-runtime-rev1",
  "contentBoundaryStageId": "6-8",
  "expectedStageIds": [
    "6-1",
    "6-2",
    "6-3",
    "6-4",
    "6-5",
    "6-6",
    "6-7",
    "6-8"
  ],
  "schemaVersion": "area-catalog-v2",
  "stageSources": [
    {
      "areaId": "sector-06-01",
      "outputPath": "src/game/world/areas/generated/sector06/Sector06Stage01.generated.js",
      "sectorId": "sector-06",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/6/6-1/AREA-SPEC.v2.json",
      "stageId": "6-1"
    },
    {
      "areaId": "sector-06-02",
      "outputPath": "src/game/world/areas/generated/sector06/Sector06Stage02.generated.js",
      "sectorId": "sector-06",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/6/6-2/AREA-SPEC.v2.json",
      "stageId": "6-2"
    },
    {
      "areaId": "sector-06-03",
      "outputPath": "src/game/world/areas/generated/sector06/Sector06Stage03.generated.js",
      "sectorId": "sector-06",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/6/6-3/AREA-SPEC.v2.json",
      "stageId": "6-3"
    },
    {
      "areaId": "sector-06-04",
      "outputPath": "src/game/world/areas/generated/sector06/Sector06Stage04.generated.js",
      "sectorId": "sector-06",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/6/6-4/AREA-SPEC.v2.json",
      "stageId": "6-4"
    },
    {
      "areaId": "sector-06-05",
      "outputPath": "src/game/world/areas/generated/sector06/Sector06Stage05.generated.js",
      "sectorId": "sector-06",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/6/6-5/AREA-SPEC.v2.json",
      "stageId": "6-5"
    },
    {
      "areaId": "sector-06-06",
      "outputPath": "src/game/world/areas/generated/sector06/Sector06Stage06.generated.js",
      "sectorId": "sector-06",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/6/6-6/AREA-SPEC.v2.json",
      "stageId": "6-6"
    },
    {
      "areaId": "sector-06-07",
      "outputPath": "src/game/world/areas/generated/sector06/Sector06Stage07.generated.js",
      "sectorId": "sector-06",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/6/6-7/AREA-SPEC.v2.json",
      "stageId": "6-7"
    },
    {
      "areaId": "sector-06-08",
      "outputPath": "src/game/world/areas/generated/sector06/Sector06Stage08.generated.js",
      "sectorId": "sector-06",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/6/6-8/AREA-SPEC.v2.json",
      "stageId": "6-8"
    }
  ]
};

export const GENERATED_AREA_CATALOG_MANIFEST = Object.freeze(MANIFEST);
export const GENERATED_AREAS = Object.freeze([
    STAGE_6_1,
    STAGE_6_2,
    STAGE_6_3,
    STAGE_6_4,
    STAGE_6_5,
    STAGE_6_6,
    STAGE_6_7,
    STAGE_6_8
]);
export const GENERATED_AREA_CATALOG = defineAreaCatalog({
    id: GENERATED_AREA_CATALOG_MANIFEST.catalogId,
    revision: GENERATED_AREA_CATALOG_MANIFEST.catalogRevision,
    accessModuleRequirement: GENERATED_AREA_CATALOG_MANIFEST.accessModuleRequirement,
    contentBoundaryStageId: GENERATED_AREA_CATALOG_MANIFEST.contentBoundaryStageId ?? null,
    areas: GENERATED_AREAS
});
