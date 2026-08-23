// GENERATED FILE - DO NOT EDIT
// Source: docs/bsh/scenario/AREA-CATALOG.json
import { defineAreaCatalog } from "../../AreaDefinition.js";
import { GENERATED_AREA as STAGE_4_1 } from "./Sector04Stage01.generated.js";
import { GENERATED_AREA as STAGE_4_2 } from "./Sector04Stage02.generated.js";
import { GENERATED_AREA as STAGE_4_3 } from "./Sector04Stage03.generated.js";
import { GENERATED_AREA as STAGE_4_4 } from "./Sector04Stage04.generated.js";
import { GENERATED_AREA as STAGE_4_5 } from "./Sector04Stage05.generated.js";
import { GENERATED_AREA as STAGE_4_6 } from "./Sector04Stage06.generated.js";
import { GENERATED_AREA as STAGE_4_7 } from "./Sector04Stage07.generated.js";
import { GENERATED_AREA as STAGE_4_8 } from "./Sector04Stage08.generated.js";

// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const MANIFEST = {
  "accessModuleRequirement": 2,
  "catalogId": "sector-04-upper-residential",
  "catalogOutputPath": "src/game/world/areas/generated/sector04/Sector04Catalog.generated.js",
  "catalogRevision": "sector-04-runtime-rev1",
  "contentBoundaryStageId": "4-8",
  "expectedStageIds": [
    "4-1",
    "4-2",
    "4-3",
    "4-4",
    "4-5",
    "4-6",
    "4-7",
    "4-8"
  ],
  "schemaVersion": "area-catalog-v2",
  "stageSources": [
    {
      "areaId": "sector-04-01",
      "outputPath": "src/game/world/areas/generated/sector04/Sector04Stage01.generated.js",
      "sectorId": "sector-04",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/4/4-1/AREA-SPEC.v2.json",
      "stageId": "4-1"
    },
    {
      "areaId": "sector-04-02",
      "outputPath": "src/game/world/areas/generated/sector04/Sector04Stage02.generated.js",
      "sectorId": "sector-04",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/4/4-2/AREA-SPEC.v2.json",
      "stageId": "4-2"
    },
    {
      "areaId": "sector-04-03",
      "outputPath": "src/game/world/areas/generated/sector04/Sector04Stage03.generated.js",
      "sectorId": "sector-04",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/4/4-3/AREA-SPEC.v2.json",
      "stageId": "4-3"
    },
    {
      "areaId": "sector-04-04",
      "outputPath": "src/game/world/areas/generated/sector04/Sector04Stage04.generated.js",
      "sectorId": "sector-04",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/4/4-4/AREA-SPEC.v2.json",
      "stageId": "4-4"
    },
    {
      "areaId": "sector-04-05",
      "outputPath": "src/game/world/areas/generated/sector04/Sector04Stage05.generated.js",
      "sectorId": "sector-04",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/4/4-5/AREA-SPEC.v2.json",
      "stageId": "4-5"
    },
    {
      "areaId": "sector-04-06",
      "outputPath": "src/game/world/areas/generated/sector04/Sector04Stage06.generated.js",
      "sectorId": "sector-04",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/4/4-6/AREA-SPEC.v2.json",
      "stageId": "4-6"
    },
    {
      "areaId": "sector-04-07",
      "outputPath": "src/game/world/areas/generated/sector04/Sector04Stage07.generated.js",
      "sectorId": "sector-04",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/4/4-7/AREA-SPEC.v2.json",
      "stageId": "4-7"
    },
    {
      "areaId": "sector-04-08",
      "outputPath": "src/game/world/areas/generated/sector04/Sector04Stage08.generated.js",
      "sectorId": "sector-04",
      "source": "generated",
      "sourcePath": "docs/bsh/scenario/4/4-8/AREA-SPEC.v2.json",
      "stageId": "4-8"
    }
  ]
};

export const GENERATED_AREA_CATALOG_MANIFEST = Object.freeze(MANIFEST);
export const GENERATED_AREAS = Object.freeze([
    STAGE_4_1,
    STAGE_4_2,
    STAGE_4_3,
    STAGE_4_4,
    STAGE_4_5,
    STAGE_4_6,
    STAGE_4_7,
    STAGE_4_8
]);
export const GENERATED_AREA_CATALOG = defineAreaCatalog({
    id: GENERATED_AREA_CATALOG_MANIFEST.catalogId,
    revision: GENERATED_AREA_CATALOG_MANIFEST.catalogRevision,
    accessModuleRequirement: GENERATED_AREA_CATALOG_MANIFEST.accessModuleRequirement,
    contentBoundaryStageId: GENERATED_AREA_CATALOG_MANIFEST.contentBoundaryStageId ?? null,
    areas: GENERATED_AREAS
});
