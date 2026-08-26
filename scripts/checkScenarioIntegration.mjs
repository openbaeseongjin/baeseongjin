import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(process.cwd());
const checkpointPath = "scripts/checkpoints/scenario-integration.v1.json";
export const scenarioRoot = "docs/bsh/scenario";
export const authoredAreaRoot = "src/game/world/areas";
export const authoredSectorRoot = "src/game/world/sectors";
export const authoredSectorSupportFiles = [
    "src/game/world/SectorDefinitionValidator.js",
    "src/game/world/SectorProgressController.js",
    "src/game/world/SectorProgressState.js"
];

function normalizePath(path) {
    return path.split(sep).join("/");
}

function normalizeContent(content) {
    return content.replace(/\r\n?/g, "\n");
}

function collectFiles(root, extensions) {
    const files = [];

    function visit(directory) {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = resolve(directory, entry.name);
            if (entry.isDirectory()) {
                visit(path);
            } else if (extensions.has(extname(entry.name))) {
                files.push(normalizePath(relative(projectRoot, path)));
            }
        }
    }

    visit(resolve(projectRoot, root));
    return files.sort((left, right) => left.localeCompare(right, "en"));
}

function fingerprint(files) {
    const hash = createHash("sha256");
    for (const file of files) {
        const content = normalizeContent(readFileSync(resolve(projectRoot, file), "utf8"));
        hash.update(file);
        hash.update("\0");
        hash.update(content);
        hash.update("\0");
    }
    return hash.digest("hex");
}

function collectStageCoverage(scenarioFiles) {
    return scenarioFiles
        .map((file) => file.match(/^docs\/bsh\/scenario\/(\d+)\/(\d+)-(\d+)\/README\.md$/))
        .filter((match) => match && match[1] === match[2])
        .map((match) => ({ sector: Number(match[1]), stage: Number(match[3]) }))
        .sort((left, right) => left.sector - right.sector || left.stage - right.stage)
        .map(({ sector, stage }) => `${sector}-${stage}`);
}

function readExpectedCheckpoint() {
    const checkpoint = JSON.parse(readFileSync(resolve(projectRoot, checkpointPath), "utf8"));

    for (const key of [
        "scenario-source-sha256",
        "authored-area-sha256",
        "authored-sector-sha256",
        "stage-count",
        "stage-coverage",
        "reviewed-upstream"
    ]) {
        if (!checkpoint[key]) {
            throw new Error(`${checkpointPath}에 ${key}가 없습니다.`);
        }
    }

    for (const key of ["scenario-source-sha256", "authored-area-sha256", "authored-sector-sha256"]) {
        if (!/^[0-9a-f]{64}$/.test(checkpoint[key])) {
            throw new Error(`${checkpointPath}의 ${key}가 SHA-256 형식이 아닙니다.`);
        }
    }
    if (!/^\d+$/.test(checkpoint["stage-count"])) {
        throw new Error(`${checkpointPath}의 stage-count가 정수가 아닙니다.`);
    }
    if (!/^[0-9a-f]{40}$/.test(checkpoint["reviewed-upstream"])) {
        throw new Error(`${checkpointPath}의 reviewed-upstream이 Git SHA 형식이 아닙니다.`);
    }

    return checkpoint;
}

export function collectActualCheckpoint() {
    // AREA-SPEC.json is the machine-readable implementation contract alongside each stage's
    // README.md / PRODUCTION-ALIGNMENT.md — it must invalidate the stale-check like the .md files do.
    // docs/bsh/scenario/AREA-SPEC-TEMPLATE.json is intentionally under this same root/extension set
    // (a template edit should also invalidate the checkpoint), but it is excluded from stage-coverage
    // below because it does not match the <sector>/<stage>/README.md stage pattern.
    const scenarioFiles = collectFiles(scenarioRoot, new Set([".md", ".json"]));
    const authoredAreaFiles = collectFiles(authoredAreaRoot, new Set([".js"]));
    const authoredSectorFiles = [
        ...collectFiles(authoredSectorRoot, new Set([".js"])),
        ...authoredSectorSupportFiles
    ].sort((left, right) => left.localeCompare(right, "en"));
    const stages = collectStageCoverage(scenarioFiles);

    return {
        "scenario-source-sha256": fingerprint(scenarioFiles),
        "authored-area-sha256": fingerprint(authoredAreaFiles),
        "authored-sector-sha256": fingerprint(authoredSectorFiles),
        "stage-count": String(stages.length),
        "stage-coverage": stages.join(","),
        scenarioFiles,
        authoredAreaFiles,
        authoredSectorFiles
    };
}

export function collectDifferences(expected, actual) {
    const fields = [
        "scenario-source-sha256",
        "authored-area-sha256",
        "authored-sector-sha256",
        "stage-count",
        "stage-coverage"
    ];
    return fields
        .filter((field) => expected[field] !== actual[field])
        .map((field) => `${field}: recorded=${expected[field]} actual=${actual[field]}`);
}

function printActualCheckpoint(actual) {
    console.log(`scenario-source-sha256: ${actual["scenario-source-sha256"]}`);
    console.log(`authored-area-sha256: ${actual["authored-area-sha256"]}`);
    console.log(`authored-sector-sha256: ${actual["authored-sector-sha256"]}`);
    console.log(`stage-count: ${actual["stage-count"]}`);
    console.log(`stage-coverage: ${actual["stage-coverage"]}`);
    console.log(`scenario-files: ${actual.scenarioFiles.length}`);
    console.log(`authored-area-files: ${actual.authoredAreaFiles.length}`);
    console.log(`authored-sector-files: ${actual.authoredSectorFiles.length}`);
}

function runSelfTest() {
    const actual = {
        "scenario-source-sha256": "a".repeat(64),
        "authored-area-sha256": "b".repeat(64),
        "authored-sector-sha256": "c".repeat(64),
        "stage-count": "25",
        "stage-coverage": "1-1,4-1"
    };
    const expected = {
        ...actual,
        "scenario-source-sha256": "0".repeat(64),
        "authored-area-sha256": "1".repeat(64),
        "authored-sector-sha256": "2".repeat(64)
    };
    const differences = collectDifferences(expected, actual);
    assert.equal(differences.length, 3);
    assert.ok(differences.some((difference) => difference.startsWith("scenario-source-sha256:")));
    assert.ok(differences.some((difference) => difference.startsWith("authored-area-sha256:")));
    assert.ok(differences.some((difference) => difference.startsWith("authored-sector-sha256:")));
    assert.equal(normalizeContent("a\r\nb\r"), "a\nb\n");
    console.log("Scenario integration stale-check self-test passed.");
}

function main() {
    if (process.argv.includes("--self-test")) {
        runSelfTest();
        process.exit(0);
    }

    const actual = collectActualCheckpoint();
    if (process.argv.includes("--print")) {
        printActualCheckpoint(actual);
        process.exit(0);
    }

    try {
        const expected = readExpectedCheckpoint();
        const differences = collectDifferences(expected, actual);
        if (differences.length > 0) {
            console.error("Scenario integration checkpoint가 현재 source와 다릅니다.");
            for (const difference of differences) console.error(`- ${difference}`);
            console.error(
                "변경 내용을 관련 Stage PRODUCTION-ALIGNMENT.md와 Runtime source에서 재검토한 뒤 " +
                    `${checkpointPath}를 갱신하세요.`
            );
            process.exit(1);
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    }

    console.log(
        `Scenario integration checkpoint passed: ${actual["stage-count"]} stages, ` +
            `${actual.scenarioFiles.length} scenario files, ${actual.authoredAreaFiles.length} authored-area files, ` +
            `${actual.authoredSectorFiles.length} authored-sector files`
    );
}

// Keep the CLI body behind a direct-entry guard so the checkpoint logic remains reusable by tooling.
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    main();
}
