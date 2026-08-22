import { areaSpecV2AuthoringMode, canonicalizeAreaSpecV2 } from "./AreaSpecV2.js";

const GENERATED_OUTPUT_ROOT = "src/game/world/areas/generated/";
const GENERATED_RUNTIME_IMPORT = "../../../area-authoring-v2/AreaSpecV2.js";
const GENERATED_CATALOG_IMPORT = "../../AreaDefinition.js";

function stableJson(value) {
    return JSON.stringify(value, null, 2).replaceAll("\n", "\r\n");
}

function directoryPath(path) {
    return path.slice(0, path.lastIndexOf("/") + 1);
}

function fileName(path) {
    return path.slice(path.lastIndexOf("/") + 1);
}

function generatedImportName(stageId) {
    return `STAGE_${stageId.replaceAll(/[^A-Za-z0-9]/g, "_")}`;
}

export function generatedModulePath(entry) {
    if (typeof entry?.outputPath !== "string" || !entry.outputPath.startsWith(GENERATED_OUTPUT_ROOT)) {
        throw new TypeError("generated-output-path-invalid");
    }
    if (entry.outputPath.includes("..") || !entry.outputPath.endsWith(".js")) {
        throw new TypeError("generated-output-path-invalid");
    }
    return entry.outputPath;
}

export function renderGeneratedAreaModule(spec) {
    const canonical = canonicalizeAreaSpecV2(spec);
    if (areaSpecV2AuthoringMode(canonical) !== "runtime") {
        throw new TypeError("scenario-area-spec-cannot-generate-runtime-module");
    }
    const stageId = canonical.stage?.id;
    const areaId = canonical.definition?.id;
    if (typeof stageId !== "string" || typeof areaId !== "string")
        throw new TypeError("generated-spec-identity-invalid");
    return [
        "// GENERATED FILE - DO NOT EDIT",
        `// Source: ${stageId} AREA-SPEC.v2.json`,
        `import { createAreaDefinitionFromV2 } from "${GENERATED_RUNTIME_IMPORT}";`,
        "",
        `export const GENERATED_STAGE_ID = ${JSON.stringify(stageId)};`,
        `export const GENERATED_AREA_ID = ${JSON.stringify(areaId)};`,
        "// JSON ordering and formatting are deterministic generator output.",
        "// prettier-ignore",
        `const SPEC = ${stableJson(canonical)};`,
        "",
        "export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);",
        ""
    ].join("\r\n");
}

export function renderGeneratedCatalogModule(manifest) {
    const outputPath = generatedModulePath({ outputPath: manifest?.catalogOutputPath });
    const outputDirectory = directoryPath(outputPath);
    const generatedEntries = manifest.stageSources ?? [];
    const imports = generatedEntries.map((entry) => {
        const areaOutputPath = generatedModulePath(entry);
        if (directoryPath(areaOutputPath) !== outputDirectory) {
            throw new TypeError(`generated-catalog-output-directory-mismatch:${entry.stageId}`);
        }
        return `import { GENERATED_AREA as ${generatedImportName(entry.stageId)} } from "./${fileName(areaOutputPath)}";`;
    });
    const canonicalManifest = canonicalizeAreaSpecV2(manifest);
    const generatedAreaValues = generatedEntries.map(({ stageId }) => generatedImportName(stageId));
    const generatedAreas =
        generatedAreaValues.length <= 2
            ? `[${generatedAreaValues.join(", ")}]`
            : `[\r\n    ${generatedAreaValues.join(",\r\n    ")}\r\n]`;
    return [
        "// GENERATED FILE - DO NOT EDIT",
        "// Source: docs/bsh/scenario/AREA-CATALOG.json",
        `import { defineAreaCatalog } from "${GENERATED_CATALOG_IMPORT}";`,
        ...imports,
        "",
        "// JSON ordering and formatting are deterministic generator output.",
        "// prettier-ignore",
        `const MANIFEST = ${stableJson(canonicalManifest)};`,
        "",
        "export const GENERATED_AREA_CATALOG_MANIFEST = Object.freeze(MANIFEST);",
        `export const GENERATED_AREAS = Object.freeze(${generatedAreas});`,
        "export const GENERATED_AREA_CATALOG = defineAreaCatalog({",
        "    id: GENERATED_AREA_CATALOG_MANIFEST.catalogId,",
        "    revision: GENERATED_AREA_CATALOG_MANIFEST.catalogRevision,",
        "    areas: GENERATED_AREAS",
        "});",
        ""
    ].join("\r\n");
}

export function collectGeneratedOutputs({ manifest, specsByStageId }) {
    if (!(specsByStageId instanceof Map)) throw new TypeError("generated-spec-map-invalid");
    const outputs = [];
    for (const entry of manifest.stageSources ?? []) {
        const spec = specsByStageId.get(entry.stageId);
        if (!spec) throw new TypeError(`generated-spec-missing:${entry.stageId}`);
        if (spec.stage?.id !== entry.stageId || spec.definition?.id !== entry.areaId) {
            throw new TypeError(`generated-spec-identity-mismatch:${entry.stageId}`);
        }
        outputs.push(
            Object.freeze({ outputPath: generatedModulePath(entry), content: renderGeneratedAreaModule(spec) })
        );
    }
    outputs.push(
        Object.freeze({
            outputPath: generatedModulePath({ outputPath: manifest.catalogOutputPath }),
            content: renderGeneratedCatalogModule(manifest)
        })
    );
    return Object.freeze(outputs);
}
