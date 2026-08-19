import assert from "node:assert/strict";
import { validateCrossReferences } from "../scripts/validateStagePackageCrossReferences.mjs";

const DIRECTION_SPEC_FILE = "docs/bsh/scenario/1/1-1/DIRECTION-SPEC.json";

function baseAreaSpec() {
    return {
        schemaVersion: "area-spec-v1",
        stage: { sector: 1, stage: 1, sourceAreaId: "sector-01-01" },
        objectives: [{ id: "terminal-read" }],
        enemies: [{ id: "drone-1" }],
        camera: { zones: [{ id: "intro" }] }
    };
}

function baseBeat(overrides = {}) {
    return {
        beatId: "sector-01-01:S0-example",
        trigger: { type: "area-enter", areaId: "sector-01-01" },
        camera: { mode: "authored-zone", zoneId: "intro" },
        ...overrides
    };
}

function baseDirectionSpec(beats = [baseBeat()]) {
    return {
        schemaVersion: "one-rope-direction-spec-v1",
        stageId: "sector-01-01",
        beats
    };
}

function hasCode(issues, code) {
    return issues.some((issue) => issue.code === code);
}

// A well-formed pair passes with no issues.
{
    const issues = validateCrossReferences(baseAreaSpec(), baseDirectionSpec(), DIRECTION_SPEC_FILE);
    assert.deepEqual(issues, []);
}

// DIRECTION-SPEC.stageId must match AREA-SPEC.stage.sourceAreaId.
{
    const directionSpec = baseDirectionSpec();
    directionSpec.stageId = "sector-02-01";
    const issues = validateCrossReferences(baseAreaSpec(), directionSpec, DIRECTION_SPEC_FILE);
    assert.ok(hasCode(issues, "stage-id-does-not-match-area-spec"));
}

// area-enter trigger.areaId must match AREA-SPEC.stage.sourceAreaId.
{
    const directionSpec = baseDirectionSpec([baseBeat({ trigger: { type: "area-enter", areaId: "sector-01-02" } })]);
    const issues = validateCrossReferences(baseAreaSpec(), directionSpec, DIRECTION_SPEC_FILE);
    assert.ok(hasCode(issues, "trigger-area-id-unknown"));
}

// objective-started trigger.objectiveId must exist in AREA-SPEC.objectives.
{
    const directionSpec = baseDirectionSpec([
        baseBeat({ trigger: { type: "objective-started", objectiveId: "no-such-objective" } })
    ]);
    const issues = validateCrossReferences(baseAreaSpec(), directionSpec, DIRECTION_SPEC_FILE);
    assert.ok(hasCode(issues, "trigger-objective-id-unknown"));
}

// A real objective id passes.
{
    const directionSpec = baseDirectionSpec([
        baseBeat({ trigger: { type: "objective-completed", objectiveId: "terminal-read" } })
    ]);
    const issues = validateCrossReferences(baseAreaSpec(), directionSpec, DIRECTION_SPEC_FILE);
    assert.deepEqual(issues, []);
}

// enemy-defeated trigger.enemyId must exist in AREA-SPEC.enemies.
{
    const directionSpec = baseDirectionSpec([
        baseBeat({ trigger: { type: "enemy-defeated", enemyId: "no-such-enemy" } })
    ]);
    const issues = validateCrossReferences(baseAreaSpec(), directionSpec, DIRECTION_SPEC_FILE);
    assert.ok(hasCode(issues, "trigger-enemy-id-unknown"));
}

// camera.zoneId (authored-zone mode) must exist in AREA-SPEC.camera.zones.
{
    const directionSpec = baseDirectionSpec([baseBeat({ camera: { mode: "authored-zone", zoneId: "no-such-zone" } })]);
    const issues = validateCrossReferences(baseAreaSpec(), directionSpec, DIRECTION_SPEC_FILE);
    assert.ok(hasCode(issues, "camera-zone-id-unknown"));
}

// A zoneId is not checked for non-authored-zone camera modes (nothing to resolve it against).
{
    const directionSpec = baseDirectionSpec([baseBeat({ camera: { mode: "temporary-shot", zoneId: "no-such-zone" } })]);
    const issues = validateCrossReferences(baseAreaSpec(), directionSpec, DIRECTION_SPEC_FILE);
    assert.deepEqual(issues, []);
}

// Malformed inputs are reported, not thrown.
{
    const issues = validateCrossReferences(null, baseDirectionSpec(), DIRECTION_SPEC_FILE);
    assert.ok(hasCode(issues, "cross-reference-inputs-invalid"));
}

console.log("PASS stagePackageCrossReferences");
