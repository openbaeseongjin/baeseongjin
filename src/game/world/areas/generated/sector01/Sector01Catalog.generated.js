// GENERATED FILE - DO NOT EDIT
// Source: docs/bsh/scenario/AREA-CATALOG.json
import { GENERATED_AREA as STAGE_1_1 } from "./Sector01Stage01.generated.js";
import { GENERATED_AREA as STAGE_1_7 } from "./Sector01Stage07.generated.js";

// JSON ordering and formatting are deterministic generator output.
// prettier-ignore
const MANIFEST = {
  "catalogId": "sector-01",
  "catalogOutputPath": "src/game/world/areas/generated/sector01/Sector01Catalog.generated.js",
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
      "sectorId": "sector-01",
      "source": "legacy",
      "sourcePath": "src/game/world/areas/sector01/Sector01LegacyAreaCatalog.js",
      "stageId": "1-2"
    },
    {
      "areaId": "sector-01-03",
      "sectorId": "sector-01",
      "source": "legacy",
      "sourcePath": "src/game/world/areas/sector01/Sector01LegacyAreaCatalog.js",
      "stageId": "1-3"
    },
    {
      "areaId": "sector-01-04",
      "sectorId": "sector-01",
      "source": "legacy",
      "sourcePath": "src/game/world/areas/sector01/Sector01LegacyAreaCatalog.js",
      "stageId": "1-4"
    },
    {
      "areaId": "sector-01-05",
      "sectorId": "sector-01",
      "source": "legacy",
      "sourcePath": "src/game/world/areas/sector01/Sector01LegacyAreaCatalog.js",
      "stageId": "1-5"
    },
    {
      "areaId": "sector-01-06",
      "sectorId": "sector-01",
      "source": "legacy",
      "sourcePath": "src/game/world/areas/sector01/Sector01LegacyAreaCatalog.js",
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
      "sectorId": "sector-01",
      "source": "legacy",
      "sourcePath": "src/game/world/areas/sector01/Sector01LegacyAreaCatalog.js",
      "stageId": "1-8"
    }
  ]
};

export const GENERATED_AREA_CATALOG_MANIFEST = Object.freeze(MANIFEST);
export const GENERATED_AREAS = Object.freeze([STAGE_1_1, STAGE_1_7]);
