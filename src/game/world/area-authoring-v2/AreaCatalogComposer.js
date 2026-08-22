import { defineAreaCatalog } from "../areas/AreaDefinition.js";
import { validateAreaCatalogManifest } from "./AreaCatalogManifest.js";

export class AreaCatalogCompositionError extends Error {
    constructor(code, details = {}) {
        super(code);
        this.name = "AreaCatalogCompositionError";
        this.code = code;
        this.details = Object.freeze(details);
    }
}

function indexGeneratedAreas(areas) {
    if (!Array.isArray(areas)) throw new AreaCatalogCompositionError("generated-areas-invalid");
    const byAreaId = Object.create(null);
    for (const area of areas) {
        if (typeof area?.id !== "string" || area.id.length === 0) {
            throw new AreaCatalogCompositionError("generated-area-id-invalid");
        }
        if (Object.hasOwn(byAreaId, area.id)) {
            throw new AreaCatalogCompositionError("generated-area-duplicate", { areaId: area.id });
        }
        byAreaId[area.id] = area;
    }
    return byAreaId;
}

export function composeSectorCatalog({ manifest, generatedAreas, expectedStageIds }) {
    const validation = validateAreaCatalogManifest(manifest, { expectedStageIds });
    if (!validation.valid) {
        const [firstIssue] = validation.issues;
        throw new AreaCatalogCompositionError(firstIssue.code, firstIssue);
    }
    const generatedByAreaId = indexGeneratedAreas(generatedAreas);
    const selectedAreaIds = Object.freeze(
        Object.fromEntries(manifest.stageSources.map(({ areaId }) => [areaId, true]))
    );
    for (const areaId of Object.keys(generatedByAreaId)) {
        if (!selectedAreaIds[areaId]) {
            throw new AreaCatalogCompositionError("generated-area-unselected", { areaId });
        }
    }

    const areas = manifest.stageSources.map((entry) => {
        const selected = generatedByAreaId[entry.areaId];
        if (!selected) throw new AreaCatalogCompositionError("generated-area-missing", { areaId: entry.areaId });
        return selected;
    });
    return defineAreaCatalog({ id: manifest.catalogId, revision: manifest.catalogRevision, areas });
}
