import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
    collectActualCheckpoint,
    collectDifferences,
    scenarioRoot,
    authoredAreaRoot,
    authoredSectorRoot,
    authoredSectorSupportFiles
} from "../scripts/checkScenarioIntegration.mjs";

// Regression coverage for the PR #630 follow-up requirement: scenario-source-sha256 and
// authored-sector-sha256 (added independently by #625's Seamless Sector Runtime work, see
// scripts/checkScenarioIntegration.mjs) must invalidate the stale-check INDEPENDENTLY of each other.
// An AREA-SPEC-only edit must not slip past because only the sector hash is checked, and a Sector
// Runtime-only edit must not slip past because only the scenario hash is checked.

const projectRoot = resolve(process.cwd());

// A harmless, git-tracked scratch file under each fingerprinted root. We append/restore its content
// around each assertion rather than creating new files, so a crash mid-test can't leave a stray file
// behind for collectFiles() to trip over on the next run.
const SCENARIO_SCRATCH_FILE = join(scenarioRoot, "AREA-SPEC-TEMPLATE.json");
const SECTOR_SCRATCH_FILE = "src/game/world/SectorProgressState.js";

function withAppendedContent(relativePath, marker, run) {
    const absolutePath = resolve(projectRoot, relativePath);
    const original = readFileSync(absolutePath, "utf8");
    try {
        writeFileSync(absolutePath, `${original}\n// ${marker}\n`, "utf8");
        return run();
    } finally {
        writeFileSync(absolutePath, original, "utf8");
    }
}

export function run() {
    // The two roots being fingerprinted must be disjoint file sets — otherwise "independent"
    // invalidation would be accidental rather than structural.
    const baseline = collectActualCheckpoint();
    const scenarioFileSet = new Set(baseline.scenarioFiles);
    const sectorFileSet = new Set(baseline.authoredSectorFiles);
    for (const file of scenarioFileSet) {
        assert.ok(!sectorFileSet.has(file), `${file} must not be fingerprinted by both scenario and sector roots`);
    }

    // Both hash fields must still be present on the current main-derived checkpoint shape (regression
    // guard: an AREA-SPEC-only refactor must not accidentally drop the Sector Runtime fingerprint that
    // #625 added, or vice versa).
    assert.ok(/^[0-9a-f]{64}$/.test(baseline["scenario-source-sha256"]));
    assert.ok(/^[0-9a-f]{64}$/.test(baseline["authored-area-sha256"]));
    assert.ok(/^[0-9a-f]{64}$/.test(baseline["authored-sector-sha256"]));
    assert.ok(authoredSectorRoot.length > 0);
    assert.ok(authoredSectorSupportFiles.length > 0);
    assert.ok(authoredAreaRoot.length > 0);

    // collectDifferences must independently surface each of the three sha256 fields.
    {
        const expected = { ...baseline };
        const actual = {
            ...baseline,
            "scenario-source-sha256": "0".repeat(64),
            "authored-sector-sha256": "1".repeat(64)
        };
        const differences = collectDifferences(expected, actual);
        assert.ok(differences.some((difference) => difference.startsWith("scenario-source-sha256:")));
        assert.ok(differences.some((difference) => difference.startsWith("authored-sector-sha256:")));
        assert.ok(!differences.some((difference) => difference.startsWith("authored-area-sha256:")));
    }

    // AREA-SPEC-only change: editing a file under docs/bsh/scenario/ must change scenario-source-sha256
    // but must NOT change authored-sector-sha256 (or authored-area-sha256).
    withAppendedContent(SCENARIO_SCRATCH_FILE, "regression-scratch: scenario-only edit", () => {
        const mutated = collectActualCheckpoint();
        assert.notEqual(
            mutated["scenario-source-sha256"],
            baseline["scenario-source-sha256"],
            "editing a scenario file (AREA-SPEC.json/README.md) must invalidate scenario-source-sha256"
        );
        assert.equal(
            mutated["authored-sector-sha256"],
            baseline["authored-sector-sha256"],
            "a scenario-only edit must not change authored-sector-sha256"
        );
        assert.equal(
            mutated["authored-area-sha256"],
            baseline["authored-area-sha256"],
            "a scenario-only edit must not change authored-area-sha256"
        );
    });

    // Sector-runtime-only change: editing a file under src/game/world/sectors/ (or its declared support
    // files) must change authored-sector-sha256 but must NOT change scenario-source-sha256.
    withAppendedContent(SECTOR_SCRATCH_FILE, "regression-scratch: sector-runtime-only edit", () => {
        const mutated = collectActualCheckpoint();
        assert.notEqual(
            mutated["authored-sector-sha256"],
            baseline["authored-sector-sha256"],
            "editing Sector Runtime source must invalidate authored-sector-sha256"
        );
        assert.equal(
            mutated["scenario-source-sha256"],
            baseline["scenario-source-sha256"],
            "a sector-runtime-only edit must not change scenario-source-sha256"
        );
    });

    // After both scratch edits are reverted, the checkpoint must be byte-for-byte back to baseline —
    // proves the finally-block restores actually ran and left no residue for other tests/npm run check.
    const restored = collectActualCheckpoint();
    assert.equal(restored["scenario-source-sha256"], baseline["scenario-source-sha256"]);
    assert.equal(restored["authored-sector-sha256"], baseline["authored-sector-sha256"]);
    assert.equal(restored["authored-area-sha256"], baseline["authored-area-sha256"]);
}
