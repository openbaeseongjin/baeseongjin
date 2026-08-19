// Validates docs/bsh/scenario/<sector>/<stage>/DIRECTION-SPEC.json against the
// "one-rope-direction-spec-v1" schema.
//
// DIRECTION-SPEC.json is the WHEN/HOW implementation contract described in
// docs/bsh/scenario/DIRECTION-SPEC-AUTHORING-STANDARD.md:
//   README.md              = WHY / PLAYER EXPERIENCE
//   AREA-SPEC.json          = WHERE / WHAT           (scripts/validateAreaSpecs.mjs)
//   DIRECTION-SPEC.json     = WHEN / HOW              (this validator)
//   src/game/**             = ACTUAL RUNTIME
//   PRODUCTION-ALIGNMENT.md = SPEC <-> RUNTIME match status
//
// This script validates two DISTINCT things and never conflates them (see AUTHORING-STANDARD
// §10 "Automated — Runtime Capability"):
//   1. SCHEMA validity — is the JSON shaped correctly per the DIRECTION-SPEC schema.
//   2. RUNTIME CAPABILITY — does a value used in the spec (trigger.type / camera.mode / a
//      non-empty tracks[] key) currently have real Runtime backing, per
//      docs/bsh/scenario/DIRECTION-RUNTIME-CAPABILITY-MATRIX.md.
// A beat can be SCHEMA VALID while using a NOT IMPLEMENTED runtime capability — that is reported
// as a distinct warning, not a schema failure, and is not a reason to fail validation (the spec
// is allowed to describe not-yet-built Direction; it just must not be silently treated as built).
//
// Cross-file reference integrity against AREA-SPEC.json (target ids, camera zone ids, objective
// ids) is a SEPARATE concern handled by scripts/validateStagePackageCrossReferences.mjs.

import { readFileSync, readdirSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(process.cwd());
const scenarioRoot = "docs/bsh/scenario";
const STAGE_SPEC_PATH_PATTERN = /^docs\/bsh\/scenario\/(\d+)\/(\d+)-(\d+)\/DIRECTION-SPEC\.json$/;

// Keep this registry in sync with docs/bsh/scenario/DIRECTION-RUNTIME-CAPABILITY-MATRIX.md.
// VERIFIED/PARTIAL entries there are "KNOWN" here (schema-valid AND runtime-capable, possibly
// with caveats noted in the matrix). Everything else is either NOT_IMPLEMENTED (must be declared
// as such, and is still schema-valid) or, if the value isn't in the schema enum at all, a hard
// schema failure (handled separately from this registry).
const TRIGGER_RUNTIME_STATUS = new Map([
    ["area-enter", "VERIFIED"],
    ["position-zone", "VERIFIED"],
    ["object-trigger", "VERIFIED"],
    ["objective-started", "PARTIAL"],
    ["objective-completed", "PARTIAL"],
    ["gate-unlocked", "VERIFIED"],
    ["enemy-activated", "NOT_IMPLEMENTED"],
    ["enemy-defeated", "NOT_IMPLEMENTED"],
    ["augment-selected", "NOT_IMPLEMENTED"],
    ["route-lock-changed", "NOT_IMPLEMENTED"]
]);

const CAMERA_MODE_RUNTIME_STATUS = new Map([
    ["authored-zone", "VERIFIED"],
    ["composition-contract", "NOT_IMPLEMENTED"],
    ["temporary-shot", "NOT_IMPLEMENTED"],
    ["default", "HOLD"]
]);

const TRACK_RUNTIME_STATUS = new Map([
    ["systemText", "VERIFIED"],
    ["dialogue", "HOLD"],
    ["character", "HOLD"],
    ["object", "HOLD"],
    ["camera", "HOLD"],
    ["audio", "VERIFIED"],
    ["vfx", "HOLD"],
    ["lighting", "HOLD"],
    ["gameplayEvent", "HOLD"]
]);

const TRIGGER_TYPES = new Set(TRIGGER_RUNTIME_STATUS.keys());
const CAMERA_MODES = new Set(CAMERA_MODE_RUNTIME_STATUS.keys());
const TRACK_KEYS = new Set(TRACK_RUNTIME_STATUS.keys());
const STATUS_VALUES = new Set(["VERIFIED", "DESIGN LOCKED", "HYPOTHESIS", "NOT IMPLEMENTED", "HOLD"]);
const SCOPE_VALUES = new Set(["local-player", "party", "world"]);
const REPLAY_POLICY_VALUES = new Set(["once-per-run", "once-per-life", "once-per-sector-attempt", "repeatable"]);
const PLAYER_CONTROL_KEYS = ["movement", "aim", "rope", "action", "interaction"];

function normalizePath(path) {
    return path.split(sep).join("/");
}

function collectDirectionSpecFiles(root) {
    const files = [];
    function visit(directory) {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                visit(path);
            } else if (entry.isFile() && basename(entry.name) === "DIRECTION-SPEC.json") {
                files.push(normalizePath(relative(projectRoot, path)));
            }
        }
    }
    visit(resolve(projectRoot, root));
    return files
        .filter((path) => path.match(STAGE_SPEC_PATH_PATTERN))
        .sort((left, right) => left.localeCompare(right, "en"));
}

function fail(issues, file, code, details = {}) {
    issues.push({ file, code, ...details });
}

function warn(warnings, file, code, details = {}) {
    warnings.push({ file, code, ...details });
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateStageId(spec, file, issues) {
    const match = file.match(STAGE_SPEC_PATH_PATTERN);
    if (!match) {
        fail(issues, file, "stage-path-format");
        return;
    }
    const [, folderSector, stageSector, stageNumber] = match;
    if (folderSector !== stageSector) {
        fail(issues, file, "stage-folder-sector-mismatch", { folder: folderSector, stage: stageSector });
    }
    const expectedStageId = `sector-${stageSector.padStart(2, "0")}-${stageNumber.padStart(2, "0")}`;
    if (spec.stageId !== expectedStageId) {
        fail(issues, file, "stage-id-mismatch", { expected: expectedStageId, actual: spec.stageId });
    }
}

function validateTrigger(spec, file, issues, warnings, beatId) {
    const trigger = spec.trigger;
    if (!isPlainObject(trigger) || !isNonEmptyString(trigger.type)) {
        fail(issues, file, "beat-trigger-invalid", { beatId });
        return;
    }
    if (!TRIGGER_TYPES.has(trigger.type)) {
        fail(issues, file, "beat-trigger-type-unknown", { beatId, type: trigger.type });
        return;
    }
    const runtimeStatus = TRIGGER_RUNTIME_STATUS.get(trigger.type);
    if (runtimeStatus === "NOT_IMPLEMENTED" && spec.status !== "NOT IMPLEMENTED" && spec.status !== "HOLD") {
        warn(warnings, file, "beat-trigger-runtime-not-implemented", { beatId, type: trigger.type });
    }
}

function validateCamera(spec, file, issues, warnings, beatId) {
    const camera = spec.camera;
    if (!isPlainObject(camera)) {
        fail(issues, file, "beat-camera-invalid", { beatId });
        return;
    }
    if (camera.mode === undefined) return;
    if (!isNonEmptyString(camera.mode) || !CAMERA_MODES.has(camera.mode)) {
        fail(issues, file, "beat-camera-mode-unknown", { beatId, mode: camera.mode });
        return;
    }
    const runtimeStatus = CAMERA_MODE_RUNTIME_STATUS.get(camera.mode);
    if (runtimeStatus === "NOT_IMPLEMENTED") {
        warn(warnings, file, "beat-camera-mode-runtime-not-implemented", { beatId, mode: camera.mode });
    }
}

function validateTracks(spec, file, issues, warnings, beatId) {
    const tracks = spec.tracks;
    if (!isPlainObject(tracks)) {
        fail(issues, file, "beat-tracks-invalid", { beatId });
        return;
    }
    for (const key of Object.keys(tracks)) {
        if (!TRACK_KEYS.has(key)) {
            fail(issues, file, "beat-track-key-unknown", { beatId, key });
            continue;
        }
        if (!Array.isArray(tracks[key])) {
            fail(issues, file, "beat-track-value-invalid", { beatId, key });
            continue;
        }
        const runtimeStatus = TRACK_RUNTIME_STATUS.get(key);
        if (tracks[key].length > 0 && runtimeStatus === "HOLD") {
            warn(warnings, file, "beat-track-runtime-unverified", { beatId, key });
        }
    }
}

function validatePlayerControl(spec, file, issues, beatId) {
    const control = spec.playerControl;
    if (!isPlainObject(control)) {
        fail(issues, file, "beat-player-control-invalid", { beatId });
        return;
    }
    for (const key of PLAYER_CONTROL_KEYS) {
        if (typeof control[key] !== "boolean") {
            fail(issues, file, "beat-player-control-field-invalid", { beatId, key });
        }
    }
    for (const key of Object.keys(control)) {
        if (!PLAYER_CONTROL_KEYS.includes(key)) {
            fail(issues, file, "beat-player-control-key-unknown", { beatId, key });
        }
    }
}

function validateBeat(spec, file, issues, warnings, seenBeatIds, seenDedupeTokens) {
    if (!isPlainObject(spec)) {
        fail(issues, file, "beat-not-object");
        return;
    }
    const beatId = isNonEmptyString(spec.beatId) ? spec.beatId : null;
    if (!beatId) {
        fail(issues, file, "beat-id-missing");
    } else if (seenBeatIds.has(beatId)) {
        fail(issues, file, "beat-id-duplicate", { beatId });
    } else {
        seenBeatIds.add(beatId);
    }

    if (!STATUS_VALUES.has(spec.status)) {
        fail(issues, file, "beat-status-invalid", { beatId, status: spec.status });
    }
    if (!isNonEmptyString(spec.purpose)) {
        fail(issues, file, "beat-purpose-missing", { beatId });
    }
    if (!SCOPE_VALUES.has(spec.scope)) {
        fail(issues, file, "beat-scope-invalid", { beatId, scope: spec.scope });
    }
    if (!REPLAY_POLICY_VALUES.has(spec.replayPolicy)) {
        fail(issues, file, "beat-replay-policy-invalid", { beatId, replayPolicy: spec.replayPolicy });
    }
    if (!isNonEmptyString(spec.dedupeToken)) {
        fail(issues, file, "beat-dedupe-token-missing", { beatId });
    } else if (seenDedupeTokens.has(spec.dedupeToken)) {
        fail(issues, file, "beat-dedupe-token-duplicate", { beatId, dedupeToken: spec.dedupeToken });
    } else {
        seenDedupeTokens.add(spec.dedupeToken);
    }
    if (typeof spec.worldPause !== "boolean") {
        fail(issues, file, "beat-world-pause-invalid", { beatId });
    }
    if (!isPlainObject(spec.completion)) {
        fail(issues, file, "beat-completion-missing", { beatId });
    }
    if (!isPlainObject(spec.validation)) {
        fail(issues, file, "beat-validation-missing", { beatId });
    }

    validateTrigger(spec, file, issues, warnings, beatId);
    validatePlayerControl(spec, file, issues, beatId);
    validateCamera(spec, file, issues, warnings, beatId);
    validateTracks(spec, file, issues, warnings, beatId);
}

export function validateDirectionSpec(spec, file) {
    const issues = [];
    const warnings = [];
    if (!isPlainObject(spec)) {
        fail(issues, file, "spec-not-object");
        return { issues, warnings };
    }
    if (spec.schemaVersion !== "one-rope-direction-spec-v1") {
        fail(issues, file, "schema-version-invalid", { schemaVersion: spec.schemaVersion });
        return { issues, warnings };
    }

    validateStageId(spec, file, issues);
    if (!isNonEmptyString(spec.revision)) fail(issues, file, "revision-missing");
    if (!isNonEmptyString(spec.sourceCommit)) fail(issues, file, "source-commit-missing");
    if (!isNonEmptyString(spec.presentationSignature)) fail(issues, file, "presentation-signature-missing");

    if (!Array.isArray(spec.beats) || spec.beats.length === 0) {
        fail(issues, file, "beats-empty");
        return { issues, warnings };
    }

    const seenBeatIds = new Set();
    const seenDedupeTokens = new Set();
    for (const beat of spec.beats) {
        validateBeat(beat, file, issues, warnings, seenBeatIds, seenDedupeTokens);
    }

    return { issues, warnings };
}

export function validateDirectionSpecFile(path) {
    const raw = readFileSync(resolve(projectRoot, path), "utf8");
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        return { issues: [{ file: path, code: "invalid-json", message: error.message }], warnings: [] };
    }
    return validateDirectionSpec(parsed, path);
}

export function findDirectionSpecFiles() {
    return collectDirectionSpecFiles(scenarioRoot);
}

function printEntry(entry) {
    const { file, code, ...details } = entry;
    const detailText = Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : "";
    return `- ${file}: ${code}${detailText}`;
}

function main() {
    const files = findDirectionSpecFiles();
    let issueCount = 0;
    let warningCount = 0;
    for (const file of files) {
        const { issues, warnings } = validateDirectionSpecFile(file);
        for (const issue of issues) console.error(printEntry(issue));
        for (const warning of warnings) console.warn(`[runtime-capability] ${printEntry(warning)}`);
        issueCount += issues.length;
        warningCount += warnings.length;
    }
    if (issueCount > 0) {
        console.error(
            `DIRECTION-SPEC validation failed: ${issueCount} issue(s) across ${files.length} file(s) (${warningCount} runtime-capability warning(s)).`
        );
        process.exit(1);
    }
    console.log(
        `DIRECTION-SPEC validation passed: ${files.length} file(s) checked (${warningCount} runtime-capability warning(s)).`
    );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    main();
}
