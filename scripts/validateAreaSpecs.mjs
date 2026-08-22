import { readFileSync, readdirSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { EMPTY_AREA_BEHAVIOR_REGISTRY } from "../src/game/world/area-authoring-v2/AreaBehaviorRegistry.js";
import { validateAreaSpecV2 } from "../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";

const projectRoot = resolve(process.cwd());
const scenarioRoot = resolve(projectRoot, "docs/bsh/scenario");
const EXPECTED_STAGE_COUNT = 48;
const STAGE_SPEC_PATH_PATTERN = /^docs\/bsh\/scenario\/(\d+)\/(\d+)-(\d+)\/AREA-SPEC\.v2\.json$/;

function normalizePath(path) {
    return path.split(sep).join("/");
}

function collectCanonicalSpecs(directory) {
    const files = [];
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) files.push(...collectCanonicalSpecs(path));
        else if (entry.isFile() && basename(entry.name) === "AREA-SPEC.v2.json") {
            files.push(normalizePath(relative(projectRoot, path)));
        }
    }
    return files.sort((left, right) => left.localeCompare(right, "en"));
}

function expectedStagePaths() {
    const paths = [];
    for (let sector = 1; sector <= 6; sector += 1) {
        for (let stage = 1; stage <= 8; stage += 1) {
            paths.push(`docs/bsh/scenario/${sector}/${sector}-${stage}/AREA-SPEC.v2.json`);
        }
    }
    return paths;
}

export function validateCanonicalAreaSpecs() {
    const files = collectCanonicalSpecs(scenarioRoot);
    const issues = [];
    const expectedPaths = expectedStagePaths();
    const actualPaths = Object.freeze(Object.fromEntries(files.map((file) => [file, true])));

    if (files.length !== EXPECTED_STAGE_COUNT) {
        issues.push({ code: "stage-count-mismatch", expected: EXPECTED_STAGE_COUNT, actual: files.length });
    }
    for (const file of expectedPaths) {
        if (!actualPaths[file]) issues.push({ code: "stage-spec-missing", file });
    }
    for (const file of files) {
        const match = STAGE_SPEC_PATH_PATTERN.exec(file);
        if (!match || match[1] !== match[2]) {
            issues.push({ code: "stage-spec-path-invalid", file });
            continue;
        }
        try {
            const spec = JSON.parse(readFileSync(resolve(projectRoot, file), "utf8"));
            const validation = validateAreaSpecV2(spec, { file, registry: EMPTY_AREA_BEHAVIOR_REGISTRY });
            issues.push(...validation.issues);
            const expectedAlias = `${match[1]}-${match[3]}`;
            if (spec.stage?.id !== expectedAlias) {
                issues.push({
                    code: "stage-alias-path-mismatch",
                    file,
                    expected: expectedAlias,
                    actual: spec.stage?.id ?? null
                });
            }
        } catch (error) {
            issues.push({ code: "stage-spec-read-failed", file, message: error.message });
        }
    }
    return Object.freeze({ valid: issues.length === 0, files: Object.freeze(files), issues: Object.freeze(issues) });
}

export function main() {
    const result = validateCanonicalAreaSpecs();
    if (!result.valid) {
        for (const issue of result.issues) console.error(`- ${issue.code}: ${JSON.stringify(issue)}`);
        process.exitCode = 1;
        return;
    }
    console.log(
        `AREA-SPEC v2 validation passed: ${result.files.length}/${EXPECTED_STAGE_COUNT} canonical Stage files.`
    );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
