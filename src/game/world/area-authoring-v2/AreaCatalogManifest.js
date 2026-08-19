export const AREA_CATALOG_MANIFEST_V2 = "area-catalog-v2";

function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function issue(issues, code, details = {}) {
    issues.push({ code, ...details });
}

function parseStageId(stageId) {
    const match = /^(\d+)-(\d+)$/.exec(stageId ?? "");
    if (!match) return null;
    return { sector: Number(match[1]), stage: Number(match[2]) };
}

function expectedIdentity(stageId) {
    const parsed = parseStageId(stageId);
    if (!parsed) return null;
    return {
        areaId: `sector-${String(parsed.sector).padStart(2, "0")}-${String(parsed.stage).padStart(2, "0")}`,
        sectorId: `sector-${String(parsed.sector).padStart(2, "0")}`
    };
}

function validPath(value) {
    return typeof value === "string" && value.length > 0 && !value.startsWith("/") && !/^[A-Za-z]:[\\/]/.test(value);
}

export function validateAreaCatalogManifest(
    manifest,
    { expectedStageIds = [], sourcePathExists = null, requireGeneratedOutputs = false } = {}
) {
    const issues = [];
    if (!isPlainObject(manifest)) {
        issue(issues, "manifest-not-object");
        return freezeValue({ valid: false, issues });
    }
    if (manifest.schemaVersion !== AREA_CATALOG_MANIFEST_V2) {
        issue(issues, "manifest-schema-version", { schemaVersion: manifest.schemaVersion ?? null });
    }
    if (typeof manifest.catalogId !== "string" || !/^sector-\d{2}$/.test(manifest.catalogId)) {
        issue(issues, "manifest-catalog-id");
    }
    if (!Array.isArray(manifest.stageSources)) {
        issue(issues, "manifest-stage-sources-invalid");
        return freezeValue({ valid: false, issues });
    }

    const sourceByStageId = new Map();
    const areaIds = new Set();
    for (const entry of manifest.stageSources) {
        if (!isPlainObject(entry)) {
            issue(issues, "manifest-entry-invalid");
            continue;
        }
        const identity = expectedIdentity(entry.stageId);
        if (!identity) {
            issue(issues, "manifest-stage-id-invalid", { stageId: entry.stageId ?? null });
            continue;
        }
        if (sourceByStageId.has(entry.stageId)) issue(issues, "manifest-stage-duplicate", { stageId: entry.stageId });
        sourceByStageId.set(entry.stageId, entry);
        if (areaIds.has(entry.areaId)) issue(issues, "manifest-area-duplicate", { areaId: entry.areaId ?? null });
        areaIds.add(entry.areaId);
        if (entry.areaId !== identity.areaId || entry.sectorId !== identity.sectorId) {
            issue(issues, "manifest-identity-mismatch", {
                stageId: entry.stageId,
                expectedAreaId: identity.areaId,
                expectedSectorId: identity.sectorId
            });
        }
        if (entry.source !== "legacy" && entry.source !== "generated") {
            issue(issues, "manifest-source-invalid", { stageId: entry.stageId, source: entry.source ?? null });
        }
        if (!validPath(entry.sourcePath)) {
            issue(issues, "manifest-source-path-invalid", { stageId: entry.stageId });
        } else if (sourcePathExists && !sourcePathExists(entry.sourcePath)) {
            issue(issues, "manifest-source-path-missing", { stageId: entry.stageId, sourcePath: entry.sourcePath });
        }
        if (entry.source === "generated" && !validPath(entry.outputPath)) {
            issue(issues, "manifest-generated-output-path-invalid", { stageId: entry.stageId });
        } else if (
            entry.source === "generated" &&
            requireGeneratedOutputs &&
            sourcePathExists &&
            !sourcePathExists(entry.outputPath)
        ) {
            issue(issues, "manifest-generated-output-missing", { stageId: entry.stageId, outputPath: entry.outputPath });
        }
        if (Object.hasOwn(entry, "overlay")) issue(issues, "manifest-overlay-forbidden", { stageId: entry.stageId });
    }

    for (const stageId of expectedStageIds) {
        if (!sourceByStageId.has(stageId)) issue(issues, "manifest-stage-missing", { stageId });
    }
    for (const stageId of sourceByStageId.keys()) {
        if (expectedStageIds.length > 0 && !expectedStageIds.includes(stageId)) {
            issue(issues, "manifest-stage-unexpected", { stageId });
        }
    }
    return freezeValue({ valid: issues.length === 0, issues });
}
