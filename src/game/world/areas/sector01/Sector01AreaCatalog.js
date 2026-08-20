import { composeSectorCatalog } from "../../area-authoring-v2/AreaCatalogComposer.js";
import { GENERATED_AREAS, GENERATED_AREA_CATALOG_MANIFEST } from "../generated/sector01/Sector01Catalog.generated.js";
import { SECTOR_01_LEGACY_AREA_CATALOG } from "./Sector01LegacyAreaCatalog.js";

export const SECTOR_01_AREA_CATALOG = composeSectorCatalog({
    id: SECTOR_01_LEGACY_AREA_CATALOG.id,
    revision: `${SECTOR_01_LEGACY_AREA_CATALOG.revision}-v2-stage01-stage07`,
    manifest: GENERATED_AREA_CATALOG_MANIFEST,
    legacyAreas: SECTOR_01_LEGACY_AREA_CATALOG.areas,
    generatedAreas: GENERATED_AREAS,
    expectedStageIds: GENERATED_AREA_CATALOG_MANIFEST.expectedStageIds
});
