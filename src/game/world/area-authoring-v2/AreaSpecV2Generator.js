import { canonicalizeAreaSpecV2 } from "./AreaSpecV2.js";

const GENERATED_OUTPUT_ROOT = "src/game/world/areas/generated/";
const GENERATED_RUNTIME_IMPORT = "../../../area-authoring-v2/AreaSpecV2.js";

function stableJson(value) {
    return JSON.stringify(value, null, 2);
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
    const stageId = canonical.stage?.legacyStageAlias;
    const areaId = canonical.definition?.id;
    if (typeof stageId !== "string" || typeof areaId !== "string") throw new TypeError("generated-spec-identity-invalid");
    return [
        "// GENERATED FILE - DO NOT EDIT",
        `// Source: ${stageId} AREA-SPEC.v2.json`,
        `import { createAreaDefinitionFromV2 } from "${GENERATED_RUNTIME_IMPORT}";`,
        "",
        `export const GENERATED_STAGE_ID = ${JSON.stringify(stageId)};`,
        `export const GENERATED_AREA_ID = ${JSON.stringify(areaId)};`,
        `const SPEC = ${stableJson(canonical)};`,
        "",
        "export const GENERATED_AREA = createAreaDefinitionFromV2(SPEC);",
        ""
    ].join("\n");
}

export function collectGeneratedOutputs({ manifest, specsByStageId }) {
    if (!(specsByStageId instanceof Map)) throw new TypeError("generated-spec-map-invalid");
    const outputs = [];
    for (const entry of manifest.stageSources ?? []) {
        if (entry.source !== "generated") continue;
        const spec = specsByStageId.get(entry.stageId);
        if (!spec) throw new TypeError(`generated-spec-missing:${entry.stageId}`);
        if (spec.stage?.legacyStageAlias !== entry.stageId || spec.definition?.id !== entry.areaId) {
            throw new TypeError(`generated-spec-identity-mismatch:${entry.stageId}`);
        }
        outputs.push(Object.freeze({ outputPath: generatedModulePath(entry), content: renderGeneratedAreaModule(spec) }));
    }
    return Object.freeze(outputs);
}
