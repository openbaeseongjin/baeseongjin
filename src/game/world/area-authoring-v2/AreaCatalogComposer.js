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

function indexAreas(areas, source) {
    if (!Array.isArray(areas)) throw new AreaCatalogCompositionError(`${source}-areas-invalid`);
    const byAreaId = new Map();
    for (const area of areas) {
        if (typeof area?.id !== "string" || area.id.length === 0) {
            throw new AreaCatalogCompositionError(`${source}-area-id-invalid`);
        }
        if (byAreaId.has(area.id)) throw new AreaCatalogCompositionError(`${source}-area-duplicate`, { areaId: area.id });
        byAreaId.set(area.id, area);
    }
    return byAreaId;
}

export function composeSectorCatalog({ id, revision, manifest, legacyAreas, generatedAreas, expectedStageIds }) {
    const validation = validateAreaCatalogManifest(manifest, { expectedStageIds });
    if (!validation.valid) {
        const [firstIssue] = validation.issues;
        throw new AreaCatalogCompositionError(firstIssue.code, firstIssue);
    }
    const legacyByAreaId = indexAreas(legacyAreas, "legacy");
    const generatedByAreaId = indexAreas(generatedAreas, "generated");
    const generatedEntryAreaIds = new Set(
        manifest.stageSources.filter(({ source }) => source === "generated").map(({ areaId }) => areaId)
    );
    for (const areaId of generatedByAreaId.keys()) {
        if (!generatedEntryAreaIds.has(areaId)) {
            throw new AreaCatalogCompositionError("generated-area-unselected", { areaId });
        }
    }

    const areas = manifest.stageSources.map((entry) => {
        const selected = entry.source === "legacy" ? legacyByAreaId.get(entry.areaId) : generatedByAreaId.get(entry.areaId);
        if (!selected) throw new AreaCatalogCompositionError(`${entry.source}-area-missing`, { areaId: entry.areaId });
        return selected;
    });
    return defineAreaCatalog({ id, revision, areas });
}
