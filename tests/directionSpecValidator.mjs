import assert from "node:assert/strict";
import { validateDirectionSpec, validateDirectionSpecFile } from "../scripts/validateDirectionSpecs.mjs";

const FIXTURE_FILE = "docs/bsh/scenario/1/1-1/DIRECTION-SPEC.json";

function baseBeat(overrides = {}) {
    return {
        beatId: "sector-01-01:S0-example",
        status: "HYPOTHESIS",
        purpose: "Describe exact player-facing purpose.",
        trigger: { type: "area-enter", areaId: "sector-01-01" },
        scope: "local-player",
        replayPolicy: "once-per-run",
        dedupeToken: "sector-01-01:S0-example",
        worldPause: false,
        playerControl: { movement: true, aim: true, rope: true, action: true, interaction: true },
        camera: { mode: "authored-zone", zoneId: "intro" },
        tracks: { systemText: [], dialogue: [], character: [], object: [], camera: [], audio: [], vfx: [], lighting: [], gameplayEvent: [] },
        completion: { type: "tracks-finished" },
        validation: { automated: ["cue plays once"], visual: ["player and story object visible together"] },
        ...overrides
    };
}

function baseSpec(beats = [baseBeat()]) {
    return {
        schemaVersion: "one-rope-direction-spec-v1",
        stageId: "sector-01-01",
        revision: "REV-1",
        sourceCommit: "ddaeaba6aec183e49b974de88bafed87493080b2",
        presentationSignature: "TEST",
        beats
    };
}

function hasCode(issues, code) {
    return issues.some((issue) => issue.code === code);
}

// A well-formed spec passes with no issues.
{
    const { issues } = validateDirectionSpec(baseSpec(), FIXTURE_FILE);
    assert.deepEqual(issues, []);
}

// Wrong schemaVersion is a hard failure.
{
    const spec = baseSpec();
    spec.schemaVersion = "one-rope-direction-spec-v0";
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "schema-version-invalid"));
}

// stageId must match the folder path (sector/stage derived from the file path).
{
    const spec = baseSpec();
    spec.stageId = "sector-02-01";
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "stage-id-mismatch"));
}

// Missing beatId fails.
{
    const spec = baseSpec([baseBeat({ beatId: undefined })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-id-missing"));
}

// Duplicate beatId fails.
{
    const spec = baseSpec([baseBeat(), baseBeat()]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-id-duplicate"));
}

// Duplicate dedupeToken (even across distinct beatIds) fails.
{
    const spec = baseSpec([baseBeat(), baseBeat({ beatId: "sector-01-01:S1-example" })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-dedupe-token-duplicate"));
}

// Invalid status fails.
{
    const spec = baseSpec([baseBeat({ status: "PROBABLY" })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-status-invalid"));
}

// Invalid trigger type fails (not just an unusual string).
{
    const spec = baseSpec([baseBeat({ trigger: { type: "cutscene-start" } })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-trigger-type-unknown"));
}

// A trigger type that IS in the schema enum but has no Runtime backing yet is schema-valid,
// but produces a runtime-capability warning when the beat claims a status other than
// NOT IMPLEMENTED / HOLD — schema validity and runtime capability must stay separate signals.
{
    const spec = baseSpec([baseBeat({ trigger: { type: "enemy-activated" }, status: "DESIGN LOCKED" })]);
    const { issues, warnings } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.equal(issues.length, 0);
    assert.ok(warnings.some((warning) => warning.code === "beat-trigger-runtime-not-implemented"));
}

// The same NOT IMPLEMENTED trigger produces no warning when the beat honestly declares itself
// NOT IMPLEMENTED.
{
    const spec = baseSpec([baseBeat({ trigger: { type: "enemy-activated" }, status: "NOT IMPLEMENTED" })]);
    const { warnings } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.equal(warnings.some((warning) => warning.code === "beat-trigger-runtime-not-implemented"), false);
}

// Invalid scope fails.
{
    const spec = baseSpec([baseBeat({ scope: "planet" })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-scope-invalid"));
}

// Invalid replayPolicy fails.
{
    const spec = baseSpec([baseBeat({ replayPolicy: "sometimes" })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-replay-policy-invalid"));
}

// Unknown track key fails.
{
    const spec = baseSpec([baseBeat({ tracks: { ...baseBeat().tracks, cutscene: [] } })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-track-key-unknown"));
}

// A non-empty track with only HOLD-status runtime backing produces a warning, not a failure.
{
    const spec = baseSpec([baseBeat({ tracks: { ...baseBeat().tracks, lighting: [{ at: 0 }] } })]);
    const { issues, warnings } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.equal(issues.length, 0);
    assert.ok(warnings.some((warning) => warning.code === "beat-track-runtime-unverified" && warning.key === "lighting"));
}

// Unknown camera mode fails.
{
    const spec = baseSpec([baseBeat({ camera: { mode: "drone-shot" } })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-camera-mode-unknown"));
}

// playerControl missing a required key fails.
{
    const spec = baseSpec([baseBeat({ playerControl: { movement: true, aim: true, rope: true, action: true } })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-player-control-field-invalid"));
}

// playerControl with an unknown key fails.
{
    const spec = baseSpec([baseBeat({ playerControl: { ...baseBeat().playerControl, jump: true } })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-player-control-key-unknown"));
}

// Missing dedupeToken fails.
{
    const spec = baseSpec([baseBeat({ dedupeToken: undefined })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-dedupe-token-missing"));
}

// worldPause must be boolean.
{
    const spec = baseSpec([baseBeat({ worldPause: "false" })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-world-pause-invalid"));
}

// Missing completion/validation blocks fail.
{
    const spec = baseSpec([baseBeat({ completion: undefined, validation: undefined })]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beat-completion-missing"));
    assert.ok(hasCode(issues, "beat-validation-missing"));
}

// Empty beats array fails.
{
    const spec = baseSpec([]);
    const { issues } = validateDirectionSpec(spec, FIXTURE_FILE);
    assert.ok(hasCode(issues, "beats-empty"));
}

// Invalid JSON on disk must be reported, not thrown. Reuses the shared malformed-JSON fixture —
// the validator only cares that the bytes on disk fail JSON.parse, not which schema they target.
{
    const { issues } = validateDirectionSpecFile("tests/fixtures/invalidAreaSpec.json");
    assert.ok(hasCode(issues, "invalid-json"));
}

console.log("PASS directionSpecValidator");
