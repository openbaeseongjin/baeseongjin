// Cross-checks docs/bsh/scenario/<sector>/<stage>/AREA-SPEC.json against the sibling
// DIRECTION-SPEC.json in the same Stage folder, when both exist.
//
// scripts/validateAreaSpecs.mjs and scripts/validateDirectionSpecs.mjs each validate that ONE
// file is internally consistent. Neither one reads the other file. This script is the third,
// narrower job: does DIRECTION-SPEC.json reference ids that actually exist in AREA-SPEC.json for
// the same Stage.
//
// Scope is deliberately limited to what is MECHANICALLY checkable today. Several cross-file
// checks requested during infra design were NOT implemented here and are documented as HOLD
// instead of guessed at (docs/bsh/scenario/DIRECTION-SPEC-AUTHORING-STANDARD.md §10 "no code
// forced where the repo doesn't safely support it yet"):
//
//   HOLD — gate-unlocked beat.trigger.gateId vs AREA-SPEC:
//     AREA-SPEC.json has no `gates[]` id list (AREA-SPEC-AUTHORING-STANDARD.md §0: per-Area Gate
//     portals do not exist in final Runtime output — `gates: []`). There is no id source to check
//     a gateId against without inventing one, so this is left unchecked.
//   HOLD — route-lock-changed beat.trigger vs AREA-SPEC route:
//     `route.mandatory`/`route.optional` are Local ID *sequences* for review/playtest, not a
//     routeLock id registry (AREA-SPEC-AUTHORING-STANDARD.md §10). No comparable id exists yet.
//   HOLD — augment-selected beat.trigger.augmentId vs AREA-SPEC:
//     AREA-SPEC.json's schema has no augment field at all today.
//   HOLD — DIRECTION-SPEC.sourceCommit vs the Stage's AUTHORING SNAPSHOT:
//     The snapshot SHA lives as free text in README.md/RUNTIME-HANDOFF.md prose
//     (documentation-rules.md §3), not in a machine field on either JSON file. Comparing against
//     prose text is fragile; left to human PRODUCTION-ALIGNMENT.md review.
//   HOLD — "HYPOTHESIS marked VERIFIED" / "Runtime-unsupported track marked VERIFIED":
//     Whether a beat's claimed `status` is actually true is a judgment call, not a reference
//     check. The one instance of this that IS mechanically checkable — a beat claiming a status
//     other than NOT IMPLEMENTED/HOLD while using a trigger/camera mode/track this repo's Runtime
//     doesn't support — is already handled by scripts/validateDirectionSpecs.mjs's runtime
//     capability warnings, not duplicated here.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(process.cwd());
const scenarioRoot = "docs/bsh/scenario";
const AREA_SPEC_PATH_PATTERN = /^docs\/bsh\/scenario\/(\d+)\/(\d+)-(\d+)\/AREA-SPEC\.json$/;

const OBJECTIVE_TRIGGER_TYPES = new Set(["objective-started", "objective-completed"]);
const ENEMY_TRIGGER_TYPES = new Set(["enemy-activated", "enemy-defeated"]);

function normalizePath(path) {
    return path.split(sep).join("/");
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function fail(issues, file, code, details = {}) {
    issues.push({ file, code, ...details });
}

// Validates one Stage's AREA-SPEC.json + DIRECTION-SPEC.json pair against each other.
// Pure function — does not read from disk, so it is directly unit-testable with in-memory specs.
export function validateCrossReferences(areaSpec, directionSpec, directionSpecFile) {
    const issues = [];
    if (!isPlainObject(areaSpec) || !isPlainObject(directionSpec)) {
        fail(issues, directionSpecFile, "cross-reference-inputs-invalid");
        return issues;
    }

    const sourceAreaId = areaSpec.stage?.sourceAreaId;
    if (isNonEmptyString(sourceAreaId) && directionSpec.stageId !== sourceAreaId) {
        fail(issues, directionSpecFile, "stage-id-does-not-match-area-spec", {
            directionSpecStageId: directionSpec.stageId,
            areaSpecSourceAreaId: sourceAreaId
        });
    }

    const objectiveIds = new Set((areaSpec.objectives ?? []).map((objective) => objective?.id));
    const enemyIds = new Set((areaSpec.enemies ?? []).map((enemy) => enemy?.id));
    const cameraZoneIds = new Set((areaSpec.camera?.zones ?? []).map((zone) => zone?.id));

    for (const beat of directionSpec.beats ?? []) {
        if (!isPlainObject(beat)) continue;
        const beatId = isNonEmptyString(beat.beatId) ? beat.beatId : null;
        const trigger = beat.trigger;
        if (isPlainObject(trigger)) {
            if (trigger.type === "area-enter" && isNonEmptyString(trigger.areaId) && trigger.areaId !== sourceAreaId) {
                fail(issues, directionSpecFile, "trigger-area-id-unknown", { beatId, areaId: trigger.areaId });
            }
            if (
                OBJECTIVE_TRIGGER_TYPES.has(trigger.type) &&
                isNonEmptyString(trigger.objectiveId) &&
                !objectiveIds.has(trigger.objectiveId)
            ) {
                fail(issues, directionSpecFile, "trigger-objective-id-unknown", {
                    beatId,
                    objectiveId: trigger.objectiveId
                });
            }
            if (
                ENEMY_TRIGGER_TYPES.has(trigger.type) &&
                isNonEmptyString(trigger.enemyId) &&
                !enemyIds.has(trigger.enemyId)
            ) {
                fail(issues, directionSpecFile, "trigger-enemy-id-unknown", { beatId, enemyId: trigger.enemyId });
            }
        }

        const camera = beat.camera;
        if (
            isPlainObject(camera) &&
            camera.mode === "authored-zone" &&
            isNonEmptyString(camera.zoneId) &&
            !cameraZoneIds.has(camera.zoneId)
        ) {
            fail(issues, directionSpecFile, "camera-zone-id-unknown", { beatId, zoneId: camera.zoneId });
        }
    }

    return issues;
}

function collectStageFoldersWithBothSpecs(root) {
    const areaSpecFiles = [];
    function visit(directory) {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                visit(path);
            } else if (entry.isFile() && basename(entry.name) === "AREA-SPEC.json") {
                areaSpecFiles.push(normalizePath(relative(projectRoot, path)));
            }
        }
    }
    visit(resolve(projectRoot, root));
    return areaSpecFiles
        .filter((path) => path.match(AREA_SPEC_PATH_PATTERN))
        .map((areaSpecFile) => ({
            areaSpecFile,
            directionSpecFile: normalizePath(join(dirname(areaSpecFile), "DIRECTION-SPEC.json"))
        }))
        .filter((pair) => existsSync(resolve(projectRoot, pair.directionSpecFile)))
        .sort((left, right) => left.areaSpecFile.localeCompare(right.areaSpecFile, "en"));
}

function readJson(path) {
    return JSON.parse(readFileSync(resolve(projectRoot, path), "utf8"));
}

export function findStagePackagesWithBothSpecs() {
    return collectStageFoldersWithBothSpecs(scenarioRoot);
}

function printIssue(issue) {
    const { file, code, ...details } = issue;
    const detailText = Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : "";
    console.error(`- ${file}: ${code}${detailText}`);
}

function main() {
    const pairs = findStagePackagesWithBothSpecs();
    let issueCount = 0;
    for (const pair of pairs) {
        const areaSpec = readJson(pair.areaSpecFile);
        const directionSpec = readJson(pair.directionSpecFile);
        const issues = validateCrossReferences(areaSpec, directionSpec, pair.directionSpecFile);
        for (const issue of issues) printIssue(issue);
        issueCount += issues.length;
    }
    if (issueCount > 0) {
        console.error(`Stage package cross-reference validation failed: ${issueCount} issue(s) across ${pairs.length} pair(s).`);
        process.exit(1);
    }
    console.log(`Stage package cross-reference validation passed: ${pairs.length} pair(s) checked.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    main();
}
