import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { EMPTY_AREA_BEHAVIOR_REGISTRY } from "../../src/game/world/area-authoring-v2/AreaBehaviorRegistry.js";
import { validateAreaCatalogManifest } from "../../src/game/world/area-authoring-v2/AreaCatalogManifest.js";
import { validateAreaSpecV2 } from "../../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";
import { collectGeneratedOutputs } from "../../src/game/world/area-authoring-v2/AreaSpecV2Generator.js";

const projectRoot = resolve(process.cwd());
const manifestPath = "docs/bsh/scenario/AREA-CATALOG.json";
const generatedRoot = "src/game/world/areas/generated";

function normalizePath(path) {
    return path.split(sep).join("/");
}

function readJson(path) {
    try {
        return { value: JSON.parse(readFileSync(resolve(projectRoot, path), "utf8")), issues: [] };
    } catch (error) {
        return { value: null, issues: [{ code: "json-read-failed", path, message: error.message }] };
    }
}

function outputPathIsSafe(path) {
    const resolvedOutput = resolve(projectRoot, path);
    const resolvedRoot = resolve(projectRoot, generatedRoot);
    const relation = relative(resolvedRoot, resolvedOutput);
    return relation.length > 0 && !relation.startsWith("..") && !relation.includes(":") && path.endsWith(".js");
}

function printIssues(issues) {
    for (const issue of issues) console.error(`- ${issue.code}: ${JSON.stringify(issue)}`);
}

export function collectAreaCatalogGeneration({ check = false } = {}) {
    const manifestResult = readJson(manifestPath);
    if (manifestResult.issues.length > 0) return { valid: false, issues: manifestResult.issues, outputs: [] };
    const manifest = manifestResult.value;
    const expectedStageIds = manifest.expectedStageIds ?? manifest.stageSources?.map(({ stageId }) => stageId) ?? [];
    const manifestValidation = validateAreaCatalogManifest(manifest, {
        expectedStageIds,
        sourcePathExists: (path) => existsSync(resolve(projectRoot, path)),
        requireGeneratedOutputs: false
    });
    const issues = [...manifestValidation.issues];
    const specsByStageId = new Map();
    for (const entry of manifest.stageSources ?? []) {
        if (entry.source !== "generated" || !entry.sourcePath) continue;
        const specResult = readJson(entry.sourcePath);
        issues.push(...specResult.issues);
        if (!specResult.value) continue;
        const specValidation = validateAreaSpecV2(specResult.value, {
            file: entry.sourcePath,
            registry: EMPTY_AREA_BEHAVIOR_REGISTRY
        });
        issues.push(...specValidation.issues);
        specsByStageId.set(entry.stageId, specResult.value);
        if (!outputPathIsSafe(entry.outputPath ?? "")) {
            issues.push({ code: "generated-output-path-unsafe", outputPath: entry.outputPath ?? null });
        }
    }
    if (issues.length > 0) return { valid: false, issues, outputs: [] };
    try {
        const outputs = collectGeneratedOutputs({ manifest, specsByStageId });
        if (check) {
            for (const output of outputs) {
                const path = resolve(projectRoot, output.outputPath);
                if (!existsSync(path) || readFileSync(path, "utf8") !== output.content) {
                    issues.push({ code: "generated-output-stale", outputPath: output.outputPath });
                }
            }
        }
        return { valid: issues.length === 0, issues, outputs };
    } catch (error) {
        return { valid: false, issues: [{ code: "generated-output-render-failed", message: error.message }], outputs: [] };
    }
}

export function main() {
    const check = process.argv.includes("--check");
    const result = collectAreaCatalogGeneration({ check });
    if (!result.valid) {
        printIssues(result.issues);
        process.exitCode = 1;
        return;
    }
    if (!check) {
        for (const output of result.outputs) {
            const path = resolve(projectRoot, output.outputPath);
            mkdirSync(resolve(path, ".."), { recursive: true });
            writeFileSync(path, output.content, "utf8");
        }
    }
    console.log(`${check ? "Generated output check passed" : "Generated output written"}: ${result.outputs.length} file(s).`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    main();
}
