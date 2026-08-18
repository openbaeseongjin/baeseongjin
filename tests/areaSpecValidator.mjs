import assert from "node:assert/strict";
import { validateAreaSpec, validateAreaSpecFile, findAreaSpecFiles } from "../scripts/validateAreaSpecs.mjs";

const FIXTURE_PATH = "docs/bsh/scenario/1/1-1/AREA-SPEC.json";
const FIXTURE_FILE = "docs/bsh/scenario/1/1-1/AREA-SPEC.json";

function baseSpec() {
    return {
        schemaVersion: "area-spec-v1",
        stage: {
            sector: 1,
            stage: 1,
            legacyStageAlias: "1-1",
            sourceAreaId: "sector-01-01",
            runtimeModel: "seamless-sector-landmark-v1",
            name: "SERVICE SHAFT",
            subtitle: ""
        },
        bounds: { width: 960, height: 960 },
        entry: { id: "entry", x: -320, y: -32 },
        surfaces: [{ id: "p0", preset: "platform", x: 0, y: 0, width: 256, height: 32 }],
        grappleTargets: [
            { id: "anchor-a", label: "A", x: -96, y: -192 },
            { id: "anchor-c", label: "C", x: -64, y: -704 }
        ],
        enemies: [],
        scannerGroups: [],
        windZones: [],
        objectives: [{ id: "terminal-read", type: "interact", preset: "exit-panel" }],
        route: {
            runtimeLandmarks: ["entry", "anchor-a", "anchor-c", "exit"],
            mandatory: ["entry", "anchor-a", "anchor-c", "exit"],
            optional: [],
            forbiddenBypasses: []
        },
        recovery: [],
        sourceExit: {
            deckX: 128,
            deckTopY: -835,
            deckWidth: 320,
            panelObjectiveId: "terminal-read"
        },
        progression: {
            targetStageAlias: "1-2",
            mode: "objective-gated-connector",
            requiredObjectiveIds: ["terminal-read"]
        },
        camera: { zones: [] },
        story: { planningTriggers: [], runtimePresentations: [] },
        runtimeDependencies: { required: [], newSystems: [] },
        forbidden: [],
        acceptanceTests: []
    };
}

function hasCode(issues, code) {
    return issues.some((issue) => issue.code === code);
}

export function run() {
    // Valid fixture on disk must pass with zero issues.
    const fixtureIssues = validateAreaSpecFile(FIXTURE_FILE);
    assert.deepEqual(
        fixtureIssues,
        [],
        `expected the checked-in fixture to be valid: ${JSON.stringify(fixtureIssues)}`
    );

    // The fixture must be discoverable by directory scan, and the (non-stage) template must not be.
    const discovered = findAreaSpecFiles();
    assert.ok(discovered.includes(FIXTURE_PATH), "directory scan must find the checked-in AREA-SPEC.json fixture");
    assert.ok(
        !discovered.some((path) => path.includes("AREA-SPEC-TEMPLATE")),
        "the top-level template file must never be counted as a real stage AREA-SPEC"
    );

    // A minimal valid spec (constructed independently of the fixture) must also pass.
    assert.deepEqual(validateAreaSpec(baseSpec(), FIXTURE_FILE), []);

    // Invalid JSON / schema version.
    assert.ok(hasCode(validateAreaSpec({ schemaVersion: "area-spec-v2" }, FIXTURE_FILE), "schema-version-invalid"));
    assert.ok(hasCode(validateAreaSpec(null, FIXTURE_FILE), "spec-not-object"));

    // Stage identity: sourceAreaId, legacyStageAlias, folder/stage-number mismatches.
    {
        const spec = baseSpec();
        spec.stage.sourceAreaId = "sector-01-02";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "stage-source-area-id-mismatch"));
    }
    {
        const spec = baseSpec();
        spec.stage.legacyStageAlias = "1-2";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "stage-legacy-alias-mismatch"));
    }
    {
        const spec = baseSpec();
        assert.ok(
            hasCode(validateAreaSpec(spec, "docs/bsh/scenario/2/2-1/AREA-SPEC.json"), "stage-source-area-id-mismatch")
        );
    }
    {
        // stage.areaId (PR #630's original field name) must NOT be treated as the Runtime identity —
        // it isn't even read anymore; sourceAreaId is required in its place. Confirms the schema
        // actually moved, not just gained an alias.
        const spec = baseSpec();
        spec.stage.areaId = "sector-01-01";
        delete spec.stage.sourceAreaId;
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "stage-source-area-id-mismatch"));
    }
    {
        const spec = baseSpec();
        spec.stage.runtimeModel = "some-future-runtime-v9";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "stage-runtime-model-unknown"));
    }

    // Duplicate local id, including across different collections.
    {
        const spec = baseSpec();
        spec.surfaces.push({ id: "p0", preset: "platform", x: 0, y: -32, width: 32, height: 32 });
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "surface-id-duplicate"));
    }
    {
        const spec = baseSpec();
        spec.grappleTargets.push({ id: "p0", label: "X", x: 0, y: -64 });
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "local-id-duplicate-across-collections"));
    }

    // Out-of-bounds geometry (point checks).
    {
        const spec = baseSpec();
        spec.entry = { id: "entry", x: 10000, y: -32 };
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "entry-out-of-bounds"));
    }
    {
        const spec = baseSpec();
        spec.grappleTargets[0].y = 5000;
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "grapple-target-out-of-bounds"));
    }
    {
        const spec = baseSpec();
        spec.bounds.width = -10;
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "bounds-width-invalid"));
    }

    // Surface extent (not just center point) outside bounds must FAIL — a "platform" surface is
    // top-center anchored, so a wide surface can have its center inside the Area while its left/right
    // edges stick out past it. Area width 960 -> half-width 480.
    {
        const spec = baseSpec();
        spec.surfaces[0] = { id: "p0", preset: "platform", x: 470, y: 0, width: 100, height: 32 };
        const issues = validateAreaSpec(spec, FIXTURE_FILE);
        assert.ok(
            hasCode(issues, "surface-out-of-bounds"),
            "center-in-bounds but extent-out-of-bounds surface must still fail"
        );
    }
    {
        // Sanity check the same surface at the same center but small enough to fit must pass.
        const spec = baseSpec();
        spec.surfaces[0] = { id: "p0", preset: "platform", x: 470, y: 0, width: 10, height: 32 };
        assert.ok(!hasCode(validateAreaSpec(spec, FIXTURE_FILE), "surface-out-of-bounds"));
    }
    {
        // sealed-door is bottom-center anchored (groundedSurface) — height must extend upward from y.
        const spec = baseSpec();
        spec.surfaces.push({ id: "ground-shutter", preset: "sealed-door", x: -384, y: 0, width: 128, height: 2000 });
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "surface-out-of-bounds"));
    }

    // Unknown route reference, INCLUDING via runtimeLandmarks (PR #630's original bug: an id only
    // listed in runtimeLandmarks was silently accepted everywhere else because it got added to the
    // referencable set unconditionally before being checked itself).
    {
        const spec = baseSpec();
        spec.route.mandatory.push("no-such-landmark");
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-reference-unknown"));
    }
    {
        const spec = baseSpec();
        spec.route.runtimeLandmarks.push("made-up-anchor");
        const issues = validateAreaSpec(spec, FIXTURE_FILE);
        assert.ok(
            hasCode(issues, "route-runtime-landmark-unknown"),
            "an id that only exists in runtimeLandmarks must not silently validate"
        );
    }
    {
        // The regression in its most literal form: a made-up runtimeLandmarks entry must not make
        // itself a valid mandatory-route reference either.
        const spec = baseSpec();
        spec.route.runtimeLandmarks.push("made-up-anchor");
        spec.route.mandatory.push("made-up-anchor");
        const issues = validateAreaSpec(spec, FIXTURE_FILE);
        assert.ok(hasCode(issues, "route-runtime-landmark-unknown"));
        assert.ok(
            hasCode(issues, "route-reference-unknown"),
            "made-up-anchor must fail as a mandatory-route reference too, not just get waved through"
        );
    }

    // optional route shape: {id, sequence[]}. Unknown sequence reference -> FAIL.
    {
        const spec = baseSpec();
        spec.route.optional = [{ id: "flow-route", sequence: ["entry", "no-such-id", "exit"] }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-reference-unknown"));
    }
    {
        const spec = baseSpec();
        spec.route.optional = [{ id: "flow-route", sequence: [] }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-optional-sequence-empty"));
    }
    {
        const spec = baseSpec();
        spec.route.optional = [
            { id: "flow-route", sequence: ["entry", "exit"] },
            { id: "flow-route", sequence: ["entry", "anchor-a", "exit"] }
        ];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-optional-id-duplicate"));
    }
    {
        const spec = baseSpec();
        spec.route.optional = [{ id: "flow-route", sequence: ["entry", "anchor-a", "exit"] }];
        assert.deepEqual(validateAreaSpec(spec, FIXTURE_FILE), []);
    }

    // forbiddenBypasses shape: {from, to[], reason}. from unknown / to unknown / reason missing -> FAIL.
    {
        const spec = baseSpec();
        spec.route.forbiddenBypasses = [{ from: "no-such-id", to: ["exit"], reason: "must not skip" }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-reference-unknown"));
    }
    {
        const spec = baseSpec();
        spec.route.forbiddenBypasses = [{ from: "entry", to: ["no-such-id"], reason: "must not skip" }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-reference-unknown"));
    }
    {
        const spec = baseSpec();
        spec.route.forbiddenBypasses = [{ from: "entry", to: ["exit"], reason: "" }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-forbidden-bypass-reason-missing"));
    }
    {
        const spec = baseSpec();
        spec.route.forbiddenBypasses = [{ from: "entry", to: [], reason: "must not skip" }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-forbidden-bypass-to-empty"));
    }
    {
        const spec = baseSpec();
        spec.route.forbiddenBypasses = [{ from: "entry", to: ["anchor-a"], reason: "must commit to Anchor A first" }];
        assert.deepEqual(validateAreaSpec(spec, FIXTURE_FILE), []);
    }

    // Duplicate scanner controlled target (same surface controlled by two groups).
    {
        const spec = baseSpec();
        spec.grappleTargets.push({ id: "c1", label: "C1", x: 0, y: -400 });
        spec.scannerGroups = [
            { id: "scanner-a", profile: "sector03-default", controlledTargets: ["c1"] },
            { id: "scanner-b", profile: "sector03-default", controlledTargets: ["c1"] }
        ];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "scanner-group-controlled-target-duplicate"));
    }
    {
        const spec = baseSpec();
        spec.scannerGroups = [{ id: "scanner-a", profile: "sector03-default", controlledTargets: ["missing-target"] }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "scanner-group-controlled-target-unknown"));
    }

    // Unknown implemented preset/system is rejected unless declared NOT_IMPLEMENTED.
    {
        const spec = baseSpec();
        spec.surfaces[0].preset = "breakable-grapple-anchor";
        const issues = validateAreaSpec(spec, FIXTURE_FILE);
        assert.ok(hasCode(issues, "surface-preset-unknown"));
    }
    {
        const spec = baseSpec();
        spec.surfaces[0].preset = "breakable-grapple-anchor";
        spec.runtimeDependencies.newSystems.push({ id: "breakable-grapple-anchor", status: "NOT_IMPLEMENTED" });
        assert.deepEqual(validateAreaSpec(spec, FIXTURE_FILE), []);
    }
    {
        const spec = baseSpec();
        spec.surfaces[0].preset = "breakable-grapple-anchor";
        spec.runtimeDependencies.newSystems.push({ id: "breakable-grapple-anchor", status: "IMPLEMENTED" });
        assert.ok(
            hasCode(validateAreaSpec(spec, FIXTURE_FILE), "runtime-dependency-status-unknown"),
            "a newSystems declaration must use an explicit NOT_IMPLEMENTED status, not silently claim readiness"
        );
    }

    // runtimeDependencies.required: id must resolve to a KNOWN preset/profile/runtimeModel/mode.
    {
        const spec = baseSpec();
        spec.runtimeDependencies.required = [{ id: "patrol-drone-t1" }];
        assert.deepEqual(validateAreaSpec(spec, FIXTURE_FILE), [], "a real known dependency must validate cleanly");
    }
    {
        const spec = baseSpec();
        spec.runtimeDependencies.required = [{ id: "some-nonexistent-runtime-system" }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "runtime-dependency-required-unknown"));
    }
    {
        const spec = baseSpec();
        spec.runtimeDependencies.required = [{ id: "patrol-drone-t1" }, { id: "patrol-drone-t1" }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "runtime-dependency-required-id-duplicate"));
    }

    // Objective requirement referencing itself or an unknown id.
    {
        const spec = baseSpec();
        spec.objectives[0].requiredObjectiveIds = ["terminal-read"];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "objective-requirement-self"));
    }
    {
        const spec = baseSpec();
        spec.objectives[0].requiredObjectiveIds = ["missing-objective"];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "objective-requirement-missing"));
    }

    // sourceExit must reference a real objective (no nextAreaId anymore — that lives in progression).
    {
        const spec = baseSpec();
        spec.sourceExit.panelObjectiveId = "missing";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "source-exit-panel-objective-unknown"));
    }
    {
        const spec = baseSpec();
        delete spec.sourceExit;
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "source-exit-missing"));
    }

    // progression: targetStageAlias format, mode registry, requiredObjectiveIds references.
    {
        const spec = baseSpec();
        spec.progression.targetStageAlias = "not-a-valid-alias";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "progression-target-stage-alias-format"));
    }
    {
        const spec = baseSpec();
        spec.progression.targetStageAlias = null;
        assert.deepEqual(
            validateAreaSpec(spec, FIXTURE_FILE),
            [],
            "null targetStageAlias must be valid for a genuine content boundary"
        );
    }
    {
        const spec = baseSpec();
        spec.progression.mode = "some-future-mode";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "progression-mode-unknown"));
    }
    {
        const spec = baseSpec();
        spec.progression.requiredObjectiveIds = ["missing-objective"];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "progression-required-objective-unknown"));
    }
    {
        const spec = baseSpec();
        delete spec.progression;
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "progression-missing"));
    }

    // Recovery references must exist.
    {
        const spec = baseSpec();
        spec.recovery = [{ id: "recover-x", failureZone: "no-such-surface", recoverTo: { x: 0, y: -32 } }];
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "recovery-failure-zone-unknown"));
    }

    // Acceptance test entries must have a known type and non-empty requirement.
    {
        const spec = baseSpec();
        spec.acceptanceTests = [{ id: "bad", type: "not-a-type", requirement: "" }];
        const issues = validateAreaSpec(spec, FIXTURE_FILE);
        assert.ok(hasCode(issues, "acceptance-test-type-invalid"));
        assert.ok(hasCode(issues, "acceptance-test-requirement-missing"));
    }

    // Invalid JSON on disk must be reported, not thrown.
    assert.ok(hasCode(validateAreaSpecFile("tests/fixtures/invalidAreaSpec.json"), "invalid-json"));
}
