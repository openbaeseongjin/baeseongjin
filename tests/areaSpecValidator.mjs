import assert from "node:assert/strict";
import { validateAreaSpec, validateAreaSpecFile, findAreaSpecFiles } from "../scripts/validateAreaSpecs.mjs";

const FIXTURE_PATH = "docs/bsh/scenario/1/1-1/AREA-SPEC.json";
const FIXTURE_FILE = "docs/bsh/scenario/1/1-1/AREA-SPEC.json";

function baseSpec() {
    return {
        schemaVersion: "area-spec-v1",
        stage: { sector: 1, stage: 1, areaId: "sector-01-01", name: "SERVICE SHAFT", subtitle: "" },
        bounds: { width: 960, height: 960 },
        entry: { id: "entry", x: -320, y: -32 },
        surfaces: [{ id: "p0", preset: "platform", x: -288, y: 0, width: 256 }],
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
        exitBlock: {
            deckX: 128,
            deckTopY: -835,
            deckWidth: 320,
            nextAreaId: "sector-01-02",
            panelObjectiveId: "terminal-read"
        },
        camera: { zones: [] },
        story: { planningTriggers: [], runtimePresentations: [] },
        runtimeDependencies: { newSystems: [] },
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

    // Folder / stage id mismatch.
    {
        const spec = baseSpec();
        spec.stage.areaId = "sector-01-02";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "stage-area-id-mismatch"));
    }
    {
        const spec = baseSpec();
        assert.ok(hasCode(validateAreaSpec(spec, "docs/bsh/scenario/2/2-1/AREA-SPEC.json"), "stage-area-id-mismatch"));
    }

    // Duplicate local id, including across different collections.
    {
        const spec = baseSpec();
        spec.surfaces.push({ id: "p0", preset: "platform", x: 0, y: -32, width: 32 });
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "surface-id-duplicate"));
    }
    {
        const spec = baseSpec();
        spec.grappleTargets.push({ id: "p0", label: "X", x: 0, y: -64 });
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "local-id-duplicate-across-collections"));
    }

    // Out-of-bounds geometry.
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

    // Unknown route reference.
    {
        const spec = baseSpec();
        spec.route.mandatory.push("no-such-landmark");
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "route-reference-unknown"));
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

    // exitBlock must reference a real objective and a well-formed nextAreaId.
    {
        const spec = baseSpec();
        spec.exitBlock.panelObjectiveId = "missing";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "exit-block-panel-objective-unknown"));
    }
    {
        const spec = baseSpec();
        spec.exitBlock.nextAreaId = "not-a-valid-id";
        assert.ok(hasCode(validateAreaSpec(spec, FIXTURE_FILE), "exit-block-next-area-id-format"));
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
